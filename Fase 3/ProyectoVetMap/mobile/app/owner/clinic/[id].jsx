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
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  Button,
  Card,
  COLORS,
  ErrorBox,
  Loading,
  Row,
  Screen,
  SectionTitle,
} from "../../../components/ui";
import PlacesMap from "../../../components/PlacesMap";
import { AnimatedEmoji } from "../../../components/AnimatedEmoji";

import {
  getVeterinaryClinics,
} from "../../../services/api";

export default function ClinicDetail() {
  const { id } = useLocalSearchParams();
  const clinicId = String(id || "");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);

    try {
      setItems(
        await getVeterinaryClinics()
      );
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [clinicId]);

  const clinic = useMemo(
    () =>
      items.find(
        (item) =>
          String(item.id) === clinicId
      ) || null,
    [items, clinicId]
  );

  const services = (
    clinic?.services || ""
  )
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (loading && !clinic) {
    return (
      <Screen
        title="Veterinaria"
        back
        backTo="/owner/clinics"
      >
        <Loading />
      </Screen>
    );
  }

  if (!clinic) {
    return (
      <Screen
        title="Veterinaria"
        back
        backTo="/owner/clinics"
      >
        <ErrorBox message="No se encontró la veterinaria seleccionada." />
      </Screen>
    );
  }

  return (
    <Screen
      title={clinic.name}
      subtitle="Información y servicios"
      back
      backTo="/owner/clinics"
      onRefresh={load}
      refreshing={loading}
    >
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.icon}>
            <AnimatedEmoji
              emoji={
                clinic.is_24h
                  ? "🚑"
                  : "🏥"
              }
              size={44}
              motion="bounce"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {clinic.name}
            </Text>
            <Text style={styles.location}>
              📍 {clinic.commune || "Comuna ficticia"}
            </Text>
          </View>

          {clinic.is_24h ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                24 HORAS
              </Text>
            </View>
          ) : null}
        </View>

        <Row
          label="Dirección"
          value={
            clinic.address ||
            "Dirección demostrativa"
          }
        />
        <Row
          label="Horario"
          value={
            clinic.hours ||
            "Horario por confirmar"
          }
        />
      </Card>

      <SectionTitle>
        Servicios disponibles
      </SectionTitle>

      {services.length ? (
        services.map((service) => (
          <Card key={service}>
            <View style={styles.serviceRow}>
              <AnimatedEmoji
                emoji="🩺"
                size={25}
                motion="float"
              />
              <Text style={styles.serviceName}>
                {service}
              </Text>
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={styles.emptyServices}>
            Servicios por confirmar.
          </Text>
        </Card>
      )}

      <PlacesMap
        title="Ubicación"
        description={`Ubicación demostrativa de ${clinic.name}.`}
        places={[clinic]}
        type="clinic"
        selectedId={clinicId}
      />

      <Card style={styles.bookingCard}>
        <AnimatedEmoji
          emoji="📅"
          size={38}
          motion="pulse"
        />
        <Text style={styles.bookingTitle}>
          ¿Quieres reservar una hora?
        </Text>
        <Text style={styles.bookingText}>
          La veterinaria quedará seleccionada automáticamente en el formulario de reserva.
        </Text>

        <Button
          label="Agendar en esta veterinaria"
          onPress={() =>
            router.push({
              pathname:
                "/owner/reservations",
              params: {
                veterinary_id:
                  clinicId,
              },
            })
          }
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#F4FBF8",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 10,
  },
  icon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#D7F0E7",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: COLORS.navy,
    fontSize: 21,
    fontWeight: "900",
  },
  location: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  badge: {
    backgroundColor: "#DDF5EA",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: "#23725D",
    fontSize: 9,
    fontWeight: "900",
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  serviceName: {
    color: COLORS.navy,
    fontWeight: "900",
  },
  emptyServices: {
    color: COLORS.muted,
  },
  bookingCard: {
    alignItems: "center",
    backgroundColor: "#E9F7F2",
  },
  bookingTitle: {
    color: COLORS.navy,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 6,
  },
  bookingText: {
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 8,
  },
});
