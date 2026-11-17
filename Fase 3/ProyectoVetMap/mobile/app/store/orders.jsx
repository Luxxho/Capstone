import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Badge,
  Button,
  Card,
  confirm,
  Empty,
  ErrorBox,
  Input,
  Loading,
  Row,
  Screen,
  SectionTitle,
  SuccessBox,
} from "../../components/ui";
import SelectField from "../../components/SelectField";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { useAuth } from "../../context/AuthContext";
import {
  archiveStoreFinalOrders,
  archiveStoreOrder,
  getStoreOrders,
  updateStoreOrderStatus,
} from "../../services/api";
import {
  formatDateTime,
  formatMoney,
  statusLabel,
} from "../../utils/format";

const STATES = [
  "pending",
  "preparing",
  "ready",
  "dispatched",
  "delivered",
  "cancelled",
].map((value) => ({
  value,
  label: statusLabel(value),
}));

export default function StoreOrders() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function load(showLoading = true) {
    if (showLoading) setLoading(true);

    try {
      setItems(await getStoreOrders(token));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(
      () => load(false),
      60_000
    );

    return () => clearInterval(interval);
  }, [token]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();

    return items.filter((order) => {
      const final = ["delivered", "cancelled"].includes(order.status);
      const filterOk =
        filter === "all" ||
        (filter === "active" && !final) ||
        (filter === "final" && final);

      const searchOk =
        !text ||
        [
          order.user_name,
          order.user_email,
          order.id,
          ...(order.items || []).map((item) => item.product_name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(text);

      return filterOk && searchOk;
    });
  }, [items, query, filter]);

  async function changeStatus(id, status) {
    try {
      await updateStoreOrderStatus(token, id, status);
      setOk(`Pedido actualizado a ${statusLabel(status)}.`);
      await load(false);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Screen
      title="Pedidos de tienda"
      subtitle="Prepara, despacha y revisa el historial de compras"
      back
      backTo="/store"
      onRefresh={() => load()}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <Input
        label="Buscar pedido"
        value={query}
        onChangeText={setQuery}
        placeholder="Cliente, producto o número de pedido..."
      />

      <SelectField
        label="Mostrar"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "active", label: "Pedidos activos" },
          { value: "final", label: "Entregados / cancelados" },
          { value: "all", label: "Todos" },
        ]}
      />

      <View style={styles.summaryRow}>
        <Summary value={items.filter((x) => !["delivered", "cancelled"].includes(x.status)).length} label="Activos" />
        <Summary value={items.filter((x) => x.status === "pending").length} label="Pendientes" />
        <Summary value={items.filter((x) => x.status === "delivered").length} label="Entregados" />
      </View>

      <Button
        label="🧹 Limpiar finalizados"
        variant="ghost"
        onPress={() =>
          confirm(
            "Limpiar historial",
            "Se quitarán de la vista los pedidos entregados y cancelados.",
            async () => {
              try {
                await archiveStoreFinalOrders(token);
                setOk("Historial de pedidos finalizados limpiado.");
                await load(false);
              } catch (e) {
                setError(e.message);
              }
            }
          )
        }
      />

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty icon="📦" title="Sin pedidos para mostrar" />
      ) : (
        filtered.map((order) => {
          const final = ["delivered", "cancelled"].includes(order.status);

          return (
            <Card key={order.id}>
              <View style={styles.orderHead}>
                <AnimatedEmoji
                  emoji={order.status === "delivered" ? "✅" : order.status === "cancelled" ? "❌" : "📦"}
                  size={30}
                  motion={final ? "pulse" : "float"}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderTitle}>Pedido #{order.id}</Text>
                  <Text style={styles.client}>{order.user_name}</Text>
                </View>
                <Badge status={order.status} />
              </View>

              <Row label="Cliente" value={order.user_name} />
              {order.user_email ? <Row label="Correo" value={order.user_email} /> : null}
              <Row label="Total" value={formatMoney(order.total)} />
              <Row label="Fecha" value={formatDateTime(order.created_at)} />
              {order.delivery_method ? <Row label="Entrega" value={order.delivery_method === "pickup" ? "Retiro" : order.delivery_method} /> : null}
              {order.delivery_address ? <Row label="Dirección" value={order.delivery_address} /> : null}
              {order.notes ? <Row label="Notas" value={order.notes} /> : null}

              <SectionTitle>Productos</SectionTitle>
              {(order.items || []).map((item) => (
                <View key={item.id || item.product_id} style={styles.productRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.product_name}</Text>
                    <Text style={styles.productMeta}>
                      {[item.brand, item.format].filter(Boolean).join(" · ") || "Producto VetMap"}
                    </Text>
                    <Text style={styles.productMeta}>Cantidad: {item.quantity}</Text>
                  </View>
                  <Text style={styles.productPrice}>{formatMoney(item.subtotal)}</Text>
                </View>
              ))}

              {!final ? (
                <SelectField
                  label="Estado del pedido"
                  options={STATES}
                  value={order.status}
                  onChange={(next) => changeStatus(order.id, next)}
                />
              ) : (
                <View style={styles.finalBox}>
                  <Text style={styles.finalText}>🔒 Estado final · no editable</Text>
                </View>
              )}

              {final ? (
                <Button
                  label="Quitar del historial"
                  compact
                  variant="ghost"
                  onPress={async () => {
                    try {
                      await archiveStoreOrder(token, order.id);
                      await load(false);
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                />
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

function Summary({ value, label }) {
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: "row", gap: 8 },
  summary: { flex: 1, backgroundColor: "#E9F7F2", borderRadius: 14, padding: 10, alignItems: "center" },
  summaryValue: { color: "#162850", fontSize: 20, fontWeight: "900" },
  summaryLabel: { color: "#526A63", fontSize: 10, fontWeight: "800", marginTop: 2 },
  orderHead: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 8 },
  orderTitle: { color: "#162850", fontWeight: "900", fontSize: 17 },
  client: { color: "#6AA896", fontWeight: "800", fontSize: 11, marginTop: 2 },
  productRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#E9F7F2" },
  productName: { color: "#162850", fontWeight: "900", fontSize: 13 },
  productMeta: { color: "#526A63", fontSize: 10, marginTop: 2 },
  productPrice: { color: "#102033", fontWeight: "900", fontSize: 12 },
  finalBox: { backgroundColor: "#F4F7F6", borderRadius: 12, padding: 9, marginTop: 8 },
  finalText: { color: "#526A63", fontSize: 11, fontWeight: "800", textAlign: "center" },
});
