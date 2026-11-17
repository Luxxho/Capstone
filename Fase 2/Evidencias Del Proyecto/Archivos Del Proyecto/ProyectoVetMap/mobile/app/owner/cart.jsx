import { useEffect, useMemo, useState } from "react";
import {
  AppState,
  Linking,
  Platform,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import {
  Button,
  Card,
  Empty,
  ErrorBox,
  Loading,
  Row,
  Screen,
  SectionTitle,
  SuccessBox,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { ActionCelebration } from "../../components/AnimatedEmoji";
import {
  createMercadoPagoOrder,
  createStorefrontOrdersBatch,
  syncMercadoPagoOrder,
} from "../../services/api";
import { formatMoney } from "../../utils/format";

const CART_KEY = "vetmap_mobile_cart";
const PENDING_PAYMENT_KEY = "vetmap_pending_mercadopago";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Cart() {
  const { token } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [purchaseCelebration, setPurchaseCelebration] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);

  async function load() {
    setLoading(true);

    try {
      const [saved, pending] = await Promise.all([
        AsyncStorage.getItem(CART_KEY),
        AsyncStorage.getItem(PENDING_PAYMENT_KEY),
      ]);

      setCart(saved ? JSON.parse(saved) : []);
      setPendingPayment(
        pending ? JSON.parse(pending) : null
      );
      setError("");
    } catch {
      setError(
        "No se pudo cargar el carrito."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      return undefined;
    }

    const subscription = AppState.addEventListener(
      "change",
      (state) => {
        if (
          state === "active" &&
          pendingPayment?.order_id &&
          !busy
        ) {
          verifyPendingPayment();
        }
      }
    );

    return () => subscription.remove();
  }, [pendingPayment?.order_id, busy, token]);

  async function persist(next) {
    setCart(next);

    await AsyncStorage.setItem(
      CART_KEY,
      JSON.stringify(next)
    );
  }

  async function changeQuantity(
    productId,
    delta
  ) {
    const next = cart
      .map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const nextQuantity =
          Number(item.quantity || 0) + delta;

        if (
          delta > 0 &&
          nextQuantity > Number(item.stock || 0)
        ) {
          setError(
            `Stock máximo disponible para ${item.name}: ${item.stock}.`
          );
          return item;
        }

        return {
          ...item,
          quantity: nextQuantity,
        };
      })
      .filter(
        (item) => Number(item.quantity) > 0
      );

    await persist(next);
  }

  async function remove(productId) {
    await persist(
      cart.filter(
        (item) => item.id !== productId
      )
    );
  }

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const itemCount = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  function groups() {
    return Object.values(
      cart.reduce((acc, item) => {
        acc[item.store_id] ??= {
          store_id: item.store_id,
          items: [],
          delivery_method: "pickup",
          delivery_address: null,
          notes: "Compra simulada desde VetMap",
        };

        acc[item.store_id].items.push({
          product_id: item.id,
          quantity: item.quantity,
        });

        return acc;
      }, {})
    );
  }

  async function simulatedCheckout() {
    if (!cart.length || busy) return;

    setBusy(true);
    setError("");
    setOk("");

    try {
      const orders =
        await createStorefrontOrdersBatch(
          token,
          groups()
        );

      await persist([]);

      setOk(
        `${orders.length} pedido(s) registrado(s). Puedes revisar su seguimiento en Mis pedidos.`
      );

      setPurchaseCelebration(true);
      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1500)
      );
      setPurchaseCelebration(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function finishMercadoPago(
    orderId,
    checkoutWindow = null,
    waitForApproval = true
  ) {
    const maxAttempts = waitForApproval ? 180 : 1;
    let lastError = null;

    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt += 1
    ) {
      try {
        const result =
          await syncMercadoPagoOrder(
            token,
            orderId
          );

        if (result.finalized) {
          if (
            checkoutWindow &&
            !checkoutWindow.closed
          ) {
            checkoutWindow.close();
          }

          await persist([]);
          await AsyncStorage.removeItem(
            PENDING_PAYMENT_KEY
          );

          setPendingPayment(null);
          setError("");
          setOk(
            "Pago aprobado. Tu compra fue registrada correctamente."
          );

          setPurchaseCelebration(true);
          await new Promise(
            (resolve) =>
              setTimeout(resolve, 1700)
          );
          setPurchaseCelebration(false);

          router.replace("/owner/orders");
          return true;
        }

        if (
          [
            "failed",
            "cancelled",
            "canceled",
            "expired",
            "rejected",
          ].includes(
            String(result.status || "")
              .toLowerCase()
          )
        ) {
          if (
            checkoutWindow &&
            !checkoutWindow.closed
          ) {
            checkoutWindow.close();
          }

          await AsyncStorage.removeItem(
            PENDING_PAYMENT_KEY
          );
          setPendingPayment(null);

          throw new Error(
            "Mercado Pago informó que el pago no fue aprobado."
          );
        }
      } catch (e) {
        lastError = e;

        // Al verificar manualmente sí mostramos el error.
        // Durante la espera automática toleramos errores
        // transitorios de red y volvemos a intentar.
        if (!waitForApproval) {
          throw e;
        }
      }

      if (attempt < maxAttempts - 1) {
        await sleep(3000);
      }
    }

    if (lastError) {
      setError(
        "El pago sigue pendiente de confirmación. Puedes volver a verificarlo desde este carrito."
      );
    } else {
      setOk(
        "El pago todavía está pendiente de confirmación."
      );
    }

    return false;
  }

  async function verifyPendingPayment() {
    if (!pendingPayment?.order_id || busy) {
      return;
    }

    setBusy(true);
    setError("");
    setOk("");

    try {
      const finalized =
        await finishMercadoPago(
          pendingPayment.order_id,
          null,
          false
        );

      if (!finalized) {
        setOk(
          "Mercado Pago todavía no confirma el pago."
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function friendlyMercadoPagoError(message) {
    const raw = String(
      message ||
        "No se pudo iniciar Mercado Pago."
    );

    const lower = raw.toLowerCase();

    if (
      lower.includes("mercadopago_access_token") ||
      lower.includes("falta mercadopago")
    ) {
      return (
        "Mercado Pago no está configurado en el backend. " +
        "Revisa MERCADOPAGO_ACCESS_TOKEN en backend/.env."
      );
    }

    if (
      lower.includes("unauthorized") ||
      lower.includes("invalid access token") ||
      lower.includes("http 401")
    ) {
      return (
        "Mercado Pago rechazó las credenciales. " +
        "Revisa que el Access Token corresponda a la aplicación correcta."
      );
    }

    if (
      lower.includes("payer") &&
      (
        lower.includes("collector") ||
        lower.includes("same")
      )
    ) {
      return (
        "La cuenta compradora de prueba no puede ser la misma cuenta vendedora. " +
        "Usa un usuario comprador de prueba distinto."
      );
    }

    if (
      lower.includes("stock insuficiente")
    ) {
      return raw;
    }

    return raw;
  }

  async function mercadoPagoCheckout() {
    if (!cart.length || busy) return;

    let checkoutWindow = null;
    let checkoutNavigated = false;

    // En web se abre una ventana vacía inmediatamente desde el clic.
    // Esto evita que el navegador bloquee Mercado Pago después del await.
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined"
    ) {
      checkoutWindow = window.open(
        "",
        "vetmap-mercadopago",
        "width=520,height=760,resizable=yes,scrollbars=yes"
      );

      if (checkoutWindow) {
        checkoutWindow.document.title = "Mercado Pago · VetMap";
        checkoutWindow.document.body.innerHTML =
          '<p style="font-family:Arial;padding:24px;color:#162850">Preparando Mercado Pago...</p>';
      }
    }

    setBusy(true);
    setError("");
    setOk("");

    try {
      const result =
        await createMercadoPagoOrder(
          token,
          groups()
        );

      if (
        !result.checkout_url ||
        !result.order_id
      ) {
        throw new Error(
          "Mercado Pago no devolvió los datos necesarios para continuar."
        );
      }

      const pending = {
        order_id: result.order_id,
        started_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        PENDING_PAYMENT_KEY,
        JSON.stringify(pending)
      );
      setPendingPayment(pending);

      setOk(
        "Mercado Pago está abierto. VetMap verificará el pago automáticamente."
      );

      if (
        Platform.OS === "web" &&
        typeof window !== "undefined"
      ) {
        if (
          checkoutWindow &&
          !checkoutWindow.closed
        ) {
          checkoutWindow.location.href =
            result.checkout_url;
          checkoutNavigated = true;
        } else {
          await Linking.openURL(
            result.checkout_url
          );
        }

        const finalized =
          await finishMercadoPago(
            result.order_id,
            checkoutWindow,
            true
          );

        if (
          !finalized &&
          checkoutWindow &&
          !checkoutWindow.closed
        ) {
          checkoutWindow.focus();
        }
      } else {
        await Linking.openURL(
          result.checkout_url
        );

        setOk(
          "Completa el pago y vuelve a VetMap. Al regresar, la app comprobará el pago automáticamente; también puedes usar Verificar pago."
        );
      }
    } catch (e) {
      if (
        checkoutWindow &&
        !checkoutWindow.closed &&
        !checkoutNavigated
      ) {
        checkoutWindow.close();
      }

      setError(
        friendlyMercadoPagoError(
          e.message
        )
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Mi carrito"
      subtitle="Revisa productos, cantidades y total antes de comprar."
      back
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      {pendingPayment ? (
        <Card>
          <Text
            style={{
              color: "#162850",
              fontWeight: "900",
              fontSize: 16,
            }}
          >
            Pago de Mercado Pago pendiente
          </Text>

          <Text
            style={{
              color: "#72847F",
              marginTop: 6,
              marginBottom: 10,
              lineHeight: 19,
            }}
          >
            Si ya terminaste el pago, VetMap puede
            comprobarlo y registrar tu pedido.
          </Text>

          <Button
            label={
              busy
                ? "Verificando..."
                : "Verificar pago"
            }
            variant="secondary"
            onPress={verifyPendingPayment}
            disabled={busy}
          />
        </Card>
      ) : null}

      {loading ? (
        <Loading />
      ) : cart.length === 0 ? (
        <>
          <Empty
            icon="🛒"
            title="Tu carrito está vacío"
            text="Agrega productos desde Tienda."
          />

          <Button
            label="Ir a Tienda"
            onPress={() =>
              router.replace("/owner/market")
            }
          />

          {ok ? (
            <Button
              label="Ver mis pedidos"
              variant="secondary"
              onPress={() =>
                router.push("/owner/orders")
              }
            />
          ) : null}
        </>
      ) : (
        <>
          <Card>
            <Row
              label="Productos"
              value={itemCount}
            />
            <Row
              label="Total"
              value={formatMoney(total)}
            />
          </Card>

          <SectionTitle>
            Productos agregados
          </SectionTitle>

          {cart.map((item) => (
            <Card key={item.id}>
              <Text
                style={{
                  color: "#162850",
                  fontWeight: "900",
                  fontSize: 17,
                }}
              >
                {item.name}
              </Text>

              <Row
                label="Tienda"
                value={
                  item.store_name || "Tienda"
                }
              />
              <Row
                label="Precio unitario"
                value={formatMoney(item.price)}
              />
              <Row
                label="Cantidad"
                value={item.quantity}
              />
              <Row
                label="Subtotal"
                value={formatMoney(
                  Number(item.price) *
                    Number(item.quantity)
                )}
              />

              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  label="−"
                  compact
                  variant="ghost"
                  onPress={() =>
                    changeQuantity(item.id, -1)
                  }
                />

                <Button
                  label="+"
                  compact
                  variant="ghost"
                  onPress={() =>
                    changeQuantity(item.id, 1)
                  }
                  disabled={
                    Number(item.quantity) >=
                    Number(item.stock || 0)
                  }
                />

                <Button
                  label="Quitar"
                  compact
                  variant="danger"
                  onPress={() =>
                    remove(item.id)
                  }
                />
              </View>
            </Card>
          ))}

          <Card>
            <Row
              label="Total compra"
              value={formatMoney(total)}
            />

            <Button
              label={
                busy
                  ? "Procesando..."
                  : "Pagar con Mercado Pago"
              }
              onPress={mercadoPagoCheckout}
              disabled={busy}
            />

            <Button
              label={
                busy
                  ? "Procesando..."
                  : "Confirmar compra simulada"
              }
              variant="secondary"
              onPress={simulatedCheckout}
              disabled={busy}
            />

            <Button
              label="Vaciar carrito"
              variant="danger"
              onPress={() => persist([])}
              disabled={busy}
            />
          </Card>
        </>
      )}

      <Button
        label="Ver mis pedidos"
        variant="ghost"
        onPress={() =>
          router.push("/owner/orders")
        }
      />

      <ActionCelebration
        visible={purchaseCelebration}
        type="purchase"
        title="¡Compra realizada!"
        text="Tu pedido quedó registrado correctamente en VetMap."
      />
    </Screen>
  );
}
