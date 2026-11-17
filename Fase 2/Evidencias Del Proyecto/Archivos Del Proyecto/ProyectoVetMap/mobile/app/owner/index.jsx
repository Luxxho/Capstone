import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  Badge,
  Card,
  COLORS,
  Empty,
  Screen,
} from "../../components/ui";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { useAuth } from "../../context/AuthContext";
import {
  getMedications,
  getMyStoreOrders,
  getPets,
  getReservations,
} from "../../services/api";
import {
  formatDate,
  formatDateTime,
  formatMoney,
} from "../../utils/format";
import {
  getMedicationReminderPermissionStatus,
  syncOwnerMedicationReminders,
} from "../../utils/medicationReminders";

function petEmoji(species) {
  const value = String(species || "").toLowerCase();
  if (value.includes("perro")) return "🐶";
  if (value.includes("gato")) return "🐱";
  if (value.includes("conejo")) return "🐰";
  if (value.includes("pez")) return "🐟";
  if (value.includes("tortuga")) return "🐢";
  if (value.includes("ave") || value.includes("loro")) return "🐦";
  if (value.includes("iguana") || value.includes("gecko")) return "🦎";
  return "🐾";
}

export default function OwnerHome() {
  const { user, token } = useAuth();

  const [pets, setPets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true);

    try {
      const [petRows, reservationRows, orderRows] =
        await Promise.all([
          getPets(token),
          getReservations(token),
          getMyStoreOrders(token),
        ]);

      setPets(petRows || []);
      setReservations(reservationRows || []);
      setOrders(orderRows || []);

      const reminderPermission =
        await getMedicationReminderPermissionStatus();

      if (reminderPermission === "granted") {
        const medicationGroups = await Promise.all(
          (petRows || []).map(async (pet) => ({
            pet,
            medications: await getMedications(token, pet.id).catch(() => []),
          }))
        );

        await syncOwnerMedicationReminders(medicationGroups);
      }
    } catch {
      // El inicio se mantiene usable aunque un resumen no responda.
    } finally {
      if (showRefresh) setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeReservations = useMemo(
    () =>
      reservations.filter(
        (item) => !["cancelled", "completed"].includes(item.status)
      ),
    [reservations]
  );

  const nextReservation = useMemo(
    () =>
      [...activeReservations].sort((a, b) =>
        `${a.appointment_date || ""}T${String(a.appointment_time || "")}`.localeCompare(
          `${b.appointment_date || ""}T${String(b.appointment_time || "")}`
        )
      )[0] || null,
    [activeReservations]
  );

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (item) => !["delivered", "cancelled"].includes(item.status)
      ),
    [orders]
  );

  const nextReservationPet = useMemo(
    () =>
      nextReservation
        ? pets.find(
            (pet) =>
              String(pet.id) ===
              String(nextReservation.pet_id)
          ) || null
        : null,
    [pets, nextReservation]
  );

  return (
    <Screen
      title={`Hola, ${user?.name?.split(" ")[0] || ""} 👋`}
      subtitle="Todo para su bienestar, en un solo lugar."
      onRefresh={() => load(true)}
      refreshing={refreshing}
    >
      {nextReservation ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/owner/reservations")}
          style={styles.nextAppointment}
        >
          <View style={styles.nextAppointmentCopy}>
            <View style={styles.nextAppointmentLabelRow}>
              <View style={styles.calendarIcon}>
                <Text style={styles.calendarEmoji}>▣</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextAppointmentLabel}>Próxima atención</Text>
                <Text style={styles.nextAppointmentService}>{nextReservation.service}</Text>
              </View>
            </View>

            <Text style={styles.nextAppointmentMeta}>
              📅 {formatDate(nextReservation.appointment_date)} · {String(nextReservation.appointment_time || "").slice(0, 5)}
            </Text>
            <Text style={styles.nextAppointmentMeta}>
              📍 {nextReservation.veterinary_name}
            </Text>
          </View>

          <View style={styles.nextAppointmentPet}>
            {nextReservationPet?.photo_data ? (
              <Image
                source={{ uri: nextReservationPet.photo_data }}
                style={styles.nextAppointmentPetPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.nextAppointmentPetFallback}>
                <AnimatedEmoji
                  emoji={petEmoji(nextReservationPet?.species)}
                  size={54}
                  motion="bounce"
                />
              </View>
            )}

            <View style={styles.nextArrow}>
              <Text style={styles.nextArrowText}>›</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.nextAppointment, styles.emptyAppointment]}
          onPress={() => router.push("/owner/reservations")}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.nextAppointmentLabel}>Aún no tienes una próxima atención</Text>
            <Text style={styles.nextAppointmentService}>Agenda una hora para tu mascota.</Text>
          </View>
          <AnimatedEmoji emoji="📅" size={42} motion="pulse" />
        </TouchableOpacity>
      )}

      <SectionHeader
        title="Mis mascotas"
        action="Ver todas"
        onPress={() => router.push("/owner/pets")}
      />

      {pets.length === 0 ? (
        <Empty
          icon="🐾"
          title="Aún no tienes mascotas"
          text="Registra tu primera mascota para comenzar."
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.petCarousel}
        >
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              activeOpacity={0.86}
              style={styles.petCard}
              onPress={() =>
                router.push({
                  pathname: "/owner/pet/[id]",
                  params: { id: String(pet.id) },
                })
              }
            >
              {pet.photo_data ? (
                <Image source={{ uri: pet.photo_data }} style={styles.petImage} />
              ) : (
                <View style={styles.petImageFallback}>
                  <AnimatedEmoji emoji={petEmoji(pet.species)} size={44} motion="float" />
                </View>
              )}
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petType} numberOfLines={1}>
                {pet.breed || pet.species}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            activeOpacity={0.86}
            style={[styles.petCard, styles.addPetCard]}
            onPress={() => router.push("/owner/pet-new")}
          >
            <View style={styles.addPetCircle}>
              <Text style={styles.addPetPlus}>＋</Text>
            </View>
            <Text style={styles.petName}>Agregar</Text>
            <Text style={styles.petType}>Nueva mascota</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Text style={styles.sectionTitle}>Accesos rápidos</Text>
      <View style={styles.quickGrid}>
        <QuickAction
          icon="📅"
          title="Reservas"
          text="Agenda una hora"
          tone="teal"
          onPress={() => router.push("/owner/reservations")}
        />
        <QuickAction
          icon="🛍️"
          title="Tienda"
          text="Alimentos y productos"
          tone="orange"
          onPress={() => router.push("/owner/market")}
        />
        <QuickAction
          icon="📦"
          title="Pedidos"
          text="Revisa tus compras"
          tone="blue"
          onPress={() => router.push("/owner/orders")}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.86}
        style={styles.vetShortcut}
        onPress={() => router.push("/owner/clinics")}
      >
        <View style={styles.vetShortcutIcon}>
          <Text style={styles.vetShortcutEmoji}>🏥</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vetShortcutTitle}>
            Veterinarias VetMap
          </Text>
          <Text style={styles.vetShortcutText}>
            Revisa clínicas, servicios y ubicación.
          </Text>
        </View>
        <Text style={styles.vetShortcutArrow}>›</Text>
      </TouchableOpacity>

      <SectionHeader
        title="Pedidos recientes"
        action={orders.length ? "Ver todos" : null}
        onPress={() => router.push("/owner/orders")}
      />

      {orders.length === 0 ? (
        <Card style={styles.noOrdersCard}>
          <AnimatedEmoji emoji="📦" size={34} motion="float" />
          <View style={{ flex: 1 }}>
            <Text style={styles.noOrdersTitle}>Sin compras recientes</Text>
            <Text style={styles.noOrdersText}>Cuando compres en VetMap, el seguimiento aparecerá aquí.</Text>
          </View>
        </Card>
      ) : (
        orders.slice(0, 2).map((order) => (
          <TouchableOpacity
            key={order.id}
            activeOpacity={0.88}
            onPress={() => router.push("/owner/orders")}
            style={styles.orderCard}
          >
            <View style={styles.orderIcon}>
              <AnimatedEmoji emoji="📦" size={27} motion="float" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderTitle}>Pedido #{order.id}</Text>
              <Text style={styles.orderStore}>{order.store_name}</Text>
              <Text style={styles.orderMeta}>{formatDateTime(order.created_at)}</Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderPrice}>{formatMoney(order.total)}</Text>
              <Badge status={order.status} />
            </View>
          </TouchableOpacity>
        ))
      )}

      {activeOrders.length > 0 ? (
        <View style={styles.activeOrderHint}>
          <Text style={styles.activeOrderHintText}>
            🚚 {activeOrders.length} pedido{activeOrders.length === 1 ? "" : "s"} en curso
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

function SectionHeader({ title, action, onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
          <Text style={styles.sectionAction}>{action} ›</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function QuickAction({
  icon,
  title,
  text,
  onPress,
  tone = "teal",
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      style={styles.quickAction}
    >
      <View
        style={[
          styles.quickIcon,
          tone === "orange"
            ? styles.quickIconOrange
            : tone === "blue"
            ? styles.quickIconBlue
            : styles.quickIconTeal,
        ]}
      >
        <Text style={styles.quickIconText}>
          {icon}
        </Text>
      </View>
      <Text style={styles.quickTitle}>
        {title}
      </Text>
      <Text style={styles.quickText}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nextAppointment: {
    minHeight: 142,
    borderRadius: 23,
    backgroundColor: "#18BBB4",
    flexDirection: "row",
    overflow: "hidden",
    padding: 16,
    shadowColor: "#102033",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  emptyAppointment: {
    backgroundColor: COLORS.mint300,
    alignItems: "center",
  },
  nextAppointmentCopy: { flex: 1, justifyContent: "center" },
  nextAppointmentLabelRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 8 },
  calendarIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  calendarEmoji: { color: "white", fontSize: 20, fontWeight: "900" },
  nextAppointmentLabel: { color: "white", fontSize: 15, fontWeight: "900" },
  nextAppointmentService: { color: "rgba(255,255,255,0.93)", marginTop: 2, fontSize: 12, fontWeight: "700" },
  nextAppointmentMeta: { color: "white", fontSize: 12, fontWeight: "800", marginTop: 5 },
  nextAppointmentPet: {
    width: 112,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: -16,
    marginRight: -16,
  },
  nextAppointmentPetPhoto: {
    width: 112,
    height: 142,
    borderTopRightRadius: 23,
    borderBottomRightRadius: 23,
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
    backgroundColor: COLORS.mint100,
  },
  nextAppointmentPetFallback: {
    width: 112,
    height: 142,
    borderTopRightRadius: 23,
    borderBottomRightRadius: 23,
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
    backgroundColor: "#B8ECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  nextArrow: { position: "absolute", right: -2, bottom: 4, width: 34, height: 34, borderRadius: 17, backgroundColor: "white", alignItems: "center", justifyContent: "center" },
  nextArrowText: { color: COLORS.navy, fontSize: 25, fontWeight: "900", lineHeight: 28 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: COLORS.navy, fontSize: 18, fontWeight: "900" },
  sectionAction: { color: COLORS.mint700, fontSize: 12, fontWeight: "900" },
  petCarousel: { gap: 10, paddingRight: 4 },
  petCard: {
    width: 122,
    backgroundColor: "white",
    borderRadius: 19,
    padding: 7,
    borderWidth: 1,
    borderColor: "#D8ECE8",
    shadowColor: COLORS.navy,
    shadowOpacity: 0.055,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  petImage: { width: "100%", height: 92, borderRadius: 15, backgroundColor: COLORS.mint100 },
  petImageFallback: { width: "100%", height: 92, borderRadius: 15, backgroundColor: COLORS.mint100, alignItems: "center", justifyContent: "center" },
  petName: { color: COLORS.navy, fontWeight: "900", fontSize: 14, marginTop: 7 },
  petType: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  addPetCard: { justifyContent: "center", alignItems: "center", minHeight: 142, borderStyle: "dashed", backgroundColor: COLORS.mint50 },
  addPetCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: COLORS.mint500, borderStyle: "dashed", alignItems: "center", justifyContent: "center", backgroundColor: "white" },
  addPetPlus: { color: COLORS.mint600, fontSize: 34, fontWeight: "500" },
  quickGrid: { flexDirection: "row", gap: 8 },
  quickAction: {
    flex: 1,
    minHeight: 128,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DCECEA",
    padding: 11,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  quickIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickIconTeal: {
    backgroundColor: "#D9F7F4",
  },
  quickIconOrange: {
    backgroundColor: "#FFF1D9",
  },
  quickIconBlue: {
    backgroundColor: "#E4F2FF",
  },
  quickIconText: {
    fontSize: 25,
    fontWeight: "900",
  },
  quickTitle: { color: COLORS.navy, fontWeight: "900", fontSize: 13, textAlign: "center" },
  quickText: { color: COLORS.muted, fontSize: 9, lineHeight: 13, textAlign: "center", marginTop: 3 },
  vetShortcut: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCECEA",
    backgroundColor: "#FFFFFF",
  },
  vetShortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E3F4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  vetShortcutEmoji: {
    fontSize: 23,
  },
  vetShortcutTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  vetShortcutText: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 2,
  },
  vetShortcutArrow: {
    color: COLORS.navy,
    fontSize: 28,
    fontWeight: "500",
  },
  noOrdersCard: { flexDirection: "row", alignItems: "center", gap: 10 },
  noOrdersTitle: { color: COLORS.navy, fontWeight: "900" },
  noOrdersText: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  orderCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "white", borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  orderIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: COLORS.mint100, alignItems: "center", justifyContent: "center" },
  orderTitle: { color: COLORS.navy, fontSize: 14, fontWeight: "900" },
  orderStore: { color: COLORS.mint700, fontSize: 10, fontWeight: "800", marginTop: 2 },
  orderMeta: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
  orderRight: { alignItems: "flex-end", gap: 5 },
  orderPrice: { color: COLORS.navy, fontSize: 12, fontWeight: "900" },
  activeOrderHint: { backgroundColor: COLORS.mint100, borderRadius: 14, padding: 10 },
  activeOrderHintText: { color: COLORS.mint700, fontWeight: "900", textAlign: "center", fontSize: 11 },
});
