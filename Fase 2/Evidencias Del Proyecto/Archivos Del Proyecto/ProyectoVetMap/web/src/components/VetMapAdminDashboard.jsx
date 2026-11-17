import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, Bell, CalendarDays, ChartNoAxesCombined, ChevronDown,
  ClipboardList, House, Package, Search, Settings, ShoppingCart,
  Store, Stethoscope, Users, UserRound, PawPrint, ArrowRight,
  LogOut, RefreshCw, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import "./VetMapAdminDashboard.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const MENU = [
  { title: "Inicio", key: "inicio", Icon: House },
  { title: "Usuarios", key: "usuarios", Icon: Users },
  { title: "Tiendas", key: "tiendas", Icon: Store },
  { title: "Veterinarias", key: "veterinarias", Icon: Stethoscope },
  { title: "Productos", key: "productos", Icon: Package },
  { title: "Pedidos", key: "pedidos", Icon: ShoppingCart },
  { title: "Reservas", key: "reservas", Icon: CalendarDays },
  { title: "Reportes", key: "reportes", Icon: BarChart3 },
  { title: "Configuración", key: "configuracion", Icon: Settings },
];

const METRIC_INFO = [
  { key: "users", label: "Usuarios totales", Icon: Users, tone: "blue" },
  { key: "clinics", label: "Veterinarias", Icon: ClipboardList, tone: "blue" },
  { key: "stores", label: "Tiendas", Icon: Store, tone: "pink" },
  { key: "orders", label: "Pedidos totales", Icon: Package, tone: "orange" },
];

const EVENT_ICONS = {
  store: { Icon: Store, tone: "orange" },
  clinic: { Icon: Stethoscope, tone: "blue" },
  user: { Icon: UserRound, tone: "teal" },
  order: { Icon: Package, tone: "orange" },
};

function dateValue(value) {
  if (!value) return null;
  const raw = String(value);
  const timestamp = /Z$|[+-]\d\d:\d\d$/.test(raw) ? raw : `${raw}Z`;
  const result = new Date(timestamp);
  return Number.isNaN(result.getTime()) ? null : result;
}

function displayDate(value) {
  const date = dateValue(value);
  return date ? date.toLocaleString("es-CL", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago",
  }) : "Fecha no disponible";
}

function latestActivityLabel(value) {
  const date = dateValue(value);
  if (!date) return "Sin actividad registrada";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 10) return "Hace menos de 10 min";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)} h`;
  return `Hace ${Math.floor(minutes / 1440)} días`;
}

function seriesLabel(raw) {
  if (!raw) return "";
  const [, month, day] = raw.split("-").map(Number);
  return `${day} ${["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][month - 1]}`;
}

export default function VetMapAdminDashboard({
  token,
  currentUser,
  adminUsers = [],
  clinics = [],
  marketStores = [],
  notifications = [],
  onNavigate,
  onOpenNotification,
  onMarkAllRead,
  onLogout,
}) {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");
  const [refreshId, setRefreshId] = useState(0);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [activityKind, setActivityKind] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setPending(true);
    setError("");
    fetch(`${API_BASE}/api/admin/dashboard-overview?days=${period}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`Estadísticas no disponibles (HTTP ${r.status}). Comprueba el backend V8.`);
        }
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message || "No se pudieron cargar las estadísticas.");
          setData(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setPending(false);
      });
    return () => controller.abort();
  }, [token, period, refreshId]);

  const usersRecent = useMemo(() =>
    [...(data?.recent_users?.length ? data.recent_users : adminUsers)].filter((u) => u.last_seen_at || u.last_login_at)
      .sort((a,b) => (dateValue(b.last_seen_at || b.last_login_at)?.getTime() || 0) -
        (dateValue(a.last_seen_at || a.last_login_at)?.getTime() || 0))
      .slice(0, 5), [adminUsers, data?.recent_users]);
  const newUsers = useMemo(() =>
    [...(data?.new_users?.length ? data.new_users : adminUsers)].filter((u) => u.created_at)
      .sort((a,b) => (dateValue(b.created_at)?.getTime() || 0) -
        (dateValue(a.created_at)?.getTime() || 0)).slice(0, 5), [adminUsers, data?.new_users]);

  const query = search.trim().toLowerCase();
  const searchResults = query ? [
    ...adminUsers.filter(u => `${u.name || ""} ${u.email || ""}`.toLowerCase().includes(query))
      .slice(0,3).map(u=>({ id: `u${u.id}`, label: u.name, sub: "Usuario", section: "usuarios" })),
    ...marketStores.filter(s=>(s.name || "").toLowerCase().includes(query))
      .slice(0,3).map(s=>({ id: `s${s.id}`, label: s.name, sub: "Tienda", section: "tiendas" })),
    ...clinics.filter(c=>(c.name || "").toLowerCase().includes(query))
      .slice(0,3).map(c=>({ id: `c${c.id}`, label: c.name, sub: "Veterinaria", section: "veterinarias" })),
  ] : [];
  const unread = notifications.filter((n) => !n.is_read).length;

  function goTo(section) {
    setSearch("");
    if (section === "inicio") {
      setActivityKind(null);
      setShowAllActivity(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "reportes") {
      document.getElementById("vm-admin-v8-chart")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (section === "pedidos") {
      setActivityKind("order");
      setShowAllActivity(true);
      document.getElementById("vm-admin-v8-activity")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      onNavigate(section);
    }
  }

  return (
    <section className="vmv8-shell" aria-label="Panel de administración VetMap">
      <header className="vmv8-topbar">
        <div className="vmv8-logo" aria-label="VetMap">
          <div className="vmv8-logo-icon"><PawPrint size={29}/></div>
          <span>VetMap</span>
          <small className="vmv8-version-stamp" title="Diseño de administración instalado">ADMIN V9</small>
        </div>
        <div className="vmv8-search-wrap">
          <Search size={20} />
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Buscar usuarios, tiendas, veterinarias o reportes..."
            aria-label="Buscar en VetMap" />
          {query && (
            <div className="vmv8-search-results">
              {searchResults.length ? searchResults.map(item => (
                <button key={item.id} onClick={() => goTo(item.section)} type="button">
                  <strong>{item.label}</strong><small>{item.sub}</small>
                </button>
              )) : <p>Sin coincidencias en usuarios, tiendas o veterinarias.</p>}
            </div>
          )}
        </div>
        <div className="vmv8-top-actions">
          <div className="vmv8-popover-anchor">
            <button className="vmv8-icon-btn" type="button" aria-label="Notificaciones"
              onClick={() => {setShowNotifications(s=>!s);setShowAccount(false)}}>
              <Bell size={23}/>{unread > 0 && <b>{Math.min(unread, 99)}</b>}
            </button>
            {showNotifications && <div className="vmv8-dropdown vmv8-notification-dropdown">
              <div className="vmv8-dropdown-head"><strong>Notificaciones</strong>
                <button type="button" onClick={onMarkAllRead}>Marcar leídas</button></div>
              {notifications.length ? notifications.slice(0,8).map(n => (
                <button type="button" key={n.id} className="vmv8-notification-row"
                  onClick={() => { onOpenNotification(n); setShowNotifications(false) }}>
                  <strong>{n.title}</strong><small>{n.message}</small>
                </button>
              )) : <p className="vmv8-empty-popover">Todo al día.</p>}
            </div>}
          </div>
          <div className="vmv8-popover-anchor">
            <button className="vmv8-account-btn" type="button"
              onClick={() => {setShowAccount(s=>!s);setShowNotifications(false)}}>
              <span className="vmv8-avatar">{(currentUser?.name || "A").slice(0,1).toUpperCase()}</span>
              <span><strong>{currentUser?.name || "Administrador"}</strong><small>Administrador</small></span>
              <ChevronDown size={16} />
            </button>
            {showAccount && <div className="vmv8-dropdown vmv8-account-dropdown">
              <button onClick={() => goTo("configuracion")} type="button"><Settings size={16}/> Mi cuenta</button>
              <button onClick={onLogout} type="button"><LogOut size={16}/> Cerrar sesión</button>
            </div>}
          </div>
        </div>
      </header>

      <div className="vmv8-workspace">
        <aside className="vmv8-sidebar">
          <nav aria-label="Menú administrador">
            {MENU.map(({key, title, Icon}) => (
              <button type="button" key={key} className={key === "inicio" ? "active" : ""}
                onClick={() => goTo(key)}>
                <Icon size={20} strokeWidth={2.2}/><span>{title}</span>
              </button>
            ))}
          </nav>
          <div className="vmv8-sidebar-foot"><span>🐾</span><small>VetMap · Panel administrativo</small></div>
        </aside>

        <main className="vmv8-main">
          <section className="vmv8-hero">
            <div className="vmv8-hero-copy">
              <p>ADMINISTRACIÓN GENERAL</p>
              <h1>Panel de administración</h1>
              <span>Gestiona la plataforma, usuarios y reportes en un solo lugar.</span>
            </div>
            <div className="vmv8-hero-chart-icon"><ChartNoAxesCombined size={35}/></div>
          </section>

          <div className="vmv8-content">
            <section className="vmv8-metrics" aria-label="Indicadores generales">
              {METRIC_INFO.map(({key, label, Icon, tone}) => {
                const val = data?.totals?.[key];
                // El total de pedidos exige la consulta protegida; no se inventa.
                const local = key === "users" ? adminUsers.length : key === "clinics" ? clinics.length :
                  key === "stores" ? marketStores.length : null;
                const show = Number.isFinite(val) ? val : local;
                return <article key={key} className="vmv8-metric-card">
                  <span className={`vmv8-metric-icon vmv8-tone-${tone}`}><Icon size={27}/></span>
                  <div><strong>{show ?? "—"}</strong><small>{label}</small></div>
                </article>;
              })}
            </section>

            {error && <div className="vmv8-warning" role="alert">
              <strong>Estadísticas parciales:</strong> {error}
              <button type="button" onClick={() => setRefreshId(v=>v+1)}><RefreshCw size={14}/> Reintentar</button>
            </div>}

            <div className="vmv8-primary-grid">
              <article className="vmv8-panel" id="vm-admin-v8-activity">
                <div className="vmv8-panel-head">
                  <h2>{activityKind === "order" ? "Pedidos recientes" : "Actividad reciente"}</h2>
                  <button type="button" onClick={() => setShowAllActivity(v=>!v)}>
                    {showAllActivity ? "Ver menos" : "Ver todo"} <ArrowRight size={16}/>
                  </button>
                </div>
                {!data?.activity?.filter(x => !activityKind || x.kind === activityKind).length ? (
                  <div className="vmv8-empty"><Activity size={28}/><p>{pending ? "Cargando movimientos..." : "Sin movimientos para mostrar."}</p></div>
                ) : <div className="vmv8-activity-list">
                  {data.activity.filter(x => !activityKind || x.kind === activityKind)
                    .slice(0, showAllActivity ? 15 : 4).map(item => {
                    const {Icon, tone} = EVENT_ICONS[item.kind] || EVENT_ICONS.user;
                    return <div className="vmv8-activity-row" key={item.id}>
                      <span className={`vmv8-activity-icon vmv8-tone-${tone}`}><Icon size={24}/></span>
                      <div><strong>{item.title}</strong><small>{item.detail} · {displayDate(item.when)}</small></div>
                    </div>;
                  })}
                </div>}
              </article>

              <article className="vmv8-panel" id="vm-admin-v8-chart">
                <div className="vmv8-panel-head">
                  <h2>Resumen de la plataforma</h2>
                  <select aria-label="Período del gráfico" value={period}
                    onChange={e=>setPeriod(Number(e.target.value))}>
                    <option value={7}>Últimos 7 días</option>
                    <option value={15}>Últimos 15 días</option>
                    <option value={30}>Últimos 30 días</option>
                  </select>
                </div>
                {data?.series?.length ? <div className="vmv8-chart" role="img"
                  aria-label="Gráfico con pedidos, usuarios y reservas por día">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.series} margin={{top:12,right:15,left:-17,bottom:5}}>
                      <defs>
                        <linearGradient id="vmv8Pedidos" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#12bda9" stopOpacity=".22"/><stop offset="100%" stopColor="#12bda9" stopOpacity="0"/></linearGradient>
                        <linearGradient id="vmv8Usuarios" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2475fc" stopOpacity=".13"/><stop offset="100%" stopColor="#2475fc" stopOpacity="0"/></linearGradient>
                        <linearGradient id="vmv8Reservas" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8c1a" stopOpacity=".10"/><stop offset="100%" stopColor="#ff8c1a" stopOpacity="0"/></linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e8eef6" vertical={false}/>
                      <XAxis dataKey="date" tickFormatter={seriesLabel} tick={{fill:"#7589a9",fontSize:11}} minTickGap={26} axisLine={false} tickLine={false}/>
                      <YAxis allowDecimals={false} tick={{fill:"#7589a9",fontSize:11}} axisLine={false} tickLine={false}/>
                      <Tooltip labelFormatter={seriesLabel}/>
                      <Legend wrapperStyle={{fontSize:12,paddingTop:4}}/>
                      <Area type="monotone" dataKey="pedidos" name="Pedidos" stroke="#12bda9" strokeWidth={3} fill="url(#vmv8Pedidos)" dot={false} activeDot={{r:5}}/>
                      <Area type="monotone" dataKey="usuarios" name="Usuarios" stroke="#2475fc" strokeWidth={3} fill="url(#vmv8Usuarios)" dot={false} activeDot={{r:5}}/>
                      <Area type="monotone" dataKey="reservas" name="Reservas" stroke="#ff8c1a" strokeWidth={3} fill="url(#vmv8Reservas)" dot={false} activeDot={{r:5}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div> : <div className="vmv8-chart-placeholder">
                  <BarChart3 size={35}/><p>{pending ? "Cargando estadísticas reales..." : "Gráfico no disponible. Conecta el backend V8."}</p>
                </div>}
                <p className="vmv8-chart-caption">Cantidad de registros nuevos por día · Fechas de registro en UTC.</p>
              </article>
            </div>

            <div className="vmv8-secondary-grid">
              <article className="vmv8-panel">
                <div className="vmv8-panel-head"><h2>Usuarios activos recientemente</h2><span className="vmv8-pill">Actividad registrada</span></div>
                {usersRecent.length ? usersRecent.map(user =>
                  <div className="vmv8-user-row" key={user.id}>
                    <span className="vmv8-user-avatar">{(user.name||"U")[0].toUpperCase()}</span>
                    <div><strong>{user.name}</strong><small>{user.role || "Usuario"}</small></div>
                    <span className="vmv8-when">{latestActivityLabel(user.last_seen_at || user.last_login_at)}</span>
                  </div>
                ) : <div className="vmv8-empty"><p>Sin actividad registrada.</p></div>}
              </article>
              <article className="vmv8-panel">
                <div className="vmv8-panel-head"><h2>Últimos usuarios registrados</h2>
                  <button type="button" onClick={() => onNavigate("usuarios")}>Ver usuarios <ArrowRight size={16}/></button></div>
                {newUsers.length ? newUsers.map(user =>
                  <div className="vmv8-user-row" key={user.id}>
                    <span className="vmv8-user-avatar alt"><UserRound size={18}/></span>
                    <div><strong>{user.name}</strong><small>{user.email}</small></div>
                    <span className="vmv8-when">{displayDate(user.created_at)}</span>
                  </div>
                ) : <div className="vmv8-empty"><p>No hay usuarios registrados para mostrar.</p></div>}
              </article>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
