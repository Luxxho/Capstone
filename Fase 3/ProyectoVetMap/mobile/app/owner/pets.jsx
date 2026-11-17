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
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import {
  Button,
  Card,
  COLORS,
  Empty,
  ErrorBox,
  Input,
  Loading,
  Row,
  Screen,
  SectionTitle,
  SuccessBox,
} from "../../components/ui";
import SelectField from "../../components/SelectField";
import ImageField from "../../components/ImageField";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { useAuth } from "../../context/AuthContext";

import {
  createPet,
  deletePet,
  getPetBreeds,
  getPets,
  registerPetBreed,
  updatePet,
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
  birth_date: "",
  feeding_info: "",
  medical_background: "",
  additional_info: "",
  photo_data: null,
};

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

export default function Pets() {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const [handledEditParam, setHandledEditParam] = useState("");
  const [handledCreateParam, setHandledCreateParam] = useState("");

  const [items, setItems] =
    useState([]);

  const [editorOpen, setEditorOpen] =
    useState(false);
  const [editingId, setEditingId] =
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

  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  const effectiveSpecies =
    form.species === "Otro"
      ? form.species_other.trim()
      : form.species;

  async function load() {
    setLoading(true);

    try {
      const rows =
        await getPets(token);

      setItems(rows || []);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

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
            (item) => item?.name
          )
      );
    } catch {
      setBreedOptions([]);
    } finally {
      setLoadingBreeds(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const requested =
      params?.edit_id
        ? String(params.edit_id)
        : "";

    if (!requested) return;

    router.replace({
      pathname:
        "/owner/pet-edit/[id]",
      params: {
        id: requested,
      },
    });
  }, [params?.edit_id]);

  useEffect(() => {
    if (!params?.create) return;

    router.replace(
      "/owner/pet-new"
    );
  }, [params?.create]);

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

  function openNew() {
    router.push(
      "/owner/pet-new"
    );
  }

  function openEdit(pet) {
    router.push({
      pathname:
        "/owner/pet-edit/[id]",
      params: {
        id: String(pet.id),
      },
    });
  }

  function closeEditor() {
    if (saving) return;

    setEditorOpen(false);
    setEditingId(null);
    setForm(EMPTY);
    setBreedOptions([]);

    if (params?.edit_id || params?.create) {
      router.replace("/owner/pets");
    }
  }

  async function save() {
    setError("");
    setOk("");

    if (
      !form.name.trim() ||
      !effectiveSpecies
    ) {
      setError(
        "Debes ingresar al menos el nombre y la especie."
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

      const data = {
        name: form.name.trim(),
        species:
          effectiveSpecies,
        breed:
          selectedBreed || null,
        age,
        age_months: ageMonths,
        weight,
        birth_date:
          form.birth_date ||
          null,
        feeding_info:
          form.feeding_info ||
          null,
        medical_background:
          form.medical_background ||
          null,
        additional_info:
          form.additional_info ||
          null,
        photo_data:
          form.photo_data ||
          null,
      };

      if (editingId) {
        await updatePet(
          token,
          editingId,
          data
        );

        setOk(
          "Mascota actualizada correctamente."
        );
      } else {
        await createPet(
          token,
          data
        );

        setOk(
          "Mascota registrada correctamente."
        );
      }

      setEditorOpen(false);
      setEditingId(null);
      setForm(EMPTY);
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
      const petName =
        deleteTarget.name;

      await deletePet(
        token,
        deleteTarget.id
      );

      setDeleteTarget(null);
      setOk(
        `${petName} fue eliminado correctamente.`
      );

      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

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
      title="Mis mascotas"
      subtitle="Registra, edita y administra tus mascotas"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <View style={styles.petsHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nativeKicker}>PERFILES</Text>
          <Text style={styles.nativeIntro}>Toca una mascota para abrir su ficha clínica.</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={openNew}
          style={styles.fabTop}
        >
          <Text style={styles.fabTopText}>＋</Text>
        </TouchableOpacity>
      </View>

      {items.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avatarStrip}
        >
          {items.map((pet) => (
            <TouchableOpacity
              key={`avatar-${pet.id}`}
              activeOpacity={0.84}
              style={styles.avatarItem}
              onPress={() =>
                router.push({
                  pathname: "/owner/pet/[id]",
                  params: { id: String(pet.id) },
                })
              }
            >
              <View style={styles.avatarCircle}>
                {pet.photo_data ? (
                  <Image
                    source={{ uri: pet.photo_data }}
                    style={styles.avatarPhoto}
                  />
                ) : (
                  <AnimatedEmoji
                    emoji={petEmoji(pet.species)}
                    size={34}
                    motion="float"
                  />
                )}
              </View>
              <Text style={styles.avatarName} numberOfLines={1}>{pet.name}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            activeOpacity={0.84}
            style={styles.avatarItem}
            onPress={openNew}
          >
            <View style={[styles.avatarCircle, styles.avatarAdd]}>
              <Text style={styles.avatarAddText}>＋</Text>
            </View>
            <Text style={styles.avatarName}>Agregar</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty
          icon="🐾"
          title="Aún no tienes mascotas"
          text="Agrega tu primera mascota para comenzar."
        />
      ) : (
        items.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            activeOpacity={0.88}
            style={styles.nativePetCard}
            onPress={() =>
              router.push({
                pathname: "/owner/pet/[id]",
                params: { id: String(pet.id) },
              })
            }
          >
            {pet.photo_data ? (
              <Image
                source={{ uri: pet.photo_data }}
                style={styles.nativePetPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.nativePetFallback}>
                <AnimatedEmoji
                  emoji={petEmoji(pet.species)}
                  size={46}
                  motion="float"
                />
              </View>
            )}

            <View style={styles.nativePetBody}>
              <Text style={styles.nativePetName}>{pet.name}</Text>
              <Text style={styles.nativePetMeta}>
                {pet.breed || pet.species || "Mascota"}
              </Text>
              <Text style={styles.nativePetAge}>
                {pet.age != null
                  ? `${pet.age} año${Number(pet.age) === 1 ? "" : "s"}${pet.age_months ? ` · ${pet.age_months} meses` : ""}`
                  : "Edad sin registrar"}
              </Text>

              <View style={styles.nativePetActions}>
                <TouchableOpacity
                  style={styles.nativeAction}
                  onPress={(event) => {
                    event.stopPropagation?.();
                    openEdit(pet);
                  }}
                >
                  <Text style={styles.nativeActionText}>✏️ Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.nativeAction, styles.nativeDelete]}
                  onPress={(event) => {
                    event.stopPropagation?.();
                    requestDelete(pet);
                  }}
                >
                  <Text style={styles.nativeDeleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.nativeChevron}>›</Text>
          </TouchableOpacity>
        ))
      )}

      {/* MODAL CREAR / EDITAR */}
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
                  emoji={
                    editingId
                      ? "✏️"
                      : "🐾"
                  }
                  size={34}
                  motion="bounce"
                />

                <View
                  style={{ flex: 1 }}
                >
                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    {editingId
                      ? "Editar mascota"
                      : "Nueva mascota"}
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    {editingId
                      ? "Modifica los datos y guarda los cambios."
                      : "Completa los datos de tu mascota."}
                  </Text>
                </View>
              </View>

              <ImageField
                label="Fotografía"
                value={
                  form.photo_data
                }
                onChange={(value) =>
                  set(
                    "photo_data",
                    value
                  )
                }
                onError={setError}
              />

              <Input
                label="Nombre"
                placeholder="Ej: Max"
                value={form.name}
                onChangeText={(value) =>
                  set(
                    "name",
                    value
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
                      breed_other: "",
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
                    set(
                      "breed_other",
                      value
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
                  style={styles.col}
                >
                  <Input
                    label="Edad en años"
                    keyboardType="numeric"
                    value={
                      form.age
                    }
                    onChangeText={(
                      value
                    ) =>
                      set(
                        "age",
                        value
                      )
                    }
                  />
                </View>

                <View
                  style={styles.col}
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
                      set(
                        "age_months",
                        value
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
                  set(
                    "weight",
                    value
                  )
                }
              />

              <Input
                label="Fecha de nacimiento"
                placeholder="AAAA-MM-DD"
                value={
                  form.birth_date
                }
                onChangeText={(value) =>
                  set(
                    "birth_date",
                    value
                  )
                }
              />

              <Input
                label="Alimentación"
                multiline
                value={
                  form.feeding_info
                }
                onChangeText={(value) =>
                  set(
                    "feeding_info",
                    value
                  )
                }
              />

              <Input
                label="Antecedentes médicos"
                multiline
                value={
                  form.medical_background
                }
                onChangeText={(value) =>
                  set(
                    "medical_background",
                    value
                  )
                }
              />

              <Input
                label="Información adicional"
                multiline
                value={
                  form.additional_info
                }
                onChangeText={(value) =>
                  set(
                    "additional_info",
                    value
                  )
                }
              />

              <Button
                label={
                  saving
                    ? "Guardando..."
                    : editingId
                    ? "Guardar cambios"
                    : "Registrar mascota"
                }
                disabled={saving}
                onPress={save}
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
              ¿Estás seguro de eliminar a{" "}
              <Text
                style={
                  styles.deletePetName
                }
              >
                {deleteTarget?.name}
              </Text>
              ?
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
                Esta acción es permanente y también eliminará los datos e historial asociados a esta mascota.
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
    petsHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 2,
    },
    nativeKicker: {
      color: COLORS.mint700,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.2,
    },
    nativeIntro: {
      color: COLORS.muted,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 2,
    },
    fabTop: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#22B9B5",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.text,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    fabTopText: {
      color: "white",
      fontSize: 30,
      lineHeight: 32,
      fontWeight: "500",
    },
    avatarStrip: {
      gap: 12,
      paddingVertical: 4,
      paddingRight: 4,
    },
    avatarItem: {
      width: 64,
      alignItems: "center",
    },
    avatarCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: COLORS.mint100,
      borderWidth: 2,
      borderColor: "#29BBB6",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarPhoto: {
      width: "100%",
      height: "100%",
    },
    avatarAdd: {
      borderStyle: "dashed",
      borderColor: COLORS.mint500,
      backgroundColor: "white",
    },
    avatarAddText: {
      color: COLORS.mint600,
      fontSize: 28,
      fontWeight: "500",
    },
    avatarName: {
      color: COLORS.navy,
      fontSize: 10,
      fontWeight: "800",
      marginTop: 4,
      maxWidth: 64,
    },
    nativePetCard: {
      minHeight: 118,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: "white",
      borderRadius: 22,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: 10,
      shadowColor: COLORS.text,
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
    nativePetPhoto: {
      width: 96,
      height: 96,
      borderRadius: 18,
      backgroundColor: COLORS.mint100,
    },
    nativePetFallback: {
      width: 96,
      height: 96,
      borderRadius: 18,
      backgroundColor: COLORS.mint100,
      alignItems: "center",
      justifyContent: "center",
    },
    nativePetBody: {
      flex: 1,
      minWidth: 0,
    },
    nativePetName: {
      color: COLORS.navy,
      fontSize: 18,
      fontWeight: "900",
    },
    nativePetMeta: {
      color: COLORS.mint700,
      fontSize: 11,
      fontWeight: "800",
      marginTop: 3,
    },
    nativePetAge: {
      color: COLORS.muted,
      fontSize: 10,
      marginTop: 3,
    },
    nativePetActions: {
      flexDirection: "row",
      gap: 6,
      marginTop: 8,
    },
    nativeAction: {
      minHeight: 30,
      borderRadius: 10,
      backgroundColor: COLORS.mint100,
      paddingHorizontal: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    nativeActionText: {
      color: COLORS.mint700,
      fontSize: 10,
      fontWeight: "900",
    },
    nativeDelete: {
      backgroundColor: "#FFF0F0",
      minWidth: 36,
    },
    nativeDeleteText: {
      color: COLORS.danger,
      fontSize: 14,
    },
    nativeChevron: {
      color: COLORS.mint600,
      fontSize: 28,
      fontWeight: "900",
      marginLeft: 1,
    },
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
      marginBottom: 14,
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
      borderColor: "#F2C8C8",
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
      backgroundColor: "#FFF2F2",
      borderWidth: 1,
      borderColor: "#F2C8C8",
      borderRadius: 14,
      padding: 11,
      marginTop: 12,
      marginBottom: 12,
    },
    warningText: {
      color: "#8A3333",
      fontSize: 12,
      textAlign: "center",
      lineHeight: 18,
      fontWeight: "700",
    },
  });
