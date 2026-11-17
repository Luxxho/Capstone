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
  Button,
  Card,
  COLORS,
  Empty,
  ErrorBox,
  Loading,
  Screen,
} from "../../components/ui";
import PlacesMap from "../../components/PlacesMap";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { getVeterinaryClinics } from "../../services/api";

export default function Clinics() {
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
  }, []);

  function openClinic(clinic) {
    router.push({
      pathname: "/owner/clinic/[id]",
      params: {
        id: String(clinic.id),
      },
    });
  }

  return (
    <Screen
      title="Veterinarias"
      subtitle="Elige una veterinaria para revisar sus servicios"
      back
      backTo="/owner"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />

      <View>
        <Text style={styles.kicker}>
          RED VETMAP
        </Text>
        <Text style={styles.pageTitle}>
          ¿Qué veterinaria quieres revisar?
        </Text>
        <Text style={styles.pageDescription}>
          Entra a la ficha de una veterinaria para revisar ubicación, horarios y servicios antes de reservar.
        </Text>
      </View>

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty
          icon="🏥"
          title="Sin veterinarias"
        />
      ) : (
        items.map((clinic) => (
          <Card key={clinic.id}>
            <View style={styles.header}>
              <View style={styles.icon}>
                <AnimatedEmoji
                  emoji={
                    clinic.is_24h
                      ? "🚑"
                      : "🏥"
                  }
                  size={30}
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

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {clinic.is_24h
                    ? "24H"
                    : "VetMap"}
                </Text>
              </View>
            </View>

            <Text style={styles.meta}>
              🕐 {clinic.hours || "Horario por confirmar"}
            </Text>

            <Button
              label="Ver veterinaria →"
              onPress={() =>
                openClinic(clinic)
              }
            />
          </Card>
        ))
      )}

      <PlacesMap
        title="Mapa de veterinarias"
        description="Toca una veterinaria en el mapa para abrir directamente su ficha."
        places={items}
        type="clinic"
        onSelect={openClinic}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  pageTitle: {
    color: COLORS.navy,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 3,
  },
  pageDescription: {
    color: COLORS.muted,
    lineHeight: 19,
    marginTop: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EDF7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: COLORS.navy,
    fontSize: 19,
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
    fontSize: 10,
    fontWeight: "900",
  },
  meta: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
});
