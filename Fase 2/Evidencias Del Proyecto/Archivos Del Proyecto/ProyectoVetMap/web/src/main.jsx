import VetMapRoleHeader from "./components/VetMapRoleHeader";
import VetMapOwnerHome from "./components/VetMapOwnerHome";
import "./components/VetMapAdminV12.css";
import VetMapAdminChrome, { VetMapAdminRouteBody } from "./components/VetMapAdminChrome";
import VetMapAdminDashboard from "./components/VetMapAdminDashboard";
import React, { useEffect, useRef, useState } from "react";
import { UserRound, Mail, LockKeyhole, IdCard, MapPin, CalendarDays } from "lucide-react";
import VetMapChat from "./components/VetMapChat";
import ReactDOM from "react-dom/client";
import "./index.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./vetmap_v21_estilo.css";
import "./vetmap_inicio_clasico_v22.css";
import "./vetmap_sidebar_veterinaria_v23.css";
import "./vetmap_v27_31_menu_veterinaria_redondeado.css";
import "./vetmap_tienda_v24.css";
import "./vetmap_repartidores_v26.css";
import "./vetmap_sidebar_dueno_v27_2.css"; // VETMAP V26
import "./vetmap_owner_estilo_unificado_v27_4.css";
import "./vetmap_estilo_veterinaria_v27_5.css";
import "./vetmap_perfil_dueno_v27_6.css";
import "./vetmap_banners_azules_v27_8.css";
import "./vetmap_banners_completos_v27_9.css";
import "./vetmap_v27_11_veterinaria_sin_fotos.css";
import "./vetmap_v27_13_iconos_sin_fondo.css";

import {
  loginUser,
  registerUser,
  resetPassword,
  getMe,
  updateMe,
  getPets,
  getPetBreeds,
  registerPetBreed,
  createPet,
  updatePet,
  getVaccines,
  createVaccine,
  updateVaccine,
  deleteVaccine,
  getMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  getPetMedicationSchedule,
  markMedicationAdministered,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAdminPets,
  deleteAdminPet,
  updateAdminPet,
  getAdminVaccines,
  getAdminMedications,
  getAdminConsultations,
  getAdminClinicalCatalog,
  getAdminPrescriptions,
  createAdminPrescription,
  updateAdminPrescription,
  deleteAdminPrescription,
  createAdminVaccine,
  updateAdminVaccine,
  deleteAdminVaccine,
  createAdminMedication,
  updateAdminMedication,
  deleteAdminMedication,
  getConsultations,
  createConsultation,
  updateConsultation,
  createAdminConsultation,
  updateAdminConsultation,
  deleteAdminConsultation,
  getVeterinaryClinics,
  getReservationAvailability,
  getReservations,
  createReservation,
  cancelReservation,
  archiveReservation,
  archiveFinalReservations,
  archiveAdminReservation,
  archiveAllAdminFinalReservations,
  updateReservationStatus,
  getPetWeights,
  createPetWeight,
  deletePetWeight,
  getClinicDashboard,
  getClinicAppointments,
  archiveClinicAppointment,
  archiveClinicFinalAppointments,
  updateClinicAppointmentStatus,
  downloadAppointmentClinicalReport,
  getClinicPatients,
  getClinicCatalog,
  getClinicPatientHistory,
  createClinicConsultation,
  deleteClinicConsultation,
  createClinicVaccine,
  deleteClinicVaccine,
  createClinicMedication,
  deleteClinicMedication,
  getClinicPrescriptions,
  getClinicPrescriptionTemplates,
  createClinicPrescriptionTemplate,
  deleteClinicPrescriptionTemplate,
  createClinicPrescription,
  deleteClinicPrescription,
  getStorefrontStores,
  getStorefrontProducts,
  getMyStoreOrders,
  archiveMyStoreOrder,
  archiveMyDeliveredOrders,
  createStorefrontOrder,
  createStorefrontOrdersBatch,
  createMercadoPagoOrder,
  syncMercadoPagoOrder,
  getStoreDashboard,
  getStoreProducts,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  getStoreOrders,
  getStoreDeliveryDrivers, createStoreDeliveryDriver, setStoreDeliveryDriverActive,
  getStoreDeliveryAssignments, assignStoreDeliveryOrder, updateStoreDeliveryAssignment, // VETMAP V26
  archiveStoreOrder,
  archiveStoreFinalOrders,
  updateStoreOrderStatus,
  getAdminStoreProducts,
  createAdminStoreProduct,
  updateAdminStoreProduct,
  deleteAdminStoreProduct,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./api";
import "./vetmap_v27_19_iconos_premium.css";


import "./vetmap_v27_14_veterinaria.css";

import "./vetmap_v27_15_banners_limpios.css";

import "./vetmap_v27_16_ajuste_encabezados_vet.css";


import "./vetmap_v27_18_iconos_contraste.css";

import "./vetmap_v27_22_iconos_veterinaria.css";
import "./vetmap_v27_25_tienda_unificada.css";
import "./vetmap_v27_30_tipografia_tienda.css";
import "./vetmap_v27_29_menu_tienda_redondeado.css";
import "./vetmap_v27_27_banners_y_clinica.css";
import "./vetmap_v27_28_ajuste_tienda.css";
import "./vetmap_v27_23_veterinaria_solo_banner.css";
import "./vetmap_v27_24_emojis_mascotas.css";
const VETMAP_PET_SPECIES = [
  "Perro",
  "Gato",
  "Conejo",
  "Hámster",
  "Cobayo",
  "Hurón",
  "Tortuga",
  "Pez",
  "Ave",
  "Loro",
  "Canario",
  "Periquito",
  "Agapornis",
  "Gallina",
  "Pato",
  "Erizo",
  "Chinchilla",
  "Ratón",
  "Rata doméstica",
  "Iguana",
  "Gecko",
  "Serpiente",
  "Rana",
  "Ajolote",
  "Araña",
  "Insecto",
  "Cerdo miniatura",
  "Otro",
];


const VETMAP_COUNTRIES = [
  "Chile",
  "Argentina",
  "Bolivia",
  "Brasil",
  "Colombia",
  "Ecuador",
  "México",
  "Paraguay",
  "Perú",
  "Uruguay",
  "Venezuela",
];

const CHILE_LOCATIONS = {
  "Arica y Parinacota": [
    "Arica",
    "Camarones",
    "General Lagos",
    "Putre",
  ],
  "Tarapacá": [
    "Alto Hospicio",
    "Camiña",
    "Colchane",
    "Huara",
    "Iquique",
    "Pica",
    "Pozo Almonte",
  ],
  "Antofagasta": [
    "Antofagasta",
    "Calama",
    "María Elena",
    "Mejillones",
    "Ollagüe",
    "San Pedro de Atacama",
    "Sierra Gorda",
    "Taltal",
    "Tocopilla",
  ],
  "Atacama": [
    "Alto del Carmen",
    "Caldera",
    "Chañaral",
    "Copiapó",
    "Diego de Almagro",
    "Freirina",
    "Huasco",
    "Tierra Amarilla",
    "Vallenar",
  ],
  "Coquimbo": [
    "Andacollo",
    "Canela",
    "Combarbalá",
    "Coquimbo",
    "Illapel",
    "La Higuera",
    "La Serena",
    "Los Vilos",
    "Monte Patria",
    "Ovalle",
    "Paihuano",
    "Punitaqui",
    "Río Hurtado",
    "Salamanca",
    "Vicuña",
  ],
  "Valparaíso": [
    "Algarrobo",
    "Cabildo",
    "Calera",
    "Calle Larga",
    "Cartagena",
    "Casablanca",
    "Catemu",
    "Concón",
    "El Quisco",
    "El Tabo",
    "Hijuelas",
    "Isla de Pascua",
    "Juan Fernández",
    "La Cruz",
    "La Ligua",
    "Limache",
    "Llaillay",
    "Los Andes",
    "Nogales",
    "Olmué",
    "Panquehue",
    "Papudo",
    "Petorca",
    "Puchuncaví",
    "Putaendo",
    "Quillota",
    "Quilpué",
    "Quintero",
    "Rinconada",
    "San Antonio",
    "San Esteban",
    "San Felipe",
    "Santa María",
    "Santo Domingo",
    "Valparaíso",
    "Villa Alemana",
    "Viña del Mar",
    "Zapallar",
  ],
  "Metropolitana de Santiago": [
    "Alhué",
    "Buin",
    "Calera de Tango",
    "Cerrillos",
    "Cerro Navia",
    "Colina",
    "Conchalí",
    "Curacaví",
    "El Bosque",
    "El Monte",
    "Estación Central",
    "Huechuraba",
    "Independencia",
    "Isla de Maipo",
    "La Cisterna",
    "La Florida",
    "La Granja",
    "La Pintana",
    "La Reina",
    "Lampa",
    "Las Condes",
    "Lo Barnechea",
    "Lo Espejo",
    "Lo Prado",
    "Macul",
    "Maipú",
    "María Pinto",
    "Melipilla",
    "Ñuñoa",
    "Padre Hurtado",
    "Paine",
    "Pedro Aguirre Cerda",
    "Peñaflor",
    "Peñalolén",
    "Pirque",
    "Providencia",
    "Pudahuel",
    "Puente Alto",
    "Quilicura",
    "Quinta Normal",
    "Recoleta",
    "Renca",
    "San Bernardo",
    "San Joaquín",
    "San José de Maipo",
    "San Miguel",
    "San Pedro",
    "San Ramón",
    "Santiago",
    "Talagante",
    "Tiltil",
    "Vitacura",
  ],
  "O'Higgins": [
    "Chépica",
    "Chimbarongo",
    "Codegua",
    "Coinco",
    "Coltauco",
    "Doñihue",
    "Graneros",
    "La Estrella",
    "Las Cabras",
    "Litueche",
    "Lolol",
    "Machalí",
    "Malloa",
    "Marchigüe",
    "Mostazal",
    "Nancagua",
    "Navidad",
    "Olivar",
    "Palmilla",
    "Paredones",
    "Peralillo",
    "Peumo",
    "Pichidegua",
    "Pichilemu",
    "Placilla",
    "Pumanque",
    "Quinta de Tilcoco",
    "Rancagua",
    "Rengo",
    "Requínoa",
    "San Fernando",
    "San Vicente",
    "Santa Cruz",
  ],
  "Maule": [
    "Cauquenes",
    "Chanco",
    "Colbún",
    "Constitución",
    "Curepto",
    "Curicó",
    "Empedrado",
    "Hualañé",
    "Licantén",
    "Linares",
    "Longaví",
    "Maule",
    "Molina",
    "Parral",
    "Pelarco",
    "Pelluhue",
    "Pencahue",
    "Rauco",
    "Retiro",
    "Río Claro",
    "Romeral",
    "Sagrada Familia",
    "San Clemente",
    "San Javier",
    "San Rafael",
    "Talca",
    "Teno",
    "Vichuquén",
    "Villa Alegre",
    "Yerbas Buenas",
  ],
  "Ñuble": [
    "Bulnes",
    "Chillán",
    "Chillán Viejo",
    "Cobquecura",
    "Coelemu",
    "Coihueco",
    "El Carmen",
    "Ninhue",
    "Ñiquén",
    "Pemuco",
    "Pinto",
    "Portezuelo",
    "Quillón",
    "Quirihue",
    "Ránquil",
    "San Carlos",
    "San Fabián",
    "San Ignacio",
    "San Nicolás",
    "Trehuaco",
    "Yungay",
  ],
  "Biobío": [
    "Alto Biobío",
    "Antuco",
    "Arauco",
    "Cabrero",
    "Cañete",
    "Chiguayante",
    "Concepción",
    "Contulmo",
    "Coronel",
    "Curanilahue",
    "Florida",
    "Hualpén",
    "Hualqui",
    "Laja",
    "Lebu",
    "Los Álamos",
    "Los Ángeles",
    "Lota",
    "Mulchén",
    "Nacimiento",
    "Negrete",
    "Penco",
    "Quilaco",
    "Quilleco",
    "San Pedro de la Paz",
    "San Rosendo",
    "Santa Bárbara",
    "Santa Juana",
    "Talcahuano",
    "Tirúa",
    "Tomé",
    "Tucapel",
    "Yumbel",
  ],
  "La Araucanía": [
    "Angol",
    "Carahue",
    "Cholchol",
    "Collipulli",
    "Cunco",
    "Curacautín",
    "Curarrehue",
    "Ercilla",
    "Freire",
    "Galvarino",
    "Gorbea",
    "Lautaro",
    "Loncoche",
    "Lonquimay",
    "Los Sauces",
    "Lumaco",
    "Melipeuco",
    "Nueva Imperial",
    "Padre Las Casas",
    "Perquenco",
    "Pitrufquén",
    "Pucón",
    "Purén",
    "Renaico",
    "Saavedra",
    "Temuco",
    "Teodoro Schmidt",
    "Toltén",
    "Traiguén",
    "Victoria",
    "Vilcún",
    "Villarrica",
  ],
  "Los Ríos": [
    "Corral",
    "Futrono",
    "La Unión",
    "Lago Ranco",
    "Lanco",
    "Los Lagos",
    "Máfil",
    "Mariquina",
    "Paillaco",
    "Panguipulli",
    "Río Bueno",
    "Valdivia",
  ],
  "Los Lagos": [
    "Ancud",
    "Calbuco",
    "Castro",
    "Chaitén",
    "Chonchi",
    "Cochamó",
    "Curaco de Vélez",
    "Dalcahue",
    "Fresia",
    "Frutillar",
    "Futaleufú",
    "Hualaihué",
    "Llanquihue",
    "Los Muermos",
    "Maullín",
    "Osorno",
    "Palena",
    "Puerto Montt",
    "Puerto Octay",
    "Puerto Varas",
    "Puqueldón",
    "Purranque",
    "Puyehue",
    "Queilén",
    "Quellón",
    "Quemchi",
    "Quinchao",
    "Río Negro",
    "San Juan de la Costa",
    "San Pablo",
  ],
  "Aysén": [
    "Aysén",
    "Chile Chico",
    "Cisnes",
    "Cochrane",
    "Coyhaique",
    "Guaitecas",
    "Lago Verde",
    "O'Higgins",
    "Río Ibáñez",
    "Tortel",
  ],
  "Magallanes y de la Antártica Chilena": [
    "Antártica",
    "Cabo de Hornos",
    "Laguna Blanca",
    "Natales",
    "Porvenir",
    "Primavera",
    "Punta Arenas",
    "Río Verde",
    "San Gregorio",
    "Timaukel",
    "Torres del Paine",
  ],
};

function LocationSelector({
  country,
  region,
  city,
  onChange,
  adminStyle = false,
}) {
  const chileRegions = Object.keys(CHILE_LOCATIONS);
  const communes =
    country === "Chile" && region
      ? CHILE_LOCATIONS[region] || []
      : [];

  const knownCountry = VETMAP_COUNTRIES.includes(country);

  const fieldClass = adminStyle ? "grid gap-2" : "vm-field";
  const fullClass = adminStyle
    ? "grid gap-2"
    : "vm-field vm-field-full";
  const controlClass = adminStyle ? "rounded border p-2" : "";

  return (
    <>
      <label className={fieldClass}>
        <span className={adminStyle ? "font-semibold" : ""}>
          País
        </span>

        <select
          className={`${controlClass} vm-location-control`}
          value={country || ""}
          onChange={(e) => {
            const newCountry = e.target.value;

            onChange({
              country: newCountry,
              region: "",
              city: "",
            });
          }}
        >
          <option value="">Selecciona un país</option>

          {!knownCountry && country && (
            <option value={country}>{country}</option>
          )}

          {VETMAP_COUNTRIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      {country === "Chile" ? (
        <>
          <label className={fieldClass}>
            <span className={adminStyle ? "font-semibold" : ""}>
              Región
            </span>

            <select
              className={`${controlClass} vm-location-control`}
              value={region || ""}
              onChange={(e) => {
                onChange({
                  country,
                  region: e.target.value,
                  city: "",
                });
              }}
            >
              <option value="">Selecciona una región</option>

              {chileRegions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className={fullClass}>
            <span className={adminStyle ? "font-semibold" : ""}>
              Ciudad / Comuna
            </span>

            <select
              className={`${controlClass} vm-location-control`}
              value={city || ""}
              disabled={!region}
              onChange={(e) =>
                onChange({
                  country,
                  region,
                  city: e.target.value,
                })
              }
            >
              <option value="">
                {region
                  ? "Selecciona una comuna"
                  : "Primero selecciona una región"}
              </option>

              {communes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <>
          <label className={fieldClass}>
            <span className={adminStyle ? "font-semibold" : ""}>
              Región / Estado
            </span>

            <input
              className={controlClass}
              placeholder="Región o estado"
              value={region || ""}
              onChange={(e) =>
                onChange({
                  country,
                  region: e.target.value,
                  city,
                })
              }
            />
          </label>

          <label className={fullClass}>
            <span className={adminStyle ? "font-semibold" : ""}>
              Ciudad / Comuna
            </span>

            <input
              className={controlClass}
              placeholder="Ciudad o comuna"
              value={city || ""}
              onChange={(e) =>
                onChange({
                  country,
                  region,
                  city: e.target.value,
                })
              }
            />
          </label>
        </>
      )}
    </>
  );
}



const VETMAP_MAP_CENTER = [-33.4489, -70.6693];


/*
  Datos demostrativos de respaldo.
  La prioridad SIEMPRE son los datos reales del backend.
  Estos registros evitan que la zona pública quede vacía cuando
  FastAPI está apagado o un endpoint público falla.
*/
const VETMAP_DEMO_CLINICS = [
  {
    id: "demo-clinic-huellitas",
    name: "Clínica Huellitas",
    commune: "Santiago",
    address: "Av. VetMap 145 (dirección ficticia)",
    hours: "Lun a Sáb · 09:00 a 19:00",
    services:
      "Consulta general,Vacunación,Control médico,Urgencia",
    is_24h: false,
    latitude: -33.4489,
    longitude: -70.6693,
    demo: true,
  },
  {
    id: "demo-clinic-norte",
    name: "Centro Animal Norte",
    commune: "Quilicura",
    address: "Av. Los Peludos 420 (dirección ficticia)",
    hours: "Lun a Dom · 08:00 a 20:00",
    services:
      "Consulta general,Vacunación,Control médico",
    is_24h: false,
    latitude: -33.3668,
    longitude: -70.7293,
    demo: true,
  },
  {
    id: "demo-clinic-urgencias",
    name: "VetMap Urgencias",
    commune: "Providencia",
    address: "Calle Patitas 24 (dirección ficticia)",
    hours: "Atención 24 horas",
    services:
      "Urgencia,Consulta general,Control médico",
    is_24h: true,
    latitude: -33.4315,
    longitude: -70.6095,
    demo: true,
  },
];

const VETMAP_DEMO_STORES = [
  {
    id: "demo-store-animal-shop",
    name: "Animal Shop",
    commune: "Providencia",
    address: "Calle Huellitas 214 (dirección ficticia)",
    delivery_conditions: "Despacho sujeto a cobertura",
    demo_product_count: 5,
    latitude: -33.4370,
    longitude: -70.6105,
    demo: true,
  },
  {
    id: "demo-store-mundo-mascota",
    name: "Mundo Mascota",
    commune: "Santiago",
    address: "Av. VetMap 520 (dirección ficticia)",
    delivery_conditions: "Despacho 24 a 48 horas",
    demo_product_count: 1,
    latitude: -33.4550,
    longitude: -70.6500,
    demo: true,
  },
  {
    id: "demo-store-petmarket-norte",
    name: "PetMarket Norte",
    commune: "Quilicura",
    address: "Paseo Peluditos 820 (dirección ficticia)",
    delivery_conditions: "Retiro o despacho coordinado",
    demo_product_count: 3,
    latitude: -33.3615,
    longitude: -70.7288,
    demo: true,
  },
];

const VETMAP_DEMO_PRODUCTS = [
  {
    id: "demo-product-1",
    store_id: "demo-store-animal-shop",
    store_name: "Animal Shop",
    name: "Alimento Premium Perro",
    brand: "VetChoice",
    category: "Alimentos",
    animal_type: "Perros",
    format: "3 kg",
    price: 18990,
    stock: 12,
    active: true,
  },
  {
    id: "demo-product-2",
    store_id: "demo-store-animal-shop",
    store_name: "Animal Shop",
    name: "Arena Sanitaria",
    brand: "MichiClean",
    category: "Higiene",
    animal_type: "Gatos",
    format: "5 kg",
    price: 9990,
    stock: 8,
    active: true,
  },
  {
    id: "demo-product-3",
    store_id: "demo-store-animal-shop",
    store_name: "Animal Shop",
    name: "Snack Dental",
    brand: "HappyPet",
    category: "Snacks",
    animal_type: "Perros",
    format: "180 g",
    price: 4990,
    stock: 15,
    active: true,
  },
  {
    id: "demo-product-4",
    store_id: "demo-store-animal-shop",
    store_name: "Animal Shop",
    name: "Correa Ajustable",
    brand: "WalkPet",
    category: "Accesorios",
    animal_type: "Perros",
    format: "Talla M",
    price: 7990,
    stock: 7,
    active: true,
  },
  {
    id: "demo-product-5",
    store_id: "demo-store-animal-shop",
    store_name: "Animal Shop",
    name: "Juguete Interactivo",
    brand: "PlayPet",
    category: "Accesorios",
    animal_type: "Gatos",
    format: "Unidad",
    price: 6990,
    stock: 9,
    active: true,
  },
  {
    id: "demo-product-6",
    store_id: "demo-store-mundo-mascota",
    store_name: "Mundo Mascota",
    name: "Alimento Gato Adulto",
    brand: "MiauPlus",
    category: "Alimentos",
    animal_type: "Gatos",
    format: "1 kg",
    price: 10990,
    stock: 10,
    active: true,
  },
  {
    id: "demo-product-7",
    store_id: "demo-store-petmarket-norte",
    store_name: "PetMarket Norte",
    name: "Heno Premium Conejo",
    brand: "BunnyLife",
    category: "Alimentos",
    animal_type: "Conejos",
    format: "500 g",
    price: 5990,
    stock: 11,
    active: true,
  },
  {
    id: "demo-product-8",
    store_id: "demo-store-petmarket-norte",
    store_name: "PetMarket Norte",
    name: "Bebedero para Aves",
    brand: "BirdHome",
    category: "Accesorios",
    animal_type: "Aves",
    format: "Unidad",
    price: 4490,
    stock: 6,
    active: true,
  },
  {
    id: "demo-product-9",
    store_id: "demo-store-petmarket-norte",
    store_name: "PetMarket Norte",
    name: "Alimento Peces Tropicales",
    brand: "AquaPet",
    category: "Alimentos",
    animal_type: "Peces",
    format: "100 g",
    price: 3990,
    stock: 14,
    active: true,
  },
];


const VETMAP_CLINIC_FALLBACKS = {
  "Clínica Huellitas": {
    latitude: -33.4489,
    longitude: -70.6693,
  },
  "VetMap Urgencias": {
    latitude: -33.4315,
    longitude: -70.6095,
  },
  "Centro Animal Norte": {
    latitude: -33.3668,
    longitude: -70.7293,
  },
};

const VETMAP_STORE_FALLBACKS = {
  "Mundo Mascota": {
    latitude: -33.4550,
    longitude: -70.6500,
  },
  "PetMarket Norte": {
    latitude: -33.3615,
    longitude: -70.7288,
  },
  "Animal Shop": {
    latitude: -33.4370,
    longitude: -70.6105,
  },
};


function normalizeMapPlace(place, type) {
  const latitude = Number(place?.latitude);
  const longitude = Number(place?.longitude);

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return {
      ...place,
      latitude,
      longitude,
    };
  }

  const fallbacks =
    type === "clinic"
      ? VETMAP_CLINIC_FALLBACKS
      : VETMAP_STORE_FALLBACKS;

  const fallback = fallbacks[place?.name];

  if (!fallback) {
    return null;
  }

  return {
    ...place,
    latitude: fallback.latitude,
    longitude: fallback.longitude,
  };
}



function escapeMapHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function mapDistanceKm(from, to) {
  if (!from || !to) return null;

  const earthRadiusKm = 6371;
  const toRad = (value) => (value * Math.PI) / 180;

  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const deltaLat = toRad(to.latitude - from.latitude);
  const deltaLon = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


function VetMapPlacesMap({
  title,
  description,
  places = [],
  type = "clinic",
  actionLabel = "",
  onAction,
}) {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");

  const validPlaces = places
    .map((place) => normalizeMapPlace(place, type))
    .filter(Boolean);

  useEffect(() => {
    if (!mapElementRef.current || mapInstanceRef.current) return;

    const map = L.map(mapElementRef.current, {
      scrollWheelZoom: true,
    }).setView(VETMAP_MAP_CENTER, 11);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    ).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerLayerRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markerLayerRef.current;

    if (!map || !layer) return;

    layer.clearLayers();

    const markerPoints = [];

    validPlaces.forEach((place) => {
      const latitude = Number(place.latitude);
      const longitude = Number(place.longitude);

      const emoji = type === "clinic" ? "🏥" : "🛒";

      const icon = L.divIcon({
        className: "vm-map-div-icon",
        html: `<div class="vm-map-pin vm-map-pin-${type}"><span>${emoji}</span></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 42],
        popupAnchor: [0, -38],
      });

      const marker = L.marker(
        [latitude, longitude],
        { icon }
      ).addTo(layer);

      const secondary =
        type === "clinic"
          ? `${escapeMapHtml(place.hours || "Horario por confirmar")}`
          : `${escapeMapHtml(
              place.delivery_conditions || "Condiciones por confirmar"
            )}`;

      marker.bindPopup(`
        <div class="vm-map-popup">
          <strong>${escapeMapHtml(place.name)}</strong>
          <span>📍 ${escapeMapHtml(place.commune)}</span>
          <span>${escapeMapHtml(place.address || "Ubicación demostrativa")}</span>
          <span>${secondary}</span>
          <small>Establecimiento ficticio de VetMap</small>
        </div>
      `);

      marker.on("click", () => {
        setSelectedPlace(place);
      });

      markerPoints.push([latitude, longitude]);
    });

    if (markerPoints.length === 1) {
      map.setView(markerPoints[0], 13);
    } else if (markerPoints.length > 1) {
      map.fitBounds(
        L.latLngBounds(markerPoints),
        {
          padding: [40, 40],
          maxZoom: 12,
        }
      );
    }
  }, [places, type]);

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    const userIcon = L.divIcon({
      className: "vm-map-div-icon",
      html: '<div class="vm-map-pin vm-map-pin-user"><span>📍</span></div>',
      iconSize: [44, 44],
      iconAnchor: [22, 42],
      popupAnchor: [0, -38],
    });

    userMarkerRef.current = L.marker(
      [userLocation.latitude, userLocation.longitude],
      { icon: userIcon }
    )
      .addTo(map)
      .bindPopup(
        '<div class="vm-map-popup"><strong>Tu ubicación</strong><span>Ubicación aproximada del navegador.</span></div>'
      );

    map.setView(
      [userLocation.latitude, userLocation.longitude],
      12
    );
  }, [userLocation]);

  function findMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Tu navegador no permite obtener la ubicación."
      );
      return;
    }

    setLocationMessage("Buscando tu ubicación...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationMessage(
          "Ubicación aproximada encontrada."
        );
      },
      () => {
        setLocationMessage(
          "No fue posible obtener tu ubicación. Puedes seguir usando el mapa normalmente."
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  const selectedDistance =
    selectedPlace && userLocation
      ? mapDistanceKm(
          userLocation,
          {
            latitude: Number(selectedPlace.latitude),
            longitude: Number(selectedPlace.longitude),
          }
        )
      : null;

  return (
    <section className="vm-map-shell">
      <div className="vm-map-heading">
        <div>
          <p className="vm-kicker">
            {type === "clinic"
              ? "Mapa veterinario"
              : "Mapa de tiendas"}
          </p>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <button
          type="button"
          className="vm-secondary vm-map-location-button"
          onClick={findMyLocation}
        >
          📍 Usar mi ubicación
        </button>
      </div>

      <div className="vm-demo-map-notice">
        🧪 Datos demostrativos · Todos los establecimientos y direcciones son ficticios.
      </div>

      {locationMessage && (
        <p className="vm-map-location-message">
          {locationMessage}
        </p>
      )}

      <div
        ref={mapElementRef}
        className="vm-leaflet-map"
        aria-label={title}
      />

      {selectedPlace && (
        <div className="vm-map-selected-card">
          <div className="vm-map-selected-icon">
            {type === "clinic" ? "🏥" : "🛒"}
          </div>

          <div className="vm-map-selected-copy">
            <small>
              {type === "clinic"
                ? "Veterinaria ficticia"
                : "Tienda ficticia"}
            </small>

            <strong>{selectedPlace.name}</strong>

            <span>
              📍 {selectedPlace.commune}
              {selectedPlace.address
                ? ` · ${selectedPlace.address}`
                : ""}
            </span>

            <span>
              {type === "clinic"
                ? `🕐 ${selectedPlace.hours || "Horario por confirmar"}`
                : `📦 ${
                    selectedPlace.delivery_conditions ||
                    "Condiciones por confirmar"
                  }`}
            </span>

            {selectedDistance !== null && (
              <span>
                🧭 Aproximadamente{" "}
                {selectedDistance < 10
                  ? selectedDistance.toFixed(1)
                  : Math.round(selectedDistance)}{" "}
                km desde tu ubicación.
              </span>
            )}
          </div>

          {actionLabel && onAction && (
            <button
              type="button"
              className="vm-primary"
              onClick={() => onAction(selectedPlace)}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </section>
  );
}


function App() {
  const [token, setToken] = useState(sessionStorage.getItem("vetmap_token") || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [publicSection, setPublicSection] = useState("inicio");
  const [authActiveTab, setAuthActiveTab] = useState("login");
  const [memberSection, setMemberSection] = useState("inicio");
  const [accountMode, setAccountMode] = useState("profile");
  const [adminActiveTab, setAdminActiveTab] = useState("usuarios");

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [headerCartOpen, setHeaderCartOpen] = useState(false);
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);

  const [successToast, setSuccessToast] = useState(null);
  const successToastTimerRef = useRef(null);
  const notificationSeenIdsRef = useRef(new Set());
  const notificationInitialLoadRef = useRef(true);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    tone: "default",
  });
  const confirmDialogResolverRef = useRef(null);


  const [adminProducts, setAdminProducts] = useState([]);
  const [adminProductSearch, setAdminProductSearch] = useState("");
  const [adminProductStoreFilter, setAdminProductStoreFilter] = useState("all");
  const [editingAdminProductId, setEditingAdminProductId] = useState(null);

  const [adminProductForm, setAdminProductForm] = useState({
    store_id: "",
    name: "",
    brand: "",
    category: "Alimentos",
    animal_type: "Perros",
    format: "",
    description: "",
    price: "",
    stock: "",
    image_data: "",
    active: true,
  });

  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    rut: "",
    country: "",
    region: "",
    city: "",
    birth_date: "",
  });

  const [pets, setPets] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminPets, setAdminPets] = useState([]);

  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [medications, setMedications] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [petWeights, setPetWeights] = useState([]);

  const [weightForm, setWeightForm] = useState({
    weight: "",
    record_date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const [clinics, setClinics] =
    useState(VETMAP_DEMO_CLINICS);
  const [reservations, setReservations] = useState([]);

  // Experiencia pública mejorada.
  const [publicClinicSearch, setPublicClinicSearch] = useState("");
  const [publicClinicCommune, setPublicClinicCommune] = useState("all");
  const [publicClinicService, setPublicClinicService] = useState("all");

  const [publicDemoVet, setPublicDemoVet] = useState("");
  const [publicDemoService, setPublicDemoService] =
    useState("Consulta general");
  const [publicDemoDay, setPublicDemoDay] = useState("Mié 30");
  const [publicDemoTime, setPublicDemoTime] = useState("12:00");

  const [publicHelpSearch, setPublicHelpSearch] = useState("");

  const [clinicDashboard, setClinicDashboard] = useState(null);
  const [clinicAppointments, setClinicAppointments] = useState([]);
  const [clinicPatients, setClinicPatients] = useState([]);
  const [clinicPrescriptions, setClinicPrescriptions] = useState([]);
  const [clinicSelectedPatient, setClinicSelectedPatient] = useState(null);
  const [clinicPatientHistory, setClinicPatientHistory] = useState(null);
  const [clinicActionModal, setClinicActionModal] = useState(null);
  const [clinicActionAppointmentId, setClinicActionAppointmentId] =
    useState(null);
  const [
    clinicMedicationFormError,
    setClinicMedicationFormError,
  ] = useState("");
  const [downloadingClinicalReportId, setDownloadingClinicalReportId] =
    useState(null);

  const [
    clinicAgendaHistoryAppointmentId,
    setClinicAgendaHistoryAppointmentId,
  ] = useState(null);
  const [
    clinicAgendaHistory,
    setClinicAgendaHistory,
  ] = useState(null);
  const [
    clinicAgendaHistoryLoading,
    setClinicAgendaHistoryLoading,
  ] = useState(false);

  const [clinicCatalogOptions, setClinicCatalogOptions] = useState({
    consultation_reason: [],
    vaccine: [],
    medication: [],
    dose: [],
    frequency: [],
    duration: [],
    instructions: [],
  });

  const [clinicConsultationForm, setClinicConsultationForm] = useState({
    consultation_date: new Date().toISOString().slice(0, 10),
    reason: "",
    diagnosis: "",
    treatment: "",
    observation: "",
  });

  const [clinicVaccineForm, setClinicVaccineForm] = useState({
    name: "",
    application_date: new Date().toISOString().slice(0, 10),
    next_dose_date: "",
    observation: "",
  });

  const [clinicMedicationForm, setClinicMedicationForm] = useState({
    name: "",
    dose: "",
    frequency: "",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    reminder_times: "08:00,20:00",
    observation: "",
  });

  const [
    clinicVaccineNextDosePreset,
    setClinicVaccineNextDosePreset,
  ] = useState("");

  const [
    clinicMedicationDurationPreset,
    setClinicMedicationDurationPreset,
  ] = useState("");

  const [clinicPrescriptionForm, setClinicPrescriptionForm] = useState({
    pet_id: "",
    issue_date: new Date().toISOString().slice(0, 10),
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });


  const [
    clinicPrescriptionTemplates,
    setClinicPrescriptionTemplates,
  ] = useState([]);

  const [
    selectedClinicPrescriptionTemplateId,
    setSelectedClinicPrescriptionTemplateId,
  ] = useState("");

  const [
    saveClinicPrescriptionAsTemplate,
    setSaveClinicPrescriptionAsTemplate,
  ] = useState(true);

  const [
    clinicPrescriptionTemplateName,
    setClinicPrescriptionTemplateName,
  ] = useState("");

  const [clinicAgendaFilters, setClinicAgendaFilters] = useState({
    search: "",
    date: "",
    status: "all",
  });

  const [clinicPatientSearch, setClinicPatientSearch] = useState("");
  const [clinicPatientSpecies, setClinicPatientSpecies] = useState("all");
  const [clinicHistoryOrder, setClinicHistoryOrder] = useState("desc");
  const [clinicPrescriptionSearch, setClinicPrescriptionSearch] = useState("");


  const [marketStores, setMarketStores] =
    useState(VETMAP_DEMO_STORES);
  const [marketProducts, setMarketProducts] =
    useState(VETMAP_DEMO_PRODUCTS);
  const [marketSearch, setMarketSearch] = useState("");
  const [marketCategory, setMarketCategory] = useState("all");
  const [marketStoreFilter, setMarketStoreFilter] = useState("all");

  // Vista dedicada: seleccionar un establecimiento abre su propio apartado.
  // Evita repetir el patrón de "selecciono arriba y el contenido aparece más abajo".
  const [publicClinicDetailId, setPublicClinicDetailId] = useState("");
  const [memberClinicDetailId, setMemberClinicDetailId] = useState("");
  const [compareKey, setCompareKey] = useState("");
  const [cart, setCart] = useState([]);
  const [myStoreOrders, setMyStoreOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderHistoryFilter, setOrderHistoryFilter] = useState("all");

  const [storeDashboard, setStoreDashboard] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeOrders, setStoreOrders] = useState([]);
  // VETMAP V26: estado aislado de Repartidores (Tienda).
  const [deliveryDrivers, setDeliveryDrivers] = useState([]);
  const [deliveryAssignments, setDeliveryAssignments] = useState([]);
  const [deliveryDriverForm, setDeliveryDriverForm] = useState({ name: "", phone: "" });
  const [deliverySelectedDriver, setDeliverySelectedDriver] = useState({});
  const [deliveryIncidentNotes, setDeliveryIncidentNotes] = useState({});
  const [deliveryIncidentOpen, setDeliveryIncidentOpen] = useState({});
  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const [storeProductSearch, setStoreProductSearch] = useState("");
  const [editingStoreProductId, setEditingStoreProductId] = useState(null);
  const [storeProductForm, setStoreProductForm] = useState({
    name: "",
    brand: "",
    category: "Alimentos",
    animal_type: "Perros",
    format: "",
    description: "",
    price: "",
    stock: "",
    image_data: "",
    active: true,
  });

  const [reservationForm, setReservationForm] = useState({
    pet_id: "",
    veterinary_id: "",
    service: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  const [reservationAvailability, setReservationAvailability] =
    useState(null);
  const [reservationAvailabilityLoading, setReservationAvailabilityLoading] =
    useState(false);
  const [reservationConfirmOpen, setReservationConfirmOpen] =
    useState(false);

  const [showOwnerPetForm, setShowOwnerPetForm] = useState(false);

  const [ownerPetForm, setOwnerPetForm] = useState({
    name: "",
    species: "",
    species_other: "",
    breed: "",
    breed_other: "",
    age: "",
    age_months: "",
    weight: "",
    birth_date: "",
    photo_data: "",
    additional_info: "",
    medical_background: "",
    feeding_info: "",
  });

  const [editingOwnerPetId, setEditingOwnerPetId] = useState(null);

  const [ownerVaccineForm, setOwnerVaccineForm] = useState({
    name: "",
    application_date: "",
    next_dose_date: "",
    observation: "",
  });

  const [editingOwnerVaccineId, setEditingOwnerVaccineId] = useState(null);

  const [ownerMedicationForm, setOwnerMedicationForm] = useState({
    name: "",
    dose: "",
    frequency: "",
    start_date: "",
    end_date: "",
    reminder_times: "",
    observation: "",
  });

  const [editingOwnerMedicationId, setEditingOwnerMedicationId] = useState(null);
  const [medicationSchedule, setMedicationSchedule] = useState([]);

  const [ownerConsultationForm, setOwnerConsultationForm] = useState({
    consultation_date: "",
    reason: "",
    diagnosis: "",
    treatment: "",
    veterinarian: "",
    observation: "",
  });

  const [editingOwnerConsultationId, setEditingOwnerConsultationId] = useState(null);

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    rut: "",
    country: "Chile",
    region: "",
    city: "",
    birth_date: "",
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [showResetPassword, setShowResetPassword] = useState(false);

  const [resetPasswordForm, setResetPasswordForm] = useState({
    email: "",
    new_password: "",
    confirm_password: "",
  });

  const [adminUserForm, setAdminUserForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "owner",
    rut: "",
    country: "",
    region: "",
    city: "",
    birth_date: "",
    birth_year: "",
    veterinary_id: "",
    store_id: "",
  });

  const [editingAdminUserId, setEditingAdminUserId] = useState(null);

  const [adminPetForm, setAdminPetForm] = useState({
    name: "",
    species: "",
    species_other: "",
    breed: "",
    breed_other: "",
    age: "",
    age_months: "",
    weight: "",
  });

  const [editingAdminPetId, setEditingAdminPetId] = useState(null);

  const [ownerBreedOptions, setOwnerBreedOptions] = useState([]);
  const [adminBreedOptions, setAdminBreedOptions] = useState([]);
  const [ownerBreedsLoading, setOwnerBreedsLoading] = useState(false);
  const [adminBreedsLoading, setAdminBreedsLoading] = useState(false);

  const [adminVaccineForm, setAdminVaccineForm] = useState({
    name: "",
    application_date: "",
    next_dose_date: "",
    observation: "",
  });

  const [editingVaccineId, setEditingVaccineId] = useState(null);

  const [adminMedicationForm, setAdminMedicationForm] = useState({
    name: "",
    dose: "",
    frequency: "",
    start_date: "",
    end_date: "",
    reminder_times: "08:00,20:00",
    observation: "",
  });

  const [editingMedicationId, setEditingMedicationId] = useState(null);

  const [adminConsultationForm, setAdminConsultationForm] = useState({
    consultation_date: "",
    reason: "",
    diagnosis: "",
    treatment: "",
    veterinarian: "",
    observation: "",
  });

  const [editingConsultationId, setEditingConsultationId] = useState(null);

  const [adminPrescriptions, setAdminPrescriptions] = useState([]);
  const [adminClinicalEditor, setAdminClinicalEditor] = useState(null);

  const [adminClinicalCatalog, setAdminClinicalCatalog] = useState({
    consultation_reason: [],
    vaccine: [],
    medication: [],
    dose: [],
    frequency: [],
    duration: [],
  });

  const [adminVaccineNextDosePreset, setAdminVaccineNextDosePreset] =
    useState("");

  const [adminMedicationDurationPreset, setAdminMedicationDurationPreset] =
    useState("");

  const [adminPrescriptionForm, setAdminPrescriptionForm] = useState({
    veterinary_id: "",
    issue_date: new Date().toISOString().slice(0, 10),
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  const [editingAdminPrescriptionId, setEditingAdminPrescriptionId] =
    useState(null);

  useEffect(() => {
    if (token) {
      loadSession(token);
    }
  }, []);

  useEffect(() => {
    getVeterinaryClinics()
      .then((data) => {
        const rows =
          Array.isArray(data) && data.length
            ? data
            : VETMAP_DEMO_CLINICS;

        setClinics(rows);
      })
      .catch(() => {
        setClinics(VETMAP_DEMO_CLINICS);
      });

    loadMarketplaceData(token);
  }, []);

  useEffect(() => {
    if (!token) return;

    const pendingMercadoPagoOrder = sessionStorage.getItem(
      "vetmap_mp_order_id"
    );

    if (pendingMercadoPagoOrder) {
      monitorMercadoPagoOrder(
        pendingMercadoPagoOrder,
        true
      );
    }
  }, [token]);

  useEffect(() => {
    if (currentUser?.role !== "admin" || (!editingAdminUserId && !editingAdminPetId)) return;
    const frame = requestAnimationFrame(() => {
      document.querySelector(".vm-admin-v10-mode .vmv12-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [editingAdminUserId, editingAdminPetId]);

  useEffect(() => {
    if (!clinicActionModal) {
      return;
    }

    function handleClinicActionEscape(event) {
      if (event.key === "Escape") {
        closeClinicAction();
      }
    }

    window.addEventListener(
      "keydown",
      handleClinicActionEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleClinicActionEscape
      );
    };
  }, [clinicActionModal]);


  useEffect(() => {
    if (!clinicActionModal) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      document
        .querySelectorAll(".vm-clinic-action-body")
        .forEach((element) => {
          element.scrollTop = 0;
        });
    });

    return () => cancelAnimationFrame(frame);
  }, [clinicActionModal]);


  useEffect(() => {
    if (
      !selectedPet &&
      !selectedAdminUser &&
      !clinicActionModal &&
      !adminClinicalEditor
    ) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    selectedPet,
    selectedAdminUser,
    clinicActionModal,
    adminClinicalEditor,
  ]);


  useEffect(() => {
    const species =
      ownerPetForm.species === "Otro"
        ? ownerPetForm.species_other.trim()
        : ownerPetForm.species;

    if (!species) {
      setOwnerBreedOptions([]);
      return;
    }

    const timer = window.setTimeout(() => {
      loadOwnerBreedOptions(species);
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    token,
    ownerPetForm.species,
    ownerPetForm.species_other,
  ]);


  useEffect(() => {
    const species =
      adminPetForm.species === "Otro"
        ? adminPetForm.species_other.trim()
        : adminPetForm.species;

    if (!species) {
      setAdminBreedOptions([]);
      return;
    }

    const timer = window.setTimeout(() => {
      loadAdminBreedOptions(species);
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    token,
    adminPetForm.species,
    adminPetForm.species_other,
  ]);


  useEffect(() => {
    if (!token) {
      setNotifications([]);
    notificationSeenIdsRef.current = new Set();
    notificationInitialLoadRef.current = true;
      setNotificationsOpen(false);
      return;
    }

    loadNotifications(token);

    const notificationTimer = window.setInterval(
      () => loadNotifications(token, true),
      15000
    );

    return () => {
      window.clearInterval(notificationTimer);
    };
  }, [token]);

  function firstName(value) {
    return String(value || "")
      .trim()
      .split(/\s+/)[0] || "Usuario";
  }


  function parseVetMapDate(value) {
    if (!value) return null;

    const text = String(value);
    const hasTimezone =
      /Z$|[+-]\d{2}:\d{2}$/.test(text);

    const date = new Date(
      hasTimezone ? text : `${text}Z`
    );

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  function adminUserActivityDate(user) {
    return (
      parseVetMapDate(user.last_seen_at) ||
      parseVetMapDate(user.last_login_at)
    );
  }

  function adminRecentlyActiveUsers() {
    return adminUsers
      .filter((user) =>
        adminUserActivityDate(user)
      )
      .sort(
        (a, b) =>
          adminUserActivityDate(b).getTime() -
          adminUserActivityDate(a).getTime()
      )
      .slice(0, 5);
  }

  function adminRecentRegistrations() {
    return adminUsers
      .filter((user) =>
        parseVetMapDate(user.created_at)
      )
      .sort(
        (a, b) =>
          parseVetMapDate(b.created_at).getTime() -
          parseVetMapDate(a.created_at).getTime()
      )
      .slice(0, 5);
  }

  function adminActivityLabel(user) {
    const date = adminUserActivityDate(user);

    if (!date) {
      return "Sin actividad";
    }

    const minutes = Math.max(
      0,
      Math.floor(
        (Date.now() - date.getTime()) / 60000
      )
    );

    if (minutes <= 10) return "Activo ahora";
    if (minutes < 60) return `Hace ${minutes} min`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `Hace ${hours} h`;

    const days = Math.floor(hours / 24);

    if (days <= 7) return `Hace ${days} d`;

    return date.toLocaleDateString(
      "es-CL",
      {
        day: "2-digit",
        month: "short",
      }
    );
  }

  function adminRegistrationLabel(user) {
    const date = parseVetMapDate(
      user.created_at
    );

    if (!date) {
      return "Fecha no disponible";
    }

    const today = new Date();

    const dateDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const todayDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const days = Math.round(
      (todayDay - dateDay) / 86400000
    );

    if (days === 0) return "Registrado hoy";
    if (days === 1) return "Registrado ayer";
    if (days <= 7) return `Hace ${days} días`;

    return date.toLocaleDateString(
      "es-CL",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }


  function adminUpcomingReservations() {
    return reservations
      .filter(
        (item) =>
          item.status !== "completed" &&
          item.status !== "cancelled"
      )
      .sort((a, b) => {
        const aValue = `${a.appointment_date || ""} ${a.appointment_time || ""}`;
        const bValue = `${b.appointment_date || ""} ${b.appointment_time || ""}`;
        return aValue.localeCompare(bValue);
      });
  }


  function adminRoleCount(role) {
    return adminUsers.filter(
      (user) => user.role === role
    ).length;
  }

  function adminActiveReservationsCount() {
    return reservations.filter(
      (reservation) =>
        reservation.status !== "completed" &&
        reservation.status !== "cancelled"
    ).length;
  }

  function adminPendingReservationsCount() {
    return reservations.filter(
      (reservation) =>
        reservation.status === "pending"
    ).length;
  }

  function adminActiveProductsCount() {
    return adminProducts.filter(
      (product) => product.active !== false
    ).length;
  }

  function adminLowStockProducts() {
    return adminProducts.filter(
      (product) =>
        product.active !== false &&
        Number(product.stock || 0) <= 5
    );
  }

  function adminConfirmedReservationsCount() {
    return reservations.filter(
      (reservation) =>
        reservation.status === "confirmed"
    ).length;
  }


  function roleLabel(role) {
    if (role === "admin") return "Administrador";
    if (role === "owner") return "Dueño de mascota";
    if (role === "vet") return "Veterinaria";
    if (role === "store") return "Tienda";
    return role || "Sin rol";
  }

  function showSuccessToast(
    title,
    detail,
    label = "REALIZADO",
    icon = "✓",
    tone = "success"
  ) {
    if (successToastTimerRef.current) {
      window.clearTimeout(
        successToastTimerRef.current
      );
    }

    setSuccessToast({
      title,
      detail,
      label,
      icon,
      tone,
    });

    successToastTimerRef.current =
      window.setTimeout(() => {
        setSuccessToast(null);
        successToastTimerRef.current = null;
      }, 5000);
  }

  function closeSuccessToast() {
    if (successToastTimerRef.current) {
      window.clearTimeout(
        successToastTimerRef.current
      );

      successToastTimerRef.current = null;
    }

    setSuccessToast(null);
  }


  function openConfirmDialog({
    title = "Confirmar acción",
    message = "",
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    tone = "default",
  }) {
    return new Promise((resolve) => {
      confirmDialogResolverRef.current = resolve;

      setConfirmDialog({
        open: true,
        title,
        message,
        confirmText,
        cancelText,
        tone,
      });
    });
  }

  function closeConfirmDialog(result = false) {
    setConfirmDialog((current) => ({
      ...current,
      open: false,
    }));

    if (confirmDialogResolverRef.current) {
      confirmDialogResolverRef.current(result);
      confirmDialogResolverRef.current = null;
    }
  }


  async function loadNotifications(
    sessionToken = token,
    silent = false
  ) {
    if (!sessionToken) return;

    try {
      const data = await getNotifications(sessionToken);

      const reminderCategories = new Set([
        "medication_reminder",
        "appointment_reminder",
        "appointment_reminder_soon",
      ]);

      if (notificationInitialLoadRef.current) {
        notificationSeenIdsRef.current = new Set(
          data.map((item) => item.id)
        );
        notificationInitialLoadRef.current = false;
      } else {
        const newReminder = data.find(
          (item) =>
            reminderCategories.has(item.category) &&
            !notificationSeenIdsRef.current.has(item.id)
        );

        if (newReminder) {
          const isMedication =
            newReminder.category ===
            "medication_reminder";

          showSuccessToast(
            newReminder.title,
            newReminder.message,
            isMedication
              ? "RECORDATORIO DE MEDICAMENTO"
              : "RECORDATORIO DE RESERVA",
            isMedication ? "💊" : "📅",
            "reminder"
          );
        }

        notificationSeenIdsRef.current = new Set(
          data.map((item) => item.id)
        );
      }

      setNotifications(data);
    } catch (err) {
      if (!silent) {
        setMessage(err.message);
      }
    }
  }

  function notificationIcon(category) {
    if (category === "payment") return "✅";
    if (category === "order") return "📦";
    if (category === "reservation") return "📅";
    if (category === "medication_reminder") return "💊";
    if (
      category === "appointment_reminder" ||
      category === "appointment_reminder_soon"
    ) {
      return "⏰";
    }
    return "🔔";
  }

  function notificationDate(value) {
    if (!value) return "";

    try {
      return new Date(value).toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  async function openNotification(notification) {
    try {
      if (!notification.is_read) {
        await markNotificationRead(
          token,
          notification.id
        );

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );
      }
    } catch {
      // La navegación sigue funcionando aunque falle el marcado.
    }

    setNotificationsOpen(false);

    if (
      notification.entity_type === "order" ||
      notification.category === "payment"
    ) {
      if (currentUser?.role === "store") {
        await loadStoreData(token);
        setMemberSection("storeOrders");
      } else {
        await loadMarketplaceData(token);
        setMemberSection("orders");
      }

      return;
    }

    if (notification.entity_type === "medication") {
      setShowOwnerPetForm(false);
      setAccountMode("pets");
      setMemberSection("cuenta");
      return;
    }

    if (notification.entity_type === "reservation") {
      if (currentUser?.role === "vet") {
        await loadClinicData(token);
        setMemberSection("clinicAgenda");
      } else {
        await loadReservationData(token);
        setMemberSection("reserva");
      }
    }
  }

  async function readAllNotifications() {
    try {
      await markAllNotificationsRead(token);

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  function convertKgToLb(weightInKg) {
    return (weightInKg * 2.20462).toFixed(1);
  }

  function formatWeight(weight) {
    if (weight == null) {
      return "No registrado";
    }

    return `${weight} kg / ${convertKgToLb(weight)} lb`;
  }

  function formatAge(years, months) {
    const petYears = Number(years || 0);
    const petMonths = Number(months || 0);

    if (petYears === 0 && petMonths === 0) {
      return "No registrada";
    }

    const yearText =
      petYears === 1
        ? "1 año"
        : petYears > 1
        ? `${petYears} años`
        : "";

    const monthText =
      petMonths === 1
        ? "1 mes"
        : petMonths > 1
        ? `${petMonths} meses`
        : "";

    if (yearText && monthText) {
      return `${yearText} y ${monthText}`;
    }

    return yearText || monthText;
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "No registrada";
    }

    const [year, month, day] = dateValue.split("-");

    if (!year || !month || !day) {
      return dateValue;
    }

    return `${day}/${month}/${year}`;
  }

  function isKnownPetSpecies(species) {
    return VETMAP_PET_SPECIES
      .filter((item) => item !== "Otro")
      .some(
        (item) =>
          item.toLowerCase() ===
          String(species || "").toLowerCase()
      );
  }

  function effectiveOwnerSpecies() {
    return ownerPetForm.species === "Otro"
      ? ownerPetForm.species_other.trim()
      : ownerPetForm.species;
  }

  function effectiveAdminSpecies() {
    return adminPetForm.species === "Otro"
      ? adminPetForm.species_other.trim()
      : adminPetForm.species;
  }

  function breedFieldLabel(species) {
    const normalized = String(
      species || ""
    ).toLowerCase();

    if (
      normalized.includes("perro") ||
      normalized.includes("gato") ||
      normalized.includes("conejo") ||
      normalized.includes("hámster") ||
      normalized.includes("hamster") ||
      normalized.includes("cobayo") ||
      normalized.includes("hurón") ||
      normalized.includes("huron") ||
      normalized.includes("chinchilla") ||
      normalized.includes("ratón") ||
      normalized.includes("raton") ||
      normalized.includes("rata") ||
      normalized.includes("cerdo")
    ) {
      return "Raza / variedad";
    }

    if (
      normalized.includes("pez") ||
      normalized.includes("ave") ||
      normalized.includes("loro") ||
      normalized.includes("canario") ||
      normalized.includes("periquito") ||
      normalized.includes("agapornis") ||
      normalized.includes("gallina") ||
      normalized.includes("pato")
    ) {
      return "Especie / variedad";
    }

    if (
      normalized.includes("iguana") ||
      normalized.includes("gecko") ||
      normalized.includes("serpiente") ||
      normalized.includes("tortuga") ||
      normalized.includes("rana") ||
      normalized.includes("ajolote") ||
      normalized.includes("araña") ||
      normalized.includes("arana") ||
      normalized.includes("insecto")
    ) {
      return "Variedad / tipo";
    }

    return "Raza / variedad / tipo";
  }

  function breedPlaceholder(species) {
    const normalized = String(
      species || ""
    ).toLowerCase();

    if (normalized.includes("perro")) {
      return "Ej: Akita Americano";
    }

    if (normalized.includes("gato")) {
      return "Ej: Bosque de Noruega";
    }

    if (normalized.includes("pez")) {
      return "Ej: Betta Halfmoon";
    }

    if (normalized.includes("iguana")) {
      return "Ej: Iguana verde";
    }

    if (
      normalized.includes("ave") ||
      normalized.includes("loro") ||
      normalized.includes("canario") ||
      normalized.includes("periquito")
    ) {
      return "Ej: Diamante mandarín";
    }

    return "Escribe la raza, variedad o tipo";
  }

  async function loadOwnerBreedOptions(
    species = effectiveOwnerSpecies()
  ) {
    if (!token || !species) {
      setOwnerBreedOptions([]);
      return;
    }

    setOwnerBreedsLoading(true);

    try {
      const rows = await getPetBreeds(
        token,
        species
      );

      setOwnerBreedOptions(rows);
    } catch (err) {
      setOwnerBreedOptions([]);
    } finally {
      setOwnerBreedsLoading(false);
    }
  }

  async function loadAdminBreedOptions(
    species = effectiveAdminSpecies()
  ) {
    if (!token || !species) {
      setAdminBreedOptions([]);
      return;
    }

    setAdminBreedsLoading(true);

    try {
      const rows = await getPetBreeds(
        token,
        species
      );

      setAdminBreedOptions(rows);
    } catch (err) {
      setAdminBreedOptions([]);
    } finally {
      setAdminBreedsLoading(false);
    }
  }


  function getPetEmoji(species) {
    const normalizedSpecies = String(
      species || ""
    ).toLowerCase();

    if (normalizedSpecies.includes("perro")) return "🐶";
    if (normalizedSpecies.includes("gato")) return "🐱";
    if (normalizedSpecies.includes("conejo")) return "🐰";
    if (normalizedSpecies.includes("hámster")) return "🐹";
    if (normalizedSpecies.includes("hamster")) return "🐹";
    if (normalizedSpecies.includes("cobayo")) return "🐹";
    if (normalizedSpecies.includes("hurón")) return "🦦";
    if (normalizedSpecies.includes("huron")) return "🦦";
    if (normalizedSpecies.includes("tortuga")) return "🐢";
    if (normalizedSpecies.includes("pez")) return "🐠";
    if (normalizedSpecies.includes("loro")) return "🦜";
    if (normalizedSpecies.includes("canario")) return "🐦";
    if (normalizedSpecies.includes("periquito")) return "🐦";
    if (normalizedSpecies.includes("agapornis")) return "🐦";
    if (normalizedSpecies.includes("ave")) return "🐦";
    if (normalizedSpecies.includes("gallina")) return "🐔";
    if (normalizedSpecies.includes("pato")) return "🦆";
    if (normalizedSpecies.includes("erizo")) return "🦔";
    if (normalizedSpecies.includes("chinchilla")) return "🐭";
    if (normalizedSpecies.includes("ratón")) return "🐭";
    if (normalizedSpecies.includes("raton")) return "🐭";
    if (normalizedSpecies.includes("rata")) return "🐭";
    if (normalizedSpecies.includes("iguana")) return "🦎";
    if (normalizedSpecies.includes("gecko")) return "🦎";
    if (normalizedSpecies.includes("serpiente")) return "🐍";
    if (normalizedSpecies.includes("rana")) return "🐸";
    if (normalizedSpecies.includes("ajolote")) return "🦎";
    if (normalizedSpecies.includes("araña")) return "🕷️";
    if (normalizedSpecies.includes("arana")) return "🕷️";
    if (normalizedSpecies.includes("insecto")) return "🦗";
    if (normalizedSpecies.includes("cerdo")) return "🐷";

    return "🐾";
  }

  function getOwnerById(ownerId) {
    return adminUsers.find((user) => user.id === ownerId);
  }

  function clearOwnerPetForm() {
    setOwnerPetForm({
      name: "",
      species: "",
      species_other: "",
      breed: "",
      breed_other: "",
      age: "",
      age_months: "",
      weight: "",
      birth_date: "",
      photo_data: "",
      additional_info: "",
      medical_background: "",
      feeding_info: "",
    });

    setEditingOwnerPetId(null);
  }

  function clearOwnerVaccineForm() {
    setOwnerVaccineForm({
      name: "",
      application_date: "",
      next_dose_date: "",
      observation: "",
    });

    setEditingOwnerVaccineId(null);
  }

  function clearOwnerMedicationForm() {
    setOwnerMedicationForm({
      name: "",
      dose: "",
      frequency: "",
      start_date: "",
      end_date: "",
      observation: "",
    });

    setEditingOwnerMedicationId(null);
  }

  function clearOwnerConsultationForm() {
    setOwnerConsultationForm({
      consultation_date: "",
      reason: "",
      diagnosis: "",
      treatment: "",
      veterinarian: "",
      observation: "",
    });

    setEditingOwnerConsultationId(null);
  }

  function clearAdminUserForm() {
    setAdminUserForm({
      name: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "owner",
      rut: "",
      country: "",
      region: "",
      city: "",
      birth_date: "",
      birth_year: "",
      veterinary_id: "",
      store_id: "",
    });

    setEditingAdminUserId(null);
  }


  function clearAdminProductForm() {
    setAdminProductForm({
      store_id: "",
      name: "",
      brand: "",
      category: "Alimentos",
      animal_type: "Perros",
      format: "",
      description: "",
      price: "",
      stock: "",
      image_data: "",
      active: true,
    });

    setEditingAdminProductId(null);
  }

  function filteredAdminProducts() {
    const search = normalizeClinicText(
      adminProductSearch
    );

    return adminProducts.filter((product) => {
      const matchesSearch =
        !search ||
        normalizeClinicText(product.name).includes(search) ||
        normalizeClinicText(product.brand).includes(search) ||
        normalizeClinicText(product.category).includes(search) ||
        normalizeClinicText(product.format).includes(search) ||
        normalizeClinicText(product.store_name).includes(search);

      const matchesStore =
        adminProductStoreFilter === "all" ||
        String(product.store_id) ===
          String(adminProductStoreFilter);

      return matchesSearch && matchesStore;
    });
  }

  async function saveAdminProduct(e) {
    e.preventDefault();

    if (
      !adminProductForm.store_id ||
      !adminProductForm.name ||
      adminProductForm.price === "" ||
      adminProductForm.stock === ""
    ) {
      setMessage(
        "Selecciona una tienda y completa nombre, precio y stock."
      );
      return;
    }

    if (!validateProductPrice(adminProductForm.price)) return;
    if (Number(adminProductForm.stock) < 0) {
      setMessage("El stock no puede ser negativo.");
      return;
    }

    const payload = {
      store_id: Number(adminProductForm.store_id),
      name: adminProductForm.name,
      brand: adminProductForm.brand || null,
      category: adminProductForm.category,
      animal_type:
        adminProductForm.animal_type || null,
      format: adminProductForm.format || null,
      description:
        adminProductForm.description || null,
      price: Number(adminProductForm.price),
      stock: Number(adminProductForm.stock),
      image_data:
        adminProductForm.image_data || null,
      active: true,
    };

    try {
      if (editingAdminProductId) {
        await updateAdminStoreProduct(
          token,
          editingAdminProductId,
          payload
        );

        setMessage(
          "Producto actualizado por el administrador."
        );
      } else {
        await createAdminStoreProduct(
          token,
          payload
        );

        setMessage(
          "Producto agregado por el administrador."
        );
      }

      clearAdminProductForm();

      const productsData =
        await getAdminStoreProducts(token);

      setAdminProducts(productsData);

      await loadMarketplaceData(token);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEditAdminProduct(product) {
    setEditingAdminProductId(product.id);

    setAdminProductForm({
      store_id: String(product.store_id),
      name: product.name || "",
      brand: product.brand || "",
      category:
        product.category || "Alimentos",
      animal_type:
        product.animal_type || "Perros",
      format: product.format || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image_data: product.image_data || "",
      active: true,
    });

    setAdminActiveTab("productos");

    setMessage(
      `Editando ${product.name} de ${product.store_name}.`
    );

    window.setTimeout(() => {
      document
        .getElementById("admin-product-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  async function removeAdminProduct(product) {
    const confirmed = await openConfirmDialog({
      title: "Eliminar producto",
      message:
        `¿Quieres quitar "${product.name}" del catálogo de ${product.store_name}?`,
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminStoreProduct(
        token,
        product.id
      );

      const productsData =
        await getAdminStoreProducts(token);

      setAdminProducts(productsData);

      await loadMarketplaceData(token);

      if (
        editingAdminProductId ===
        product.id
      ) {
        clearAdminProductForm();
      }

      setMessage(
        "Producto eliminado del catálogo."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  function clearAdminPetForm() {
    setAdminPetForm({
      name: "",
      species: "",
      species_other: "",
      breed: "",
      breed_other: "",
      age: "",
      age_months: "",
      weight: "",
    });

    setEditingAdminPetId(null);
  }

  function clearAdminVaccineForm() {
    setAdminVaccineForm({
      name: "",
      application_date: "",
      next_dose_date: "",
      observation: "",
    });

    setEditingVaccineId(null);
  }

  function clearAdminMedicationForm() {
    setAdminMedicationForm({
      name: "",
      dose: "",
      frequency: "",
      start_date: "",
      end_date: "",
      reminder_times: "08:00,20:00",
      observation: "",
    });

    setEditingMedicationId(null);
  }

  function clearAdminConsultationForm() {
    setAdminConsultationForm({
      consultation_date: "",
      reason: "",
      diagnosis: "",
      treatment: "",
      veterinarian: "",
      observation: "",
    });

    setEditingConsultationId(null);
  }

  function clearAdminPrescriptionForm() {
    setAdminPrescriptionForm({
      veterinary_id: "",
      issue_date: new Date().toISOString().slice(0, 10),
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });

    setEditingAdminPrescriptionId(null);
  }

  async function loadAdminClinicalCatalogOptions(
    categories,
    pet = selectedPet
  ) {
    if (!pet || !token) {
      return;
    }

    try {
      const results = await Promise.all(
        categories.map(async (category) => [
          category,
          await getAdminClinicalCatalog(
            token,
            category,
            pet.species || ""
          ),
        ])
      );

      setAdminClinicalCatalog((current) => ({
        ...current,
        ...Object.fromEntries(results),
      }));
    } catch (err) {
      setMessage(err.message);
    }
  }

  function applyAdminVaccineNextDosePreset(value) {
    setAdminVaccineNextDosePreset(value);

    if (!value || value === "manual") {
      return;
    }

    setAdminVaccineForm((current) => ({
      ...current,
      next_dose_date: addDaysToClinicDate(
        current.application_date ||
          new Date().toISOString().slice(0, 10),
        value
      ),
    }));
  }

  function applyAdminMedicationDurationPreset(value) {
    setAdminMedicationDurationPreset(value);

    if (!value || value === "manual") {
      return;
    }

    setAdminMedicationForm((current) => ({
      ...current,
      end_date: addDaysToClinicDate(
        current.start_date ||
          new Date().toISOString().slice(0, 10),
        value
      ),
    }));
  }

  function closeAdminClinicalEditor() {
    setAdminClinicalEditor(null);
    setAdminVaccineNextDosePreset("");
    setAdminMedicationDurationPreset("");
  }

  async function openAdminClinicalEditor(
    action,
    item = null
  ) {
    if (!selectedPet) {
      setMessage("Selecciona una mascota.");
      return;
    }

    const categoriesByAction = {
      consultation: ["consultation_reason"],
      vaccine: ["vaccine"],
      medication: [
        "medication",
        "dose",
        "frequency",
      ],
      prescription: [
        "medication",
        "dose",
        "frequency",
        "duration",
        "instructions",
      ],
    };

    await loadAdminClinicalCatalogOptions(
      categoriesByAction[action] || [],
      selectedPet
    );

    if (action === "consultation") {
      if (item) {
        setEditingConsultationId(item.id);
        setAdminConsultationForm({
          consultation_date:
            item.consultation_date || "",
          reason: item.reason || "",
          diagnosis: item.diagnosis || "",
          treatment: item.treatment || "",
          veterinarian:
            item.veterinarian || "",
          observation: item.observation || "",
        });
      } else {
        clearAdminConsultationForm();
        setAdminConsultationForm((current) => ({
          ...current,
          consultation_date:
            new Date().toISOString().slice(0, 10),
        }));
      }
    }

    if (action === "vaccine") {
      setAdminVaccineNextDosePreset("");

      if (item) {
        setEditingVaccineId(item.id);
        setAdminVaccineForm({
          name: item.name || "",
          application_date:
            item.application_date || "",
          next_dose_date:
            item.next_dose_date || "",
          observation:
            item.observation || "",
        });
      } else {
        clearAdminVaccineForm();
        setAdminVaccineForm((current) => ({
          ...current,
          application_date:
            new Date().toISOString().slice(0, 10),
        }));
      }
    }

    if (action === "medication") {
      setAdminMedicationDurationPreset("");

      if (item) {
        setEditingMedicationId(item.id);
        setAdminMedicationForm({
          name: item.name || "",
          dose: item.dose || "",
          frequency: item.frequency || "",
          start_date:
            item.start_date || "",
          end_date:
            item.end_date || "",
          observation:
            item.observation || "",
        });
      } else {
        clearAdminMedicationForm();
        setAdminMedicationForm((current) => ({
          ...current,
          start_date:
            new Date().toISOString().slice(0, 10),
        }));
      }
    }

    if (action === "prescription") {
      if (item) {
        setEditingAdminPrescriptionId(item.id);
        setAdminPrescriptionForm({
          veterinary_id:
            item.veterinary_id
              ? String(item.veterinary_id)
              : "",
          issue_date:
            item.issue_date ||
            new Date().toISOString().slice(0, 10),
          medication:
            item.medication || "",
          dosage:
            item.dosage || "",
          frequency:
            item.frequency || "",
          duration:
            item.duration || "",
          instructions:
            item.instructions || "",
        });
      } else {
        clearAdminPrescriptionForm();
      }
    }

    setAdminClinicalEditor(action);
  }


  function loadProfileForm(user) {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirm_password: "",
      rut: user?.rut || "",
      country: user?.country || "",
      region: user?.region || "",
      city: user?.city || "",
      birth_date: user?.birth_date || "",
    });
  }

  async function saveMyProfile(e) {
    e.preventDefault();

    if (!profileForm.name || !profileForm.email) {
      setMessage("Debes ingresar nombre y correo.");
      return;
    }

    if (
      (profileForm.password || profileForm.confirm_password) &&
      profileForm.password !== profileForm.confirm_password
    ) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      const result = await updateMe(token, {
        name: profileForm.name,
        email: profileForm.email,
        rut: profileForm.rut || null,
        country: profileForm.country || null,
        region: profileForm.region || null,
        city: profileForm.city || null,
        birth_date: profileForm.birth_date || null,
        password: profileForm.password || null,
        confirm_password: profileForm.confirm_password || null,
      });

      sessionStorage.setItem("vetmap_token", result.access_token);
      setToken(result.access_token);
      setCurrentUser(result.user);
      loadProfileForm(result.user);
      setShowProfileEdit(false);

      setMessage("Tu perfil fue actualizado correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function loadSession(sessionToken = token) {
    try {
      const user = await getMe(sessionToken);
      setCurrentUser(user);
      loadProfileForm(user);

      if (user.role === "admin") {
        setAdminActiveTab("usuarios");
        await loadAdminData(sessionToken);
        await loadReservationData(sessionToken);
        await loadMarketplaceData(sessionToken);
      } else if (user.role === "vet") {
        setMemberSection("inicio");
        await loadClinicData(sessionToken);
      } else if (user.role === "store") {
        setMemberSection("inicio");
        await loadStoreData(sessionToken);
        await loadMarketplaceData(sessionToken);
      } else {
        await loadOwnerPets(sessionToken);
        await loadReservationData(sessionToken);
        await loadMarketplaceData(sessionToken);
      }
    } catch (err) {
      sessionStorage.removeItem("vetmap_token");
      setToken("");
      setCurrentUser(null);
      setMessage("Tu sesión expiró. Inicia sesión nuevamente.");
    }
  }

  async function loadOwnerPets(sessionToken = token) {
    try {
      const data = await getPets(sessionToken);
      setPets(data);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function loadAdminData(sessionToken = token) {
    try {
      const [
        usersData,
        petsData,
        productsData,
      ] = await Promise.all([
        getAdminUsers(sessionToken),
        getAdminPets(sessionToken),
        getAdminStoreProducts(sessionToken),
      ]);

      setAdminUsers(usersData);
      setAdminPets(petsData);
      setAdminProducts(productsData);
    } catch (err) {
      setMessage(err.message);
    }
  }


  function clearReservationForm() {
    setReservationForm({
      pet_id: "",
      veterinary_id: "",
      service: "",
      appointment_date: "",
      appointment_time: "",
      notes: "",
    });

    setReservationAvailability(null);
    setReservationConfirmOpen(false);
  }

  function selectedReservationPet() {
    return (
      pets.find(
        (pet) =>
          String(pet.id) ===
          String(reservationForm.pet_id)
      ) || null
    );
  }

  function selectedReservationClinic() {
    return (
      clinics.find(
        (clinic) =>
          String(clinic.id) ===
          String(reservationForm.veterinary_id)
      ) || null
    );
  }

  function reservationClinicServices(clinic) {
    if (!clinic?.services) {
      return [];
    }

    return clinic.services
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function todayInputValue() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(
      now.getTime() - offset * 60 * 1000
    );

    return local.toISOString().slice(0, 10);
  }

  async function loadReservationAvailability(
    veterinaryId = reservationForm.veterinary_id,
    appointmentDate = reservationForm.appointment_date
  ) {
    if (!token || !veterinaryId || !appointmentDate) {
      setReservationAvailability(null);
      return;
    }

    setReservationAvailabilityLoading(true);

    try {
      const data = await getReservationAvailability(
        token,
        veterinaryId,
        appointmentDate
      );

      setReservationAvailability(data);

      const selectedStillAvailable =
        data.slots?.some(
          (slot) =>
            slot.time ===
              reservationForm.appointment_time &&
            slot.available
        );

      if (
        reservationForm.appointment_time &&
        !selectedStillAvailable
      ) {
        setReservationForm((current) => ({
          ...current,
          appointment_time: "",
        }));
      }
    } catch (err) {
      setReservationAvailability(null);
      setMessage(err.message);
    } finally {
      setReservationAvailabilityLoading(false);
    }
  }

  function requestReservationConfirmation(e) {
    e.preventDefault();

    if (
      !reservationForm.pet_id ||
      !reservationForm.veterinary_id ||
      !reservationForm.service ||
      !reservationForm.appointment_date ||
      !reservationForm.appointment_time
    ) {
      setMessage(
        "Selecciona mascota, veterinaria, servicio, fecha y un horario disponible."
      );
      return;
    }

    const slot = reservationAvailability?.slots?.find(
      (item) =>
        item.time ===
        reservationForm.appointment_time
    );

    if (slot && !slot.available) {
      setMessage(
        "Ese horario ya no está disponible. Selecciona otro."
      );
      return;
    }

    setReservationConfirmOpen(true);
  }


  async function loadReservationData(sessionToken = token) {
    try {
      const clinicsData = await getVeterinaryClinics();
      const reservationsData = await getReservations(sessionToken);

      setClinics(
        Array.isArray(clinicsData) && clinicsData.length
          ? clinicsData
          : VETMAP_DEMO_CLINICS
      );

      setReservations(
        Array.isArray(reservationsData)
          ? reservationsData
          : []
      );
    } catch (err) {
      setClinics((current) =>
        Array.isArray(current) && current.length
          ? current
          : VETMAP_DEMO_CLINICS
      );
      setMessage(err.message);
    }
  }

  async function saveReservation() {
    if (
      !reservationForm.pet_id ||
      !reservationForm.veterinary_id ||
      !reservationForm.service ||
      !reservationForm.appointment_date ||
      !reservationForm.appointment_time
    ) {
      setReservationConfirmOpen(false);
      setMessage(
        "Faltan datos para completar la reserva."
      );
      return;
    }

    try {
      const selectedPet = pets.find(
        (pet) =>
          String(pet.id) ===
          String(reservationForm.pet_id)
      );

      const selectedClinic = clinics.find(
        (clinic) =>
          String(clinic.id) ===
          String(reservationForm.veterinary_id)
      );

      const reservationDate =
        reservationForm.appointment_date;
      const reservationTime =
        reservationForm.appointment_time;

      await createReservation(token, {
        pet_id: Number(reservationForm.pet_id),
        veterinary_id: Number(reservationForm.veterinary_id),
        service: reservationForm.service,
        appointment_date: reservationDate,
        appointment_time: reservationTime,
        notes: reservationForm.notes || null,
      });

      setReservationConfirmOpen(false);
      clearReservationForm();
      await loadReservationData();
      await loadNotifications(token, true);

      showSuccessToast(
        "¡Hora agendada!",
        `${
          selectedPet?.name || "Tu mascota"
        } · ${
          selectedClinic?.name || "Veterinaria VetMap"
        } · ${reservationDate} · ${reservationTime}`,
        "RESERVA REALIZADA"
      );

      setMessage("Reserva registrada correctamente.");
    } catch (err) {
      setReservationConfirmOpen(false);
      await loadReservationAvailability();
      setMessage(err.message);
    }
  }

  async function cancelMyReservation(appointmentId) {
    const confirmCancel = await openConfirmDialog({
      title: "Cancelar reserva",
      message:
        "¿Quieres cancelar esta reserva?\n\n" +
        "La veterinaria será notificada del cambio.",
      confirmText: "Sí, cancelar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmCancel) {
      return;
    }

    try {
      await cancelReservation(token, appointmentId);
      await loadReservationData();

      if (
        reservationForm.veterinary_id &&
        reservationForm.appointment_date
      ) {
        await loadReservationAvailability();
      }

      setMessage("Reserva cancelada correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function cleanOwnerReservation(
    appointmentId
  ) {
    const confirmed = await openConfirmDialog({
      title: "Quitar reserva del historial",
      message:
        "Esta reserva dejará de aparecer en tu historial.\n\n" +
        "¿Deseas continuar?",
      confirmText: "Sí, quitar",
      cancelText: "Volver",
      tone: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      await archiveReservation(
        token,
        appointmentId
      );

      await loadReservationData();

      setMessage(
        "Reserva quitada del historial."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function cleanAllOwnerFinalReservations() {
    const finalCount = reservations.filter(
      (reservation) =>
        reservation.status === "completed" ||
        reservation.status === "cancelled"
    ).length;

    if (!finalCount) {
      setMessage(
        "No tienes reservas completadas o canceladas para limpiar."
      );
      return;
    }

    const confirmed = await openConfirmDialog({
      title: "Limpiar reservas finalizadas",
      message:
        `Se quitarán ${finalCount} reserva(s) finalizada(s) de tu historial.\n\n` +
        "¿Deseas continuar?",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
      tone: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      const result =
        await archiveFinalReservations(token);

      await loadReservationData();

      setMessage(
        result.message ||
          "Historial limpiado correctamente."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function cleanAdminReservation(
    appointmentId
  ) {
    const confirmed = await openConfirmDialog({
      title: "Quitar reserva del historial",
      message:
        "Esta reserva finalizada dejará de aparecer en la vista del administrador.\n\n" +
        "La reserva seguirá disponible para el dueño y la veterinaria.",
      confirmText: "Sí, quitar",
      cancelText: "Volver",
      tone: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      await archiveAdminReservation(
        token,
        appointmentId
      );

      await loadReservationData();

      setMessage(
        "Reserva quitada del historial administrativo."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function cleanAllAdminFinalReservations() {
    const finalCount = reservations.filter(
      (reservation) =>
        reservation.status === "completed" ||
        reservation.status === "cancelled"
    ).length;

    if (!finalCount) {
      setMessage(
        "No hay reservas finalizadas para limpiar."
      );
      return;
    }

    const confirmed = await openConfirmDialog({
      title: "Limpiar reservas finalizadas",
      message:
        `Se quitarán ${finalCount} reserva(s) finalizada(s) de la vista del administrador.\n\n` +
        "No se eliminarán para los usuarios ni para las veterinarias.",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
      tone: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      const result =
        await archiveAllAdminFinalReservations(
          token
        );

      await loadReservationData();

      setMessage(
        result.message ||
          "Historial administrativo limpiado."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function changeReservationStatus(
    appointmentId,
    newStatus,
    currentStatus
  ) {
    if (
      currentStatus === "completed" ||
      currentStatus === "cancelled"
    ) {
      setMessage(
        "Esta reserva tiene un estado final y ya no puede modificarse."
      );
      return;
    }

    if (newStatus === currentStatus) {
      return;
    }

    if (
      newStatus === "completed" ||
      newStatus === "cancelled"
    ) {
      const finalLabel =
        newStatus === "completed"
          ? "completada"
          : "cancelada";

      const confirmed = await openConfirmDialog({
        title:
          newStatus === "completed"
            ? "Completar reserva"
            : "Cancelar reserva",
        message:
          `La reserva quedará ${finalLabel} y este cambio será definitivo.\n\n` +
          "Después no podrás volver a modificar su estado.",
        confirmText:
          newStatus === "completed"
            ? "Sí, completar"
            : "Sí, cancelar",
        cancelText: "Volver",
        tone:
          newStatus === "completed"
            ? "success"
            : "danger",
      });

      if (!confirmed) {
        await loadReservationData();
        return;
      }
    }

    try {
      await updateReservationStatus(
        token,
        appointmentId,
        newStatus
      );

      await loadReservationData();

      if (
        newStatus === "completed" ||
        newStatus === "cancelled"
      ) {
        setMessage(
          "Estado final guardado. La reserva quedó bloqueada."
        );
      } else {
        setMessage(
          "Estado de reserva actualizado."
        );
      }
    } catch (err) {
      await loadReservationData();
      setMessage(err.message);
    }
  }

  function reservationStatusLabel(status) {
    if (status === "pending") return "Pendiente";
    if (status === "confirmed") return "Confirmada";
    if (status === "completed") return "Completada";
    if (status === "cancelled") return "Cancelada";
    return status;
  }

  function reservationStatusClass(status) {
    if (status === "confirmed") return "confirmed";
    if (status === "completed") return "completed";
    if (status === "cancelled") return "cancelled";
    return "pending";
  }



  function normalizeClinicText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }


  function publicClinicCommunes() {
    return Array.from(
      new Set(
        (clinics || [])
          .map((clinic) => clinic.commune)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }

  function publicClinicServices() {
    return Array.from(
      new Set(
        (clinics || [])
          .flatMap((clinic) =>
            String(clinic.services || "")
              .split(",")
              .map((service) => service.trim())
              .filter(Boolean)
          )
      )
    ).sort((a, b) => a.localeCompare(b));
  }

  function filteredPublicClinics() {
    const search = normalizeClinicText(publicClinicSearch);

    return (clinics || []).filter((clinic) => {
      const matchesSearch =
        !search ||
        normalizeClinicText(clinic.name).includes(search) ||
        normalizeClinicText(clinic.commune).includes(search) ||
        normalizeClinicText(clinic.services).includes(search);

      const matchesCommune =
        publicClinicCommune === "all" ||
        String(clinic.commune) === String(publicClinicCommune);

      const matchesService =
        publicClinicService === "all" ||
        normalizeClinicText(clinic.services).includes(
          normalizeClinicText(publicClinicService)
        );

      return matchesSearch && matchesCommune && matchesService;
    });
  }

  function publicDemoClinicOptions() {
    if (clinics?.length) {
      return clinics.slice(0, 2);
    }

    return [
      {
        id: "demo-huellitas",
        name: "Clínica Huellitas",
        commune: "Santiago",
      },
      {
        id: "demo-norte",
        name: "Centro Animal Norte",
        commune: "Quilicura",
      },
    ];
  }

  function openPublicReservationLogin() {
    const selectedClinic = publicDemoClinicOptions().find(
      (clinic) => String(clinic.id) === String(publicDemoVet)
    );

    if (
      selectedClinic &&
      !String(selectedClinic.id).startsWith("demo-")
    ) {
      setReservationForm((current) => ({
        ...current,
        veterinary_id: String(selectedClinic.id),
        service: publicDemoService || current.service,
      }));
    }

    setPublicSection("auth");
    setAuthActiveTab("login");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function filteredClinicAppointments() {
    const search = normalizeClinicText(clinicAgendaFilters.search);

    return clinicAppointments.filter((item) => {
      const matchesSearch =
        !search ||
        normalizeClinicText(item.pet_name).includes(search) ||
        normalizeClinicText(item.pet_species).includes(search) ||
        normalizeClinicText(item.user_name).includes(search) ||
        normalizeClinicText(item.user_email).includes(search) ||
        normalizeClinicText(item.service).includes(search);

      const matchesDate =
        !clinicAgendaFilters.date ||
        item.appointment_date === clinicAgendaFilters.date;

      const matchesStatus =
        clinicAgendaFilters.status === "all" ||
        item.status === clinicAgendaFilters.status;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }

  function clinicSpeciesOptions() {
    const species = clinicPatients
      .map((patient) => String(patient.species || "").trim())
      .filter(Boolean);

    return [...new Set(species)].sort((a, b) =>
      a.localeCompare(b, "es")
    );
  }

  function filteredClinicPatients() {
    const search = normalizeClinicText(clinicPatientSearch);

    return clinicPatients.filter((patient) => {
      const matchesSearch =
        !search ||
        normalizeClinicText(patient.name).includes(search) ||
        normalizeClinicText(patient.owner_name).includes(search) ||
        normalizeClinicText(patient.owner_email).includes(search) ||
        normalizeClinicText(patient.breed).includes(search);

      const matchesSpecies =
        clinicPatientSpecies === "all" ||
        normalizeClinicText(patient.species) ===
          normalizeClinicText(clinicPatientSpecies);

      return matchesSearch && matchesSpecies;
    });
  }

  function sortedClinicConsultations() {
    const consultations =
      clinicPatientHistory?.consultations || [];

    return [...consultations].sort((a, b) => {
      const aDate = a.consultation_date || "";
      const bDate = b.consultation_date || "";

      if (clinicHistoryOrder === "asc") {
        return aDate.localeCompare(bDate);
      }

      return bDate.localeCompare(aDate);
    });
  }

  function clinicDefaultPrescriptionTemplates() {
    return clinicPrescriptionTemplates.filter(
      (template) => template.is_default
    );
  }

  function clinicCustomPrescriptionTemplates() {
    return clinicPrescriptionTemplates.filter(
      (template) => !template.is_default
    );
  }

  function applyClinicPrescriptionTemplate(templateId) {
    setSelectedClinicPrescriptionTemplateId(templateId);

    if (!templateId) {
      setSaveClinicPrescriptionAsTemplate(true);
      setClinicPrescriptionTemplateName("");
      return;
    }

    const template = clinicPrescriptionTemplates.find(
      (item) => String(item.id) === String(templateId)
    );

    if (!template) {
      return;
    }

    setClinicPrescriptionForm((current) => ({
      ...current,
      medication: template.medication || "",
      dosage: template.dosage || "",
      frequency: template.frequency || "",
      duration: template.duration || "",
      instructions: template.instructions || "",
    }));

    setClinicPrescriptionTemplateName(template.name || "");
    setSaveClinicPrescriptionAsTemplate(false);
  }

  async function removeClinicPrescriptionTemplate(template) {
    if (!template?.can_delete || !template?.db_id) {
      return;
    }

    const confirmed = await openConfirmDialog({
      title: "Eliminar plantilla",
      message:
        `Se eliminará la plantilla "${template.name}".\\n\\n` +
        "Las recetas ya emitidas no se modificarán.",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteClinicPrescriptionTemplate(
        token,
        template.db_id
      );

      const templates = await getClinicPrescriptionTemplates(token);
      setClinicPrescriptionTemplates(templates);

      if (
        String(selectedClinicPrescriptionTemplateId) ===
        String(template.id)
      ) {
        setSelectedClinicPrescriptionTemplateId("");
        setClinicPrescriptionTemplateName("");
        setSaveClinicPrescriptionAsTemplate(true);
      }

      setMessage("Plantilla eliminada correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }


  function filteredClinicPrescriptions() {
    const search = normalizeClinicText(clinicPrescriptionSearch);

    if (!search) {
      return clinicPrescriptions;
    }

    return clinicPrescriptions.filter((item) => {
      return (
        normalizeClinicText(item.pet_name).includes(search) ||
        normalizeClinicText(item.medication).includes(search) ||
        normalizeClinicText(item.dosage).includes(search) ||
        normalizeClinicText(item.frequency).includes(search)
      );
    });
  }

  function clearClinicAgendaFilters() {
    setClinicAgendaFilters({
      search: "",
      date: "",
      status: "all",
    });
  }

  function clearClinicPatientFilters() {
    setClinicPatientSearch("");
    setClinicPatientSpecies("all");
  }


  function formatCLP(value) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function productEmoji(category) {
    const value = String(category || "").toLowerCase();
    if (value.includes("alimento")) return "🥘";
    if (value.includes("higiene")) return "🧴";
    if (value.includes("snack")) return "🦴";
    if (value.includes("accesorio")) return "🦮";
    if (value.includes("salud")) return "🩺";
    return "🛍️";
  }

  const PRODUCT_PRICE_MIN = 1000;
  const PRODUCT_PRICE_MAX = 1000000;

  function productTemplatesForCategory(category) {
    const catalogs = {
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
    return catalogs[category] || catalogs.Otros;
  }

  function productFormatsForCategory(category) {
    const kilograms = Array.from({ length: 30 }, (_, index) => `${index + 1} kg`);
    const catalogs = {
      Alimentos: ["50 g", "100 g", "250 g", "500 g", "750 g", ...kilograms],
      Higiene: ["120 ml", "250 ml", "500 ml", "1 L", "5 L", "1 kg", "2 kg", "5 kg", "10 kg", "15 kg", "20 kg", "Pack 20", "Pack 40"],
      Accesorios: ["1 unidad", "Pack 2", "Talla XS", "Talla S", "Talla M", "Talla L", "Talla XL"],
      Snacks: ["50 g", "100 g", "250 g", "500 g", "1 kg", "Pack 5", "Pack 7", "Pack 12", "Pack 20"],
      Salud: ["10 ml", "30 ml", "60 ml", "120 ml", "250 ml", "30 comprimidos", "60 comprimidos", "90 comprimidos", "1 unidad", "Pack 3"],
      Otros: ["1 unidad", "Pack 2", "Pack 5", "Talla S", "Talla M", "Talla L"],
    };
    return catalogs[category] || catalogs.Otros;
  }

  function applyStoreProductTemplate(templateName) {
    const template = productTemplatesForCategory(storeProductForm.category).find((item) => item.name === templateName);
    if (!template) return;
    setStoreProductForm((current) => ({ ...current, name: template.name, brand: template.brand, animal_type: template.animal_type, format: template.format, description: template.description }));
  }

  function applyAdminProductTemplate(templateName) {
    const template = productTemplatesForCategory(adminProductForm.category).find((item) => item.name === templateName);
    if (!template) return;
    setAdminProductForm((current) => ({ ...current, name: template.name, brand: template.brand, animal_type: template.animal_type, format: template.format, description: template.description }));
  }

  function validateProductPrice(priceValue) {
    const price = Number(priceValue);
    if (!Number.isFinite(price) || price < PRODUCT_PRICE_MIN || price > PRODUCT_PRICE_MAX) {
      setMessage("El precio debe estar entre $1.000 y $1.000.000 CLP.");
      return false;
    }
    return true;
  }


  function orderStatusLabel(status) {
    const labels = {
      pending: "Pendiente",
      preparing: "Preparando",
      ready: "Listo",
      dispatched: "Despachado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  }


  function isFinalStoreOrderStatus(status) {
    return (
      status === "delivered" ||
      status === "cancelled"
    );
  }

  function estimatedDeliveryText(order) {
    const dispatchedAt = trackingDate(
      order,
      "dispatched"
    );

    if (!dispatchedAt) {
      return (
        "Una vez despachado, tu pedido puede llegar " +
        "durante el día o, a más tardar, al día siguiente."
      );
    }

    const latest = new Date(dispatchedAt);
    latest.setDate(latest.getDate() + 1);

    return (
      "Puede llegar durante el día o, a más tardar, " +
      latest.toLocaleDateString(
        "es-CL",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ) +
      "."
    );
  }


  function orderStatusIcon(status) {
    const icons = {
      pending: "🧾",
      preparing: "📦",
      ready: "✅",
      dispatched: "🚚",
      delivered: "🏠",
      cancelled: "✖️",
    };

    return icons[status] || "📍";
  }

  function orderTrackingSteps(order) {
    const normalSteps = [
      {
        key: "pending",
        label: "Pedido recibido",
        description: "La tienda recibió tu pedido.",
      },
      {
        key: "preparing",
        label: "Preparando",
        description: "La tienda está preparando tus productos.",
      },
      {
        key: "ready",
        label: "Listo",
        description: "El pedido ya está preparado.",
      },
      {
        key: "dispatched",
        label: "En camino",
        description: "El pedido fue despachado.",
      },
      {
        key: "delivered",
        label: "Entregado",
        description: "El pedido fue marcado como entregado.",
      },
    ];

    if (order.status === "cancelled") {
      return [
        ...normalSteps.slice(0, 1),
        {
          key: "cancelled",
          label: "Pedido cancelado",
          description: "La tienda marcó el pedido como cancelado.",
        },
      ];
    }

    return normalSteps;
  }

  function trackingDate(order, status) {
    const event = (order.tracking || [])
      .slice()
      .reverse()
      .find((item) => item.status === status);

    return event?.changed_at || null;
  }

  function orderStepState(order, stepKey) {
    const flow = [
      "pending",
      "preparing",
      "ready",
      "dispatched",
      "delivered",
    ];

    if (order.status === "cancelled") {
      if (stepKey === "cancelled") {
        return "current";
      }

      const eventStatuses = new Set(
        (order.tracking || []).map((item) => item.status)
      );

      return eventStatuses.has(stepKey)
        ? "done"
        : "pending";
    }

    const currentIndex = flow.indexOf(order.status);
    const stepIndex = flow.indexOf(stepKey);

    if (stepIndex < currentIndex) {
      return "done";
    }

    if (stepIndex === currentIndex) {
      return "current";
    }

    return "pending";
  }

  function filteredMyOrders() {
    if (orderHistoryFilter === "active") {
      return myStoreOrders.filter(
        (order) =>
          !["delivered", "cancelled"].includes(order.status)
      );
    }

    if (orderHistoryFilter === "completed") {
      return myStoreOrders.filter(
        (order) => order.status === "delivered"
      );
    }

    if (orderHistoryFilter === "cancelled") {
      return myStoreOrders.filter(
        (order) => order.status === "cancelled"
      );
    }

    return myStoreOrders;
  }

  async function cleanMyStoreOrder(order) {
    const confirmed = await openConfirmDialog({
      title: "¿Quitar este pedido?",
      message:
        `Pedido #${order.id} · ${order.store_name}\n\n` +
        "Dejará de aparecer en tu historial de compras, pero la tienda conservará su registro.\n\n" +
        "¿Deseas continuar?",
      confirmText: "Sí, quitar pedido",
      cancelText: "No, volver",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await archiveMyStoreOrder(
        token,
        order.id
      );

      await loadMarketplaceData(token);

      setMessage(
        "Pedido quitado de tu historial."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function cleanMyDeliveredOrders() {
    const deliveredCount =
      myStoreOrders.filter(
        (order) =>
          order.status === "delivered"
      ).length;

    if (!deliveredCount) {
      setMessage(
        "No tienes pedidos entregados para limpiar."
      );
      return;
    }

    const confirmed = await openConfirmDialog({
      title: "¿Limpiar pedidos entregados?",
      message:
        `Se quitarán ${deliveredCount} pedido(s) entregado(s) de tu historial visible.\n\n` +
        "Las tiendas conservarán sus registros.\n\n" +
        "¿Deseas continuar?",
      confirmText: "Sí, limpiar historial",
      cancelText: "No, conservar",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      const result =
        await archiveMyDeliveredOrders(
          token
        );

      await loadMarketplaceData(token);

      setMessage(
        result.message ||
          "Pedidos entregados limpiados."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }


  async function loadMarketplaceData(sessionToken = token) {
    let storesLoaded = false;
    let productsLoaded = false;
    let publicLoadError = false;

    try {
      const storesData = await getStorefrontStores();

      if (Array.isArray(storesData) && storesData.length) {
        setMarketStores(storesData);
        storesLoaded = true;
      } else {
        setMarketStores(VETMAP_DEMO_STORES);
      }
    } catch {
      setMarketStores(VETMAP_DEMO_STORES);
      publicLoadError = true;
    }

    try {
      const productsData = await getStorefrontProducts();

      if (!storesLoaded) {
        setMarketProducts(VETMAP_DEMO_PRODUCTS);
      } else if (
        Array.isArray(productsData) &&
        productsData.length
      ) {
        setMarketProducts(productsData);
        productsLoaded = true;
      } else {
        setMarketProducts([]);
      }
    } catch {
      setMarketProducts(
        storesLoaded
          ? []
          : VETMAP_DEMO_PRODUCTS
      );
      publicLoadError = true;
    }

    if (sessionToken) {
      try {
        const orderData =
          await getMyStoreOrders(sessionToken);
        setMyStoreOrders(orderData);
      } catch {
        setMyStoreOrders([]);
      }
    }

    /*
      No bloqueamos la navegación pública si el backend está apagado.
      En ese caso se muestran los datos académicos de respaldo.
    */
    if (publicLoadError && !sessionToken) {
      setMessage(
        "Backend no disponible: mostrando datos demostrativos de VetMap."
      );
    }
  }

  async function loadStoreData(sessionToken = token) {
    try {
      const [dashboardData, productsData, ordersData] = await Promise.all([
        getStoreDashboard(sessionToken),
        getStoreProducts(sessionToken),
        getStoreOrders(sessionToken),
      ]);
      setStoreDashboard(dashboardData);
      setStoreProducts(productsData);
      setStoreOrders(ordersData);
    } catch (err) {
      setMessage(err.message);
    }
  }

  // VETMAP V26: acciones restringidas al rol Tienda.
  async function loadDeliveryData(sessionToken = token) {
    try {
      const [drivers, assignments] = await Promise.all([
        getStoreDeliveryDrivers(sessionToken),
        getStoreDeliveryAssignments(sessionToken),
      ]);
      setDeliveryDrivers(drivers);
      setDeliveryAssignments(assignments);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function createDeliveryDriver(event) {
    event.preventDefault();
    if (deliveryBusy) return;
    setDeliveryBusy(true);
    try {
      await createStoreDeliveryDriver(token, deliveryDriverForm);
      setDeliveryDriverForm({ name: "", phone: "" });
      await loadDeliveryData();
      setMessage("Repartidor registrado correctamente.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setDeliveryBusy(false);
    }
  }

  async function toggleDeliveryDriver(driver) {
    if (deliveryBusy) return;
    setDeliveryBusy(true);
    try {
      await setStoreDeliveryDriverActive(token, driver.id, !driver.active);
      await loadDeliveryData();
      setMessage("Estado del repartidor actualizado.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setDeliveryBusy(false);
    }
  }

  async function assignDeliveryOrder(orderId) {
    if (deliveryBusy) return;
    const driverId = Number(deliverySelectedDriver[orderId]);
    if (!driverId) return;
    setDeliveryBusy(true);
    try {
      await assignStoreDeliveryOrder(token, orderId, driverId);
      await loadDeliveryData();
      await loadStoreData();
      setMessage(`Pedido #${orderId} asignado correctamente.`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setDeliveryBusy(false);
    }
  }

  async function updateDeliveryState(orderId, state) {
    if (deliveryBusy) return;
    if (state === "delivered") {
      const confirmed = await openConfirmDialog({
        title: "Confirmar entrega",
        message: `El pedido #${orderId} quedará entregado definitivamente. ¿Continuar?`,
        confirmText: "Sí, entregar",
        cancelText: "Volver",
        tone: "success",
      });
      if (!confirmed) return;
    }
    setDeliveryBusy(true);
    try {
      await updateStoreDeliveryAssignment(token, orderId, state, deliveryIncidentNotes[orderId] || "");
      setDeliveryIncidentOpen((p) => ({ ...p, [orderId]: false }));
      await loadDeliveryData();
      await loadStoreData();
      await loadNotifications(token, true);
      setMessage(state === "delivered" ? "Entrega confirmada." : state === "incident" ? "Incidencia registrada." : "Pedido en reparto.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setDeliveryBusy(false);
    }
  }

  function marketplaceCategories() {
    return [...new Set(marketProducts.map((item) => item.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es"));
  }

  function marketplaceStoreProductCount(storeId) {
    const count = marketProducts.filter(
      (product) =>
        String(product.store_id) === String(storeId)
    ).length;

    if (count) {
      return count;
    }

    const demoStore = VETMAP_DEMO_STORES.find(
      (store) =>
        String(store.id) === String(storeId)
    );

    return demoStore?.demo_product_count || 0;
  }

  function selectedMarketplaceStore() {
    if (marketStoreFilter === "all") return null;

    return (
      marketStores.find(
        (store) =>
          String(store.id) === String(marketStoreFilter)
      ) || null
    );
  }

  function openMarketplaceStore(store) {
    setMarketStoreFilter(String(store.id));
    setMarketSearch("");
    setMarketCategory("all");
    setCompareKey("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showAllMarketplaceStores() {
    setMarketStoreFilter("all");
    setMarketSearch("");
    setMarketCategory("all");
    setCompareKey("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openPublicMarketplaceStore(store) {
    setMarketStoreFilter(String(store.id));
    setMarketSearch("");
    setMarketCategory("all");
    setCompareKey("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showAllPublicMarketplaceStores() {
    setMarketStoreFilter("all");
    setMarketSearch("");
    setMarketCategory("all");
    setCompareKey("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectedPublicClinic() {
    if (!publicClinicDetailId) return null;

    return (
      clinics.find(
        (clinic) =>
          String(clinic.id) ===
          String(publicClinicDetailId)
      ) || null
    );
  }

  function selectedMemberClinic() {
    if (!memberClinicDetailId) return null;

    return (
      clinics.find(
        (clinic) =>
          String(clinic.id) ===
          String(memberClinicDetailId)
      ) || null
    );
  }

  function openPublicClinic(clinic) {
    setPublicClinicDetailId(String(clinic.id));
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closePublicClinic() {
    setPublicClinicDetailId("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openMemberClinic(clinic) {
    setMemberClinicDetailId(String(clinic.id));
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeMemberClinic() {
    setMemberClinicDetailId("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openPublicStoresDirectory() {
    showAllPublicMarketplaceStores();
    setPublicSection("tiendas");
  }

  function openMemberStoresDirectory() {
    showAllMarketplaceStores();
    setMemberSection("tienda");
  }

  function openPublicClinicsDirectory() {
    setPublicClinicDetailId("");
    setPublicSection("veterinarias");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openMemberClinicsDirectory() {
    setMemberClinicDetailId("");
    setMemberSection("veterinarias");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openPublicPetCategory(animalType) {
    setMarketStoreFilter("all");
    setMarketCategory("all");
    setMarketSearch(animalType || "");
    setCompareKey("");
    setMessage("");
    setPublicSection("tiendas");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openPublicProductStore(product) {
    const store = marketStores.find(
      (item) =>
        String(item.id) ===
        String(product?.store_id)
    );

    if (store) {
      openPublicMarketplaceStore(store);
      setPublicSection("tiendas");
      return;
    }

    openPublicStoresDirectory();
  }

  function openPublicRegister() {
    setPublicSection("auth");
    setAuthActiveTab("register");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToLoginFromStore(product = null) {
    if (product) {
      setMessage(
        `Para comprar ${product.name}, inicia sesión o crea una cuenta.`
      );
    } else {
      setMessage(
        "Inicia sesión para agregar productos al carrito y realizar la compra."
      );
    }

    setPublicSection("auth");
    setAuthActiveTab("login");
  }

  function filteredMarketplaceProducts() {
    const search = normalizeClinicText(marketSearch);
    return marketProducts.filter((product) => {
      const searchOk =
        !search ||
        normalizeClinicText(product.name).includes(search) ||
        normalizeClinicText(product.brand).includes(search) ||
        normalizeClinicText(product.format).includes(search) ||
        normalizeClinicText(product.animal_type).includes(search) ||
        normalizeClinicText(product.category).includes(search) ||
        normalizeClinicText(product.store_name).includes(search);
      const categoryOk =
        marketCategory === "all" ||
        normalizeClinicText(product.category) === normalizeClinicText(marketCategory);
      const storeOk =
        marketStoreFilter === "all" ||
        String(product.store_id) === String(marketStoreFilter);
      return searchOk && categoryOk && storeOk;
    });
  }

  function compareProducts() {
    if (!compareKey) return [];
    return marketProducts
      .filter((product) => product.comparison_key === compareKey)
      .sort((a, b) => a.price - b.price);
  }

  function cartQuantityFor(productId) {
    const item = cart.find(
      (cartItem) => cartItem.id === productId
    );

    return item ? item.quantity : 0;
  }

  function availableProductStock(product) {
    return Math.max(
      0,
      Number(product.stock || 0) -
        cartQuantityFor(product.id)
    );
  }

  function addProductToCart(product) {
    const available = availableProductStock(product);

    if (available <= 0) {
      setMessage("Este producto ya no tiene stock disponible.");
      return;
    }

    setCart((current) => {
      const found = current.find(
        (item) => item.id === product.id
      );

      if (found) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setMessage(
      `${product.name} agregado. Quedan ${available - 1} disponibles.`
    );
  }

  function changeCartQuantity(productId, amount) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== productId) return item;
          const next = item.quantity + amount;
          if (next > item.stock) {
            setMessage("No hay más stock disponible.");
            return item;
          }
          return { ...item, quantity: next };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  async function removeCartItem(item) {
    const confirmed = await openConfirmDialog({
      title: "¿Eliminar producto del carrito?",
      message:
        `"${item.name}" se quitará de tu carrito.\n\n` +
        "¿Deseas continuar?",
      confirmText: "Sí, eliminar",
      cancelText: "No, volver",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    setCart((current) =>
      current.filter(
        (product) => product.id !== item.id
      )
    );

    setMessage(
      `${item.name} fue eliminado del carrito.`
    );
  }

  async function clearCart() {
    if (!cart.length) {
      return;
    }

    const confirmed = await openConfirmDialog({
      title: "¿Vaciar carrito?",
      message:
        `Se eliminarán ${cartItemCount()} producto(s) de tu carrito.\n\n` +
        "Esta acción no realiza ninguna compra.",
      confirmText: "Sí, vaciar carrito",
      cancelText: "No, conservar",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    setCart([]);
    setMessage("El carrito quedó vacío.");
  }


  function openMainCart() {
    setHeaderCartOpen(false);
    setNotificationsOpen(false);

    if (marketStoreFilter === "all") {
      const firstStoreId =
        cart[0]?.store_id ||
        marketStores[0]?.id;

      if (firstStoreId) {
        setMarketStoreFilter(
          String(firstStoreId)
        );
      }
    }

    setMemberSection("tienda");

    window.setTimeout(() => {
      document
        .getElementById("vm-market-cart")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 160);
  }

  function cartItemCount() {
    return cart.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }

  function cartTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  async function monitorMercadoPagoOrder(
    orderId,
    recovering = false
  ) {
    if (!orderId || !token) return;

    if (recovering) {
      setMessage(
        "Revisando un pago pendiente de Mercado Pago..."
      );
    }

    // 120 intentos cada 2,5 segundos = aprox. 5 minutos.
    for (let attempt = 0; attempt < 120; attempt += 1) {
      try {
        const result = await syncMercadoPagoOrder(
          token,
          orderId
        );

        if (
          result.finalized &&
          result.status === "processed" &&
          result.status_detail === "accredited"
        ) {
          sessionStorage.removeItem(
            "vetmap_mp_order_id"
          );

          sessionStorage.removeItem(
            "vetmap_mp_external_reference"
          );

          setCart([]);

          await loadMarketplaceData(token);
          await loadNotifications(token, true);

          showSuccessToast(
            "¡Compra realizada!",
            result.order_ids?.length > 1
              ? `Pago aprobado · ${result.order_ids.length} pedidos registrados correctamente.`
              : `Pago aprobado · Pedido #${
                  result.order_ids?.[0] || ""
                } registrado correctamente.`,
            "PAGO REALIZADO"
          );

          setMessage(
            result.order_ids?.length > 1
              ? `✅ Pago acreditado. Se registraron ${result.order_ids.length} pedidos y ya aparecen en tu seguimiento.`
              : "✅ Pago acreditado. Tu pedido ya aparece en Seguimiento de compra."
          );

          return;
        }

        if (
          result.status === "failed" ||
          result.status === "canceled"
        ) {
          sessionStorage.removeItem(
            "vetmap_mp_order_id"
          );

          sessionStorage.removeItem(
            "vetmap_mp_external_reference"
          );

          setMessage(
            `El pago terminó con estado ${result.status}.`
          );

          return;
        }
      } catch (err) {
        // Un error temporal no debe cortar inmediatamente
        // el seguimiento. En el último intento sí se informa.
        if (attempt === 119) {
          setMessage(err.message);
          return;
        }
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 2500)
      );
    }

    setMessage(
      "El pago sigue pendiente. Puedes volver a cargar VetMap y se revisará nuevamente."
    );
  }


  async function payWithMercadoPago() {
    if (!cart.length) {
      setMessage("El carrito está vacío.");
      return;
    }

    const confirmed = await openConfirmDialog({
      title: "Ir a Mercado Pago",
      message:
        "Se abrirá Mercado Pago en modo de prueba.\n\n" +
        "Usa únicamente las credenciales y tarjetas de prueba.",
      confirmText: "Continuar a Mercado Pago",
      cancelText: "Volver",
      tone: "success",
    });

    if (!confirmed) {
      setMessage("Pago de prueba cancelado.");
      return;
    }

    const paymentWindow = window.open(
      "about:blank",
      "_blank"
    );

    try {
      const grouped = {};

      for (const item of cart) {
        if (!grouped[item.store_id]) {
          grouped[item.store_id] = {
            store_id: item.store_id,
            items: [],
          };
        }

        grouped[item.store_id].items.push({
          product_id: item.id,
          quantity: item.quantity,
        });
      }

      const orders = Object.values(grouped);

      setMessage(
        "Creando order de prueba con Mercado Pago..."
      );

      const result = await createMercadoPagoOrder(
        token,
        orders
      );

      const checkoutUrl = result.checkout_url;

      if (!checkoutUrl) {
        if (paymentWindow) {
          paymentWindow.close();
        }

        throw new Error(
          "Mercado Pago no devolvió checkout_url."
        );
      }

      if (result.order_id) {
        sessionStorage.setItem(
          "vetmap_mp_order_id",
          result.order_id
        );
      }

      if (result.external_reference) {
        sessionStorage.setItem(
          "vetmap_mp_external_reference",
          result.external_reference
        );
      }

      if (paymentWindow) {
        paymentWindow.location.href = checkoutUrl;
        paymentWindow.opener = null;
      } else {
        window.location.href = checkoutUrl;
        return;
      }

      setMessage(
        `Checkout TEST creado por ${formatCLP(
          result.total
        )}. VetMap está esperando la confirmación del pago...`
      );

      // No bloquea la interfaz: VetMap consulta el estado
      // mientras el usuario completa Checkout Pro.
      monitorMercadoPagoOrder(
        result.order_id,
        false
      );
    } catch (err) {
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }

      setMessage(err.message);
    }
  }


  async function submitStoreOrder() {
    if (!cart.length) {
      setMessage("El carrito está vacío.");
      return;
    }

    try {
      const grouped = {};

      for (const item of cart) {
        if (!grouped[item.store_id]) {
          grouped[item.store_id] = {
            store_id: item.store_id,
            items: [],
            delivery_method: "pickup",
            delivery_address: null,
            notes: "Compra simulada desde VetMap",
          };
        }

        grouped[item.store_id].items.push({
          product_id: item.id,
          quantity: item.quantity,
        });
      }

      const orders = Object.values(grouped);

      await createStorefrontOrdersBatch(
        token,
        orders
      );

      const storeCount = orders.length;

      setCart([]);
      await loadMarketplaceData(token);

      showSuccessToast(
        "¡Compra realizada!",
        storeCount === 1
          ? "Pedido registrado correctamente en VetMap."
          : `${storeCount} pedidos registrados correctamente, uno por cada tienda.`,
        "COMPRA REALIZADA"
      );

      setMessage(
        storeCount === 1
          ? "Compra simulada registrada correctamente."
          : `Compra registrada. Se generaron ${storeCount} pedidos, uno por cada tienda.`
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  function clearStoreProductForm() {
    setStoreProductForm({
      name: "",
      brand: "",
      category: "Alimentos",
      animal_type: "Perros",
      format: "",
      description: "",
      price: "",
      stock: "",
      image_data: "",
      active: true,
    });
    setEditingStoreProductId(null);
  }

  async function saveStoreProduct(e) {
    e.preventDefault();
    if (!storeProductForm.name || storeProductForm.price === "" || storeProductForm.stock === "") {
      setMessage("Completa nombre, precio y stock.");
      return;
    }
    if (!validateProductPrice(storeProductForm.price)) return;
    if (Number(storeProductForm.stock) < 0) {
      setMessage("El stock no puede ser negativo.");
      return;
    }
    const payload = {
      ...storeProductForm,
      price: Number(storeProductForm.price),
      stock: Number(storeProductForm.stock),
      brand: storeProductForm.brand || null,
      format: storeProductForm.format || null,
      description: storeProductForm.description || null,
      image_data: storeProductForm.image_data || null,
    };
    try {
      if (editingStoreProductId) {
        await updateStoreProduct(token, editingStoreProductId, payload);
        setMessage("Producto actualizado correctamente.");
      } else {
        await createStoreProduct(token, payload);
        setMessage("Producto creado correctamente.");
      }
      clearStoreProductForm();
      await loadStoreData();
      await loadMarketplaceData(token);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEditStoreProduct(product) {
    setEditingStoreProductId(product.id);
    setStoreProductForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "Alimentos",
      animal_type: product.animal_type || "Perros",
      format: product.format || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image_data: product.image_data || "",
      active: product.active !== false,
    });
    setMessage(`Editando ${product.name}.`);
  }

  async function archiveStoreProduct(productId) {
    const confirmed = await openConfirmDialog({
      title: "Eliminar producto",
      message:
        "¿Quieres quitar este producto del catálogo de la tienda?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmed) return;
    try {
      await deleteStoreProduct(token, productId);
      await loadStoreData();
      await loadMarketplaceData(token);
      setMessage("Producto eliminado del catálogo.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function cleanStoreOrder(order) {
    const confirmed = await openConfirmDialog({
      title: "¿Quitar pedido del historial?",
      message:
        `Pedido #${order.id} · ${orderStatusLabel(order.status)}\n\n` +
        "Este pedido dejará de aparecer en el historial de tu tienda. " +
        "No se eliminará el registro del comprador.\n\n" +
        "¿Deseas continuar?",
      confirmText: "Sí, quitar pedido",
      cancelText: "No, volver",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await archiveStoreOrder(
        token,
        order.id
      );

      await loadStoreData();

      setMessage(
        "Pedido quitado del historial de la tienda."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function cleanAllStoreFinalOrders() {
    const finalCount =
      storeOrders.filter((order) =>
        isFinalStoreOrderStatus(
          order.status
        )
      ).length;

    if (!finalCount) {
      setMessage(
        "No hay pedidos finalizados para limpiar."
      );
      return;
    }

    const confirmed = await openConfirmDialog({
      title: "¿Limpiar historial de pedidos?",
      message:
        `Se quitarán ${finalCount} pedido(s) finalizado(s) de la vista de tu tienda.\n\n` +
        "Los pedidos seguirán registrados para sus compradores. " +
        "Esta acción solo limpia tu historial visible.\n\n" +
        "¿Deseas continuar?",
      confirmText: "Sí, limpiar historial",
      cancelText: "No, conservar",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      const result =
        await archiveStoreFinalOrders(
          token
        );

      await loadStoreData();

      setMessage(
        result.message ||
          "Historial de pedidos limpiado."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function changeStoreOrderStatus(
    orderId,
    newStatus,
    currentStatus
  ) {
    if (
      isFinalStoreOrderStatus(
        currentStatus
      )
    ) {
      setMessage(
        "Este pedido tiene un estado final y ya no puede modificarse."
      );
      return;
    }

    if (newStatus === currentStatus) {
      return;
    }

    if (
      newStatus === "delivered" ||
      newStatus === "cancelled"
    ) {
      const confirmed = await openConfirmDialog({
        title:
          newStatus === "delivered"
            ? "Marcar como entregado"
            : "Cancelar pedido",
        message:
          newStatus === "delivered"
            ? "El pedido quedará como Entregado y este cambio será definitivo.\n\n¿Deseas continuar?"
            : "El pedido quedará como Cancelado y este cambio será definitivo.\n\n¿Deseas continuar?",
        confirmText:
          newStatus === "delivered"
            ? "Sí, entregar"
            : "Sí, cancelar",
        cancelText: "Volver",
        tone:
          newStatus === "delivered"
            ? "success"
            : "danger",
      });

      if (!confirmed) {
        await loadStoreData();
        return;
      }
    }

    try {
      await updateStoreOrderStatus(
        token,
        orderId,
        newStatus
      );

      await loadStoreData();
      await loadNotifications(token, true);

      setMessage(
        isFinalStoreOrderStatus(newStatus)
          ? "Estado final guardado. El pedido ya no puede editarse."
          : "Estado del pedido actualizado."
      );
    } catch (err) {
      await loadStoreData();
      setMessage(err.message);
    }
  }

  function storeLowStockCount() {
    return storeProducts.filter(
      (product) =>
        Number(product.stock || 0) <= 5
    ).length;
  }


  function filteredStoreProducts() {
    const search = normalizeClinicText(storeProductSearch);
    if (!search) return storeProducts;
    return storeProducts.filter((product) =>
      normalizeClinicText(product.name).includes(search) ||
      normalizeClinicText(product.brand).includes(search) ||
      normalizeClinicText(product.category).includes(search) ||
      normalizeClinicText(product.format).includes(search)
    );
  }

  function clearClinicForms() {
    setClinicConsultationForm({
      consultation_date: new Date().toISOString().slice(0, 10),
      reason: "",
      diagnosis: "",
      treatment: "",
      observation: "",
    });

    setClinicVaccineForm({
      name: "",
      application_date: new Date().toISOString().slice(0, 10),
      next_dose_date: "",
      observation: "",
    });

    setClinicMedicationForm({
      name: "",
      dose: "",
      frequency: "",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: "",
      reminder_times: "08:00,20:00",
      observation: "",
    });

    setClinicVaccineNextDosePreset("");
    setClinicMedicationDurationPreset("");
  }

  async function loadClinicData(sessionToken = token) {
    try {
      const [
        dashboardData,
        appointmentsData,
        patientsData,
        prescriptionsData,
        prescriptionTemplatesData,
      ] = await Promise.all([
        getClinicDashboard(sessionToken),
        getClinicAppointments(sessionToken),
        getClinicPatients(sessionToken),
        getClinicPrescriptions(sessionToken),
        getClinicPrescriptionTemplates(sessionToken),
      ]);

      setClinicDashboard(dashboardData);
      setClinicAppointments(appointmentsData);
      setClinicPatients(patientsData);
      setClinicPrescriptions(prescriptionsData);
      setClinicPrescriptionTemplates(prescriptionTemplatesData);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function clinicAgendaLatestConsultation(history) {
    const items = history?.consultations || [];

    if (!items.length) {
      return null;
    }

    return [...items].sort((a, b) => {
      const aDate = a.consultation_date || "";
      const bDate = b.consultation_date || "";

      if (aDate !== bDate) {
        return bDate.localeCompare(aDate);
      }

      return Number(b.id || 0) - Number(a.id || 0);
    })[0];
  }

  function clinicAgendaRecentHistoryItems(
    items,
    dateField
  ) {
    return [...(items || [])]
      .sort((a, b) => {
        const aDate = a?.[dateField] || "";
        const bDate = b?.[dateField] || "";

        if (aDate !== bDate) {
          return String(bDate).localeCompare(
            String(aDate)
          );
        }

        return Number(b.id || 0) - Number(a.id || 0);
      })
      .slice(0, 3);
  }

  async function toggleClinicAgendaHistory(item) {
    if (
      clinicAgendaHistoryAppointmentId === item.id
    ) {
      setClinicAgendaHistoryAppointmentId(null);
      setClinicAgendaHistory(null);
      setClinicAgendaHistoryLoading(false);
      return;
    }

    setClinicAgendaHistoryAppointmentId(item.id);
    setClinicAgendaHistory(null);
    setClinicAgendaHistoryLoading(true);

    try {
      const history = await getClinicPatientHistory(
        token,
        item.pet_id
      );

      setClinicAgendaHistory(history);

      // El paciente abierto desde Agenda pasa a ser el paciente
      // clínico activo. Así las acciones rápidas reutilizan los
      // mismos formularios de Consulta, Vacuna, Medicamento y Receta.
      setClinicSelectedPatient(history.pet);
      setClinicPatientHistory(history);

      setClinicPrescriptionForm((current) => ({
        ...current,
        pet_id: String(history.pet?.id || item.pet_id),
      }));
    } catch (err) {
      setClinicAgendaHistoryAppointmentId(null);
      setClinicAgendaHistory(null);
      setMessage(err.message);
    } finally {
      setClinicAgendaHistoryLoading(false);
    }
  }

  async function openClinicPatient(patient) {
    try {
      const history = await getClinicPatientHistory(token, patient.id);

      setClinicSelectedPatient(patient);
      setClinicPatientHistory(history);
      setClinicPrescriptionForm((current) => ({
        ...current,
        pet_id: String(patient.id),
      }));
      clearClinicForms();
      setMemberSection("clinicHistory");

      setMessage(`Historial de ${patient.name} cargado.`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function latestClinicConsultation() {
    const consultations =
      clinicPatientHistory?.consultations || [];

    if (!consultations.length) {
      return null;
    }

    return [...consultations].sort((a, b) => {
      const aDate =
        a.consultation_date || "";
      const bDate =
        b.consultation_date || "";

      if (aDate !== bDate) {
        return bDate.localeCompare(aDate);
      }

      return Number(b.id || 0) -
        Number(a.id || 0);
    })[0];
  }

  function clinicCurrentPatientSpecies() {
    return (
      clinicPatientHistory?.pet?.species ||
      clinicSelectedPatient?.species ||
      ""
    );
  }

  function clinicVaccineSuggestions() {
    const species = normalizeClinicText(
      clinicCurrentPatientSpecies()
    );

    if (species.includes("perro")) {
      return [
        "Antirrábica",
        "Séxtuple canina",
        "Óctuple canina",
        "Polivalente canina",
        "Bordetella",
        "Leptospirosis",
      ];
    }

    if (species.includes("gato")) {
      return [
        "Antirrábica",
        "Triple felina",
        "Leucemia felina",
      ];
    }

    if (species.includes("conejo")) {
      return [
        "Mixomatosis",
        "Enfermedad hemorrágica viral",
      ];
    }

    return [];
  }

  function addDaysToClinicDate(dateValue, days) {
    if (!dateValue || !days) {
      return "";
    }

    const date = new Date(
      `${dateValue}T12:00:00`
    );

    date.setDate(
      date.getDate() + Number(days)
    );

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function applyClinicVaccineNextDosePreset(value) {
    setClinicVaccineNextDosePreset(value);

    if (!value) {
      return;
    }

    if (value === "manual") {
      return;
    }

    setClinicVaccineForm((current) => ({
      ...current,
      next_dose_date: addDaysToClinicDate(
        current.application_date,
        value
      ),
    }));
  }

  function applyClinicMedicationDurationPreset(value) {
    setClinicMedicationDurationPreset(value);

    if (!value) {
      return;
    }

    if (value === "manual") {
      return;
    }

    setClinicMedicationForm((current) => ({
      ...current,
      end_date: addDaysToClinicDate(
        current.start_date,
        value
      ),
    }));
  }


  async function loadClinicCatalogOptions(
    categories,
    patient
  ) {
    const species =
      patient?.species ||
      clinicCurrentPatientSpecies();

    try {
      const results = await Promise.all(
        categories.map(async (category) => [
          category,
          await getClinicCatalog(
            token,
            category,
            species
          ),
        ])
      );

      setClinicCatalogOptions((current) => ({
        ...current,
        ...Object.fromEntries(results),
      }));
    } catch (err) {
      setMessage(err.message);
    }
  }

  function clinicPrescriptionQuickOptions(category) {
    const fallbacks = {
      dose: [
        "1/4 comprimido",
        "1/2 comprimido",
        "1 comprimido",
        "2 comprimidos",
        "0,5 mL",
        "1 mL",
        "2 mL",
        "5 mL",
      ],
      frequency: [
        "Cada 8 horas",
        "Cada 12 horas",
        "Cada 24 horas",
        "1 vez al día",
        "2 veces al día",
        "Día por medio",
        "Semanal",
      ],
      duration: [
        "3 días",
        "5 días",
        "7 días",
        "10 días",
        "14 días",
        "21 días",
        "30 días",
      ],
      instructions: [
        "Administrar con alimento.",
        "Administrar después de comer.",
        "Mantener agua disponible.",
        "No suspender sin indicación veterinaria.",
        "Control veterinario al finalizar el tratamiento.",
        "Volver antes si presenta molestias o una reacción inesperada.",
      ],
    };

    const dynamic =
      clinicCatalogOptions?.[category] || [];

    const merged = [
      ...dynamic,
      ...(fallbacks[category] || []),
    ];

    return merged.filter(
      (value, index, array) =>
        value &&
        array.findIndex(
          (item) =>
            String(item).trim().toLowerCase() ===
            String(value).trim().toLowerCase()
        ) === index
    );
  }

  function applyClinicPrescriptionQuickValue(
    field,
    value
  ) {
    setClinicPrescriptionForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openClinicAction(action, appointment = undefined) {
    setClinicMedicationFormError("");

    const patient =
      clinicPatientHistory?.pet ||
      clinicSelectedPatient;

    const activeAppointment =
      appointment !== undefined
        ? appointment
        : clinicAppointments.find(
            (item) =>
              String(item.id) ===
              String(clinicActionAppointmentId)
          ) || null;

    if (appointment !== undefined) {
      setClinicActionAppointmentId(
        appointment?.id || null
      );
    }

    if (!patient) {
      setMessage(
        "Selecciona un paciente para continuar."
      );
      return;
    }

    if (activeAppointment?.appointment_date) {
      const attentionDate =
        activeAppointment.appointment_date;

      if (action === "consultation") {
        setClinicConsultationForm((current) => ({
          ...current,
          consultation_date: attentionDate,
        }));
      }

      if (action === "vaccine") {
        setClinicVaccineForm((current) => ({
          ...current,
          application_date: attentionDate,
        }));
      }

      if (action === "medication") {
        setClinicMedicationForm((current) => ({
          ...current,
          start_date: attentionDate,
          reminder_times:
            current.reminder_times || "08:00,20:00",
        }));
      }

      if (action === "prescription") {
        setClinicPrescriptionForm((current) => ({
          ...current,
          issue_date: attentionDate,
        }));
      }
    }

    if (action === "prescription") {
      setClinicPrescriptionForm((current) => ({
        ...current,
        pet_id: String(patient.id),
      }));
      setSelectedClinicPrescriptionTemplateId("");
      setClinicPrescriptionTemplateName("");
      setSaveClinicPrescriptionAsTemplate(true);
    }

    const categoriesByAction = {
      consultation: [
        "consultation_reason",
      ],
      vaccine: [
        "vaccine",
      ],
      medication: [
        "medication",
        "dose",
        "frequency",
      ],
      prescription: [
        "medication",
        "dose",
        "frequency",
        "duration",
        "instructions",
      ],
    };

    if (action === "medication") {
      setClinicMedicationForm((current) => ({
        ...current,
        start_date:
          current.start_date ||
          new Date().toISOString().slice(0, 10),
        reminder_times:
          current.reminder_times || "08:00,20:00",
      }));
    }

    setClinicActionModal(action);

    loadClinicCatalogOptions(
      categoriesByAction[action] || [],
      patient
    );
  }

  function closeClinicAction() {
    setClinicMedicationFormError("");
    setClinicActionModal(null);
    setClinicActionAppointmentId(null);
  }

  function openClinicPrescriptionForPatient() {
    openClinicAction("prescription", null);
  }


  async function refreshClinicPatientHistory() {
    if (!clinicSelectedPatient) {
      return;
    }

    try {
      const history = await getClinicPatientHistory(
        token,
        clinicSelectedPatient.id
      );

      setClinicPatientHistory(history);

      if (
        clinicAgendaHistoryAppointmentId &&
        String(clinicAgendaHistory?.pet?.id) ===
          String(clinicSelectedPatient.id)
      ) {
        setClinicAgendaHistory(history);
      }

      await loadClinicData();

      setMessage("Historial actualizado.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function downloadClinicalReport(appointment) {
    if (!appointment?.id) {
      setMessage(
        "No se pudo identificar la reserva para generar el PDF."
      );
      return;
    }

    setDownloadingClinicalReportId(appointment.id);

    try {
      const result =
        await downloadAppointmentClinicalReport(
          token,
          appointment.id
        );

      if (
        !result?.blob ||
        result.blob.size === 0
      ) {
        throw new Error(
          "El informe PDF llegó vacío. Reinicia el backend y vuelve a intentarlo."
        );
      }

      const url = URL.createObjectURL(
        new Blob(
          [result.blob],
          { type: "application/pdf" }
        )
      );

      const link = document.createElement("a");
      link.href = url;
      link.download =
        result.filename ||
        `VetMap_Atencion_${appointment.id}.pdf`;
      link.style.display = "none";

      document.body.appendChild(link);

      // Esperar un frame evita que algunos navegadores cancelen
      // la descarga al crear/revocar el Blob demasiado rápido.
      await new Promise((resolve) =>
        requestAnimationFrame(resolve)
      );

      link.click();

      window.setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 1500);

      setMessage(
        `Informe PDF de ${
          appointment.pet_name || "la mascota"
        } descargado correctamente.`
      );
    } catch (err) {
      setMessage(
        err?.message ||
          "No se pudo descargar el informe PDF."
      );
    } finally {
      setDownloadingClinicalReportId(null);
    }
  }

  async function cleanClinicAppointment(
    appointmentId
  ) {
    const confirmed = await openConfirmDialog({
      title: "Quitar reserva de la agenda",
      message:
        "Esta reserva dejará de aparecer en tu agenda.\n\n" +
        "¿Deseas continuar?",
      confirmText: "Sí, quitar",
      cancelText: "Volver",
      tone: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      await archiveClinicAppointment(
        token,
        appointmentId
      );

      await loadClinicData();

      setMessage(
        "Reserva quitada de la agenda."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function cleanAllClinicFinalAppointments() {
    const finalCount = clinicAppointments.filter(
      (appointment) =>
        appointment.status === "completed" ||
        appointment.status === "cancelled"
    ).length;

    if (!finalCount) {
      setMessage(
        "No hay reservas completadas o canceladas para limpiar."
      );
      return;
    }

    const confirmed = await openConfirmDialog({
      title: "Limpiar agenda finalizada",
      message:
        `Se quitarán ${finalCount} reserva(s) finalizada(s) de tu agenda.\n\n` +
        "¿Deseas continuar?",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
      tone: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      const result =
        await archiveClinicFinalAppointments(
          token
        );

      await loadClinicData();

      setMessage(
        result.message ||
          "Agenda limpiada correctamente."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function changeClinicAppointmentStatus(
    appointmentId,
    newStatus,
    currentStatus
  ) {
    if (
      currentStatus === "completed" ||
      currentStatus === "cancelled"
    ) {
      setMessage(
        "Esta reserva tiene un estado final y ya no puede modificarse."
      );
      return;
    }

    if (
      newStatus === "completed" ||
      newStatus === "cancelled"
    ) {
      const label =
        newStatus === "completed"
          ? "COMPLETADA"
          : "CANCELADA";

      const confirmed = await openConfirmDialog({
        title: `Marcar reserva como ${label}`,
        message:
          "Este cambio será definitivo y la reserva ya no podrá modificarse.",
        confirmText:
          newStatus === "completed"
            ? "Sí, completar"
            : "Sí, cancelar",
        cancelText: "Volver",
        tone:
          newStatus === "completed"
            ? "success"
            : "danger",
      });

      if (!confirmed) {
        await loadClinicData();
        return;
      }
    }

    try {
      await updateClinicAppointmentStatus(
        token,
        appointmentId,
        newStatus
      );

      await loadClinicData();

      if (
        newStatus === "completed" ||
        newStatus === "cancelled"
      ) {
        setMessage(
          "Estado final guardado. Esta reserva quedó bloqueada."
        );
      } else {
        setMessage(
          "Estado de la hora actualizado."
        );
      }
    } catch (err) {
      await loadClinicData();
      setMessage(err.message);
    }
  }

  async function saveClinicConsultation(e) {
    e.preventDefault();

    if (!clinicSelectedPatient) {
      setMessage("Selecciona un paciente.");
      return;
    }

    if (!clinicConsultationForm.reason) {
      setMessage("Debes indicar el motivo de la consulta.");
      return;
    }

    try {
      await createClinicConsultation(
        token,
        clinicSelectedPatient.id,
        {
          appointment_id:
            clinicActionAppointmentId || null,
          consultation_date:
            clinicConsultationForm.consultation_date || null,
          reason: clinicConsultationForm.reason,
          diagnosis: clinicConsultationForm.diagnosis || null,
          treatment: clinicConsultationForm.treatment || null,
          veterinarian: currentUser.name,
          observation: clinicConsultationForm.observation || null,
        }
      );

      setClinicConsultationForm({
        consultation_date: new Date().toISOString().slice(0, 10),
        reason: "",
        diagnosis: "",
        treatment: "",
        observation: "",
      });

      await refreshClinicPatientHistory();
      setClinicActionModal(null);
      setClinicActionAppointmentId(null);
      setMessage("Consulta registrada en el historial.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveClinicVaccine(e) {
    e.preventDefault();

    if (!clinicSelectedPatient || !clinicVaccineForm.name) {
      setMessage("Selecciona paciente e ingresa la vacuna.");
      return;
    }

    try {
      await createClinicVaccine(
        token,
        clinicSelectedPatient.id,
        {
          appointment_id:
            clinicActionAppointmentId || null,
          name: clinicVaccineForm.name,
          application_date:
            clinicVaccineForm.application_date || null,
          next_dose_date:
            clinicVaccineForm.next_dose_date || null,
          observation:
            clinicVaccineForm.observation || null,
        }
      );

      setClinicVaccineForm({
        name: "",
        application_date: new Date().toISOString().slice(0, 10),
        next_dose_date: "",
        observation: "",
      });

      setClinicVaccineNextDosePreset("");

      await refreshClinicPatientHistory();
      setClinicActionModal(null);
      setClinicActionAppointmentId(null);
      setMessage("Vacuna registrada.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveClinicMedication(e) {
    e.preventDefault();

    setClinicMedicationFormError("");

    if (!clinicSelectedPatient) {
      setClinicMedicationFormError(
        "No hay un paciente seleccionado."
      );
      setMessage("Selecciona un paciente.");
      return;
    }

    const medicationName =
      String(clinicMedicationForm.name || "").trim();

    if (!medicationName) {
      setClinicMedicationFormError(
        "Debes seleccionar o escribir el nombre del medicamento antes de guardar."
      );

      setMessage(
        "Falta indicar el medicamento."
      );

      requestAnimationFrame(() => {
        document
          .querySelectorAll(".vm-clinic-action-body")
          .forEach((element) => {
            element.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          });
      });

      return;
    }

    try {
      const createdMedication =
        await createClinicMedication(
          token,
          clinicSelectedPatient.id,
          {
            appointment_id:
              clinicActionAppointmentId || null,
            name: medicationName,
            dose:
              clinicMedicationForm.dose?.trim() ||
              null,
            frequency:
              clinicMedicationForm.frequency?.trim() ||
              null,
            start_date:
              clinicMedicationForm.start_date ||
              null,
            end_date:
              clinicMedicationForm.end_date ||
              null,
            reminder_times:
              clinicMedicationForm.reminder_times?.trim() ||
              null,
            observation:
              clinicMedicationForm.observation?.trim() ||
              null,
          }
        );

      if (!createdMedication?.id) {
        throw new Error(
          "El servidor no confirmó el registro del medicamento."
        );
      }

      const history =
        await getClinicPatientHistory(
          token,
          clinicSelectedPatient.id
        );

      const savedMedication =
        (history?.medications || []).find(
          (item) =>
            String(item.id) ===
            String(createdMedication.id)
        );

      if (!savedMedication) {
        throw new Error(
          "VetMap recibió la respuesta del servidor, pero no pudo verificar el medicamento en el historial."
        );
      }

      setClinicPatientHistory(history);

      if (
        clinicAgendaHistoryAppointmentId &&
        String(history?.pet?.id) ===
          String(clinicSelectedPatient.id)
      ) {
        setClinicAgendaHistory(history);
      }

      setClinicMedicationForm({
        name: "",
        dose: "",
        frequency: "",
        start_date:
          new Date().toISOString().slice(0, 10),
        end_date: "",
        reminder_times: "08:00,20:00",
        observation: "",
      });

      setClinicMedicationDurationPreset("");
      setClinicMedicationFormError("");

      await loadClinicData();

      setClinicActionModal(null);
      setClinicActionAppointmentId(null);

      setMessage(
        `Medicamento "${savedMedication.name}" registrado y verificado correctamente.`
      );
    } catch (err) {
      const detail =
        err?.message ||
        "No se pudo registrar el medicamento.";

      setClinicMedicationFormError(detail);
      setMessage(detail);
    }
  }

  async function removeClinicConsultation(item) {
    const confirmed = await openConfirmDialog({
      title: "Eliminar consulta",
      message:
        `Se eliminará la consulta "${item.reason}".\n\n` +
        "¿Deseas continuar?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteClinicConsultation(
        token,
        item.id
      );

      await refreshClinicPatientHistory();

      setMessage(
        "Consulta eliminada correctamente."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function removeClinicVaccine(item) {
    const confirmed = await openConfirmDialog({
      title: "Eliminar vacuna",
      message:
        `Se eliminará "${item.name}" del historial de la mascota.\n\n` +
        "¿Deseas continuar?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteClinicVaccine(
        token,
        item.id
      );

      await refreshClinicPatientHistory();

      setMessage(
        "Vacuna eliminada correctamente."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function removeClinicMedication(item) {
    const confirmed = await openConfirmDialog({
      title: "Eliminar medicamento",
      message:
        `Se eliminará "${item.name}" del historial de la mascota.\n\n` +
        "¿Deseas continuar?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteClinicMedication(
        token,
        item.id
      );

      await refreshClinicPatientHistory();

      setMessage(
        "Medicamento eliminado correctamente."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }


  async function saveClinicPrescription(e) {
    e.preventDefault();

    if (
      !clinicPrescriptionForm.pet_id ||
      !clinicPrescriptionForm.medication
    ) {
      setMessage("Selecciona un paciente e ingresa el medicamento.");
      return;
    }

    try {
      await createClinicPrescription(token, {
        appointment_id:
          clinicActionAppointmentId || null,
        pet_id: Number(clinicPrescriptionForm.pet_id),
        issue_date: clinicPrescriptionForm.issue_date,
        medication: clinicPrescriptionForm.medication,
        dosage: clinicPrescriptionForm.dosage || null,
        frequency: clinicPrescriptionForm.frequency || null,
        duration: clinicPrescriptionForm.duration || null,
        instructions:
          clinicPrescriptionForm.instructions || null,
      });

      if (saveClinicPrescriptionAsTemplate) {
        await createClinicPrescriptionTemplate(token, {
          name:
            clinicPrescriptionTemplateName.trim() ||
            clinicPrescriptionForm.medication,
          medication: clinicPrescriptionForm.medication,
          dosage: clinicPrescriptionForm.dosage || null,
          frequency: clinicPrescriptionForm.frequency || null,
          duration: clinicPrescriptionForm.duration || null,
          instructions:
            clinicPrescriptionForm.instructions || null,
        });
      }

      setSelectedClinicPrescriptionTemplateId("");
      setClinicPrescriptionTemplateName("");
      setSaveClinicPrescriptionAsTemplate(true);

      setClinicPrescriptionForm({
        pet_id: "",
        issue_date: new Date().toISOString().slice(0, 10),
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });

      await loadClinicData();

      if (clinicSelectedPatient) {
        const history = await getClinicPatientHistory(
          token,
          clinicSelectedPatient.id
        );

        setClinicPatientHistory(history);

        if (
          clinicAgendaHistoryAppointmentId &&
          String(clinicAgendaHistory?.pet?.id) ===
            String(clinicSelectedPatient.id)
        ) {
          setClinicAgendaHistory(history);
        }
      }

      setClinicActionModal(null);
      setClinicActionAppointmentId(null);
      setMessage("Receta emitida correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function removeClinicPrescription(prescriptionId) {
    const confirmed = await openConfirmDialog({
      title: "Eliminar receta",
      message:
        "¿Quieres eliminar esta receta del historial?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteClinicPrescription(
        token,
        prescriptionId
      );

      await loadClinicData();

      if (clinicSelectedPatient) {
        const history = await getClinicPatientHistory(
          token,
          clinicSelectedPatient.id
        );
        setClinicPatientHistory(history);
      }

      setMessage("Receta eliminada.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function register(e) {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirm_password) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    const registeredEmail = registerForm.email;
    const registeredPassword = registerForm.password;

    try {
      await registerUser({
        name: registerForm.name,
        email: registeredEmail,
        password: registeredPassword,
        confirm_password: registerForm.confirm_password,
        rut: registerForm.rut || null,
        country: registerForm.country || null,
        region: registerForm.region || null,
        city: registerForm.city || null,
        birth_date: registerForm.birth_date || null,
        birth_year: registerForm.birth_date
          ? Number(registerForm.birth_date.slice(0, 4))
          : null,
      });

      const data = await loginUser({
        email: registeredEmail,
        password: registeredPassword,
      });

      sessionStorage.setItem("vetmap_token", data.access_token);
      setToken(data.access_token);

      setRegisterForm({
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        rut: "",
        country: "Chile",
        region: "",
        city: "",
        birth_date: "",
      });

      setMemberSection("inicio");
      await loadSession(data.access_token);

      setMessage("Cuenta creada correctamente. Ya estás dentro de VetMap.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function login(e) {
    e.preventDefault();

    try {
      const data = await loginUser({
        email: loginForm.email,
        password: loginForm.password,
      });

      sessionStorage.setItem("vetmap_token", data.access_token);
      setToken(data.access_token);

      setLoginForm({
        email: "",
        password: "",
      });

      setMemberSection("inicio");
      await loadSession(data.access_token);

      setMessage("Sesión iniciada correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function resetPasswordSubmit(e) {
    e.preventDefault();

    if (resetPasswordForm.new_password !== resetPasswordForm.confirm_password) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      await resetPassword(resetPasswordForm);

      setResetPasswordForm({
        email: "",
        new_password: "",
        confirm_password: "",
      });

      setShowResetPassword(false);
      setAuthActiveTab("login");
      setPublicSection("auth");
      setMessage("Contraseña restablecida correctamente. Ahora puedes iniciar sesión.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveOwnerPet(e) {
    e.preventDefault();

    const selectedSpecies =
      ownerPetForm.species === "Otro"
        ? ownerPetForm.species_other.trim()
        : ownerPetForm.species;

    if (!ownerPetForm.name || !selectedSpecies) {
      setMessage(
        "Debes ingresar al menos el nombre y la especie de la mascota."
      );
      return;
    }

    const selectedBreed =
      ownerPetForm.breed === "__other__"
        ? ownerPetForm.breed_other.trim()
        : ownerPetForm.breed.trim();

    if (
      ownerPetForm.breed === "__other__" &&
      selectedBreed.length < 2
    ) {
      setMessage(
        "Escribe una raza o variedad válida."
      );
      return;
    }

    const petData = {
      name: ownerPetForm.name,
      species: selectedSpecies,
      breed: selectedBreed || null,
      age: ownerPetForm.age ? Number(ownerPetForm.age) : null,
      age_months: ownerPetForm.age_months ? Number(ownerPetForm.age_months) : null,
      weight: ownerPetForm.weight ? Number(ownerPetForm.weight) : null,
      birth_date: ownerPetForm.birth_date || null,
      photo_data: ownerPetForm.photo_data || null,
      additional_info: ownerPetForm.additional_info || null,
      medical_background: ownerPetForm.medical_background || null,
      feeding_info: ownerPetForm.feeding_info || null,
    };

    try {
      if (
        ownerPetForm.breed === "__other__" &&
        selectedBreed
      ) {
        const registeredBreed =
          await registerPetBreed(
            token,
            selectedSpecies,
            selectedBreed
          );

        petData.breed =
          registeredBreed.name;
      }

      if (editingOwnerPetId) {
        const updatedPet = await updatePet(token, editingOwnerPetId, petData);
        setSelectedPet(updatedPet);
        setMessage("Mascota actualizada correctamente.");
      } else {
        await createPet(token, petData);
        setMessage("Mascota registrada correctamente. El administrador ya puede verla en su panel.");
      }

      clearOwnerPetForm();
      setShowOwnerPetForm(false);
      await loadOwnerPets();
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEditOwnerPet(pet) {
    setEditingOwnerPetId(pet.id);
    setShowOwnerPetForm(true);
    setMessage("");

    setOwnerPetForm({
      name: pet.name || "",
      species: isKnownPetSpecies(pet.species)
        ? pet.species
        : "Otro",
      species_other: isKnownPetSpecies(pet.species)
        ? ""
        : pet.species || "",
      breed: pet.breed || "",
      breed_other: "",
      age: pet.age ?? "",
      age_months: pet.age_months ?? "",
      weight: pet.weight ?? "",
      birth_date: pet.birth_date || "",
      photo_data: pet.photo_data || "",
      additional_info: pet.additional_info || "",
      medical_background: pet.medical_background || "",
      feeding_info: pet.feeding_info || "",
    });

    window.setTimeout(() => {
      document
        .getElementById("vm-owner-pet-editor")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 80);
  }


  function handlePetPhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Selecciona un archivo de imagen.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("La fotografía no debe superar 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setOwnerPetForm((current) => ({
        ...current,
        photo_data: String(reader.result || ""),
      }));

      setMessage("Fotografía cargada. Guarda la mascota para conservarla.");
    };

    reader.readAsDataURL(file);
  }

  function upcomingReservationsForPet(petId) {
    const today = new Date().toISOString().slice(0, 10);

    return reservations
      .filter(
        (reservation) =>
          reservation.pet_id === petId &&
          reservation.status !== "cancelled" &&
          reservation.status !== "completed" &&
          reservation.appointment_date >= today
      )
      .sort((a, b) => {
        const first = `${a.appointment_date}T${String(
          a.appointment_time
        ).slice(0, 5)}`;

        const second = `${b.appointment_date}T${String(
          b.appointment_time
        ).slice(0, 5)}`;

        return first.localeCompare(second);
      });
  }

  function nextOwnerReservation() {
    const today = new Date().toISOString().slice(0, 10);

    return reservations
      .filter(
        (reservation) =>
          reservation.status !== "cancelled" &&
          reservation.status !== "completed" &&
          reservation.appointment_date >= today
      )
      .sort((a, b) => {
        const first = `${a.appointment_date}T${String(
          a.appointment_time
        ).slice(0, 5)}`;

        const second = `${b.appointment_date}T${String(
          b.appointment_time
        ).slice(0, 5)}`;

        return first.localeCompare(second);
      })[0];
  }

  function clearWeightForm() {
    setWeightForm({
      weight: "",
      record_date: new Date().toISOString().slice(0, 10),
      note: "",
    });
  }

  async function savePetWeight(e) {
    e.preventDefault();

    if (!selectedPet) {
      setMessage("Selecciona una mascota.");
      return;
    }

    if (!weightForm.weight || Number(weightForm.weight) <= 0) {
      setMessage("Ingresa un peso válido.");
      return;
    }

    try {
      await createPetWeight(token, selectedPet.id, {
        weight: Number(weightForm.weight),
        record_date: weightForm.record_date,
        note: weightForm.note || null,
      });

      clearWeightForm();

      const updatedPets = await getPets(token);
      setPets(updatedPets);

      const updatedSelected =
        updatedPets.find((pet) => pet.id === selectedPet.id) || selectedPet;

      setSelectedPet(updatedSelected);

      const weightData = await getPetWeights(token, selectedPet.id);
      setPetWeights(weightData);

      setMessage("Peso registrado correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function removePetWeight(weightId) {
    const confirmDelete = await openConfirmDialog({
      title: "Eliminar registro de peso",
      message:
        "¿Quieres eliminar este registro del historial de peso?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmDelete || !selectedPet) {
      return;
    }

    try {
      await deletePetWeight(token, weightId);

      const updatedPets = await getPets(token);
      setPets(updatedPets);

      const updatedSelected =
        updatedPets.find((pet) => pet.id === selectedPet.id) || selectedPet;

      setSelectedPet(updatedSelected);

      const weightData = await getPetWeights(token, selectedPet.id);
      setPetWeights(weightData);

      setMessage("Registro de peso eliminado.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  function closeAdminUserProfile() {
    setSelectedAdminUser(null);
  }


  function adminUserPetCount(userId) {
    return adminPets.filter(
      (pet) => pet.owner_id === userId
    ).length;
  }


  function userRoleEmoji(role) {
    if (role === "admin") return "🛡️";
    if (role === "vet") return "🩺";
    if (role === "store") return "🏪";
    return "🐾";
  }


  function closePetProfile() {
    setSelectedPet(null);
    setPetWeights([]);
    setMedicationSchedule([]);
    clearWeightForm();
    clearAdminPetForm();
    clearOwnerVaccineForm();
    clearOwnerMedicationForm();
    clearAdminVaccineForm();
    clearAdminMedicationForm();
    clearAdminConsultationForm();
    clearAdminPrescriptionForm();
    setAdminPrescriptions([]);
    setAdminClinicalEditor(null);
  }


  async function viewPetProfile(petToView) {
    try {
      setSelectedPet(petToView);

      const vaccinesData =
        currentUser?.role === "admin"
          ? await getAdminVaccines(token, petToView.id)
          : await getVaccines(token, petToView.id);

      const medicationsData =
        currentUser?.role === "admin"
          ? await getAdminMedications(token, petToView.id)
          : await getMedications(token, petToView.id);

      const consultationsData =
        currentUser?.role === "admin"
          ? await getAdminConsultations(token, petToView.id)
          : await getConsultations(token, petToView.id);

      const prescriptionsData =
        currentUser?.role === "admin"
          ? await getAdminPrescriptions(
              token,
              petToView.id
            )
          : [];

      const weightsData =
        currentUser?.role === "admin"
          ? []
          : await getPetWeights(token, petToView.id);

      const medicationScheduleData =
        currentUser?.role === "owner"
          ? await getPetMedicationSchedule(
              token,
              petToView.id
            )
          : [];

      setVaccines(vaccinesData);
      setMedications(medicationsData);
      setConsultations(consultationsData);
      setAdminPrescriptions(prescriptionsData);
      setPetWeights(weightsData);
      setMedicationSchedule(medicationScheduleData);

      setMessage(`Viendo perfil de ${petToView.name}.`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveOwnerVaccine(e) {
    e.preventDefault();

    if (!selectedPet) {
      setMessage("Primero selecciona una mascota.");
      return;
    }

    if (!ownerVaccineForm.name) {
      setMessage("Debes ingresar el nombre de la vacuna.");
      return;
    }

    const data = {
      name: ownerVaccineForm.name,
      application_date: ownerVaccineForm.application_date || null,
      next_dose_date: ownerVaccineForm.next_dose_date || null,
      observation: ownerVaccineForm.observation || null,
    };

    try {
      if (editingOwnerVaccineId) {
        await updateVaccine(token, editingOwnerVaccineId, data);
        setMessage("Vacuna actualizada correctamente.");
      } else {
        await createVaccine(token, selectedPet.id, data);
        setMessage("Vacuna agregada correctamente.");
      }

      clearOwnerVaccineForm();
      await viewPetProfile(selectedPet);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEditOwnerVaccine(vaccine) {
    setEditingOwnerVaccineId(vaccine.id);

    setOwnerVaccineForm({
      name: vaccine.name || "",
      application_date: vaccine.application_date || "",
      next_dose_date: vaccine.next_dose_date || "",
      observation: vaccine.observation || "",
    });

    setMessage("Editando vacuna.");
  }

  async function removeOwnerVaccine(vaccineId) {
    const confirmDelete = await openConfirmDialog({
      title: "Eliminar vacuna",
      message:
        "¿Quieres eliminar esta vacuna del registro de la mascota?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteVaccine(token, vaccineId);
      await viewPetProfile(selectedPet);
      setMessage("Vacuna eliminada correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  function medicationReminderTimes(value) {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function todayScheduleForMedication(medicationId) {
    return medicationSchedule.filter(
      (item) =>
        Number(item.medication_id) ===
        Number(medicationId)
    );
  }

  function medicationAdministrationTime(value) {
    if (!value) return "";
    const text = String(value);
    const match = text.match(/T(\\d{2}:\\d{2})/);
    return match ? match[1] : "";
  }

  function medicationScheduleStatusLabel(item) {
    if (item.status === "administered") {
      const administeredTime =
        medicationAdministrationTime(
          item.administered_at
        );

      return administeredTime
        ? `Administrado ${administeredTime}`
        : "Administrado";
    }

    if (item.status === "due") return "Corresponde ahora";
    if (item.status === "overdue") return "Pendiente";
    return "Programado";
  }

  async function markOwnerMedicationDose(item) {
    if (!selectedPet || !item?.can_mark) return;

    const confirmed = await openConfirmDialog({
      title: "Confirmar medicamento",
      message:
        `¿Confirmas que administraste ${item.medication_name} ` +
        `a ${selectedPet.name} para la dosis de las ` +
        `${item.scheduled_time}?`,
      confirmText: "Sí, administrado",
      cancelText: "Volver",
      tone: "success",
    });

    if (!confirmed) return;

    try {
      await markMedicationAdministered(
        token,
        item.medication_id,
        {
          scheduled_date: item.scheduled_date,
          scheduled_time: item.scheduled_time,
        }
      );

      const scheduleData =
        await getPetMedicationSchedule(
          token,
          selectedPet.id
        );

      setMedicationSchedule(scheduleData);
      await loadNotifications(token, true);

      showSuccessToast(
        "Medicamento administrado",
        `${selectedPet.name} · ${item.medication_name} · ${item.scheduled_time}`,
        "DOSIS REGISTRADA",
        "💊"
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveOwnerMedication(e) {
    e.preventDefault();

    if (!selectedPet) {
      setMessage("Primero selecciona una mascota.");
      return;
    }

    if (!ownerMedicationForm.name) {
      setMessage("Debes ingresar el nombre del medicamento.");
      return;
    }

    const data = {
      name: ownerMedicationForm.name,
      dose: ownerMedicationForm.dose || null,
      frequency: ownerMedicationForm.frequency || null,
      start_date: ownerMedicationForm.start_date || null,
      end_date: ownerMedicationForm.end_date || null,
      reminder_times: ownerMedicationForm.reminder_times || null,
      observation: ownerMedicationForm.observation || null,
    };

    try {
      if (editingOwnerMedicationId) {
        await updateMedication(token, editingOwnerMedicationId, data);
        setMessage("Medicamento actualizado correctamente.");
      } else {
        await createMedication(token, selectedPet.id, data);
        setMessage("Medicamento agregado correctamente.");
      }

      clearOwnerMedicationForm();
      await viewPetProfile(selectedPet);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEditOwnerMedication(medication) {
    setEditingOwnerMedicationId(medication.id);

    setOwnerMedicationForm({
      name: medication.name || "",
      dose: medication.dose || "",
      frequency: medication.frequency || "",
      start_date: medication.start_date || "",
      end_date: medication.end_date || "",
      reminder_times: medication.reminder_times || "",
      observation: medication.observation || "",
    });

    setMessage("Editando medicamento.");
  }

  async function removeOwnerMedication(medicationId) {
    const confirmDelete = await openConfirmDialog({
      title: "Eliminar medicamento",
      message:
        "¿Quieres eliminar este medicamento del registro de la mascota?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteMedication(token, medicationId);
      await viewPetProfile(selectedPet);
      setMessage("Medicamento eliminado correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveOwnerConsultation(e) {
    e.preventDefault();

    if (!selectedPet) {
      setMessage("Primero selecciona una mascota.");
      return;
    }

    if (!ownerConsultationForm.reason) {
      setMessage("Debes ingresar el motivo de la consulta.");
      return;
    }

    const data = {
      consultation_date: ownerConsultationForm.consultation_date || null,
      reason: ownerConsultationForm.reason,
      diagnosis: ownerConsultationForm.diagnosis || null,
      treatment: ownerConsultationForm.treatment || null,
      veterinarian: ownerConsultationForm.veterinarian || null,
      observation: ownerConsultationForm.observation || null,
    };

    try {
      if (editingOwnerConsultationId) {
        await updateConsultation(token, editingOwnerConsultationId, data);
        setMessage("Consulta actualizada correctamente.");
      } else {
        await createConsultation(token, selectedPet.id, data);
        setMessage("Consulta agregada correctamente.");
      }

      clearOwnerConsultationForm();
      await viewPetProfile(selectedPet);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEditOwnerConsultation(consultation) {
    setEditingOwnerConsultationId(consultation.id);

    setOwnerConsultationForm({
      consultation_date: consultation.consultation_date || "",
      reason: consultation.reason || "",
      diagnosis: consultation.diagnosis || "",
      treatment: consultation.treatment || "",
      veterinarian: consultation.veterinarian || "",
      observation: consultation.observation || "",
    });

    setMessage("Editando consulta.");
  }

  async function saveAdminUser(e) {
    e.preventDefault();

    if (!editingAdminUserId) {
      setMessage("Selecciona un usuario para editar.");
      return;
    }

    if (!adminUserForm.name || !adminUserForm.email) {
      setMessage("Debes ingresar nombre y correo.");
      return;
    }

    if (adminUserForm.password || adminUserForm.confirm_password) {
      if (adminUserForm.password !== adminUserForm.confirm_password) {
        setMessage("Las contraseñas no coinciden.");
        return;
      }
    }

    try {
      const updateData = {
        name: adminUserForm.name,
        email: adminUserForm.email,
        role: adminUserForm.role,
        rut: adminUserForm.rut || null,
        country: adminUserForm.country || null,
        region: adminUserForm.region || null,
        city: adminUserForm.city || null,
        birth_date: adminUserForm.birth_date || null,
        veterinary_id:
          adminUserForm.role === "vet" && adminUserForm.veterinary_id
            ? Number(adminUserForm.veterinary_id)
            : null,
        store_id:
          adminUserForm.role === "store" && adminUserForm.store_id
            ? Number(adminUserForm.store_id)
            : null,
      };

      if (adminUserForm.password) {
        updateData.password = adminUserForm.password;
        updateData.confirm_password = adminUserForm.confirm_password;
      }

      await updateAdminUser(token, editingAdminUserId, updateData);
      setMessage("Usuario actualizado correctamente.");

      clearAdminUserForm();
      await loadAdminData();
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEditAdminUser(user) {
    setAccountMode("admin");
    setAdminActiveTab("usuarios");
    setSelectedAdminUser(null);
    setEditingAdminUserId(user.id);

    setAdminUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirm_password: "",
      role: user.role || "owner",
      rut: user.rut || "",
      country: user.country || "",
      region: user.region || "",
      city: user.city || "",
      birth_date: user.birth_date || "",
      birth_year: user.birth_year ?? "",
      veterinary_id: user.veterinary_id
        ? String(user.veterinary_id)
        : "",
      store_id: user.store_id
        ? String(user.store_id)
        : "",
    });

    setMessage("Editando usuario. La contraseña es opcional.");
  }

  async function removeAdminUser(userId) {
    const confirmDelete = await openConfirmDialog({
      title: "Eliminar usuario",
      message:
        "Esta acción eliminará el usuario del sistema. ¿Deseas continuar?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteAdminUser(token, userId);
      await loadAdminData();
      setMessage("Usuario eliminado correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function removeAdminPet(petId) {
    const confirmDelete = await openConfirmDialog({
      title: "Eliminar mascota",
      message:
        "Esta acción eliminará la mascota del panel administrativo. ¿Deseas continuar?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteAdminPet(token, petId);

      if (selectedPet?.id === petId) {
        setSelectedPet(null);
        setVaccines([]);
        setMedications([]);
      }

      await loadAdminData();
      setMessage("Mascota eliminada correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }


  function startEditAdminPet(pet) {
    setAdminActiveTab("clinico");
    setEditingAdminPetId(pet.id);

    setAdminPetForm({
      name: pet.name || "",
      species: isKnownPetSpecies(pet.species)
        ? pet.species
        : "Otro",
      species_other: isKnownPetSpecies(pet.species)
        ? ""
        : pet.species || "",
      breed: pet.breed || "",
      breed_other: "",
      age: pet.age ?? "",
      age_months: pet.age_months ?? "",
      weight: pet.weight ?? "",
    });

    setSelectedPet(null);
    setAdminClinicalEditor(null);

    setMessage("Editando mascota. También puedes agregar o editar vacunas y medicamentos.");
  }

  async function saveAdminPet(e) {
    e.preventDefault();

    if (!editingAdminPetId) {
      setMessage("Primero selecciona una mascota para editar.");
      return;
    }

    const selectedSpecies =
      adminPetForm.species === "Otro"
        ? adminPetForm.species_other.trim()
        : adminPetForm.species;

    if (!adminPetForm.name || !selectedSpecies) {
      setMessage(
        "La mascota debe tener nombre y especie."
      );
      return;
    }

    const selectedBreed =
      adminPetForm.breed === "__other__"
        ? adminPetForm.breed_other.trim()
        : adminPetForm.breed.trim();

    if (
      adminPetForm.breed === "__other__" &&
      selectedBreed.length < 2
    ) {
      setMessage(
        "Escribe una raza o variedad válida."
      );
      return;
    }

    try {
      let breedToSave =
        selectedBreed || null;

      if (
        adminPetForm.breed === "__other__" &&
        selectedBreed
      ) {
        const registeredBreed =
          await registerPetBreed(
            token,
            selectedSpecies,
            selectedBreed
          );

        breedToSave =
          registeredBreed.name;
      }

      const updatedPet = await updateAdminPet(token, editingAdminPetId, {
        name: adminPetForm.name,
        species: selectedSpecies,
        breed: breedToSave,
        age: adminPetForm.age ? Number(adminPetForm.age) : null,
        age_months: adminPetForm.age_months ? Number(adminPetForm.age_months) : null,
        weight: adminPetForm.weight ? Number(adminPetForm.weight) : null,
      });

      setSelectedPet(null);
      await loadAdminData();
      clearAdminPetForm();
      setAdminActiveTab("mascotas");
      setMessage("Mascota actualizada correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveAdminVaccine(e) {
    e.preventDefault();

    if (!selectedPet) {
      setMessage("Primero selecciona una mascota.");
      return;
    }

    if (!adminVaccineForm.name) {
      setMessage("Debes ingresar el nombre de la vacuna.");
      return;
    }

    try {
      const data = {
        name: adminVaccineForm.name,
        application_date: adminVaccineForm.application_date || null,
        next_dose_date: adminVaccineForm.next_dose_date || null,
        observation: adminVaccineForm.observation || null,
      };

      if (editingVaccineId) {
        await updateAdminVaccine(token, editingVaccineId, data);
        setMessage("Vacuna actualizada correctamente.");
      } else {
        await createAdminVaccine(token, selectedPet.id, data);
        setMessage("Vacuna agregada correctamente.");
      }

      clearAdminVaccineForm();
      setAdminClinicalEditor(null);
      await viewPetProfile(selectedPet);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEditVaccine(vaccine) {
    openAdminClinicalEditor(
      "vaccine",
      vaccine
    );
  }

  async function removeAdminVaccine(vaccineId) {
    const confirmDelete = await openConfirmDialog({
      title: "Eliminar vacuna",
      message:
        "¿Quieres eliminar esta vacuna del historial clínico?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteAdminVaccine(token, vaccineId);
      await viewPetProfile(selectedPet);
      setMessage("Vacuna eliminada correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveAdminMedication(e) {
    e.preventDefault();

    if (!selectedPet) {
      setMessage("Primero selecciona una mascota.");
      return;
    }

    if (!adminMedicationForm.name) {
      setMessage("Debes ingresar el nombre del medicamento.");
      return;
    }

    try {
      const data = {
        name: adminMedicationForm.name,
        dose: adminMedicationForm.dose || null,
        frequency: adminMedicationForm.frequency || null,
        start_date: adminMedicationForm.start_date || null,
        end_date: adminMedicationForm.end_date || null,
        reminder_times: adminMedicationForm.reminder_times || null,
        observation: adminMedicationForm.observation || null,
      };

      if (editingMedicationId) {
        await updateAdminMedication(token, editingMedicationId, data);
        setMessage("Medicamento actualizado correctamente.");
      } else {
        await createAdminMedication(token, selectedPet.id, data);
        setMessage("Medicamento agregado correctamente.");
      }

      clearAdminMedicationForm();
      setAdminClinicalEditor(null);
      await viewPetProfile(selectedPet);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEditMedication(medication) {
    openAdminClinicalEditor(
      "medication",
      medication
    );
  }

  async function removeAdminMedication(medicationId) {
    const confirmDelete = await openConfirmDialog({
      title: "Eliminar medicamento",
      message:
        "¿Quieres eliminar este medicamento del historial clínico?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteAdminMedication(token, medicationId);
      await viewPetProfile(selectedPet);
      setMessage("Medicamento eliminado correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveAdminConsultation(e) {
    e.preventDefault();

    if (!selectedPet) {
      setMessage("Primero selecciona una mascota.");
      return;
    }

    if (!adminConsultationForm.reason) {
      setMessage("Debes ingresar el motivo de la consulta.");
      return;
    }

    const data = {
      consultation_date: adminConsultationForm.consultation_date || null,
      reason: adminConsultationForm.reason,
      diagnosis: adminConsultationForm.diagnosis || null,
      treatment: adminConsultationForm.treatment || null,
      veterinarian: adminConsultationForm.veterinarian || null,
      observation: adminConsultationForm.observation || null,
    };

    try {
      if (editingConsultationId) {
        await updateAdminConsultation(token, editingConsultationId, data);
        setMessage("Consulta actualizada correctamente.");
      } else {
        await createAdminConsultation(token, selectedPet.id, data);
        setMessage("Consulta agregada correctamente.");
      }

      clearAdminConsultationForm();
      setAdminClinicalEditor(null);
      await viewPetProfile(selectedPet);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEditConsultation(consultation) {
    openAdminClinicalEditor(
      "consultation",
      consultation
    );
  }

  async function saveAdminPrescription(e) {
    e.preventDefault();

    if (!selectedPet) {
      setMessage("Selecciona una mascota.");
      return;
    }

    if (!adminPrescriptionForm.veterinary_id) {
      setMessage(
        "Selecciona la clínica asociada a la receta."
      );
      return;
    }

    if (!adminPrescriptionForm.medication.trim()) {
      setMessage(
        "Debes ingresar el medicamento de la receta."
      );
      return;
    }

    const data = {
      veterinary_id: Number(
        adminPrescriptionForm.veterinary_id
      ),
      issue_date:
        adminPrescriptionForm.issue_date ||
        null,
      medication:
        adminPrescriptionForm.medication.trim(),
      dosage:
        adminPrescriptionForm.dosage ||
        null,
      frequency:
        adminPrescriptionForm.frequency ||
        null,
      duration:
        adminPrescriptionForm.duration ||
        null,
      instructions:
        adminPrescriptionForm.instructions ||
        null,
    };

    try {
      if (editingAdminPrescriptionId) {
        await updateAdminPrescription(
          token,
          editingAdminPrescriptionId,
          data
        );

        setMessage(
          "Receta actualizada correctamente."
        );
      } else {
        await createAdminPrescription(
          token,
          selectedPet.id,
          data
        );

        setMessage(
          "Receta creada correctamente."
        );
      }

      clearAdminPrescriptionForm();
      setAdminClinicalEditor(null);
      await viewPetProfile(selectedPet);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function removeAdminPrescription(item) {
    const confirmed = await openConfirmDialog({
      title: "Eliminar receta",
      message:
        `Se eliminará la receta de "${item.medication}".\n\n` +
        "¿Deseas continuar?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminPrescription(
        token,
        item.id
      );

      await viewPetProfile(selectedPet);

      setMessage(
        "Receta eliminada correctamente."
      );
    } catch (err) {
      setMessage(err.message);
    }
  }


  async function removeAdminConsultation(consultationId) {
    const confirmDelete = await openConfirmDialog({
      title: "Eliminar consulta",
      message:
        "¿Quieres eliminar esta consulta del historial clínico?",
      confirmText: "Sí, eliminar",
      cancelText: "Volver",
      tone: "danger",
    });

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteAdminConsultation(token, consultationId);
      await viewPetProfile(selectedPet);
      setMessage("Consulta eliminada correctamente.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  function logout() {
    sessionStorage.removeItem("vetmap_token");

    setToken("");
    setCurrentUser(null);
    setAdminActiveTab("usuarios");
    setNotifications([]);
    setNotificationsOpen(false);
    setHeaderCartOpen(false);
    setOwnerMenuOpen(false);
    setSelectedAdminUser(null);
    closeSuccessToast();
    setPets([]);
    setAdminUsers([]);
    setAdminPets([]);
    setSelectedPet(null);
    setVaccines([]);
    setMedications([]);
    setConsultations([]);
    setAdminPrescriptions([]);
    setAdminClinicalEditor(null);
    setPetWeights([]);
    clearWeightForm();
    setClinics([]);

    setClinicDashboard(null);
    setClinicAppointments([]);
    setClinicPatients([]);
    setClinicPrescriptions([]);
    setClinicSelectedPatient(null);
    setClinicPatientHistory(null);
    clearClinicForms();
    setStoreDashboard(null);
    setStoreProducts([]);
    setStoreOrders([]);
    setMyStoreOrders([]);
    setCart([]);
    clearStoreProductForm();
    setReservations([]);
    clearReservationForm();
    setShowOwnerPetForm(false);
    clearOwnerPetForm();
    clearOwnerVaccineForm();
    clearOwnerMedicationForm();
    clearOwnerConsultationForm();
    clearAdminUserForm();
    clearAdminPetForm();
    clearAdminVaccineForm();
    clearAdminMedicationForm();
    clearAdminConsultationForm();

    setPublicSection("inicio");
    setAuthActiveTab("login");
    setMemberSection("inicio");
    setAccountMode("profile");
    setShowProfileEdit(false);
    setMessage("Sesión cerrada correctamente.");
  }

  return (
    <main className="min-h-screen vm-web-app-bg">
      {successToast && (
        <div
          className={`vm-success-toast ${
            successToast.tone === "reminder"
              ? "vm-success-toast--reminder"
              : ""
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="vm-success-toast-check">
            {successToast.icon || "✓"}
          </div>

          <div className="vm-success-toast-copy">
            <span>{successToast.label}</span>
            <strong>{successToast.title}</strong>
            <p>{successToast.detail}</p>
          </div>

          <button
            type="button"
            className="vm-success-toast-close"
            onClick={closeSuccessToast}
            aria-label="Cerrar confirmación"
          >
            ×
          </button>

          <div className="vm-success-toast-progress" />
        </div>
      )}

      <div className="vm-web-frame space-y-6">
        {message && (
          <div className="vm-system-message">
            {message}
          </div>
        )}

        {!token || !currentUser ? (
          <section className="vm-public-shell">
            {/* =========================
                NAVEGACIÓN PÚBLICA
                ========================= */}
            <nav className="vm-public-nav">
              <button
                type="button"
                className="vm-brand"
                onClick={() => setPublicSection("inicio")}
              >
                <span className="vm-brand-pets" aria-hidden="true">🐾</span>

                <span className="vm-brand-copy">
                  <strong>VetMap</strong>
                  <small>Cuidado integral</small>
                </span>
              </button>

              <div className="vm-public-menu">
                <button
                  type="button"
                  onClick={() => setPublicSection("inicio")}
                  className={publicSection === "inicio" ? "active" : ""}
                >
                  Inicio
                </button>

                <button
                  type="button"
                  onClick={openPublicClinicsDirectory}
                  className={publicSection === "veterinarias" ? "active" : ""}
                >
                  Veterinarias
                </button>

                <button
                  type="button"
                  onClick={openPublicStoresDirectory}
                  className={publicSection === "tiendas" ? "active" : ""}
                >
                  Tienda
                </button>

                <button
                  type="button"
                  onClick={() => setPublicSection("reserva")}
                  className={publicSection === "reserva" ? "active" : ""}
                >
                  Reserva de hora
                </button>

                <button
                  type="button"
                  onClick={() => setPublicSection("ayuda")}
                  className={publicSection === "ayuda" ? "active" : ""}
                >
                  Ayuda
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPublicSection("auth");
                    setAuthActiveTab("login");
                  }}
                  className={`vm-login-nav ${
                    publicSection === "auth" ? "active" : ""
                  }`}
                >
                  Iniciar sesión
                </button>
              </div>
            </nav>

            {/* =========================
                INICIO
                ========================= */}
            {publicSection === "inicio" && (
              <>
                <section className="vm-hp-hero">
                  <div className="vm-hp-hero-copy">
                    <p className="vm-hp-eyebrow">
                      TODO PARA SU BIENESTAR
                    </p>

                    <h1>
                      Todo lo que tu mascota necesita,
                      <span> en un solo lugar.</span>
                    </h1>

                    <p className="vm-hp-hero-text">
                      Veterinarias, reservas, historial clínico y productos
                      para mascotas reunidos en una sola plataforma.
                    </p>

                    <div className="vm-hp-hero-actions">
                      <button
                        type="button"
                        className="vm-hp-btn vm-hp-btn--primary"
                        onClick={openPublicClinicsDirectory}
                      >
                        Buscar veterinaria
                      </button>

                      <button
                        type="button"
                        className="vm-hp-btn vm-hp-btn--ghost"
                        onClick={openPublicStoresDirectory}
                      >
                        Explorar tiendas →
                      </button>
                    </div>

                    <div className="vm-hp-trust-row">
                      <span>✓ Reserva online</span>
                      <span>✓ Historial organizado</span>
                      <span>✓ Marketplace VetMap</span>
                    </div>
                  </div>

                  <div className="vm-hp-hero-art" aria-hidden="true">
                    <div className="vm-hp-art-blob vm-hp-art-blob--one"></div>
                    <div className="vm-hp-art-blob vm-hp-art-blob--two"></div>

                    <div className="vm-hp-pet-stage">
                      <span className="vm-hp-pet vm-hp-pet--dog">🐶</span>
                      <span className="vm-hp-pet vm-hp-pet--cat">🐱</span>
                    </div>

                    <div className="vm-hp-floating vm-hp-floating--clinic">
                      <span>🏥</span>
                      <div>
                        <strong>Veterinarias</strong>
                        <small>Servicios y horarios</small>
                      </div>
                    </div>

                    <div className="vm-hp-floating vm-hp-floating--shop">
                      <span>🛍️</span>
                      <div>
                        <strong>Marketplace</strong>
                        <small>Compra por tienda</small>
                      </div>
                    </div>

                    <div className="vm-hp-floating vm-hp-floating--health">
                      <span>🩺</span>
                      <div>
                        <strong>Ficha clínica</strong>
                        <small>Todo en orden</small>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="vm-hp-benefits">
                  <article>
                    <span>📅</span>
                    <div>
                      <strong>Reserva en línea</strong>
                      <small>Agenda una atención en pocos pasos.</small>
                    </div>
                  </article>

                  <article>
                    <span>🩺</span>
                    <div>
                      <strong>Control de salud</strong>
                      <small>Vacunas, consultas y medicamentos.</small>
                    </div>
                  </article>

                  <article>
                    <span>💳</span>
                    <div>
                      <strong>Compra segura</strong>
                      <small>Pago integrado con Mercado Pago.</small>
                    </div>
                  </article>

                  <article>
                    <span>📦</span>
                    <div>
                      <strong>Seguimiento</strong>
                      <small>Revisa el estado de tus pedidos.</small>
                    </div>
                  </article>
                </section>

                <section className="vm-hp-section">
                  <div className="vm-hp-section-head">
                    <div>
                      <p className="vm-hp-eyebrow">
                        PARA CADA COMPAÑERO
                      </p>
                      <h2>
                        Encuentra productos para cualquier mascota
                      </h2>
                      <p>
                        Entra al marketplace usando una categoría rápida
                        y revisa las tiendas disponibles.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="vm-hp-text-link"
                      onClick={openPublicStoresDirectory}
                    >
                      Ver todo el marketplace →
                    </button>
                  </div>

                  <div className="vm-hp-pet-categories">
                    {[
                      ["Perros", "🐶", "Perros", "Alimentos · Snacks · Accesorios"],
                      ["Gatos", "🐱", "Gatos", "Alimentos · Higiene · Juguetes"],
                      ["Conejos", "🐰", "Conejos", "Alimentos · Hábitat · Accesorios"],
                      ["Aves", "🦜", "Aves", "Alimentos · Jaulas · Cuidado"],
                      ["Peces", "🐠", "Peces", "Alimentos · Acuario · Accesorios"],
                      ["Exóticos", "🦎", "Iguana", "Reptiles · Terrarios · Cuidado"],
                    ].map(([title, emoji, search, text]) => (
                      <button
                        key={title}
                        type="button"
                        className="vm-hp-pet-category"
                        onClick={() =>
                          openPublicPetCategory(search)
                        }
                      >
                        <span className="vm-hp-pet-category-icon">
                          {emoji}
                        </span>

                        <div>
                          <strong>{title}</strong>
                          <small>{text}</small>
                        </div>

                        <span className="vm-hp-pet-category-arrow">→</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="vm-hp-care-section">
                  <div className="vm-hp-care-art">
                    <div className="vm-hp-care-circle">
                      <span>🐾</span>
                    </div>

                    <div className="vm-hp-care-card vm-hp-care-card--top">
                      <span>💉</span>
                      <div>
                        <strong>Vacunas</strong>
                        <small>Fechas y próximas dosis</small>
                      </div>
                    </div>

                    <div className="vm-hp-care-card vm-hp-care-card--bottom">
                      <span>💊</span>
                      <div>
                        <strong>Medicamentos</strong>
                        <small>Tratamientos y recordatorios</small>
                      </div>
                    </div>
                  </div>

                  <div className="vm-hp-care-copy">
                    <p className="vm-hp-eyebrow">
                      MÁS QUE UNA TIENDA
                    </p>

                    <h2>
                      Cuidamos cada parte de su bienestar.
                    </h2>

                    <p>
                      VetMap conecta el cuidado veterinario con la vida
                      diaria de tu mascota. Puedes organizar sus datos,
                      reservar atenciones y comprar lo que necesite sin
                      saltar entre distintas plataformas.
                    </p>

                    <div className="vm-hp-care-list">
                      <div>
                        <span>01</span>
                        <p>
                          <strong>Perfil de mascota</strong>
                          Datos generales, peso e información importante.
                        </p>
                      </div>

                      <div>
                        <span>02</span>
                        <p>
                          <strong>Historial clínico</strong>
                          Consultas, vacunas y medicamentos en una sola ficha.
                        </p>
                      </div>

                      <div>
                        <span>03</span>
                        <p>
                          <strong>Reserva veterinaria</strong>
                          Elige mascota, clínica, servicio, fecha y hora.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="vm-hp-btn vm-hp-btn--primary"
                      onClick={openPublicRegister}
                    >
                      Crear cuenta VetMap
                    </button>
                  </div>
                </section>

                <section className="vm-hp-section vm-hp-section--products">
                  <div className="vm-hp-section-head">
                    <div>
                      <p className="vm-hp-eyebrow">
                        MARKETPLACE
                      </p>
                      <h2>Productos destacados</h2>
                      <p>
                        Una selección de productos publicados por las tiendas
                        disponibles en VetMap.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="vm-hp-text-link"
                      onClick={openPublicStoresDirectory}
                    >
                      Ver tiendas →
                    </button>
                  </div>

                  {marketProducts.length === 0 ? (
                    <div className="vm-hp-products-empty">
                      <span>🛍️</span>
                      <strong>Explora las tiendas VetMap</strong>
                      <p>
                        Revisa productos, precios y stock disponible.
                      </p>
                      <button
                        type="button"
                        className="vm-hp-btn vm-hp-btn--primary"
                        onClick={openPublicStoresDirectory}
                      >
                        Ir al marketplace
                      </button>
                    </div>
                  ) : (
                    <div className="vm-hp-product-grid">
                      {marketProducts
                        .filter(
                          (product) =>
                            product.active !== false
                        )
                        .slice(0, 4)
                        .map((product) => (
                          <article
                            key={product.id}
                            className="vm-hp-product-card"
                          >
                            <div className="vm-hp-product-media">
                              {product.image_data ? (
                                <img
                                  src={product.image_data}
                                  alt={product.name}
                                />
                              ) : (
                                <span>
                                  {productEmoji(product.category)}
                                </span>
                              )}

                              <small>
                                {product.category || "Producto"}
                              </small>
                            </div>

                            <div className="vm-hp-product-body">
                              <span className="vm-hp-product-store">
                                {product.store_name || "Tienda VetMap"}
                              </span>

                              <h3>{product.name}</h3>

                              <p>
                                {product.brand || "Sin marca"}
                                {product.format
                                  ? ` · ${product.format}`
                                  : ""}
                              </p>

                              <div className="vm-hp-product-bottom">
                                <strong>
                                  {formatCLP(product.price)}
                                </strong>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openPublicProductStore(product)
                                  }
                                >
                                  Ver tienda
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                    </div>
                  )}
                </section>

                <section className="vm-hp-promo-grid">
                  <article className="vm-hp-promo vm-hp-promo--clinic">
                    <div>
                      <span className="vm-hp-promo-tag">
                        ATENCIÓN VETERINARIA
                      </span>
                      <h2>
                        Encuentra una clínica y reserva tu próxima hora.
                      </h2>
                      <p>
                        Revisa ubicación, servicios y disponibilidad desde VetMap.
                      </p>
                      <button
                        type="button"
                        onClick={openPublicClinicsDirectory}
                      >
                        Ver veterinarias →
                      </button>
                    </div>

                    <span className="vm-hp-promo-emoji">🩺</span>
                  </article>

                  <article className="vm-hp-promo vm-hp-promo--store">
                    <div>
                      <span className="vm-hp-promo-tag">
                        MARKETPLACE
                      </span>
                      <h2>
                        Compra en distintas tiendas sin perder tu carrito.
                      </h2>
                      <p>
                        Compara productos y revisa stock antes de comprar.
                      </p>
                      <button
                        type="button"
                        onClick={openPublicStoresDirectory}
                      >
                        Explorar tiendas →
                      </button>
                    </div>

                    <span className="vm-hp-promo-emoji">🛒</span>
                  </article>
                </section>

                <section className="vm-hp-section vm-hp-testimonials">
                  <div className="vm-hp-section-head">
                    <div>
                      <p className="vm-hp-eyebrow">
                        EXPERIENCIA VETMAP
                      </p>
                      <h2>Una plataforma fácil de entender.</h2>
                      <p>
                        El diseño busca que cada tarea importante tenga su
                        propio apartado y sea fácil de encontrar.
                      </p>
                    </div>
                  </div>

                  <div className="vm-hp-review-grid">
                    <article>
                      <div className="vm-hp-stars">★★★★★</div>
                      <p>
                        “Puedo revisar las mascotas, sus controles y las
                        próximas atenciones sin mezclar toda la información.”
                      </p>
                      <strong>Organización clara</strong>
                    </article>

                    <article>
                      <div className="vm-hp-stars">★★★★★</div>
                      <p>
                        “Las tiendas y veterinarias tienen su propio apartado,
                        así que es mucho más fácil navegar.”
                      </p>
                      <strong>Navegación simple</strong>
                    </article>

                    <article>
                      <div className="vm-hp-stars">★★★★★</div>
                      <p>
                        “Reservas, compras y seguimiento se sienten como partes
                        de una misma plataforma.”
                      </p>
                      <strong>Experiencia integrada</strong>
                    </article>
                  </div>
                </section>

                <section className="vm-hp-final-cta">
                  <div>
                    <p className="vm-hp-eyebrow">
                      EMPIEZA CON VETMAP
                    </p>
                    <h2>
                      Cuidar a tu mascota puede ser mucho más simple.
                    </h2>
                    <p>
                      Registra tu cuenta y reúne reservas, salud y compras
                      en un solo lugar.
                    </p>
                  </div>

                  <div className="vm-hp-final-actions">
                    <button
                      type="button"
                      className="vm-hp-btn vm-hp-btn--light"
                      onClick={openPublicRegister}
                    >
                      Crear cuenta
                    </button>

                    <button
                      type="button"
                      className="vm-hp-btn vm-hp-btn--outline-light"
                      onClick={() => {
                        setPublicSection("auth");
                        setAuthActiveTab("login");
                      }}
                    >
                      Iniciar sesión
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* =========================
                VETERINARIAS
                ========================= */}
            
{publicSection === "veterinarias" && (
              <section className="vm-public-page vm-public-premium-page vm-public-vets-premium">
                {!selectedPublicClinic() ? (
                  <>
                    <section className="vm-public-area-hero vm-public-area-hero--vets">
                      <div className="vm-public-area-copy">
                        <p className="vm-public-area-kicker">RED VETMAP</p>
                        <h1>
                          Veterinarias
                          <span> cerca de ti</span>
                        </h1>
                        <p>
                          Encuentra veterinarias de confianza, revisa sus servicios,
                          ubicación y horarios, y entra a su ficha completa.
                        </p>

                        <div className="vm-public-area-benefits">
                          <div>
                            <span>🛡️</span>
                            <small>
                              Profesionales
                              <br />
                              verificados
                            </small>
                          </div>

                          <div>
                            <span>📍</span>
                            <small>
                              Ubicaciones
                              <br />
                              en Santiago
                            </small>
                          </div>

                          <div>
                            <span>🐾</span>
                            <small>
                              Atención para
                              <br />
                              todas las mascotas
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="vm-public-area-art vm-public-vet-art" aria-hidden="true">
                        <div className="vm-public-art-orb"></div>
                        <div className="vm-public-vet-person">🧑‍⚕️</div>
                        <div className="vm-public-vet-pet">🐕</div>

                        <div className="vm-public-floating-card vm-public-floating-card--vet">
                          <span>🩺</span>
                          <div>
                            <strong>Veterinarias</strong>
                            <small>de confianza</small>
                          </div>
                        </div>

                        <div className="vm-public-floating-card vm-public-floating-card--pet">
                          <span>🐾</span>
                          <div>
                            <strong>Mascotas</strong>
                            <small>más sanas y felices</small>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="vm-public-vet-toolbar">
                      <label className="vm-public-search-control">
                        <span>🔎</span>
                        <input
                          value={publicClinicSearch}
                          onChange={(event) =>
                            setPublicClinicSearch(event.target.value)
                          }
                          placeholder="Buscar por nombre de veterinaria..."
                        />
                      </label>

                      <label className="vm-public-select-control">
                        <span>📍</span>
                        <select
                          value={publicClinicCommune}
                          onChange={(event) =>
                            setPublicClinicCommune(event.target.value)
                          }
                        >
                          <option value="all">Todas las comunas</option>
                          {publicClinicCommunes().map((commune) => (
                            <option key={commune} value={commune}>
                              {commune}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="vm-public-select-control">
                        <span>🧩</span>
                        <select
                          value={publicClinicService}
                          onChange={(event) =>
                            setPublicClinicService(event.target.value)
                          }
                        >
                          <option value="all">Todos los servicios</option>
                          {publicClinicServices().map((service) => (
                            <option key={service} value={service}>
                              {service}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className="vm-public-toolbar-button"
                        onClick={() => {
                          setPublicClinicSearch("");
                          setPublicClinicCommune("all");
                          setPublicClinicService("all");
                        }}
                      >
                        Limpiar filtros
                      </button>
                    </section>

                    <div className="vm-public-vets-layout">
                      <section className="vm-public-vet-results">
                        <div className="vm-public-section-head">
                          <div>
                            <p className="vm-public-area-kicker">
                              VETERINARIAS EN TU ZONA
                            </p>
                            <h2>Veterinarias disponibles</h2>
                          </div>

                          <strong className="vm-public-result-count">
                            {filteredPublicClinics().length}{" "}
                            {filteredPublicClinics().length === 1
                              ? "veterinaria"
                              : "veterinarias"}
                          </strong>
                        </div>

                        {filteredPublicClinics().length === 0 ? (
                          <div className="vm-empty-state">
                            <span>🏥</span>
                            <p>
                              No encontramos veterinarias con esos filtros.
                            </p>
                          </div>
                        ) : (
                          <div className="vm-public-vet-list">
                            {filteredPublicClinics().map((clinic, index) => {
                              const services = String(
                                clinic.services || "Consulta general"
                              )
                                .split(",")
                                .map((service) => service.trim())
                                .filter(Boolean)
                                .slice(0, 3);

                              return (
                                <article
                                  key={clinic.id}
                                  className="vm-public-vet-row"
                                >
                                  <div className="vm-public-vet-photo">
                                    <span>
                                      {clinic.is_24h
                                        ? "🚑"
                                        : index % 2
                                        ? "🐕"
                                        : "🏥"}
                                    </span>
                                  </div>

                                  <div className="vm-public-vet-row-copy">
                                    <span className="vm-public-soft-badge">
                                      {clinic.is_24h
                                        ? "Atención 24 horas"
                                        : "Clínica veterinaria"}
                                    </span>

                                    <h3>{clinic.name}</h3>

                                    <div className="vm-public-vet-rating">
                                      <span>⭐ 4.{8 - (index % 3)}</span>
                                      <small> · Veterinaria VetMap</small>
                                    </div>

                                    <p>📍 {clinic.commune}</p>
                                    <p>
                                      🏠 {clinic.address ||
                                        "Dirección demostrativa"}
                                    </p>

                                    <div className="vm-public-service-chips">
                                      {services.map((service) => (
                                        <span key={service}>
                                          {service}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="vm-public-row-action"
                                    onClick={() =>
                                      openPublicClinic(clinic)
                                    }
                                  >
                                    Ver veterinaria →
                                  </button>
                                </article>
                              );
                            })}
                          </div>
                        )}
                      </section>

                      <aside className="vm-public-vet-map-card">
                        <VetMapPlacesMap
                          title="Ubicación en el mapa"
                          description="Selecciona una veterinaria desde el mapa o la lista."
                          places={filteredPublicClinics()}
                          type="clinic"
                          actionLabel="Ver veterinaria"
                          onAction={openPublicClinic}
                        />
                      </aside>
                    </div>
                  </>
                ) : (
                  <section className="vm-establishment-detail-page">
                    <button
                      type="button"
                      className="vm-establishment-back"
                      onClick={closePublicClinic}
                    >
                      ← Volver a veterinarias
                    </button>

                    <div className="vm-establishment-hero vm-establishment-hero--clinic">
                      <div className="vm-establishment-hero-icon">
                        {selectedPublicClinic().is_24h ? "🚑" : "🏥"}
                      </div>

                      <div className="vm-establishment-hero-copy">
                        <p className="vm-kicker">
                          Veterinaria VetMap
                        </p>
                        <h2>{selectedPublicClinic().name}</h2>
                        <p>
                          Revisa servicios, ubicación y condiciones antes de reservar.
                        </p>

                        <div className="vm-establishment-meta-grid">
                          <span>
                            📍 {selectedPublicClinic().commune}
                          </span>
                          <span>
                            🏠 {selectedPublicClinic().address ||
                              "Dirección demostrativa"}
                          </span>
                          <span>
                            🕐 {selectedPublicClinic().hours ||
                              "Horario por confirmar"}
                          </span>
                          <span>
                            {selectedPublicClinic().is_24h
                              ? "🚑 Atención 24 horas"
                              : "🩺 Atención veterinaria"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="vm-establishment-detail-grid">
                      <section className="vm-establishment-panel">
                        <div className="vm-establishment-panel-heading">
                          <span>🩺</span>
                          <div>
                            <small>Servicios</small>
                            <h3>¿Qué puedes atender aquí?</h3>
                          </div>
                        </div>

                        <div className="vm-establishment-service-grid">
                          {String(
                            selectedPublicClinic().services ||
                              "Consulta general"
                          )
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                            .map((service) => (
                              <span key={service}>
                                ✓ {service}
                              </span>
                            ))}
                        </div>
                      </section>

                      <section className="vm-establishment-panel vm-establishment-panel--cta">
                        <span className="vm-establishment-panel-emoji">
                          📅
                        </span>
                        <h3>¿Quieres reservar una hora?</h3>
                        <p>
                          Inicia sesión para seleccionar tu mascota y
                          revisar horarios reales de esta veterinaria.
                        </p>
                        <button
                          type="button"
                          className="vm-primary"
                          onClick={() => {
                            setReservationForm((current) => ({
                              ...current,
                              veterinary_id: String(
                                selectedPublicClinic().id
                              ),
                            }));
                            setPublicSection("auth");
                            setAuthActiveTab("login");
                          }}
                        >
                          Iniciar sesión para reservar
                        </button>
                      </section>
                    </div>

                    <VetMapPlacesMap
                      title={`Ubicación de ${selectedPublicClinic().name}`}
                      description="Ubicación demostrativa de la veterinaria seleccionada."
                      places={[selectedPublicClinic()]}
                      type="clinic"
                    />
                  </section>
                )}
              </section>
            )}

            {publicSection === "tiendas" && (
              <section className="vm-public-page vm-market-page vm-public-premium-page vm-public-stores-premium">
                {!selectedMarketplaceStore() ? (
                  <>
                    <section className="vm-public-area-hero vm-public-area-hero--stores">
                      <div className="vm-public-area-copy">
                        <p className="vm-public-area-kicker">
                          MARKETPLACE VETMAP
                        </p>

                        <h1>
                          Tiendas para
                          <span> mascotas</span>
                        </h1>

                        <p>
                          Todo lo que tu mascota necesita, en un solo lugar.
                          Explora productos, compara opciones y compra en las
                          tiendas de nuestra red.
                        </p>

                        <div className="vm-public-area-benefits">
                          <div>
                            <span>🚚</span>
                            <small>
                              Productos para
                              <br />
                              su bienestar
                            </small>
                          </div>

                          <div>
                            <span>✅</span>
                            <small>
                              Tiendas confiables
                              <br />
                              y verificadas
                            </small>
                          </div>

                          <div>
                            <span>💚</span>
                            <small>
                              Todo en un
                              <br />
                              solo lugar
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="vm-public-area-art vm-public-store-art" aria-hidden="true">
                        <div className="vm-public-art-orb vm-public-art-orb--store"></div>
                        <div className="vm-public-store-dog">🐶</div>
                        <div className="vm-public-store-cat">🐱</div>

                        <div className="vm-public-floating-card vm-public-floating-card--store">
                          <span>🛍️</span>
                          <div>
                            <strong>Productos</strong>
                            <small>para una vida más feliz</small>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="vm-public-store-directory">
                      <div className="vm-public-section-head">
                        <div>
                          <p className="vm-public-area-kicker">
                            NUESTRA RED
                          </p>
                          <h2>Nuestras tiendas</h2>
                          <p>
                            Explora cada tienda y entra a su catálogo individual.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="vm-public-outline-action"
                          onClick={() => {
                            setPublicSection("auth");
                            setAuthActiveTab("register");
                          }}
                        >
                          🏪 ¿Quieres ser parte de VetMap? →
                        </button>
                      </div>

                      {marketStores.length === 0 ? (
                        <div className="vm-empty-state">
                          <span>🏪</span>
                          <p>Cargando tiendas demostrativas...</p>
                        </div>
                      ) : (
                        <div className="vm-public-store-grid">
                          {marketStores.map((store, index) => (
                            <article
                              key={store.id}
                              className={`vm-public-store-card vm-public-store-card--${
                                index % 3
                              }`}
                            >
                              <div className="vm-public-store-visual">
                                <div className="vm-public-store-logo">
                                  🏪
                                </div>

                                <span className="vm-public-store-network">
                                  Tienda VetMap
                                </span>

                                <div
                                  className="vm-public-store-character"
                                  aria-hidden="true"
                                >
                                  {index % 3 === 0
                                    ? "🐶"
                                    : index % 3 === 1
                                    ? "🐱"
                                    : "🐕"}
                                </div>
                              </div>

                              <div className="vm-public-store-content">
                                <div className="vm-public-store-title-row">
                                  <div>
                                    <span className="vm-public-store-eyebrow">
                                      MARKETPLACE VETMAP
                                    </span>
                                    <h3>{store.name}</h3>
                                  </div>

                                  <span className="vm-public-store-count">
                                    {marketplaceStoreProductCount(store.id)}
                                    <small> productos</small>
                                  </span>
                                </div>

                                <p className="vm-public-store-description">
                                  Explora el catálogo publicado por esta tienda
                                  y revisa sus productos disponibles.
                                </p>

                                <div className="vm-public-store-info-grid">
                                  <div>
                                    <span>📍</span>
                                    <p>
                                      <small>Comuna</small>
                                      <strong>{store.commune}</strong>
                                    </p>
                                  </div>

                                  <div>
                                    <span>🏠</span>
                                    <p>
                                      <small>Dirección</small>
                                      <strong>
                                        {store.address ||
                                          "Dirección demostrativa"}
                                      </strong>
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openPublicMarketplaceStore(store)
                                  }
                                >
                                  Ver tienda
                                  <span>→</span>
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="vm-public-map-section">
                      <VetMapPlacesMap
                        title="Mapa de tiendas VetMap"
                        description="Selecciona una tienda para abrir su catálogo."
                        places={marketStores}
                        type="store"
                        actionLabel="Entrar a la tienda"
                        onAction={openPublicMarketplaceStore}
                      />
                    </section>
                  </>
                ) : (
                  <section className="vm-establishment-detail-page vm-store-detail-page">
                    <button
                      type="button"
                      className="vm-establishment-back"
                      onClick={showAllPublicMarketplaceStores}
                    >
                      ← Volver a tiendas
                    </button>

                    <div className="vm-establishment-hero vm-establishment-hero--store">
                      <div className="vm-establishment-hero-icon">
                        🏪
                      </div>

                      <div className="vm-establishment-hero-copy">
                        <p className="vm-kicker">
                          Tienda VetMap
                        </p>
                        <h2>
                          {selectedMarketplaceStore().name}
                        </h2>
                        <p>
                          Estás dentro de esta tienda. Ahora ves
                          solamente su información y sus productos.
                        </p>

                        <div className="vm-establishment-meta-grid">
                          <span>
                            📍 {selectedMarketplaceStore().commune}
                          </span>
                          <span>
                            🏠 {selectedMarketplaceStore().address ||
                              "Dirección demostrativa"}
                          </span>
                          <span>
                            📦 {selectedMarketplaceStore()
                              .delivery_conditions ||
                              "Condiciones por confirmar"}
                          </span>
                          <span>
                            🛍️ {marketplaceStoreProductCount(
                              selectedMarketplaceStore().id
                            )}{" "}
                            productos
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="vm-store-detail-toolbar">
                      <label className="vm-market-search">
                        <span>🔎</span>
                        <input
                          placeholder={`Buscar en ${selectedMarketplaceStore().name}...`}
                          value={marketSearch}
                          onChange={(e) =>
                            setMarketSearch(e.target.value)
                          }
                        />
                      </label>

                      <select
                        value={marketCategory}
                        onChange={(e) =>
                          setMarketCategory(e.target.value)
                        }
                      >
                        <option value="all">
                          Todas las categorías
                        </option>
                        {marketplaceCategories().map(
                          (category) => (
                            <option
                              key={category}
                              value={category}
                            >
                              {category}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="vm-store-products-heading">
                      <div>
                        <p className="vm-kicker">Catálogo</p>
                        <h3>
                          Productos de{" "}
                          {selectedMarketplaceStore().name}
                        </h3>
                      </div>

                      <strong className="vm-market-count">
                        {filteredMarketplaceProducts().length}{" "}
                        {filteredMarketplaceProducts().length === 1
                          ? "producto"
                          : "productos"}
                      </strong>
                    </div>

                    {filteredMarketplaceProducts().length === 0 ? (
                      <div className="vm-empty-state">
                        <span>🔎</span>
                        <p>
                          No encontramos productos con esos filtros.
                        </p>
                      </div>
                    ) : (
                      <div className="vm-product-grid vm-product-grid-four">
                        {filteredMarketplaceProducts().map(
                          (product) => (
                            <article
                              className="vm-product-card vm-real-product"
                              key={product.id}
                            >
                              <div className="vm-product-image">
                                {product.image_data ? (
                                  <img
                                    src={product.image_data}
                                    alt={product.name}
                                  />
                                ) : (
                                  productEmoji(product.category)
                                )}
                              </div>

                              <p className="vm-product-type">
                                {product.category}
                              </p>
                              <h3>{product.name}</h3>
                              <p className="vm-market-brand">
                                {product.brand || "Sin marca"} ·{" "}
                                {product.format || "Sin formato"}
                              </p>

                              <div className="vm-market-product-meta">
                                <span>
                                  📦{" "}
                                  {product.stock > 0
                                    ? `${product.stock} disponibles`
                                    : "Sin stock"}
                                </span>
                              </div>

                              <div className="vm-price-row">
                                <strong>
                                  {formatCLP(product.price)}
                                </strong>
                              </div>

                              <button
                                type="button"
                                disabled={product.stock <= 0}
                                onClick={() =>
                                  goToLoginFromStore(product)
                                }
                              >
                                {product.stock <= 0
                                  ? "Agotado"
                                  : "Iniciar sesión para comprar"}
                              </button>
                            </article>
                          )
                        )}
                      </div>
                    )}

                    <VetMapPlacesMap
                      title={`Ubicación de ${selectedMarketplaceStore().name}`}
                      description="Ubicación demostrativa de la tienda seleccionada."
                      places={[selectedMarketplaceStore()]}
                      type="store"
                    />

                    <div className="vm-public-store-login-banner">
                      <div>
                        <span>🛒</span>
                        <div>
                          <strong>
                            ¿Quieres comprar?
                          </strong>
                          <p>
                            Inicia sesión para agregar productos al
                            carrito y finalizar el pago.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => goToLoginFromStore()}
                      >
                        Iniciar sesión
                      </button>
                    </div>
                  </section>
                )}
              </section>
            )}

            {publicSection === "reserva" && (
              <section className="vm-public-page vm-public-premium-page vm-public-booking-premium">
                <section className="vm-public-area-hero vm-public-area-hero--booking">
                  <div className="vm-public-area-copy">
                    <p className="vm-public-area-kicker">
                      AGENDA VETMAP
                    </p>

                    <h1>
                      Reserva de
                      <span> hora</span>
                    </h1>

                    <p>
                      Agenda tu consulta veterinaria de forma rápida y sencilla.
                      Tu mascota en las mejores manos, más cerca de ti.
                    </p>
                  </div>

                  <div className="vm-public-area-art vm-public-booking-art" aria-hidden="true">
                    <div className="vm-public-art-orb vm-public-art-orb--booking"></div>
                    <div className="vm-public-booking-dog">🐶</div>
                    <div className="vm-public-booking-cat">🐱</div>

                    <div className="vm-public-floating-card vm-public-floating-card--booking">
                      <span>💗</span>
                      <div>
                        <strong>Cuidamos</strong>
                        <small>su bienestar</small>
                      </div>
                    </div>

                    <div className="vm-public-calendar-icon">
                      📅
                    </div>
                  </div>
                </section>

                <section className="vm-public-booking-steps">
                  <article className="vm-public-booking-step">
                    <div className="vm-public-step-head">
                      <span>1</span>
                      <div>
                        <h3>Selecciona una veterinaria</h3>
                        <p>
                          Elige la clínica más cercana o de tu preferencia.
                        </p>
                      </div>
                    </div>

                    <div className="vm-public-vet-choice-list">
                      {publicDemoClinicOptions().map((clinic, index) => {
                        const selected =
                          String(
                            publicDemoVet ||
                              publicDemoClinicOptions()[0]?.id
                          ) === String(clinic.id);

                        return (
                          <button
                            key={clinic.id}
                            type="button"
                            className={
                              selected
                                ? "vm-public-vet-choice selected"
                                : "vm-public-vet-choice"
                            }
                            onClick={() =>
                              setPublicDemoVet(String(clinic.id))
                            }
                          >
                            <span className="vm-public-choice-radio">
                              {selected ? "●" : "○"}
                            </span>
                            <span className="vm-public-choice-icon">
                              {index === 0 ? "🏥" : "🩺"}
                            </span>

                            <div>
                              <strong>{clinic.name}</strong>
                              <small>{clinic.commune}</small>
                            </div>

                            <span className="vm-public-choice-more">
                              Más info →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </article>

                  <article className="vm-public-booking-step">
                    <div className="vm-public-step-head">
                      <span>2</span>
                      <div>
                        <h3>Selecciona un servicio</h3>
                        <p>
                          Elige el tipo de atención que necesitas.
                        </p>
                      </div>
                    </div>

                    <div className="vm-public-service-choice-grid">
                      {[
                        ["Consulta general", "🩺"],
                        ["Vacunación", "💉"],
                        ["Control médico", "💗"],
                        ["Urgencia", "🚨"],
                      ].map(([service, icon]) => (
                        <button
                          key={service}
                          type="button"
                          className={
                            publicDemoService === service
                              ? "selected"
                              : ""
                          }
                          onClick={() =>
                            setPublicDemoService(service)
                          }
                        >
                          <span>{icon}</span>
                          <strong>{service}</strong>
                        </button>
                      ))}
                    </div>
                  </article>

                  <article className="vm-public-booking-step vm-public-booking-step--date">
                    <div className="vm-public-step-head">
                      <span>3</span>
                      <div>
                        <h3>Selecciona fecha y hora</h3>
                        <p>
                          Elige el día y horario que más te acomode.
                        </p>
                      </div>
                    </div>

                    <div className="vm-public-day-grid">
                      {[
                        ["Lun", "28", "Abr"],
                        ["Mar", "29", "Abr"],
                        ["Mié", "30", "Abr"],
                        ["Jue", "01", "May"],
                        ["Vie", "02", "May"],
                      ].map(([day, date, month]) => {
                        const value = `${day} ${date}`;

                        return (
                          <button
                            key={value}
                            type="button"
                            className={
                              publicDemoDay === value
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              setPublicDemoDay(value)
                            }
                          >
                            <small>{day}</small>
                            <strong>{date}</strong>
                            <span>{month}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="vm-public-time-grid">
                      {[
                        "09:00",
                        "10:30",
                        "12:00",
                        "15:00",
                        "17:30",
                        "19:00",
                      ].map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={
                            publicDemoTime === time
                              ? "selected"
                              : ""
                          }
                          onClick={() =>
                            setPublicDemoTime(time)
                          }
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </article>
                </section>

                <section className="vm-public-booking-confirm">
                  <div className="vm-public-booking-confirm-icon">
                    📅
                  </div>

                  <div>
                    <strong>
                      Para confirmar una reserva real
                    </strong>
                    <p>
                      Inicia sesión, selecciona una mascota y confirma
                      disponibilidad real de la veterinaria.
                    </p>

                    <small>
                      Selección de ejemplo: {publicDemoService} ·{" "}
                      {publicDemoDay} · {publicDemoTime}
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={openPublicReservationLogin}
                  >
                    🔒 Iniciar sesión para reservar
                  </button>
                </section>

                <section className="vm-public-booking-benefits">
                  <div className="vm-public-booking-pet" aria-hidden="true">
                    🐶
                  </div>

                  <div className="vm-public-booking-benefit-copy">
                    <p className="vm-public-area-kicker">
                      VETMAP
                    </p>
                    <h2>
                      Consultas más simples,
                      <span> mascotas más felices</span>
                    </h2>
                    <p>
                      Organiza la salud de tu mascota en pocos pasos y con
                      el respaldo de veterinarias confiables.
                    </p>
                  </div>

                  <div className="vm-public-booking-mini-benefits">
                    <div>
                      <span>🛡️</span>
                      <strong>Veterinarios verificados</strong>
                    </div>

                    <div>
                      <span>📅</span>
                      <strong>Reserva online rápida</strong>
                    </div>

                    <div>
                      <span>💗</span>
                      <strong>Cuidado para toda la vida</strong>
                    </div>
                  </div>
                </section>
              </section>
            )}

            {publicSection === "ayuda" && (
              <section className="vm-public-page vm-public-premium-page vm-public-help-premium">
                <section className="vm-public-area-hero vm-public-area-hero--help">
                  <div className="vm-public-area-copy">
                    <p className="vm-public-area-kicker">
                      SOPORTE VETMAP
                    </p>

                    <h1>
                      Centro de ayuda
                    </h1>

                    <h2>
                      Resolvemos tus dudas,
                      <span> siempre contigo.</span>
                    </h2>

                    <p>
                      Encuentra respuestas a preguntas frecuentes sobre
                      mascotas, veterinarias, tiendas y el uso de VetMap.
                    </p>

                    <label className="vm-public-help-search">
                      <span>🔎</span>
                      <input
                        type="text"
                        value={publicHelpSearch}
                        onChange={(event) =>
                          setPublicHelpSearch(event.target.value)
                        }
                        placeholder="¿Qué estás buscando?"
                      />
                    </label>
                  </div>

                  <div className="vm-public-area-art vm-public-help-art" aria-hidden="true">
                    <div className="vm-public-art-orb vm-public-art-orb--help"></div>
                    <div className="vm-public-help-dog">🐶</div>
                    <div className="vm-public-help-cat">🐱</div>

                    <span className="vm-public-help-question">
                      ❓
                    </span>

                    <span className="vm-public-help-light">
                      💡
                    </span>
                  </div>
                </section>

                <section className="vm-public-help-grid">
                  {[
                    {
                      icon: "🐶",
                      title: "Mascotas",
                      description:
                        "Registro, historial clínico y datos de tus compañeros.",
                      faqs: [
                        [
                          "¿Cómo registro una mascota?",
                          "Inicia sesión, entra a Mascotas y selecciona Agregar mascota. El registro se abre en un apartado propio.",
                        ],
                        [
                          "¿Dónde veo el historial clínico?",
                          "Entra a la ficha de la mascota y revisa vacunas, medicamentos y consultas.",
                        ],
                        [
                          "¿Cómo actualizo sus datos?",
                          "Desde la ficha de la mascota selecciona Editar mascota y guarda los cambios.",
                        ],
                        [
                          "¿Puedo tener más de una mascota?",
                          "Sí. Puedes registrar varias mascotas dentro de la misma cuenta de dueño.",
                        ],
                      ],
                    },
                    {
                      icon: "🏥",
                      title: "Veterinarias",
                      description:
                        "Clínicas, servicios, ubicación y reserva de horas.",
                      faqs: [
                        [
                          "¿Cómo busco una clínica?",
                          "Usa Veterinarias y filtra por nombre, comuna o servicio.",
                        ],
                        [
                          "¿Cómo reservo una hora?",
                          "Inicia sesión y completa el flujo Mascota → Veterinaria → Servicio → Fecha y hora.",
                        ],
                        [
                          "¿Cómo reviso una consulta?",
                          "Las consultas registradas aparecen dentro del historial clínico de la mascota.",
                        ],
                        [
                          "¿Puedo cancelar una reserva?",
                          "Sí, mientras la reserva se encuentre en un estado que permita cancelación.",
                        ],
                      ],
                    },
                    {
                      icon: "🛒",
                      title: "Tienda",
                      description:
                        "Productos, precios, stock, carrito y seguimiento.",
                      faqs: [
                        [
                          "¿Cómo busco productos?",
                          "Entra a Tienda, selecciona una tienda y utiliza su buscador y categorías.",
                        ],
                        [
                          "¿Cómo comparo precios?",
                          "Dentro de un producto compatible utiliza Comparar para revisar opciones entre tiendas.",
                        ],
                        [
                          "¿Cómo reviso una tienda?",
                          "Cada tienda abre su propio apartado con información, productos y ubicación.",
                        ],
                        [
                          "¿Cuáles son los métodos de pago?",
                          "VetMap incluye el flujo de pago con Mercado Pago para las compras habilitadas.",
                        ],
                      ],
                    },
                  ].map((category) => {
                    const search = normalizeClinicText(publicHelpSearch);
                    const filteredFaqs = category.faqs.filter(
                      ([question, answer]) =>
                        !search ||
                        normalizeClinicText(category.title).includes(search) ||
                        normalizeClinicText(question).includes(search) ||
                        normalizeClinicText(answer).includes(search)
                    );

                    if (search && filteredFaqs.length === 0) {
                      return null;
                    }

                    return (
                      <article
                        key={category.title}
                        className="vm-public-help-card"
                      >
                        <div className="vm-public-help-card-head">
                          <span>{category.icon}</span>

                          <div>
                            <h3>{category.title}</h3>
                            <p>{category.description}</p>
                          </div>

                          <span className="vm-public-help-card-arrow">
                            →
                          </span>
                        </div>

                        <div className="vm-public-help-faqs">
                          {filteredFaqs.map(([question, answer]) => (
                            <details key={question}>
                              <summary>
                                {question}
                                <span>›</span>
                              </summary>
                              <p>{answer}</p>
                            </details>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </section>

                <section className="vm-public-support-cta">
                  <div className="vm-public-support-bubble">
                    💬
                  </div>

                  <div>
                    <p className="vm-public-area-kicker">
                      ¿AÚN NECESITAS AYUDA?
                    </p>

                    <h2>
                      Estamos aquí
                      <span> para ayudarte</span>
                    </h2>

                    <p>
                      Si no encontraste la respuesta que buscabas,
                      puedes contactarnos y continuar con el soporte.
                    </p>
                  </div>

                  <div className="vm-public-support-action">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href =
                          "mailto:contacto@vetmap.cl?subject=Soporte VetMap";
                      }}
                    >
                      💬 Contactar soporte →
                    </button>

                    <small>
                      🕘 Tiempo estimado de respuesta: 24–48 horas
                    </small>
                  </div>
                </section>
              </section>
            )}

            {publicSection === "auth" && (
              <section
                className={`vm-auth-premium-page vm-auth-mode-${authActiveTab}`}
              >
                <div className="vm-auth-premium-shell">
                  <aside className="vm-auth-showcase">
                    <div className="vm-auth-showcase-copy">
                      <button
                        type="button"
                        className="vm-auth-back-home"
                        onClick={() => setPublicSection("inicio")}
                      >
                        ← Volver al inicio
                      </button>

                      <p className="vm-auth-eyebrow">
                        TU CUENTA VETMAP
                      </p>

                      <h1>
                        {authActiveTab === "register"
                          ? "Empieza a cuidar todo desde un solo lugar."
                          : authActiveTab === "reset"
                          ? "Recupera el acceso a tu cuenta."
                          : "Bienvenido de vuelta a VetMap."}
                      </h1>

                      <p className="vm-auth-showcase-text">
                        {authActiveTab === "register"
                          ? "Crea tu cuenta para registrar mascotas, organizar su salud, reservar atenciones y comprar en las tiendas VetMap."
                          : authActiveTab === "reset"
                          ? "Actualiza tu contraseña de forma simple y vuelve a ingresar a tus mascotas, reservas y compras."
                          : "Ingresa para revisar tus mascotas, próximas reservas, historial clínico, pedidos y notificaciones."}
                      </p>

                      <div className="vm-auth-benefits">
                        <article>
                          <span>🐾</span>
                          <div>
                            <strong>Mascotas</strong>
                            <small>Perfiles y datos importantes</small>
                          </div>
                        </article>

                        <article>
                          <span>🩺</span>
                          <div>
                            <strong>Salud</strong>
                            <small>Historial, vacunas y medicamentos</small>
                          </div>
                        </article>

                        <article>
                          <span>📅</span>
                          <div>
                            <strong>Reservas</strong>
                            <small>Agenda veterinaria organizada</small>
                          </div>
                        </article>

                        <article>
                          <span>🛍️</span>
                          <div>
                            <strong>Marketplace</strong>
                            <small>Tiendas, productos y pedidos</small>
                          </div>
                        </article>
                      </div>
                    </div>

                    <div className="vm-auth-showcase-art" aria-hidden="true">
                      <div className="vm-auth-art-orb vm-auth-art-orb--one"></div>
                      <div className="vm-auth-art-orb vm-auth-art-orb--two"></div>

                      <span className="vm-auth-art-dog">🐶</span>
                      <span className="vm-auth-art-cat">🐱</span>

                      <div className="vm-auth-art-card vm-auth-art-card--health">
                        <span>💗</span>
                        <div>
                          <strong>Todo en orden</strong>
                          <small>Salud y cuidados</small>
                        </div>
                      </div>

                      <div className="vm-auth-art-card vm-auth-art-card--secure">
                        <span>🛡️</span>
                        <div>
                          <strong>Tu espacio</strong>
                          <small>Información organizada</small>
                        </div>
                      </div>
                    </div>
                  </aside>

                  <main className="vm-auth-panel">
                    <div className="vm-auth-panel-inner">
                      <div className="vm-auth-tabs-premium">
                        <button
                          type="button"
                          onClick={() => setAuthActiveTab("login")}
                          className={
                            authActiveTab === "login"
                              ? "active"
                              : ""
                          }
                        >
                          Iniciar sesión
                        </button>

                        <button
                          type="button"
                          onClick={() => setAuthActiveTab("register")}
                          className={
                            authActiveTab === "register"
                              ? "active"
                              : ""
                          }
                        >
                          Crear cuenta
                        </button>
                      </div>

                      {authActiveTab === "login" && (
                        <form
                          onSubmit={login}
                          className="vm-auth-premium-form vm-auth-login-premium"
                        >
                          <div className="vm-auth-premium-heading">
                            <span className="vm-auth-heading-icon">
                              🐾
                            </span>

                            <div>
                              <p>ACCESO VETMAP</p>
                              <h2>Iniciar sesión</h2>
                              <small>
                                Ingresa tus datos para continuar.
                              </small>
                            </div>
                          </div>

                          <div className="vm-auth-field-stack">
                            <label className="vm-auth-premium-field">
                              <span>Correo electrónico</span>
                              <div>
                                <b>✉️</b>
                                <input
                                  placeholder="correo@ejemplo.cl"
                                  type="email"
                                  value={loginForm.email}
                                  onChange={(e) =>
                                    setLoginForm({
                                      ...loginForm,
                                      email: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </label>

                            <label className="vm-auth-premium-field">
                              <span>Contraseña</span>
                              <div>
                                <b>🔒</b>
                                <input
                                  placeholder="Ingresa tu contraseña"
                                  type="password"
                                  value={loginForm.password}
                                  onChange={(e) =>
                                    setLoginForm({
                                      ...loginForm,
                                      password: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </label>
                          </div>

                          <div className="vm-auth-login-tools">
                            <span>
                              🔐 Acceso protegido a tu cuenta
                            </span>

                            <button
                              type="button"
                              onClick={() => setAuthActiveTab("reset")}
                            >
                              ¿Olvidaste tu contraseña?
                            </button>
                          </div>

                          <button
                            type="submit"
                            className="vm-auth-premium-submit"
                          >
                            Ingresar a VetMap
                            <span>→</span>
                          </button>

                          <div className="vm-auth-switch-copy">
                            <span>¿Aún no tienes cuenta?</span>
                            <button
                              type="button"
                              onClick={() => setAuthActiveTab("register")}
                            >
                              Crear cuenta
                            </button>
                          </div>
                        </form>
                      )}

                      {authActiveTab === "register" && (
                        <form
                          onSubmit={register}
                          className="vm-auth-premium-form vm-auth-register-premium"
                        >
                          <div className="vm-auth-premium-heading">
                            <span className="vm-auth-heading-icon">
                              🐶
                            </span>

                            <div>
                              <p>NUEVA CUENTA</p>
                              <h2>Únete a VetMap</h2>
                              <small>
                                Completa tus datos y crea tu espacio personal.
                              </small>
                            </div>
                          </div>

                          <section className="vm-auth-form-section">
                            <div className="vm-auth-section-title">
                              <span>01</span>
                              <div>
                                <strong>Datos de acceso</strong>
                                <small>
                                  Información principal de tu cuenta.
                                </small>
                              </div>
                            </div>

                            <div className="vm-auth-premium-grid">
                              <label className="vm-auth-premium-field">
                                <span>Nombre completo</span>
                                <div>
                                  <b>👤</b>
                                  <input
                                    placeholder="Nombre completo"
                                    value={registerForm.name}
                                    onChange={(e) =>
                                      setRegisterForm({
                                        ...registerForm,
                                        name: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </label>

                              <label className="vm-auth-premium-field">
                                <span>Correo electrónico</span>
                                <div>
                                  <b>✉️</b>
                                  <input
                                    placeholder="correo@ejemplo.cl"
                                    type="email"
                                    value={registerForm.email}
                                    onChange={(e) =>
                                      setRegisterForm({
                                        ...registerForm,
                                        email: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </label>

                              <label className="vm-auth-premium-field">
                                <span>Contraseña</span>
                                <div>
                                  <b>🔒</b>
                                  <input
                                    placeholder="Contraseña"
                                    type="password"
                                    value={registerForm.password}
                                    onChange={(e) =>
                                      setRegisterForm({
                                        ...registerForm,
                                        password: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </label>

                              <label className="vm-auth-premium-field">
                                <span>Confirmar contraseña</span>
                                <div>
                                  <b>✓</b>
                                  <input
                                    placeholder="Repite tu contraseña"
                                    type="password"
                                    value={registerForm.confirm_password}
                                    onChange={(e) =>
                                      setRegisterForm({
                                        ...registerForm,
                                        confirm_password: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </label>
                            </div>
                          </section>

                          <section className="vm-auth-form-section">
                            <div className="vm-auth-section-title">
                              <span>02</span>
                              <div>
                                <strong>Datos personales</strong>
                                <small>
                                  Información necesaria para tu perfil.
                                </small>
                              </div>
                            </div>

                            <div className="vm-auth-premium-grid">
                              <label className="vm-auth-premium-field">
                                <span>RUT</span>
                                <div>
                                  <b>🪪</b>
                                  <input
                                    placeholder="12.345.678-9"
                                    value={registerForm.rut}
                                    onChange={(e) =>
                                      setRegisterForm({
                                        ...registerForm,
                                        rut: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </label>

                              <label className="vm-auth-premium-field">
                                <span>Fecha de nacimiento</span>
                                <div>
                                  <b>🎂</b>
                                  <input
                                    type="date"
                                    max={new Date()
                                      .toISOString()
                                      .slice(0, 10)}
                                    value={registerForm.birth_date}
                                    onChange={(e) =>
                                      setRegisterForm({
                                        ...registerForm,
                                        birth_date: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </label>
                            </div>
                          </section>

                          <section className="vm-auth-form-section">
                            <div className="vm-auth-section-title">
                              <span>03</span>
                              <div>
                                <strong>Ubicación</strong>
                                <small>
                                  Completa país, región y comuna.
                                </small>
                              </div>
                            </div>

                            <div className="vm-auth-location-grid">
                              <LocationSelector
                                country={registerForm.country}
                                region={registerForm.region}
                                city={registerForm.city}
                                onChange={(location) =>
                                  setRegisterForm({
                                    ...registerForm,
                                    ...location,
                                  })
                                }
                              />
                            </div>
                          </section>

                          <div className="vm-auth-register-note">
                            <span>🛡️</span>
                            <p>
                              Tus datos se utilizan únicamente para el
                              funcionamiento de tu cuenta VetMap.
                            </p>
                          </div>

                          <button
                            type="submit"
                            className="vm-auth-premium-submit"
                          >
                            Crear mi cuenta
                            <span>→</span>
                          </button>

                          <div className="vm-auth-switch-copy">
                            <span>¿Ya tienes una cuenta?</span>
                            <button
                              type="button"
                              onClick={() => setAuthActiveTab("login")}
                            >
                              Iniciar sesión
                            </button>
                          </div>
                        </form>
                      )}

                      {authActiveTab === "reset" && (
                        <form
                          onSubmit={resetPasswordSubmit}
                          className="vm-auth-premium-form vm-auth-reset-premium"
                        >
                          <div className="vm-auth-premium-heading">
                            <span className="vm-auth-heading-icon">
                              🔐
                            </span>

                            <div>
                              <p>RECUPERAR ACCESO</p>
                              <h2>Cambiar contraseña</h2>
                              <small>
                                Define una nueva contraseña para tu cuenta.
                              </small>
                            </div>
                          </div>

                          <div className="vm-auth-field-stack">
                            <label className="vm-auth-premium-field">
                              <span>Correo electrónico</span>
                              <div>
                                <b>✉️</b>
                                <input
                                  placeholder="correo@ejemplo.cl"
                                  type="email"
                                  value={resetPasswordForm.email}
                                  onChange={(e) =>
                                    setResetPasswordForm({
                                      ...resetPasswordForm,
                                      email: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </label>

                            <label className="vm-auth-premium-field">
                              <span>Nueva contraseña</span>
                              <div>
                                <b>🔒</b>
                                <input
                                  placeholder="Nueva contraseña"
                                  type="password"
                                  value={resetPasswordForm.new_password}
                                  onChange={(e) =>
                                    setResetPasswordForm({
                                      ...resetPasswordForm,
                                      new_password: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </label>

                            <label className="vm-auth-premium-field">
                              <span>Confirmar nueva contraseña</span>
                              <div>
                                <b>✓</b>
                                <input
                                  placeholder="Repite la nueva contraseña"
                                  type="password"
                                  value={resetPasswordForm.confirm_password}
                                  onChange={(e) =>
                                    setResetPasswordForm({
                                      ...resetPasswordForm,
                                      confirm_password: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </label>
                          </div>

                          <button
                            type="submit"
                            className="vm-auth-premium-submit"
                          >
                            Guardar nueva contraseña
                            <span>→</span>
                          </button>

                          <div className="vm-auth-switch-copy">
                            <button
                              type="button"
                              onClick={() => setAuthActiveTab("login")}
                            >
                              ← Volver a iniciar sesión
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </main>
                </div>
              </section>
            )}

            <footer className="vm-public-footer">
              <div className="vm-footer-brand">
                <strong>VetMap</strong>
                <p>
                  Plataforma académica para centralizar el cuidado y gestión de mascotas.
                </p>
              </div>

              <div>
                <strong>Explorar</strong>
                <button type="button" onClick={openPublicClinicsDirectory}>
                  Veterinarias
                </button>
                <button type="button" onClick={openPublicStoresDirectory}>
                  Tienda
                </button>
                <button type="button" onClick={() => setPublicSection("reserva")}>
                  Reservas
                </button>
              </div>

              <div>
                <strong>VetMap</strong>
                <button type="button" onClick={() => setPublicSection("ayuda")}>
                  Centro de ayuda
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPublicSection("auth");
                    setAuthActiveTab("login");
                  }}
                >
                  Iniciar sesión
                </button>
              </div>

              <div>
                <strong>Contacto</strong>
                <p>contacto@vetmap.cl</p>
                <p>Santiago, Chile</p>
              </div>
            </footer>
          </section>
        ) : (
          <>
            <section className={`vm-member-shell ${currentUser.role === "admin" ? "vm-dashboard-admin-mode vm-admin-v10-mode" : ""} ${currentUser.role === "owner" ? "vm-owner-v15-shell" : ""} ${currentUser.role !== "admin" ? "vmh16-shell" : ""} ${currentUser.role === "vet" ? "vm-v27-5-vet-uniform" : ""}`}> 
              {currentUser.role === "admin" && (
                <VetMapAdminChrome
                  currentUser={currentUser}
                  adminUsers={adminUsers}
                  clinics={clinics}
                  marketStores={marketStores}
                  notifications={notifications}
                  onOpenNotification={openNotification}
                  onMarkAllRead={readAllNotifications}
                  onLogout={logout}
                  activeKey={
                    memberSection === "inicio" ? "inicio"
                    : memberSection === "veterinarias" ? "veterinarias"
                    : memberSection === "tienda" ? "tiendas"
                    : memberSection === "reserva" ? "reservas"
                    : memberSection === "cuenta" && accountMode === "admin" ? adminActiveTab
                    : memberSection === "cuenta" ? "configuracion"
                    : "inicio"
                  }
                  onNavigate={(section) => {
                    setMessage("");
                    setSelectedPet(null);
                    if (["usuarios", "productos", "mascotas", "clinico"].includes(section)) {
                      setAdminActiveTab(section);
                      setAccountMode("admin");
                      setMemberSection("cuenta");
                      loadAdminData();
                    } else if (section === "tiendas") {
                      setMemberSection("tienda");
                    } else if (section === "veterinarias") {
                      setMemberSection("veterinarias");
                    } else if (section === "reservas") {
                      setMemberSection("reserva");
                    } else if (section === "configuracion") {
                      setAccountMode("profile");
                      setMemberSection("cuenta");
                    } else if (section === "pedidos" || section === "reportes") {
                      setMemberSection("inicio");
                      const target = section === "pedidos" ? "vm-admin-v8-activity" : "vm-admin-v8-chart";
                      window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
                    } else {
                      setAccountMode("profile");
                      setMemberSection("inicio");
                    }
                  }}
                />
              )}

              {/* VETMAP_ROLE_HEADER_V16: una sola cabecera para Owner, Vet y Store. */}
              {currentUser.role !== "admin" && (
                <VetMapRoleHeader
                  user={currentUser}
                  notifications={notifications}
                  cartCount={currentUser.role === "owner" ? cartItemCount() : 0}
                  onOpenNotification={openNotification}
                  onMarkAllRead={readAllNotifications}
                  onOpenCart={openMainCart}
                  onLogout={logout}
                  onSearchProducts={(query) => {
                    showAllMarketplaceStores();
                    setMarketSearch(query);
                    setMemberSection("tienda");
                  }}
                  onNavigate={(section) => {
                    setMessage("");
                    setSelectedPet(null);
                    if (section === "pets") {
                      setShowOwnerPetForm(false);
                      setAccountMode("pets");
                      setMemberSection("cuenta");
                    } else if (section === "profile") {
                      setAccountMode("profile");
                      setMemberSection("cuenta");
                    } else if (section === "tienda") {
                      showAllMarketplaceStores();
                      setMemberSection("tienda");
                    } else if (section === "veterinarias") {
                      setMemberClinicDetailId("");
                      setMemberSection("veterinarias");
                    } else {
                      setMemberSection(section);
                    }
                  }}
                />
              )}

              <nav className={`vm-member-nav vm-member-nav--${currentUser.role} ${currentUser.role === "vet" ? "vm-v23-vet-sidebar" : ""} ${currentUser.role === "store" ? "vm-v24-store-sidebar" : ""}`}>
                <button
                  type="button"
                  className="vm-member-brand"
                  onClick={() => {
                    setMessage("");
                    setSelectedPet(null);
                    setAccountMode("profile");
                    setMemberSection("inicio");
                  }}
                >
                  <span className="vm-member-brand-pets">🐾</span>

                  <span>
                    <strong>VetMap</strong>
                    <small>Cuidado integral</small>
                  </span>
                </button>

                <div
                  className={`vm-member-menu ${
                    currentUser.role === "owner"
                      ? "vm-owner-main-nav"
                      : ""
                  }`}
                >
                  {currentUser.role === "vet" ? (
                    <>
                      <button type="button" className={memberSection === "inicio" ? "active" : ""} onClick={() => { setMessage(""); setSelectedPet(null); setMemberSection("inicio"); }}>
                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>
                        <span>Inicio</span>
                      </button>
                      <button type="button" className={memberSection === "clinicAgenda" ? "active" : ""} onClick={() => setMemberSection("clinicAgenda")}>
                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 18h3"/></svg>
                        <span>Agenda</span>
                      </button>
                      <button type="button" className={memberSection === "clinicPatients" ? "active" : ""} onClick={() => setMemberSection("clinicPatients")}>
                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 11a3 3 0 0 0 0-6M18 14a5 5 0 0 1 3 5v1"/></svg>
                        <span>Pacientes</span>
                      </button>
                      <button type="button" title="Abrir Fichas clínicas; elige un paciente si aún no hay una ficha abierta" className={memberSection === "clinicHistory" ? "active" : ""} onClick={() => setMemberSection("clinicHistory")}>
                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 12h6m-3-3v6M9 18h6"/></svg>
                        <span>Fichas clínicas</span>
                      </button>
                      <button type="button" className={memberSection === "clinicPrescriptions" ? "active" : ""} onClick={() => setMemberSection("clinicPrescriptions")}>
                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM15 3v5h4M8 13h8M8 17h6"/></svg>
                        <span>Recetas</span>
                      </button>
                      <div className="vm-v23-vet-separator" role="separator" aria-label="Herramientas veterinarias" />
                      <button type="button" className={memberSection === "cuenta" && accountMode === "profile" ? "active" : ""} onClick={() => { setAccountMode("profile"); setMemberSection("cuenta"); }}>
                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3v6a5 5 0 0 0 10 0V3M6 3H4v3a2 2 0 0 0 2 2m10-5h2v3a2 2 0 0 1-2 2m-5 6v2a4 4 0 0 0 8 0v-2m0 0a2 2 0 1 0 0 4"/></svg>
                        <span>Servicios y perfil</span>
                      </button>
                    </>
                  ) : currentUser.role === "store" ? (
                    <>
                      <button type="button" className={memberSection === "inicio" ? "active" : ""} onClick={() => { setMessage(""); setMemberSection("inicio"); }}>
                        <svg className="vm-v24-store-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>
                        <span>Inicio</span>
                      </button>
                      <button type="button" className={memberSection === "storeProducts" ? "active" : ""} onClick={() => setMemberSection("storeProducts")}>
                        <svg className="vm-v24-store-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 9 9-5 9 5v10l-9 4-9-4zM3 9l9 5 9-5M12 14v9"/></svg>
                        <span>Productos</span>
                      </button>
                      <button type="button" className={memberSection === "storeOrders" ? "active" : ""} onClick={() => setMemberSection("storeOrders")}>
                        <svg className="vm-v24-store-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h2l2.4 11h10.9l2-8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
                        <span>Pedidos</span>
                      </button>
                      {/* VETMAP V26 - menú Repartidores */}
                      <button type="button" className={memberSection === "storeDelivery" ? "active" : ""} onClick={() => { setMemberSection("storeDelivery"); loadStoreData(); loadDeliveryData(); }}>
                        <svg className="vm-v24-store-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="13" height="11" rx="2"/><path d="M15 11h4l3 3v4h-7M6 18a2 2 0 1 0 4 0m7 0a2 2 0 1 0 4 0"/></svg>
                        <span>Repartidores</span>
                      </button>
                      <button type="button" className={memberSection === "storeHistory" ? "active" : ""} onClick={() => setMemberSection("storeHistory")}>
                        <svg className="vm-v24-store-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 12h6M9 16h6"/></svg>
                        <span>Historial</span>
                      </button>
                      <div className="vm-v24-store-separator" aria-hidden="true" />
                      <button type="button" className={memberSection === "cuenta" && accountMode === "profile" ? "active" : ""} onClick={() => { setAccountMode("profile"); setMemberSection("cuenta"); }}>
                        <svg className="vm-v24-store-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>
                        <span>Mi perfil</span>
                      </button>
                    </>
                  ) : currentUser.role === "admin" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMessage("");
                          setSelectedPet(null);
                          setAccountMode("profile");
                          setMemberSection("inicio");
                        }}
                        className={memberSection === "inicio" ? "active" : ""}
                      >
                        Inicio
                      </button>

                      <button
                        type="button"
                        onClick={openMemberClinicsDirectory}
                        className={memberSection === "veterinarias" ? "active" : ""}
                      >
                        Veterinarias
                      </button>

                      <button
                        type="button"
                        onClick={openMemberStoresDirectory}
                        className={memberSection === "tienda" ? "active" : ""}
                      >
                        Tienda
                      </button>

                      <button
                        type="button"
                        onClick={() => setMemberSection("reserva")}
                        className={memberSection === "reserva" ? "active" : ""}
                      >
                        Reservas
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMessage("");
                          setSelectedPet(null);
                          setMemberSection("inicio");
                        }}
                        className={memberSection === "inicio" ? "active" : ""}
                      >
                        Panel de administración
                      </button>

                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMessage("");
                          setSelectedPet(null);
                          setOwnerMenuOpen(false);
                          setAccountMode("profile");
                          setMemberSection("inicio");
                        }}
                        className={
                          memberSection === "inicio"
                            ? "active"
                            : ""
                        }
                      >
                        <svg className="vm-owner-v27-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>
                        <span className="vm-owner-v27-label">Inicio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMessage("");
                          setSelectedPet(null);
                          setOwnerMenuOpen(false);
                          setShowOwnerPetForm(false);
                          setAccountMode("pets");
                          setMemberSection("cuenta");
                        }}
                        className={
                          memberSection === "cuenta" &&
                          accountMode === "pets"
                            ? "active"
                            : ""
                        }
                      >
                        <svg className="vm-owner-v27-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="8" r="1.7"/><circle cx="11" cy="5.5" r="1.7"/><circle cx="16.5" cy="7" r="1.7"/><circle cx="20" cy="11" r="1.5"/><path d="M12.7 12.7c-1.9-1.9-3.5-.8-4.9.8l-2.5 2.7c-2.6 3.2.6 6.6 3.8 5 1.8-.9 3.4-.8 5.2 0 3.6 1.6 6.2-2 3.5-4.8l-3.2-3.5c-.8-.8-1.6-1.2-2.6-.7z"/></svg>
                        <span className="vm-owner-v27-label">Mascotas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOwnerMenuOpen(false);
                          setMemberSection("reserva");
                        }}
                        className={
                          memberSection === "reserva"
                            ? "active"
                            : ""
                        }
                      >
                        <svg className="vm-owner-v27-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 18h3"/></svg>
                        <span className="vm-owner-v27-label">Reservas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOwnerMenuOpen(false);
                          showAllMarketplaceStores();
                          setMemberSection("tienda");
                        }}
                        className={
                          memberSection === "tienda"
                            ? "active"
                            : ""
                        }
                      >
                        <svg className="vm-owner-v27-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10h18l-1.5-6h-15zM5 10v11h14V10M3 10c0 3 4.5 3 4.5 0 0 3 4.5 3 4.5 0 0 3 4.5 3 4.5 0 0 3 4.5 3 4.5 0"/><path d="M9 21v-7h6v7"/></svg>
                        <span className="vm-owner-v27-label">Tienda</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMessage("");
                          setSelectedPet(null);
                          setOwnerMenuOpen(false);
                          setMemberSection("orders");
                        }}
                        className={
                          memberSection === "orders"
                            ? "active"
                            : ""
                        }
                      >
                        <svg className="vm-owner-v27-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 7 9-4 9 4v11l-9 4-9-4zM3 7l9 5 9-5M12 12v10"/></svg>
                        <span className="vm-owner-v27-label">Pedidos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOwnerMenuOpen(false);
                          setMemberClinicDetailId("");
                          setMemberSection("veterinarias");
                        }}
                        className={
                          memberSection === "veterinarias"
                            ? "active"
                            : ""
                        }
                      >
                        <svg className="vm-owner-v27-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3v6a6 6 0 0 0 12 0V3M6 3H4v4M18 3h2v4M12 15v2a4 4 0 0 0 8 0v-1"/><circle cx="20" cy="14" r="2"/></svg>
                        <span className="vm-owner-v27-label">Veterinarias</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="vm-member-user">
                  <div className="vm-notification-center">
                    <button
                      type="button"
                      className={`vm-notification-bell ${
                        notificationsOpen ? "active" : ""
                      }`}
                      onClick={() => {
                        setOwnerMenuOpen(false);
                        setHeaderCartOpen(false);
                        setNotificationsOpen(
                          (current) => !current
                        );
                      }}
                      aria-label="Abrir notificaciones"
                    >
                      <span>🔔</span>

                      {notifications.filter(
                        (item) => !item.is_read
                      ).length > 0 && (
                        <strong>
                          {Math.min(
                            notifications.filter(
                              (item) => !item.is_read
                            ).length,
                            99
                          )}
                        </strong>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="vm-notification-panel">
                        <div className="vm-notification-header">
                          <div>
                            <small>Centro VetMap</small>
                            <h3>Notificaciones</h3>
                          </div>

                          {notifications.some(
                            (item) => !item.is_read
                          ) && (
                            <button
                              type="button"
                              onClick={readAllNotifications}
                            >
                              Marcar todas como leídas
                            </button>
                          )}
                        </div>

                        <div className="vm-notification-list">
                          {notifications.length === 0 ? (
                            <div className="vm-notification-empty">
                              <span>🔔</span>
                              <strong>Todo al día</strong>
                              <p>
                                Cuando cambie un pedido, pago o reserva
                                aparecerá aquí.
                              </p>
                            </div>
                          ) : (
                            notifications
                              .slice(0, 20)
                              .map((notification) => (
                                <button
                                  type="button"
                                  key={notification.id}
                                  className={`vm-notification-item ${
                                    notification.is_read
                                      ? ""
                                      : "unread"
                                  }`}
                                  onClick={() =>
                                    openNotification(
                                      notification
                                    )
                                  }
                                >
                                  <span className="vm-notification-icon">
                                    {notificationIcon(
                                      notification.category
                                    )}
                                  </span>

                                  <span className="vm-notification-content">
                                    <strong>
                                      {notification.title}
                                    </strong>

                                    <span>
                                      {notification.message}
                                    </span>

                                    <small>
                                      {notificationDate(
                                        notification.created_at
                                      )}
                                    </small>
                                  </span>

                                  {!notification.is_read && (
                                    <span className="vm-notification-dot" />
                                  )}
                                </button>
                              ))
                          )}
                        </div>

                        <div className="vm-notification-footer">
                          <span>
                            {
                              notifications.filter(
                                (item) => !item.is_read
                              ).length
                            }{" "}
                            sin leer
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              loadNotifications(token)
                            }
                          >
                            Actualizar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {currentUser.role === "owner" && (
                    <div className="vm-header-cart">
                      <button
                        type="button"
                        className={`vm-header-cart-button ${
                          headerCartOpen ? "active" : ""
                        }`}
                        onClick={() => {
                          setOwnerMenuOpen(false);
                          setNotificationsOpen(false);
                          setHeaderCartOpen(
                            (current) => !current
                          );
                        }}
                        aria-label="Abrir carrito"
                        title="Mi carrito"
                      >
                        <span>🛒</span>

                        {cartItemCount() > 0 && (
                          <strong>
                            {Math.min(
                              cartItemCount(),
                              99
                            )}
                          </strong>
                        )}
                      </button>

                      {headerCartOpen && (
                        <div className="vm-header-cart-panel">
                          <div className="vm-header-cart-head">
                            <div>
                              <small>Compra VetMap</small>
                              <h3>Mi carrito</h3>
                            </div>

                            <span>
                              {cartItemCount()}{" "}
                              {cartItemCount() === 1
                                ? "producto"
                                : "productos"}
                            </span>
                          </div>

                          {cart.length === 0 ? (
                            <div className="vm-header-cart-empty">
                              <span>🛒</span>
                              <strong>
                                Tu carrito está vacío
                              </strong>
                              <p>
                                Agrega productos desde la
                                Tienda VetMap.
                              </p>

                              <button
                                type="button"
                                onClick={openMainCart}
                              >
                                Ir a la tienda
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="vm-header-cart-items">
                                {cart.map((item) => (
                                  <div
                                    key={item.id}
                                    className="vm-header-cart-item"
                                  >
                                    <div className="vm-header-cart-item-icon">
                                      📦
                                    </div>

                                    <div className="vm-header-cart-item-copy">
                                      <strong>
                                        {item.name}
                                      </strong>

                                      <span>
                                        {item.store_name}
                                      </span>

                                      <small>
                                        {item.quantity} ×{" "}
                                        {formatCLP(
                                          item.price
                                        )}
                                      </small>
                                    </div>

                                    <div className="vm-header-cart-item-actions">
                                      <strong className="vm-header-cart-item-total">
                                        {formatCLP(
                                          Number(item.price) *
                                            Number(
                                              item.quantity
                                            )
                                        )}
                                      </strong>

                                      <button
                                        type="button"
                                        className="vm-header-cart-remove"
                                        onClick={() =>
                                          removeCartItem(
                                            item
                                          )
                                        }
                                        aria-label={`Eliminar ${item.name} del carrito`}
                                        title="Eliminar producto"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="vm-header-cart-total">
                                <span>Total</span>
                                <strong>
                                  {formatCLP(
                                    cartTotal()
                                  )}
                                </strong>
                              </div>

                              <div className="vm-header-cart-footer-actions">
                                <button
                                  type="button"
                                  className="vm-header-cart-clear"
                                  onClick={clearCart}
                                >
                                  🗑️ Vaciar carrito
                                </button>

                                <button
                                  type="button"
                                  className="vm-header-cart-checkout"
                                  onClick={openMainCart}
                                >
                                  Ver carrito y pagar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {(
                    <div className="vm-owner-user-menu">
                      <button
                        type="button"
                        className={`vm-owner-user-trigger ${
                          ownerMenuOpen ? "active" : ""
                        }`}
                        onClick={() => {
                          setNotificationsOpen(false);
                          setHeaderCartOpen(false);
                          setOwnerMenuOpen(
                            (current) => !current
                          );
                        }}
                        aria-label="Abrir menú de usuario"
                      >
                        <span className="vm-owner-user-avatar">
                          {(currentUser.name ||
                            currentUser.email ||
                            "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <span className="vm-owner-user-text">
                          <strong>
                            {String(
                              currentUser.name ||
                                "Mi cuenta"
                            )
                              .trim()
                              .split(/\s+/)[0]}
                          </strong>

                          <small>
                            {roleLabel(
                              currentUser.role
                            )}
                          </small>
                        </span>
                      </button>

                      {ownerMenuOpen && (
                        <div className="vm-owner-user-dropdown">
                          <div className="vm-owner-dropdown-profile">
                            <span>
                              {(currentUser.name ||
                                currentUser.email ||
                                "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                            <div>
                              <strong>
                                {currentUser.name}
                              </strong>
                              <small>
                                {currentUser.email}
                              </small>
                            </div>
                          </div>

                          <div className="vm-owner-dropdown-links">
                            {currentUser.role ===
                              "owner" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOwnerMenuOpen(
                                    false
                                  );
                                  setMemberSection(
                                    "orders"
                                  );
                                }}
                              >
                                <span>📦</span>
                                <div>
                                  <strong>
                                    Mis pedidos
                                  </strong>
                                  <small>
                                    Revisa tus compras
                                  </small>
                                </div>
                              </button>
                            )}

                            {currentUser.role ===
                              "admin" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMessage("");
                                  setSelectedPet(
                                    null
                                  );
                                  setOwnerMenuOpen(
                                    false
                                  );
                                  setAccountMode(
                                    "admin"
                                  );
                                  setMemberSection(
                                    "cuenta"
                                  );
                                  loadAdminData();
                                }}
                              >
                                <span>🛡️</span>
                                <div>
                                  <strong>
                                    Panel admin
                                  </strong>
                                  <small>
                                    Gestión de VetMap
                                  </small>
                                </div>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setMessage("");
                                setSelectedPet(null);
                                setOwnerMenuOpen(
                                  false
                                );
                                setAccountMode(
                                  "profile"
                                );
                                setMemberSection(
                                  "cuenta"
                                );
                              }}
                            >
                              <span>👤</span>
                              <div>
                                <strong>
                                  Mi cuenta
                                </strong>
                                <small>
                                  Datos y seguridad
                                </small>
                              </div>
                            </button>
                          </div>

                          <button
                            type="button"
                            className="vm-owner-dropdown-logout"
                            onClick={() => {
                              setOwnerMenuOpen(
                                false
                              );
                              logout();
                            }}
                          >
                            <span>↪</span>
                            Cerrar sesión
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </nav>

              <VetMapAdminRouteBody admin={currentUser.role === "admin"}>

              {memberSection === "inicio" && currentUser.role !== "vet" && currentUser.role !== "store" && (
                currentUser.role === "admin" ? (
                  <VetMapAdminDashboard
                    token={token}
                    currentUser={currentUser}
                    adminUsers={adminUsers}
                    clinics={clinics}
                    marketStores={marketStores}
                    notifications={notifications}
                    onOpenNotification={openNotification}
                    onMarkAllRead={readAllNotifications}
                    onLogout={logout}
                    onNavigate={(section) => {
                      setMessage("");
                      setSelectedPet(null);
                      if (["usuarios", "productos", "mascotas", "clinico"].includes(section)) {
                        setAdminActiveTab(section);
                        setAccountMode("admin");
                        setMemberSection("cuenta");
                        loadAdminData();
                      } else if (section === "tiendas") {
                        setMemberSection("tienda");
                      } else if (section === "veterinarias") {
                        setMemberSection("veterinarias");
                      } else if (section === "reservas") {
                        setMemberSection("reserva");
                      } else if (section === "configuracion") {
                        setAccountMode("profile");
                        setMemberSection("cuenta");
                      } else {
                        setMemberSection("inicio");
                      }
                    }}
                  />
                ) : (
                  <VetMapOwnerHome
                    user={currentUser}
                    pets={pets}
                    reservations={reservations}
                    orders={myStoreOrders}
                    nextReservation={nextOwnerReservation()}
                    formatDate={formatDate}
                    formatAge={formatAge}
                    formatCLP={formatCLP}
                    orderStatusLabel={orderStatusLabel}
                    getPetEmoji={getPetEmoji}
                    onPets={() => { setMessage(""); setSelectedPet(null); setShowOwnerPetForm(false); setAccountMode("pets"); setMemberSection("cuenta"); }}
                    onAddPet={() => { setMessage(""); setSelectedPet(null); clearOwnerPetForm(); setAccountMode("pets"); setShowOwnerPetForm(true); setMemberSection("cuenta"); }}
                    onViewPet={(pet) => { setMessage(""); setShowOwnerPetForm(false); setAccountMode("pets"); setMemberSection("cuenta"); viewPetProfile(pet); }}
                    onReservations={() => setMemberSection("reserva")}
                    onStores={() => { showAllMarketplaceStores(); setMemberSection("tienda"); }}
                    onClinics={() => { setMemberClinicDetailId(""); setMemberSection("veterinarias"); }}
                    onOrders={() => setMemberSection("orders")}
                    onAccount={() => { setAccountMode("profile"); setMemberSection("cuenta"); }}
                    onSearchProducts={(query) => { showAllMarketplaceStores(); setMarketSearch(query); setMemberSection("tienda"); }}
                  />
                )
              )}



              {currentUser.role === "store" && memberSection === "inicio" && (
                <section className="vm-store-dashboard vm-v24-store-home">
                  <section className="vm-v24-store-hero vm-v2725-store-hero vm-v2719-hero">
                    <div className="vm-v24-store-hero-copy">
                      <span className="vm-v24-store-eyebrow">PANEL DE TIENDA</span>
                      <h1>¡Hola, {firstName(currentUser.name)}!</h1>
                      <p>Gestiona tus productos, pedidos y ventas de forma simple y efectiva.</p>
                      <div className="vm-v2725-store-meta">
                        <strong>{storeDashboard?.store?.name || "Tienda VetMap"}</strong>
                        <span>{storeDashboard?.store?.commune || "Panel comercial"}</span>
                      </div>
                    </div>
                    <div className="vm-v2725-store-visual vm-v2719-visual" aria-hidden="true">
                      <span className="vm-v2719-ring vm-v2719-ring--one" />
                      <span className="vm-v2719-ring vm-v2719-ring--two" />
                      <div className="vm-v2719-icon-tile">
                        <svg className="vm-v2725-store-symbol vm-v2719-symbol" viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                        <path d="M18 43v37h60V43M14 34l9-17h50l9 17v9a10 10 0 0 1-17 7 10 10 0 0 1-17 0 10 10 0 0 1-17 0 10 10 0 0 1-17-7z" />
                        <path d="M31 34l5-17m12 17V17m17 17-5-17M12 80h72M39 80V61h18v19" />
                      </svg>
                      </div>
                    </div>
                  </section>

                  <section className="vm-v24-store-kpis" aria-label="Indicadores de tienda">
                    <article className="vm-v24-store-kpi">
                      <div><strong>{storeDashboard?.stats?.products ?? storeProducts.length}</strong><small>Productos activos</small></div>
                    </article>
                    <article className="vm-v24-store-kpi">
                      <div><strong>{storeDashboard?.stats?.pending_orders ?? 0}</strong><small>Pedidos pendientes</small></div>
                    </article>
                    <article className="vm-v24-store-kpi">
                      <div><strong>{storeDashboard?.stats?.low_stock ?? storeLowStockCount()}</strong><small>Stock bajo</small></div>
                    </article>
                    <article className="vm-v24-store-kpi">
                      <div><strong>{formatCLP(storeOrders.reduce((total, order) => total + Number(order.total || 0), 0))}</strong><small>Ventas registradas</small></div>
                    </article>
                  </section>

                  <section className="vm-v24-store-grid">
                    <article className="vm-v24-store-card vm-v24-store-card--orders">
                      <div className="vm-v24-store-card-heading">
                        <h2>Pedidos recientes</h2>
                        <button type="button" onClick={() => setMemberSection("storeOrders")}>Ver todos →</button>
                      </div>
                      {!storeDashboard?.recent_orders?.length ? (
                        <div className="vm-v24-store-empty">
                          <strong>Sin pedidos recientes</strong>
                          <small>Los nuevos pedidos aparecerán aquí.</small>
                        </div>
                      ) : (
                        <div className="vm-v24-store-list">
                          {storeDashboard.recent_orders.slice(0, 4).map((order) => (
                            <button type="button" className="vm-v24-store-list-row" key={order.id} onClick={() => setMemberSection("storeOrders")}>
                              <span className="vm-v24-store-row-info"><strong>Pedido #{order.id}</strong><small>{order.user_name || "Cliente VetMap"}</small></span>
                              <span className="vm-v24-store-row-meta"><strong>{formatCLP(order.total)}</strong><small>{orderStatusLabel(order.status)}</small></span>
                              <span className="vm-v24-store-chevron" aria-hidden="true">›</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </article>

                    <article className="vm-v24-store-card vm-v24-store-card--stock">
                      <div className="vm-v24-store-card-heading">
                        <h2>Productos con stock bajo</h2>
                        <button type="button" onClick={() => setMemberSection("storeProducts")}>Ver todos →</button>
                      </div>
                      {storeProducts.filter((product) => product.active !== false && Number(product.stock ?? 0) <= 5).length === 0 ? (
                        <div className="vm-v24-store-empty">
                          <strong>Stock en buen estado</strong>
                          <small>No hay productos con cinco unidades o menos.</small>
                        </div>
                      ) : (
                        <div className="vm-v24-store-list">
                          {storeProducts.filter((product) => product.active !== false && Number(product.stock ?? 0) <= 5).slice(0, 4).map((product) => (
                            <button type="button" key={product.id} className="vm-v24-store-list-row" onClick={() => setMemberSection("storeProducts")}>
                              <span className="vm-v24-store-row-icon" aria-hidden="true">{productEmoji(product.category)}</span>
                              <span className="vm-v24-store-row-info"><strong>{product.name}</strong><small>{product.brand || product.category || "Producto"}</small></span>
                              <span className="vm-v24-store-row-meta vm-v24-store-row-meta--warning"><strong>{product.stock ?? 0}</strong><small>unidades</small></span>
                              <span className="vm-v24-store-chevron" aria-hidden="true">›</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </article>

                    <article className="vm-v24-store-card vm-v24-store-card--quick">
                      <div className="vm-v24-store-card-heading"><h2>Accesos rápidos</h2></div>
                      <div className="vm-v24-store-quick-links">
                        <button type="button" onClick={() => setMemberSection("storeProducts")}>Gestionar productos <b>›</b></button>
                        <button type="button" onClick={() => setMemberSection("storeOrders")}>Revisar pedidos <b>›</b></button>
                        <button type="button" onClick={() => setMemberSection("storeHistory")}>Historial de ventas <b>›</b></button>
                      </div>
                    </article>
                  </section>

                  <section className="vm-v24-store-bottom">
                    <article className="vm-v24-store-card vm-v24-store-card--products">
                      <div className="vm-v24-store-card-heading">
                        <h2>Productos destacados</h2>
                        <button type="button" onClick={() => setMemberSection("storeProducts")}>Ver todos →</button>
                      </div>
                      {storeProducts.length === 0 ? (
                        <div className="vm-v24-store-empty vm-v24-store-empty--compact"><strong>Aún no tienes productos</strong></div>
                      ) : (
                        <div className="vm-v24-store-featured">
                          {storeProducts.slice(0, 3).map((product) => (
                            <button type="button" key={product.id} onClick={() => setMemberSection("storeProducts")}>
                              <span aria-hidden="true">{productEmoji(product.category)}</span>
                              <div><strong>{product.name}</strong><small>{formatCLP(product.price)}</small><em>{product.stock ?? 0} en stock</em></div>
                            </button>
                          ))}
                        </div>
                      )}
                    </article>
                    <article className="vm-v24-store-highlight">
                      <div className="vm-v24-store-highlight-copy">
                        <span className="vm-v24-store-highlight-label">RESUMEN DE TU TIENDA</span>
                        <h2>{storeDashboard?.stats?.orders ?? storeOrders.length} pedidos registrados</h2>
                        <p>Revisa tus pedidos y mantén tus productos al día.</p>
                        <button type="button" onClick={() => setMemberSection("storeOrders")}>Gestionar pedidos →</button>
                      </div>
                    </article>
                  </section>
                </section>
              )}

              

              {currentUser.role === "store" &&
                memberSection === "storeProducts" && (
                  <section className="vm-store-page">
                    <div className="vm-clinic-section-heading">
                      <div>
                        <p className="vm-kicker">
                          Catálogo de mi tienda
                        </p>
                        <h2>Administrar productos</h2>
                        <p>
                          Puedes agregar, modificar y eliminar
                          los productos de tu propia tienda.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="vm-secondary"
                        onClick={() => loadStoreData()}
                      >
                        Actualizar
                      </button>
                    </div>

                    <div className="vm-product-admin-summary">
                      <div>
                        <div>
                          <small>Productos</small>
                          <strong>{storeProducts.length}</strong>
                        </div>
                      </div>

                      <div
                        className={
                          storeLowStockCount() > 0
                            ? "vm-stock-alert-card active"
                            : "vm-stock-alert-card"
                        }
                      >

                        <div>
                          <small>Stock bajo</small>
                          <strong>
                            {storeLowStockCount()}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div
                      id="store-product-form"
                      className="vm-product-editor-card"
                    >
                      <div className="vm-product-editor-title">
                        <div>
                          <p className="vm-kicker">
                            {editingStoreProductId
                              ? "Modificación"
                              : "Nuevo producto"}
                          </p>

                          <h3>
                            {editingStoreProductId
                              ? "Modificar producto"
                              : "Agregar producto"}
                          </h3>
                        </div>

                        {editingStoreProductId && (
                          <button
                            type="button"
                            className="vm-secondary"
                            onClick={
                              clearStoreProductForm
                            }
                          >
                            Cancelar edición
                          </button>
                        )}
                      </div>

                      <form
                        id="store-product-form"
                        className="vm-product-editor-grid vm-product-editor-grid--store"
                        onSubmit={saveStoreProduct}
                      >
                        <label className="vm-field vm-product-field-category">
                          <span>Categoría</span>
                          <select
                            value={storeProductForm.category}
                            onChange={(e) =>
                              setStoreProductForm({
                                ...storeProductForm,
                                category: e.target.value,
                              })
                            }
                          >
                            <option>Alimentos</option>
                            <option>Higiene</option>
                            <option>Accesorios</option>
                            <option>Snacks</option>
                            <option>Salud</option>
                            <option>Otros</option>
                          </select>
                        </label>

                        <label className="vm-field vm-product-preset-field vm-product-field-preset">
                          <span>Producto sugerido</span>
                          <select
                            key={storeProductForm.category}
                            defaultValue=""
                            onChange={(e) =>
                              applyStoreProductTemplate(
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Elegir producto de{" "}
                              {storeProductForm.category}
                            </option>

                            {productTemplatesForCategory(
                              storeProductForm.category
                            ).map((item) => (
                              <option
                                key={item.name}
                                value={item.name}
                              >
                                {item.name}
                              </option>
                            ))}
                          </select>

                          <small className="vm-product-field-help">
                            Opcional. Completa automáticamente
                            nombre, marca, mascota, formato y
                            descripción.
                          </small>
                        </label>

                        <label className="vm-field vm-product-field-name">
                          <span>Nombre</span>
                          <input
                            placeholder="Nombre del producto"
                            value={storeProductForm.name}
                            onChange={(e) =>
                              setStoreProductForm({
                                ...storeProductForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-field vm-product-field-brand">
                          <span>Marca</span>
                          <input
                            placeholder="Marca"
                            value={storeProductForm.brand}
                            onChange={(e) =>
                              setStoreProductForm({
                                ...storeProductForm,
                                brand: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-field vm-product-field-animal">
                          <span>Mascota</span>
                          <select
                            value={storeProductForm.animal_type}
                            onChange={(e) =>
                              setStoreProductForm({
                                ...storeProductForm,
                                animal_type: e.target.value,
                              })
                            }
                          >
                            <option>Perros</option>
                            <option>Gatos</option>
                            <option>Perros y gatos</option>
                            <option>Conejos</option>
                            <option>Hámsteres</option>
                            <option>Cobayos</option>
                            <option>Hurones</option>
                            <option>Aves</option>
                            <option>Loros</option>
                            <option>Canarios</option>
                            <option>Periquitos</option>
                            <option>Agapornis</option>
                            <option>Gallinas</option>
                            <option>Patos</option>
                            <option>Peces</option>
                            <option>Tortugas</option>
                            <option>Iguanas</option>
                            <option>Geckos</option>
                            <option>Serpientes</option>
                            <option>Ranas</option>
                            <option>Ajolotes</option>
                            <option>Erizos</option>
                            <option>Chinchillas</option>
                            <option>Ratones</option>
                            <option>Ratas domésticas</option>
                            <option>Cerdos miniatura</option>
                            <option>Otros</option>
                          </select>
                        </label>

                        <label className="vm-field vm-product-field-format">
                          <span>Formato</span>
                          <input
                            list="store-product-format-options"
                            placeholder="Ej. 15 kg"
                            value={storeProductForm.format}
                            onChange={(e) =>
                              setStoreProductForm({
                                ...storeProductForm,
                                format: e.target.value,
                              })
                            }
                          />

                          <datalist id="store-product-format-options">
                            {productFormatsForCategory(
                              storeProductForm.category
                            ).map((format) => (
                              <option
                                key={format}
                                value={format}
                              />
                            ))}
                          </datalist>

                          <small className="vm-product-field-help">
                            Formatos sugeridos según categoría.
                            Puedes escribir otro.
                          </small>
                        </label>

                        <label className="vm-field vm-product-field-price">
                          <span>Precio CLP</span>
                          <input
                            type="number"
                            min={PRODUCT_PRICE_MIN}
                            max={PRODUCT_PRICE_MAX}
                            step="100"
                            placeholder="Ej. 12990"
                            value={storeProductForm.price}
                            onChange={(e) =>
                              setStoreProductForm({
                                ...storeProductForm,
                                price: e.target.value,
                              })
                            }
                          />

                          <small className="vm-product-field-help">
                            Mínimo $1.000 · Máximo
                            $1.000.000 CLP.
                          </small>
                        </label>

                        <label className="vm-field vm-product-field-stock">
                          <span>Stock</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Ej. 20"
                            value={storeProductForm.stock}
                            onChange={(e) =>
                              setStoreProductForm({
                                ...storeProductForm,
                                stock: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-field vm-product-description-field vm-product-field-description">
                          <span>Descripción</span>
                          <textarea
                            placeholder="Describe brevemente el producto"
                            value={storeProductForm.description}
                            onChange={(e) =>
                              setStoreProductForm({
                                ...storeProductForm,
                                description: e.target.value,
                              })
                            }
                          />
                        </label>

                        <div className="vm-product-save-row vm-product-field-save">
                          <button
                            className="vm-primary"
                            type="submit"
                          >
                            {editingStoreProductId
                              ? "Guardar modificación"
                              : "Agregar producto"}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="vm-my-products-section">
                      <div className="vm-product-list-heading">
                        <div>
                          <p className="vm-kicker">
                            Mis productos
                          </p>
                          <h3>
                            Productos publicados
                          </h3>
                        </div>

                        <label className="vm-products-search">
                          <input
                            placeholder="Buscar producto..."
                            value={storeProductSearch}
                            onChange={(e) =>
                              setStoreProductSearch(
                                e.target.value
                              )
                            }
                          />
                        </label>
                      </div>

                      {filteredStoreProducts().length ===
                      0 ? (
                        <div className="vm-clinic-empty">
                          <p>
                            No hay productos para mostrar.
                          </p>
                        </div>
                      ) : (
                        <div className="vm-manage-product-grid">
                          {filteredStoreProducts().map(
                            (product) => (
                              <article
                                className="vm-manage-product-card"
                                key={product.id}
                              >
                                <div className="vm-manage-product-top">
                                  <div className="vm-manage-product-icon">
                                    {productEmoji(
                                      product.category
                                    )}
                                  </div>

                                  <div>
                                    <small>
                                      {product.category}
                                    </small>
                                    <h4>
                                      {product.name}
                                    </h4>
                                    <p>
                                      {product.brand ||
                                        "Sin marca"}{" "}
                                      ·{" "}
                                      {product.format ||
                                        "Sin formato"}
                                    </p>
                                  </div>
                                </div>

                                <div className="vm-manage-product-values">
                                  <div>
                                    <small>Precio</small>
                                    <strong>
                                      {formatCLP(
                                        product.price
                                      )}
                                    </strong>
                                  </div>

                                  <div>
                                    <small>Stock</small>
                                    <strong>
                                      {product.stock}
                                    </strong>
                                  </div>
                                </div>

                                <div className="vm-manage-product-actions">
                                  <button
                                    type="button"
                                    className="edit"
                                    onClick={() =>
                                      startEditStoreProduct(
                                        product
                                      )
                                    }
                                  >
                                     Modificar
                                  </button>

                                  <button
                                    type="button"
                                    className="delete"
                                    onClick={() =>
                                      archiveStoreProduct(
                                        product.id
                                      )
                                    }
                                  >
                                     Eliminar
                                  </button>
                                </div>
                              </article>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                )}

              {currentUser.role === "store" &&
                memberSection === "storeOrders" && (
                  <section className="vm-store-page">
                    <div className="vm-clinic-section-heading">
                      <div>
                        <p className="vm-kicker">
                          Pedidos
                        </p>
                        <h2>Pedidos de tu tienda</h2>
                        <p>
                          Aquí aparecen solo pedidos que todavía
                          están en proceso.
                        </p>
                      </div>
                    </div>

                    {storeOrders.filter(
                      (order) =>
                        !isFinalStoreOrderStatus(
                          order.status
                        )
                    ).length === 0 ? (
                      <div className="vm-clinic-empty">
                        <p>
                          No tienes pedidos activos.
                        </p>
                      </div>
                    ) : (
                      <div className="vm-store-orders-list">
                        {storeOrders
                          .filter(
                            (order) =>
                              !isFinalStoreOrderStatus(
                                order.status
                              )
                          )
                          .map((order) => (
                            <article
                              className="vm-store-order-card"
                              key={order.id}
                            >
                              <div className="vm-store-order-head">
                                <div>
                                  <small>
                                    Pedido #{order.id}
                                  </small>
                                  <h3>
                                    {order.user_name}
                                  </h3>
                                  <p>
                                    {order.user_email}
                                  </p>
                                </div>

                                <div>
                                  <small>Total</small>
                                  <strong>
                                    {formatCLP(
                                      order.total
                                    )}
                                  </strong>
                                </div>

                                <label>
                                  <span>Estado</span>
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      changeStoreOrderStatus(
                                        order.id,
                                        e.target.value,
                                        order.status
                                      )
                                    }
                                  >
                                    <option value="pending">
                                      Pendiente
                                    </option>
                                    <option value="preparing">
                                      Preparando
                                    </option>
                                    <option value="ready">
                                      Listo
                                    </option>
                                    <option value="dispatched">
                                      Despachado
                                    </option>
                                    <option value="delivered">
                                      Entregado
                                    </option>
                                    <option value="cancelled">
                                      Cancelado
                                    </option>
                                  </select>
                                </label>
                              </div>

                              <div className="vm-store-order-items">
                                {order.items.map(
                                  (item) => (
                                    <div key={item.id}>
                                      <span>
                                        {item.quantity} ×{" "}
                                        {
                                          item.product_name
                                        }
                                      </span>
                                      <strong>
                                        {formatCLP(
                                          item.subtotal
                                        )}
                                      </strong>
                                    </div>
                                  )
                                )}
                              </div>
                            </article>
                          ))}
                      </div>
                    )}
                  </section>
                )}

              {/* VETMAP V26 REPARTIDORES - INICIO */}
              {currentUser.role === "store" && memberSection === "storeDelivery" && (
                <section className="vm-store-page vm-v26-delivery">
                  <div className="vm-v26-heading">
                    <div>
                      <span className="vm-kicker">LOGÍSTICA DE TIENDA</span>
                      <h2>Repartidores y despachos</h2>
                      <p>Registra repartidores, asigna pedidos listos y consulta los productos por entregar.</p>
                    </div>
                    <button type="button" className="vm-clean-history-button" onClick={() => { loadStoreData(); loadDeliveryData(); }}>
                      Actualizar
                    </button>
                  </div>
                  <div className="vm-v26-grid">
                    <div className="vm-v26-card">
                      <h3>Equipo de reparto</h3>
                      <form className="vm-v26-form" onSubmit={createDeliveryDriver}>
                        <input aria-label="Nombre del repartidor" placeholder="Nombre del repartidor" maxLength={120} required minLength={2}
                          value={deliveryDriverForm.name} onChange={(e) => setDeliveryDriverForm((p) => ({ ...p, name: e.target.value }))} />
                        <input aria-label="Teléfono del repartidor" placeholder="Teléfono (opcional)" maxLength={40}
                          value={deliveryDriverForm.phone} onChange={(e) => setDeliveryDriverForm((p) => ({ ...p, phone: e.target.value }))} />
                        <button type="submit" disabled={deliveryBusy || !deliveryDriverForm.name.trim()}>+ Agregar repartidor</button>
                      </form>
                      {deliveryDrivers.length === 0 && <div className="vm-v26-empty">Aún no hay repartidores. Registra el primero.</div>}
                      {deliveryDrivers.map((driver) => (
                        <div className="vm-v26-driver" key={driver.id}>
                          <div>
                            <strong>{driver.name}</strong>
                            <small>{driver.phone || "Sin teléfono"} · {driver.active ? "Activo" : "Inactivo"}</small>
                          </div>
                          <button className="vm-v26-quiet" type="button" disabled={deliveryBusy} onClick={() => toggleDeliveryDriver(driver)}>
                            {driver.active ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="vm-v26-card">
                      <h3>Pedidos listos para asignar</h3>
                      <p className="vm-v26-note">Para asignar un repartidor, cambia primero el pedido a “Listo” desde la sección Pedidos.</p>
                      {storeOrders.filter((order) => ["ready", "dispatched"].includes(order.status) && !deliveryAssignments.some((item) => item.order_id === order.id)).length === 0 && (
                        <div className="vm-v26-empty">No hay pedidos listos pendientes de asignación.</div>
                      )}
                      {storeOrders.filter((order) => ["ready", "dispatched"].includes(order.status) && !deliveryAssignments.some((item) => item.order_id === order.id)).map((order) => (
                        <div className="vm-v26-order" key={order.id}>
                          <div className="vm-v26-order-head">
                            <div><strong>Pedido #{order.id} · {order.user_name}</strong><small>{orderStatusLabel(order.status)} · {formatCLP(order.total)}</small></div>
                            <span className="vm-v26-status">Por asignar</span>
                          </div>
                          <ul className="vm-v26-products">
                            {(order.items || []).map((product) => <li key={product.id}>{product.quantity} × {product.product_name}</li>)}
                          </ul>
                          <div className="vm-v26-controls">
                            <select aria-label={`Seleccionar repartidor para el pedido ${order.id}`} value={deliverySelectedDriver[order.id] || ""} onChange={(e) => setDeliverySelectedDriver((p) => ({ ...p, [order.id]: e.target.value }))}>
                              <option value="">Seleccionar repartidor</option>
                              {deliveryDrivers.filter((d) => d.active).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <button type="button" disabled={deliveryBusy || !deliverySelectedDriver[order.id]} onClick={() => assignDeliveryOrder(order.id)}>Asignar pedido</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="vm-v26-card">
                    <h3>Despachos asignados ({deliveryAssignments.length})</h3>
                    {deliveryAssignments.length === 0 && <div className="vm-v26-empty">Todavía no hay despachos asignados.</div>}
                    {deliveryAssignments.map((assignment) => (
                      <div className="vm-v26-order" key={assignment.id}>
                        <div className="vm-v26-order-head">
                          <div>
                            <strong>Pedido #{assignment.order_id} · {assignment.driver?.name || "Repartidor"}</strong>
                            <small>{assignment.order?.user_name || "Comprador"} · {formatCLP(assignment.order?.total || 0)}</small>
                          </div>
                          <span className="vm-v26-status">{{ assigned: "Asignado", dispatched: "En reparto", incident: "Incidencia", delivered: "Entregado" }[assignment.state] || assignment.state}</span>
                        </div>
                        <ul className="vm-v26-products">
                          {(assignment.order?.items || []).map((product) => <li key={product.id}>{product.quantity} × {product.product_name}</li>)}
                        </ul>
                        {assignment.notes && <p className="vm-v26-note"><strong>Observación:</strong> {assignment.notes}</p>}
                        {assignment.state !== "delivered" && assignment.order?.status !== "cancelled" && (
                          <div className="vm-v26-controls">
                            {assignment.state !== "dispatched" && <button type="button" disabled={deliveryBusy} onClick={() => updateDeliveryState(assignment.order_id, "dispatched")}> Salir a reparto</button>}
                            {assignment.state === "dispatched" && <button type="button" disabled={deliveryBusy} onClick={() => updateDeliveryState(assignment.order_id, "delivered")}>Confirmar entrega</button>}
                            {assignment.state !== "incident" && (
                              <button type="button" className="vm-v26-quiet" disabled={deliveryBusy} onClick={() => setDeliveryIncidentOpen((p) => ({ ...p, [assignment.order_id]: !p[assignment.order_id] }))}>Registrar incidencia</button>
                            )}
                          </div>
                        )}
                        {deliveryIncidentOpen[assignment.order_id] && assignment.state !== "delivered" && (
                          <div className="vm-v26-form">
                            <textarea aria-label={`Incidencia del pedido ${assignment.order_id}`} placeholder="Describe el problema con la entrega" maxLength={600}
                              value={deliveryIncidentNotes[assignment.order_id] || ""} onChange={(e) => setDeliveryIncidentNotes((p) => ({ ...p, [assignment.order_id]: e.target.value }))}/>
                            <button type="button" disabled={deliveryBusy || !(deliveryIncidentNotes[assignment.order_id] || "").trim()} onClick={() => updateDeliveryState(assignment.order_id, "incident")}>Guardar incidencia</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {/* VETMAP V26 REPARTIDORES - FIN */}

              {currentUser.role === "store" &&
                memberSection === "storeHistory" && (
                  <section className="vm-store-page">
                    <div className="vm-clinic-section-heading">
                      <div>
                        <p className="vm-kicker">
                          Historial
                        </p>
                        <h2>
                          Pedidos finalizados
                        </h2>
                        <p>
                          Los pedidos entregados o cancelados
                          quedan bloqueados y ya no pueden
                          modificarse.
                        </p>
                      </div>

                      {storeOrders.some((order) =>
                        isFinalStoreOrderStatus(
                          order.status
                        )
                      ) && (
                        <button
                          type="button"
                          className="vm-clean-history-button"
                          onClick={
                            cleanAllStoreFinalOrders
                          }
                        >
                           Limpiar finalizados
                        </button>
                      )}
                    </div>

                    {!storeOrders.some((order) =>
                      isFinalStoreOrderStatus(
                        order.status
                      )
                    ) ? (
                      <div className="vm-clinic-empty">
                        <p>
                          No hay pedidos finalizados.
                        </p>
                      </div>
                    ) : (
                      <div className="vm-store-history-table">
                        {storeOrders
                          .filter((order) =>
                            isFinalStoreOrderStatus(
                              order.status
                            )
                          )
                          .map((order) => (
                            <div
                              className="vm-store-history-row vm-store-history-row-final"
                              key={order.id}
                            >
                              <strong>
                                #{order.id}
                              </strong>

                              <span>
                                {order.user_name}
                              </span>

                              <span>
                                {new Date(
                                  order.created_at
                                ).toLocaleDateString(
                                  "es-CL"
                                )}
                              </span>

                              <span className="vm-store-final-label">
                                {" "}
                                {orderStatusLabel(
                                  order.status
                                )}
                              </span>

                              <strong>
                                {formatCLP(
                                  order.total
                                )}
                              </strong>

                              <button
                                type="button"
                                className="vm-clean-reservation"
                                onClick={() =>
                                  cleanStoreOrder(
                                    order
                                  )
                                }
                              >
                                 Quitar
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </section>
                )}

              {currentUser.role === "vet" &&
                memberSection === "inicio" && (
                  <section className="vm-clinic-dashboard vm-vet-home-premium vm-refdash vm-refdash--vet vm-v22-classic">
                    {/* Inicio veterinario clásico: solo datos y acciones existentes. */}
                    <section className="vm-v22-hero vm-v2719-hero">
                      <div className="vm-v2719-visual vm-v2719-visual--vet" aria-hidden="true">
                        <span className="vm-v2719-ring vm-v2719-ring--one" />
                        <span className="vm-v2719-ring vm-v2719-ring--two" />
                        <div className="vm-v2719-icon-tile">
                          <svg className="vm-v2719-symbol" viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                            <path d="M23 19v22c0 16 10 27 25 27s25-11 25-27V19" />
                            <path d="M23 19h-4v11M73 19h4v11" />
                            <path d="M48 68v8c0 7 5 12 12 12s12-5 12-12v-5" />
                            <circle cx="72" cy="65" r="7" />
                            <g fill="currentColor" stroke="none">
                              <circle cx="37" cy="37" r="3.2"/><circle cx="46" cy="33" r="3.2"/><circle cx="55" cy="37" r="3.2"/>
                              <path d="M46 40c-4 0-6 4-9 8-2 3-1 7 3 7 2 0 4-2 6-2s4 2 6 2c4 0 5-4 3-7-3-4-5-8-9-8Z" />
                            </g>
                          </svg>
                        </div>
                      </div>
                      <div className="vm-v22-hero-copy">
                        <h1>¡Hola, {firstName(currentUser.name)}!</h1>
                        <p>Gestiona tus reservas, pacientes y servicios<br className="vm-v22-desktop-break" /> de forma simple.</p>
                        <div className="vm-v2727-clinic-identity" aria-live="polite">
                          <small>Clínica actual:</small>
                          <strong>{clinicDashboard?.clinic?.name || (clinicDashboard ? "Clínica no informada" : "Cargando clínica...")}</strong>
                          {clinicDashboard?.clinic?.commune && (
                            <span className="vm-v2727-clinic-commune">{clinicDashboard.clinic.commune}</span>
                          )}
                        </div>
                      </div>
                      <div className="vm-v22-hero-note vm-v2713-no-card">
                        <svg className="vm-v2713-line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 3v6a6 6 0 0 0 12 0V3" />
                          <path d="M6 3H4v3M18 3h2v3M12 15v2a4 4 0 0 0 8 0v-1" />
                          <circle cx="20" cy="14" r="2" />
                        </svg>
                        <strong>Profesionales por mascotas más saludables</strong>
                      </div>
                    </section>

                    <section className="vm-v22-kpis" aria-label="Resumen veterinario">
                      <article className="vm-v22-tile">
                        <div><strong>{clinicDashboard?.stats?.today_appointments ?? 0}</strong><small>Reservas hoy</small></div>
                      </article>
                      <article className="vm-v22-tile">
                        <div><strong>{clinicPatients.length}</strong><small>Pacientes registrados</small></div>
                      </article>
                      <article className="vm-v22-tile">
                        <div>
                          <strong>{String(clinicDashboard?.clinic?.services || "").split(",").filter((service) => service.trim()).length}</strong>
                          <small>Servicios activos</small>
                        </div>
                      </article>
                      <article className="vm-v22-tile vm-v22-tile--pending">
                        <div><strong>{clinicDashboard?.stats?.pending_appointments ?? 0}</strong><small>Pendientes de atención</small></div>
                      </article>
                    </section>

                    <section className="vm-v22-main-grid">
                      <article className="vm-v22-card vm-v22-agenda">
                        <div className="vm-v22-card-head">
                          <h2>Agenda de hoy</h2>
                          <button type="button" onClick={() => setMemberSection("clinicAgenda")}>Ver calendario <span aria-hidden="true">→</span></button>
                        </div>
                        {!clinicDashboard?.upcoming?.length ? (
                          <div className="vm-v22-empty">No hay próximas horas registradas.</div>
                        ) : (
                          <div className="vm-v22-appointment-list">
                            {clinicDashboard.upcoming.slice(0, 4).map((item) => (
                              <button key={item.id} type="button" className="vm-v22-appointment" onClick={() => setMemberSection("clinicAgenda")}>
                                <span className="vm-v22-hour">{String(item.appointment_time || "").slice(0, 5)}</span>
                                <span className="vm-v22-appointment-name"><strong>{item.pet_name}</strong><small>{item.service}</small></span>
                                <span className={`vm-v22-status ${reservationStatusClass(item.status)}`}>{reservationStatusLabel(item.status)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </article>

                      <article className="vm-v22-card vm-v22-patients">
                        <div className="vm-v22-card-head">
                          <h2>Pacientes recientes</h2>
                          <button type="button" onClick={() => setMemberSection("clinicPatients")}>Ver todos <span aria-hidden="true">→</span></button>
                        </div>
                        {clinicPatients.length === 0 ? (
                          <div className="vm-v22-empty">Aún no hay pacientes registrados.</div>
                        ) : (
                          <div className="vm-v22-patient-list">
                            {clinicPatients.slice(0, 4).map((patient) => (
                              <button type="button" key={patient.id} className="vm-v22-patient" onClick={() => openClinicPatient(patient)}>
                                <span className="vm-v22-patient-photo">
                                  {patient.photo_data ? (
                                    <img src={patient.photo_data} alt={`Foto de ${patient.name}`} />
                                  ) : (
                                    <span className="vm-vet-pet-emoji" aria-hidden="true">{getPetEmoji(patient.species)}</span>
                                  )}
                                </span>
                                <span className="vm-v22-patient-name"><strong>{patient.name}</strong><small>{patient.breed || patient.species || "Paciente VetMap"}</small></span>
                                <span className="vm-v22-view-profile">Ver ficha</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </article>

                      <article className="vm-v22-card vm-v22-quick">
                        <div className="vm-v22-card-head"><h2>Accesos rápidos</h2></div>
                        <div className="vm-v22-actions">
                          <button type="button" onClick={() => setMemberSection("clinicAgenda")}>
                            <strong>Revisar agenda</strong><em aria-hidden="true">›</em>
                          </button>
                          <button type="button" title="Selecciona un paciente para consultar su historial clínico" onClick={() => setMemberSection("clinicPatients")}>
                            <strong>Historial clínico</strong><em aria-hidden="true">›</em>
                          </button>
                          <button type="button" onClick={() => setMemberSection("clinicPatients")}>
                            <strong>Gestionar pacientes</strong><em aria-hidden="true">›</em>
                          </button>
                          <button type="button" title="Consultar los servicios configurados de tu veterinaria" onClick={() => {setAccountMode("profile"); setMemberSection("cuenta");}}>
                            <strong>Servicios y precios</strong><em aria-hidden="true">›</em>
                          </button>
                        </div>
                      </article>
                    </section>

                    <section className="vm-v22-bottom-grid">
                      <article className="vm-v22-card vm-v22-summary">
                        <h2>Resumen de atenciones</h2>
                        <div className="vm-v22-summary-metrics">
                          <div className="vm-v22-summary-tile"><div><strong>{clinicAppointments.length}</strong><small>Reservas registradas</small></div></div>
                          <div className="vm-v22-summary-tile"><div><strong>{clinicAppointments.filter((item) => item.status === "completed").length}</strong><small>Atenciones completadas</small></div></div>
                          <div className="vm-v22-summary-tile"><div><strong>{clinicPrescriptions.length}</strong><small>Recetas emitidas</small></div></div>
                          <div className="vm-v22-summary-tile"><div><strong>{clinicPatients.length}</strong><small>Pacientes registrados</small></div></div>
                        </div>
                      </article>
                      <aside className="vm-v22-care-banner" aria-label="Mensaje de cuidado de mascotas">
                        <strong>Cuidamos su salud<br />en cada etapa</strong>
                      </aside>
                    </section>
                  </section>
                )}

              {currentUser.role === "vet" &&
                memberSection === "clinicAgenda" && (
                  <section className="vm-clinic-page">
                    <div className="vm-clinic-section-heading">
                      <div>
                        <p className="vm-kicker">Agenda clínica</p>
                        <h2>Agenda de horas</h2>
                        <p>
                          Busca por mascota o dueño, filtra por fecha y revisa
                          el estado de cada atención. El historial médico se
                          puede abrir directamente desde cada hora.
                        </p>
                      </div>

                      <div className="vm-history-clean-actions">
                        {clinicAppointments.some(
                          (appointment) =>
                            appointment.status ===
                              "completed" ||
                            appointment.status ===
                              "cancelled"
                        ) && (
                          <button
                            type="button"
                            className="vm-clean-history-button"
                            onClick={
                              cleanAllClinicFinalAppointments
                            }
                          >
                             Limpiar finalizadas
                          </button>
                        )}

                        <button
                          type="button"
                          className="vm-secondary"
                          onClick={() =>
                            loadClinicData()
                          }
                        >
                          Actualizar
                        </button>
                      </div>
                    </div>

                    <div className="vm-clinic-filter-panel">
                      <label className="vm-clinic-filter-search">
                        <span>Buscar</span>
                        <input
                          placeholder="Mascota, dueño, correo o servicio..."
                          value={clinicAgendaFilters.search}
                          onChange={(e) =>
                            setClinicAgendaFilters({
                              ...clinicAgendaFilters,
                              search: e.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        <span>Fecha</span>
                        <input
                          type="date"
                          value={clinicAgendaFilters.date}
                          onChange={(e) =>
                            setClinicAgendaFilters({
                              ...clinicAgendaFilters,
                              date: e.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        <span>Estado</span>
                        <select
                          value={clinicAgendaFilters.status}
                          onChange={(e) =>
                            setClinicAgendaFilters({
                              ...clinicAgendaFilters,
                              status: e.target.value,
                            })
                          }
                        >
                          <option value="all">Todos</option>
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmada</option>
                          <option value="completed">Completada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </label>

                      <button
                        type="button"
                        className="vm-filter-clear"
                        onClick={clearClinicAgendaFilters}
                      >
                        Limpiar filtros
                      </button>
                    </div>

                    <div className="vm-clinic-filter-result">
                      <span>
                        {filteredClinicAppointments().length} de{" "}
                        {clinicAppointments.length} hora
                        {clinicAppointments.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {clinicAppointments.length === 0 ? (
                      <div className="vm-clinic-empty">
                        <p>No existen horas registradas.</p>
                      </div>
                    ) : filteredClinicAppointments().length === 0 ? (
                      <div className="vm-clinic-empty">
                        <p>
                          No encontramos reservas con los filtros seleccionados.
                        </p>
                        <button
                          type="button"
                          className="vm-secondary"
                          onClick={clearClinicAgendaFilters}
                        >
                          Mostrar toda la agenda
                        </button>
                      </div>
                    ) : (
                      <div className="vm-clinic-agenda-list">
                        {filteredClinicAppointments().map((item) => (
                          <article
                            key={item.id}
                            className="vm-clinic-appointment"
                          >
                            <div className="vm-clinic-date-box">
                              <strong>
                                {String(item.appointment_time).slice(0, 5)}
                              </strong>

                              <span>
                                {formatDate(item.appointment_date)}
                              </span>
                            </div>

                            <div className="vm-clinic-appointment-copy">
                              <h3>{item.pet_name}</h3>

                              <p>
                                {item.pet_species} · {item.service}
                              </p>

                              <small>
                                Dueño: {item.user_name} · {item.user_email}
                              </small>

                              {item.notes && (
                                <em>Nota: {item.notes}</em>
                              )}
                            </div>

                            <div
                              className={`vm-clinic-appointment-status ${
                                item.status === "completed" ||
                                item.status === "cancelled"
                                  ? "vm-clinic-status-final"
                                  : ""
                              }`}
                            >
                              <label>Estado</label>

                              <select
                                value={item.status}
                                disabled={
                                  item.status === "completed" ||
                                  item.status === "cancelled"
                                }
                                onChange={(e) =>
                                  changeClinicAppointmentStatus(
                                    item.id,
                                    e.target.value,
                                    item.status
                                  )
                                }
                              >
                                <option value="pending">
                                  Pendiente
                                </option>

                                <option value="confirmed">
                                  Confirmada
                                </option>

                                <option value="completed">
                                  Completada
                                </option>

                                <option value="cancelled">
                                  Cancelada
                                </option>
                              </select>

                              {(item.status === "completed" ||
                                item.status === "cancelled") && (
                                <>
                                  <small className="vm-clinic-final-lock">
                                     Estado final · no editable
                                  </small>

                                  <button
                                    type="button"
                                    className="vm-clean-reservation vm-clean-reservation-compact"
                                    onClick={() =>
                                      cleanClinicAppointment(
                                        item.id
                                      )
                                    }
                                  >
                                     Quitar
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                className="vm-download-clinical-report-button"
                                disabled={
                                  downloadingClinicalReportId ===
                                  item.id
                                }
                                onClick={() =>
                                  downloadClinicalReport(item)
                                }
                              >
                                {downloadingClinicalReportId ===
                                item.id
                                  ? "Generando PDF..."
                                  : "Descargar informe PDF"}
                              </button>

                              <button
                                type="button"
                                className={`vm-clinic-inline-history-button ${
                                  clinicAgendaHistoryAppointmentId ===
                                  item.id
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() =>
                                  toggleClinicAgendaHistory(
                                    item
                                  )
                                }
                              >
                                {clinicAgendaHistoryAppointmentId ===
                                item.id
                                  ? "✕ Cerrar historial"
                                  : "Ver historial médico"}
                              </button>
                            </div>

                            {clinicAgendaHistoryAppointmentId ===
                              item.id && (
                              <div className="vm-clinic-inline-history">
                                {clinicAgendaHistoryLoading ? (
                                  <div className="vm-clinic-inline-history-loading">
                                    <div>
                                      <strong>
                                        Cargando historial de{" "}
                                        {item.pet_name}
                                      </strong>
                                      <small>
                                        Revisando ficha clínica...
                                      </small>
                                    </div>
                                  </div>
                                ) : clinicAgendaHistory ? (
                                  <>
                                    <div className="vm-clinic-inline-history-head">
                                      <div className="vm-clinic-inline-patient">
                                        <div className="vm-clinic-inline-patient-photo">
                                          {clinicAgendaHistory.pet
                                            ?.photo_data ? (
                                            <img
                                              src={
                                                clinicAgendaHistory.pet
                                                  .photo_data
                                              }
                                              alt={`Foto de ${
                                                clinicAgendaHistory.pet
                                                  .name
                                              }`}
                                            />
                                          ) : (
                                            <span className="vm-vet-pet-emoji" aria-hidden="true">{getPetEmoji(clinicAgendaHistory.pet?.species)}</span>
                                          )}
                                        </div>

                                        <div>
                                          <small>
                                            Ficha clínica
                                          </small>
                                          <h3>
                                            {
                                              clinicAgendaHistory.pet
                                                ?.name
                                            }
                                          </h3>
                                          <p>
                                            {
                                              clinicAgendaHistory.pet
                                                ?.species
                                            }
                                            {clinicAgendaHistory.pet
                                              ?.breed
                                              ? ` · ${
                                                  clinicAgendaHistory.pet
                                                    .breed
                                                }`
                                              : ""}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="vm-clinic-inline-history-chips">
                                        <span>
                                          {" "}
                                          {clinicAgendaHistory
                                            .consultations?.length ||
                                            0}{" "}
                                          consultas
                                        </span>
                                        <span>
                                          {" "}
                                          {clinicAgendaHistory
                                            .vaccines?.length || 0}{" "}
                                          vacunas
                                        </span>
                                        <span>
                                          {" "}
                                          {clinicAgendaHistory
                                            .medications?.length ||
                                            0}{" "}
                                          medicamentos
                                        </span>
                                        <span>
                                          {" "}
                                          {clinicAgendaHistory
                                            .prescriptions?.length ||
                                            0}{" "}
                                          recetas
                                        </span>
                                      </div>
                                    </div>

                                    <div className="vm-clinic-quick-actions vm-clinic-inline-history-actions">
                                      <div>
                                        <p className="vm-kicker">
                                          Acciones clínicas
                                        </p>

                                        <strong>
                                          Registrar información de{" "}
                                          {clinicAgendaHistory.pet?.name ||
                                            item.pet_name}
                                        </strong>

                                        <small>
                                          Trabaja con la ficha sin salir de
                                          la agenda.
                                        </small>
                                      </div>

                                      <div className="vm-clinic-quick-actions-buttons">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            openClinicAction(
                                              "consultation",
                                              item
                                            )
                                          }
                                        >
                                           Nueva consulta
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            openClinicAction(
                                              "vaccine",
                                              item
                                            )
                                          }
                                        >
                                           Registrar vacuna
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            openClinicAction(
                                              "medication",
                                              item
                                            )
                                          }
                                        >
                                           Registrar medicamento
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            openClinicAction(
                                              "prescription",
                                              item
                                            )
                                          }
                                        >
                                           Emitir receta
                                        </button>
                                      </div>
                                    </div>

                                    <div className="vm-clinic-inline-history-grid">
                                      <article className="vm-clinic-inline-history-card">
                                        <div className="vm-clinic-inline-card-title">
                                          <div>
                                            <small>
                                              Antecedentes
                                            </small>
                                            <strong>
                                              Información importante
                                            </strong>
                                          </div>
                                        </div>

                                        <p>
                                          {clinicAgendaHistory.pet
                                            ?.medical_background ||
                                            "Sin antecedentes médicos registrados."}
                                        </p>

                                        <div className="vm-clinic-inline-mini-info">
                                          <span>
                                            {" "}
                                            {clinicAgendaHistory.pet
                                              ?.weight != null
                                              ? formatWeight(
                                                  clinicAgendaHistory.pet
                                                    .weight
                                                )
                                              : "Sin peso"}
                                          </span>
                                          <span>
                                            {" "}
                                            {formatAge(
                                              clinicAgendaHistory.pet
                                                ?.age,
                                              clinicAgendaHistory.pet
                                                ?.age_months
                                            )}
                                          </span>
                                        </div>
                                      </article>

                                      <article className="vm-clinic-inline-history-card">
                                        <div className="vm-clinic-inline-card-title">
                                          <div>
                                            <small>
                                              Última consulta
                                            </small>
                                            <strong>
                                              {clinicAgendaLatestConsultation(
                                                clinicAgendaHistory
                                              )?.reason ||
                                                "Sin consultas previas"}
                                            </strong>
                                          </div>
                                        </div>

                                        {clinicAgendaLatestConsultation(
                                          clinicAgendaHistory
                                        ) ? (
                                          <>
                                            <p>
                                              {clinicAgendaLatestConsultation(
                                                clinicAgendaHistory
                                              ).diagnosis ||
                                                "Sin diagnóstico registrado."}
                                            </p>

                                            {clinicAgendaLatestConsultation(
                                              clinicAgendaHistory
                                            ).treatment && (
                                              <small>
                                                Tratamiento:{" "}
                                                {
                                                  clinicAgendaLatestConsultation(
                                                    clinicAgendaHistory
                                                  ).treatment
                                                }
                                              </small>
                                            )}

                                            <span className="vm-clinic-inline-date">
                                              {formatDate(
                                                clinicAgendaLatestConsultation(
                                                  clinicAgendaHistory
                                                ).consultation_date
                                              )}
                                            </span>
                                          </>
                                        ) : (
                                          <p>
                                            Este paciente todavía no
                                            registra consultas.
                                          </p>
                                        )}
                                      </article>

                                      <article className="vm-clinic-inline-history-card">
                                        <div className="vm-clinic-inline-card-title">
                                          <div>
                                            <small>
                                              Medicamentos
                                            </small>
                                            <strong>
                                              Tratamientos recientes
                                            </strong>
                                          </div>
                                        </div>

                                        {clinicAgendaHistory
                                          .medications?.length ? (
                                          <div className="vm-clinic-inline-record-list">
                                            {clinicAgendaRecentHistoryItems(
                                              clinicAgendaHistory.medications,
                                              "start_date"
                                            ).map(
                                              (medication) => (
                                                <div
                                                  key={
                                                    medication.id
                                                  }
                                                >
                                                  <strong>
                                                    {
                                                      medication.name
                                                    }
                                                  </strong>
                                                  <span>
                                                    {medication.dose ||
                                                      "Sin dosis"}
                                                    {medication.frequency
                                                      ? ` · ${medication.frequency}`
                                                      : ""}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <p>
                                            Sin medicamentos
                                            registrados.
                                          </p>
                                        )}
                                      </article>

                                      <article className="vm-clinic-inline-history-card">
                                        <div className="vm-clinic-inline-card-title">
                                          <div>
                                            <small>Vacunas</small>
                                            <strong>
                                              Aplicaciones recientes
                                            </strong>
                                          </div>
                                        </div>

                                        {clinicAgendaHistory
                                          .vaccines?.length ? (
                                          <div className="vm-clinic-inline-record-list">
                                            {clinicAgendaRecentHistoryItems(
                                              clinicAgendaHistory.vaccines,
                                              "application_date"
                                            ).map((vaccine) => (
                                              <div
                                                key={vaccine.id}
                                              >
                                                <strong>
                                                  {vaccine.name}
                                                </strong>
                                                <span>
                                                  {vaccine.application_date
                                                    ? formatDate(
                                                        vaccine.application_date
                                                      )
                                                    : "Sin fecha"}
                                                  {vaccine.next_dose_date
                                                    ? ` · Próxima: ${formatDate(
                                                        vaccine.next_dose_date
                                                      )}`
                                                    : ""}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p>
                                            Sin vacunas registradas.
                                          </p>
                                        )}
                                      </article>

                                      <article className="vm-clinic-inline-history-card">
                                        <div className="vm-clinic-inline-card-title">
                                          <div>
                                            <small>Recetas</small>
                                            <strong>
                                              Indicaciones recientes
                                            </strong>
                                          </div>
                                        </div>

                                        {clinicAgendaHistory
                                          .prescriptions?.length ? (
                                          <div className="vm-clinic-inline-record-list">
                                            {clinicAgendaRecentHistoryItems(
                                              clinicAgendaHistory.prescriptions,
                                              "issue_date"
                                            ).map(
                                              (prescription) => (
                                                <div
                                                  key={
                                                    prescription.id
                                                  }
                                                >
                                                  <strong>
                                                    {
                                                      prescription.medication
                                                    }
                                                  </strong>
                                                  <span>
                                                    {prescription.dosage ||
                                                      "Sin dosis"}
                                                    {prescription.frequency
                                                      ? ` · ${prescription.frequency}`
                                                      : ""}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <p>
                                            Sin recetas registradas.
                                          </p>
                                        )}
                                      </article>

                                      <article className="vm-clinic-inline-history-card">
                                        <div className="vm-clinic-inline-card-title">
                                          <div>
                                            <small>
                                              Cuidados generales
                                            </small>
                                            <strong>
                                              Alimentación y notas
                                            </strong>
                                          </div>
                                        </div>

                                        <p>
                                          <b>Alimentación:</b>{" "}
                                          {clinicAgendaHistory.pet
                                            ?.feeding_info ||
                                            "Sin información registrada."}
                                        </p>
                                        <p>
                                          <b>Observaciones:</b>{" "}
                                          {clinicAgendaHistory.pet
                                            ?.additional_info ||
                                            "Sin observaciones adicionales."}
                                        </p>
                                      </article>
                                    </div>
                                  </>
                                ) : (
                                  <div className="vm-clinic-inline-history-loading">
                                    <div>
                                      <strong>
                                        No fue posible cargar la
                                        ficha.
                                      </strong>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                )}

              {currentUser.role === "vet" &&
                memberSection === "clinicPatients" && (
                  <section className="vm-clinic-page">
                    <div className="vm-clinic-section-heading">
                      <div>
                        <p className="vm-kicker">Pacientes</p>
                        <h2>Pacientes de la clínica</h2>
                        <p>
                          Busca por mascota, dueño o raza y filtra por especie.
                        </p>
                      </div>
                    </div>

                    <div className="vm-clinic-filter-panel vm-patient-filters">
                      <label className="vm-clinic-filter-search">
                        <span>Buscar paciente</span>
                        <input
                          placeholder="Nombre de mascota, dueño o raza..."
                          value={clinicPatientSearch}
                          onChange={(e) =>
                            setClinicPatientSearch(e.target.value)
                          }
                        />
                      </label>

                      <label>
                        <span>Especie</span>
                        <select
                          value={clinicPatientSpecies}
                          onChange={(e) =>
                            setClinicPatientSpecies(e.target.value)
                          }
                        >
                          <option value="all">Todas</option>

                          {clinicSpeciesOptions().map((species) => (
                            <option key={species} value={species}>
                              {species}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className="vm-filter-clear"
                        onClick={clearClinicPatientFilters}
                      >
                        Limpiar filtros
                      </button>
                    </div>

                    <div className="vm-clinic-filter-result">
                      <span>
                        {filteredClinicPatients().length} de{" "}
                        {clinicPatients.length} paciente
                        {clinicPatients.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {clinicPatients.length === 0 ? (
                      <div className="vm-clinic-empty">
                        <p>Aún no hay pacientes registrados.</p>
                      </div>
                    ) : filteredClinicPatients().length === 0 ? (
                      <div className="vm-clinic-empty">
                        <p>No encontramos pacientes con esos filtros.</p>
                        <button
                          type="button"
                          className="vm-secondary"
                          onClick={clearClinicPatientFilters}
                        >
                          Mostrar todos los pacientes
                        </button>
                      </div>
                    ) : (
                      <div className="vm-clinic-patients-grid">
                        {filteredClinicPatients().map((patient) => (
                          <article
                            key={patient.id}
                            className="vm-clinic-patient-card"
                          >
                            <div className="vm-clinic-patient-photo">
                              {patient.photo_data ? (
                                <img
                                  src={patient.photo_data}
                                  alt={`Foto de ${patient.name}`}
                                />
                              ) : (
                                <span>
                                  <span className="vm-vet-pet-emoji" aria-hidden="true">{getPetEmoji(patient.species)}</span>
                                </span>
                              )}
                            </div>

                            <h3>{patient.name}</h3>

                            <p>
                              {patient.species}
                              {patient.breed
                                ? ` · ${patient.breed}`
                                : ""}
                            </p>

                            <div className="vm-clinic-patient-data">
                              <span>
                                 {patient.owner_name}
                              </span>

                              <span>
                                 {formatWeight(patient.weight)}
                              </span>

                              <span>
                                {" "}
                                {patient.next_appointment
                                  ? formatDate(
                                      patient.next_appointment
                                    )
                                  : "Sin próxima hora"}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="vm-primary"
                              onClick={() =>
                                openClinicPatient(patient)
                              }
                            >
                              Ver historial
                            </button>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                )}

              {currentUser.role === "vet" &&
                memberSection === "clinicHistory" && (
                  <section className="vm-clinic-page">
                    <div className="vm-clinic-section-heading">
                      <div>
                        <p className="vm-kicker">Historial médico</p>
                        <h2>
                          {clinicSelectedPatient
                            ? clinicSelectedPatient.name
                            : "Selecciona un paciente"}
                        </h2>

                        <p>
                          Consulta antecedentes y registra nuevas atenciones,
                          vacunas o medicamentos.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="vm-secondary"
                        onClick={() =>
                          setMemberSection("clinicPatients")
                        }
                      >
                        Elegir paciente
                      </button>
                    </div>

                    {!clinicPatientHistory ? (
                      <div className="vm-clinic-empty">
                        <p>
                          Selecciona un paciente desde la sección Pacientes.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="vm-clinic-file-card">
                          <div className="vm-clinic-file-identity">
                            <div className="vm-clinic-patient-photo large vm-clinic-file-photo">
                              {clinicPatientHistory.pet.photo_data ? (
                                <img
                                  src={clinicPatientHistory.pet.photo_data}
                                  alt={clinicPatientHistory.pet.name}
                                />
                              ) : (
                                <span>
                                  <span className="vm-vet-pet-emoji" aria-hidden="true">{getPetEmoji(clinicPatientHistory.pet.species)}</span>
                                </span>
                              )}
                            </div>

                            <div className="vm-clinic-file-heading">
                              <p className="vm-kicker">
                                Ficha del paciente
                              </p>

                              <h3>
                                {clinicPatientHistory.pet.name}
                              </h3>

                              <p>
                                {clinicPatientHistory.pet.species}
                                {clinicPatientHistory.pet.breed
                                  ? ` · ${clinicPatientHistory.pet.breed}`
                                  : ""}
                              </p>

                              <div className="vm-clinic-file-chips">
                                <span>
                                   #{clinicPatientHistory.pet.id}
                                </span>

                                <span>
                                  {" "}
                                  {formatAge(
                                    clinicPatientHistory.pet.age,
                                    clinicPatientHistory.pet.age_months
                                  )}
                                </span>

                                <span>
                                  {" "}
                                  {formatWeight(
                                    clinicPatientHistory.pet.weight
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="vm-clinic-file-owner">

                            <div>
                              <small>Responsable</small>

                              <strong>
                                {
                                  clinicPatientHistory.pet
                                    .owner_name
                                }
                              </strong>

                              <span>
                                {
                                  clinicPatientHistory.pet
                                    .owner_email
                                }
                              </span>
                            </div>
                          </div>

                          <div className="vm-clinic-file-next">
                            <small>Próxima atención</small>

                            <strong>
                              {clinicSelectedPatient
                                ?.next_appointment
                                ? formatDate(
                                    clinicSelectedPatient
                                      .next_appointment
                                  )
                                : "Sin reservas próximas"}
                            </strong>

                            <span>
                              {clinicSelectedPatient
                                ?.next_appointment
                                ? clinicSelectedPatient
                                    ?.appointments_count === 1
                                  ? "1 reserva vinculada"
                                  : `${clinicSelectedPatient?.appointments_count || 0} reservas vinculadas`
                                : clinicSelectedPatient
                                    ?.appointments_count === 1
                                ? "Historial: 1 reserva"
                                : clinicSelectedPatient
                                    ?.appointments_count > 1
                                ? `Historial: ${clinicSelectedPatient.appointments_count} reservas`
                                : "Sin reservas registradas"}
                            </span>
                          </div>
                        </div>

                        <div className="vm-clinic-file-stats">
                          <article>
                            <div>
                              <strong>
                                {
                                  clinicPatientHistory
                                    .consultations.length
                                }
                              </strong>
                              <small>Consultas</small>
                            </div>
                          </article>

                          <article>
                            <div>
                              <strong>
                                {
                                  clinicPatientHistory
                                    .vaccines.length
                                }
                              </strong>
                              <small>Vacunas</small>
                            </div>
                          </article>

                          <article>
                            <div>
                              <strong>
                                {
                                  clinicPatientHistory
                                    .medications.length
                                }
                              </strong>
                              <small>Medicamentos</small>
                            </div>
                          </article>

                          <article>
                            <div>
                              <strong>
                                {
                                  clinicPatientHistory
                                    .prescriptions.length
                                }
                              </strong>
                              <small>Recetas</small>
                            </div>
                          </article>
                        </div>

                        <div className="vm-clinic-file-overview">
                          <article className="vm-clinic-file-info-card">
                            <div className="vm-clinic-file-info-title">
                              <div>
                                <small>Antecedentes</small>
                                <strong>
                                  Información clínica
                                </strong>
                              </div>
                            </div>

                            <p>
                              {clinicPatientHistory.pet
                                .medical_background ||
                                "Sin antecedentes médicos registrados."}
                            </p>
                          </article>

                          <article className="vm-clinic-file-info-card">
                            <div className="vm-clinic-file-info-title">
                              <div>
                                <small>Alimentación</small>
                                <strong>
                                  Indicaciones registradas
                                </strong>
                              </div>
                            </div>

                            <p>
                              {clinicPatientHistory.pet
                                .feeding_info ||
                                "Sin información de alimentación registrada."}
                            </p>
                          </article>

                          <article className="vm-clinic-file-info-card">
                            <div className="vm-clinic-file-info-title">
                              <div>
                                <small>Información adicional</small>
                                <strong>
                                  Observaciones generales
                                </strong>
                              </div>
                            </div>

                            <p>
                              {clinicPatientHistory.pet
                                .additional_info ||
                                "Sin observaciones adicionales."}
                            </p>
                          </article>

                          <article className="vm-clinic-file-info-card vm-clinic-last-consultation">
                            <div className="vm-clinic-file-info-title">
                              <div>
                                <small>Última consulta</small>
                                <strong>
                                  {latestClinicConsultation()
                                    ? latestClinicConsultation()
                                        .reason
                                    : "Sin consultas"}
                                </strong>
                              </div>
                            </div>

                            {latestClinicConsultation() ? (
                              <>
                                <p>
                                  {latestClinicConsultation()
                                    .diagnosis ||
                                    "Sin diagnóstico registrado."}
                                </p>

                                <span>
                                  {latestClinicConsultation()
                                    .consultation_date
                                    ? formatDate(
                                        latestClinicConsultation()
                                          .consultation_date
                                      )
                                    : "Sin fecha"}
                                  {" · "}
                                  {latestClinicConsultation()
                                    .veterinarian ||
                                    "Profesional no registrado"}
                                </span>
                              </>
                            ) : (
                              <p>
                                Este paciente todavía no tiene
                                consultas registradas.
                              </p>
                            )}
                          </article>
                        </div>

                        <div className="vm-clinic-quick-actions">
                          <div>
                            <p className="vm-kicker">
                              Acciones rápidas
                            </p>

                            <strong>
                              Registrar información del paciente
                            </strong>
                          </div>

                          <div className="vm-clinic-quick-actions-buttons">
                            <button
                              type="button"
                              onClick={() =>
                                openClinicAction(
                                  "consultation"
                                )
                              }
                            >
                               Nueva consulta
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openClinicAction("vaccine")
                              }
                            >
                               Registrar vacuna
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openClinicAction(
                                  "medication"
                                )
                              }
                            >
                               Medicamento
                            </button>

                            <button
                              type="button"
                              onClick={
                                openClinicPrescriptionForPatient
                              }
                            >
                               Emitir receta
                            </button>
                          </div>
                        </div>

                        <div className="vm-clinic-history-grid">
                          <article className="vm-clinic-history-card">
                            <h3> Vacunas</h3>

                            {clinicPatientHistory.vaccines.length === 0 ? (
                              <p>Sin vacunas registradas.</p>
                            ) : (
                              clinicPatientHistory.vaccines.map((item) => (
                                <div
                                  key={item.id}
                                  className="vm-clinic-record vm-clinic-record-with-delete"
                                >
                                  <div className="vm-clinic-record-content">
                                    <strong>{item.name}</strong>
                                    <span>
                                      {item.application_date
                                        ? formatDate(
                                            item.application_date
                                          )
                                        : "Sin fecha"}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    className="vm-clinic-delete-record"
                                    onClick={() =>
                                      removeClinicVaccine(
                                        item
                                      )
                                    }
                                    title="Eliminar vacuna"
                                    aria-label={`Eliminar vacuna ${item.name}`}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              ))
                            )}
                          </article>

                          <article className="vm-clinic-history-card">
                            <h3> Medicamentos</h3>

                            {clinicPatientHistory.medications.length === 0 ? (
                              <p>Sin medicamentos registrados.</p>
                            ) : (
                              clinicPatientHistory.medications.map(
                                (item) => (
                                  <div
                                    key={item.id}
                                    className="vm-clinic-record vm-clinic-record-with-delete"
                                  >
                                    <div className="vm-clinic-record-content">
                                      <strong>{item.name}</strong>
                                      <span>
                                        {item.dose || "Sin dosis"} ·{" "}
                                        {item.frequency ||
                                          "Sin frecuencia"}
                                      </span>
                                      <small className="vm-medication-times-inline">
                                         {item.reminder_times
                                          ? medicationReminderTimes(
                                              item.reminder_times
                                            ).join(" · ")
                                          : "Sin horarios de aviso"}
                                      </small>
                                    </div>

                                    <button
                                      type="button"
                                      className="vm-clinic-delete-record"
                                      onClick={() =>
                                        removeClinicMedication(
                                          item
                                        )
                                      }
                                      title="Eliminar medicamento"
                                      aria-label={`Eliminar medicamento ${item.name}`}
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                )
                              )
                            )}
                          </article>

                          <article className="vm-clinic-history-card">
                            <h3> Recetas</h3>

                            {clinicPatientHistory.prescriptions.length === 0 ? (
                              <p>Sin recetas registradas.</p>
                            ) : (
                              clinicPatientHistory.prescriptions
                                .slice(0, 5)
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="vm-clinic-record vm-clinic-prescription-mini"
                                  >
                                    <div>
                                      <strong>
                                        {item.medication}
                                      </strong>

                                      <small>
                                        {item.dosage ||
                                          "Sin dosis registrada"}
                                      </small>
                                    </div>

                                    <span>
                                      {item.issue_date
                                        ? formatDate(
                                            item.issue_date
                                          )
                                        : "Sin fecha"}
                                    </span>
                                  </div>
                                ))
                            )}

                            {clinicPatientHistory.prescriptions.length >
                              5 && (
                              <small className="vm-clinic-record-more">
                                Mostrando las 5 recetas más recientes.
                              </small>
                            )}

                            <button
                              type="button"
                              className="vm-clinic-history-link"
                              onClick={
                                openClinicPrescriptionForPatient
                              }
                            >
                              Ver / emitir recetas
                            </button>
                          </article>

                          <article className="vm-clinic-history-card full">
                            <div className="vm-clinic-history-card-heading">
                              <h3> Consultas</h3>

                              <label>
                                <span>Orden</span>
                                <select
                                  value={clinicHistoryOrder}
                                  onChange={(e) =>
                                    setClinicHistoryOrder(e.target.value)
                                  }
                                >
                                  <option value="desc">
                                    Más recientes primero
                                  </option>
                                  <option value="asc">
                                    Más antiguas primero
                                  </option>
                                </select>
                              </label>
                            </div>

                            {clinicPatientHistory.consultations.length === 0 ? (
                              <p>Sin consultas registradas.</p>
                            ) : (
                              sortedClinicConsultations().map(
                                (item) => (
                                  <div
                                    key={item.id}
                                    className="vm-clinic-consultation-record"
                                  >
                                    <div className="vm-clinic-consultation-record-top">
                                      <div>
                                        <strong>
                                          {item.reason}
                                        </strong>

                                        <span>
                                          {item.consultation_date
                                            ? formatDate(
                                                item.consultation_date
                                              )
                                            : "Sin fecha"}
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        className="vm-clinic-delete-record"
                                        onClick={() =>
                                          removeClinicConsultation(
                                            item
                                          )
                                        }
                                        title="Eliminar consulta"
                                        aria-label={`Eliminar consulta ${item.reason}`}
                                      >
                                        Eliminar
                                      </button>
                                    </div>

                                    <p>
                                      Diagnóstico:{" "}
                                      {item.diagnosis ||
                                        "No registrado"}
                                    </p>

                                    <p>
                                      Tratamiento:{" "}
                                      {item.treatment ||
                                        "No registrado"}
                                    </p>

                                    <small>
                                      Profesional:{" "}
                                      {item.veterinarian ||
                                        "No registrado"}
                                    </small>
                                  </div>
                                )
                              )
                            )}
                          </article>
                        </div>

                                                {clinicActionModal && memberSection === "clinicHistory" && (
                          <div
                            className="vm-clinic-action-overlay"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Registrar atención veterinaria"
                            onMouseDown={(e) => {
                              if (
                                e.target === e.currentTarget
                              ) {
                                closeClinicAction();
                              }
                            }}
                          >
                            <section
                              className="vm-clinic-action-modal"
                              onMouseDown={(e) =>
                                e.stopPropagation()
                              }
                            >
                              <div className="vm-clinic-action-header">
                                <div className="vm-clinic-action-patient">
                                  <div className="vm-clinic-action-patient-icon"><span className="vm-vet-pet-emoji" aria-hidden="true">{getPetEmoji(clinicPatientHistory?.pet?.species || clinicSelectedPatient?.species)}</span></div>

                                  <div>
                                    <p className="vm-kicker">
                                      Registrar atención
                                    </p>

                                    <h3>
                                      {clinicPatientHistory?.pet
                                        ?.name ||
                                        clinicSelectedPatient
                                          ?.name}
                                    </h3>

                                    <span>
                                      {clinicPatientHistory?.pet
                                        ?.species ||
                                        clinicSelectedPatient
                                          ?.species}
                                      {clinicPatientHistory?.pet
                                        ?.breed
                                        ? ` · ${clinicPatientHistory.pet.breed}`
                                        : ""}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="vm-clinic-action-close"
                                  onClick={closeClinicAction}
                                  aria-label="Cerrar"
                                >
                                  ×
                                </button>
                              </div>

                              <div className="vm-clinic-action-tabs">
                                <button
                                  type="button"
                                  className={
                                    clinicActionModal ===
                                    "consultation"
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() =>
                                    openClinicAction(
                                      "consultation"
                                    )
                                  }
                                >
                                   Consulta
                                </button>

                                <button
                                  type="button"
                                  className={
                                    clinicActionModal ===
                                    "vaccine"
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() =>
                                    openClinicAction(
                                      "vaccine"
                                    )
                                  }
                                >
                                   Vacuna
                                </button>

                                <button
                                  type="button"
                                  className={
                                    clinicActionModal ===
                                    "medication"
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() =>
                                    openClinicAction(
                                      "medication"
                                    )
                                  }
                                >
                                   Medicamento
                                </button>

                                <button
                                  type="button"
                                  className={
                                    clinicActionModal ===
                                    "prescription"
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() =>
                                    openClinicAction(
                                      "prescription"
                                    )
                                  }
                                >
                                   Receta
                                </button>
                              </div>

                              <div
                                key={clinicActionModal}
                                className="vm-clinic-action-body"
                              >
                                {clinicActionModal ===
                                  "consultation" && (
                                  <form
                                    onSubmit={
                                      saveClinicConsultation
                                    }
                                    className="vm-clinic-action-form"
                                  >
                                    <div className="vm-clinic-action-form-heading">
                                      <div>
                                      </div>

                                      <div>
                                        <h4>
                                          Nueva consulta
                                        </h4>
                                        <p>
                                          Registra la atención
                                          realizada al paciente.
                                        </p>
                                      </div>
                                    </div>

                                    <div className="vm-clinic-action-form-grid">
                                      <label className="vm-field">
                                        <span>Fecha</span>
                                        <input
                                          type="date"
                                          value={
                                            clinicConsultationForm
                                              .consultation_date
                                          }
                                          onChange={(e) =>
                                            setClinicConsultationForm({
                                              ...clinicConsultationForm,
                                              consultation_date:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>

                                      <label className="vm-field">
                                        <span>Motivo</span>
                                        <input
                                          list="clinic-consultation-reasons"
                                          placeholder="Selecciona o escribe un motivo"
                                          value={
                                            clinicConsultationForm
                                              .reason
                                          }
                                          onChange={(e) =>
                                            setClinicConsultationForm({
                                              ...clinicConsultationForm,
                                              reason:
                                                e.target.value,
                                            })
                                          }
                                        />

                                        <datalist id="clinic-consultation-reasons">
                                          {clinicCatalogOptions.consultation_reason.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>

                                        <small className="vm-clinic-preset-note">
                                          Puedes elegir una opción o escribir una nueva. Las nuevas quedarán guardadas para futuras consultas.
                                        </small>
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>Diagnóstico</span>
                                        <textarea
                                          placeholder="Diagnóstico de la atención"
                                          value={
                                            clinicConsultationForm
                                              .diagnosis
                                          }
                                          onChange={(e) =>
                                            setClinicConsultationForm({
                                              ...clinicConsultationForm,
                                              diagnosis:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>Tratamiento</span>
                                        <textarea
                                          placeholder="Tratamiento o indicaciones"
                                          value={
                                            clinicConsultationForm
                                              .treatment
                                          }
                                          onChange={(e) =>
                                            setClinicConsultationForm({
                                              ...clinicConsultationForm,
                                              treatment:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Observación
                                        </span>
                                        <textarea
                                          placeholder="Información adicional de la consulta"
                                          value={
                                            clinicConsultationForm
                                              .observation
                                          }
                                          onChange={(e) =>
                                            setClinicConsultationForm({
                                              ...clinicConsultationForm,
                                              observation:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>
                                    </div>

                                    <div className="vm-clinic-action-footer">
                                      <button
                                        type="button"
                                        className="vm-secondary"
                                        onClick={
                                          closeClinicAction
                                        }
                                      >
                                        Cancelar
                                      </button>

                                      <button
                                        type="submit"
                                        className="vm-primary"
                                      >
                                        Registrar consulta
                                      </button>
                                    </div>
                                  </form>
                                )}

                                {clinicActionModal ===
                                  "vaccine" && (
                                  <form
                                    onSubmit={
                                      saveClinicVaccine
                                    }
                                    className="vm-clinic-action-form"
                                  >
                                    <div className="vm-clinic-action-form-heading">
                                      <div>
                                      </div>

                                      <div>
                                        <h4>
                                          Registrar vacuna
                                        </h4>
                                        <p>
                                          Agrega una vacuna al
                                          historial del paciente.
                                        </p>
                                      </div>
                                    </div>

                                    <div className="vm-clinic-action-form-grid">
                                      <label className="vm-field vm-clinic-action-full">
                                        <span>Vacuna</span>
                                        <input
                                          list="clinic-vaccine-suggestions"
                                          placeholder="Selecciona o escribe una vacuna"
                                          value={
                                            clinicVaccineForm.name
                                          }
                                          onChange={(e) =>
                                            setClinicVaccineForm({
                                              ...clinicVaccineForm,
                                              name:
                                                e.target.value,
                                            })
                                          }
                                        />

                                        <datalist id="clinic-vaccine-suggestions">
                                          {clinicCatalogOptions.vaccine.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>

                                        <small className="vm-clinic-preset-note">
                                          Las opciones dependen de la especie. Si escribes una vacuna nueva, quedará guardada para futuros pacientes de esa especie.
                                        </small>
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Aplicación
                                        </span>
                                        <input
                                          type="date"
                                          value={
                                            clinicVaccineForm
                                              .application_date
                                          }
                                          onChange={(e) => {
                                            const applicationDate =
                                              e.target.value;

                                            setClinicVaccineForm(
                                              (current) => ({
                                                ...current,
                                                application_date:
                                                  applicationDate,
                                                next_dose_date:
                                                  clinicVaccineNextDosePreset &&
                                                  clinicVaccineNextDosePreset !==
                                                    "manual"
                                                    ? addDaysToClinicDate(
                                                        applicationDate,
                                                        clinicVaccineNextDosePreset
                                                      )
                                                    : current.next_dose_date,
                                              })
                                            );
                                          }}
                                        />
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Intervalo próxima dosis
                                        </span>

                                        <select
                                          value={
                                            clinicVaccineNextDosePreset
                                          }
                                          onChange={(e) =>
                                            applyClinicVaccineNextDosePreset(
                                              e.target.value
                                            )
                                          }
                                        >
                                          <option value="">
                                            Sin intervalo prefijado
                                          </option>
                                          <option value="15">
                                            En 15 días
                                          </option>
                                          <option value="21">
                                            En 21 días
                                          </option>
                                          <option value="30">
                                            En 30 días
                                          </option>
                                          <option value="180">
                                            En 6 meses
                                          </option>
                                          <option value="365">
                                            En 12 meses
                                          </option>
                                          <option value="manual">
                                            Elegir fecha manualmente
                                          </option>
                                        </select>
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Fecha próxima dosis
                                        </span>
                                        <input
                                          type="date"
                                          value={
                                            clinicVaccineForm
                                              .next_dose_date
                                          }
                                          onChange={(e) => {
                                            setClinicVaccineNextDosePreset(
                                              "manual"
                                            );

                                            setClinicVaccineForm({
                                              ...clinicVaccineForm,
                                              next_dose_date:
                                                e.target.value,
                                            });
                                          }}
                                        />
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Observación
                                        </span>
                                        <textarea
                                          placeholder="Observación opcional"
                                          value={
                                            clinicVaccineForm
                                              .observation
                                          }
                                          onChange={(e) =>
                                            setClinicVaccineForm({
                                              ...clinicVaccineForm,
                                              observation:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>
                                    </div>

                                    <div className="vm-clinic-action-footer">
                                      <button
                                        type="button"
                                        className="vm-secondary"
                                        onClick={
                                          closeClinicAction
                                        }
                                      >
                                        Cancelar
                                      </button>

                                      <button
                                        type="submit"
                                        className="vm-primary"
                                      >
                                        Registrar vacuna
                                      </button>
                                    </div>
                                  </form>
                                )}

                                {clinicActionModal ===
                                  "medication" && (
                                  <form
                                    onSubmit={
                                      saveClinicMedication
                                    }
                                    className="vm-clinic-action-form"
                                  >
                                    <div className="vm-clinic-action-form-heading">
                                      <div>
                                      </div>

                                      <div>
                                        <h4>
                                          Registrar medicamento
                                        </h4>
                                        <p>
                                          Guarda el tratamiento
                                          farmacológico del paciente.
                                        </p>
                                      </div>
                                    </div>

                                    {clinicMedicationFormError && (
                                      <div className="vm-clinic-medication-error">

                                        <div>
                                          <strong>
                                            No se pudo guardar todavía
                                          </strong>
                                          <p>
                                            {clinicMedicationFormError}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="vm-clinic-action-form-grid">
                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Medicamento *
                                        </span>
                                        <input
                                          list="clinic-medication-suggestions"
                                          placeholder="Selecciona o escribe un medicamento"
                                          value={
                                            clinicMedicationForm
                                              .name
                                          }
                                          onChange={(e) => {
                                            setClinicMedicationFormError("");

                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              name:
                                                e.target.value,
                                            });
                                          }}
                                        />

                                        <datalist id="clinic-medication-suggestions">
                                          {clinicCatalogOptions.medication.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>

                                        <small className="vm-clinic-preset-note">
                                          Puedes elegir una opción o escribir otro medicamento. Los nuevos quedarán guardados automáticamente.
                                        </small>
                                      </label>

                                      <label className="vm-field">
                                        <span>Dosis</span>
                                        <input
                                          list="clinic-dose-suggestions"
                                          placeholder="Selecciona o escribe una dosis"
                                          value={
                                            clinicMedicationForm
                                              .dose
                                          }
                                          onChange={(e) =>
                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              dose:
                                                e.target.value,
                                            })
                                          }
                                        />

                                        <datalist id="clinic-dose-suggestions">
                                          {clinicCatalogOptions.dose.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Frecuencia
                                        </span>
                                        <input
                                          list="clinic-frequency-suggestions"
                                          placeholder="Selecciona o escribe una frecuencia"
                                          value={
                                            clinicMedicationForm
                                              .frequency
                                          }
                                          onChange={(e) =>
                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              frequency:
                                                e.target.value,
                                            })
                                          }
                                        />

                                        <datalist id="clinic-frequency-suggestions">
                                          {clinicCatalogOptions.frequency.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Inicio
                                        </span>
                                        <input
                                          type="date"
                                          value={
                                            clinicMedicationForm
                                              .start_date
                                          }
                                          onChange={(e) => {
                                            const startDate =
                                              e.target.value;

                                            setClinicMedicationForm(
                                              (current) => ({
                                                ...current,
                                                start_date:
                                                  startDate,
                                                end_date:
                                                  clinicMedicationDurationPreset &&
                                                  clinicMedicationDurationPreset !==
                                                    "manual"
                                                    ? addDaysToClinicDate(
                                                        startDate,
                                                        clinicMedicationDurationPreset
                                                      )
                                                    : current.end_date,
                                              })
                                            );
                                          }}
                                        />
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Duración
                                        </span>

                                        <select
                                          value={
                                            clinicMedicationDurationPreset
                                          }
                                          onChange={(e) =>
                                            applyClinicMedicationDurationPreset(
                                              e.target.value
                                            )
                                          }
                                        >
                                          <option value="">
                                            Sin duración prefijada
                                          </option>
                                          <option value="3">
                                            3 días
                                          </option>
                                          <option value="5">
                                            5 días
                                          </option>
                                          <option value="7">
                                            7 días
                                          </option>
                                          <option value="10">
                                            10 días
                                          </option>
                                          <option value="14">
                                            14 días
                                          </option>
                                          <option value="21">
                                            21 días
                                          </option>
                                          <option value="30">
                                            30 días
                                          </option>
                                          <option value="manual">
                                            Fecha de término manual
                                          </option>
                                        </select>
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Horarios de aviso
                                        </span>
                                        <input
                                          placeholder="Ej: 08:00, 20:00"
                                          value={
                                            clinicMedicationForm
                                              .reminder_times
                                          }
                                          onChange={(e) =>
                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              reminder_times:
                                                e.target.value,
                                            })
                                          }
                                        />
                                        <small className="vm-clinic-preset-note">
                                          Separa varios horarios con coma. Usa formato 24 h, por ejemplo 08:00, 14:00, 20:00.
                                        </small>
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Fecha de término
                                        </span>
                                        <input
                                          type="date"
                                          min={
                                            clinicMedicationForm
                                              .start_date
                                          }
                                          value={
                                            clinicMedicationForm
                                              .end_date
                                          }
                                          onChange={(e) => {
                                            setClinicMedicationDurationPreset(
                                              "manual"
                                            );

                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              end_date:
                                                e.target.value,
                                            });
                                          }}
                                        />
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Observación
                                        </span>
                                        <textarea
                                          placeholder="Indicaciones u observaciones"
                                          value={
                                            clinicMedicationForm
                                              .observation
                                          }
                                          onChange={(e) =>
                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              observation:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>
                                    </div>

                                    <div className="vm-clinic-action-footer">
                                      <button
                                        type="button"
                                        className="vm-secondary"
                                        onClick={
                                          closeClinicAction
                                        }
                                      >
                                        Cancelar
                                      </button>

                                      <button
                                        type="submit"
                                        className="vm-primary"
                                      >
                                        {clinicMedicationForm.name?.trim()
                                          ? "Registrar medicamento"
                                          : "Falta seleccionar medicamento"}
                                      </button>
                                    </div>
                                  </form>
                                )}

                                {clinicActionModal ===
                                  "prescription" && (
                                  <form
                                    onSubmit={
                                      saveClinicPrescription
                                    }
                                    className="vm-clinic-action-form"
                                  >
                                    <div className="vm-clinic-action-form-heading">
                                      <div>
                                      </div>

                                      <div>
                                        <h4>
                                          Emitir receta
                                        </h4>
                                        <p>
                                          Crea una receta para este
                                          paciente.
                                        </p>
                                      </div>
                                    </div>


                                    <div className="vm-prescription-template-box">
                          <div className="vm-prescription-template-head">
                            <div>
                              <span> Receta rápida</span>
                              <small>
                                Usa una plantilla o escribe una receta nueva.
                              </small>
                            </div>

                            {selectedClinicPrescriptionTemplateId &&
                              clinicPrescriptionTemplates.find(
                                (item) =>
                                  String(item.id) ===
                                  String(selectedClinicPrescriptionTemplateId)
                              )?.can_delete && (
                                <button
                                  type="button"
                                  className="vm-prescription-template-delete"
                                  onClick={() =>
                                    removeClinicPrescriptionTemplate(
                                      clinicPrescriptionTemplates.find(
                                        (item) =>
                                          String(item.id) ===
                                          String(selectedClinicPrescriptionTemplateId)
                                      )
                                    )
                                  }
                                >
                                   Eliminar plantilla
                                </button>
                              )}
                          </div>

                          <select
                            className="vm-prescription-template-select"
                            value={selectedClinicPrescriptionTemplateId}
                            onChange={(e) =>
                              applyClinicPrescriptionTemplate(e.target.value)
                            }
                          >
                            <option value=""> Escribir desde cero</option>

                            {clinicDefaultPrescriptionTemplates().length > 0 && (
                              <optgroup label="Plantillas VetMap">
                                {clinicDefaultPrescriptionTemplates().map(
                                  (template) => (
                                    <option
                                      key={template.id}
                                      value={template.id}
                                    >
                                      {template.name} · {template.medication}
                                    </option>
                                  )
                                )}
                              </optgroup>
                            )}

                            {clinicCustomPrescriptionTemplates().length > 0 && (
                              <optgroup label="Mis plantillas guardadas">
                                {clinicCustomPrescriptionTemplates().map(
                                  (template) => (
                                    <option
                                      key={template.id}
                                      value={template.id}
                                    >
                                      {template.name}
                                    </option>
                                  )
                                )}
                              </optgroup>
                            )}
                          </select>
                        </div>

                                    <div className="vm-clinic-action-form-grid">
                                      <label className="vm-field">
                                        <span>
                                          Fecha de emisión
                                        </span>
                                        <input
                                          type="date"
                                          value={
                                            clinicPrescriptionForm
                                              .issue_date
                                          }
                                          onChange={(e) =>
                                            setClinicPrescriptionForm({
                                              ...clinicPrescriptionForm,
                                              issue_date:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Medicamento
                                        </span>
                                        <input
                                          list="clinic-prescription-medication-suggestions"
                                          placeholder="Selecciona o escribe un medicamento"
                                          value={
                                            clinicPrescriptionForm
                                              .medication
                                          }
                                          onChange={(e) =>
                                            setClinicPrescriptionForm({
                                              ...clinicPrescriptionForm,
                                              medication:
                                                e.target.value,
                                            })
                                          }
                                        />

                                        <datalist id="clinic-prescription-medication-suggestions">
                                          {clinicCatalogOptions.medication.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>
                                      </label>

                                      <div className="vm-prescription-field-block">
                                        <label className="vm-field">
                                          <span>Dosis</span>

                                        <select
                                          className="vm-prescription-preset-select"
                                          defaultValue=""
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (value) {
                                              applyClinicPrescriptionQuickValue(
                                                "dosage",
                                                value
                                              );
                                            }
                                          }}
                                        >
                                          <option value="">
                                            Seleccionar opción rápida
                                          </option>

                                          {clinicPrescriptionQuickOptions(
                                            "dose"
                                          ).map((option) => (
                                            <option
                                              key={option}
                                              value={option}
                                            >
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                          <input
                                            list="clinic-prescription-dose-suggestions"
                                            placeholder="Selecciona o escribe una dosis"
                                            value={
                                              clinicPrescriptionForm
                                                .dosage
                                            }
                                            onChange={(e) =>
                                              setClinicPrescriptionForm({
                                                ...clinicPrescriptionForm,
                                                dosage:
                                                  e.target.value,
                                              })
                                            }
                                          />

                                          <datalist id="clinic-prescription-dose-suggestions">
                                            {clinicPrescriptionQuickOptions(
                                              "dose"
                                            ).map((option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            ))}
                                          </datalist>
                                        </label>

                                        <div className="vm-prescription-quick-options">
                                          <small>Opciones rápidas</small>
                                          <div>
                                            {clinicPrescriptionQuickOptions(
                                              "dose"
                                            )
                                              .slice(0, 8)
                                              .map((option) => (
                                                <button
                                                  type="button"
                                                  key={option}
                                                  className={
                                                    clinicPrescriptionForm
                                                      .dosage === option
                                                      ? "active"
                                                      : ""
                                                  }
                                                  onClick={() =>
                                                    applyClinicPrescriptionQuickValue(
                                                      "dosage",
                                                      option
                                                    )
                                                  }
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="vm-prescription-field-block">
                                        <label className="vm-field">
                                          <span>
                                            Frecuencia
                                          </span>

                                        <select
                                          className="vm-prescription-preset-select"
                                          defaultValue=""
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (value) {
                                              applyClinicPrescriptionQuickValue(
                                                "frequency",
                                                value
                                              );
                                            }
                                          }}
                                        >
                                          <option value="">
                                            Seleccionar opción rápida
                                          </option>

                                          {clinicPrescriptionQuickOptions(
                                            "frequency"
                                          ).map((option) => (
                                            <option
                                              key={option}
                                              value={option}
                                            >
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                          <input
                                            list="clinic-prescription-frequency-suggestions"
                                            placeholder="Selecciona o escribe una frecuencia"
                                            value={
                                              clinicPrescriptionForm
                                                .frequency
                                            }
                                            onChange={(e) =>
                                              setClinicPrescriptionForm({
                                                ...clinicPrescriptionForm,
                                                frequency:
                                                  e.target.value,
                                              })
                                            }
                                          />

                                          <datalist id="clinic-prescription-frequency-suggestions">
                                            {clinicPrescriptionQuickOptions(
                                              "frequency"
                                            ).map((option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            ))}
                                          </datalist>
                                        </label>

                                        <div className="vm-prescription-quick-options">
                                          <small>Opciones rápidas</small>
                                          <div>
                                            {clinicPrescriptionQuickOptions(
                                              "frequency"
                                            )
                                              .slice(0, 7)
                                              .map((option) => (
                                                <button
                                                  type="button"
                                                  key={option}
                                                  className={
                                                    clinicPrescriptionForm
                                                      .frequency === option
                                                      ? "active"
                                                      : ""
                                                  }
                                                  onClick={() =>
                                                    applyClinicPrescriptionQuickValue(
                                                      "frequency",
                                                      option
                                                    )
                                                  }
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="vm-prescription-field-block vm-clinic-action-full">
                                        <label className="vm-field">
                                          <span>Duración</span>

                                        <select
                                          className="vm-prescription-preset-select"
                                          defaultValue=""
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (value) {
                                              applyClinicPrescriptionQuickValue(
                                                "duration",
                                                value
                                              );
                                            }
                                          }}
                                        >
                                          <option value="">
                                            Seleccionar opción rápida
                                          </option>

                                          {clinicPrescriptionQuickOptions(
                                            "duration"
                                          ).map((option) => (
                                            <option
                                              key={option}
                                              value={option}
                                            >
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                          <input
                                            list="clinic-prescription-duration-suggestions"
                                            placeholder="Selecciona o escribe una duración"
                                            value={
                                              clinicPrescriptionForm
                                                .duration
                                            }
                                            onChange={(e) =>
                                              setClinicPrescriptionForm({
                                                ...clinicPrescriptionForm,
                                                duration:
                                                  e.target.value,
                                              })
                                            }
                                          />

                                          <datalist id="clinic-prescription-duration-suggestions">
                                            {clinicPrescriptionQuickOptions(
                                              "duration"
                                            ).map((option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            ))}
                                          </datalist>
                                        </label>

                                        <div className="vm-prescription-quick-options">
                                          <small>Opciones rápidas</small>
                                          <div>
                                            {clinicPrescriptionQuickOptions(
                                              "duration"
                                            )
                                              .slice(0, 7)
                                              .map((option) => (
                                                <button
                                                  type="button"
                                                  key={option}
                                                  className={
                                                    clinicPrescriptionForm
                                                      .duration === option
                                                      ? "active"
                                                      : ""
                                                  }
                                                  onClick={() =>
                                                    applyClinicPrescriptionQuickValue(
                                                      "duration",
                                                      option
                                                    )
                                                  }
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="vm-prescription-field-block vm-clinic-action-full">
                                        <label className="vm-field">
                                          <span>
                                            Indicaciones
                                          </span>

                                        <select
                                          className="vm-prescription-preset-select"
                                          defaultValue=""
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (value) {
                                              applyClinicPrescriptionQuickValue(
                                                "instructions",
                                                value
                                              );
                                            }
                                          }}
                                        >
                                          <option value="">
                                            Seleccionar opción rápida
                                          </option>

                                          {clinicPrescriptionQuickOptions(
                                            "instructions"
                                          ).map((option) => (
                                            <option
                                              key={option}
                                              value={option}
                                            >
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                          <textarea
                                            placeholder="Selecciona una indicación rápida o escribe una personalizada"
                                            value={
                                              clinicPrescriptionForm
                                                .instructions
                                            }
                                            onChange={(e) =>
                                              setClinicPrescriptionForm({
                                                ...clinicPrescriptionForm,
                                                instructions:
                                                  e.target.value,
                                              })
                                            }
                                          />
                                        </label>

                                        <div className="vm-prescription-quick-options vm-prescription-quick-options--instructions">
                                          <small>Indicaciones rápidas</small>
                                          <div>
                                            {clinicPrescriptionQuickOptions(
                                              "instructions"
                                            )
                                              .slice(0, 6)
                                              .map((option) => (
                                                <button
                                                  type="button"
                                                  key={option}
                                                  className={
                                                    clinicPrescriptionForm
                                                      .instructions ===
                                                    option
                                                      ? "active"
                                                      : ""
                                                  }
                                                  onClick={() =>
                                                    applyClinicPrescriptionQuickValue(
                                                      "instructions",
                                                      option
                                                    )
                                                  }
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                          </div>
                                        </div>

                                        <small className="vm-clinic-preset-note">
                                          Si escribes una indicación nueva y emites la receta, VetMap la guardará para poder reutilizarla después.
                                        </small>
                                      </div>
                                    </div>

                                    <div className="vm-prescription-save-template">
                                      <label>
                                        <input
                                          type="checkbox"
                                          checked={saveClinicPrescriptionAsTemplate}
                                          onChange={(e) =>
                                            setSaveClinicPrescriptionAsTemplate(
                                              e.target.checked
                                            )
                                          }
                                        />
                                        <span>
                                           Guardar esta receta como plantilla reutilizable
                                        </span>
                                      </label>

                                      {saveClinicPrescriptionAsTemplate && (
                                        <input
                                          className="vm-prescription-template-name"
                                          placeholder="Nombre de plantilla (opcional)"
                                          value={clinicPrescriptionTemplateName}
                                          onChange={(e) =>
                                            setClinicPrescriptionTemplateName(
                                              e.target.value
                                            )
                                          }
                                        />
                                      )}
                                    </div>

                                    <div className="vm-clinic-action-footer">
                                      <button
                                        type="button"
                                        className="vm-secondary"
                                        onClick={
                                          closeClinicAction
                                        }
                                      >
                                        Cancelar
                                      </button>

                                      <button
                                        type="submit"
                                        className="vm-primary"
                                      >
                                        Emitir receta
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            </section>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                )}


              {currentUser.role === "vet" && (
                <>
                                                {clinicActionModal && memberSection !== "clinicHistory" && (
                          <div
                            className="vm-clinic-action-overlay"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Registrar atención veterinaria"
                            onMouseDown={(e) => {
                              if (
                                e.target === e.currentTarget
                              ) {
                                closeClinicAction();
                              }
                            }}
                          >
                            <section
                              className="vm-clinic-action-modal"
                              onMouseDown={(e) =>
                                e.stopPropagation()
                              }
                            >
                              <div className="vm-clinic-action-header">
                                <div className="vm-clinic-action-patient">
                                  <div className="vm-clinic-action-patient-icon"><span className="vm-vet-pet-emoji" aria-hidden="true">{getPetEmoji(clinicPatientHistory?.pet?.species || clinicSelectedPatient?.species)}</span></div>

                                  <div>
                                    <p className="vm-kicker">
                                      Registrar atención
                                    </p>

                                    <h3>
                                      {clinicPatientHistory?.pet
                                        ?.name ||
                                        clinicSelectedPatient
                                          ?.name}
                                    </h3>

                                    <span>
                                      {clinicPatientHistory?.pet
                                        ?.species ||
                                        clinicSelectedPatient
                                          ?.species}
                                      {clinicPatientHistory?.pet
                                        ?.breed
                                        ? ` · ${clinicPatientHistory.pet.breed}`
                                        : ""}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="vm-clinic-action-close"
                                  onClick={closeClinicAction}
                                  aria-label="Cerrar"
                                >
                                  ×
                                </button>
                              </div>

                              <div className="vm-clinic-action-tabs">
                                <button
                                  type="button"
                                  className={
                                    clinicActionModal ===
                                    "consultation"
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() =>
                                    openClinicAction(
                                      "consultation"
                                    )
                                  }
                                >
                                   Consulta
                                </button>

                                <button
                                  type="button"
                                  className={
                                    clinicActionModal ===
                                    "vaccine"
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() =>
                                    openClinicAction(
                                      "vaccine"
                                    )
                                  }
                                >
                                   Vacuna
                                </button>

                                <button
                                  type="button"
                                  className={
                                    clinicActionModal ===
                                    "medication"
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() =>
                                    openClinicAction(
                                      "medication"
                                    )
                                  }
                                >
                                   Medicamento
                                </button>

                                <button
                                  type="button"
                                  className={
                                    clinicActionModal ===
                                    "prescription"
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() =>
                                    openClinicAction(
                                      "prescription"
                                    )
                                  }
                                >
                                   Receta
                                </button>
                              </div>

                              <div
                                key={clinicActionModal}
                                className="vm-clinic-action-body"
                              >
                                {clinicActionModal ===
                                  "consultation" && (
                                  <form
                                    onSubmit={
                                      saveClinicConsultation
                                    }
                                    className="vm-clinic-action-form"
                                  >
                                    <div className="vm-clinic-action-form-heading">
                                      <div>
                                      </div>

                                      <div>
                                        <h4>
                                          Nueva consulta
                                        </h4>
                                        <p>
                                          Registra la atención
                                          realizada al paciente.
                                        </p>
                                      </div>
                                    </div>

                                    <div className="vm-clinic-action-form-grid">
                                      <label className="vm-field">
                                        <span>Fecha</span>
                                        <input
                                          type="date"
                                          value={
                                            clinicConsultationForm
                                              .consultation_date
                                          }
                                          onChange={(e) =>
                                            setClinicConsultationForm({
                                              ...clinicConsultationForm,
                                              consultation_date:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>

                                      <label className="vm-field">
                                        <span>Motivo</span>
                                        <input
                                          list="clinic-consultation-reasons"
                                          placeholder="Selecciona o escribe un motivo"
                                          value={
                                            clinicConsultationForm
                                              .reason
                                          }
                                          onChange={(e) =>
                                            setClinicConsultationForm({
                                              ...clinicConsultationForm,
                                              reason:
                                                e.target.value,
                                            })
                                          }
                                        />

                                        <datalist id="clinic-consultation-reasons">
                                          {clinicCatalogOptions.consultation_reason.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>

                                        <small className="vm-clinic-preset-note">
                                          Puedes elegir una opción o escribir una nueva. Las nuevas quedarán guardadas para futuras consultas.
                                        </small>
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>Diagnóstico</span>
                                        <textarea
                                          placeholder="Diagnóstico de la atención"
                                          value={
                                            clinicConsultationForm
                                              .diagnosis
                                          }
                                          onChange={(e) =>
                                            setClinicConsultationForm({
                                              ...clinicConsultationForm,
                                              diagnosis:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>Tratamiento</span>
                                        <textarea
                                          placeholder="Tratamiento o indicaciones"
                                          value={
                                            clinicConsultationForm
                                              .treatment
                                          }
                                          onChange={(e) =>
                                            setClinicConsultationForm({
                                              ...clinicConsultationForm,
                                              treatment:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Observación
                                        </span>
                                        <textarea
                                          placeholder="Información adicional de la consulta"
                                          value={
                                            clinicConsultationForm
                                              .observation
                                          }
                                          onChange={(e) =>
                                            setClinicConsultationForm({
                                              ...clinicConsultationForm,
                                              observation:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>
                                    </div>

                                    <div className="vm-clinic-action-footer">
                                      <button
                                        type="button"
                                        className="vm-secondary"
                                        onClick={
                                          closeClinicAction
                                        }
                                      >
                                        Cancelar
                                      </button>

                                      <button
                                        type="submit"
                                        className="vm-primary"
                                      >
                                        Registrar consulta
                                      </button>
                                    </div>
                                  </form>
                                )}

                                {clinicActionModal ===
                                  "vaccine" && (
                                  <form
                                    onSubmit={
                                      saveClinicVaccine
                                    }
                                    className="vm-clinic-action-form"
                                  >
                                    <div className="vm-clinic-action-form-heading">
                                      <div>
                                      </div>

                                      <div>
                                        <h4>
                                          Registrar vacuna
                                        </h4>
                                        <p>
                                          Agrega una vacuna al
                                          historial del paciente.
                                        </p>
                                      </div>
                                    </div>

                                    <div className="vm-clinic-action-form-grid">
                                      <label className="vm-field vm-clinic-action-full">
                                        <span>Vacuna</span>
                                        <input
                                          list="clinic-vaccine-suggestions"
                                          placeholder="Selecciona o escribe una vacuna"
                                          value={
                                            clinicVaccineForm.name
                                          }
                                          onChange={(e) =>
                                            setClinicVaccineForm({
                                              ...clinicVaccineForm,
                                              name:
                                                e.target.value,
                                            })
                                          }
                                        />

                                        <datalist id="clinic-vaccine-suggestions">
                                          {clinicCatalogOptions.vaccine.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>

                                        <small className="vm-clinic-preset-note">
                                          Las opciones dependen de la especie. Si escribes una vacuna nueva, quedará guardada para futuros pacientes de esa especie.
                                        </small>
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Aplicación
                                        </span>
                                        <input
                                          type="date"
                                          value={
                                            clinicVaccineForm
                                              .application_date
                                          }
                                          onChange={(e) => {
                                            const applicationDate =
                                              e.target.value;

                                            setClinicVaccineForm(
                                              (current) => ({
                                                ...current,
                                                application_date:
                                                  applicationDate,
                                                next_dose_date:
                                                  clinicVaccineNextDosePreset &&
                                                  clinicVaccineNextDosePreset !==
                                                    "manual"
                                                    ? addDaysToClinicDate(
                                                        applicationDate,
                                                        clinicVaccineNextDosePreset
                                                      )
                                                    : current.next_dose_date,
                                              })
                                            );
                                          }}
                                        />
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Intervalo próxima dosis
                                        </span>

                                        <select
                                          value={
                                            clinicVaccineNextDosePreset
                                          }
                                          onChange={(e) =>
                                            applyClinicVaccineNextDosePreset(
                                              e.target.value
                                            )
                                          }
                                        >
                                          <option value="">
                                            Sin intervalo prefijado
                                          </option>
                                          <option value="15">
                                            En 15 días
                                          </option>
                                          <option value="21">
                                            En 21 días
                                          </option>
                                          <option value="30">
                                            En 30 días
                                          </option>
                                          <option value="180">
                                            En 6 meses
                                          </option>
                                          <option value="365">
                                            En 12 meses
                                          </option>
                                          <option value="manual">
                                            Elegir fecha manualmente
                                          </option>
                                        </select>
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Fecha próxima dosis
                                        </span>
                                        <input
                                          type="date"
                                          value={
                                            clinicVaccineForm
                                              .next_dose_date
                                          }
                                          onChange={(e) => {
                                            setClinicVaccineNextDosePreset(
                                              "manual"
                                            );

                                            setClinicVaccineForm({
                                              ...clinicVaccineForm,
                                              next_dose_date:
                                                e.target.value,
                                            });
                                          }}
                                        />
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Observación
                                        </span>
                                        <textarea
                                          placeholder="Observación opcional"
                                          value={
                                            clinicVaccineForm
                                              .observation
                                          }
                                          onChange={(e) =>
                                            setClinicVaccineForm({
                                              ...clinicVaccineForm,
                                              observation:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>
                                    </div>

                                    <div className="vm-clinic-action-footer">
                                      <button
                                        type="button"
                                        className="vm-secondary"
                                        onClick={
                                          closeClinicAction
                                        }
                                      >
                                        Cancelar
                                      </button>

                                      <button
                                        type="submit"
                                        className="vm-primary"
                                      >
                                        Registrar vacuna
                                      </button>
                                    </div>
                                  </form>
                                )}

                                {clinicActionModal ===
                                  "medication" && (
                                  <form
                                    onSubmit={
                                      saveClinicMedication
                                    }
                                    className="vm-clinic-action-form"
                                  >
                                    <div className="vm-clinic-action-form-heading">
                                      <div>
                                      </div>

                                      <div>
                                        <h4>
                                          Registrar medicamento
                                        </h4>
                                        <p>
                                          Guarda el tratamiento
                                          farmacológico del paciente.
                                        </p>
                                      </div>
                                    </div>

                                    {clinicMedicationFormError && (
                                      <div className="vm-clinic-medication-error">

                                        <div>
                                          <strong>
                                            No se pudo guardar todavía
                                          </strong>
                                          <p>
                                            {clinicMedicationFormError}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="vm-clinic-action-form-grid">
                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Medicamento *
                                        </span>
                                        <input
                                          list="clinic-medication-suggestions"
                                          placeholder="Selecciona o escribe un medicamento"
                                          value={
                                            clinicMedicationForm
                                              .name
                                          }
                                          onChange={(e) => {
                                            setClinicMedicationFormError("");

                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              name:
                                                e.target.value,
                                            });
                                          }}
                                        />

                                        <datalist id="clinic-medication-suggestions">
                                          {clinicCatalogOptions.medication.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>

                                        <small className="vm-clinic-preset-note">
                                          Puedes elegir una opción o escribir otro medicamento. Los nuevos quedarán guardados automáticamente.
                                        </small>
                                      </label>

                                      <label className="vm-field">
                                        <span>Dosis</span>
                                        <input
                                          list="clinic-dose-suggestions"
                                          placeholder="Selecciona o escribe una dosis"
                                          value={
                                            clinicMedicationForm
                                              .dose
                                          }
                                          onChange={(e) =>
                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              dose:
                                                e.target.value,
                                            })
                                          }
                                        />

                                        <datalist id="clinic-dose-suggestions">
                                          {clinicCatalogOptions.dose.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Frecuencia
                                        </span>
                                        <input
                                          list="clinic-frequency-suggestions"
                                          placeholder="Selecciona o escribe una frecuencia"
                                          value={
                                            clinicMedicationForm
                                              .frequency
                                          }
                                          onChange={(e) =>
                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              frequency:
                                                e.target.value,
                                            })
                                          }
                                        />

                                        <datalist id="clinic-frequency-suggestions">
                                          {clinicCatalogOptions.frequency.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Inicio
                                        </span>
                                        <input
                                          type="date"
                                          value={
                                            clinicMedicationForm
                                              .start_date
                                          }
                                          onChange={(e) => {
                                            const startDate =
                                              e.target.value;

                                            setClinicMedicationForm(
                                              (current) => ({
                                                ...current,
                                                start_date:
                                                  startDate,
                                                end_date:
                                                  clinicMedicationDurationPreset &&
                                                  clinicMedicationDurationPreset !==
                                                    "manual"
                                                    ? addDaysToClinicDate(
                                                        startDate,
                                                        clinicMedicationDurationPreset
                                                      )
                                                    : current.end_date,
                                              })
                                            );
                                          }}
                                        />
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Duración
                                        </span>

                                        <select
                                          value={
                                            clinicMedicationDurationPreset
                                          }
                                          onChange={(e) =>
                                            applyClinicMedicationDurationPreset(
                                              e.target.value
                                            )
                                          }
                                        >
                                          <option value="">
                                            Sin duración prefijada
                                          </option>
                                          <option value="3">
                                            3 días
                                          </option>
                                          <option value="5">
                                            5 días
                                          </option>
                                          <option value="7">
                                            7 días
                                          </option>
                                          <option value="10">
                                            10 días
                                          </option>
                                          <option value="14">
                                            14 días
                                          </option>
                                          <option value="21">
                                            21 días
                                          </option>
                                          <option value="30">
                                            30 días
                                          </option>
                                          <option value="manual">
                                            Fecha de término manual
                                          </option>
                                        </select>
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Horarios de aviso
                                        </span>
                                        <input
                                          placeholder="Ej: 08:00, 20:00"
                                          value={
                                            clinicMedicationForm
                                              .reminder_times
                                          }
                                          onChange={(e) =>
                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              reminder_times:
                                                e.target.value,
                                            })
                                          }
                                        />
                                        <small className="vm-clinic-preset-note">
                                          Separa varios horarios con coma. Usa formato 24 h, por ejemplo 08:00, 14:00, 20:00.
                                        </small>
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Fecha de término
                                        </span>
                                        <input
                                          type="date"
                                          min={
                                            clinicMedicationForm
                                              .start_date
                                          }
                                          value={
                                            clinicMedicationForm
                                              .end_date
                                          }
                                          onChange={(e) => {
                                            setClinicMedicationDurationPreset(
                                              "manual"
                                            );

                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              end_date:
                                                e.target.value,
                                            });
                                          }}
                                        />
                                      </label>

                                      <label className="vm-field vm-clinic-action-full">
                                        <span>
                                          Observación
                                        </span>
                                        <textarea
                                          placeholder="Indicaciones u observaciones"
                                          value={
                                            clinicMedicationForm
                                              .observation
                                          }
                                          onChange={(e) =>
                                            setClinicMedicationForm({
                                              ...clinicMedicationForm,
                                              observation:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>
                                    </div>

                                    <div className="vm-clinic-action-footer">
                                      <button
                                        type="button"
                                        className="vm-secondary"
                                        onClick={
                                          closeClinicAction
                                        }
                                      >
                                        Cancelar
                                      </button>

                                      <button
                                        type="submit"
                                        className="vm-primary"
                                      >
                                        {clinicMedicationForm.name?.trim()
                                          ? "Registrar medicamento"
                                          : "Falta seleccionar medicamento"}
                                      </button>
                                    </div>
                                  </form>
                                )}

                                {clinicActionModal ===
                                  "prescription" && (
                                  <form
                                    onSubmit={
                                      saveClinicPrescription
                                    }
                                    className="vm-clinic-action-form"
                                  >
                                    <div className="vm-clinic-action-form-heading">
                                      <div>
                                      </div>

                                      <div>
                                        <h4>
                                          Emitir receta
                                        </h4>
                                        <p>
                                          Crea una receta para este
                                          paciente.
                                        </p>
                                      </div>
                                    </div>


                                    <div className="vm-prescription-template-box">
                          <div className="vm-prescription-template-head">
                            <div>
                              <span> Receta rápida</span>
                              <small>
                                Usa una plantilla o escribe una receta nueva.
                              </small>
                            </div>

                            {selectedClinicPrescriptionTemplateId &&
                              clinicPrescriptionTemplates.find(
                                (item) =>
                                  String(item.id) ===
                                  String(selectedClinicPrescriptionTemplateId)
                              )?.can_delete && (
                                <button
                                  type="button"
                                  className="vm-prescription-template-delete"
                                  onClick={() =>
                                    removeClinicPrescriptionTemplate(
                                      clinicPrescriptionTemplates.find(
                                        (item) =>
                                          String(item.id) ===
                                          String(selectedClinicPrescriptionTemplateId)
                                      )
                                    )
                                  }
                                >
                                   Eliminar plantilla
                                </button>
                              )}
                          </div>

                          <select
                            className="vm-prescription-template-select"
                            value={selectedClinicPrescriptionTemplateId}
                            onChange={(e) =>
                              applyClinicPrescriptionTemplate(e.target.value)
                            }
                          >
                            <option value=""> Escribir desde cero</option>

                            {clinicDefaultPrescriptionTemplates().length > 0 && (
                              <optgroup label="Plantillas VetMap">
                                {clinicDefaultPrescriptionTemplates().map(
                                  (template) => (
                                    <option
                                      key={template.id}
                                      value={template.id}
                                    >
                                      {template.name} · {template.medication}
                                    </option>
                                  )
                                )}
                              </optgroup>
                            )}

                            {clinicCustomPrescriptionTemplates().length > 0 && (
                              <optgroup label="Mis plantillas guardadas">
                                {clinicCustomPrescriptionTemplates().map(
                                  (template) => (
                                    <option
                                      key={template.id}
                                      value={template.id}
                                    >
                                      {template.name}
                                    </option>
                                  )
                                )}
                              </optgroup>
                            )}
                          </select>
                        </div>

                                    <div className="vm-clinic-action-form-grid">
                                      <label className="vm-field">
                                        <span>
                                          Fecha de emisión
                                        </span>
                                        <input
                                          type="date"
                                          value={
                                            clinicPrescriptionForm
                                              .issue_date
                                          }
                                          onChange={(e) =>
                                            setClinicPrescriptionForm({
                                              ...clinicPrescriptionForm,
                                              issue_date:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </label>

                                      <label className="vm-field">
                                        <span>
                                          Medicamento
                                        </span>
                                        <input
                                          list="clinic-prescription-medication-suggestions"
                                          placeholder="Selecciona o escribe un medicamento"
                                          value={
                                            clinicPrescriptionForm
                                              .medication
                                          }
                                          onChange={(e) =>
                                            setClinicPrescriptionForm({
                                              ...clinicPrescriptionForm,
                                              medication:
                                                e.target.value,
                                            })
                                          }
                                        />

                                        <datalist id="clinic-prescription-medication-suggestions">
                                          {clinicCatalogOptions.medication.map(
                                            (option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            )
                                          )}
                                        </datalist>
                                      </label>

                                      <div className="vm-prescription-field-block">
                                        <label className="vm-field">
                                          <span>Dosis</span>

                                        <select
                                          className="vm-prescription-preset-select"
                                          defaultValue=""
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (value) {
                                              applyClinicPrescriptionQuickValue(
                                                "dosage",
                                                value
                                              );
                                            }
                                          }}
                                        >
                                          <option value="">
                                            Seleccionar opción rápida
                                          </option>

                                          {clinicPrescriptionQuickOptions(
                                            "dose"
                                          ).map((option) => (
                                            <option
                                              key={option}
                                              value={option}
                                            >
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                          <input
                                            list="clinic-prescription-dose-suggestions"
                                            placeholder="Selecciona o escribe una dosis"
                                            value={
                                              clinicPrescriptionForm
                                                .dosage
                                            }
                                            onChange={(e) =>
                                              setClinicPrescriptionForm({
                                                ...clinicPrescriptionForm,
                                                dosage:
                                                  e.target.value,
                                              })
                                            }
                                          />

                                          <datalist id="clinic-prescription-dose-suggestions">
                                            {clinicPrescriptionQuickOptions(
                                              "dose"
                                            ).map((option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            ))}
                                          </datalist>
                                        </label>

                                        <div className="vm-prescription-quick-options">
                                          <small>Opciones rápidas</small>
                                          <div>
                                            {clinicPrescriptionQuickOptions(
                                              "dose"
                                            )
                                              .slice(0, 8)
                                              .map((option) => (
                                                <button
                                                  type="button"
                                                  key={option}
                                                  className={
                                                    clinicPrescriptionForm
                                                      .dosage === option
                                                      ? "active"
                                                      : ""
                                                  }
                                                  onClick={() =>
                                                    applyClinicPrescriptionQuickValue(
                                                      "dosage",
                                                      option
                                                    )
                                                  }
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="vm-prescription-field-block">
                                        <label className="vm-field">
                                          <span>
                                            Frecuencia
                                          </span>

                                        <select
                                          className="vm-prescription-preset-select"
                                          defaultValue=""
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (value) {
                                              applyClinicPrescriptionQuickValue(
                                                "frequency",
                                                value
                                              );
                                            }
                                          }}
                                        >
                                          <option value="">
                                            Seleccionar opción rápida
                                          </option>

                                          {clinicPrescriptionQuickOptions(
                                            "frequency"
                                          ).map((option) => (
                                            <option
                                              key={option}
                                              value={option}
                                            >
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                          <input
                                            list="clinic-prescription-frequency-suggestions"
                                            placeholder="Selecciona o escribe una frecuencia"
                                            value={
                                              clinicPrescriptionForm
                                                .frequency
                                            }
                                            onChange={(e) =>
                                              setClinicPrescriptionForm({
                                                ...clinicPrescriptionForm,
                                                frequency:
                                                  e.target.value,
                                              })
                                            }
                                          />

                                          <datalist id="clinic-prescription-frequency-suggestions">
                                            {clinicPrescriptionQuickOptions(
                                              "frequency"
                                            ).map((option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            ))}
                                          </datalist>
                                        </label>

                                        <div className="vm-prescription-quick-options">
                                          <small>Opciones rápidas</small>
                                          <div>
                                            {clinicPrescriptionQuickOptions(
                                              "frequency"
                                            )
                                              .slice(0, 7)
                                              .map((option) => (
                                                <button
                                                  type="button"
                                                  key={option}
                                                  className={
                                                    clinicPrescriptionForm
                                                      .frequency === option
                                                      ? "active"
                                                      : ""
                                                  }
                                                  onClick={() =>
                                                    applyClinicPrescriptionQuickValue(
                                                      "frequency",
                                                      option
                                                    )
                                                  }
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="vm-prescription-field-block vm-clinic-action-full">
                                        <label className="vm-field">
                                          <span>Duración</span>

                                        <select
                                          className="vm-prescription-preset-select"
                                          defaultValue=""
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (value) {
                                              applyClinicPrescriptionQuickValue(
                                                "duration",
                                                value
                                              );
                                            }
                                          }}
                                        >
                                          <option value="">
                                            Seleccionar opción rápida
                                          </option>

                                          {clinicPrescriptionQuickOptions(
                                            "duration"
                                          ).map((option) => (
                                            <option
                                              key={option}
                                              value={option}
                                            >
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                          <input
                                            list="clinic-prescription-duration-suggestions"
                                            placeholder="Selecciona o escribe una duración"
                                            value={
                                              clinicPrescriptionForm
                                                .duration
                                            }
                                            onChange={(e) =>
                                              setClinicPrescriptionForm({
                                                ...clinicPrescriptionForm,
                                                duration:
                                                  e.target.value,
                                              })
                                            }
                                          />

                                          <datalist id="clinic-prescription-duration-suggestions">
                                            {clinicPrescriptionQuickOptions(
                                              "duration"
                                            ).map((option) => (
                                              <option
                                                key={option}
                                                value={option}
                                              />
                                            ))}
                                          </datalist>
                                        </label>

                                        <div className="vm-prescription-quick-options">
                                          <small>Opciones rápidas</small>
                                          <div>
                                            {clinicPrescriptionQuickOptions(
                                              "duration"
                                            )
                                              .slice(0, 7)
                                              .map((option) => (
                                                <button
                                                  type="button"
                                                  key={option}
                                                  className={
                                                    clinicPrescriptionForm
                                                      .duration === option
                                                      ? "active"
                                                      : ""
                                                  }
                                                  onClick={() =>
                                                    applyClinicPrescriptionQuickValue(
                                                      "duration",
                                                      option
                                                    )
                                                  }
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="vm-prescription-field-block vm-clinic-action-full">
                                        <label className="vm-field">
                                          <span>
                                            Indicaciones
                                          </span>

                                        <select
                                          className="vm-prescription-preset-select"
                                          defaultValue=""
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (value) {
                                              applyClinicPrescriptionQuickValue(
                                                "instructions",
                                                value
                                              );
                                            }
                                          }}
                                        >
                                          <option value="">
                                            Seleccionar opción rápida
                                          </option>

                                          {clinicPrescriptionQuickOptions(
                                            "instructions"
                                          ).map((option) => (
                                            <option
                                              key={option}
                                              value={option}
                                            >
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                          <textarea
                                            placeholder="Selecciona una indicación rápida o escribe una personalizada"
                                            value={
                                              clinicPrescriptionForm
                                                .instructions
                                            }
                                            onChange={(e) =>
                                              setClinicPrescriptionForm({
                                                ...clinicPrescriptionForm,
                                                instructions:
                                                  e.target.value,
                                              })
                                            }
                                          />
                                        </label>

                                        <div className="vm-prescription-quick-options vm-prescription-quick-options--instructions">
                                          <small>Indicaciones rápidas</small>
                                          <div>
                                            {clinicPrescriptionQuickOptions(
                                              "instructions"
                                            )
                                              .slice(0, 6)
                                              .map((option) => (
                                                <button
                                                  type="button"
                                                  key={option}
                                                  className={
                                                    clinicPrescriptionForm
                                                      .instructions ===
                                                    option
                                                      ? "active"
                                                      : ""
                                                  }
                                                  onClick={() =>
                                                    applyClinicPrescriptionQuickValue(
                                                      "instructions",
                                                      option
                                                    )
                                                  }
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                          </div>
                                        </div>

                                        <small className="vm-clinic-preset-note">
                                          Si escribes una indicación nueva y emites la receta, VetMap la guardará para poder reutilizarla después.
                                        </small>
                                      </div>
                                    </div>

                                    <div className="vm-prescription-save-template">
                                      <label>
                                        <input
                                          type="checkbox"
                                          checked={saveClinicPrescriptionAsTemplate}
                                          onChange={(e) =>
                                            setSaveClinicPrescriptionAsTemplate(
                                              e.target.checked
                                            )
                                          }
                                        />
                                        <span>
                                           Guardar esta receta como plantilla reutilizable
                                        </span>
                                      </label>

                                      {saveClinicPrescriptionAsTemplate && (
                                        <input
                                          className="vm-prescription-template-name"
                                          placeholder="Nombre de plantilla (opcional)"
                                          value={clinicPrescriptionTemplateName}
                                          onChange={(e) =>
                                            setClinicPrescriptionTemplateName(
                                              e.target.value
                                            )
                                          }
                                        />
                                      )}
                                    </div>

                                    <div className="vm-clinic-action-footer">
                                      <button
                                        type="button"
                                        className="vm-secondary"
                                        onClick={
                                          closeClinicAction
                                        }
                                      >
                                        Cancelar
                                      </button>

                                      <button
                                        type="submit"
                                        className="vm-primary"
                                      >
                                        Emitir receta
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            </section>
                          </div>
                        )}

                </>
              )}

              {currentUser.role === "vet" &&
                memberSection === "clinicPrescriptions" && (
                  <section className="vm-clinic-page">
                    <div className="vm-clinic-section-heading">
                      <div>
                        <p className="vm-kicker">Recetas</p>
                        <h2>Recetas veterinarias</h2>
                        <p>
                          Emite recetas asociadas a los pacientes atendidos
                          por tu clínica.
                        </p>
                      </div>
                    </div>

                    <div className="vm-clinic-prescription-search">
                      <label>
                        <span>Buscar receta</span>
                        <input
                          placeholder="Paciente, medicamento, dosis o frecuencia..."
                          value={clinicPrescriptionSearch}
                          onChange={(e) =>
                            setClinicPrescriptionSearch(e.target.value)
                          }
                        />
                      </label>

                      {clinicPrescriptionSearch && (
                        <button
                          type="button"
                          className="vm-filter-clear"
                          onClick={() => setClinicPrescriptionSearch("")}
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>

                    <div className="vm-clinic-filter-result">
                      <span>
                        {filteredClinicPrescriptions().length} de{" "}
                        {clinicPrescriptions.length} receta
                        {clinicPrescriptions.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="vm-clinic-prescription-layout">
                      <form
                        onSubmit={saveClinicPrescription}
                        className="vm-clinic-prescription-form"
                      >
                        <h3>Nueva receta</h3>

                        <div className="vm-prescription-template-box">
                          <div className="vm-prescription-template-head">
                            <div>
                              <span> Receta rápida</span>
                              <small>
                                Usa una plantilla o escribe una receta nueva.
                              </small>
                            </div>

                            {selectedClinicPrescriptionTemplateId &&
                              clinicPrescriptionTemplates.find(
                                (item) =>
                                  String(item.id) ===
                                  String(selectedClinicPrescriptionTemplateId)
                              )?.can_delete && (
                                <button
                                  type="button"
                                  className="vm-prescription-template-delete"
                                  onClick={() =>
                                    removeClinicPrescriptionTemplate(
                                      clinicPrescriptionTemplates.find(
                                        (item) =>
                                          String(item.id) ===
                                          String(selectedClinicPrescriptionTemplateId)
                                      )
                                    )
                                  }
                                >
                                   Eliminar plantilla
                                </button>
                              )}
                          </div>

                          <select
                            className="vm-prescription-template-select"
                            value={selectedClinicPrescriptionTemplateId}
                            onChange={(e) =>
                              applyClinicPrescriptionTemplate(e.target.value)
                            }
                          >
                            <option value=""> Escribir desde cero</option>

                            {clinicDefaultPrescriptionTemplates().length > 0 && (
                              <optgroup label="Plantillas VetMap">
                                {clinicDefaultPrescriptionTemplates().map(
                                  (template) => (
                                    <option
                                      key={template.id}
                                      value={template.id}
                                    >
                                      {template.name} · {template.medication}
                                    </option>
                                  )
                                )}
                              </optgroup>
                            )}

                            {clinicCustomPrescriptionTemplates().length > 0 && (
                              <optgroup label="Mis plantillas guardadas">
                                {clinicCustomPrescriptionTemplates().map(
                                  (template) => (
                                    <option
                                      key={template.id}
                                      value={template.id}
                                    >
                                      {template.name}
                                    </option>
                                  )
                                )}
                              </optgroup>
                            )}
                          </select>
                        </div>

                        <label className="vm-field">
                          <span>Paciente</span>

                          <select
                            value={
                              clinicPrescriptionForm.pet_id
                            }
                            onChange={(e) => {
                              const nextPetId = e.target.value;

                              setClinicPrescriptionForm({
                                ...clinicPrescriptionForm,
                                pet_id: nextPetId,
                              });

                              const patient =
                                clinicPatients.find(
                                  (item) =>
                                    String(item.id) ===
                                    String(nextPetId)
                                );

                              if (patient) {
                                loadClinicCatalogOptions(
                                  [
                                    "medication",
                                    "dose",
                                    "frequency",
                                    "duration",
                                    "instructions",
                                  ],
                                  patient
                                );
                              }
                            }}
                          >
                            <option value="">
                              Selecciona un paciente
                            </option>

                            {clinicPatients.map((patient) => (
                              <option
                                key={patient.id}
                                value={patient.id}
                              >
                                {patient.name} ·{" "}
                                {patient.owner_name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="vm-field">
                          <span>Fecha</span>

                          <input
                            type="date"
                            value={
                              clinicPrescriptionForm.issue_date
                            }
                            onChange={(e) =>
                              setClinicPrescriptionForm({
                                ...clinicPrescriptionForm,
                                issue_date: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-field">
                          <span>Medicamento</span>

                          <input
                            value={
                              clinicPrescriptionForm.medication
                            }
                            onChange={(e) =>
                              setClinicPrescriptionForm({
                                ...clinicPrescriptionForm,
                                medication: e.target.value,
                              })
                            }
                          />
                        </label>

                        <div className="vm-prescription-field-block">
                          <label className="vm-field">
                            <span>Dosis</span>

                          <select
                            className="vm-prescription-preset-select"
                            defaultValue=""
                            onChange={(e) => {
                              const value = e.target.value;

                              if (value) {
                                applyClinicPrescriptionQuickValue(
                                  "dosage",
                                  value
                                );
                              }
                            }}
                          >
                            <option value="">
                              Seleccionar opción rápida
                            </option>

                            {clinicPrescriptionQuickOptions(
                              "dose"
                            ).map((option) => (
                              <option
                                key={option}
                                value={option}
                              >
                                {option}
                              </option>
                            ))}
                          </select>

                            <input
                              placeholder="Selecciona o escribe una dosis"
                              value={
                                clinicPrescriptionForm.dosage
                              }
                              onChange={(e) =>
                                setClinicPrescriptionForm({
                                  ...clinicPrescriptionForm,
                                  dosage: e.target.value,
                                })
                              }
                            />
                          </label>

                          <div className="vm-prescription-quick-options">
                            <small>Opciones rápidas</small>
                            <div>
                              {clinicPrescriptionQuickOptions("dose")
                                .slice(0, 8)
                                .map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    className={
                                      clinicPrescriptionForm.dosage === option
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() =>
                                      applyClinicPrescriptionQuickValue(
                                        "dosage",
                                        option
                                      )
                                    }
                                  >
                                    {option}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>

                        <div className="vm-prescription-field-block">
                          <label className="vm-field">
                            <span>Frecuencia</span>

                          <select
                            className="vm-prescription-preset-select"
                            defaultValue=""
                            onChange={(e) => {
                              const value = e.target.value;

                              if (value) {
                                applyClinicPrescriptionQuickValue(
                                  "frequency",
                                  value
                                );
                              }
                            }}
                          >
                            <option value="">
                              Seleccionar opción rápida
                            </option>

                            {clinicPrescriptionQuickOptions(
                              "frequency"
                            ).map((option) => (
                              <option
                                key={option}
                                value={option}
                              >
                                {option}
                              </option>
                            ))}
                          </select>

                            <input
                              placeholder="Selecciona o escribe una frecuencia"
                              value={
                                clinicPrescriptionForm.frequency
                              }
                              onChange={(e) =>
                                setClinicPrescriptionForm({
                                  ...clinicPrescriptionForm,
                                  frequency: e.target.value,
                                })
                              }
                            />
                          </label>

                          <div className="vm-prescription-quick-options">
                            <small>Opciones rápidas</small>
                            <div>
                              {clinicPrescriptionQuickOptions("frequency")
                                .slice(0, 7)
                                .map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    className={
                                      clinicPrescriptionForm.frequency === option
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() =>
                                      applyClinicPrescriptionQuickValue(
                                        "frequency",
                                        option
                                      )
                                    }
                                  >
                                    {option}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>

                        <div className="vm-prescription-field-block">
                          <label className="vm-field">
                            <span>Duración</span>

                          <select
                            className="vm-prescription-preset-select"
                            defaultValue=""
                            onChange={(e) => {
                              const value = e.target.value;

                              if (value) {
                                applyClinicPrescriptionQuickValue(
                                  "duration",
                                  value
                                );
                              }
                            }}
                          >
                            <option value="">
                              Seleccionar opción rápida
                            </option>

                            {clinicPrescriptionQuickOptions(
                              "duration"
                            ).map((option) => (
                              <option
                                key={option}
                                value={option}
                              >
                                {option}
                              </option>
                            ))}
                          </select>

                            <input
                              placeholder="Selecciona o escribe una duración"
                              value={
                                clinicPrescriptionForm.duration
                              }
                              onChange={(e) =>
                                setClinicPrescriptionForm({
                                  ...clinicPrescriptionForm,
                                  duration: e.target.value,
                                })
                              }
                            />
                          </label>

                          <div className="vm-prescription-quick-options">
                            <small>Opciones rápidas</small>
                            <div>
                              {clinicPrescriptionQuickOptions("duration")
                                .slice(0, 7)
                                .map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    className={
                                      clinicPrescriptionForm.duration === option
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() =>
                                      applyClinicPrescriptionQuickValue(
                                        "duration",
                                        option
                                      )
                                    }
                                  >
                                    {option}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>

                        <div className="vm-prescription-field-block">
                          <label className="vm-field">
                            <span>Indicaciones</span>

                          <select
                            className="vm-prescription-preset-select"
                            defaultValue=""
                            onChange={(e) => {
                              const value = e.target.value;

                              if (value) {
                                applyClinicPrescriptionQuickValue(
                                  "instructions",
                                  value
                                );
                              }
                            }}
                          >
                            <option value="">
                              Seleccionar opción rápida
                            </option>

                            {clinicPrescriptionQuickOptions(
                              "instructions"
                            ).map((option) => (
                              <option
                                key={option}
                                value={option}
                              >
                                {option}
                              </option>
                            ))}
                          </select>

                            <textarea
                              placeholder="Selecciona una indicación rápida o escribe una personalizada"
                              value={
                                clinicPrescriptionForm.instructions
                              }
                              onChange={(e) =>
                                setClinicPrescriptionForm({
                                  ...clinicPrescriptionForm,
                                  instructions:
                                    e.target.value,
                                })
                              }
                            />
                          </label>

                          <div className="vm-prescription-quick-options vm-prescription-quick-options--instructions">
                            <small>Indicaciones rápidas</small>
                            <div>
                              {clinicPrescriptionQuickOptions("instructions")
                                .slice(0, 6)
                                .map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    className={
                                      clinicPrescriptionForm.instructions === option
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() =>
                                      applyClinicPrescriptionQuickValue(
                                        "instructions",
                                        option
                                      )
                                    }
                                  >
                                    {option}
                                  </button>
                                ))}
                            </div>
                          </div>

                          <small className="vm-clinic-preset-note">
                            Las opciones nuevas que escribas quedarán disponibles para próximas recetas.
                          </small>
                        </div>


                        <div className="vm-prescription-save-template">
                          <label>
                            <input
                              type="checkbox"
                              checked={saveClinicPrescriptionAsTemplate}
                              onChange={(e) =>
                                setSaveClinicPrescriptionAsTemplate(
                                  e.target.checked
                                )
                              }
                            />
                            <span>
                               Guardar esta receta como plantilla reutilizable
                            </span>
                          </label>

                          {saveClinicPrescriptionAsTemplate && (
                            <input
                              className="vm-prescription-template-name"
                              placeholder="Nombre de plantilla (opcional)"
                              value={clinicPrescriptionTemplateName}
                              onChange={(e) =>
                                setClinicPrescriptionTemplateName(
                                  e.target.value
                                )
                              }
                            />
                          )}
                        </div>

                        <button
                          type="submit"
                          className="vm-primary"
                        >
                          Emitir receta
                        </button>
                      </form>

                      <div className="vm-clinic-prescription-list">
                        {clinicPrescriptions.length === 0 ? (
                          <div className="vm-clinic-empty">
                            <p>Aún no hay recetas emitidas.</p>
                          </div>
                        ) : filteredClinicPrescriptions().length === 0 ? (
                          <div className="vm-clinic-empty">
                            <p>No encontramos recetas con esa búsqueda.</p>
                          </div>
                        ) : (
                          filteredClinicPrescriptions().map((item) => (
                            <article
                              key={item.id}
                              className="vm-clinic-prescription-card"
                            >
                              <div>

                                <div>
                                  <strong>
                                    {item.pet_name}
                                  </strong>

                                  <h3>
                                    {item.medication}
                                  </h3>

                                  <p>
                                    {item.dosage ||
                                      "Sin dosis"}{" "}
                                    ·{" "}
                                    {item.frequency ||
                                      "Sin frecuencia"}
                                  </p>

                                  <small>
                                    {formatDate(
                                      item.issue_date
                                    )}
                                  </small>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeClinicPrescription(
                                    item.id
                                  )
                                }
                              >
                                Eliminar
                              </button>
                            </article>
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                )}

              {memberSection === "veterinarias" && (
                <section className="vm-member-page">
                  {!selectedMemberClinic() ? (
                    <>
                      <div className="vm-member-page-heading">
                        <div>
                          <p className="vm-kicker">Red VetMap</p>
                          <h2>Veterinarias</h2>
                          <p>
                            Elige una veterinaria para abrir su ficha completa.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="vm-secondary"
                          onClick={() => setMemberSection("inicio")}
                        >
                          Volver al inicio
                        </button>
                      </div>

                      {clinics.length === 0 ? (
                        <div className="vm-empty-state">
                          <span>🏥</span>
                          <p>No hay veterinarias disponibles.</p>
                        </div>
                      ) : (
                        <div className="vm-vet-grid">
                          {clinics.map((clinic) => (
                            <article
                              key={clinic.id}
                              className="vm-vet-card vm-establishment-card"
                            >
                              <div className="vm-vet-icon">
                                {clinic.is_24h ? "🚑" : "🏥"}
                              </div>

                              <span className="vm-open-badge">
                                {clinic.is_24h
                                  ? "24 horas"
                                  : "Disponible"}
                              </span>

                              <h3>{clinic.name}</h3>

                              <p>
                                {clinic.services ||
                                  "Servicios veterinarios"}
                              </p>

                              <div className="vm-card-meta">
                                <span>📍 {clinic.commune}</span>
                                <span>🕐 {clinic.hours}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openMemberClinic(clinic)
                                }
                              >
                                Ver veterinaria
                              </button>
                            </article>
                          ))}
                        </div>
                      )}

                      <VetMapPlacesMap
                        title="Mapa de veterinarias VetMap"
                        description="Selecciona una veterinaria para abrir su ficha."
                        places={clinics}
                        type="clinic"
                        actionLabel="Ver veterinaria"
                        onAction={openMemberClinic}
                      />
                    </>
                  ) : (
                    <section className="vm-establishment-detail-page">
                      <button
                        type="button"
                        className="vm-establishment-back"
                        onClick={closeMemberClinic}
                      >
                        ← Volver a veterinarias
                      </button>

                      <div className="vm-establishment-hero vm-establishment-hero--clinic">
                        <div className="vm-establishment-hero-icon">
                          {selectedMemberClinic().is_24h
                            ? "🚑"
                            : "🏥"}
                        </div>

                        <div className="vm-establishment-hero-copy">
                          <p className="vm-kicker">
                            Veterinaria VetMap
                          </p>
                          <h2>{selectedMemberClinic().name}</h2>
                          <p>
                            Toda la información de esta veterinaria
                            está concentrada en este apartado.
                          </p>

                          <div className="vm-establishment-meta-grid">
                            <span>
                              📍 {selectedMemberClinic().commune}
                            </span>
                            <span>
                              🏠 {selectedMemberClinic().address ||
                                "Dirección demostrativa"}
                            </span>
                            <span>
                              🕐 {selectedMemberClinic().hours ||
                                "Horario por confirmar"}
                            </span>
                            <span>
                              {selectedMemberClinic().is_24h
                                ? "🚑 Atención 24 horas"
                                : "🩺 Atención veterinaria"}
                            </span>
                          </div>
                        </div>

                        {currentUser.role !== "admin" && (
                          <button
                            type="button"
                            className="vm-primary vm-establishment-main-action"
                            onClick={() => {
                              setReservationForm((current) => ({
                                ...current,
                                veterinary_id: String(
                                  selectedMemberClinic().id
                                ),
                                service: "",
                                appointment_time: "",
                              }));
                              setMemberClinicDetailId("");
                              setMemberSection("reserva");
                            }}
                          >
                            📅 Agendar en esta veterinaria
                          </button>
                        )}
                      </div>

                      <section className="vm-establishment-panel">
                        <div className="vm-establishment-panel-heading">
                          <span>🩺</span>
                          <div>
                            <small>Servicios disponibles</small>
                            <h3>
                              Atención de {selectedMemberClinic().name}
                            </h3>
                          </div>
                        </div>

                        <div className="vm-establishment-service-grid">
                          {String(
                            selectedMemberClinic().services ||
                              "Consulta general"
                          )
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                            .map((service) => (
                              <span key={service}>
                                ✓ {service}
                              </span>
                            ))}
                        </div>
                      </section>

                      <VetMapPlacesMap
                        title={`Ubicación de ${selectedMemberClinic().name}`}
                        description="Ubicación de la veterinaria seleccionada."
                        places={[selectedMemberClinic()]}
                        type="clinic"
                      />
                    </section>
                  )}
                </section>
              )}

              {memberSection === "tienda" &&
                currentUser.role !== "store" &&
                currentUser.role !== "vet" && (
                <section className="vm-member-page vm-market-page">
                  {!selectedMarketplaceStore() ? (
                    <>
                      <div className="vm-member-page-heading">
                        <div>
                          <p className="vm-kicker">Marketplace VetMap</p>
                          <h2>Tiendas</h2>
                          <p>
                            Elige una tienda. Al entrar se abrirá su propio
                            apartado con información, ubicación y productos.
                          </p>
                        </div>

                        <div className="vm-market-heading-cart">
                          <span>
                            🛒{" "}
                            {cart.reduce(
                              (sum, item) =>
                                sum + Number(item.quantity || 0),
                              0
                            )}{" "}
                            productos
                          </span>
                        </div>
                      </div>

                      {marketStores.length === 0 ? (
                        <div className="vm-empty-state">
                          <span>🏪</span>
                          <p>No hay tiendas disponibles.</p>
                        </div>
                      ) : (
                        <div className="vm-vet-grid vm-store-grid vm-establishment-grid">
                          {marketStores.map((store) => (
                            <article
                              key={store.id}
                              className="vm-vet-card vm-store-card vm-establishment-card"
                            >
                              <div className="vm-vet-icon vm-store-icon">
                                🏪
                              </div>

                              <span className="vm-open-badge">
                                Tienda VetMap
                              </span>

                              <h3>{store.name}</h3>

                              <p>
                                Productos para mascotas publicados por
                                este establecimiento.
                              </p>

                              <div className="vm-card-meta">
                                <span>📍 {store.commune}</span>
                                <span>
                                  🏠 {store.address ||
                                    "Dirección demostrativa"}
                                </span>
                                <span>
                                  📦 {store.delivery_conditions ||
                                    "Condiciones por confirmar"}
                                </span>
                                <span>
                                  🛍️ {marketplaceStoreProductCount(
                                    store.id
                                  )}{" "}
                                  productos
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openMarketplaceStore(store)
                                }
                              >
                                Entrar a la tienda →
                              </button>
                            </article>
                          ))}
                        </div>
                      )}

                      <VetMapPlacesMap
                        title="Mapa de tiendas VetMap"
                        description="Selecciona una tienda para abrir su apartado."
                        places={marketStores}
                        type="store"
                        actionLabel="Entrar a la tienda"
                        onAction={openMarketplaceStore}
                      />
                    </>
                  ) : (
                    <section className="vm-establishment-detail-page vm-store-detail-page">
                      <button
                        type="button"
                        className="vm-establishment-back"
                        onClick={showAllMarketplaceStores}
                      >
                        ← Volver a tiendas
                      </button>

                      <div className="vm-establishment-hero vm-establishment-hero--store">
                        <div className="vm-establishment-hero-icon">
                          🏪
                        </div>

                        <div className="vm-establishment-hero-copy">
                          <p className="vm-kicker">
                            Tienda VetMap
                          </p>
                          <h2>
                            {selectedMarketplaceStore().name}
                          </h2>
                          <p>
                            Estás dentro de esta tienda. Aquí aparecen
                            solamente sus productos y su información.
                          </p>

                          <div className="vm-establishment-meta-grid">
                            <span>
                              📍 {selectedMarketplaceStore().commune}
                            </span>
                            <span>
                              🏠 {selectedMarketplaceStore().address ||
                                "Dirección demostrativa"}
                            </span>
                            <span>
                              📦 {selectedMarketplaceStore()
                                .delivery_conditions ||
                                "Condiciones por confirmar"}
                            </span>
                            <span>
                              🛍️ {marketplaceStoreProductCount(
                                selectedMarketplaceStore().id
                              )}{" "}
                              productos disponibles
                            </span>
                          </div>
                        </div>

                        <div className="vm-establishment-hero-cart">
                          <span>🛒</span>
                          <div>
                            <strong>
                              {cart.reduce(
                                (sum, item) =>
                                  sum + Number(item.quantity || 0),
                                0
                              )}
                            </strong>
                            <small>en tu carrito</small>
                          </div>
                        </div>
                      </div>

                      <div className="vm-store-detail-toolbar">
                        <label className="vm-market-search">
                          <span>🔎</span>
                          <input
                            placeholder={`Buscar en ${selectedMarketplaceStore().name}...`}
                            value={marketSearch}
                            onChange={(e) =>
                              setMarketSearch(e.target.value)
                            }
                          />
                        </label>

                        <select
                          value={marketCategory}
                          onChange={(e) =>
                            setMarketCategory(e.target.value)
                          }
                        >
                          <option value="all">
                            Todas las categorías
                          </option>
                          {marketplaceCategories().map(
                            (category) => (
                              <option
                                key={category}
                                value={category}
                              >
                                {category}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="vm-store-detail-content">
                        <div className="vm-store-detail-products">
                          <div className="vm-store-products-heading">
                            <div>
                              <p className="vm-kicker">
                                Catálogo
                              </p>
                              <h3>
                                Productos de{" "}
                                {selectedMarketplaceStore().name}
                              </h3>
                            </div>

                            <strong className="vm-market-count">
                              {filteredMarketplaceProducts().length}{" "}
                              {filteredMarketplaceProducts().length === 1
                                ? "producto"
                                : "productos"}
                            </strong>
                          </div>

                          {filteredMarketplaceProducts().length === 0 ? (
                            <div className="vm-empty-state">
                              <span>🔎</span>
                              <p>
                                No encontramos productos con esos filtros.
                              </p>
                            </div>
                          ) : (
                            <div className="vm-product-grid vm-product-grid-four">
                              {filteredMarketplaceProducts().map(
                                (product) => (
                                  <article
                                    className="vm-product-card vm-real-product"
                                    key={product.id}
                                  >
                                    <div className="vm-product-image">
                                      {product.image_data ? (
                                        <img
                                          src={product.image_data}
                                          alt={product.name}
                                        />
                                      ) : (
                                        productEmoji(product.category)
                                      )}
                                    </div>

                                    <p className="vm-product-type">
                                      {product.category}
                                    </p>

                                    <h3>{product.name}</h3>

                                    <p className="vm-market-brand">
                                      {product.brand || "Sin marca"} ·{" "}
                                      {product.format || "Sin formato"}
                                    </p>

                                    <div className="vm-market-product-meta">
                                      <span>
                                        📦{" "}
                                        {availableProductStock(product) > 0
                                          ? `${availableProductStock(product)} disponibles`
                                          : "Sin stock"}
                                      </span>

                                      {cartQuantityFor(product.id) > 0 && (
                                        <span className="vm-in-cart">
                                          🛒 {cartQuantityFor(product.id)} en
                                          tu carrito
                                        </span>
                                      )}
                                    </div>

                                    <div className="vm-price-row">
                                      <strong>
                                        {formatCLP(product.price)}
                                      </strong>
                                    </div>

                                    <div className="vm-market-card-actions">
                                      <button
                                        type="button"
                                        className="vm-secondary"
                                        onClick={() =>
                                          setCompareKey(
                                            product.comparison_key
                                          )
                                        }
                                      >
                                        Comparar
                                      </button>

                                      <button
                                        type="button"
                                        className="vm-primary"
                                        disabled={
                                          availableProductStock(product) <= 0
                                        }
                                        onClick={() =>
                                          addProductToCart(product)
                                        }
                                      >
                                        {availableProductStock(product) <= 0
                                          ? "Agotado"
                                          : "Agregar"}
                                      </button>
                                    </div>
                                  </article>
                                )
                              )}
                            </div>
                          )}

                          {compareKey && (
                            <section className="vm-compare-panel">
                              <div className="vm-clinic-section-heading">
                                <div>
                                  <p className="vm-kicker">Comparador</p>
                                  <h2>
                                    Mismo producto, distintas tiendas
                                  </h2>
                                  <p>
                                    Puedes comparar y saltar a otra tienda
                                    sin perder el carrito.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="vm-secondary"
                                  onClick={() => setCompareKey("")}
                                >
                                  Cerrar
                                </button>
                              </div>

                              <div className="vm-compare-table">
                                {compareProducts().map(
                                  (product, index) => (
                                    <div
                                      className={`vm-compare-row ${
                                        index === 0
                                          ? "best-price"
                                          : ""
                                      }`}
                                      key={product.id}
                                    >
                                      <div>
                                        {index === 0 && (
                                          <small>
                                            Precio más bajo
                                          </small>
                                        )}
                                        <strong>
                                          {product.store_name}
                                        </strong>
                                      </div>

                                      <div>
                                        <small>Precio</small>
                                        <strong>
                                          {formatCLP(product.price)}
                                        </strong>
                                      </div>

                                      <div>
                                        <small>Stock</small>
                                        <strong>
                                          {availableProductStock(product) > 0
                                            ? `${availableProductStock(product)} u.`
                                            : "Agotado"}
                                        </strong>
                                      </div>

                                      <button
                                        type="button"
                                        className="vm-primary"
                                        onClick={() => {
                                          const store =
                                            marketStores.find(
                                              (item) =>
                                                String(item.id) ===
                                                String(
                                                  product.store_id
                                                )
                                            );

                                          if (store) {
                                            openMarketplaceStore(store);
                                          }
                                        }}
                                      >
                                        Ir a tienda
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            </section>
                          )}

                          <VetMapPlacesMap
                            title={`Ubicación de ${selectedMarketplaceStore().name}`}
                            description="Ubicación de la tienda seleccionada."
                            places={[selectedMarketplaceStore()]}
                            type="store"
                          />
                        </div>

<aside
                      id="vm-market-cart"
                      className="vm-cart-panel"
                    >
                      <div className="vm-cart-title">
                        <div>
                          <p className="vm-kicker">Finalizar compra</p>
                          <h3>Tu carrito</h3>
                          <small className="vm-cart-multistore-note">
                            Puedes combinar productos de distintas tiendas.
                          </small>
                        </div>
                        <span>
                          {cart.reduce(
                            (n, item) => n + item.quantity,
                            0
                          )}{" "}
                          u.
                        </span>
                      </div>
                      {!cart.length ? <div className="vm-cart-empty"><span>🛒</span><p>Agrega productos para crear un pedido.</p></div> : <>
                        <div className="vm-cart-items">
                          {cart.map((item) => (
                            <div className="vm-cart-item" key={item.id}>
                              <div>
                                <strong>{item.name}</strong>
                                <span>{item.store_name}</span>
                                <small>{formatCLP(item.price)}</small>
                                <small className="vm-cart-stock">
                                  Stock restante:{" "}
                                  {availableProductStock(item)}
                                </small>
                              </div>
                              <div className="vm-cart-item-controls">
                                <div className="vm-cart-qty">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      changeCartQuantity(item.id, -1)
                                    }
                                  >
                                    −
                                  </button>

                                  <strong>
                                    {item.quantity}
                                  </strong>

                                  <button
                                    type="button"
                                    disabled={
                                      availableProductStock(item) <= 0
                                    }
                                    onClick={() =>
                                      changeCartQuantity(item.id, 1)
                                    }
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  className="vm-cart-remove-item"
                                  onClick={() =>
                                    removeCartItem(item)
                                  }
                                  title="Eliminar producto"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="vm-cart-total">
                          <span>Total</span>
                          <strong>
                            {formatCLP(cartTotal())}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="vm-cart-clear-button"
                          onClick={clearCart}
                        >
                          🗑️ Vaciar carrito
                        </button>
                        <div
                          style={{
                            display: "grid",
                            gap: "10px",
                            marginTop: "14px",
                          }}
                        >
                          <button
                            type="button"
                            className="vm-primary"
                            onClick={payWithMercadoPago}
                          >
                            💳 Pagar con Mercado Pago (TEST)
                          </button>

                          <button
                            type="button"
                            className="vm-secondary"
                            onClick={submitStoreOrder}
                          >
                            Registrar compra simulada
                          </button>
                        </div>
                      </>}
                      {!!myStoreOrders.length && (
                        <div className="vm-my-orders-mini">
                          <div className="vm-mini-orders-head">
                            <h4>Mis últimos pedidos</h4>
                            <button
                              type="button"
                              onClick={() => setMemberSection("orders")}
                            >
                              Ver todos
                            </button>
                          </div>

                          {myStoreOrders.slice(0, 3).map((order) => (
                            <button
                              type="button"
                              className="vm-mini-order-row"
                              key={order.id}
                              onClick={() => {
                                setExpandedOrderId(order.id);
                                setMemberSection("orders");
                              }}
                            >
                              <span>
                                #{order.id} · {order.store_name}
                              </span>
                              <strong>
                                {orderStatusIcon(order.status)}{" "}
                                {orderStatusLabel(order.status)}
                              </strong>
                            </button>
                          ))}
                        </div>
                      )}
                    </aside>
                      </div>
                    </section>
                  )}
                </section>
              )}

              {memberSection === "orders" &&
                currentUser.role === "owner" && (
                  <section className="vm-member-page vm-orders-page">
                    <div className="vm-member-page-heading">
                      <div>
                        <p className="vm-kicker">Historial de compra</p>
                        <h2>Mis pedidos</h2>
                        <p>
                          Revisa tus compras y sigue el estado de cada pedido.
                        </p>
                      </div>

                      <div className="vm-order-heading-actions">
                        {myStoreOrders.some(
                          (order) =>
                            order.status === "delivered"
                        ) && (
                          <button
                            type="button"
                            className="vm-clean-history-button"
                            onClick={
                              cleanMyDeliveredOrders
                            }
                          >
                            🧹 Limpiar entregados
                          </button>
                        )}

                        <button
                          type="button"
                          className="vm-secondary"
                          onClick={() =>
                            loadMarketplaceData(token)
                          }
                        >
                          Actualizar
                        </button>
                      </div>
                    </div>

                    <div className="vm-order-history-filters">
                      <button
                        type="button"
                        className={
                          orderHistoryFilter === "all"
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setOrderHistoryFilter("all")
                        }
                      >
                        Todos
                        <span>{myStoreOrders.length}</span>
                      </button>

                      <button
                        type="button"
                        className={
                          orderHistoryFilter === "active"
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setOrderHistoryFilter("active")
                        }
                      >
                        En proceso
                        <span>
                          {
                            myStoreOrders.filter(
                              (order) =>
                                ![
                                  "delivered",
                                  "cancelled",
                                ].includes(order.status)
                            ).length
                          }
                        </span>
                      </button>

                      <button
                        type="button"
                        className={
                          orderHistoryFilter === "completed"
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setOrderHistoryFilter("completed")
                        }
                      >
                        Entregados
                        <span>
                          {
                            myStoreOrders.filter(
                              (order) =>
                                order.status === "delivered"
                            ).length
                          }
                        </span>
                      </button>

                      <button
                        type="button"
                        className={
                          orderHistoryFilter === "cancelled"
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setOrderHistoryFilter("cancelled")
                        }
                      >
                        Cancelados
                        <span>
                          {
                            myStoreOrders.filter(
                              (order) =>
                                order.status === "cancelled"
                            ).length
                          }
                        </span>
                      </button>
                    </div>

                    {filteredMyOrders().length === 0 ? (
                      <div className="vm-clinic-empty">
                        <span>🧾</span>
                        <p>
                          No tienes pedidos en esta categoría.
                        </p>

                        <button
                          type="button"
                          className="vm-primary"
                          onClick={() =>
                            setMemberSection("tienda")
                          }
                        >
                          Ir a la tienda
                        </button>
                      </div>
                    ) : (
                      <div className="vm-orders-list">
                        {filteredMyOrders().map((order) => {
                          const expanded =
                            expandedOrderId === order.id;

                          return (
                            <article
                              key={order.id}
                              className={`vm-user-order-card ${
                                expanded ? "expanded" : ""
                              }`}
                            >
                              <div className="vm-user-order-head">
                                <div className="vm-user-order-id">
                                  <span>
                                    {orderStatusIcon(order.status)}
                                  </span>

                                  <div>
                                    <small>
                                      Pedido #{order.id}
                                    </small>

                                    <h3>
                                      {order.store_name}
                                    </h3>

                                    <p>
                                      {new Date(
                                        order.created_at
                                      ).toLocaleDateString(
                                        "es-CL",
                                        {
                                          day: "2-digit",
                                          month: "long",
                                          year: "numeric",
                                        }
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="vm-user-order-summary">
                                  <span
                                    className={`vm-user-order-badge ${order.status}`}
                                  >
                                    {orderStatusLabel(
                                      order.status
                                    )}
                                  </span>

                                  <strong>
                                    {formatCLP(order.total)}
                                  </strong>
                                </div>

                                <div className="vm-order-card-actions">
                                  <button
                                    type="button"
                                    className="vm-order-expand"
                                    onClick={() =>
                                      setExpandedOrderId(
                                        expanded
                                          ? null
                                          : order.id
                                      )
                                    }
                                  >
                                    {expanded
                                      ? "Ocultar detalle"
                                      : "Ver seguimiento"}
                                  </button>

                                  {isFinalStoreOrderStatus(
                                    order.status
                                  ) && (
                                    <button
                                      type="button"
                                      className="vm-clean-reservation"
                                      onClick={() =>
                                        cleanMyStoreOrder(
                                          order
                                        )
                                      }
                                    >
                                      🧹 Quitar del historial
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="vm-user-order-products">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="vm-user-order-product"
                                  >
                                    <span className="vm-order-product-icon">
                                      📦
                                    </span>

                                    <div>
                                      <strong>
                                        {item.product_name}
                                      </strong>

                                      <span>
                                        {item.quantity} unidad
                                        {item.quantity === 1
                                          ? ""
                                          : "es"}{" "}
                                        ·{" "}
                                        {formatCLP(
                                          item.unit_price
                                        )}{" "}
                                        c/u
                                      </span>
                                    </div>

                                    <strong>
                                      {formatCLP(
                                        item.subtotal
                                      )}
                                    </strong>
                                  </div>
                                ))}
                              </div>

                              {expanded && (
                                <div className="vm-order-tracking-box">
                                  <div className="vm-order-tracking-heading">
                                    <div>
                                      <p className="vm-kicker">
                                        Seguimiento
                                      </p>

                                      <h4>
                                        Estado de tu pedido
                                      </h4>
                                    </div>

                                    <span>
                                      {order.store_commune
                                        ? `📍 ${order.store_commune}`
                                        : ""}
                                    </span>
                                  </div>

                                  <div className="vm-order-timeline">
                                    {orderTrackingSteps(
                                      order
                                    ).map(
                                      (step, index) => {
                                        const stepState =
                                          orderStepState(
                                            order,
                                            step.key
                                          );

                                        const date =
                                          trackingDate(
                                            order,
                                            step.key
                                          );

                                        return (
                                          <div
                                            key={step.key}
                                            className={`vm-order-step ${stepState}`}
                                          >
                                            <div className="vm-order-step-marker">
                                              <span>
                                                {stepState ===
                                                "done"
                                                  ? "✓"
                                                  : stepState ===
                                                    "current"
                                                  ? orderStatusIcon(
                                                      step.key
                                                    )
                                                  : index + 1}
                                              </span>
                                            </div>

                                            <div className="vm-order-step-copy">
                                              <strong>
                                                {step.label}
                                              </strong>

                                              <p>
                                                {
                                                  step.description
                                                }
                                              </p>

                                              {date && (
                                                <small>
                                                  {new Date(
                                                    date
                                                  ).toLocaleString(
                                                    "es-CL",
                                                    {
                                                      day: "2-digit",
                                                      month: "2-digit",
                                                      year: "numeric",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    }
                                                  )}
                                                </small>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>

                                  <div className="vm-order-current-message">
                                    <span>
                                      {orderStatusIcon(
                                        order.status
                                      )}
                                    </span>

                                    <div>
                                      <strong>
                                        {orderStatusLabel(
                                          order.status
                                        )}
                                      </strong>

                                      <p>
                                        {order.status ===
                                        "pending"
                                          ? "Tu pedido fue recibido y está esperando preparación."
                                          : order.status ===
                                            "preparing"
                                          ? "La tienda está preparando tus productos."
                                          : order.status ===
                                            "ready"
                                          ? "Tu pedido ya está preparado."
                                          : order.status ===
                                            "dispatched"
                                          ? "Tu pedido fue despachado y está en camino."
                                          : order.status ===
                                            "delivered"
                                          ? "Tu pedido fue entregado."
                                          : "Este pedido fue cancelado."}
                                      </p>
                                    </div>
                                  </div>

                                  {order.status ===
                                    "dispatched" && (
                                    <div className="vm-order-delivery-estimate">
                                      <span>🚚</span>

                                      <div>
                                        <strong>
                                          Entrega estimada
                                        </strong>

                                        <p>
                                          {estimatedDeliveryText(
                                            order
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                )}

              {memberSection === "reserva" && (
                <section className="vm-member-page">
                  <div className="vm-member-page-heading">
                    <div>
                      <p className="vm-kicker">Agenda VetMap</p>

                      <h2>
                        {currentUser.role === "admin"
                          ? "Gestión de reservas"
                          : "Reserva de hora"}
                      </h2>

                      <p>
                        {currentUser.role === "admin"
                          ? "Supervisa las reservas. Los estados completada y cancelada son definitivos y pueden limpiarse del historial administrativo."
                          : "Selecciona tu mascota, una veterinaria, fecha y hora."}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="vm-secondary"
                      onClick={() => setMemberSection("inicio")}
                    >
                      Volver al inicio
                    </button>
                  </div>

                  {currentUser.role !== "admin" && (
                    <div className="vm-real-booking-layout">
                      <form
                        onSubmit={requestReservationConfirmation}
                        className="vm-reservation-form vm-reservation-form-modern"
                      >
                        <div className="vm-reservation-form-title">
                          <span>📅</span>
                          <div>
                            <h3>Nueva reserva</h3>
                            <p>
                              Completa los pasos y elige únicamente un horario disponible.
                            </p>
                          </div>
                        </div>

                        {pets.length === 0 ? (
                          <div className="vm-empty-state">
                            <span>🐶</span>
                            <p>
                              Primero debes registrar una mascota.
                            </p>

                            <button
                              type="button"
                              className="vm-primary"
                              onClick={() =>
                                setMemberSection("cuenta")
                              }
                            >
                              Ir a mis mascotas
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="vm-booking-step">
                              <div className="vm-booking-step-number">
                                1
                              </div>

                              <div className="vm-booking-step-content">
                                <div className="vm-booking-step-heading">
                                  <strong>
                                    Mascota y veterinaria
                                  </strong>
                                  <span>
                                    Selecciona quién será atendido y dónde.
                                  </span>
                                </div>

                                <div className="vm-reservation-grid">
                                  <label className="vm-field">
                                    <span>Mascota</span>
                                    <select
                                      value={
                                        reservationForm.pet_id
                                      }
                                      onChange={(e) =>
                                        setReservationForm({
                                          ...reservationForm,
                                          pet_id:
                                            e.target.value,
                                        })
                                      }
                                    >
                                      <option value="">
                                        Selecciona una mascota
                                      </option>

                                      {pets.map((pet) => (
                                        <option
                                          key={pet.id}
                                          value={pet.id}
                                        >
                                          {pet.name} -{" "}
                                          {pet.species}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <label className="vm-field">
                                    <span>Veterinaria</span>
                                    <select
                                      value={
                                        reservationForm.veterinary_id
                                      }
                                      onChange={(e) => {
                                        const clinicId =
                                          e.target.value;

                                        const clinic =
                                          clinics.find(
                                            (item) =>
                                              String(
                                                item.id
                                              ) ===
                                              String(
                                                clinicId
                                              )
                                          );

                                        const services =
                                          reservationClinicServices(
                                            clinic
                                          );

                                        setReservationForm(
                                          (current) => ({
                                            ...current,
                                            veterinary_id:
                                              clinicId,
                                            service:
                                              services[0] ||
                                              "",
                                            appointment_time:
                                              "",
                                          })
                                        );

                                        setReservationAvailability(
                                          null
                                        );

                                        if (
                                          clinicId &&
                                          reservationForm.appointment_date
                                        ) {
                                          setTimeout(
                                            () =>
                                              loadReservationAvailability(
                                                clinicId,
                                                reservationForm.appointment_date
                                              ),
                                            0
                                          );
                                        }
                                      }}
                                    >
                                      <option value="">
                                        Selecciona veterinaria
                                      </option>

                                      {clinics.map(
                                        (clinic) => (
                                          <option
                                            key={clinic.id}
                                            value={clinic.id}
                                          >
                                            {clinic.name} -{" "}
                                            {clinic.commune}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </label>
                                </div>

                                {selectedReservationClinic() && (
                                  <div className="vm-selected-clinic-booking">
                                    <div className="vm-selected-clinic-booking-icon">
                                      {selectedReservationClinic()
                                        .is_24h
                                        ? "🚑"
                                        : "🏥"}
                                    </div>

                                    <div>
                                      <small>
                                        Veterinaria seleccionada
                                      </small>

                                      <strong>
                                        {
                                          selectedReservationClinic()
                                            .name
                                        }
                                      </strong>

                                      <span>
                                        📍{" "}
                                        {
                                          selectedReservationClinic()
                                            .commune
                                        }{" "}
                                        · 🕐{" "}
                                        {
                                          selectedReservationClinic()
                                            .hours
                                        }
                                      </span>

                                      <p>
                                        {
                                          selectedReservationClinic()
                                            .services
                                        }
                                      </p>
                                    </div>

                                    <span className="vm-demo-inline">
                                      🧪 Ficticia
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="vm-booking-step">
                              <div className="vm-booking-step-number">
                                2
                              </div>

                              <div className="vm-booking-step-content">
                                <div className="vm-booking-step-heading">
                                  <strong>
                                    Servicio y fecha
                                  </strong>
                                  <span>
                                    Los servicios cambian según la veterinaria seleccionada.
                                  </span>
                                </div>

                                <div className="vm-reservation-grid">
                                  <label className="vm-field">
                                    <span>Servicio</span>
                                    <select
                                      value={
                                        reservationForm.service
                                      }
                                      disabled={
                                        !selectedReservationClinic()
                                      }
                                      onChange={(e) =>
                                        setReservationForm({
                                          ...reservationForm,
                                          service:
                                            e.target.value,
                                        })
                                      }
                                    >
                                      {!selectedReservationClinic() && (
                                        <option value="">
                                          Primero selecciona una veterinaria
                                        </option>
                                      )}

                                      {reservationClinicServices(
                                        selectedReservationClinic()
                                      ).map((service) => (
                                        <option
                                          key={service}
                                          value={service}
                                        >
                                          {service}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <label className="vm-field">
                                    <span>Fecha</span>
                                    <input
                                      type="date"
                                      min={todayInputValue()}
                                      value={
                                        reservationForm.appointment_date
                                      }
                                      onChange={(e) => {
                                        const nextDate =
                                          e.target.value;

                                        setReservationForm(
                                          (current) => ({
                                            ...current,
                                            appointment_date:
                                              nextDate,
                                            appointment_time:
                                              "",
                                          })
                                        );

                                        setReservationAvailability(
                                          null
                                        );

                                        if (
                                          reservationForm.veterinary_id &&
                                          nextDate
                                        ) {
                                          setTimeout(
                                            () =>
                                              loadReservationAvailability(
                                                reservationForm.veterinary_id,
                                                nextDate
                                              ),
                                            0
                                          );
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="vm-booking-step">
                              <div className="vm-booking-step-number">
                                3
                              </div>

                              <div className="vm-booking-step-content">
                                <div className="vm-booking-step-heading">
                                  <strong>
                                    Horario disponible
                                  </strong>
                                  <span>
                                    Los horarios ocupados quedan bloqueados automáticamente.
                                  </span>
                                </div>

                                {!reservationForm.veterinary_id ||
                                !reservationForm.appointment_date ? (
                                  <div className="vm-time-slots-placeholder">
                                    <span>🕐</span>
                                    <p>
                                      Selecciona veterinaria y fecha para ver los horarios.
                                    </p>
                                  </div>
                                ) : reservationAvailabilityLoading ? (
                                  <div className="vm-time-slots-placeholder">
                                    <span>⏳</span>
                                    <p>
                                      Buscando horarios disponibles...
                                    </p>
                                  </div>
                                ) : reservationAvailability?.slots
                                    ?.length ? (
                                  <>
                                    <div className="vm-time-slot-legend">
                                      <span>
                                        <i className="available" />
                                        Disponible
                                      </span>

                                      <span>
                                        <i className="selected" />
                                        Seleccionado
                                      </span>

                                      <span>
                                        <i className="occupied" />
                                        Ocupado
                                      </span>
                                    </div>

                                    <div className="vm-time-slots">
                                      {reservationAvailability.slots.map(
                                        (slot) => {
                                          const selected =
                                            reservationForm.appointment_time ===
                                            slot.time;

                                          return (
                                            <button
                                              type="button"
                                              key={slot.time}
                                              disabled={
                                                !slot.available
                                              }
                                              className={`vm-time-slot ${
                                                selected
                                                  ? "selected"
                                                  : ""
                                              } ${
                                                !slot.available
                                                  ? "occupied"
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                setReservationForm(
                                                  (current) => ({
                                                    ...current,
                                                    appointment_time:
                                                      slot.time,
                                                  })
                                                )
                                              }
                                            >
                                              <span>
                                                {slot.time}
                                              </span>

                                              <small>
                                                {slot.available
                                                  ? selected
                                                    ? "Elegido"
                                                    : "Disponible"
                                                  : "Ocupado"}
                                              </small>
                                            </button>
                                          );
                                        }
                                      )}
                                    </div>

                                    <p className="vm-availability-summary">
                                      {
                                        reservationAvailability.available_count
                                      }{" "}
                                      horarios disponibles para esta fecha.
                                    </p>
                                  </>
                                ) : (
                                  <div className="vm-time-slots-placeholder">
                                    <span>📅</span>
                                    <p>
                                      No hay horarios disponibles para esta fecha.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="vm-booking-step">
                              <div className="vm-booking-step-number">
                                4
                              </div>

                              <div className="vm-booking-step-content">
                                <div className="vm-booking-step-heading">
                                  <strong>
                                    Observación
                                  </strong>
                                  <span>
                                    Opcional: agrega información útil para la atención.
                                  </span>
                                </div>

                                <label className="vm-field vm-field-full">
                                  <textarea
                                    placeholder="Ejemplo: control anual, molestias, síntomas..."
                                    value={
                                      reservationForm.notes
                                    }
                                    onChange={(e) =>
                                      setReservationForm({
                                        ...reservationForm,
                                        notes:
                                          e.target.value,
                                      })
                                    }
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="vm-booking-summary-inline">
                              <span>📋</span>

                              <div>
                                <small>
                                  Resumen de la reserva
                                </small>

                                <strong>
                                  {selectedReservationPet()?.name ||
                                    "Selecciona mascota"}{" "}
                                  ·{" "}
                                  {selectedReservationClinic()?.name ||
                                    "Selecciona veterinaria"}
                                </strong>

                                <p>
                                  {reservationForm.service ||
                                    "Servicio pendiente"}{" "}
                                  ·{" "}
                                  {reservationForm.appointment_date ||
                                    "Fecha pendiente"}{" "}
                                  ·{" "}
                                  {reservationForm.appointment_time ||
                                    "Hora pendiente"}
                                </p>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="vm-reservation-submit"
                              disabled={
                                !reservationForm.pet_id ||
                                !reservationForm.veterinary_id ||
                                !reservationForm.service ||
                                !reservationForm.appointment_date ||
                                !reservationForm.appointment_time
                              }
                            >
                              Revisar y confirmar reserva
                            </button>
                          </>
                        )}
                      </form>

                      <aside className="vm-reservation-side">
                        <div className="vm-reservation-side-icon">
                          🐾
                        </div>

                        <h3>Agenda VetMap</h3>

                        <p>
                          El backend verifica nuevamente el horario antes de guardar
                          la reserva para evitar duplicados.
                        </p>

                        <div className="vm-reservation-info-list">
                          <span>✓ Servicios según veterinaria</span>
                          <span>✓ Horarios disponibles en tiempo real</span>
                          <span>✓ Horas ocupadas bloqueadas</span>
                          <span>✓ Confirmación antes de agendar</span>
                        </div>

                        {nextOwnerReservation() && (
                          <div className="vm-next-reservation-mini">
                            <small>Próxima atención</small>

                            <strong>
                              {
                                nextOwnerReservation()
                                  .veterinary_name
                              }
                            </strong>

                            <span>
                              📅{" "}
                              {formatDate(
                                nextOwnerReservation()
                                  .appointment_date
                              )}{" "}
                              ·{" "}
                              {String(
                                nextOwnerReservation()
                                  .appointment_time
                              ).slice(0, 5)}
                            </span>

                            <span>
                              🐾{" "}
                              {
                                nextOwnerReservation()
                                  .pet_name
                              }{" "}
                              ·{" "}
                              {
                                nextOwnerReservation()
                                  .service
                              }
                            </span>
                          </div>
                        )}
                      </aside>
                    </div>
                  )}

                  {reservationConfirmOpen && (
                    <div
                      className="vm-booking-confirm-overlay"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Confirmar reserva"
                      onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                          setReservationConfirmOpen(false);
                        }
                      }}
                    >
                      <section
                        className="vm-booking-confirm-modal"
                        onMouseDown={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <div className="vm-booking-confirm-icon">
                          📅
                        </div>

                        <p className="vm-kicker">
                          Confirmación final
                        </p>

                        <h3>
                          ¿Agendar esta hora?
                        </h3>

                        <p className="vm-booking-confirm-copy">
                          Revisa los datos antes de registrar la reserva.
                        </p>

                        <div className="vm-booking-confirm-details">
                          <div>
                            <small>Mascota</small>
                            <strong>
                              {selectedReservationPet()?.name}
                            </strong>
                          </div>

                          <div>
                            <small>Veterinaria</small>
                            <strong>
                              {selectedReservationClinic()?.name}
                            </strong>
                          </div>

                          <div>
                            <small>Servicio</small>
                            <strong>
                              {reservationForm.service}
                            </strong>
                          </div>

                          <div>
                            <small>Fecha</small>
                            <strong>
                              {reservationForm.appointment_date
                                ? formatDate(
                                    reservationForm.appointment_date
                                  )
                                : ""}
                            </strong>
                          </div>

                          <div>
                            <small>Hora</small>
                            <strong>
                              {reservationForm.appointment_time}
                            </strong>
                          </div>

                          <div>
                            <small>Observación</small>
                            <strong>
                              {reservationForm.notes ||
                                "Sin observación"}
                            </strong>
                          </div>
                        </div>

                        <div className="vm-booking-confirm-actions">
                          <button
                            type="button"
                            className="vm-secondary"
                            onClick={() =>
                              setReservationConfirmOpen(false)
                            }
                          >
                            Volver y editar
                          </button>

                          <button
                            type="button"
                            className="vm-primary"
                            onClick={saveReservation}
                          >
                            Sí, agendar hora
                          </button>
                        </div>
                      </section>
                    </div>
                  )}

                  <section className="vm-reservations-history">
                    <div className="vm-reservations-history-heading">
                      <div>
                        <h3>
                          {currentUser.role === "admin"
                            ? "Todas las reservas"
                            : "Mis reservas"}
                        </h3>

                        <p>
                          {reservations.length} reserva
                          {reservations.length === 1 ? "" : "s"} registrada
                          {reservations.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div className="vm-history-clean-actions">
                        {reservations.some(
                          (reservation) =>
                            reservation.status === "completed" ||
                            reservation.status === "cancelled"
                        ) && (
                          <button
                            type="button"
                            className="vm-clean-history-button"
                            onClick={
                              currentUser.role === "admin"
                                ? cleanAllAdminFinalReservations
                                : cleanAllOwnerFinalReservations
                            }
                          >
                            🧹 Limpiar finalizadas
                          </button>
                        )}

                        <button
                          type="button"
                          className="vm-secondary"
                          onClick={() =>
                            loadReservationData()
                          }
                        >
                          Actualizar
                        </button>
                      </div>
                    </div>

                    {reservations.length === 0 ? (
                      <div className="vm-no-reservations">
                        <span>📅</span>
                        <h4>Aún no hay reservas</h4>

                        <p>
                          {currentUser.role === "admin"
                            ? "Las reservas creadas por los usuarios aparecerán aquí."
                            : "Completa el formulario para registrar tu primera reserva."}
                        </p>
                      </div>
                    ) : (
                      <div className="vm-reservation-list">
                        {reservations.map((reservation) => (
                          <article
                            key={reservation.id}
                            className="vm-reservation-card"
                          >
                            <div className="vm-reservation-card-top">
                              <div>
                                <span className="vm-reservation-pet">
                                  {getPetEmoji(reservation.pet_species)}
                                </span>

                                <div>
                                  <h4>{reservation.pet_name}</h4>

                                  <p>{reservation.service}</p>
                                </div>
                              </div>

                              <span
                                className={`vm-status-badge ${reservationStatusClass(
                                  reservation.status
                                )}`}
                              >
                                {reservationStatusLabel(reservation.status)}
                              </span>
                            </div>

                            <div className="vm-reservation-details">
                              {currentUser.role === "admin" && (
                                <div>
                                  <small>Usuario</small>
                                  <strong>{reservation.user_name}</strong>
                                  <span>{reservation.user_email}</span>
                                </div>
                              )}

                              <div>
                                <small>Veterinaria</small>
                                <strong>{reservation.veterinary_name}</strong>
                                <span>{reservation.veterinary_commune}</span>
                              </div>

                              <div>
                                <small>Fecha</small>
                                <strong>
                                  {formatDate(reservation.appointment_date)}
                                </strong>
                                <span>
                                  {String(reservation.appointment_time).slice(0, 5)}
                                </span>
                              </div>

                              <div>
                                <small>Observación</small>
                                <strong>
                                  {reservation.notes || "Sin observación"}
                                </strong>
                              </div>
                            </div>

                            <div className="vm-reservation-report-action">
                              <button
                                type="button"
                                className="vm-download-clinical-report-button vm-download-clinical-report-button--owner"
                                disabled={
                                  downloadingClinicalReportId ===
                                  reservation.id
                                }
                                onClick={() =>
                                  downloadClinicalReport(
                                    reservation
                                  )
                                }
                              >
                                {downloadingClinicalReportId ===
                                reservation.id
                                  ? "Generando PDF..."
                                  : reservation.status ===
                                      "completed"
                                  ? "📄 Descargar informe de atención"
                                  : "📄 Descargar comprobante / informe"}
                              </button>
                            </div>

                            {currentUser.role === "admin" ? (
                              <div className="vm-admin-reservation-actions">
                                {reservation.status ===
                                  "completed" ||
                                reservation.status ===
                                  "cancelled" ? (
                                  <>
                                    <span className="vm-admin-final-state">
                                      🔒 Estado final · no editable
                                    </span>

                                    <button
                                      type="button"
                                      className="vm-clean-reservation"
                                      onClick={() =>
                                        cleanAdminReservation(
                                          reservation.id
                                        )
                                      }
                                    >
                                      🧹 Quitar del historial
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <span>
                                      Cambiar estado:
                                    </span>

                                    <select
                                      value={
                                        reservation.status
                                      }
                                      onChange={(e) =>
                                        changeReservationStatus(
                                          reservation.id,
                                          e.target.value,
                                          reservation.status
                                        )
                                      }
                                    >
                                      <option value="pending">
                                        Pendiente
                                      </option>
                                      <option value="confirmed">
                                        Confirmada
                                      </option>
                                      <option value="completed">
                                        Completada
                                      </option>
                                      <option value="cancelled">
                                        Cancelada
                                      </option>
                                    </select>
                                  </>
                                )}
                              </div>
                            ) : reservation.status ===
                                "cancelled" ||
                              reservation.status ===
                                "completed" ? (
                              <button
                                type="button"
                                className="vm-clean-reservation"
                                onClick={() =>
                                  cleanOwnerReservation(
                                    reservation.id
                                  )
                                }
                              >
                                🧹 Quitar del historial
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="vm-cancel-reservation"
                                onClick={() =>
                                  cancelMyReservation(
                                    reservation.id
                                  )
                                }
                              >
                                Cancelar reserva
                              </button>
                            )}
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                </section>
              )}

              {memberSection === "cuenta" && (
                <>
                  {accountMode === "profile" && (
                  <section className="vm-my-profile">
                  <div className="vm-my-profile-heading">
                    <div>
                      <p className="vm-kicker">Cuenta personal</p>
                      <h2>{currentUser.role === "store" ? "Mi cuenta" : (["owner", "vet"].includes(currentUser.role) ? "Mi cuenta" : "👤 Mi cuenta")}</h2>
                      <p>
                        Aquí administras únicamente tus datos personales,
                        seguridad y preferencias de acceso.
                      </p>
                    </div>

                    <div className="vm-my-profile-heading-actions">
                      <button
                        type="button"
                        className="vm-primary"
                        onClick={() => {
                          loadProfileForm(currentUser);
                          setShowProfileEdit(!showProfileEdit);
                        }}
                      >
                        {showProfileEdit ? "Cerrar edición" : "Editar perfil"}
                      </button>

                    </div>
                  </div>

                  {!showProfileEdit ? (
                    <div className="vm-profile-summary-grid">
                      <div className="vm-profile-summary-card">
                        {currentUser.role !== "vet" && (<span aria-hidden="true">{currentUser.role === "owner" ? <UserRound className="vm-owner-v27-profile-glyph" size={21} strokeWidth={2} /> : "👤"}</span>)}
                        <small>Nombre</small>
                        <strong>{currentUser.name}</strong>
                      </div>

                      <div className="vm-profile-summary-card">
                        {currentUser.role !== "vet" && (<span aria-hidden="true">{currentUser.role === "owner" ? <Mail className="vm-owner-v27-profile-glyph" size={21} strokeWidth={2} /> : "✉️"}</span>)}
                        <small>Correo</small>
                        <strong>{currentUser.email}</strong>
                      </div>

                      <div className="vm-profile-summary-card vm-role-readonly">
                        {currentUser.role !== "vet" && (<span aria-hidden="true">{currentUser.role === "owner" ? <LockKeyhole className="vm-owner-v27-profile-glyph" size={21} strokeWidth={2} /> : "🔒"}</span>)}
                        <small>Rol de la cuenta</small>
                        <strong>{roleLabel(currentUser.role)}</strong>
                        <em>No editable por el usuario</em>
                      </div>

                      <div className="vm-profile-summary-card">
                        {currentUser.role !== "vet" && (<span aria-hidden="true">{currentUser.role === "owner" ? <IdCard className="vm-owner-v27-profile-glyph" size={21} strokeWidth={2} /> : "🪪"}</span>)}
                        <small>RUT</small>
                        <strong>{currentUser.rut || "No registrado"}</strong>
                      </div>

                      <div className="vm-profile-summary-card">
                        {currentUser.role !== "vet" && (<span aria-hidden="true">{currentUser.role === "owner" ? <MapPin className="vm-owner-v27-profile-glyph" size={21} strokeWidth={2} /> : "🌎"}</span>)}
                        <small>Ubicación</small>
                        <strong>
                          {[
                            currentUser.country,
                            currentUser.region,
                            currentUser.city,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "No registrada"}
                        </strong>
                      </div>

                      <div className="vm-profile-summary-card">
                        {currentUser.role !== "vet" && (<span aria-hidden="true">{currentUser.role === "owner" ? <CalendarDays className="vm-owner-v27-profile-glyph" size={21} strokeWidth={2} /> : "🎂"}</span>)}
                        <small>Fecha de nacimiento</small>
                        <strong>
                          {currentUser.birth_date
                            ? formatDate(currentUser.birth_date)
                            : currentUser.birth_year
                            ? `Solo año registrado: ${currentUser.birth_year}`
                            : "No registrada"}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={saveMyProfile}
                      className="vm-profile-edit-form"
                    >
                      <div className="vm-form-grid">
                        <label className="vm-field">
                          <span>Nombre completo</span>
                          <input
                            value={profileForm.name}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-field">
                          <span>Correo electrónico</span>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-field">
                          <span>RUT</span>
                          <input
                            value={profileForm.rut}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                rut: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-field">
                          <span>Fecha de nacimiento</span>
                          <input
                            type="date"
                            max={new Date().toISOString().slice(0, 10)}
                            value={profileForm.birth_date}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                birth_date: e.target.value,
                              })
                            }
                          />

                          {!currentUser.birth_date &&
                            currentUser.birth_year && (
                              <small className="vm-legacy-date">
                                Tu cuenta antigua solo tiene registrado el año{" "}
                                {currentUser.birth_year}. Selecciona una fecha para
                                completar el dato.
                              </small>
                            )}
                        </label>

                        <LocationSelector
                          country={profileForm.country}
                          region={profileForm.region}
                          city={profileForm.city}
                          onChange={(location) =>
                            setProfileForm({
                              ...profileForm,
                              ...location,
                            })
                          }
                        />
                      </div>

                      <div className="vm-role-lock-box">
                        <div>
                          {currentUser.role !== "vet" && (<span>🔒</span>)}
                          <div>
                            <small>Rol de la cuenta</small>
                            <strong>{roleLabel(currentUser.role)}</strong>
                          </div>
                        </div>

                        <p>
                          Este campo no puede ser modificado desde tu perfil.
                        </p>
                      </div>

                      <div className="vm-profile-password-box">
                        <div>
                          <h3>Cambiar contraseña</h3>
                          <p>
                            Es opcional. Déjala vacía si quieres mantener la actual.
                          </p>
                        </div>

                        <div className="vm-form-grid">
                          <label className="vm-field">
                            <span>Nueva contraseña</span>
                            <input
                              type="password"
                              placeholder="Nueva contraseña"
                              value={profileForm.password}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  password: e.target.value,
                                })
                              }
                            />
                          </label>

                          <label className="vm-field">
                            <span>Confirmar nueva contraseña</span>
                            <input
                              type="password"
                              placeholder="Repite la nueva contraseña"
                              value={profileForm.confirm_password}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  confirm_password: e.target.value,
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <div className="vm-profile-form-actions">
                        <button type="submit" className="vm-primary">
                          Guardar cambios
                        </button>

                        <button
                          type="button"
                          className="vm-secondary"
                          onClick={() => {
                            loadProfileForm(currentUser);
                            setShowProfileEdit(false);
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </section>
                  )}

            {accountMode === "admin" && currentUser.role === "admin" ? (
              <>
                <section className="vmv10-management-heading">
                  <div>
                    <span>ADMINISTRACIÓN DE VETMAP</span>
                    <h1>{
                      adminActiveTab === "usuarios" ? "Gestión de usuarios"
                      : adminActiveTab === "productos" ? "Gestión de productos"
                      : adminActiveTab === "mascotas" ? "Gestión de mascotas"
                      : "Fichas y perfiles clínicos"
                    }</h1>
                    <p>Administra tus registros desde el panel, sin salir del diseño de VetMap.</p>
                  </div>
                  <button type="button" onClick={() => loadAdminData()}>Actualizar datos</button>
                </section>
                <section className="vm-admin-v10-legacy-summary rounded-2xl bg-white p-6 shadow">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Panel administrador
                      </h2>

                      <p className="text-slate-600">
                        Gestiona usuarios, mascotas, productos y perfil clínico desde un solo panel.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => loadAdminData()}
                      className="rounded border px-4 py-2"
                    >
                      Actualizar panel
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <div className="vm-admin-panel-stat rounded-xl border p-4">
                      <span className="vm-admin-panel-stat-icon">👥</span>
                      <div>
                        <p className="text-sm text-slate-500">Usuarios</p>
                        <p className="text-2xl font-bold">{adminUsers.length}</p>
                      </div>
                    </div>

                    <div className="vm-admin-panel-stat rounded-xl border p-4">
                      <span className="vm-admin-panel-stat-icon">🐾</span>
                      <div>
                        <p className="text-sm text-slate-500">Mascotas</p>
                        <p className="text-2xl font-bold">{adminPets.length}</p>
                      </div>
                    </div>

                    <div className="vm-admin-panel-stat rounded-xl border p-4">
                      <span className="vm-admin-panel-stat-icon">📦</span>
                      <div>
                        <p className="text-sm text-slate-500">Productos</p>
                        <p className="text-2xl font-bold">{adminProducts.length}</p>
                      </div>
                    </div>

                    <div className="vm-admin-panel-stat rounded-xl border p-4">
                      <span className="vm-admin-panel-stat-icon">🩺</span>
                      <div>
                        <p className="text-sm text-slate-500">Perfil clínico</p>
                        <p className="text-2xl font-bold">{selectedPet ? selectedPet.name : "Sin selección"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAdminActiveTab("usuarios")}
                      className={`rounded px-4 py-2 ${
                        adminActiveTab === "usuarios"
                          ? "bg-slate-900 text-white"
                          : "border"
                      }`}
                    >
                      <span className="vm-admin-panel-tab-emoji">👥</span>
                      Usuarios
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminActiveTab("mascotas")}
                      className={`rounded px-4 py-2 ${
                        adminActiveTab === "mascotas"
                          ? "bg-slate-900 text-white"
                          : "border"
                      }`}
                    >
                      <span className="vm-admin-panel-tab-emoji">🐾</span>
                      Mascotas
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminActiveTab("productos")}
                      className={`rounded px-4 py-2 ${
                        adminActiveTab === "productos"
                          ? "bg-slate-900 text-white"
                          : "border"
                      }`}
                    >
                      <span className="vm-admin-panel-tab-emoji">📦</span>
                      Productos
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminActiveTab("clinico")}
                      className={`rounded px-4 py-2 ${
                        adminActiveTab === "clinico"
                          ? "bg-slate-900 text-white"
                          : "border"
                      }`}
                    >
                      <span className="vm-admin-panel-tab-emoji">🩺</span>
                      Perfil clínico
                    </button>
                  </div>
                </section>

                {adminActiveTab === "usuarios" && (
                  <>
                {editingAdminUserId && (
                <section className="vmv12-editor vmv12-editor--user" aria-label="Editar usuario">
                  <div className="vmv12-editor-head">
                    <div>
                      <div className="vmv12-editor-kicker">GESTIÓN DE CUENTAS · EDICIÓN</div>
                      <h2>Editar usuario</h2>

                      <p className="text-slate-600">
                        Modifica los datos del usuario seleccionado. La contraseña es opcional.
                      </p>
                    </div>

                    {editingAdminUserId && (
                      <div className="rounded-xl border px-4 py-2 text-sm">
                        Editando ID: {editingAdminUserId}
                      </div>
                    )}
                  </div>

                  <button type="button" className="vmv12-back" onClick={clearAdminUserForm}>
                    ← Volver a usuarios
                  </button>
                  <form onSubmit={saveAdminUser} className="vmv12-editor-form vmv12-user-form grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="font-semibold">Nombre del usuario</label>
                      <input
                        className="rounded border p-2"
                        placeholder="Usuario"
                        value={adminUserForm.name}
                        onChange={(e) =>
                          setAdminUserForm({
                            ...adminUserForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="font-semibold">Correo electrónico</label>
                      <input
                        className="rounded border p-2"
                        placeholder="Correo electrónico"
                        type="email"
                        value={adminUserForm.email}
                        onChange={(e) =>
                          setAdminUserForm({
                            ...adminUserForm,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="font-semibold">
                        {editingAdminUserId ? "Nueva contraseña opcional" : "Contraseña"}
                      </label>
                      <input
                        className="rounded border p-2"
                        placeholder={
                          editingAdminUserId
                            ? "Dejar vacío para mantener la actual"
                            : "Ej: VetMap123"
                        }
                        type="password"
                        value={adminUserForm.password}
                        onChange={(e) =>
                          setAdminUserForm({
                            ...adminUserForm,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="font-semibold">Rol del usuario</label>
                      <select
                        className="rounded border p-2"
                        value={adminUserForm.role}
                        onChange={(e) =>
                          setAdminUserForm({
                            ...adminUserForm,
                            role: e.target.value,
                          })
                        }
                      >
                        <option value="owner">Dueño de mascota</option>
                        <option value="admin">Administrador</option>
                        <option value="vet">Veterinaria</option>
                        <option value="store">Tienda</option>
                      </select>


                      {adminUserForm.role === "vet" && (
                        <div className="grid gap-2">
                          <label className="font-semibold">
                            Clínica asignada
                          </label>

                          <select
                            className="rounded border p-2"
                            value={adminUserForm.veterinary_id}
                            onChange={(e) =>
                              setAdminUserForm({
                                ...adminUserForm,
                                veterinary_id: e.target.value,
                              })
                            }
                          >
                            <option value="">
                              Selecciona una clínica
                            </option>

                            {clinics.map((clinic) => (
                              <option
                                key={clinic.id}
                                value={clinic.id}
                              >
                                {clinic.name} · {clinic.commune}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {adminUserForm.role === "store" && (
                        <div className="grid gap-2">
                          <label className="font-semibold">Tienda asignada</label>
                          <select
                            className="rounded border p-2"
                            value={adminUserForm.store_id}
                            onChange={(e) =>
                              setAdminUserForm({
                                ...adminUserForm,
                                store_id: e.target.value,
                              })
                            }
                          >
                            <option value="">Selecciona una tienda</option>
                            {marketStores.map((store) => (
                              <option key={store.id} value={store.id}>
                                {store.name} · {store.commune}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <label className="font-semibold">RUT</label>
                      <input
                        className="rounded border p-2"
                        placeholder="RUT"
                        value={adminUserForm.rut}
                        onChange={(e) =>
                          setAdminUserForm({
                            ...adminUserForm,
                            rut: e.target.value,
                          })
                        }
                      />
                    </div>

                    <LocationSelector
                      country={adminUserForm.country}
                      region={adminUserForm.region}
                      city={adminUserForm.city}
                      adminStyle
                      onChange={(location) =>
                        setAdminUserForm({
                          ...adminUserForm,
                          ...location,
                        })
                      }
                    />

                    <div className="grid gap-2">
                      <label className="font-semibold">
                        Fecha de nacimiento
                      </label>

                      <input
                        className="rounded border p-2"
                        type="date"
                        max={new Date().toISOString().slice(0, 10)}
                        value={adminUserForm.birth_date}
                        onChange={(e) =>
                          setAdminUserForm({
                            ...adminUserForm,
                            birth_date: e.target.value,
                          })
                        }
                      />

                      {!adminUserForm.birth_date &&
                        adminUserForm.birth_year && (
                          <small className="vm-legacy-date">
                            Registro antiguo: solo estaba guardado el año{" "}
                            {adminUserForm.birth_year}.
                          </small>
                        )}
                    </div>

                    <div className="grid gap-2">
                      <label className="font-semibold">
                        Confirmar nueva contraseña
                      </label>

                      <input
                        className="rounded border p-2"
                        placeholder="Repite la nueva contraseña"
                        type="password"
                        value={adminUserForm.confirm_password}
                        onChange={(e) =>
                          setAdminUserForm({
                            ...adminUserForm,
                            confirm_password: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="vmv12-editor-actions col-span-full flex flex-wrap gap-2">
                      <button className="rounded bg-slate-900 px-4 py-2 text-white">
                        Guardar cambios
                      </button>

                      {editingAdminUserId && (
                        <button
                          type="button"
                          onClick={clearAdminUserForm}
                          className="rounded border px-4 py-2"
                        >
                          Cancelar edición
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => loadAdminData()}
                        className="rounded border px-4 py-2"
                      >
                        Actualizar panel
                      </button>
                    </div>
                  </form>
                </section>

                )}

                {!editingAdminUserId && (
                <section className="vm-admin-people-section">
                  <div className="vm-admin-section-heading">
                    <div>
                      <p className="vm-kicker">Gestión de cuentas</p>
                      <h2>Usuarios registrados</h2>
                      <p>
                        Revisa la información principal y abre el perfil completo
                        solo cuando lo necesites.
                      </p>
                    </div>

                    <span className="vm-admin-total-badge">
                      {adminUsers.length} usuarios
                    </span>
                  </div>

                  {adminUsers.length === 0 ? (
                    <div className="vm-empty-state">
                      <span>👥</span>
                      <p>No hay usuarios registrados.</p>
                    </div>
                  ) : (
                    <div className="vm-admin-user-grid">
                      {adminUsers.map((user) => (
                        <article
                          key={user.id}
                          className="vm-admin-user-card"
                        >
                          <div className="vm-admin-user-card-top">
                            <div className="vm-admin-user-avatar">
                              {userRoleEmoji(user.role)}
                            </div>

                            <div className="vm-admin-user-main">
                              <small>
                                {roleLabel(user.role)}
                              </small>
                              <h3>{user.name}</h3>
                              <p>{user.email}</p>
                            </div>

                            <span className="vm-admin-id-pill">
                              ID {user.id}
                            </span>
                          </div>

                          <div className="vm-admin-user-summary">
                            <span>
                              📍 {user.city || "Ciudad no registrada"}
                            </span>

                            <span>
                              🪪 {user.rut || "RUT no registrado"}
                            </span>

                            <span>
                              🐾 {adminUserPetCount(user.id)}{" "}
                              {adminUserPetCount(user.id) === 1
                                ? "mascota"
                                : "mascotas"}
                            </span>
                          </div>

                          <div className="vm-admin-card-actions">
                            <button
                              type="button"
                              className="view"
                              onClick={() =>
                                setSelectedAdminUser(user)
                              }
                            >
                              Ver perfil
                            </button>

                            <button
                              type="button"
                              className="edit"
                              onClick={() =>
                                startEditAdminUser(user)
                              }
                            >
                              Editar
                            </button>

                            {user.id !== currentUser.id && (
                              <button
                                type="button"
                                className="delete"
                                onClick={() =>
                                  removeAdminUser(user.id)
                                }
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
                )}
                  </>
                )}


                {adminActiveTab === "productos" && (
                  <section className="vm-admin-products-page">
                    <div className="vm-clinic-section-heading">
                      <div>
                        <p className="vm-kicker">
                          Administración
                        </p>
                        <h2>
                          Administrar productos
                        </h2>
                        <p>
                          Como administrador puedes agregar,
                          modificar y eliminar productos de
                          cualquier tienda.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="vm-secondary"
                        onClick={() => loadAdminData()}
                      >
                        Actualizar
                      </button>
                    </div>

                    <div className="vm-product-admin-summary">
                      <div>
                        <span>📦</span>
                        <div>
                          <small>
                            Productos del sistema
                          </small>
                          <strong>
                            {adminProducts.length}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <span>🏪</span>
                        <div>
                          <small>Tiendas</small>
                          <strong>
                            {marketStores.length}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div
                      className="vm-product-editor-card"
                    >
                      <div className="vm-product-editor-title">
                        <div>
                          <p className="vm-kicker">
                            {editingAdminProductId
                              ? "Modificación"
                              : "Nuevo producto"}
                          </p>

                          <h3>
                            {editingAdminProductId
                              ? "Modificar producto"
                              : "Agregar producto"}
                          </h3>
                        </div>

                        {editingAdminProductId && (
                          <button
                            type="button"
                            className="vm-secondary"
                            onClick={
                              clearAdminProductForm
                            }
                          >
                            Cancelar edición
                          </button>
                        )}
                      </div>

                      <form
                        id="admin-product-form"
                        className="vm-product-editor-grid vm-product-editor-grid--admin"
                        onSubmit={saveAdminProduct}
                      >
                        <label className="vm-field vm-product-store-field vm-product-field-store">
                          <span>Tienda</span>
                          <select
                            value={adminProductForm.store_id}
                            onChange={(e) =>
                              setAdminProductForm({
                                ...adminProductForm,
                                store_id: e.target.value,
                              })
                            }
                          >
                            <option value="">
                              Selecciona una tienda
                            </option>

                            {marketStores.map((store) => (
                              <option
                                key={store.id}
                                value={store.id}
                              >
                                {store.name} · {store.commune}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="vm-field vm-product-field-category">
                          <span>Categoría</span>
                          <select
                            value={adminProductForm.category}
                            onChange={(e) =>
                              setAdminProductForm({
                                ...adminProductForm,
                                category: e.target.value,
                              })
                            }
                          >
                            <option>Alimentos</option>
                            <option>Higiene</option>
                            <option>Accesorios</option>
                            <option>Snacks</option>
                            <option>Salud</option>
                            <option>Otros</option>
                          </select>
                        </label>

                        <label className="vm-field vm-product-preset-field vm-product-field-preset">
                          <span>Producto sugerido</span>
                          <select
                            key={adminProductForm.category}
                            defaultValue=""
                            onChange={(e) =>
                              applyAdminProductTemplate(
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Elegir producto de{" "}
                              {adminProductForm.category}
                            </option>

                            {productTemplatesForCategory(
                              adminProductForm.category
                            ).map((item) => (
                              <option
                                key={item.name}
                                value={item.name}
                              >
                                {item.name}
                              </option>
                            ))}
                          </select>

                          <small className="vm-product-field-help">
                            Opcional. VetMap completa varios
                            campos y luego puedes modificarlos.
                          </small>
                        </label>

                        <label className="vm-field vm-product-field-name">
                          <span>Nombre</span>
                          <input
                            placeholder="Nombre del producto"
                            value={adminProductForm.name}
                            onChange={(e) =>
                              setAdminProductForm({
                                ...adminProductForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-field vm-product-field-brand">
                          <span>Marca</span>
                          <input
                            placeholder="Marca"
                            value={adminProductForm.brand}
                            onChange={(e) =>
                              setAdminProductForm({
                                ...adminProductForm,
                                brand: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-field vm-product-field-animal">
                          <span>Mascota</span>
                          <select
                            value={adminProductForm.animal_type}
                            onChange={(e) =>
                              setAdminProductForm({
                                ...adminProductForm,
                                animal_type: e.target.value,
                              })
                            }
                          >
                            <option>Perros</option>
                            <option>Gatos</option>
                            <option>Perros y gatos</option>
                            <option>Conejos</option>
                            <option>Hámsteres</option>
                            <option>Cobayos</option>
                            <option>Hurones</option>
                            <option>Aves</option>
                            <option>Loros</option>
                            <option>Canarios</option>
                            <option>Periquitos</option>
                            <option>Agapornis</option>
                            <option>Gallinas</option>
                            <option>Patos</option>
                            <option>Peces</option>
                            <option>Tortugas</option>
                            <option>Iguanas</option>
                            <option>Geckos</option>
                            <option>Serpientes</option>
                            <option>Ranas</option>
                            <option>Ajolotes</option>
                            <option>Erizos</option>
                            <option>Chinchillas</option>
                            <option>Ratones</option>
                            <option>Ratas domésticas</option>
                            <option>Cerdos miniatura</option>
                            <option>Otros</option>
                          </select>
                        </label>

                        <label className="vm-field vm-product-field-format">
                          <span>Formato</span>
                          <input
                            list="admin-product-format-options"
                            placeholder="Ej. 15 kg"
                            value={adminProductForm.format}
                            onChange={(e) =>
                              setAdminProductForm({
                                ...adminProductForm,
                                format: e.target.value,
                              })
                            }
                          />

                          <datalist id="admin-product-format-options">
                            {productFormatsForCategory(
                              adminProductForm.category
                            ).map((format) => (
                              <option
                                key={format}
                                value={format}
                              />
                            ))}
                          </datalist>

                          <small className="vm-product-field-help">
                            Formatos sugeridos según categoría.
                            Puedes escribir otro.
                          </small>
                        </label>

                        <label className="vm-field vm-product-field-price">
                          <span>Precio CLP</span>
                          <input
                            type="number"
                            min={PRODUCT_PRICE_MIN}
                            max={PRODUCT_PRICE_MAX}
                            step="100"
                            placeholder="Ej. 12990"
                            value={adminProductForm.price}
                            onChange={(e) =>
                              setAdminProductForm({
                                ...adminProductForm,
                                price: e.target.value,
                              })
                            }
                          />

                          <small className="vm-product-field-help">
                            Mínimo $1.000 · Máximo
                            $1.000.000 CLP.
                          </small>
                        </label>

                        <label className="vm-field vm-product-field-stock">
                          <span>Stock</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Ej. 20"
                            value={adminProductForm.stock}
                            onChange={(e) =>
                              setAdminProductForm({
                                ...adminProductForm,
                                stock: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-field vm-product-description-field vm-product-field-description">
                          <span>Descripción</span>
                          <textarea
                            placeholder="Describe brevemente el producto"
                            value={adminProductForm.description}
                            onChange={(e) =>
                              setAdminProductForm({
                                ...adminProductForm,
                                description: e.target.value,
                              })
                            }
                          />
                        </label>

                        <div className="vm-product-save-row vm-product-field-save">
                          <button
                            type="submit"
                            className="vm-primary"
                          >
                            {editingAdminProductId
                              ? "Guardar modificación"
                              : "Agregar producto"}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="vm-my-products-section">
                      <div className="vm-product-list-heading">
                        <div>
                          <p className="vm-kicker">
                            Catálogo general
                          </p>
                          <h3>
                            Productos registrados
                          </h3>
                        </div>

                        <div className="vm-admin-visible-filters">
                          <label className="vm-products-search">
                            <span>🔎</span>
                            <input
                              placeholder="Buscar..."
                              value={
                                adminProductSearch
                              }
                              onChange={(e) =>
                                setAdminProductSearch(
                                  e.target.value
                                )
                              }
                            />
                          </label>

                          <select
                            value={
                              adminProductStoreFilter
                            }
                            onChange={(e) =>
                              setAdminProductStoreFilter(
                                e.target.value
                              )
                            }
                          >
                            <option value="all">
                              Todas las tiendas
                            </option>

                            {marketStores.map(
                              (store) => (
                                <option
                                  key={store.id}
                                  value={store.id}
                                >
                                  {store.name}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>

                      {filteredAdminProducts().length ===
                      0 ? (
                        <div className="vm-clinic-empty">
                          <span>📦</span>
                          <p>
                            No hay productos para mostrar.
                          </p>
                        </div>
                      ) : (
                        <div className="vm-manage-product-grid">
                          {filteredAdminProducts().map(
                            (product) => (
                              <article
                                key={product.id}
                                className="vm-manage-product-card"
                              >
                                <div className="vm-manage-product-top">
                                  <div className="vm-manage-product-icon">
                                    {productEmoji(
                                      product.category
                                    )}
                                  </div>

                                  <div>
                                    <small>
                                      {product.category}
                                    </small>
                                    <h4>
                                      {product.name}
                                    </h4>
                                    <p>
                                      {product.brand ||
                                        "Sin marca"}{" "}
                                      ·{" "}
                                      {product.format ||
                                        "Sin formato"}
                                    </p>
                                  </div>
                                </div>

                                <div className="vm-admin-product-store">
                                  🏪 {product.store_name}
                                  <span>
                                    📍{" "}
                                    {product.store_commune}
                                  </span>
                                </div>

                                <div className="vm-manage-product-values">
                                  <div>
                                    <small>Precio</small>
                                    <strong>
                                      {formatCLP(
                                        product.price
                                      )}
                                    </strong>
                                  </div>

                                  <div>
                                    <small>Stock</small>
                                    <strong>
                                      {product.stock}
                                    </strong>
                                  </div>
                                </div>

                                <div className="vm-manage-product-actions">
                                  <button
                                    type="button"
                                    className="edit"
                                    onClick={() =>
                                      startEditAdminProduct(
                                        product
                                      )
                                    }
                                  >
                                    ✏️ Modificar
                                  </button>

                                  <button
                                    type="button"
                                    className="delete"
                                    onClick={() =>
                                      removeAdminProduct(
                                        product
                                      )
                                    }
                                  >
                                    🗑️ Eliminar
                                  </button>
                                </div>
                              </article>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {adminActiveTab === "mascotas" && (
                <section className="vm-admin-people-section">
                  <div className="vm-admin-section-heading">
                    <div>
                      <p className="vm-kicker">Registro general</p>
                      <h2>Mascotas registradas</h2>
                      <p>
                        Visualiza las mascotas del sistema con su fotografía y abre
                        el perfil completo sin salir de esta sección.
                      </p>
                    </div>

                    <span className="vm-admin-total-badge">
                      {adminPets.length} mascotas
                    </span>
                  </div>

                  {adminPets.length === 0 ? (
                    <div className="vm-empty-state">
                      <span>🐾</span>
                      <p>No hay mascotas registradas.</p>
                    </div>
                  ) : (
                    <div className="vm-admin-pet-grid">
                      {adminPets.map((pet) => {
                        const owner = getOwnerById(pet.owner_id);

                        return (
                          <article
                            key={pet.id}
                            className="vm-admin-pet-card"
                          >
                            <div className="vm-admin-pet-photo">
                              {pet.photo_data ? (
                                <img
                                  src={pet.photo_data}
                                  alt={`Foto de ${pet.name}`}
                                />
                              ) : (
                                <span>
                                  {getPetEmoji(pet.species)}
                                </span>
                              )}
                            </div>

                            <div className="vm-admin-pet-card-body">
                              <div className="vm-admin-pet-title">
                                <div>
                                  <small>
                                    {pet.species}
                                    {pet.breed
                                      ? ` · ${pet.breed}`
                                      : ""}
                                  </small>

                                  <h3>{pet.name}</h3>
                                </div>

                                <span className="vm-admin-id-pill">
                                  ID {pet.id}
                                </span>
                              </div>

                              <div className="vm-admin-pet-summary">
                                <span>
                                  🎂 {formatAge(
                                    pet.age,
                                    pet.age_months
                                  )}
                                </span>

                                <span>
                                  ⚖️{" "}
                                  {pet.weight != null
                                    ? formatWeight(pet.weight)
                                    : "Sin peso"}
                                </span>

                                <span>
                                  👤{" "}
                                  {owner?.name ||
                                    `Usuario ID ${pet.owner_id}`}
                                </span>
                              </div>

                              <div className="vm-admin-card-actions">
                                <button
                                  type="button"
                                  className="view"
                                  onClick={() =>
                                    viewPetProfile(pet)
                                  }
                                >
                                  Ver perfil
                                </button>

                                <button
                                  type="button"
                                  className="edit"
                                  onClick={() => {
                                    startEditAdminPet(pet);
                                    setAdminActiveTab("clinico");
                                  }}
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  className="delete"
                                  onClick={() =>
                                    removeAdminPet(pet.id)
                                  }
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
                )}
              </>
            ) : accountMode === "pets" && currentUser.role === "owner" ? (
              <>
                <section className="vm-owner-pets-page">
                  {!showOwnerPetForm && (
                  <div className="vm-owner-section-title">
                    <div>
                      <p className="vm-kicker">Mascotas</p>
                      <h2>Mis mascotas</h2>
                      <p>
                        Registra, edita y revisa los datos generales de tus mascotas.
                      </p>
                    </div>

                    <div className="vm-owner-page-actions">
                      <button
                        type="button"
                        onClick={() => {
                          clearOwnerPetForm();
                          setShowOwnerPetForm(true);
                          window.setTimeout(() => {
                            document
                              .getElementById("vm-owner-pet-editor")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }, 80);
                        }}
                        className="vm-primary"
                      >
                        + Agregar mascota
                      </button>

                      <button
                        type="button"
                        onClick={() => loadOwnerPets()}
                        className="vm-secondary"
                      >
                        Actualizar
                      </button>
                    </div>
                  </div>
                  )}

                  {showOwnerPetForm && (
                    <div
                      id="vm-owner-pet-editor"
                      className="vm-owner-pet-editor-page"
                    >
                      <div className="vm-owner-pet-editor-topbar">
                        <button
                          type="button"
                          className="vm-owner-pet-editor-back"
                          onClick={() => {
                            clearOwnerPetForm();
                            setShowOwnerPetForm(false);
                            setMessage("");
                            window.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                          }}
                        >
                          ← Volver a mis mascotas
                        </button>

                        <div className="vm-owner-pet-editor-title">
                          <div className="vm-owner-pet-editor-title-icon">
                            {editingOwnerPetId ? "✏️" : "🐾"}
                          </div>

                          <div>
                            <p className="vm-kicker">
                              {editingOwnerPetId
                                ? "Editar mascota"
                                : "Nueva mascota"}
                            </p>

                            <h2>
                              {editingOwnerPetId
                                ? `Editar a ${
                                    ownerPetForm.name ||
                                    "tu mascota"
                                  }`
                                : "Registrar mascota"}
                            </h2>

                            <p>
                              {editingOwnerPetId
                                ? "Actualiza sus datos generales. Su historial clínico se mantiene sin cambios."
                                : "Completa sus datos generales para agregarla a VetMap."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {showOwnerPetForm && (
                    <form
                      onSubmit={saveOwnerPet}
                      className="vm-owner-pet-form vm-owner-pet-form--dedicated"
                    >
                      <div className="vm-pet-photo-editor">
                        <div className="vm-pet-photo-preview">
                          {ownerPetForm.photo_data ? (
                            <img
                              src={ownerPetForm.photo_data}
                              alt="Vista previa de mascota"
                            />
                          ) : (
                            <span>🐾</span>
                          )}
                        </div>

                        <label className="vm-photo-upload">
                          <span>Fotografía</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePetPhotoChange}
                          />
                          <small>Imagen JPG/PNG de máximo 2 MB</small>
                        </label>

                        {ownerPetForm.photo_data && (
                          <button
                            type="button"
                            className="vm-link-button"
                            onClick={() =>
                              setOwnerPetForm({
                                ...ownerPetForm,
                                photo_data: "",
                              })
                            }
                          >
                            Quitar fotografía
                          </button>
                        )}
                      </div>

                      <div className="vm-owner-pet-fields">
                        <div className="vm-form-grid">
                          <label className="vm-field">
                            <span>Nombre</span>
                            <input
                              placeholder="Ej: Max"
                              value={ownerPetForm.name}
                              onChange={(e) =>
                                setOwnerPetForm({
                                  ...ownerPetForm,
                                  name: e.target.value,
                                })
                              }
                            />
                          </label>

                          <label className="vm-field">
                            <span>Especie</span>

                            <select
                              value={ownerPetForm.species}
                              onChange={(e) =>
                                setOwnerPetForm({
                                  ...ownerPetForm,
                                  species: e.target.value,
                                  species_other:
                                    e.target.value === "Otro"
                                      ? ownerPetForm.species_other
                                      : "",
                                  breed: "",
                                  breed_other: "",
                                })
                              }
                            >
                              <option value="">
                                Selecciona una especie
                              </option>

                              {VETMAP_PET_SPECIES.map((species) => (
                                <option
                                  key={species}
                                  value={species}
                                >
                                  {getPetEmoji(species)} {species}
                                </option>
                              ))}
                            </select>

                            {ownerPetForm.species === "Otro" && (
                              <input
                                className="vm-pet-other-species"
                                placeholder="Escribe la especie de tu mascota"
                                value={ownerPetForm.species_other}
                                onChange={(e) =>
                                  setOwnerPetForm({
                                    ...ownerPetForm,
                                    species_other: e.target.value,
                                    breed: "",
                                    breed_other: "",
                                  })
                                }
                              />
                            )}
                          </label>

                          <label className="vm-field">
                            <span>
                              {breedFieldLabel(
                                effectiveOwnerSpecies()
                              )}
                            </span>

                            <select
                              value={ownerPetForm.breed}
                              disabled={
                                !effectiveOwnerSpecies() ||
                                ownerBreedsLoading
                              }
                              onChange={(e) =>
                                setOwnerPetForm({
                                  ...ownerPetForm,
                                  breed: e.target.value,
                                  breed_other:
                                    e.target.value === "__other__"
                                      ? ownerPetForm.breed_other
                                      : "",
                                })
                              }
                            >
                              <option value="">
                                {ownerBreedsLoading
                                  ? "Cargando opciones..."
                                  : effectiveOwnerSpecies()
                                  ? "Sin especificar"
                                  : "Primero selecciona una especie"}
                              </option>

                              {ownerBreedOptions.map((breed) => (
                                <option
                                  key={breed.id}
                                  value={breed.name}
                                >
                                  {breed.name}
                                </option>
                              ))}

                              {effectiveOwnerSpecies() && (
                                <option value="__other__">
                                  + Otra raza / variedad...
                                </option>
                              )}
                            </select>

                            {ownerPetForm.breed === "__other__" && (
                              <div className="vm-new-breed-field">
                                <input
                                  placeholder={breedPlaceholder(
                                    effectiveOwnerSpecies()
                                  )}
                                  value={ownerPetForm.breed_other}
                                  maxLength={100}
                                  onChange={(e) =>
                                    setOwnerPetForm({
                                      ...ownerPetForm,
                                      breed_other: e.target.value,
                                    })
                                  }
                                />

                                <small>
                                  Al guardar, esta opción quedará disponible
                                  para futuras mascotas de{" "}
                                  {effectiveOwnerSpecies()}.
                                </small>
                              </div>
                            )}
                          </label>

                          <label className="vm-field">
                            <span>Fecha de nacimiento</span>
                            <input
                              type="date"
                              value={ownerPetForm.birth_date}
                              onChange={(e) =>
                                setOwnerPetForm({
                                  ...ownerPetForm,
                                  birth_date: e.target.value,
                                })
                              }
                            />
                          </label>

                          <label className="vm-field">
                            <span>Edad en años</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="Años"
                              value={ownerPetForm.age}
                              onChange={(e) =>
                                setOwnerPetForm({
                                  ...ownerPetForm,
                                  age: e.target.value,
                                })
                              }
                            />
                          </label>

                          <label className="vm-field">
                            <span>Edad en meses</span>
                            <input
                              type="number"
                              min="0"
                              max="11"
                              placeholder="Meses"
                              value={ownerPetForm.age_months}
                              onChange={(e) =>
                                setOwnerPetForm({
                                  ...ownerPetForm,
                                  age_months: e.target.value,
                                })
                              }
                            />
                          </label>

                          <label className="vm-field">
                            <span>Peso actual (kg)</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="Ej: 18.4"
                              value={ownerPetForm.weight}
                              onChange={(e) =>
                                setOwnerPetForm({
                                  ...ownerPetForm,
                                  weight: e.target.value,
                                })
                              }
                            />
                          </label>

                          <label className="vm-field vm-field-full">
                            <span>Alimentación</span>
                            <textarea
                              placeholder="Ej: alimento premium adulto, 2 porciones al día..."
                              value={ownerPetForm.feeding_info}
                              onChange={(e) =>
                                setOwnerPetForm({
                                  ...ownerPetForm,
                                  feeding_info: e.target.value,
                                })
                              }
                            />
                          </label>

                          <label className="vm-field vm-field-full">
                            <span>Antecedentes médicos</span>
                            <textarea
                              placeholder="Alergias, cirugías previas u otros antecedentes..."
                              value={ownerPetForm.medical_background}
                              onChange={(e) =>
                                setOwnerPetForm({
                                  ...ownerPetForm,
                                  medical_background: e.target.value,
                                })
                              }
                            />
                          </label>

                          <label className="vm-field vm-field-full">
                            <span>Información adicional</span>
                            <textarea
                              placeholder="Información relevante de tu mascota..."
                              value={ownerPetForm.additional_info}
                              onChange={(e) =>
                                setOwnerPetForm({
                                  ...ownerPetForm,
                                  additional_info: e.target.value,
                                })
                              }
                            />
                          </label>
                        </div>

                        <div className="vm-owner-form-actions">
                          <button
                            type="submit"
                            className="vm-primary"
                          >
                            {editingOwnerPetId
                              ? "Guardar cambios"
                              : "Registrar mascota"}
                          </button>

                          <button
                            type="button"
                            onClick={clearOwnerPetForm}
                            className="vm-secondary"
                          >
                            Limpiar
                          </button>

                          {editingOwnerPetId && (
                            <button
                              type="button"
                              onClick={() => {
                                clearOwnerPetForm();
                                setShowOwnerPetForm(false);
                              }}
                              className="vm-secondary"
                            >
                              Volver sin guardar
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  )}

                  {!showOwnerPetForm && (
                    pets.length === 0 ? (
                    <div className="vm-owner-empty">
                      <span>🐾</span>
                      <h3>Aún no tienes mascotas registradas</h3>
                      <p>
                        Presiona “Agregar mascota” para registrar la primera.
                      </p>
                    </div>
                  ) : (
                    <div className="vm-owner-pets-grid">
                      {pets.map((pet) => (
                        <article
                          key={pet.id}
                          className="vm-owner-pet-card"
                        >
                          <div className="vm-owner-pet-card-photo">
                            {pet.photo_data ? (
                              <img
                                src={pet.photo_data}
                                alt={`Foto de ${pet.name}`}
                              />
                            ) : (
                              <span>{getPetEmoji(pet.species)}</span>
                            )}
                          </div>

                          <div className="vm-owner-pet-card-copy">
                            <h3>{pet.name}</h3>

                            <p>
                              {pet.species}
                              {pet.breed ? ` · ${pet.breed}` : ""}
                            </p>

                            <div className="vm-owner-pet-card-data">
                              <span>
                                🎂 {formatAge(pet.age, pet.age_months)}
                              </span>

                              <span>
                                ⚖️ {formatWeight(pet.weight)}
                              </span>
                            </div>

                            <div className="vm-owner-pet-card-actions">
                              <button
                                type="button"
                                onClick={() => viewPetProfile(pet)}
                                className="vm-primary"
                              >
                                Más información
                              </button>

                              <button
                                type="button"
                                onClick={() => startEditOwnerPet(pet)}
                                className="vm-secondary"
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )
                  )}
                </section>
              </>
            ) : null}

            {accountMode === "admin" && currentUser.role === "admin" && adminActiveTab === "clinico" && !selectedPet && !editingAdminPetId && (
              <section className="rounded-2xl bg-white p-6 shadow">
                <h2 className="text-xl font-semibold">Perfil clínico</h2>
                <p className="mt-2 text-slate-600">
                  Selecciona una mascota desde la pestaña Mascotas para revisar y administrar consultas, vacunas, medicamentos y recetas.
                </p>

                <button
                  type="button"
                  onClick={() => setAdminActiveTab("mascotas")}
                  className="mt-4 rounded bg-slate-900 px-4 py-2 text-white"
                >
                  Ir a mascotas
                </button>
              </section>
            )}

            {accountMode === "admin" && currentUser.role === "admin" && adminActiveTab === "clinico" && editingAdminPetId && (
              <section className="vmv12-editor vmv12-editor--pet" aria-label="Editar mascota">
                <div className="vmv12-editor-head">
                  <div>
                    <div className="vmv12-editor-kicker">REGISTRO DE MASCOTAS · EDICIÓN</div>
                    <h2>Editar mascota</h2>
                    <p>Actualiza su información general. Su ficha clínica y sus tratamientos siguen guardados.</p>
                  </div>
                  <span className="vmv12-editor-tag">Mascota ID {editingAdminPetId}</span>
                </div>
                <button type="button" className="vmv12-back" onClick={() => { clearAdminPetForm(); setAdminActiveTab("mascotas"); }}>
                  ← Volver a mascotas
                </button>

                <form onSubmit={saveAdminPet} className="vmv12-editor-form vmv12-pet-form">
                  <label className="vmv12-field">
                    <span>Nombre de la mascota</span>
                    <input type="text" placeholder="Nombre de la mascota" maxLength={100} required value={adminPetForm.name}
                      onChange={(e) => setAdminPetForm({ ...adminPetForm, name: e.target.value })} />
                  </label>

                  <label className="vmv12-field">
                    <span>Especie</span>
                    <select required value={adminPetForm.species}
                      onChange={(e) => setAdminPetForm({ ...adminPetForm, species: e.target.value,
                        species_other: e.target.value === "Otro" ? adminPetForm.species_other : "", breed: "", breed_other: "" })}>
                      <option value="">Selecciona especie</option>
                      {VETMAP_PET_SPECIES.map((species) => (
                        <option key={species} value={species}>{getPetEmoji(species)} {species}</option>
                      ))}
                    </select>
                  </label>

                  {adminPetForm.species === "Otro" && (
                    <label className="vmv12-field">
                      <span>Otra especie</span>
                      <input type="text" placeholder="Escribe la especie" maxLength={80} value={adminPetForm.species_other}
                        onChange={(e) => setAdminPetForm({ ...adminPetForm, species_other: e.target.value, breed: "", breed_other: "" })} />
                    </label>
                  )}

                  <label className="vmv12-field">
                    <span>{breedFieldLabel(effectiveAdminSpecies())}</span>
                    <select value={adminPetForm.breed} disabled={!effectiveAdminSpecies() || adminBreedsLoading}
                      onChange={(e) => setAdminPetForm({ ...adminPetForm, breed: e.target.value,
                        breed_other: e.target.value === "__other__" ? adminPetForm.breed_other : "" })}>
                      <option value="">{adminBreedsLoading ? "Cargando opciones..." : effectiveAdminSpecies() ? "Sin especificar" : "Primero selecciona especie"}</option>
                      {adminBreedOptions.map((breed) => <option key={breed.id} value={breed.name}>{breed.name}</option>)}
                      {effectiveAdminSpecies() && <option value="__other__">+ Otra raza / variedad...</option>}
                    </select>
                  </label>

                  {adminPetForm.breed === "__other__" && (
                    <label className="vmv12-field">
                      <span>Nueva raza o variedad</span>
                      <input type="text" placeholder={breedPlaceholder(effectiveAdminSpecies())} maxLength={100} value={adminPetForm.breed_other}
                        onChange={(e) => setAdminPetForm({ ...adminPetForm, breed_other: e.target.value })} />
                    </label>
                  )}

                  <label className="vmv12-field">
                    <span>Edad en años</span>
                    <input type="number" min="0" max="100" step="1" placeholder="Ej. 3" value={adminPetForm.age}
                      onChange={(e) => setAdminPetForm({ ...adminPetForm, age: e.target.value })} />
                  </label>
                  <label className="vmv12-field">
                    <span>Meses adicionales</span>
                    <input type="number" min="0" max="11" step="1" placeholder="De 0 a 11" value={adminPetForm.age_months}
                      onChange={(e) => setAdminPetForm({ ...adminPetForm, age_months: e.target.value })} />
                  </label>
                  <label className="vmv12-field">
                    <span>Peso en kilogramos</span>
                    <input type="number" min="0" step="0.01" placeholder="Ej. 8,5" value={adminPetForm.weight}
                      onChange={(e) => setAdminPetForm({ ...adminPetForm, weight: e.target.value })} />
                  </label>

                  <div className="vmv12-editor-note">
                    <strong>Importante:</strong> aquí editas los datos generales. Para revisar vacunas, consultas y recetas, abre «Ver perfil» desde el listado de mascotas.
                  </div>
                  <div className="vmv12-editor-actions">
                    <button type="submit" className="vmv12-save">Guardar cambios</button>
                    <button type="button" className="vmv12-cancel" onClick={() => { clearAdminPetForm(); setAdminActiveTab("mascotas"); }}>Cancelar y volver</button>
                  </div>
                </form>

                {false && (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <form onSubmit={saveOwnerVaccine} className="rounded-xl border p-4">
                      <h3 className="font-semibold">
                        {editingOwnerVaccineId ? "Editar vacuna" : "Agregar vacuna"}
                      </h3>

                      <input
                        className="mt-3 w-full rounded border p-2"
                        placeholder="Nombre de la vacuna"
                        value={ownerVaccineForm.name}
                        onChange={(e) =>
                          setOwnerVaccineForm({
                            ...ownerVaccineForm,
                            name: e.target.value,
                          })
                        }
                      />

                      <input
                        className="mt-3 w-full rounded border p-2"
                        type="date"
                        value={ownerVaccineForm.application_date}
                        onChange={(e) =>
                          setOwnerVaccineForm({
                            ...ownerVaccineForm,
                            application_date: e.target.value,
                          })
                        }
                      />

                      <input
                        className="mt-3 w-full rounded border p-2"
                        type="date"
                        value={ownerVaccineForm.next_dose_date}
                        onChange={(e) =>
                          setOwnerVaccineForm({
                            ...ownerVaccineForm,
                            next_dose_date: e.target.value,
                          })
                        }
                      />

                      <input
                        className="mt-3 w-full rounded border p-2"
                        placeholder="Observación"
                        value={ownerVaccineForm.observation}
                        onChange={(e) =>
                          setOwnerVaccineForm({
                            ...ownerVaccineForm,
                            observation: e.target.value,
                          })
                        }
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="rounded bg-slate-900 px-4 py-2 text-white">
                          {editingOwnerVaccineId ? "Actualizar vacuna" : "Agregar vacuna"}
                        </button>

                        {editingOwnerVaccineId && (
                          <button
                            type="button"
                            onClick={clearOwnerVaccineForm}
                            className="rounded border px-4 py-2"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </form>

                    <form onSubmit={saveOwnerMedication} className="rounded-xl border p-4">
                      <h3 className="font-semibold">
                        {editingOwnerMedicationId ? "Editar medicamento" : "Agregar medicamento"}
                      </h3>

                      <input
                        className="mt-3 w-full rounded border p-2"
                        placeholder="Nombre del medicamento"
                        value={ownerMedicationForm.name}
                        onChange={(e) =>
                          setOwnerMedicationForm({
                            ...ownerMedicationForm,
                            name: e.target.value,
                          })
                        }
                      />

                      <input
                        className="mt-3 w-full rounded border p-2"
                        placeholder="Dosis"
                        value={ownerMedicationForm.dose}
                        onChange={(e) =>
                          setOwnerMedicationForm({
                            ...ownerMedicationForm,
                            dose: e.target.value,
                          })
                        }
                      />

                      <input
                        className="mt-3 w-full rounded border p-2"
                        placeholder="Frecuencia"
                        value={ownerMedicationForm.frequency}
                        onChange={(e) =>
                          setOwnerMedicationForm({
                            ...ownerMedicationForm,
                            frequency: e.target.value,
                          })
                        }
                      />

                      <input
                        className="mt-3 w-full rounded border p-2"
                        type="date"
                        value={ownerMedicationForm.start_date}
                        onChange={(e) =>
                          setOwnerMedicationForm({
                            ...ownerMedicationForm,
                            start_date: e.target.value,
                          })
                        }
                      />

                      <input
                        className="mt-3 w-full rounded border p-2"
                        type="date"
                        value={ownerMedicationForm.end_date}
                        onChange={(e) =>
                          setOwnerMedicationForm({
                            ...ownerMedicationForm,
                            end_date: e.target.value,
                          })
                        }
                      />

                      <input
                        className="mt-3 w-full rounded border p-2"
                        placeholder="Observación"
                        value={ownerMedicationForm.observation}
                        onChange={(e) =>
                          setOwnerMedicationForm({
                            ...ownerMedicationForm,
                            observation: e.target.value,
                          })
                        }
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="rounded bg-slate-900 px-4 py-2 text-white">
                          {editingOwnerMedicationId ? "Actualizar medicamento" : "Agregar medicamento"}
                        </button>

                        {editingOwnerMedicationId && (
                          <button
                            type="button"
                            onClick={clearOwnerMedicationForm}
                            className="rounded border px-4 py-2"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </form>

                    <form onSubmit={saveOwnerConsultation} className="rounded-xl border p-4 md:col-span-2">
                      <h3 className="font-semibold">
                        {editingOwnerConsultationId ? "Editar consulta" : "Agregar consulta"}
                      </h3>

                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <input
                          className="rounded border p-2"
                          type="date"
                          value={ownerConsultationForm.consultation_date}
                          onChange={(e) =>
                            setOwnerConsultationForm({
                              ...ownerConsultationForm,
                              consultation_date: e.target.value,
                            })
                          }
                        />

                        <input
                          className="rounded border p-2"
                          placeholder="Motivo de consulta"
                          value={ownerConsultationForm.reason}
                          onChange={(e) =>
                            setOwnerConsultationForm({
                              ...ownerConsultationForm,
                              reason: e.target.value,
                            })
                          }
                        />

                        <input
                          className="rounded border p-2"
                          placeholder="Diagnóstico"
                          value={ownerConsultationForm.diagnosis}
                          onChange={(e) =>
                            setOwnerConsultationForm({
                              ...ownerConsultationForm,
                              diagnosis: e.target.value,
                            })
                          }
                        />

                        <input
                          className="rounded border p-2"
                          placeholder="Tratamiento"
                          value={ownerConsultationForm.treatment}
                          onChange={(e) =>
                            setOwnerConsultationForm({
                              ...ownerConsultationForm,
                              treatment: e.target.value,
                            })
                          }
                        />

                        <input
                          className="rounded border p-2"
                          placeholder="Veterinario"
                          value={ownerConsultationForm.veterinarian}
                          onChange={(e) =>
                            setOwnerConsultationForm({
                              ...ownerConsultationForm,
                              veterinarian: e.target.value,
                            })
                          }
                        />

                        <input
                          className="rounded border p-2"
                          placeholder="Observación"
                          value={ownerConsultationForm.observation}
                          onChange={(e) =>
                            setOwnerConsultationForm({
                              ...ownerConsultationForm,
                              observation: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="rounded bg-slate-900 px-4 py-2 text-white">
                          {editingOwnerConsultationId ? "Actualizar consulta" : "Agregar consulta"}
                        </button>

                        {editingOwnerConsultationId && (
                          <button
                            type="button"
                            onClick={clearOwnerConsultationForm}
                            className="rounded border px-4 py-2"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <form onSubmit={saveAdminVaccine} className="rounded-xl border p-4">
                    <h3 className="font-semibold">
                      {editingVaccineId ? "Editar vacuna" : "Agregar vacuna"}
                    </h3>

                    <input
                      className="mt-3 rounded border p-2"
                      placeholder="Nombre de la vacuna"
                      value={adminVaccineForm.name}
                      onChange={(e) =>
                        setAdminVaccineForm({
                          ...adminVaccineForm,
                          name: e.target.value,
                        })
                      }
                    />

                    <input
                      className="mt-3 rounded border p-2"
                      type="date"
                      value={adminVaccineForm.application_date}
                      onChange={(e) =>
                        setAdminVaccineForm({
                          ...adminVaccineForm,
                          application_date: e.target.value,
                        })
                      }
                    />

                    <input
                      className="mt-3 rounded border p-2"
                      type="date"
                      value={adminVaccineForm.next_dose_date}
                      onChange={(e) =>
                        setAdminVaccineForm({
                          ...adminVaccineForm,
                          next_dose_date: e.target.value,
                        })
                      }
                    />

                    <input
                      className="mt-3 rounded border p-2"
                      placeholder="Observación"
                      value={adminVaccineForm.observation}
                      onChange={(e) =>
                        setAdminVaccineForm({
                          ...adminVaccineForm,
                          observation: e.target.value,
                        })
                      }
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="rounded bg-slate-900 px-4 py-2 text-white">
                        {editingVaccineId ? "Actualizar vacuna" : "Agregar vacuna"}
                      </button>

                      {editingVaccineId && (
                        <button
                          type="button"
                          onClick={clearAdminVaccineForm}
                          className="rounded border px-4 py-2"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  <form onSubmit={saveAdminMedication} className="rounded-xl border p-4">
                    <h3 className="font-semibold">
                      {editingMedicationId ? "Editar medicamento" : "Agregar medicamento"}
                    </h3>

                    <input
                      className="mt-3 rounded border p-2"
                      placeholder="Nombre del medicamento"
                      value={adminMedicationForm.name}
                      onChange={(e) =>
                        setAdminMedicationForm({
                          ...adminMedicationForm,
                          name: e.target.value,
                        })
                      }
                    />

                    <input
                      className="mt-3 rounded border p-2"
                      placeholder="Dosis"
                      value={adminMedicationForm.dose}
                      onChange={(e) =>
                        setAdminMedicationForm({
                          ...adminMedicationForm,
                          dose: e.target.value,
                        })
                      }
                    />

                    <input
                      className="mt-3 rounded border p-2"
                      placeholder="Frecuencia"
                      value={adminMedicationForm.frequency}
                      onChange={(e) =>
                        setAdminMedicationForm({
                          ...adminMedicationForm,
                          frequency: e.target.value,
                        })
                      }
                    />

                    <input
                      className="mt-3 rounded border p-2"
                      type="date"
                      value={adminMedicationForm.start_date}
                      onChange={(e) =>
                        setAdminMedicationForm({
                          ...adminMedicationForm,
                          start_date: e.target.value,
                        })
                      }
                    />

                    <input
                      className="mt-3 rounded border p-2"
                      type="date"
                      value={adminMedicationForm.end_date}
                      onChange={(e) =>
                        setAdminMedicationForm({
                          ...adminMedicationForm,
                          end_date: e.target.value,
                        })
                      }
                    />

                    <input
                      className="mt-3 rounded border p-2"
                      placeholder="Observación"
                      value={adminMedicationForm.observation}
                      onChange={(e) =>
                        setAdminMedicationForm({
                          ...adminMedicationForm,
                          observation: e.target.value,
                        })
                      }
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="rounded bg-slate-900 px-4 py-2 text-white">
                        {editingMedicationId ? "Actualizar medicamento" : "Agregar medicamento"}
                      </button>

                      {editingMedicationId && (
                        <button
                          type="button"
                          onClick={clearAdminMedicationForm}
                          className="rounded border px-4 py-2"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  <form onSubmit={saveAdminConsultation} className="rounded-xl border p-4 md:col-span-2">
                    <h3 className="font-semibold">
                      {editingConsultationId ? "Editar consulta" : "Agregar consulta"}
                    </h3>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded border p-2"
                        type="date"
                        value={adminConsultationForm.consultation_date}
                        onChange={(e) =>
                          setAdminConsultationForm({
                            ...adminConsultationForm,
                            consultation_date: e.target.value,
                          })
                        }
                      />

                      <input
                        className="rounded border p-2"
                        placeholder="Motivo de consulta"
                        value={adminConsultationForm.reason}
                        onChange={(e) =>
                          setAdminConsultationForm({
                            ...adminConsultationForm,
                            reason: e.target.value,
                          })
                        }
                      />

                      <input
                        className="rounded border p-2"
                        placeholder="Diagnóstico"
                        value={adminConsultationForm.diagnosis}
                        onChange={(e) =>
                          setAdminConsultationForm({
                            ...adminConsultationForm,
                            diagnosis: e.target.value,
                          })
                        }
                      />

                      <input
                        className="rounded border p-2"
                        placeholder="Tratamiento"
                        value={adminConsultationForm.treatment}
                        onChange={(e) =>
                          setAdminConsultationForm({
                            ...adminConsultationForm,
                            treatment: e.target.value,
                          })
                        }
                      />

                      <input
                        className="rounded border p-2"
                        placeholder="Veterinario"
                        value={adminConsultationForm.veterinarian}
                        onChange={(e) =>
                          setAdminConsultationForm({
                            ...adminConsultationForm,
                            veterinarian: e.target.value,
                          })
                        }
                      />

                      <input
                        className="rounded border p-2"
                        placeholder="Observación"
                        value={adminConsultationForm.observation}
                        onChange={(e) =>
                          setAdminConsultationForm({
                            ...adminConsultationForm,
                            observation: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="rounded bg-slate-900 px-4 py-2 text-white">
                        {editingConsultationId ? "Actualizar consulta" : "Agregar consulta"}
                      </button>

                      {editingConsultationId && (
                        <button
                          type="button"
                          onClick={clearAdminConsultationForm}
                          className="rounded border px-4 py-2"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </section>
            )}

            {currentUser.role === "admin" &&
              selectedPet &&
              adminClinicalEditor && (
                <div
                  className="vm-admin-clinical-editor-overlay"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Editor clínico administrador"
                  onMouseDown={(e) => {
                    if (
                      e.target === e.currentTarget
                    ) {
                      closeAdminClinicalEditor();
                    }
                  }}
                >
                  <section
                    className="vm-admin-clinical-editor"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <div className="vm-clinic-action-header">
                      <div className="vm-clinic-action-patient">
                        <div className="vm-clinic-action-patient-icon">
                          {getPetEmoji(
                            selectedPet.species
                          )}
                        </div>

                        <div>
                          <p className="vm-kicker">
                            Administración clínica
                          </p>
                          <h3>{selectedPet.name}</h3>
                          <span>
                            {selectedPet.species}
                            {selectedPet.breed
                              ? ` · ${selectedPet.breed}`
                              : ""}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="vm-clinic-action-close"
                        onClick={
                          closeAdminClinicalEditor
                        }
                        aria-label="Cerrar"
                      >
                        ×
                      </button>
                    </div>

                    <div className="vm-clinic-action-tabs">
                      <button
                        type="button"
                        className={
                          adminClinicalEditor ===
                          "consultation"
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          openAdminClinicalEditor(
                            "consultation"
                          )
                        }
                      >
                        🩺 Consulta
                      </button>

                      <button
                        type="button"
                        className={
                          adminClinicalEditor ===
                          "vaccine"
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          openAdminClinicalEditor(
                            "vaccine"
                          )
                        }
                      >
                        💉 Vacuna
                      </button>

                      <button
                        type="button"
                        className={
                          adminClinicalEditor ===
                          "medication"
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          openAdminClinicalEditor(
                            "medication"
                          )
                        }
                      >
                        💊 Medicamento
                      </button>

                      <button
                        type="button"
                        className={
                          adminClinicalEditor ===
                          "prescription"
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          openAdminClinicalEditor(
                            "prescription"
                          )
                        }
                      >
                        📄 Receta
                      </button>
                    </div>

                    <div
                                key={clinicActionModal}
                                className="vm-clinic-action-body"
                              >
                      {adminClinicalEditor ===
                        "consultation" && (
                        <form
                          onSubmit={
                            saveAdminConsultation
                          }
                          className="vm-clinic-action-form"
                        >
                          <div className="vm-clinic-action-form-heading">
                            <div>
                              <span>🩺</span>
                            </div>

                            <div>
                              <h4>
                                {editingConsultationId
                                  ? "Editar consulta"
                                  : "Nueva consulta"}
                              </h4>
                              <p>
                                Gestión administrativa del
                                registro de atención.
                              </p>
                            </div>
                          </div>

                          <div className="vm-clinic-action-form-grid">
                            <label className="vm-field">
                              <span>Fecha</span>
                              <input
                                type="date"
                                value={
                                  adminConsultationForm
                                    .consultation_date
                                }
                                onChange={(e) =>
                                  setAdminConsultationForm({
                                    ...adminConsultationForm,
                                    consultation_date:
                                      e.target.value,
                                  })
                                }
                              />
                            </label>

                            <label className="vm-field">
                              <span>Motivo</span>
                              <input
                                list="admin-consultation-reasons"
                                placeholder="Selecciona o escribe un motivo"
                                value={
                                  adminConsultationForm
                                    .reason
                                }
                                onChange={(e) =>
                                  setAdminConsultationForm({
                                    ...adminConsultationForm,
                                    reason:
                                      e.target.value,
                                  })
                                }
                              />

                              <datalist id="admin-consultation-reasons">
                                {adminClinicalCatalog.consultation_reason.map(
                                  (option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    />
                                  )
                                )}
                              </datalist>
                            </label>

                            <label className="vm-field vm-clinic-action-full">
                              <span>Diagnóstico</span>
                              <textarea
                                value={
                                  adminConsultationForm
                                    .diagnosis
                                }
                                onChange={(e) =>
                                  setAdminConsultationForm({
                                    ...adminConsultationForm,
                                    diagnosis:
                                      e.target.value,
                                  })
                                }
                              />
                            </label>

                            <label className="vm-field vm-clinic-action-full">
                              <span>Tratamiento</span>
                              <textarea
                                value={
                                  adminConsultationForm
                                    .treatment
                                }
                                onChange={(e) =>
                                  setAdminConsultationForm({
                                    ...adminConsultationForm,
                                    treatment:
                                      e.target.value,
                                  })
                                }
                              />
                            </label>

                            <label className="vm-field">
                              <span>Veterinario</span>
                              <input
                                placeholder="Nombre del profesional"
                                value={
                                  adminConsultationForm
                                    .veterinarian
                                }
                                onChange={(e) =>
                                  setAdminConsultationForm({
                                    ...adminConsultationForm,
                                    veterinarian:
                                      e.target.value,
                                  })
                                }
                              />
                            </label>

                            <label className="vm-field">
                              <span>Observación</span>
                              <input
                                value={
                                  adminConsultationForm
                                    .observation
                                }
                                onChange={(e) =>
                                  setAdminConsultationForm({
                                    ...adminConsultationForm,
                                    observation:
                                      e.target.value,
                                  })
                                }
                              />
                            </label>
                          </div>

                          <div className="vm-clinic-action-footer">
                            <button
                              type="button"
                              className="vm-secondary"
                              onClick={
                                closeAdminClinicalEditor
                              }
                            >
                              Cancelar
                            </button>

                            <button
                              type="submit"
                              className="vm-primary"
                            >
                              {editingConsultationId
                                ? "Guardar cambios"
                                : "Registrar consulta"}
                            </button>
                          </div>
                        </form>
                      )}

                      {adminClinicalEditor ===
                        "vaccine" && (
                        <form
                          onSubmit={saveAdminVaccine}
                          className="vm-clinic-action-form"
                        >
                          <div className="vm-clinic-action-form-heading">
                            <div>
                              <span>💉</span>
                            </div>

                            <div>
                              <h4>
                                {editingVaccineId
                                  ? "Editar vacuna"
                                  : "Registrar vacuna"}
                              </h4>
                              <p>
                                Las opciones nuevas se
                                guardan automáticamente.
                              </p>
                            </div>
                          </div>

                          <div className="vm-clinic-action-form-grid">
                            <label className="vm-field vm-clinic-action-full">
                              <span>Vacuna</span>
                              <input
                                list="admin-vaccine-options"
                                placeholder="Selecciona o escribe una vacuna"
                                value={
                                  adminVaccineForm.name
                                }
                                onChange={(e) =>
                                  setAdminVaccineForm({
                                    ...adminVaccineForm,
                                    name:
                                      e.target.value,
                                  })
                                }
                              />

                              <datalist id="admin-vaccine-options">
                                {adminClinicalCatalog.vaccine.map(
                                  (option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    />
                                  )
                                )}
                              </datalist>
                            </label>

                            <label className="vm-field">
                              <span>Aplicación</span>
                              <input
                                type="date"
                                value={
                                  adminVaccineForm
                                    .application_date
                                }
                                onChange={(e) => {
                                  const value =
                                    e.target.value;

                                  setAdminVaccineForm(
                                    (current) => ({
                                      ...current,
                                      application_date:
                                        value,
                                      next_dose_date:
                                        adminVaccineNextDosePreset &&
                                        adminVaccineNextDosePreset !==
                                          "manual"
                                          ? addDaysToClinicDate(
                                              value,
                                              adminVaccineNextDosePreset
                                            )
                                          : current.next_dose_date,
                                    })
                                  );
                                }}
                              />
                            </label>

                            <label className="vm-field">
                              <span>
                                Intervalo próxima dosis
                              </span>
                              <select
                                value={
                                  adminVaccineNextDosePreset
                                }
                                onChange={(e) =>
                                  applyAdminVaccineNextDosePreset(
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Sin intervalo prefijado
                                </option>
                                <option value="15">
                                  En 15 días
                                </option>
                                <option value="21">
                                  En 21 días
                                </option>
                                <option value="30">
                                  En 30 días
                                </option>
                                <option value="180">
                                  En 6 meses
                                </option>
                                <option value="365">
                                  En 12 meses
                                </option>
                                <option value="manual">
                                  Fecha manual
                                </option>
                              </select>
                            </label>

                            <label className="vm-field">
                              <span>
                                Fecha próxima dosis
                              </span>
                              <input
                                type="date"
                                value={
                                  adminVaccineForm
                                    .next_dose_date
                                }
                                onChange={(e) => {
                                  setAdminVaccineNextDosePreset(
                                    "manual"
                                  );
                                  setAdminVaccineForm({
                                    ...adminVaccineForm,
                                    next_dose_date:
                                      e.target.value,
                                  });
                                }}
                              />
                            </label>

                            <label className="vm-field">
                              <span>Observación</span>
                              <input
                                value={
                                  adminVaccineForm
                                    .observation
                                }
                                onChange={(e) =>
                                  setAdminVaccineForm({
                                    ...adminVaccineForm,
                                    observation:
                                      e.target.value,
                                  })
                                }
                              />
                            </label>
                          </div>

                          <div className="vm-clinic-action-footer">
                            <button
                              type="button"
                              className="vm-secondary"
                              onClick={
                                closeAdminClinicalEditor
                              }
                            >
                              Cancelar
                            </button>

                            <button
                              type="submit"
                              className="vm-primary"
                            >
                              {editingVaccineId
                                ? "Guardar cambios"
                                : "Registrar vacuna"}
                            </button>
                          </div>
                        </form>
                      )}

                      {adminClinicalEditor ===
                        "medication" && (
                        <form
                          onSubmit={
                            saveAdminMedication
                          }
                          className="vm-clinic-action-form"
                        >
                          <div className="vm-clinic-action-form-heading">
                            <div>
                              <span>💊</span>
                            </div>

                            <div>
                              <h4>
                                {editingMedicationId
                                  ? "Editar medicamento"
                                  : "Registrar medicamento"}
                              </h4>
                              <p>
                                Medicamento, dosis y
                                frecuencia admiten opciones
                                nuevas.
                              </p>
                            </div>
                          </div>

                          <div className="vm-clinic-action-form-grid">
                            <label className="vm-field vm-clinic-action-full">
                              <span>Medicamento</span>
                              <input
                                list="admin-medication-options"
                                value={
                                  adminMedicationForm.name
                                }
                                onChange={(e) =>
                                  setAdminMedicationForm({
                                    ...adminMedicationForm,
                                    name:
                                      e.target.value,
                                  })
                                }
                              />

                              <datalist id="admin-medication-options">
                                {adminClinicalCatalog.medication.map(
                                  (option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    />
                                  )
                                )}
                              </datalist>
                            </label>

                            <label className="vm-field">
                              <span>Dosis</span>
                              <input
                                list="admin-dose-options"
                                value={
                                  adminMedicationForm.dose
                                }
                                onChange={(e) =>
                                  setAdminMedicationForm({
                                    ...adminMedicationForm,
                                    dose:
                                      e.target.value,
                                  })
                                }
                              />

                              <datalist id="admin-dose-options">
                                {adminClinicalCatalog.dose.map(
                                  (option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    />
                                  )
                                )}
                              </datalist>
                            </label>

                            <label className="vm-field">
                              <span>Frecuencia</span>
                              <input
                                list="admin-frequency-options"
                                value={
                                  adminMedicationForm
                                    .frequency
                                }
                                onChange={(e) =>
                                  setAdminMedicationForm({
                                    ...adminMedicationForm,
                                    frequency:
                                      e.target.value,
                                  })
                                }
                              />

                              <datalist id="admin-frequency-options">
                                {adminClinicalCatalog.frequency.map(
                                  (option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    />
                                  )
                                )}
                              </datalist>
                            </label>

                            <label className="vm-field">
                              <span>Inicio</span>
                              <input
                                type="date"
                                value={
                                  adminMedicationForm
                                    .start_date
                                }
                                onChange={(e) => {
                                  const value =
                                    e.target.value;

                                  setAdminMedicationForm(
                                    (current) => ({
                                      ...current,
                                      start_date:
                                        value,
                                      end_date:
                                        adminMedicationDurationPreset &&
                                        adminMedicationDurationPreset !==
                                          "manual"
                                          ? addDaysToClinicDate(
                                              value,
                                              adminMedicationDurationPreset
                                            )
                                          : current.end_date,
                                    })
                                  );
                                }}
                              />
                            </label>

                            <label className="vm-field">
                              <span>Duración</span>
                              <select
                                value={
                                  adminMedicationDurationPreset
                                }
                                onChange={(e) =>
                                  applyAdminMedicationDurationPreset(
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Sin duración prefijada
                                </option>
                                <option value="3">
                                  3 días
                                </option>
                                <option value="5">
                                  5 días
                                </option>
                                <option value="7">
                                  7 días
                                </option>
                                <option value="10">
                                  10 días
                                </option>
                                <option value="14">
                                  14 días
                                </option>
                                <option value="21">
                                  21 días
                                </option>
                                <option value="30">
                                  30 días
                                </option>
                                <option value="manual">
                                  Fecha manual
                                </option>
                              </select>
                            </label>

                            <label className="vm-field vm-clinic-action-full">
                              <span>Horarios de aviso</span>
                              <input
                                placeholder="Ej: 08:00, 20:00"
                                value={
                                  adminMedicationForm
                                    .reminder_times
                                }
                                onChange={(e) =>
                                  setAdminMedicationForm({
                                    ...adminMedicationForm,
                                    reminder_times:
                                      e.target.value,
                                  })
                                }
                              />
                              <small className="vm-clinic-preset-note">
                                Separa varios horarios con coma. Formato 24 h.
                              </small>
                            </label>

                            <label className="vm-field">
                              <span>Término</span>
                              <input
                                type="date"
                                min={
                                  adminMedicationForm
                                    .start_date
                                }
                                value={
                                  adminMedicationForm
                                    .end_date
                                }
                                onChange={(e) => {
                                  setAdminMedicationDurationPreset(
                                    "manual"
                                  );

                                  setAdminMedicationForm({
                                    ...adminMedicationForm,
                                    end_date:
                                      e.target.value,
                                  });
                                }}
                              />
                            </label>

                            <label className="vm-field">
                              <span>Observación</span>
                              <input
                                value={
                                  adminMedicationForm
                                    .observation
                                }
                                onChange={(e) =>
                                  setAdminMedicationForm({
                                    ...adminMedicationForm,
                                    observation:
                                      e.target.value,
                                  })
                                }
                              />
                            </label>
                          </div>

                          <div className="vm-clinic-action-footer">
                            <button
                              type="button"
                              className="vm-secondary"
                              onClick={
                                closeAdminClinicalEditor
                              }
                            >
                              Cancelar
                            </button>

                            <button
                              type="submit"
                              className="vm-primary"
                            >
                              {editingMedicationId
                                ? "Guardar cambios"
                                : "Registrar medicamento"}
                            </button>
                          </div>
                        </form>
                      )}

                      {adminClinicalEditor ===
                        "prescription" && (
                        <form
                          onSubmit={
                            saveAdminPrescription
                          }
                          className="vm-clinic-action-form"
                        >
                          <div className="vm-clinic-action-form-heading">
                            <div>
                              <span>📄</span>
                            </div>

                            <div>
                              <h4>
                                {editingAdminPrescriptionId
                                  ? "Editar receta"
                                  : "Nueva receta"}
                              </h4>
                              <p>
                                El administrador puede
                                gestionar recetas asociadas a
                                una clínica.
                              </p>
                            </div>
                          </div>

                          <div className="vm-clinic-action-form-grid">
                            <label className="vm-field">
                              <span>Clínica</span>
                              <select
                                value={
                                  adminPrescriptionForm
                                    .veterinary_id
                                }
                                onChange={(e) =>
                                  setAdminPrescriptionForm({
                                    ...adminPrescriptionForm,
                                    veterinary_id:
                                      e.target.value,
                                  })
                                }
                              >
                                <option value="">
                                  Selecciona clínica
                                </option>

                                {clinics.map((clinic) => (
                                  <option
                                    key={clinic.id}
                                    value={clinic.id}
                                  >
                                    {clinic.name} ·{" "}
                                    {clinic.commune}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="vm-field">
                              <span>Emisión</span>
                              <input
                                type="date"
                                value={
                                  adminPrescriptionForm
                                    .issue_date
                                }
                                onChange={(e) =>
                                  setAdminPrescriptionForm({
                                    ...adminPrescriptionForm,
                                    issue_date:
                                      e.target.value,
                                  })
                                }
                              />
                            </label>

                            <label className="vm-field vm-clinic-action-full">
                              <span>Medicamento</span>
                              <input
                                list="admin-prescription-medications"
                                value={
                                  adminPrescriptionForm
                                    .medication
                                }
                                onChange={(e) =>
                                  setAdminPrescriptionForm({
                                    ...adminPrescriptionForm,
                                    medication:
                                      e.target.value,
                                  })
                                }
                              />

                              <datalist id="admin-prescription-medications">
                                {adminClinicalCatalog.medication.map(
                                  (option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    />
                                  )
                                )}
                              </datalist>
                            </label>

                            <label className="vm-field">
                              <span>Dosis</span>
                              <input
                                list="admin-prescription-doses"
                                value={
                                  adminPrescriptionForm
                                    .dosage
                                }
                                onChange={(e) =>
                                  setAdminPrescriptionForm({
                                    ...adminPrescriptionForm,
                                    dosage:
                                      e.target.value,
                                  })
                                }
                              />

                              <datalist id="admin-prescription-doses">
                                {adminClinicalCatalog.dose.map(
                                  (option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    />
                                  )
                                )}
                              </datalist>
                            </label>

                            <label className="vm-field">
                              <span>Frecuencia</span>
                              <input
                                list="admin-prescription-frequencies"
                                value={
                                  adminPrescriptionForm
                                    .frequency
                                }
                                onChange={(e) =>
                                  setAdminPrescriptionForm({
                                    ...adminPrescriptionForm,
                                    frequency:
                                      e.target.value,
                                  })
                                }
                              />

                              <datalist id="admin-prescription-frequencies">
                                {adminClinicalCatalog.frequency.map(
                                  (option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    />
                                  )
                                )}
                              </datalist>
                            </label>

                            <label className="vm-field vm-clinic-action-full">
                              <span>Duración</span>
                              <input
                                list="admin-prescription-durations"
                                placeholder="Ej: 7 días"
                                value={
                                  adminPrescriptionForm
                                    .duration
                                }
                                onChange={(e) =>
                                  setAdminPrescriptionForm({
                                    ...adminPrescriptionForm,
                                    duration:
                                      e.target.value,
                                  })
                                }
                              />

                              <datalist id="admin-prescription-durations">
                                {adminClinicalCatalog.duration.map(
                                  (option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    />
                                  )
                                )}
                              </datalist>
                            </label>

                            <label className="vm-field vm-clinic-action-full">
                              <span>Indicaciones</span>
                              <textarea
                                value={
                                  adminPrescriptionForm
                                    .instructions
                                }
                                onChange={(e) =>
                                  setAdminPrescriptionForm({
                                    ...adminPrescriptionForm,
                                    instructions:
                                      e.target.value,
                                  })
                                }
                              />
                            </label>
                          </div>

                          <div className="vm-clinic-action-footer">
                            <button
                              type="button"
                              className="vm-secondary"
                              onClick={
                                closeAdminClinicalEditor
                              }
                            >
                              Cancelar
                            </button>

                            <button
                              type="submit"
                              className="vm-primary"
                            >
                              {editingAdminPrescriptionId
                                ? "Guardar cambios"
                                : "Crear receta"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </section>
                </div>
              )}

            {selectedAdminUser && currentUser.role === "admin" && (
              <div
                className="vm-admin-user-profile-overlay"
                role="dialog"
                aria-modal="true"
                aria-label={`Perfil de ${selectedAdminUser.name}`}
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) {
                    closeAdminUserProfile();
                  }
                }}
              >
                <section
                  className="vm-admin-user-profile-modal"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="vm-admin-user-profile-topbar">
                    <div>
                      <span>👤 Perfil de usuario</span>
                      <strong>{selectedAdminUser.name}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={closeAdminUserProfile}
                      aria-label="Cerrar perfil de usuario"
                    >
                      ×
                    </button>
                  </div>

                  <div className="vm-admin-user-profile-hero">
                    <div className="vm-admin-user-profile-avatar">
                      {userRoleEmoji(selectedAdminUser.role)}
                    </div>

                    <div>
                      <p className="vm-kicker">
                        {roleLabel(selectedAdminUser.role)}
                      </p>
                      <h2>{selectedAdminUser.name}</h2>
                      <p>{selectedAdminUser.email}</p>
                    </div>

                    <span className="vm-admin-user-profile-id">
                      ID interno {selectedAdminUser.id}
                    </span>
                  </div>

                  <div className="vm-admin-user-profile-grid">
                    <article>
                      <small>RUT</small>
                      <strong>
                        {selectedAdminUser.rut ||
                          "No registrado"}
                      </strong>
                    </article>

                    <article>
                      <small>País</small>
                      <strong>
                        {selectedAdminUser.country ||
                          "No registrado"}
                      </strong>
                    </article>

                    <article>
                      <small>Región</small>
                      <strong>
                        {selectedAdminUser.region ||
                          "No registrada"}
                      </strong>
                    </article>

                    <article>
                      <small>Ciudad</small>
                      <strong>
                        {selectedAdminUser.city ||
                          "No registrada"}
                      </strong>
                    </article>

                    <article>
                      <small>Fecha de nacimiento</small>
                      <strong>
                        {selectedAdminUser.birth_date
                          ? formatDate(
                              selectedAdminUser.birth_date
                            )
                          : selectedAdminUser.birth_year
                          ? `Solo año: ${selectedAdminUser.birth_year}`
                          : "No registrada"}
                      </strong>
                    </article>

                    <article>
                      <small>Mascotas registradas</small>
                      <strong>
                        {adminUserPetCount(
                          selectedAdminUser.id
                        )}
                      </strong>
                    </article>
                  </div>

                  {adminUserPetCount(selectedAdminUser.id) > 0 && (
                    <div className="vm-admin-user-pets-preview">
                      <div className="vm-admin-user-pets-heading">
                        <div>
                          <p className="vm-kicker">
                            Mascotas asociadas
                          </p>
                          <h3>
                            Mascotas de {selectedAdminUser.name}
                          </h3>
                        </div>
                      </div>

                      <div className="vm-admin-user-pets-row">
                        {adminPets
                          .filter(
                            (pet) =>
                              pet.owner_id ===
                              selectedAdminUser.id
                          )
                          .map((pet) => (
                            <button
                              type="button"
                              key={pet.id}
                              className="vm-admin-user-pet-mini"
                              onClick={() => {
                                closeAdminUserProfile();
                                viewPetProfile(pet);
                              }}
                            >
                              <span>
                                {pet.photo_data ? (
                                  <img
                                    src={pet.photo_data}
                                    alt={pet.name}
                                  />
                                ) : (
                                  getPetEmoji(pet.species)
                                )}
                              </span>

                              <div>
                                <strong>{pet.name}</strong>
                                <small>
                                  {pet.species}
                                  {pet.breed
                                    ? ` · ${pet.breed}`
                                    : ""}
                                </small>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="vm-admin-user-profile-actions">
                    <button
                      type="button"
                      className="vm-primary"
                      onClick={() => {
                        const user =
                          selectedAdminUser;
                        closeAdminUserProfile();
                        startEditAdminUser(user);
                      }}
                    >
                      Editar usuario
                    </button>

                    <button
                      type="button"
                      className="vm-secondary"
                      onClick={closeAdminUserProfile}
                    >
                      Cerrar
                    </button>
                  </div>
                </section>
              </div>
            )}

            {selectedPet && (
              <div
                className="vm-pet-profile-overlay"
                role="dialog"
                aria-modal="true"
                aria-label={`Perfil de ${selectedPet.name}`}
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) {
                    closePetProfile();
                  }
                }}
              >
                <section
                  className="vm-full-pet-profile vm-pet-profile-modal"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="vm-pet-profile-modal-topbar">
                    <div>
                      <span>🐾 Perfil completo</span>
                      <strong>{selectedPet.name}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={closePetProfile}
                      aria-label="Cerrar perfil"
                    >
                      ×
                    </button>
                  </div>
                <div className="vm-pet-profile-hero">
                  <div className="vm-pet-profile-photo">
                    {selectedPet.photo_data ? (
                      <img
                        src={selectedPet.photo_data}
                        alt={`Foto de ${selectedPet.name}`}
                      />
                    ) : (
                      <span>{getPetEmoji(selectedPet.species)}</span>
                    )}
                  </div>

                  <div className="vm-pet-profile-title">
                    <p className="vm-kicker">Perfil de mascota</p>
                    <h2>{selectedPet.name}</h2>

                    <p>
                      {selectedPet.species}
                      {selectedPet.breed
                        ? ` · ${selectedPet.breed}`
                        : ""}
                    </p>

                    <div className="vm-pet-profile-tags">
                      <span>
                        🎂 {formatAge(
                          selectedPet.age,
                          selectedPet.age_months
                        )}
                      </span>

                      <span>
                        ⚖️ {formatWeight(selectedPet.weight)}
                      </span>

                      {selectedPet.birth_date && (
                        <span>
                          📅 Nacimiento: {formatDate(selectedPet.birth_date)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closePetProfile}
                    className="vm-secondary"
                  >
                    Cerrar perfil
                  </button>
                </div>

                <div className="vm-pet-profile-grid">
                  <div className="vm-pet-info-card">
                    <h3>Información general</h3>

                    <div className="vm-pet-info-row">
                      <span>Nombre</span>
                      <strong>{selectedPet.name}</strong>
                    </div>

                    <div className="vm-pet-info-row">
                      <span>Especie</span>
                      <strong>{selectedPet.species}</strong>
                    </div>

                    <div className="vm-pet-info-row">
                      <span>Raza</span>
                      <strong>
                        {selectedPet.breed || "No registrada"}
                      </strong>
                    </div>

                    <div className="vm-pet-info-row">
                      <span>Alimentación</span>
                      <strong>
                        {selectedPet.feeding_info || "No registrada"}
                      </strong>
                    </div>

                    <div className="vm-pet-info-row">
                      <span>Antecedentes</span>
                      <strong>
                        {selectedPet.medical_background ||
                          "No registrados"}
                      </strong>
                    </div>

                    <div className="vm-pet-info-row">
                      <span>Información adicional</span>
                      <strong>
                        {selectedPet.additional_info ||
                          "Sin información adicional"}
                      </strong>
                    </div>

                    {currentUser.role !== "admin" && (
                      <button
                        type="button"
                        className="vm-secondary vm-pet-edit-profile"
                        onClick={() => {
                          const petToEdit = selectedPet;
                          closePetProfile();
                          startEditOwnerPet(petToEdit);
                        }}
                      >
                        Editar datos generales
                      </button>
                    )}
                  </div>

                  {currentUser.role !== "admin" && (
                    <div className="vm-pet-info-card">
                      <div className="vm-pet-card-heading">
                        <div>
                          <h3>Historial de peso</h3>
                          <p>
                            Registra la evolución del peso de tu mascota.
                          </p>
                        </div>

                        <span>⚖️</span>
                      </div>

                      <form
                        onSubmit={savePetWeight}
                        className="vm-weight-form"
                      >
                        <label className="vm-weight-field">
                          <span>Peso (kg)</span>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Ej: 35.0"
                            value={weightForm.weight}
                            onChange={(e) =>
                              setWeightForm({
                                ...weightForm,
                                weight: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-weight-field">
                          <span>Fecha</span>
                          <input
                            type="date"
                            value={weightForm.record_date}
                            onChange={(e) =>
                              setWeightForm({
                                ...weightForm,
                                record_date: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="vm-weight-field vm-weight-note">
                          <span>Nota opcional</span>
                          <input
                            placeholder="Ej: control mensual"
                            value={weightForm.note}
                            onChange={(e) =>
                              setWeightForm({
                                ...weightForm,
                                note: e.target.value,
                              })
                            }
                          />
                        </label>

                        <button
                          type="submit"
                          className="vm-primary vm-weight-submit"
                        >
                          Registrar peso
                        </button>
                      </form>

                      {petWeights.length === 0 ? (
                        <p className="vm-muted-text">
                          Aún no hay registros de peso.
                        </p>
                      ) : (
                        <div className="vm-weight-history">
                          {petWeights.slice(0, 6).map((item) => (
                            <div
                              key={item.id}
                              className="vm-weight-row"
                            >
                              <div>
                                <strong>{item.weight} kg</strong>
                                <span>
                                  {formatDate(item.record_date)}
                                </span>
                                {item.note && <small>{item.note}</small>}
                              </div>

                              <button
                                type="button"
                                onClick={() => removePetWeight(item.id)}
                              >
                                Eliminar
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {currentUser.role !== "admin" && (
                    <div className="vm-pet-info-card vm-pet-upcoming-card">
                      <div className="vm-pet-card-heading">
                        <div>
                          <h3>Próximas atenciones</h3>
                          <p>
                            Reservas activas asociadas a {selectedPet.name}.
                          </p>
                        </div>

                        <span>📅</span>
                      </div>

                      {upcomingReservationsForPet(selectedPet.id).length ===
                      0 ? (
                        <div className="vm-pet-no-upcoming">
                          <p>No hay próximas horas registradas.</p>

                          <button
                            type="button"
                            className="vm-primary"
                            onClick={() => {
                              const petId = selectedPet.id;

                              setReservationForm({
                                ...reservationForm,
                                pet_id: String(petId),
                              });

                              closePetProfile();
                              setMemberSection("reserva");
                            }}
                          >
                            Agendar una hora
                          </button>
                        </div>
                      ) : (
                        <div className="vm-pet-upcoming-list">
                          {upcomingReservationsForPet(selectedPet.id)
                            .slice(0, 3)
                            .map((reservation) => (
                              <div
                                key={reservation.id}
                                className="vm-pet-upcoming-item"
                              >
                                <div>
                                  <strong>
                                    {reservation.veterinary_name}
                                  </strong>
                                  <span>{reservation.service}</span>
                                </div>

                                <div>
                                  <strong>
                                    {formatDate(
                                      reservation.appointment_date
                                    )}
                                  </strong>
                                  <span>
                                    {String(
                                      reservation.appointment_time
                                    ).slice(0, 5)}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {currentUser.role === "admin" && (
                    <div className="vm-admin-clinical-actions">
                      <div>
                        <p className="vm-kicker">
                          Control administrativo
                        </p>
                        <h3>
                          Gestión clínica de {selectedPet.name}
                        </h3>
                        <p>
                          El administrador puede revisar, agregar,
                          corregir o eliminar registros clínicos.
                        </p>
                      </div>

                      <div className="vm-admin-clinical-actions-buttons">
                        <button
                          type="button"
                          onClick={() =>
                            openAdminClinicalEditor(
                              "consultation"
                            )
                          }
                        >
                          🩺 Consulta
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openAdminClinicalEditor(
                              "vaccine"
                            )
                          }
                        >
                          💉 Vacuna
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openAdminClinicalEditor(
                              "medication"
                            )
                          }
                        >
                          💊 Medicamento
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openAdminClinicalEditor(
                              "prescription"
                            )
                          }
                        >
                          📄 Receta
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border p-4">
                    <h3 className="font-semibold">Vacunas</h3>

                    {vaccines.length === 0 ? (
                      <p className="text-slate-600">
                        No hay vacunas registradas.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {vaccines.map((vaccine) => (
                          <div key={vaccine.id} className="rounded-xl border p-3">
                            <p className="font-semibold">💉 {vaccine.name}</p>
                            <p>Aplicada: {formatDate(vaccine.application_date)}</p>
                            <p>Próxima dosis: {formatDate(vaccine.next_dose_date)}</p>
                            <p>Observación: {vaccine.observation || "Sin observación"}</p>

                            {currentUser.role === "admin" && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  onClick={() => startEditVaccine(vaccine)}
                                  className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                                >
                                  Editar
                                </button>

                                <button
                                  onClick={() => removeAdminVaccine(vaccine.id)}
                                  className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}

                            {false && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  onClick={() => startEditOwnerVaccine(vaccine)}
                                  className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                                >
                                  Editar
                                </button>

                                <button
                                  onClick={() => removeOwnerVaccine(vaccine.id)}
                                  className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border p-4">
                    <h3 className="font-semibold">Medicamentos</h3>

                    {medications.length === 0 ? (
                      <p className="text-slate-600">
                        No hay medicamentos registrados.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {medications.map((medication) => (
                          <div key={medication.id} className="rounded-xl border p-3">
                            <p className="font-semibold">💊 {medication.name}</p>
                            <p>Dosis: {medication.dose || "No registrada"}</p>
                            <p>Frecuencia: {medication.frequency || "No registrada"}</p>
                            <p>Inicio: {formatDate(medication.start_date)}</p>
                            <p>Término: {formatDate(medication.end_date)}</p>
                            <p>
                              Horarios: {medication.reminder_times
                                ? medicationReminderTimes(
                                    medication.reminder_times
                                  ).join(" · ")
                                : "No registrados"}
                            </p>
                            <p>Observación: {medication.observation || "Sin observación"}</p>

                            {currentUser.role === "owner" &&
                              medication.reminder_times && (
                              <div className="vm-medication-today-box">
                                <div className="vm-medication-today-head">
                                  <span>⏰</span>
                                  <div>
                                    <strong>Dosis de hoy</strong>
                                    <small>
                                      Marca cada dosis cuando se la des a {selectedPet?.name || "tu mascota"}.
                                    </small>
                                  </div>
                                </div>

                                {todayScheduleForMedication(
                                  medication.id
                                ).length === 0 ? (
                                  <p className="vm-medication-no-dose">
                                    No hay dosis programadas para hoy.
                                  </p>
                                ) : (
                                  <div className="vm-medication-dose-list">
                                    {todayScheduleForMedication(
                                      medication.id
                                    ).map((item) => (
                                      <div
                                        key={`${item.medication_id}-${item.scheduled_date}-${item.scheduled_time}`}
                                        className={`vm-medication-dose-row ${item.status}`}
                                      >
                                        <div className="vm-medication-dose-time">
                                          <span>💊</span>
                                          <strong>{item.scheduled_time}</strong>
                                        </div>

                                        <span className={`vm-medication-dose-status ${item.status}`}>
                                          {medicationScheduleStatusLabel(item)}
                                        </span>

                                        {item.can_mark &&
                                          item.status !== "administered" && (
                                          <button
                                            type="button"
                                            className="vm-medication-administer-btn"
                                            onClick={() =>
                                              markOwnerMedicationDose(
                                                item
                                              )
                                            }
                                          >
                                            ✓ Marcar administrado
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {currentUser.role === "owner" &&
                              !medication.reminder_times && (
                              <div className="vm-medication-schedule-empty">
                                ⏰ El veterinario aún no definió horarios de aviso para este medicamento.
                              </div>
                            )}

                            {currentUser.role === "admin" && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  onClick={() => startEditMedication(medication)}
                                  className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                                >
                                  Editar
                                </button>

                                <button
                                  onClick={() => removeAdminMedication(medication.id)}
                                  className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}

                            {false && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  onClick={() => startEditOwnerMedication(medication)}
                                  className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                                >
                                  Editar
                                </button>

                                <button
                                  onClick={() => removeOwnerMedication(medication.id)}
                                  className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {currentUser.role === "admin" && (
                    <div className="rounded-xl border p-4 md:col-span-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            Recetas veterinarias
                          </h3>
                          <p className="text-sm text-slate-600">
                            Recetas asociadas a esta mascota.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openAdminClinicalEditor(
                              "prescription"
                            )
                          }
                          className="vm-primary"
                        >
                          + Nueva receta
                        </button>
                      </div>

                      {adminPrescriptions.length === 0 ? (
                        <p className="mt-3 text-slate-600">
                          No hay recetas registradas.
                        </p>
                      ) : (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {adminPrescriptions.map((item) => (
                            <article
                              key={item.id}
                              className="vm-admin-prescription-card"
                            >
                              <div>
                                <span>📄</span>
                                <div>
                                  <strong>
                                    {item.medication}
                                  </strong>
                                  <small>
                                    {item.clinic_name}
                                  </small>
                                </div>
                              </div>

                              <p>
                                Dosis:{" "}
                                {item.dosage ||
                                  "No registrada"}
                              </p>
                              <p>
                                Frecuencia:{" "}
                                {item.frequency ||
                                  "No registrada"}
                              </p>
                              <p>
                                Duración:{" "}
                                {item.duration ||
                                  "No registrada"}
                              </p>
                              <p>
                                Emisión:{" "}
                                {formatDate(
                                  item.issue_date
                                )}
                              </p>

                              {item.instructions && (
                                <p>
                                  Indicaciones:{" "}
                                  {item.instructions}
                                </p>
                              )}

                              <div className="vm-admin-prescription-actions">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openAdminClinicalEditor(
                                      "prescription",
                                      item
                                    )
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() =>
                                    removeAdminPrescription(
                                      item
                                    )
                                  }
                                >
                                  Eliminar
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-xl border p-4 md:col-span-2">
                    <h3 className="font-semibold">Historial de consultas médicas</h3>

                    {consultations.length === 0 ? (
                      <p className="text-slate-600">
                        No hay consultas registradas.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {consultations.map((consultation) => (
                          <div key={consultation.id} className="rounded-xl border p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-lg font-semibold">
                                  🩺 Consulta médica
                                </p>

                                <p className="text-sm text-slate-600">
                                  Fecha: {formatDate(consultation.consultation_date)}
                                </p>
                              </div>

                              <span className="rounded-full border px-3 py-1 text-sm">
                                {currentUser.role === "admin" ? "Vista admin" : "Mi mascota"}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <div className="rounded-lg border p-3">
                                <p className="text-sm font-semibold text-slate-500">Motivo</p>
                                <p>{consultation.reason}</p>
                              </div>

                              <div className="rounded-lg border p-3">
                                <p className="text-sm font-semibold text-slate-500">Veterinario</p>
                                <p>{consultation.veterinarian || "No registrado"}</p>
                              </div>

                              <div className="rounded-lg border p-3">
                                <p className="text-sm font-semibold text-slate-500">Diagnóstico</p>
                                <p>{consultation.diagnosis || "No registrado"}</p>
                              </div>

                              <div className="rounded-lg border p-3">
                                <p className="text-sm font-semibold text-slate-500">Tratamiento</p>
                                <p>{consultation.treatment || "No registrado"}</p>
                              </div>

                              <div className="rounded-lg border p-3 md:col-span-2">
                                <p className="text-sm font-semibold text-slate-500">Observación</p>
                                <p>{consultation.observation || "Sin observación"}</p>
                              </div>
                            </div>

                            {currentUser.role === "admin" && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  onClick={() => startEditConsultation(consultation)}
                                  className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                                >
                                  Editar
                                </button>

                                <button
                                  onClick={() => removeAdminConsultation(consultation.id)}
                                  className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}

                            {false && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  onClick={() => startEditOwnerConsultation(consultation)}
                                  className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                                >
                                  Editar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                </section>
              </div>
            )}

                </>
              )}
              </VetMapAdminRouteBody>
            </section>
          </>
        )}
      </div>

      {confirmDialog.open && (
        <div
          className="vm-confirm-overlay"
          onClick={() => closeConfirmDialog(false)}
        >
          <div
            className={`vm-confirm-modal vm-confirm-modal--${confirmDialog.tone}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vm-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vm-confirm-icon">
              {confirmDialog.tone === "danger"
                ? "⚠️"
                : confirmDialog.tone === "success"
                ? "✅"
                : "🧹"}
            </div>

            <div className="vm-confirm-content">
              <h3 id="vm-confirm-title">
                {confirmDialog.title}
              </h3>

              <p>{confirmDialog.message}</p>
            </div>

            <div className="vm-confirm-actions">
              <button
                type="button"
                className="vm-confirm-cancel"
                onClick={() => closeConfirmDialog(false)}
              >
                {confirmDialog.cancelText}
              </button>

              <button
                type="button"
                className={`vm-confirm-accept vm-confirm-accept--${confirmDialog.tone}`}
                onClick={() => closeConfirmDialog(true)}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
      <VetMapChat token={token} user={currentUser} />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
