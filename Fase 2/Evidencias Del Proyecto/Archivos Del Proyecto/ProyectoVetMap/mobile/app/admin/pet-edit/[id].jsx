import {
  useEffect,
  useState,
} from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  Button,
  COLORS,
  ErrorBox,
  Input,
  Loading,
  Row,
  Screen,
  SuccessBox,
} from "../../../components/ui";
import SelectField from "../../../components/SelectField";
import { AnimatedEmoji } from "../../../components/AnimatedEmoji";
import {
  PET_SPECIES,
  PET_SPECIES_VALUES,
  petBreedLabel,
} from "../../../components/PetEditorForm";
import { useAuth } from "../../../context/AuthContext";
import {
  getAdminPets,
  getAdminUsers,
  getPetBreeds,
  registerPetBreed,
  updateAdminPet,
} from "../../../services/api";

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

export default function AdminPetEdit() {
  const { id } = useLocalSearchParams();
  const petId = Number(id);
  const { token } = useAuth();

  const [pet, setPet] =
    useState(null);
  const [owner, setOwner] =
    useState(null);
  const [form, setForm] =
    useState(EMPTY);
  const [breedOptions, setBreedOptions] =
    useState([]);
  const [loadingBreeds, setLoadingBreeds] =
    useState(false);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
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
      const [pets, users] =
        await Promise.all([
          getAdminPets(token),
          getAdminUsers(token),
        ]);

      const found =
        (pets || []).find(
          (item) =>
            Number(item.id) ===
            petId
        );

      if (!found) {
        setError(
          "No se encontró la mascota."
        );
        return;
      }

      const petOwner =
        (users || []).find(
          (user) =>
            Number(user.id) ===
            Number(found.owner_id)
        ) || null;

      const known =
        PET_SPECIES_VALUES.includes(
          found.species
        );

      setPet(found);
      setOwner(petOwner);

      setForm({
        name: found.name || "",
        species: known
          ? found.species
          : "Otro",
        species_other: known
          ? ""
          : found.species || "",
        breed: found.breed || "",
        breed_other: "",
        age: String(
          found.age ?? ""
        ),
        age_months: String(
          found.age_months ?? ""
        ),
        weight: String(
          found.weight ?? ""
        ),
      });
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
  }, [petId]);

  useEffect(() => {
    if (
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
    form.species,
    form.species_other,
  ]);

  async function save() {
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
        : Number(form.age_months);
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
      (!Number.isFinite(ageMonths) ||
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
        petId,
        {
          name:
            form.name.trim(),
          species:
            effectiveSpecies,
          breed:
            selectedBreed || null,
          age,
          age_months:
            ageMonths,
          weight,
        }
      );

      setOk(
        "Mascota actualizada por el administrador."
      );

      setTimeout(() => {
        router.replace(
          "/admin/pets"
        );
      }, 500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const speciesOptions =
    PET_SPECIES.map(
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
      title="Editar mascota"
      subtitle="Edición administrativa"
      back
      backTo="/admin/pets"
      showBottomNav={false}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      {loading ? (
        <Loading />
      ) : (
        <>
          <View style={styles.hero}>
            {pet?.photo_data ? (
              <Image
                source={{
                  uri: pet.photo_data,
                }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoFallback}>
                <AnimatedEmoji
                  emoji="🐾"
                  size={46}
                  motion="float"
                />
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>
                🛡️ EDICIÓN ADMINISTRATIVA
              </Text>
              <Text style={styles.title}>
                {pet?.name}
              </Text>
              <Text style={styles.subtitle}>
                Modifica únicamente los datos generales permitidos.
              </Text>
            </View>
          </View>

          <View style={styles.ownerCard}>
            <Text style={styles.sectionTitle}>
              Dueño de la mascota
            </Text>
            <Row
              label="Nombre"
              value={
                owner?.name ||
                `Usuario #${pet?.owner_id}`
              }
            />
            <Row
              label="Correo"
              value={
                owner?.email ||
                "No disponible"
              }
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>
              Información general
            </Text>

            <Input
              label="Nombre"
              value={form.name}
              onChangeText={(value) =>
                setForm((current) => ({
                  ...current,
                  name: value,
                }))
              }
            />

            <SelectField
              label="Especie"
              options={speciesOptions}
              value={form.species}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  species: value,
                  species_other: "",
                  breed: "",
                  breed_other: "",
                }))
              }
            />

            {form.species === "Otro" ? (
              <Input
                label="Especie personalizada"
                value={form.species_other}
                onChangeText={(value) =>
                  setForm((current) => ({
                    ...current,
                    species_other: value,
                    breed: "",
                    breed_other: "",
                  }))
                }
              />
            ) : null}

            <SelectField
              label={petBreedLabel(
                effectiveSpecies
              )}
              placeholder={
                loadingBreeds
                  ? "Cargando..."
                  : "Selecciona una opción"
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
                setForm((current) => ({
                  ...current,
                  breed: value,
                  breed_other:
                    value === "__other__"
                      ? current.breed_other
                      : "",
                }))
              }
            />

            {form.breed === "__other__" ? (
              <Input
                label="Nueva raza / variedad / tipo"
                value={form.breed_other}
                onChangeText={(value) =>
                  setForm((current) => ({
                    ...current,
                    breed_other: value,
                  }))
                }
              />
            ) : null}

            <View style={styles.twoCols}>
              <View style={styles.col}>
                <Input
                  label="Años"
                  keyboardType="numeric"
                  value={form.age}
                  onChangeText={(value) =>
                    setForm((current) => ({
                      ...current,
                      age: value,
                    }))
                  }
                />
              </View>

              <View style={styles.col}>
                <Input
                  label="Meses"
                  keyboardType="numeric"
                  value={form.age_months}
                  onChangeText={(value) =>
                    setForm((current) => ({
                      ...current,
                      age_months: value,
                    }))
                  }
                />
              </View>
            </View>

            <Input
              label="Peso actual (kg)"
              keyboardType="numeric"
              value={form.weight}
              onChangeText={(value) =>
                setForm((current) => ({
                  ...current,
                  weight: value,
                }))
              }
            />
          </View>

          <Button
            label={
              saving
                ? "Guardando..."
                : "✓ Guardar cambios"
            }
            disabled={saving}
            onPress={save}
          />

          <Button
            label="Volver sin guardar"
            variant="ghost"
            disabled={saving}
            onPress={() =>
              router.replace(
                "/admin/pets"
              )
            }
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: 22,
    backgroundColor: "#E8F4FF",
    borderWidth: 1,
    borderColor: "#CFE0F0",
  },
  photo: {
    width: 82,
    height: 82,
    borderRadius: 22,
  },
  photoFallback: {
    width: 82,
    height: 82,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  kicker: {
    color: "#315F9F",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  title: {
    color: COLORS.navy,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 3,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  ownerCard: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#F4FBF8",
    borderWidth: 1,
    borderColor: "#DCECEA",
  },
  formCard: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCECEA",
  },
  sectionTitle: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 9,
  },
  twoCols: {
    flexDirection: "row",
    gap: 9,
  },
  col: {
    flex: 1,
  },
});
