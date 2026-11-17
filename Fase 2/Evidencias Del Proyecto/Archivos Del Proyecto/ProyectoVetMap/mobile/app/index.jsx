import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Redirect,
  router,
} from "expo-router";

import {
  Button,
  Card,
  COLORS,
  Loading,
  MenuCard,
  Screen,
} from "../components/ui";
import { AnimatedEmoji } from "../components/AnimatedEmoji";
import { useAuth } from "../context/AuthContext";

function roleHome(role) {
  if (role === "owner") return "/owner";
  if (role === "vet") return "/vet";
  if (role === "store") return "/store";
  if (role === "admin") return "/admin";
  if (role === "driver") return "/driver";
  return "/login";
}

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Screen
        showAccountActions={false}
      >
        <Loading label="Iniciando VetMap..." />
      </Screen>
    );
  }

  if (user) {
    return (
      <Redirect
        href={roleHome(user.role)}
      />
    );
  }

  return (
    <Screen
      showAccountActions={false}
    >
      <Card style={styles.hero}>
        <View style={styles.heroIcons}>
          <AnimatedEmoji
            emoji="🐾"
            size={50}
            motion="bounce"
          />
          <AnimatedEmoji
            emoji="💚"
            size={30}
            motion="pulse"
          />
        </View>

        <Text style={styles.kicker}>
          VETMAP
        </Text>

        <Text style={styles.title}>
          Todo para tu mascota, en un solo lugar
        </Text>

        <Text style={styles.text}>
          Revisa veterinarias y tiendas ficticias antes de iniciar sesión. Para reservar o comprar necesitas una cuenta.
        </Text>

        <Button
          label="Iniciar sesión"
          onPress={() =>
            router.push("/login")
          }
        />

        <Button
          label="Crear cuenta"
          variant="secondary"
          onPress={() =>
            router.push("/register")
          }
        />
      </Card>

      <MenuCard
        icon="🏥"
        title="Veterinarias"
        text="Revisa centros, servicios, horarios y mapa"
        onPress={() =>
          router.push(
            "/public/clinics"
          )
        }
      />

      <MenuCard
        icon="🏪"
        title="Tiendas"
        text="Explora tiendas y productos antes de ingresar"
        onPress={() =>
          router.push(
            "/public/market"
          )
        }
      />

      <MenuCard
        icon="📅"
        title="Reserva de hora"
        text="Conoce cómo funciona el proceso de reserva"
        onPress={() =>
          router.push(
            "/public/reservation"
          )
        }
      />

      <MenuCard
        icon="❓"
        title="Ayuda"
        text="Preguntas frecuentes sobre mascotas, veterinarias y tienda"
        onPress={() =>
          router.push(
            "/public/help"
          )
        }
      />

      <Card style={styles.demo}>
        <Text style={styles.demoTitle}>
          🧪 Proyecto académico
        </Text>
        <Text style={styles.demoText}>
          Los establecimientos, direcciones, productos y datos mostrados en VetMap son demostrativos.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#E9F7F2",
    alignItems: "stretch",
  },
  heroIcons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  kicker: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
    textAlign: "center",
  },
  title: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 27,
    textAlign: "center",
    marginTop: 5,
  },
  text: {
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 10,
  },
  demo: {
    backgroundColor: "#FFF8DF",
  },
  demoTitle: {
    color: "#725400",
    fontWeight: "900",
  },
  demoText: {
    color: "#7A631E",
    marginTop: 4,
    lineHeight: 18,
  },
});
