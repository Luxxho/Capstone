import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";

import {
  Button,
  Card,
  ErrorBox,
  Input,
  Screen,
  SuccessBox,
} from "../../components/ui";
import LocationSelector from "../../components/LocationSelector";
import { useAuth } from "../../context/AuthContext";
import { roleLabel, todayISO } from "../../utils/format";

export default function ProfileEdit() {
  const { user, saveProfile } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    rut: "",
    country: "",
    region: "",
    city: "",
    birth_date: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      rut: user.rut || "",
      country: user.country || "",
      region: user.region || "",
      city: user.city || "",
      birth_date: user.birth_date || "",
      password: "",
      confirm_password: "",
    });
  }, [user]);

  function set(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function save() {
    setError("");
    setOk("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Debes ingresar nombre y correo.");
      return;
    }

    if (form.password || form.confirm_password) {
      if (form.password !== form.confirm_password) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }

    if (form.birth_date && form.birth_date > todayISO()) {
      setError("La fecha de nacimiento no puede estar en el futuro.");
      return;
    }

    setBusy(true);

    try {
      const data = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        rut: form.rut || null,
        country: form.country || null,
        region: form.region || null,
        city: form.city || null,
        birth_date: form.birth_date || null,
      };

      if (!data.password) {
        delete data.password;
        delete data.confirm_password;
      }

      await saveProfile(data);

      setForm((current) => ({
        ...current,
        password: "",
        confirm_password: "",
      }));

      setOk("Perfil actualizado correctamente.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Modificar perfil"
      subtitle={roleLabel(user?.role)}
      back
      backTo="/common/profile"
    >
      <Card>
        <Input
          label="Nombre completo"
          value={form.name}
          onChangeText={(value) => set("name", value)}
        />

        <Input
          label="Correo electrónico"
          value={form.email}
          onChangeText={(value) => set("email", value)}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="RUT"
          value={form.rut}
          onChangeText={(value) => set("rut", value)}
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

        <View
          style={{
            backgroundColor: "#F4FBF8",
            borderRadius: 14,
            padding: 11,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#162850", fontWeight: "900" }}>
            🔒 Rol de la cuenta: {roleLabel(user?.role)}
          </Text>
          <Text style={{ color: "#526A63", fontSize: 11, marginTop: 3 }}>
            El rol no puede modificarse desde tu perfil.
          </Text>
        </View>

        <Input
          label="Nueva contraseña (opcional)"
          value={form.password}
          onChangeText={(value) => set("password", value)}
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
          label={busy ? "Guardando..." : "Guardar cambios"}
          onPress={save}
          disabled={busy}
        />

        <Button
          label="Cancelar"
          variant="ghost"
          disabled={busy}
          onPress={() => router.replace("/common/profile")}
        />
      </Card>
    </Screen>
  );
}
