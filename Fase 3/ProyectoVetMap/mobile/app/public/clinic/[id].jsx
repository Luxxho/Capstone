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

export default function PublicClinicDetail() {
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
        backTo="/public/clinics"
        showAccountActions={false}
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
        backTo="/public/clinics"
        showAccountActions={false}
      >
        <ErrorBox message="No se encontró la veterinaria seleccionada." />
      </Screen>
    );
  }

  return (
    <Screen
      title={clinic.name}
      subtitle="Información pública"
      back
      backTo="/public/clinics"
      showAccountActions={false}
      onRefresh={load}
      refreshing={loading}
    >
      <Card style={styles.hero}>
        <View style={styles.top}>
          <AnimatedEmoji
            emoji={
              clinic.is_24h
                ? "🚑"
                : "🏥"
            }
            size={46}
            motion="bounce"
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {clinic.name}
            </Text>
            <Text style={styles.location}>
              📍 {clinic.commune || "Comuna ficticia"}
            </Text>
          </View>
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
        Servicios
      </SectionTitle>

      {services.length ? (
        services.map((service) => (
          <Card key={service}>
            <View style={styles.serviceRow}>
              <AnimatedEmoji
                emoji="🩺"
                size={24}
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
          <Text style={styles.emptyText}>
            Servicios por confirmar.
          </Text>
        </Card>
      )}

      <PlacesMap
        title="Ubicación"
        description="Ubicación demostrativa de la veterinaria."
        places={[clinic]}
        type="clinic"
        selectedId={clinicId}
      />

      <Card style={styles.loginCard}>
        <AnimatedEmoji
          emoji="📅"
          size={38}
          motion="pulse"
        />
        <Text style={styles.loginTitle}>
          ¿Quieres agendar una hora?
        </Text>
        <Text style={styles.loginText}>
          Inicia sesión para seleccionar tu mascota y reservar una atención.
        </Text>

        <Button
          label="Iniciar sesión para reservar"
          onPress={() =>
            router.push("/login")
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
  top: {
    flexDirection: "row",
    gap: 11,
    alignItems: "center",
    marginBottom: 9,
  },
  name: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: "900",
  },
  location: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  serviceRow: {
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
  },
  serviceName: {
    color: COLORS.navy,
    fontWeight: "900",
  },
  emptyText: {
    color: COLORS.muted,
  },
  loginCard: {
    alignItems: "center",
    backgroundColor: "#E9F7F2",
  },
  loginTitle: {
    color: COLORS.navy,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 6,
  },
  loginText: {
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 8,
  },
});
