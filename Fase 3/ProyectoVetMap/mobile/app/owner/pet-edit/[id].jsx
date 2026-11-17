import {
  useEffect,
  useState,
} from "react";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ErrorBox,
  Loading,
  Screen,
  SuccessBox,
} from "../../../components/ui";
import PetEditorForm, {
  PET_EMPTY,
  PET_SPECIES_VALUES,
} from "../../../components/PetEditorForm";
import { useAuth } from "../../../context/AuthContext";
import {
  getPetBreeds,
  getPets,
  registerPetBreed,
  updatePet,
} from "../../../services/api";

export default function EditPet() {
  const { id } = useLocalSearchParams();
  const petId = Number(id);
  const { token } = useAuth();

  const [form, setForm] =
    useState(PET_EMPTY);
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

  async function loadPet() {
    setLoading(true);
    setError("");

    try {
      const pets =
        await getPets(token);

      const pet =
        pets.find(
          (item) =>
            Number(item.id) ===
            Number(petId)
        );

      if (!pet) {
        setError(
          "No se encontró la mascota."
        );
        return;
      }

      const known =
        PET_SPECIES_VALUES.includes(
          pet.species
        );

      setForm({
        ...PET_EMPTY,
        name: pet.name || "",
        species: known
          ? pet.species
          : "Otro",
        species_other: known
          ? ""
          : pet.species || "",
        breed: pet.breed || "",
        age: String(
          pet.age ?? ""
        ),
        age_months: String(
          pet.age_months ?? ""
        ),
        weight: String(
          pet.weight ?? ""
        ),
        birth_date:
          pet.birth_date || "",
        feeding_info:
          pet.feeding_info || "",
        medical_background:
          pet.medical_background ||
          "",
        additional_info:
          pet.additional_info || "",
        photo_data:
          pet.photo_data || null,
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
    loadPet();
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
        "Debes ingresar nombre y especie."
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

      await updatePet(
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
          age_months: ageMonths,
          weight,
          birth_date:
            form.birth_date || null,
          feeding_info:
            form.feeding_info || null,
          medical_background:
            form.medical_background ||
            null,
          additional_info:
            form.additional_info ||
            null,
          photo_data:
            form.photo_data || null,
        }
      );

      setOk(
        "Mascota actualizada correctamente."
      );

      setTimeout(() => {
        router.replace({
          pathname:
            "/owner/pet/[id]",
          params: {
            id: String(petId),
          },
        });
      }, 550);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      title="Editar mascota"
      subtitle="Modifica su perfil general"
      back
      backTo={`/owner/pet/${petId}`}
      showBottomNav={false}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      {loading ? (
        <Loading />
      ) : (
        <PetEditorForm
          form={form}
          setForm={setForm}
          effectiveSpecies={
            effectiveSpecies
          }
          breedOptions={
            breedOptions
          }
          loadingBreeds={
            loadingBreeds
          }
          saving={saving}
          editing
          onSave={save}
          onCancel={() =>
            router.replace({
              pathname:
                "/owner/pet/[id]",
              params: {
                id: String(petId),
              },
            })
          }
          onError={setError}
        />
      )}
    </Screen>
  );
}
