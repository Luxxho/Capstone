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

export default function PublicClinics() {
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
      pathname: "/public/clinic/[id]",
      params: {
        id: String(clinic.id),
      },
    });
  }

  return (
    <Screen
      title="Veterinarias VetMap"
      subtitle="Explora cada veterinaria antes de iniciar sesión"
      back
      backTo="/"
      showAccountActions={false}
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />

      <View>
        <Text style={styles.kicker}>
          VETERINARIAS
        </Text>
        <Text style={styles.title}>
          Revisa una veterinaria
        </Text>
        <Text style={styles.description}>
          Cada veterinaria tiene una pantalla propia con sus servicios, horario y ubicación.
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
            <View style={styles.top}>
              <AnimatedEmoji
                emoji={
                  clinic.is_24h
                    ? "🚑"
                    : "🏥"
                }
                size={35}
                motion="bounce"
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {clinic.name}
                </Text>
                <Text style={styles.meta}>
                  📍 {clinic.commune || "Comuna ficticia"}
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
        description="Toca una veterinaria para abrir su ficha."
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
  title: {
    color: COLORS.navy,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 3,
  },
  description: {
    color: COLORS.muted,
    lineHeight: 19,
    marginTop: 5,
  },
  top: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  name: {
    color: COLORS.navy,
    fontSize: 19,
    fontWeight: "900",
  },
  meta: {
    color: COLORS.muted,
    marginTop: 5,
  },
});
