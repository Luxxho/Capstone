import {
  useEffect,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  Badge,
  Card,
  COLORS,
  Empty,
  MenuCard,
  Row,
  Screen,
  Stat,
} from "../../components/ui";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { useAuth } from "../../context/AuthContext";
import { getStoreDashboard } from "../../services/api";
import {
  formatMoney,
} from "../../utils/format";

export default function StoreHome() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] =
    useState(null);

  async function load() {
    try {
      setDashboard(
        await getStoreDashboard(token)
      );
    } catch {}
  }

  useEffect(() => {
    load();
  }, []);

  const stats =
    dashboard?.stats || {};

  return (
    <Screen
      title={`¡Hola, ${
        user?.name?.split(" ")[0] ||
        ""
      }!`}
      subtitle="Pedidos recientes, stock y productos destacados."
      onRefresh={load}
    >
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>
              TU TIENDA EN VETMAP
            </Text>
            <Text style={styles.title}>
              {dashboard?.store?.name ||
                user?.name ||
                "Tienda VetMap"}
            </Text>
            <Text style={styles.meta}>
              📍{" "}
              {dashboard?.store
                ?.commune ||
                "Tu tienda"}
            </Text>
          </View>

          <AnimatedEmoji
            emoji="🛍️"
            size={48}
            motion="bounce"
          />
        </View>

        <View style={styles.stats}>
          <Stat
            value={stats.products || 0}
            label="Productos"
          />
          <Stat
            value={stats.low_stock || 0}
            label="Stock bajo"
          />
          <Stat
            value={
              stats.pending_orders || 0
            }
            label="Pendientes"
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>
        Últimos pedidos
      </Text>

      {!dashboard?.recent_orders?.length ? (
        <Empty
          icon="🌿"
          title="Sin pedidos recientes"
          text="Los nuevos pedidos aparecerán aquí."
        />
      ) : (
        dashboard.recent_orders
          .slice(0, 4)
          .map((order) => (
            <Card key={order.id}>
              <View style={styles.orderHead}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={
                      styles.orderTitle
                    }
                  >
                    Pedido #{order.id}
                  </Text>
                  <Text
                    style={
                      styles.orderUser
                    }
                  >
                    {order.user_name}
                  </Text>
                </View>

                <Badge
                  status={order.status}
                />
              </View>

              <Row
                label="Total"
                value={formatMoney(
                  order.total
                )}
              />
            </Card>
          ))
      )}

      <Text style={styles.sectionTitle}>
        Producto destacado
      </Text>

      {dashboard?.top_product ? (
        <Card style={styles.highlight}>
          <AnimatedEmoji
            emoji="⭐"
            size={34}
            motion="pulse"
          />

          <Text style={styles.productName}>
            {dashboard.top_product.name}
          </Text>

          <Text style={styles.productMeta}>
            {dashboard.top_product.brand ||
              "Sin marca"}{" "}
            ·{" "}
            {dashboard.top_product.format ||
              "Sin formato"}
          </Text>

          <Text style={styles.units}>
            {dashboard.top_product.units_sold} unidades vendidas
          </Text>
        </Card>
      ) : (
        <Empty
          icon="📦"
          title="Aún no hay ventas suficientes"
          text="Cuando un producto destaque aparecerá aquí."
        />
      )}

      <MenuCard
        icon="🏷️"
        title="Productos"
        text="Crear, editar, stock, imágenes y eliminar"
        onPress={() =>
          router.push("/store/products")
        }
      />

      <MenuCard
        icon="📦"
        title="Pedidos"
        text="Estados y seguimiento"
        onPress={() =>
          router.push("/store/orders")
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#E9F7F2",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  kicker: {
    color: COLORS.teal,
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 3,
  },
  meta: {
    color: COLORS.muted,
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  sectionTitle: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  orderHead: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  orderTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
  },
  orderUser: {
    color: COLORS.muted,
    marginTop: 2,
  },
  highlight: {
    alignItems: "center",
    backgroundColor: "#FFF9E8",
  },
  productName: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 18,
    marginTop: 4,
  },
  productMeta: {
    color: COLORS.muted,
    marginTop: 3,
  },
  units: {
    color: COLORS.teal,
    fontWeight: "900",
    marginTop: 7,
  },
});
