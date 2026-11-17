export function formatDate(value) {
  if (!value) return "-";
  const raw = String(value).slice(0, 10);
  const [y, m, d] = raw.split("-");
  return y && m && d ? `${d}/${m}/${y}` : String(value);
}

export function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("es-CL");
  } catch {
    return String(value);
  }
}

export function formatMoney(value) {
  const n = Number(value || 0);
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}

export function roleLabel(role) {
  return {
    owner: "Dueño de mascota",
    vet: "Veterinaria",
    store: "Tienda",
    admin: "Administrador",
  }[role] || role || "Usuario";
}

export function statusLabel(status) {
  return {
    pending: "Pendiente",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
    preparing: "Preparando",
    ready: "Lista",
    dispatched: "Despachada",
    delivered: "Entregada",
    created: "Creado",
    processed: "Procesado",
  }[status] || status || "-";
}

export function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}
