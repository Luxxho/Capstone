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
  Screen,
} from "../../components/ui";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";

const DEMO_TIMES = [
  "09:00",
  "10:30",
  "12:00",
  "15:00",
  "17:30",
  "19:00",
];

export default function PublicReservation() {
  return (
    <Screen
      title="Reserva de hora"
      subtitle="Conoce cómo funciona el proceso antes de iniciar sesión"
      back
      backTo="/"
      showAccountActions={false}
    >
      <Card style={styles.hero}>
        <AnimatedEmoji emoji="📅" size={45} motion="pulse" />
        <Text style={styles.heroTitle}>Agenda VetMap</Text>
        <Text style={styles.heroText}>
          Para confirmar una reserva real debes iniciar sesión y seleccionar una mascota.
        </Text>
      </Card>

      <Step number="1" title="Selecciona una veterinaria">
        <DemoRow emoji="🏥" title="Clínica Huellitas" text="Santiago" />
        <DemoRow emoji="🩺" title="Centro Animal Norte" text="Quilicura" />
      </Step>

      <Step number="2" title="Selecciona un servicio">
        <View style={styles.chips}>
          {["Consulta general", "Vacunación", "Control médico", "Urgencia"].map((item) => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
            </View>
          ))}
        </View>
      </Step>

      <Step number="3" title="Fecha y hora">
        <View style={styles.chips}>
          {DEMO_TIMES.map((time) => (
            <View key={time} style={styles.timeChip}>
              <Text style={styles.timeText}>{time}</Text>
            </View>
          ))}
        </View>
      </Step>

      <Card style={styles.loginCard}>
        <AnimatedEmoji emoji="🐶" size={35} motion="float" />
        <Text style={styles.loginTitle}>¿Quieres reservar de verdad?</Text>
        <Text style={styles.loginText}>
          Inicia sesión para seleccionar tu mascota, revisar horarios reales y confirmar la atención.
        </Text>
        <Button
          label="Iniciar sesión para reservar"
          onPress={() => router.push("/login")}
        />
      </Card>
    </Screen>
  );
}

function Step({ number, title, children }) {
  return (
    <Card>
      <View style={styles.stepHead}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      {children}
    </Card>
  );
}

function DemoRow({ emoji, title, text }) {
  return (
    <View style={styles.demoRow}>
      <Text style={styles.demoEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.demoTitle}>{title}</Text>
        <Text style={styles.demoText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", backgroundColor: "#EEF7FF" },
  heroTitle: { color: COLORS.navy, fontSize: 22, fontWeight: "900", marginTop: 5 },
  heroText: { color: COLORS.muted, textAlign: "center", lineHeight: 19, marginTop: 4 },
  stepHead: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.navy, alignItems: "center", justifyContent: "center" },
  stepNumberText: { color: "white", fontWeight: "900" },
  stepTitle: { color: COLORS.navy, fontSize: 17, fontWeight: "900" },
  demoRow: { flexDirection: "row", alignItems: "center", gap: 9, borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, padding: 10, marginBottom: 7 },
  demoEmoji: { fontSize: 25 },
  demoTitle: { color: COLORS.navy, fontWeight: "900" },
  demoText: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { backgroundColor: COLORS.mint, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  chipText: { color: COLORS.navy, fontWeight: "800", fontSize: 11 },
  timeChip: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9 },
  timeText: { color: COLORS.navy, fontWeight: "900" },
  loginCard: { alignItems: "center", backgroundColor: "#E9F7F2" },
  loginTitle: { color: COLORS.navy, fontSize: 18, fontWeight: "900", marginTop: 5 },
  loginText: { color: COLORS.muted, textAlign: "center", lineHeight: 18, marginTop: 4, marginBottom: 8 },
});
