import { useState } from "react";
import { Redirect, router } from "expo-router";
import {
  Button,
  Card,
  ErrorBox,
  Input,
  Loading,
  Screen,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";

function roleHome(role) {
  if (role === "owner") return "/owner";
  if (role === "vet") return "/vet";
  if (role === "store") return "/store";
  if (role === "admin") return "/admin";
  if (role === "driver") return "/driver";
  return "/";
}

export default function Login() {
  const { signIn, user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return (
      <Screen showAccountActions={false}>
        <Loading label="Revisando sesión..." />
      </Screen>
    );
  }

  // Si AsyncStorage conserva una sesión válida, no mostramos
  // nuevamente el formulario de login: vamos directo al rol.
  if (user) {
    return <Redirect href={roleHome(user.role)} />;
  }

  async function submit() {
    if (!email.trim() || !password) {
      setError("Ingresa correo y contraseña.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const profile = await signIn(
        email.trim(),
        password
      );

      router.replace(roleHome(profile.role));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="VetMap"
      subtitle="Todo para el cuidado de tu mascota en un solo lugar."
      back
      backTo="/"
      showAccountActions={false}
    >
      <Card>
        <Input
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="correo@ejemplo.cl"
        />

        <Input
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Tu contraseña"
        />

        <ErrorBox message={error} />

        <Button
          label={
            busy
              ? "Ingresando..."
              : "Iniciar sesión"
          }
          onPress={submit}
          disabled={busy}
        />

        <Button
          label="Crear cuenta de dueño"
          variant="ghost"
          onPress={() => router.push("/register")}
        />

        <Button
          label="Restablecer contraseña"
          variant="ghost"
          onPress={() =>
            router.push("/reset-password")
          }
        />
      </Card>
    </Screen>
  );
}
