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
  Button,
  Card,
  COLORS,
  Empty,
  ErrorBox,
  Loading,
  Screen,
} from "../../components/ui";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/api";
import { formatDateTime } from "../../utils/format";

function iconFor(category, title) {
  const value = `${category || ""} ${title || ""}`.toLowerCase();

  if (value.includes("compr") || value.includes("pedido")) return "🛒";
  if (value.includes("reserva") || value.includes("hora")) return "📅";
  if (value.includes("medic")) return "💊";
  if (value.includes("vacun")) return "💉";
  if (value.includes("stock")) return "📦";
  return "🔔";
}

export default function Notifications() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setItems(await getNotifications(token));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const unread = useMemo(
    () => items.filter((item) => !item.is_read).length,
    [items]
  );

  async function read(id) {
    try {
      await markNotificationRead(token, id);
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (e) {
      setError(e.message);
    }
  }

  async function readAll() {
    try {
      await markAllNotificationsRead(token);
      setItems((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Screen
      title="Notificaciones"
      subtitle="Centro de avisos de VetMap"
      back
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />

      <Card style={styles.summary}>
        <View style={styles.summaryRow}>
          <AnimatedEmoji emoji="🔔" size={31} motion={unread ? "wiggle" : "float"} />
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>
              {unread ? `${unread} aviso${unread === 1 ? "" : "s"} sin leer` : "Todo al día"}
            </Text>
            <Text style={styles.summaryText}>
              Compras, reservas, medicamentos y otras novedades aparecen aquí.
            </Text>
          </View>
        </View>
      </Card>

      {unread ? (
        <Button
          label="Marcar todas como leídas"
          variant="ghost"
          onPress={readAll}
        />
      ) : null}

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty icon="🔔" title="Todo al día" text="Todavía no tienes avisos." />
      ) : (
        items.map((notification) => (
          <Card
            key={notification.id}
            style={!notification.is_read ? styles.unreadCard : null}
          >
            <View style={styles.noticeTop}>
              <View style={styles.iconBox}>
                <AnimatedEmoji
                  emoji={iconFor(notification.category, notification.title)}
                  size={28}
                  motion={!notification.is_read ? "pulse" : "float"}
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{notification.title}</Text>
                  {!notification.is_read ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.date}>{formatDateTime(notification.created_at)}</Text>
              </View>
            </View>

            {!notification.is_read ? (
              <Button
                label="Marcar como leída"
                compact
                variant="ghost"
                onPress={() => read(notification.id)}
              />
            ) : null}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: "#F4F8F7" },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryTitle: { color: COLORS.navy, fontSize: 17, fontWeight: "900" },
  summaryText: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 2 },
  unreadCard: { borderColor: "#A9D9C8", borderWidth: 2, backgroundColor: "#F8FFFC" },
  noticeTop: { flexDirection: "row", gap: 10 },
  iconBox: { width: 46, height: 46, borderRadius: 15, backgroundColor: "#E9F7F2", alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  title: { flex: 1, color: COLORS.navy, fontSize: 16, fontWeight: "900" },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.teal },
  message: { color: COLORS.text, marginTop: 4, lineHeight: 18 },
  date: { color: COLORS.muted, fontSize: 10, marginTop: 5 },
});
