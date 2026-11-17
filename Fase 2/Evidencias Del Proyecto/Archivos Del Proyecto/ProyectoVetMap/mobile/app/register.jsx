import { useState } from "react";
import { router } from "expo-router";

import {
  Button,
  Card,
  ErrorBox,
  Input,
  Screen,
} from "../components/ui";
import LocationSelector from "../components/LocationSelector";
import { AnimatedEmoji } from "../components/AnimatedEmoji";
import { useAuth } from "../context/AuthContext";
import { todayISO } from "../utils/format";

export default function Register() {
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    rut: "",
    country: "Chile",
    region: "",
    city: "",
    birth_date: "",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  async function submit() {
    setError("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Ingresa tu nombre y correo electrónico.");
      return;
    }

    if (!form.password) {
      setError("Ingresa una contraseña.");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (form.birth_date && form.birth_date > todayISO()) {
      setError("La fecha de nacimiento no puede estar en el futuro.");
      return;
    }

    setBusy(true);

    try {
      const profile = await signUp({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        rut: form.rut || null,
        country: form.country || null,
        region: form.region || null,
        city: form.city || null,
        birth_date: form.birth_date || null,
        birth_year: form.birth_date
          ? Number(form.birth_date.slice(0, 4))
          : null,
      });

      router.replace(
        profile?.role === "owner"
          ? "/owner"
          : "/"
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Crear cuenta"
      subtitle="Registro de dueño de mascota"
      back
      backTo="/"
      showAccountActions={false}
    >
      <Card>
        <AnimatedEmoji
          emoji="🐶"
          size={46}
          motion="bounce"
          style={{ alignSelf: "center", marginBottom: 7 }}
        />

        <Input
          label="Nombre completo"
          value={form.name}
          onChangeText={(value) => set("name", value)}
          placeholder="Nombre completo"
        />

        <Input
          label="Correo electrónico"
          value={form.email}
          onChangeText={(value) => set("email", value)}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="correo@ejemplo.cl"
        />

        <Input
          label="RUT"
          value={form.rut}
          onChangeText={(value) => set("rut", value)}
          placeholder="12.345.678-9"
        />

        <Input
          label="Fecha de nacimiento"
          value={form.birth_date}
          onChangeText={(value) => set("birth_date", value)}
          placeholder="AAAA-MM-DD"
        />

        <LocationSelector
          country={form.country}
          region={form.region}
          city={form.city}
          onChange={(location) =>
            setForm((current) => ({
              ...current,
              ...location,
            }))
          }
        />

        <Input
          label="Contraseña"
          value={form.password}
          onChangeText={(value) => set("password", value)}
          secureTextEntry
          placeholder="Contraseña"
        />

        <Input
          label="Confirmar contraseña"
          value={form.confirm_password}
          onChangeText={(value) => set("confirm_password", value)}
          secureTextEntry
          placeholder="Repite tu contraseña"
        />

        <ErrorBox message={error} />

        <Button
          label={busy ? "Creando cuenta..." : "Crear mi cuenta"}
          onPress={submit}
          disabled={busy}
        />

        <Button
          label="Ya tengo una cuenta"
          variant="ghost"
          onPress={() => router.replace("/login")}
        />
      </Card>
    </Screen>
  );
}
