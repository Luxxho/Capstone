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
  Input,
  Screen,
} from "../../components/ui";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";

export default function PublicHelp() {
  return (
    <Screen
      title="Centro de ayuda"
      subtitle="Preguntas frecuentes sobre VetMap"
      back
      backTo="/"
      showAccountActions={false}
    >
      <Card style={styles.hero}>
        <AnimatedEmoji emoji="❓" size={42} motion="pulse" />
        <Text style={styles.heroTitle}>Soporte VetMap</Text>
        <Text style={styles.heroText}>
          Encuentra rápidamente cómo usar las áreas principales de la plataforma.
        </Text>
      </Card>

      <Input
        label="Buscar"
        placeholder="¿Qué estás buscando?"
        editable={false}
      />

      <HelpCard
        emoji="🐶"
        title="Mascotas"
        items={[
          "¿Cómo registro una mascota?",
          "¿Dónde veo el historial clínico?",
          "¿Cómo actualizo sus datos?",
        ]}
      />

      <HelpCard
        emoji="🏥"
        title="Veterinarias"
        items={[
          "¿Cómo busco una clínica?",
          "¿Cómo reservo una hora?",
          "¿Cómo reviso una consulta?",
        ]}
      />

      <HelpCard
        emoji="🛒"
        title="Tienda"
        items={[
          "¿Cómo busco productos?",
          "¿Cómo comparo precios?",
          "¿Cómo reviso una tienda?",
        ]}
      />

      <Card style={styles.support}>
        <View style={styles.supportTop}>
          <AnimatedEmoji emoji="💬" size={30} motion="float" />
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>¿Aún necesitas ayuda?</Text>
            <Text style={styles.supportText}>
              El formulario de soporte es una función futura del proyecto académico.
            </Text>
          </View>
        </View>
        <Button
          label="Volver al inicio"
          variant="secondary"
          onPress={() => router.replace("/")}
        />
      </Card>
    </Screen>
  );
}

function HelpCard({ emoji, title, items }) {
  return (
    <Card>
      <View style={styles.helpHead}>
        <AnimatedEmoji emoji={emoji} size={31} motion="float" />
        <Text style={styles.helpTitle}>{title}</Text>
      </View>

      {items.map((item) => (
        <Text key={item} style={styles.question}>• {item}</Text>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", backgroundColor: "#EEF7FF" },
  heroTitle: { color: COLORS.navy, fontSize: 22, fontWeight: "900", marginTop: 5 },
  heroText: { color: COLORS.muted, textAlign: "center", lineHeight: 19, marginTop: 4 },
  helpHead: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 7 },
  helpTitle: { color: COLORS.navy, fontSize: 18, fontWeight: "900" },
  question: { color: COLORS.text, lineHeight: 20, marginTop: 4 },
  support: { backgroundColor: "#E9F7F2" },
  supportTop: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 8 },
  supportTitle: { color: COLORS.navy, fontWeight: "900", fontSize: 17 },
  supportText: { color: COLORS.muted, lineHeight: 18, marginTop: 3 },
});
