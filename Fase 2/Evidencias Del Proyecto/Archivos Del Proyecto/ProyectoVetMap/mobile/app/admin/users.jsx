import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Button,
  Card,
  ChoiceRow,
  confirm,
  Empty,
  ErrorBox,
  Input,
  Loading,
  Row,
  Screen,
  SuccessBox,
} from "../../components/ui";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import SelectField from "../../components/SelectField";
import LocationSelector from "../../components/LocationSelector";
import { useAuth } from "../../context/AuthContext";

import {
  createAdminUser,
  deleteAdminUser,
  getAdminPets,
  getAdminUsers,
  getStorefrontStores,
  getVeterinaryClinics,
  updateAdminUser,
} from "../../services/api";

import {
  formatDate,
  roleLabel,
} from "../../utils/format";

const EMPTY = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
  role: "owner",
  rut: "",
  country: "Chile",
  region: "",
  city: "",
  birth_date: "",
  veterinary_id: "",
  store_id: "",
};

function roleEmoji(role) {
  return {
    owner: "🐾",
    vet: "🩺",
    store: "🏪",
    admin: "🛡️",
  }[role] || "👤";
}

export default function Users() {
  const { token } = useAuth();

  const [items, setItems] =
    useState([]);
  const [pets, setPets] =
    useState([]);
  const [clinics, setClinics] =
    useState([]);
  const [stores, setStores] =
    useState([]);
  const [query, setQuery] =
    useState("");
  const [selected, setSelected] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY);
  const [show, setShow] =
    useState(false);
  const [editing, setEditing] =
    useState(null);

  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [ok, setOk] =
    useState("");

  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  async function load() {
    setLoading(true);

    try {
      const [
        userRows,
        petRows,
        clinicRows,
        storeRows,
      ] = await Promise.all([
        getAdminUsers(token),
        getAdminPets(token),
        getVeterinaryClinics(),
        getStorefrontStores(),
      ]);

      setItems(userRows || []);
      setPets(petRows || []);
      setClinics(clinicRows || []);
      setStores(storeRows || []);
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

  const filtered =
    useMemo(
      () =>
        items.filter((user) =>
          `${user.name} ${user.email} ${
            user.role
          } ${user.city || ""} ${
            user.rut || ""
          }`
            .toLowerCase()
            .includes(
              query.toLowerCase()
            )
        ),
      [items, query]
    );

  function petCount(userId) {
    return pets.filter(
      (pet) =>
        Number(pet.owner_id) ===
        Number(userId)
    ).length;
  }

  function reset() {
    setShow(false);
    setEditing(null);
    setForm(EMPTY);
  }

  function edit(user) {
    setSelected(null);
    setShow(true);
    setEditing(user.id);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirm_password: "",
      role: user.role || "owner",
      rut: user.rut || "",
      country: user.country || "",
      region: user.region || "",
      city: user.city || "",
      birth_date:
        user.birth_date || "",
      veterinary_id:
        user.veterinary_id
          ? String(
              user.veterinary_id
            )
          : "",
      store_id:
        user.store_id
          ? String(user.store_id)
          : "",
    });
  }

  async function save() {
    setError("");
    setOk("");

    if (
      !form.name.trim() ||
      !form.email.trim()
    ) {
      setError(
        "Debes ingresar nombre y correo."
      );
      return;
    }

    if (
      !editing &&
      !form.password
    ) {
      setError(
        "Ingresa una contraseña para el nuevo usuario."
      );
      return;
    }

    if (
      form.password !==
      form.confirm_password
    ) {
      setError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    if (
      form.birth_date &&
      form.birth_date >
        new Date().toISOString().slice(0, 10)
    ) {
      setError(
        "La fecha de nacimiento no puede estar en el futuro."
      );
      return;
    }

    if (
      form.role === "vet" &&
      !form.veterinary_id
    ) {
      setError(
        "Selecciona la veterinaria asociada."
      );
      return;
    }

    if (
      form.role === "store" &&
      !form.store_id
    ) {
      setError(
        "Selecciona la tienda asociada."
      );
      return;
    }

    try {
      const data = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        birth_date:
          form.birth_date || null,
        veterinary_id:
          form.role === "vet" &&
          form.veterinary_id
            ? Number(
                form.veterinary_id
              )
            : null,
        store_id:
          form.role === "store" &&
          form.store_id
            ? Number(
                form.store_id
              )
            : null,
      };

      if (
        editing &&
        !data.password
      ) {
        delete data.password;
        delete data.confirm_password;
      }

      if (editing) {
        await updateAdminUser(
          token,
          editing,
          data
        );
      } else {
        await createAdminUser(
          token,
          data
        );
      }

      setOk(
        editing
          ? "Usuario actualizado correctamente."
          : "Usuario creado correctamente."
      );

      reset();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  function association(user) {
    if (user.role === "vet") {
      return (
        clinics.find(
          (item) =>
            Number(item.id) ===
            Number(
              user.veterinary_id
            )
        )?.name || "-"
      );
    }

    if (user.role === "store") {
      return (
        stores.find(
          (item) =>
            Number(item.id) ===
            Number(user.store_id)
        )?.name || "-"
      );
    }

    return "-";
  }

  return (
    <Screen
      title="Usuarios"
      subtitle="Administración de cuentas y roles"
      back
      backTo="/admin"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <Input
        label="Buscar usuario"
        value={query}
        onChangeText={setQuery}
        placeholder="Nombre, correo, RUT o ciudad..."
      />

      <Button
        label={
          show
            ? "Cerrar formulario"
            : "Crear usuario"
        }
        onPress={() =>
          show
            ? reset()
            : setShow(true)
        }
      />

      {show ? (
        <Card>
          <Input
            label="Nombre"
            value={form.name}
            onChangeText={(value) =>
              set("name", value)
            }
          />

          <Input
            label="Correo"
            value={form.email}
            onChangeText={(value) =>
              set("email", value)
            }
            autoCapitalize="none"
          />
          <SelectField
            label="Rol"
            options={[
              { value: "owner", label: "Dueño" },
              { value: "vet", label: "Veterinaria" },
              { value: "store", label: "Tienda" },
              { value: "admin", label: "Admin" },
            ]}
            value={form.role}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                role: value,
                veterinary_id: value === "vet" ? current.veterinary_id : "",
                store_id: value === "store" ? current.store_id : "",
              }))
            }
          />

          {form.role === "vet" ? (
            <SelectField
              label="Veterinaria asociada"
              searchable
              options={clinics.map((clinic) => ({
                value: String(clinic.id),
                label: `${clinic.name} · ${clinic.commune || ""}`,
              }))}
              value={String(form.veterinary_id || "")}
              onChange={(value) => set("veterinary_id", value)}
            />
          ) : null}

          {form.role === "store" ? (
            <SelectField
              label="Tienda asociada"
              searchable
              options={stores.map((store) => ({
                value: String(store.id),
                label: `${store.name} · ${store.commune || ""}`,
              }))}
              value={String(form.store_id || "")}
              onChange={(value) => set("store_id", value)}
            />
          ) : null}

          <Input
            label="RUT"
            value={form.rut}
            onChangeText={(value) =>
              set("rut", value)
            }
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
            label="Fecha nacimiento"
            value={form.birth_date}
            onChangeText={(value) =>
              set(
                "birth_date",
                value
              )
            }
          />

          <Input
            label={
              editing
                ? "Nueva contraseña (opcional)"
                : "Contraseña"
            }
            secureTextEntry
            value={form.password}
            onChangeText={(value) =>
              set("password", value)
            }
          />

          <Input
            label="Confirmar contraseña"
            secureTextEntry
            value={
              form.confirm_password
            }
            onChangeText={(value) =>
              set(
                "confirm_password",
                value
              )
            }
          />

          <Button
            label="Guardar usuario"
            onPress={save}
          />
        </Card>
      ) : null}

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty
          icon="👥"
          title="Sin usuarios"
        />
      ) : (
        filtered.map((user) => (
          <Card key={user.id}>
            <View style={styles.userTop}>
              <AnimatedEmoji
                emoji={roleEmoji(
                  user.role
                )}
                size={34}
                motion="float"
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={
                    styles.userName
                  }
                >
                  {user.name}
                </Text>
                <Text
                  style={
                    styles.userRole
                  }
                >
                  {roleLabel(user.role)}
                </Text>
              </View>

              <Text
                style={styles.idPill}
              >
                ID {user.id}
              </Text>
            </View>

            <Row
              label="Correo"
              value={user.email}
            />
            <Row
              label="Ciudad"
              value={
                user.city ||
                "No registrada"
              }
            />
            <Row
              label="RUT"
              value={
                user.rut ||
                "No registrado"
              }
            />
            <Row
              label="Mascotas"
              value={petCount(user.id)}
            />

            <Button
              label="Ver perfil"
              variant="secondary"
              onPress={() =>
                setSelected(user)
              }
            />

            <Button
              label="Editar"
              variant="ghost"
              onPress={() =>
                edit(user)
              }
            />

            <Button
              label="Eliminar"
              variant="danger"
              onPress={() =>
                confirm(
                  "Eliminar usuario",
                  "Esta acción puede afectar datos asociados.",
                  async () => {
                    try {
                      await deleteAdminUser(
                        token,
                        user.id
                      );
                      await load();
                    } catch (e) {
                      setError(
                        e.message
                      );
                    }
                  }
                )
              }
            />
          </Card>
        ))
      )}

      <Modal
        visible={Boolean(selected)}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setSelected(null)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <ScrollView
              contentContainerStyle={{
                paddingBottom: 10,
              }}
            >
              <View style={styles.profileHero}>
                <AnimatedEmoji
                  emoji={roleEmoji(
                    selected?.role
                  )}
                  size={46}
                  motion="float"
                />

                <View style={{ flex: 1 }}>
                  <Text
                    style={
                      styles.profileRole
                    }
                  >
                    {roleLabel(
                      selected?.role
                    )}
                  </Text>
                  <Text
                    style={
                      styles.profileName
                    }
                  >
                    {selected?.name}
                  </Text>
                  <Text
                    style={
                      styles.profileEmail
                    }
                  >
                    {selected?.email}
                  </Text>
                </View>
              </View>

              <Row
                label="ID interno"
                value={selected?.id}
              />
              <Row
                label="RUT"
                value={
                  selected?.rut ||
                  "No registrado"
                }
              />
              <Row
                label="País"
                value={
                  selected?.country ||
                  "No registrado"
                }
              />
              <Row
                label="Región"
                value={
                  selected?.region ||
                  "No registrada"
                }
              />
              <Row
                label="Ciudad"
                value={
                  selected?.city ||
                  "No registrada"
                }
              />
              <Row
                label="Nacimiento"
                value={formatDate(
                  selected?.birth_date
                )}
              />
              <Row
                label="Mascotas"
                value={petCount(
                  selected?.id
                )}
              />

              {[
                "vet",
                "store",
              ].includes(
                selected?.role
              ) ? (
                <Row
                  label={
                    selected?.role ===
                    "vet"
                      ? "Veterinaria"
                      : "Tienda"
                  }
                  value={association(
                    selected
                  )}
                />
              ) : null}

              <Button
                label="Editar este usuario"
                onPress={() =>
                  edit(selected)
                }
              />

              <Button
                label="Cerrar perfil"
                variant="ghost"
                onPress={() =>
                  setSelected(null)
                }
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userTop: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  userName: {
    color: "#162850",
    fontSize: 18,
    fontWeight: "900",
  },
  userRole: {
    color: "#6AA896",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  idPill: {
    backgroundColor: "#E9F7F2",
    color: "#162850",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: "900",
  },
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(10,28,43,0.42)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    maxHeight: "86%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
  },
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  profileRole: {
    color: "#6AA896",
    fontWeight: "900",
    fontSize: 10,
    textTransform: "uppercase",
  },
  profileName: {
    color: "#162850",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 2,
  },
  profileEmail: {
    color: "#526A63",
    marginTop: 2,
  },
});
