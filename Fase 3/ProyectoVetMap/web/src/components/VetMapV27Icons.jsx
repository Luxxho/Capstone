import React from "react";

/* VetMap V27.22: iconos SVG reales; sin dependencias, emojis ni imágenes externas. */
export default function VetMapV27Icon({ name = "paw", className = "", size = 24 }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    user: <><circle cx="12" cy="7.5" r="4"/><path d="M4.5 21v-1a7.5 7.5 0 0 1 15 0v1"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1.5a6 6 0 0 1 12 0V20M17 11a3 3 0 0 0 0-6M18 14a5 5 0 0 1 3 5v1"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    id: <><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M4.9 16a3.5 3.5 0 0 1 6.2 0M14 10h5M14 14h5"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    cake: <><path d="M4 11h16v10H4zM4 16c3 2 5-2 8 0s5-2 8 0M8 7v4m4-4v4m4-4v4"/><path d="M8 5V3m4 2V3m4 2V3"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 18h6"/></>,
    clipboard: <><rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h6"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    stethoscope: <><path d="M6 3v6a6 6 0 0 0 12 0V3M6 3H4v4M18 3h2v4M12 15v2a4 4 0 0 0 8 0v-1"/><circle cx="20" cy="14" r="2"/></>,
    syringe: <><path d="m4 20 7-7m-2-6 8 8m-3-12 7 7-4 4-7-7zM3 21l3-3m8-12 3-3"/></>,
    pill: <><path d="M20 4a5 5 0 0 1 0 7l-9 9a5 5 0 0 1-7-7l9-9a5 5 0 0 1 7 0ZM9 9l6 6"/></>,
    file: <><path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM15 3v5h4M8 13h8M8 17h6"/></>,
    scale: <><path d="M12 3v18M5 7h14M4 7l-3 6h6zM20 7l-3 6h6zM6 21h12"/></>,
    paw: <><ellipse cx="7" cy="8" rx="1.5" ry="2"/><ellipse cx="12" cy="5.7" rx="1.5" ry="2"/><ellipse cx="17" cy="8" rx="1.5" ry="2"/><ellipse cx="20" cy="12" rx="1.3" ry="1.7"/><path d="M9 13c1.4-1.6 4.6-1.6 6 0l3 3.3c1.7 2-.1 4.4-2.4 3.8-2.1-.6-5.1-.6-7.2 0-2.3.6-4.1-1.8-2.4-3.8z"/></>,
    warning: <><path d="m12 3 10 18H2zM12 9v5M12 18h.01"/></>,
    notes: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
    petDog: <><path d="M7 9 4 6C2 7 2 12 5 15m12-6 3-3c2 1 2 6-1 9M7 9c1-3 9-3 10 0l2 6c0 5-14 5-14 0z"/><path d="M9 13h.01M15 13h.01m-3 2v2"/></>,
    petCat: <><path d="M5 9V4l5 3h4l5-3v5c2 5 1 11-7 11S3 14 5 9z"/><path d="M9 12h.01M15 12h.01m-3 3 1 1-1 1-1-1zm-8 0 4 1m12-1-4 1"/></>,
    petRabbit: <><path d="M8 9C5 5 6 2 8 2s4 5 4 7c0-3 1-7 3-7s3 5 1 8"/><path d="M6 10c-3 3-3 10 6 10s9-7 6-10c-3-3-9-3-12 0z"/><path d="M9 14h.01M15 14h.01m-3 2 1 1-1 1-1-1z"/></>,
    petReptile: <><path d="M3 15c3-7 9-11 14-8 4 2 1 8-3 8l-3 5-3-4-5 1"/><circle cx="15" cy="9" r=".75"/><path d="m8 12-4-2m7 4 2 5"/></>,
    petBird: <><path d="M4 14c2-5 6-9 10-9a6 6 0 0 1 5 9c-2 3-4 4-7 5l-2 3-2-4C5 18 4 16 4 14z"/><path d="m19 11 4 1-4 2M9 11c3 0 4 3 5 4"/><circle cx="16" cy="9" r=".7"/></>,
  };
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={`vm-v27-icon ${className}`} {...common}>{icons[name] || icons.paw}</svg>;
}

export function VetMapV27PetIcon({ species = "" }) {
  const pet = String(species).toLowerCase();
  const name = /conejo|rabbit/.test(pet) ? "petRabbit" : /gato|cat|felino/.test(pet) ? "petCat" : /perro|dog|canino/.test(pet) ? "petDog" : /iguana|reptil|lagarto|gecko|tortuga/.test(pet) ? "petReptile" : /ave|pájaro|pajaro|loro|canario|pollo|pato/.test(pet) ? "petBird" : "paw";
  return <VetMapV27Icon name={name} className="vm-v27-pet-icon" size={43}/>;
}
