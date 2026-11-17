import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Button,
  COLORS,
  Input,
} from "./ui";
import ImageField from "./ImageField";
import SelectField from "./SelectField";
import { AnimatedEmoji } from "./AnimatedEmoji";

export const PET_SPECIES = [
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

export const PET_SPECIES_VALUES =
  PET_SPECIES.map(([name]) => name);

export const PET_EMPTY = {
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

export function petBreedLabel(species) {
  const value = String(species || "").toLowerCase();

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

export default function PetEditorForm({
  form,
  setForm,
  effectiveSpecies,
  breedOptions,
  loadingBreeds,
  saving,
  editing = false,
  onSave,
  onCancel,
  onError,
}) {
  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  const speciesOptions =
    PET_SPECIES.map(
      ([name, emoji]) => ({
        value: name,
        label: `${emoji} ${name}`,
      })
    );

  const breedSelectOptions = [
    ...(breedOptions || []).map(
      (item) => ({
        value: item.name,
        label: item.name,
      })
    ),
    {
      value: "__other__",
      label: "+ Otra raza / variedad...",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <AnimatedEmoji
            emoji={editing ? "✏️" : "🐾"}
            size={34}
            motion="float"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.heroKicker}>
            {editing
              ? "EDITAR MASCOTA"
              : "NUEVA MASCOTA"}
          </Text>
          <Text style={styles.heroTitle}>
            {editing
              ? `Actualiza los datos de ${form.name || "tu mascota"}`
              : "Registra un nuevo compañero"}
          </Text>
          <Text style={styles.heroText}>
            Los datos clínicos se mantienen separados de esta ficha general.
          </Text>
        </View>
      </View>

      <View style={styles.photoCard}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>01</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>
              Fotografía
            </Text>
            <Text style={styles.sectionText}>
              Usa una foto clara para reconocerla rápidamente.
            </Text>
          </View>
        </View>

        <ImageField
          label="Foto de la mascota"
          value={form.photo_data}
          onChange={(value) =>
            set("photo_data", value)
          }
          onError={onError}
        />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>02</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>
              Información general
            </Text>
            <Text style={styles.sectionText}>
              Nombre, especie y raza o variedad.
            </Text>
          </View>
        </View>

        <Input
          label="Nombre"
          placeholder="Ej.: Max"
          value={form.name}
          onChangeText={(value) =>
            set("name", value)
          }
        />

        <SelectField
          label="Especie"
          placeholder="Selecciona una especie"
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
              ? "Cargando opciones..."
              : effectiveSpecies
              ? "Selecciona una opción"
              : "Primero selecciona una especie"
          }
          disabled={
            !effectiveSpecies ||
            loadingBreeds
          }
          options={breedSelectOptions}
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
              set("breed_other", value)
            }
          />
        ) : null}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>03</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>
              Edad y condición actual
            </Text>
            <Text style={styles.sectionText}>
              Mantén estos datos actualizados para su seguimiento.
            </Text>
          </View>
        </View>

        <View style={styles.twoCols}>
          <View style={styles.col}>
            <Input
              label="Edad en años"
              keyboardType="numeric"
              value={form.age}
              onChangeText={(value) =>
                set("age", value)
              }
            />
          </View>

          <View style={styles.col}>
            <Input
              label="Meses adicionales"
              keyboardType="numeric"
              value={form.age_months}
              onChangeText={(value) =>
                set("age_months", value)
              }
            />
          </View>
        </View>

        <Input
          label="Peso actual (kg)"
          keyboardType="numeric"
          value={form.weight}
          onChangeText={(value) =>
            set("weight", value)
          }
        />

        <Input
          label="Fecha de nacimiento"
          placeholder="AAAA-MM-DD"
          value={form.birth_date}
          onChangeText={(value) =>
            set("birth_date", value)
          }
        />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>04</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>
              Cuidados y antecedentes
            </Text>
            <Text style={styles.sectionText}>
              Información útil para veterinarios y para tu propia referencia.
            </Text>
          </View>
        </View>

        <Input
          label="Alimentación"
          multiline
          value={form.feeding_info}
          onChangeText={(value) =>
            set("feeding_info", value)
          }
        />

        <Input
          label="Antecedentes médicos"
          multiline
          value={form.medical_background}
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
          value={form.additional_info}
          onChangeText={(value) =>
            set(
              "additional_info",
              value
            )
          }
        />
      </View>

      <View style={styles.actions}>
        <Button
          label={
            saving
              ? "Guardando..."
              : editing
              ? "✓ Guardar cambios"
              : "＋ Registrar mascota"
          }
          disabled={saving}
          onPress={onSave}
        />

        <Button
          label="Volver sin guardar"
          variant="ghost"
          disabled={saving}
          onPress={onCancel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  hero: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#DFF8F5",
    borderWidth: 1,
    borderColor: "#BFE8E3",
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  heroKicker: {
    color: "#078F8A",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#102A56",
    fontSize: 20,
    lineHeight: 23,
    fontWeight: "900",
    marginTop: 2,
  },
  heroText: {
    color: "#526A63",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  photoCard: {
    borderRadius: 22,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCECEA",
  },
  sectionCard: {
    borderRadius: 22,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCECEA",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 11,
  },
  sectionNumber: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DFF8F5",
  },
  sectionNumberText: {
    color: "#078F8A",
    fontSize: 10,
    fontWeight: "900",
  },
  sectionTitle: {
    color: "#102A56",
    fontSize: 15,
    fontWeight: "900",
  },
  sectionText: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },
  twoCols: {
    flexDirection: "row",
    gap: 9,
  },
  col: {
    flex: 1,
  },
  actions: {
    borderRadius: 20,
    padding: 12,
    backgroundColor: "#F4FBF8",
    borderWidth: 1,
    borderColor: "#DCECEA",
    gap: 5,
  },
});
