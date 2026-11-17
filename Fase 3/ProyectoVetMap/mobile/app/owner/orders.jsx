import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Badge,
  Button,
  Card,
  COLORS,
  Empty,
  ErrorBox,
  Loading,
  Row,
  Screen,
  SectionTitle,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { downloadOrderReceipt } from "../../services/downloads";
import {
  archiveMyDeliveredOrders,
  archiveMyStoreOrder,
  getMyStoreOrders,
} from "../../services/api";
import {
  formatDateTime,
  formatMoney,
  statusLabel,
} from "../../utils/format";

const ORDER_FLOW = [
  {
    key: "pending",
    label: "Pendiente",
    icon: "🧾",
  },
  {
    key: "preparing",
    label: "En preparación",
    icon: "📦",
  },
  {
    key: "ready",
    label: "Listo",
    icon: "✅",
  },
  {
    key: "dispatched",
    label: "Despachado",
    icon: "🚚",
  },
  {
    key: "delivered",
    label: "Entregado",
    icon: "🏠",
  },
];

const FLOW_INDEX = Object.fromEntries(
  ORDER_FLOW.map((item, index) => [
    item.key,
    index,
  ])
);

function nextAutomaticUpdate(order, now) {
  if (
    ["delivered", "cancelled"].includes(
      order.status
    )
  ) {
    return null;
  }

  const created = new Date(
    order.created_at
  ).getTime();

  if (!Number.isFinite(created)) {
    return null;
  }

  const elapsed = Math.max(
    0,
    now - created
  );

  const currentHour = Math.floor(
    elapsed / 3_600_000
  );

  const nextAt =
    created +
    (currentHour + 1) * 3_600_000;

  const minutes = Math.max(
    1,
    Math.ceil(
      (nextAt - now) / 60_000
    )
  );

  return `Próxima actualización automática en aprox. ${minutes} min.`;
}

function TrackingTimeline({ order }) {
  if (order.status === "cancelled") {
    return (
      <View style={styles.cancelledBox}>
        <Text style={styles.cancelledTitle}>
          Pedido cancelado
        </Text>
        <Text style={styles.cancelledText}>
          Este pedido no continuará avanzando.
        </Text>
      </View>
    );
  }

  const currentIndex =
    FLOW_INDEX[order.status] ?? 0;

  const history = new Map(
    (order.tracking || []).map((item) => [
      item.status,
      item,
    ])
  );

  return (
    <View style={styles.timeline}>
      {ORDER_FLOW.map((step, index) => {
        const reached =
          index <= currentIndex;

        const historyItem =
          history.get(step.key);

        return (
          <View
            key={step.key}
            style={styles.timelineRow}
          >
            <View
              style={[
                styles.timelineDot,
                reached &&
                  styles.timelineDotReached,
              ]}
            >
              <Text style={styles.timelineIcon}>
                {step.icon}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.timelineLabel,
                  reached &&
                    styles.timelineLabelReached,
                ]}
              >
                {step.label}
              </Text>

              <Text style={styles.timelineDate}>
                {historyItem
                  ? formatDateTime(
                      historyItem.changed_at
                    )
                  : reached &&
                    step.key === order.status
                  ? "Estado actual"
                  : "Pendiente"}
              </Text>
            </View>

            {step.key === order.status ? (
              <View style={styles.currentPill}>
                <Text
                  style={styles.currentPillText}
                >
                  ACTUAL
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export default function Orders() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("active");
  const [now, setNow] = useState(
    Date.now()
  );

  async function load(
    showLoading = true
  ) {
    if (showLoading) {
      setLoading(true);
    }

    try {
      setItems(
        await getMyStoreOrders(token)
      );
      setError("");
      setNow(Date.now());
    } catch (e) {
      setError(e.message);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    load();

    // Consulta periódica. El backend calcula el estado correcto
    // usando el tiempo transcurrido desde la compra.
    const interval = setInterval(
      () => load(false),
      60_000
    );

    return () =>
      clearInterval(interval);
  }, [token]);

  const activeCount = useMemo(
    () =>
      items.filter(
        (item) =>
          ![
            "delivered",
            "cancelled",
          ].includes(item.status)
      ).length,
    [items]
  );

  const displayItems = useMemo(
    () =>
      items.filter((item) => {
        const final = ["delivered", "cancelled"].includes(item.status);
        return tab === "history" ? final : !final;
      }),
    [items, tab]
  );

  return (
    <Screen
      title="Mis pedidos"
      subtitle="Seguimiento automático de tus compras."
      onRefresh={() => load()}
      refreshing={loading}
    >
      <ErrorBox message={error} />

      <View style={styles.orderTabs}>
        <TouchableOpacity
          style={[styles.orderTab, tab === "active" && styles.orderTabActive]}
          onPress={() => setTab("active")}
        >
          <Text style={[styles.orderTabText, tab === "active" && styles.orderTabTextActive]}>
            En curso ({activeCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.orderTab, tab === "history" && styles.orderTabActive]}
          onPress={() => setTab("history")}
        >
          <Text style={[styles.orderTabText, tab === "history" && styles.orderTabTextActive]}>
            Historial ({items.length - activeCount})
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "active" ? (
        <View style={styles.liveInfo}>
          <Text style={styles.liveInfoTitle}>🚚 Seguimiento en vivo</Text>
          <Text style={styles.liveInfoText}>
            Los pedidos se actualizan automáticamente mientras avanzan hacia Entregado.
          </Text>
        </View>
      ) : (
        <Button
          label="🧹 Limpiar pedidos entregados"
          variant="ghost"
          onPress={async () => {
            try {
              await archiveMyDeliveredOrders(token);
              await load();
            } catch (e) {
              setError(e.message);
            }
          }}
        />
      )}

      {loading ? (
        <Loading />
      ) : displayItems.length === 0 ? (
        <Empty
          icon="📦"
          title={tab === "active" ? "Sin pedidos en curso" : "Sin pedidos en el historial"}
          text={tab === "active" ? "Cuando compres, podrás seguir tu pedido desde aquí." : "Tus pedidos finalizados aparecerán aquí."}
        />
      ) : (
        displayItems.map((order) => {
          const nextUpdate =
            nextAutomaticUpdate(
              order,
              now
            );

          return (
            <Card key={order.id}>
              <View style={styles.nativeOrderHead}>
                <View style={styles.nativeOrderIcon}>
                  <Text style={styles.nativeOrderIconText}>📦</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderTitle}>Pedido #{order.id}</Text>
                  <Text style={styles.orderStoreName}>{order.store_name}</Text>
                </View>
                <Text style={styles.nativeOrderPrice}>{formatMoney(order.total)}</Text>
              </View>

              <Row
                label="Creado"
                value={formatDateTime(
                  order.created_at
                )}
              />

              <Badge status={order.status} />

              {nextUpdate ? (
                <Text style={styles.nextUpdate}>
                  ⏱️ {nextUpdate}
                </Text>
              ) : null}

              <SectionTitle>
                Productos comprados
              </SectionTitle>

              {(order.items || []).map(
                (item) => (
                  <View
                    key={
                      item.id ||
                      `${order.id}-${item.product_id}`
                    }
                    style={styles.productRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={
                          styles.productName
                        }
                      >
                        {item.product_name}
                      </Text>

                      <Text
                        style={
                          styles.productDetail
                        }
                      >
                        {item.brand
                          ? `${item.brand} · `
                          : ""}
                        {item.format || ""}
                      </Text>

                      <Text
                        style={
                          styles.productDetail
                        }
                      >
                        Cantidad:{" "}
                        {item.quantity}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.productPrice
                      }
                    >
                      {formatMoney(
                        item.subtotal
                      )}
                    </Text>
                  </View>
                )
              )}

              <SectionTitle>
                Seguimiento
              </SectionTitle>

              <TrackingTimeline
                order={order}
              />

              <SectionTitle>
                Historial de cambios
              </SectionTitle>

              {(order.tracking || []).map(
                (tracking, index) => (
                  <Row
                    key={
                      tracking.id ||
                      `${tracking.status}-${index}`
                    }
                    label={statusLabel(
                      tracking.status
                    )}
                    value={formatDateTime(
                      tracking.changed_at
                    )}
                  />
                )
              )}

              <Button
                label="Comprobante PDF"
                compact
                variant="secondary"
                onPress={async () => {
                  try {
                    await downloadOrderReceipt(
                      token,
                      order.id
                    );
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              />

              {[
                "delivered",
                "cancelled",
              ].includes(order.status) ? (
                <Button
                  label="Quitar del historial"
                  compact
                  variant="ghost"
                  onPress={async () => {
                    try {
                      await archiveMyStoreOrder(
                        token,
                        order.id
                      );
                      await load();
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

const styles = StyleSheet.create({
  orderTabs: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderTab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  orderTabActive: {
    backgroundColor: COLORS.brand,
  },
  orderTabText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  orderTabTextActive: {
    color: "white",
    fontWeight: "900",
  },
  liveInfo: {
    backgroundColor: "#EEF9FF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D5EBF6",
  },
  liveInfoTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  liveInfoText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  nativeOrderHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 7,
  },
  nativeOrderIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.mint100,
    alignItems: "center",
    justifyContent: "center",
  },
  nativeOrderIconText: { fontSize: 23 },
  orderStoreName: {
    color: COLORS.mint700,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
  nativeOrderPrice: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: "900",
  },
  autoInfo: {
    marginTop: 8,
    color: COLORS.muted,
    lineHeight: 19,
    fontSize: 12,
  },

  orderTitle: {
    fontWeight: "900",
    fontSize: 17,
    color: COLORS.navy,
    marginBottom: 6,
  },

  nextUpdate: {
    marginTop: 9,
    backgroundColor: COLORS.mint,
    color: COLORS.teal,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 12,
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E9F7F2",
  },

  productName: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 14,
  },

  productDetail: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },

  productPrice: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 13,
  },

  timeline: {
    gap: 8,
  },

  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 54,
  },

  timelineDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F4F3",
    borderWidth: 2,
    borderColor: "#D7E0DD",
  },

  timelineDotReached: {
    backgroundColor: COLORS.mint,
    borderColor: COLORS.teal,
  },

  timelineIcon: {
    fontSize: 19,
  },

  timelineLabel: {
    color: COLORS.muted,
    fontWeight: "800",
    fontSize: 14,
  },

  timelineLabelReached: {
    color: COLORS.navy,
  },

  timelineDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },

  currentPill: {
    backgroundColor: COLORS.navy,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  currentPillText: {
    color: "white",
    fontWeight: "900",
    fontSize: 9,
  },

  cancelledBox: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: 12,
    padding: 12,
  },

  cancelledTitle: {
    color: COLORS.danger,
    fontWeight: "900",
  },

  cancelledText: {
    color: COLORS.muted,
    marginTop: 3,
    fontSize: 12,
  },
});
