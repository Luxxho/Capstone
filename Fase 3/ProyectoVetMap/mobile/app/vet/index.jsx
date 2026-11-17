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

import {
  getClinicDashboard,
  getNotifications,
} from "../../services/api";

import {
  formatDate,
  formatDateTime,
} from "../../utils/format";

function notificationEmoji(category) {
  const value = String(
    category || ""
  ).toLowerCase();

  if (
    value.includes("reservation") ||
    value.includes("appointment")
  ) {
    return "📅";
  }

  if (
    value.includes("medication")
  ) {
    return "💊";
  }

  if (value.includes("vaccine")) {
    return "💉";
  }

  return "🔔";
}

export default function VetHome() {
  const { user, token } = useAuth();

  const [dashboard, setDashboard] =
    useState(null);
  const [notifications, setNotifications] =
    useState([]);

  async function load() {
    try {
      const [data, noticeRows] =
        await Promise.all([
          getClinicDashboard(token),
          getNotifications(token).catch(
            () => []
          ),
        ]);

      setDashboard(data);
      setNotifications(
        noticeRows || []
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
      title={`¡Bienvenido, ${
        user?.name?.split(" ")[0] ||
        ""
      }!`}
      subtitle="Tus próximas atenciones, movimientos clínicos y resumen del día."
      onRefresh={load}
    >
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>
              JORNADA VETERINARIA
            </Text>
            <Text style={styles.heroTitle}>
              {dashboard?.clinic?.name ||
                "Clínica VetMap"}
            </Text>
            <Text style={styles.heroMeta}>
              📍{" "}
              {dashboard?.clinic
                ?.commune ||
                "Ubicación no informada"}
            </Text>
          </View>

          <AnimatedEmoji
            emoji="🩺"
            size={48}
            motion="float"
          />
        </View>

        <View style={styles.stats}>
          <Stat
            value={
              stats.today_appointments ??
              0
            }
            label="Horas hoy"
          />
          <Stat
            value={
              stats.pending_appointments ??
              0
            }
            label="Pendientes"
          />
          <Stat
            value={
              stats.patients ?? 0
            }
            label="Pacientes"
          />
          <Stat
            value={
              stats.prescriptions ?? 0
            }
            label="Recetas"
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>
        Próximas atenciones
      </Text>

      {!dashboard?.upcoming?.length ? (
        <Empty
          icon="🌿"
          title="Sin próximas horas"
          text="No hay atenciones pendientes o confirmadas en este momento."
        />
      ) : (
        dashboard.upcoming
          .slice(0, 4)
          .map((item) => (
            <Card key={item.id}>
              <View
                style={
                  styles.appointmentHeader
                }
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={
                      styles.appointmentPet
                    }
                  >
                    {item.pet_name}
                  </Text>
                  <Text
                    style={
                      styles.appointmentOwner
                    }
                  >
                    Dueño:{" "}
                    {item.user_name}
                  </Text>
                </View>

                <Badge
                  status={item.status}
                />
              </View>

              <Row
                label="Servicio"
                value={item.service}
              />
              <Row
                label="Fecha"
                value={formatDate(
                  item.appointment_date
                )}
              />
              <Row
                label="Hora"
                value={String(
                  item.appointment_time ||
                    ""
                ).slice(0, 5)}
              />
            </Card>
          ))
      )}

      <Text style={styles.sectionTitle}>
        Actividad clínica
      </Text>

      {notifications.length === 0 ? (
        <Empty
          icon="✨"
          title="Sin novedades recientes"
          text="Los nuevos avisos clínicos aparecerán aquí."
        />
      ) : (
        notifications
          .slice(0, 4)
          .map((notice) => (
            <Card key={notice.id}>
              <View style={styles.noticeRow}>
                <AnimatedEmoji
                  emoji={notificationEmoji(
                    notice.category
                  )}
                  size={25}
                  motion="float"
                />

                <View style={{ flex: 1 }}>
                  <Text
                    style={
                      styles.noticeTitle
                    }
                  >
                    {notice.title}
                  </Text>
                  <Text
                    style={
                      styles.noticeText
                    }
                  >
                    {notice.message}
                  </Text>
                  <Text
                    style={
                      styles.noticeDate
                    }
                  >
                    {formatDateTime(
                      notice.created_at
                    )}
                  </Text>
                </View>
              </View>
            </Card>
          ))
      )}

      <MenuCard
        icon="📅"
        title="Agenda"
        text="Reservas, estados e informes"
        onPress={() =>
          router.push("/vet/agenda")
        }
      />

      <MenuCard
        icon="🐾"
        title="Pacientes"
        text="Historial y ficha clínica"
        onPress={() =>
          router.push("/vet/patients")
        }
      />

      <MenuCard
        icon="📄"
        title="Recetas"
        text="Emitir, buscar y usar plantillas reutilizables"
        onPress={() =>
          router.push("/vet/prescriptions")
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
  heroTitle: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 3,
  },
  heroMeta: {
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
    marginTop: 3,
  },
  appointmentHeader: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 5,
  },
  appointmentPet: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: "900",
  },
  appointmentOwner: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  noticeRow: {
    flexDirection: "row",
    gap: 10,
  },
  noticeTitle: {
    color: COLORS.navy,
    fontWeight: "900",
  },
  noticeText: {
    color: COLORS.muted,
    lineHeight: 18,
    marginTop: 2,
  },
  noticeDate: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },
});
