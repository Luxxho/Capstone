export function uniqueOptions(...groups) {
  const result = [];
  const seen = new Set();

  for (const group of groups) {
    for (const raw of group || []) {
      const value = String(raw ?? "").trim();

      if (!value) continue;

      const key = value.toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        result.push(value);
      }
    }
  }

  return result;
}

export function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function addDaysISO(dateValue, days) {
  if (!dateValue || !days) return "";

  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + Number(days));

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function vaccinePresetsForSpecies(species) {
  const value = normalizeText(species);

  if (value.includes("perro")) {
    return [
      "Antirrábica",
      "Séxtuple canina",
      "Óctuple canina",
      "Polivalente canina",
      "Bordetella",
      "Leptospirosis",
    ];
  }

  if (value.includes("gato")) {
    return [
      "Antirrábica",
      "Triple felina",
      "Leucemia felina",
    ];
  }

  if (value.includes("conejo")) {
    return [
      "Mixomatosis",
      "Enfermedad hemorrágica viral",
    ];
  }

  return [];
}

export const CONSULTATION_REASON_PRESETS = [
  "Control general",
];

export const DOSE_PRESETS = [
  "1/4 comprimido",
  "1/2 comprimido",
  "1 comprimido",
  "2 comprimidos",
  "0,5 mL",
  "1 mL",
  "2 mL",
  "5 mL",
];

export const FREQUENCY_PRESETS = [
  "Cada 8 horas",
  "Cada 12 horas",
  "Cada 24 horas",
  "1 vez al día",
  "2 veces al día",
  "Día por medio",
  "Semanal",
];

export const DURATION_PRESETS = [
  "3 días",
  "5 días",
  "7 días",
  "10 días",
  "14 días",
  "21 días",
  "30 días",
];

export const INSTRUCTION_PRESETS = [
  "Administrar con alimento.",
  "Administrar después de comer.",
  "Mantener agua disponible.",
  "No suspender sin indicación veterinaria.",
  "Control veterinario al finalizar el tratamiento.",
  "Volver antes si presenta molestias o una reacción inesperada.",
];

export const VACCINE_INTERVAL_PRESETS = [
  { value: "", label: "Sin intervalo" },
  { value: "15", label: "15 días" },
  { value: "21", label: "21 días" },
  { value: "30", label: "30 días" },
  { value: "180", label: "6 meses" },
  { value: "365", label: "12 meses" },
  { value: "manual", label: "Fecha manual" },
];

export const MEDICATION_DURATION_DAYS = [
  { value: "", label: "Sin duración" },
  { value: "3", label: "3 días" },
  { value: "5", label: "5 días" },
  { value: "7", label: "7 días" },
  { value: "10", label: "10 días" },
  { value: "14", label: "14 días" },
  { value: "21", label: "21 días" },
  { value: "30", label: "30 días" },
  { value: "manual", label: "Fecha manual" },
];

export const PRODUCT_CATEGORY_PRESETS = [
  "Alimento",
  "Snack / Premio",
  "Higiene",
  "Salud y cuidado",
  "Accesorio",
  "Juguete",
  "Arena / Sustrato",
  "Transporte",
  "Cama / Descanso",
];

export const PRODUCT_ANIMAL_PRESETS = [
  "Perro",
  "Gato",
  "Conejo",
  "Ave",
  "Pez",
  "Tortuga",
  "Iguana / Reptil",
  "Roedor",
  "Multi-especie",
];

export const PRODUCT_FORMAT_PRESETS = [
  "250 g",
  "500 g",
  "1 kg",
  "2 kg",
  "3 kg",
  "5 kg",
  "10 kg",
  "15 kg",
  "20 kg",
  "1 unidad",
  "Pack x2",
  "Pack x3",
  "Pack x6",
  "100 mL",
  "250 mL",
  "500 mL",
  "1 L",
];


export const REMINDER_TIME_PRESETS = [
  "08:00",
  "20:00",
  "08:00,20:00",
  "08:00,16:00,00:00",
  "07:00,19:00",
];

export const OWNER_CONSULTATION_PRESETS = [
  "Control general",
  "Vacunación",
  "Desparasitación",
  "Control postoperatorio",
  "Seguimiento de tratamiento",
  "Problema digestivo",
  "Problema dermatológico",
  "Dolor o cojera",
  "Control de peso",
  "Urgencia",
];


export const MEDICATION_PRESETS = [
  "Amoxicilina + ácido clavulánico",
  "Meloxicam",
  "Metronidazol",
  "Omeprazol",
  "Prednisolona",
  "Fenbendazol",
  "Gabapentina",
];
