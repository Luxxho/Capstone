import {
  useEffect,
  useState,
} from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  Button,
  Card,
  Empty,
  ErrorBox,
  Input,
  Loading,
  Row,
  Screen,
  SuccessBox,
} from "../../components/ui";
import SelectField from "../../components/SelectField";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";

import { useAuth } from "../../context/AuthContext";

import {
  deleteAdminPet,
  getAdminPets,
  getAdminUsers,
  getPetBreeds,
  registerPetBreed,
  updateAdminPet,
} from "../../services/api";

const SPECIES = [
  ["Perro", "🐶"],
  ["Gato", "🐱"],
  ["Conejo", "🐰"],
  ["Hámster", "🐹"],
  ["Cobayo", "🐭"],
  ["Hurón", "🦦"],
  ["Tortuga", "🐢"],
  ["Pez", "🐟"],
  ["Ave", "🐦"],
  ["Loro", "🦜"],
  ["Canario", "🐦"],
  ["Periquito", "🐦"],
  ["Agapornis", "🐦"],
  ["Gallina", "🐔"],
  ["Pato", "🦆"],
  ["Erizo", "🦔"],
  ["Chinchilla", "🐭"],
  ["Ratón", "🐭"],
  ["Rata doméstica", "🐭"],
  ["Iguana", "🦎"],
  ["Gecko", "🦎"],
  ["Serpiente", "🐍"],
  ["Rana", "🐸"],
  ["Ajolote", "🦎"],
  ["Araña", "🕷️"],
  ["Insecto", "🪲"],
  ["Cerdo miniatura", "🐷"],
  ["Otro", "🐾"],
];

const SPECIES_VALUES =
  SPECIES.map(([name]) => name);

const EMPTY = {
  name: "",
  species: "",
  species_other: "",
  breed: "",
  breed_other: "",
  age: "",
  age_months: "",
  weight: "",
};

function petEmoji(species) {
  const key = String(
    species || ""
  ).toLowerCase();

  const found =
    SPECIES.find(
      ([name]) =>
        name.toLowerCase() === key
    );

  return found?.[1] || "🐾";
}

function breedLabel(species) {
  const value = String(
    species || ""
  ).toLowerCase();

  if (
    value.includes("ave") ||
    value.includes("loro") ||
    value.includes("canario") ||
    value.includes("periquito")
  ) {
    return "Raza / variedad / tipo";
  }

  if (
    value.includes("pez") ||
    value.includes("tortuga") ||
    value.includes("iguana") ||
    value.includes("gecko") ||
    value.includes("serpiente")
  ) {
    return "Variedad / tipo";
  }

  return "Raza / variedad";
}

export default function AdminPets() {
  const { token } = useAuth();

  const [items, setItems] =
    useState([]);
  const [users, setUsers] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [editorOpen, setEditorOpen] =
    useState(false);
  const [editingPet, setEditingPet] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY);

  const [deleteTarget, setDeleteTarget] =
    useState(null);
  const [deleting, setDeleting] =
    useState(false);
  const [saving, setSaving] =
    useState(false);

  const [breedOptions, setBreedOptions] =
    useState([]);
  const [loadingBreeds, setLoadingBreeds] =
    useState(false);

  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [ok, setOk] =
    useState("");

  const effectiveSpecies =
    form.species === "Otro"
      ? form.species_other.trim()
      : form.species;

  async function load() {
    setLoading(true);

    try {
      const [pets, userRows] =
        await Promise.all([
          getAdminPets(token),
          getAdminUsers(token),
        ]);

      setItems(pets || []);
      setUsers(userRows || []);
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

  useEffect(() => {
    if (
      editorOpen &&
      effectiveSpecies &&
      form.species !== "Otro"
    ) {
      loadBreeds(
        effectiveSpecies
      );
    } else {
      setBreedOptions([]);
    }
  }, [
    editorOpen,
    form.species,
    form.species_other,
  ]);

  const owner = (id) =>
    users.find(
      (user) =>
        Number(user.id) ===
        Number(id)
    );

  async function loadBreeds(species) {
    if (!species) {
      setBreedOptions([]);
      return;
    }

    setLoadingBreeds(true);

    try {
      const rows =
        await getPetBreeds(
          token,
          species
        );

      setBreedOptions(
        (rows || [])
          .map((item) =>
            typeof item === "string"
              ? {
                  id: item,
                  name: item,
                }
              : item
          )
          .filter(
            (item) =>
              item?.name
          )
      );
    } catch {
      setBreedOptions([]);
    } finally {
      setLoadingBreeds(false);
    }
  }

  function openEdit(pet) {
    router.push({
      pathname:
        "/admin/pet-edit/[id]",
      params: {
        id: String(pet.id),
      },
    });
  }

  function closeEditor() {
    if (saving) return;

    setEditorOpen(false);
    setEditingPet(null);
    setForm(EMPTY);
    setBreedOptions([]);
  }

  async function saveEdit() {
    if (!editingPet) {
      return;
    }

    setError("");
    setOk("");

    if (
      !form.name.trim() ||
      !effectiveSpecies
    ) {
      setError(
        "La mascota debe tener nombre y especie."
      );
      return;
    }

    let selectedBreed =
      form.breed === "__other__"
        ? form.breed_other.trim()
        : form.breed.trim();

    if (
      form.breed === "__other__" &&
      selectedBreed.length < 2
    ) {
      setError(
        "Escribe una raza, variedad o tipo válido."
      );
      return;
    }

    const age =
      form.age === ""
        ? null
        : Number(form.age);

    const ageMonths =
      form.age_months === ""
        ? null
        : Number(
            form.age_months
          );

    const weight =
      form.weight === ""
        ? null
        : Number(form.weight);

    if (
      age != null &&
      (!Number.isFinite(age) ||
        age < 0)
    ) {
      setError(
        "La edad no es válida."
      );
      return;
    }

    if (
      ageMonths != null &&
      (!Number.isFinite(
        ageMonths
      ) ||
        ageMonths < 0 ||
        ageMonths > 11)
    ) {
      setError(
        "Los meses deben estar entre 0 y 11."
      );
      return;
    }

    if (
      weight != null &&
      (!Number.isFinite(weight) ||
        weight <= 0)
    ) {
      setError(
        "El peso debe ser mayor a 0."
      );
      return;
    }

    setSaving(true);

    try {
      if (
        form.breed === "__other__" &&
        selectedBreed
      ) {
        const registered =
          await registerPetBreed(
            token,
            effectiveSpecies,
            selectedBreed
          );

        selectedBreed =
          registered?.name ||
          selectedBreed;
      }

      await updateAdminPet(
        token,
        editingPet.id,
        {
          name:
            form.name.trim(),
          species:
            effectiveSpecies,
          breed:
            selectedBreed ||
            null,
          age,
          age_months:
            ageMonths,
          weight,
        }
      );

      setEditorOpen(false);
      setEditingPet(null);
      setForm(EMPTY);

      setOk(
        "Mascota actualizada correctamente por el administrador."
      );

      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(pet) {
    setError("");
    setOk("");
    setDeleteTarget(pet);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const name =
        deleteTarget.name;

      await deleteAdminPet(
        token,
        deleteTarget.id
      );

      setDeleteTarget(null);

      setOk(
        `${name} fue eliminado correctamente del sistema.`
      );

      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  const filtered =
    items.filter((pet) =>
      `${
        pet.name
      } ${
        pet.species
      } ${
        pet.breed || ""
      } ${
        owner(
          pet.owner_id
        )?.name || ""
      } ${
        owner(
          pet.owner_id
        )?.email || ""
      }`
        .toLowerCase()
        .includes(
          query.toLowerCase()
        )
    );

  const speciesOptions =
    SPECIES.map(
      ([name, emoji]) => ({
        value: name,
        label: `${emoji} ${name}`,
      })
    );

  const breedSelectOptions = [
    ...breedOptions.map(
      (item) => ({
        value: item.name,
        label: item.name,
      })
    ),
    {
      value: "__other__",
      label:
        "+ Otra raza / variedad...",
    },
  ];

  return (
    <Screen
      title="Mascotas del sistema"
      subtitle="Administra las mascotas registradas en VetMap"
      back
      backTo="/admin"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <Input
        label="Buscar mascota"
        value={query}
        onChangeText={setQuery}
        placeholder="Nombre, especie, raza o dueño..."
      />

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty
          icon="🐾"
          title="Sin mascotas"
          text="No hay mascotas que coincidan con la búsqueda."
        />
      ) : (
        filtered.map((pet) => {
          const petOwner =
            owner(pet.owner_id);

          return (
            <Card key={pet.id}>
              {pet.photo_data ? (
                <Image
                  source={{
                    uri:
                      pet.photo_data,
                  }}
                  style={
                    styles.petPhoto
                  }
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={
                    styles.petEmojiBox
                  }
                >
                  <AnimatedEmoji
                    emoji={petEmoji(
                      pet.species
                    )}
                    size={42}
                    motion="float"
                  />
                </View>
              )}

              <Text
                style={
                  styles.petName
                }
              >
                {pet.name}
              </Text>

              <View
                style={
                  styles.ownerBox
                }
              >
                <AnimatedEmoji
                  emoji="👤"
                  size={24}
                  motion="float"
                />

                <View
                  style={{ flex: 1 }}
                >
                  <Text
                    style={
                      styles.ownerName
                    }
                  >
                    {petOwner?.name ||
                      `Usuario #${pet.owner_id}`}
                  </Text>

                  <Text
                    style={
                      styles.ownerEmail
                    }
                  >
                    {petOwner?.email ||
                      "Correo no disponible"}
                  </Text>
                </View>
              </View>

              <Row
                label="Especie"
                value={pet.species}
              />

              <Row
                label="Raza / variedad"
                value={
                  pet.breed ||
                  "Sin especificar"
                }
              />

              <Row
                label="Edad"
                value={
                  pet.age != null
                    ? `${pet.age} años${
                        pet.age_months
                          ? ` · ${pet.age_months} meses`
                          : ""
                      }`
                    : "-"
                }
              />

              <Row
                label="Peso"
                value={
                  pet.weight
                    ? `${pet.weight} kg`
                    : "-"
                }
              />

              <Row
                label="ID mascota"
                value={pet.id}
              />

              <Button
                label="🩺 Gestión clínica"
                onPress={() =>
                  router.push({
                    pathname:
                      "/admin/pet/[id]",
                    params: {
                      id: String(
                        pet.id
                      ),
                    },
                  })
                }
              />

              <Button
                label="✏️ Editar mascota"
                variant="secondary"
                onPress={() =>
                  openEdit(pet)
                }
              />

              <Button
                label="🗑️ Eliminar mascota"
                variant="danger"
                onPress={() =>
                  requestDelete(pet)
                }
              />
            </Card>
          );
        })
      )}

      {/* MODAL EDITAR */}
      <Modal
        visible={editorOpen}
        transparent
        animationType="slide"
        onRequestClose={
          closeEditor
        }
      >
        <View
          style={styles.overlay}
        >
          <View
            style={
              styles.editorModal
            }
          >
            <ScrollView
              contentContainerStyle={
                styles.editorScroll
              }
            >
              <View
                style={
                  styles.modalHeader
                }
              >
                <AnimatedEmoji
                  emoji="✏️"
                  size={34}
                  motion="bounce"
                />

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    Editar mascota
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Modifica los datos generales de la mascota seleccionada.
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.adminNotice
                }
              >
                <Text
                  style={
                    styles.adminNoticeTitle
                  }
                >
                  🛡️ Edición administrativa
                </Text>

                <Text
                  style={
                    styles.adminNoticeText
                  }
                >
                  Estás modificando una mascota registrada por otro usuario.
                </Text>
              </View>

              {editingPet?.photo_data ? (
                <Image
                  source={{
                    uri:
                      editingPet.photo_data,
                  }}
                  style={
                    styles.modalPetPhoto
                  }
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={
                    styles.modalPetEmoji
                  }
                >
                  <AnimatedEmoji
                    emoji={petEmoji(
                      editingPet?.species
                    )}
                    size={48}
                    motion="float"
                  />
                </View>
              )}

              <Row
                label="Dueño"
                value={
                  owner(
                    editingPet?.owner_id
                  )?.name ||
                  `Usuario #${
                    editingPet?.owner_id ||
                    "-"
                  }`
                }
              />

              <Row
                label="Correo dueño"
                value={
                  owner(
                    editingPet?.owner_id
                  )?.email ||
                  "No disponible"
                }
              />

              <Input
                label="Nombre"
                value={form.name}
                onChangeText={(value) =>
                  setForm(
                    (current) => ({
                      ...current,
                      name: value,
                    })
                  )
                }
              />

              <SelectField
                label="Especie"
                placeholder="Selecciona una especie"
                options={
                  speciesOptions
                }
                value={
                  form.species
                }
                onChange={(value) =>
                  setForm(
                    (current) => ({
                      ...current,
                      species: value,
                      species_other:
                        "",
                      breed: "",
                      breed_other:
                        "",
                    })
                  )
                }
              />

              {form.species ===
              "Otro" ? (
                <Input
                  label="Especie personalizada"
                  value={
                    form.species_other
                  }
                  onChangeText={(
                    value
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        species_other:
                          value,
                        breed: "",
                        breed_other:
                          "",
                      })
                    )
                  }
                />
              ) : null}

              <SelectField
                label={breedLabel(
                  effectiveSpecies
                )}
                placeholder={
                  loadingBreeds
                    ? "Cargando opciones..."
                    : effectiveSpecies
                    ? "Selecciona una opción"
                    : "Primero selecciona una especie"
                }
                disabled={
                  !effectiveSpecies ||
                  loadingBreeds
                }
                options={
                  breedSelectOptions
                }
                value={form.breed}
                onChange={(value) =>
                  setForm(
                    (current) => ({
                      ...current,
                      breed: value,
                      breed_other:
                        value ===
                        "__other__"
                          ? current.breed_other
                          : "",
                    })
                  )
                }
              />

              {form.breed ===
              "__other__" ? (
                <Input
                  label="Nueva raza / variedad / tipo"
                  value={
                    form.breed_other
                  }
                  onChangeText={(
                    value
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        breed_other:
                          value,
                      })
                    )
                  }
                />
              ) : null}

              <View
                style={
                  styles.twoCols
                }
              >
                <View
                  style={
                    styles.col
                  }
                >
                  <Input
                    label="Edad en años"
                    keyboardType="numeric"
                    value={form.age}
                    onChangeText={(
                      value
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          age: value,
                        })
                      )
                    }
                  />
                </View>

                <View
                  style={
                    styles.col
                  }
                >
                  <Input
                    label="Meses adicionales"
                    keyboardType="numeric"
                    value={
                      form.age_months
                    }
                    onChangeText={(
                      value
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          age_months:
                            value,
                        })
                      )
                    }
                  />
                </View>
              </View>

              <Input
                label="Peso actual (kg)"
                keyboardType="numeric"
                value={form.weight}
                onChangeText={(value) =>
                  setForm(
                    (current) => ({
                      ...current,
                      weight: value,
                    })
                  )
                }
              />

              <Button
                label={
                  saving
                    ? "Guardando..."
                    : "Guardar cambios"
                }
                disabled={saving}
                onPress={saveEdit}
              />

              <Button
                label="Cancelar"
                variant="ghost"
                disabled={saving}
                onPress={
                  closeEditor
                }
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ALERTA PROPIA DE ELIMINACIÓN */}
      <Modal
        visible={Boolean(
          deleteTarget
        )}
        transparent
        animationType="fade"
        onRequestClose={() =>
          !deleting &&
          setDeleteTarget(null)
        }
      >
        <View
          style={
            styles.deleteOverlay
          }
        >
          <View
            style={
              styles.deleteModal
            }
          >
            <AnimatedEmoji
              emoji="⚠️"
              size={52}
              motion="pulse"
            />

            <Text
              style={
                styles.deleteTitle
              }
            >
              Eliminar mascota
            </Text>

            <Text
              style={
                styles.deleteMessage
              }
            >
              Como administrador vas a eliminar a{" "}
              <Text
                style={
                  styles.deletePetName
                }
              >
                {deleteTarget?.name}
              </Text>
              .
            </Text>

            <View
              style={
                styles.warningBox
              }
            >
              <Text
                style={
                  styles.warningText
                }
              >
                ⚠️ Esta acción es permanente y puede eliminar el historial clínico y otros registros asociados a esta mascota.
              </Text>
            </View>

            <View
              style={
                styles.ownerDeleteBox
              }
            >
              <Text
                style={
                  styles.ownerDeleteLabel
                }
              >
                Dueño
              </Text>

              <Text
                style={
                  styles.ownerDeleteName
                }
              >
                {owner(
                  deleteTarget?.owner_id
                )?.name ||
                  `Usuario #${
                    deleteTarget?.owner_id ||
                    "-"
                  }`}
              </Text>
            </View>

            <Button
              label="Cancelar"
              variant="secondary"
              disabled={deleting}
              onPress={() =>
                setDeleteTarget(null)
              }
            />

            <Button
              label={
                deleting
                  ? "Eliminando..."
                  : "Sí, eliminar definitivamente"
              }
              variant="danger"
              disabled={deleting}
              onPress={
                confirmDelete
              }
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles =
  StyleSheet.create({
    petPhoto: {
      width: 105,
      height: 105,
      borderRadius: 24,
      alignSelf: "center",
      marginBottom: 10,
      borderWidth: 2,
      borderColor: "#D8E7E3",
    },
    petEmojiBox: {
      width: 105,
      height: 105,
      borderRadius: 24,
      alignSelf: "center",
      marginBottom: 10,
      backgroundColor:
        "#E9F7F2",
      alignItems: "center",
      justifyContent: "center",
    },
    petName: {
      color: "#162850",
      fontSize: 20,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: 8,
    },
    ownerBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      backgroundColor:
        "#F3F8F6",
      borderRadius: 14,
      padding: 10,
      marginBottom: 8,
    },
    ownerName: {
      color: "#162850",
      fontWeight: "900",
    },
    ownerEmail: {
      color: "#526A63",
      fontSize: 11,
      marginTop: 2,
    },
    overlay: {
      flex: 1,
      backgroundColor:
        "rgba(10,28,43,0.50)",
      justifyContent: "center",
      padding: 14,
    },
    editorModal: {
      maxHeight: "94%",
      backgroundColor: "white",
      borderRadius: 24,
      overflow: "hidden",
    },
    editorScroll: {
      padding: 16,
      paddingBottom: 28,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    modalTitle: {
      color: "#162850",
      fontSize: 22,
      fontWeight: "900",
    },
    modalSubtitle: {
      color: "#526A63",
      marginTop: 3,
      lineHeight: 18,
    },
    adminNotice: {
      backgroundColor:
        "#EEF3FF",
      borderWidth: 1,
      borderColor:
        "#B9DDD2",
      borderRadius: 14,
      padding: 10,
      marginBottom: 12,
    },
    adminNoticeTitle: {
      color: "#162850",
      fontWeight: "900",
    },
    adminNoticeText: {
      color: "#526A63",
      fontSize: 11,
      marginTop: 3,
      lineHeight: 17,
    },
    modalPetPhoto: {
      width: 105,
      height: 105,
      borderRadius: 24,
      alignSelf: "center",
      marginBottom: 10,
      borderWidth: 2,
      borderColor: "#D8E7E3",
    },
    modalPetEmoji: {
      width: 105,
      height: 105,
      borderRadius: 24,
      alignSelf: "center",
      marginBottom: 10,
      backgroundColor:
        "#E9F7F2",
      alignItems: "center",
      justifyContent: "center",
    },
    twoCols: {
      flexDirection: "row",
      gap: 10,
    },
    col: {
      flex: 1,
    },
    deleteOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(24,20,20,0.58)",
      alignItems: "center",
      justifyContent: "center",
      padding: 22,
    },
    deleteModal: {
      width: "100%",
      maxWidth: 390,
      backgroundColor: "white",
      borderRadius: 26,
      padding: 22,
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#F2C8C8",
    },
    deleteTitle: {
      color: "#9B2626",
      fontSize: 23,
      fontWeight: "900",
      marginTop: 8,
      textAlign: "center",
    },
    deleteMessage: {
      color: "#354A46",
      fontSize: 15,
      textAlign: "center",
      lineHeight: 21,
      marginTop: 8,
    },
    deletePetName: {
      color: "#162850",
      fontWeight: "900",
    },
    warningBox: {
      width: "100%",
      backgroundColor:
        "#FFF2F2",
      borderWidth: 1,
      borderColor:
        "#F2C8C8",
      borderRadius: 14,
      padding: 11,
      marginTop: 12,
    },
    warningText: {
      color: "#8A3333",
      fontSize: 12,
      textAlign: "center",
      lineHeight: 18,
      fontWeight: "700",
    },
    ownerDeleteBox: {
      width: "100%",
      backgroundColor:
        "#F3F8F6",
      borderRadius: 14,
      padding: 10,
      marginTop: 10,
      marginBottom: 12,
    },
    ownerDeleteLabel: {
      color: "#526A63",
      fontSize: 10,
      fontWeight: "800",
      textTransform:
        "uppercase",
    },
    ownerDeleteName: {
      color: "#162850",
      fontWeight: "900",
      marginTop: 2,
    },
  });
