export const PRODUCT_PRICE_MIN = 1000;
export const PRODUCT_PRICE_MAX = 1000000;

export const PRODUCT_CATEGORIES = [
  "Alimentos",
  "Higiene",
  "Accesorios",
  "Snacks",
  "Salud",
  "Otros",
];

const CATALOG = {
  Alimentos: [
    { name: "Alimento Premium Adulto", brand: "NutriPet", animal_type: "Perros", format: "15 kg", description: "Alimento completo para perros adultos." },
    { name: "Alimento Cachorro", brand: "NutriPet", animal_type: "Perros", format: "10 kg", description: "Alimento formulado para perros en etapa de crecimiento." },
    { name: "Alimento Senior", brand: "VidaPet", animal_type: "Perros", format: "12 kg", description: "Alimento para perros adultos mayores." },
    { name: "Alimento Gato Adulto", brand: "MichiFood", animal_type: "Gatos", format: "8 kg", description: "Alimento completo para gatos adultos." },
    { name: "Alimento Gato Esterilizado", brand: "MichiFood", animal_type: "Gatos", format: "7 kg", description: "Alimento para gatos esterilizados." },
    { name: "Pellets para Conejo", brand: "BunnyLife", animal_type: "Conejos", format: "2 kg", description: "Pellets formulados para la alimentación diaria de conejos." },
    { name: "Heno Premium", brand: "BunnyLife", animal_type: "Conejos", format: "1 kg", description: "Heno seco para complementar la alimentación de conejos." },
    { name: "Alimento para Hámster", brand: "MiniPet", animal_type: "Hámsteres", format: "500 g", description: "Mezcla de alimento seco para hámsteres." },
    { name: "Alimento para Cobayo", brand: "MiniPet", animal_type: "Cobayos", format: "1 kg", description: "Alimento formulado para cobayos." },
    { name: "Alimento para Hurón", brand: "FerretPlus", animal_type: "Hurones", format: "2 kg", description: "Alimento seco formulado para hurones." },
    { name: "Semillas para Canario", brand: "AveMix", animal_type: "Canarios", format: "1 kg", description: "Mezcla de semillas para canarios." },
    { name: "Alimento para Periquito", brand: "AveMix", animal_type: "Periquitos", format: "1 kg", description: "Mezcla de semillas para periquitos." },
    { name: "Alimento para Loro", brand: "AveMix", animal_type: "Loros", format: "2 kg", description: "Alimento seco para loros." },
    { name: "Alimento para Aves", brand: "AveMix", animal_type: "Aves", format: "2 kg", description: "Mezcla de alimento para aves domésticas." },
    { name: "Escamas para Peces", brand: "AquaPet", animal_type: "Peces", format: "250 g", description: "Alimento en escamas para peces ornamentales." },
    { name: "Pellets para Peces", brand: "AquaPet", animal_type: "Peces", format: "500 g", description: "Pellets para peces ornamentales." },
    { name: "Alimento para Tortuga", brand: "ReptiFood", animal_type: "Tortugas", format: "500 g", description: "Alimento preparado para tortugas domésticas." },
    { name: "Alimento para Iguana", brand: "ReptiFood", animal_type: "Iguanas", format: "1 kg", description: "Alimento vegetal preparado para iguanas." },
    { name: "Alimento para Gecko", brand: "ReptiFood", animal_type: "Geckos", format: "250 g", description: "Alimento preparado para geckos." },
    { name: "Alimento para Erizo", brand: "MiniPet", animal_type: "Erizos", format: "1 kg", description: "Alimento seco formulado para erizos domésticos." },
    { name: "Alimento para Chinchilla", brand: "MiniPet", animal_type: "Chinchillas", format: "1 kg", description: "Pellets para chinchillas." },
    { name: "Alimento para Rata Doméstica", brand: "MiniPet", animal_type: "Ratas domésticas", format: "1 kg", description: "Alimento seco para ratas domésticas." },
    { name: "Alimento para Ratón", brand: "MiniPet", animal_type: "Ratones", format: "500 g", description: "Alimento seco para ratones domésticos." },
    { name: "Alimento para Cerdo Miniatura", brand: "MiniFarm", animal_type: "Cerdos miniatura", format: "5 kg", description: "Alimento formulado para cerdos miniatura." },
  ],
  Higiene: [
    { name: "Shampoo Piel Sensible", brand: "SoftPaw", animal_type: "Perros y gatos", format: "500 ml", description: "Shampoo suave para higiene frecuente." },
    { name: "Arena Sanitaria", brand: "MichiClean", animal_type: "Gatos", format: "10 kg", description: "Arena sanitaria para uso diario." },
    { name: "Limpiador de Oídos", brand: "VetCare", animal_type: "Perros y gatos", format: "120 ml", description: "Solución de higiene para limpieza externa." },
    { name: "Toallitas Higiénicas", brand: "SoftPaw", animal_type: "Perros y gatos", format: "Pack 40", description: "Toallitas para limpieza rápida de mascotas." },
    { name: "Acondicionador de Pelaje", brand: "SoftPaw", animal_type: "Perros y gatos", format: "500 ml", description: "Acondicionador para cuidado del pelaje." },
  ],
  Accesorios: [
    { name: "Arnés Ajustable", brand: "WalkPet", animal_type: "Perros", format: "Talla M", description: "Arnés ajustable para paseo diario." },
    { name: "Correa Resistente", brand: "WalkPet", animal_type: "Perros", format: "1 unidad", description: "Correa para paseo y manejo seguro." },
    { name: "Rascador", brand: "MichiHome", animal_type: "Gatos", format: "1 unidad", description: "Rascador para entretenimiento y cuidado de uñas." },
    { name: "Cama Acolchada", brand: "PetHome", animal_type: "Perros y gatos", format: "Talla M", description: "Cama acolchada para descanso." },
    { name: "Bebedero", brand: "PetHome", animal_type: "Perros y gatos", format: "1 unidad", description: "Bebedero de uso diario." },
  ],
  Snacks: [
    { name: "Snack Dental", brand: "PetSmile", animal_type: "Perros", format: "Pack 7", description: "Snack complementario para higiene dental." },
    { name: "Premios de Entrenamiento", brand: "HappyPet", animal_type: "Perros", format: "250 g", description: "Premios pequeños para entrenamiento." },
    { name: "Snack Cremoso", brand: "MichiSnack", animal_type: "Gatos", format: "Pack 12", description: "Snack cremoso para gatos." },
    { name: "Galletas para Mascotas", brand: "HappyPet", animal_type: "Perros y gatos", format: "500 g", description: "Snack complementario de uso ocasional." },
  ],
  Salud: [
    { name: "Suplemento Articular", brand: "VetBalance", animal_type: "Perros", format: "60 comprimidos", description: "Suplemento complementario para cuidado articular." },
    { name: "Pasta de Vitaminas", brand: "VetBalance", animal_type: "Gatos", format: "100 g", description: "Suplemento nutricional complementario." },
    { name: "Pipeta Antiparasitaria", brand: "PetProtect", animal_type: "Perros y gatos", format: "1 unidad", description: "Producto de cuidado externo para mascotas." },
    { name: "Protector de Almohadillas", brand: "VetCare", animal_type: "Perros", format: "60 ml", description: "Producto de cuidado para almohadillas." },
  ],
  Otros: [
    { name: "Juguete Interactivo", brand: "PlayPet", animal_type: "Perros y gatos", format: "1 unidad", description: "Juguete de entretenimiento para mascotas." },
    { name: "Transportadora", brand: "PetTrip", animal_type: "Perros y gatos", format: "Talla M", description: "Transportadora para traslado de mascotas." },
    { name: "Placa de Identificación", brand: "PetID", animal_type: "Perros y gatos", format: "1 unidad", description: "Placa de identificación para collar." },
  ],
};

export function canonicalCategory(category) {
  const value = String(category || "").toLowerCase();

  if (value.includes("alimento")) return "Alimentos";
  if (value.includes("higiene")) return "Higiene";
  if (value.includes("accesorio")) return "Accesorios";
  if (value.includes("snack") || value.includes("premio")) return "Snacks";
  if (value.includes("salud")) return "Salud";
  return "Otros";
}

export function productTemplatesForCategory(category) {
  return CATALOG[canonicalCategory(category)] || CATALOG.Otros;
}

export function productFormatsForCategory(category) {
  const kilograms = Array.from(
    { length: 30 },
    (_, index) => `${index + 1} kg`
  );

  const catalogs = {
    Alimentos: ["50 g", "100 g", "250 g", "500 g", "750 g", ...kilograms],
    Higiene: ["120 ml", "250 ml", "500 ml", "1 L", "5 L", "1 kg", "2 kg", "5 kg", "10 kg", "15 kg", "20 kg", "Pack 20", "Pack 40"],
    Accesorios: ["1 unidad", "Pack 2", "Talla XS", "Talla S", "Talla M", "Talla L", "Talla XL"],
    Snacks: ["50 g", "100 g", "250 g", "500 g", "1 kg", "Pack 5", "Pack 7", "Pack 12", "Pack 20"],
    Salud: ["10 ml", "30 ml", "60 ml", "120 ml", "250 ml", "30 comprimidos", "60 comprimidos", "90 comprimidos", "1 unidad", "Pack 3"],
    Otros: ["1 unidad", "Pack 2", "Pack 5", "Talla S", "Talla M", "Talla L"],
  };

  return catalogs[canonicalCategory(category)] || catalogs.Otros;
}

export function validateProductPrice(value) {
  const price = Number(value);

  return (
    Number.isFinite(price) &&
    price >= PRODUCT_PRICE_MIN &&
    price <= PRODUCT_PRICE_MAX
  );
}
