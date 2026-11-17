import {
  useEffect,
  useState,
} from "react";
import { router } from "expo-router";

import {
  ErrorBox,
  Screen,
  SuccessBox,
} from "../../components/ui";
import PetEditorForm, {
  PET_EMPTY,
} from "../../components/PetEditorForm";
import { useAuth } from "../../context/AuthContext";
import {
  createPet,
  getPetBreeds,
  registerPetBreed,
} from "../../services/api";

export default function NewPet() {
  const { token } = useAuth();

  const [form, setForm] =
    useState(PET_EMPTY);
  const [breedOptions, setBreedOptions] =
    useState([]);
  const [loadingBreeds, setLoadingBreeds] =
    useState(false);
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

      await createPet(token, {
        name: form.name.trim(),
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
      });

      setOk(
        "Mascota registrada correctamente."
      );

      setTimeout(() => {
        router.replace("/owner/pets");
      }, 550);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      title="Nueva mascota"
      subtitle="Crea su perfil en VetMap"
      back
      backTo="/owner/pets"
      showBottomNav={false}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <PetEditorForm
        form={form}
        setForm={setForm}
        effectiveSpecies={
          effectiveSpecies
        }
        breedOptions={breedOptions}
        loadingBreeds={
          loadingBreeds
        }
        saving={saving}
        onSave={save}
        onCancel={() =>
          router.replace(
            "/owner/pets"
          )
        }
        onError={setError}
      />
    </Screen>
  );
}
