import { useState } from "react";
import { router } from "expo-router";
import { resetPassword } from "../services/api";
import {
  Button,
  Card,
  ErrorBox,
  Input,
  Screen,
  SuccessBox,
} from "../components/ui";

export default function ResetPassword() {
  const [form, setForm] = useState({
    email: "",
    new_password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  async function submit() {
    setError("");
    setOk("");

    if (!form.email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    if (!form.new_password) {
      setError("Ingresa la nueva contraseña.");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setBusy(true);

    try {
      const result = await resetPassword({
        ...form,
        email: form.email.trim(),
      });

      setOk(
        result.message ||
          "Contraseña restablecida correctamente. Ahora puedes iniciar sesión."
      );
      setForm((current) => ({
        ...current,
        new_password: "",
        confirm_password: "",
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Restablecer contraseña"
      subtitle="Define una nueva contraseña para tu cuenta"
      back
      backTo="/login"
      showAccountActions={false}
    >
      <Card>
        <Input
          label="Correo electrónico"
          value={form.email}
          onChangeText={(value) => set("email", value)}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Nueva contraseña"
          value={form.new_password}
          onChangeText={(value) => set("new_password", value)}
          secureTextEntry
        />

        <Input
          label="Confirmar nueva contraseña"
          value={form.confirm_password}
          onChangeText={(value) => set("confirm_password", value)}
          secureTextEntry
        />

        <ErrorBox message={error} />
        <SuccessBox message={ok} />

        <Button
          label={busy ? "Actualizando..." : "Guardar nueva contraseña"}
          onPress={submit}
          disabled={busy}
        />

        {ok ? (
          <Button
            label="Volver a iniciar sesión"
            variant="secondary"
            onPress={() => router.replace("/login")}
          />
        ) : null}
      </Card>
    </Screen>
  );
}
