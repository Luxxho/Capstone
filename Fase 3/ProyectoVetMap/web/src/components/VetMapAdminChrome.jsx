import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, ChevronDown, ClipboardList, FileBarChart2, House,
  LogOut, Package, PawPrint, Search, Settings, ShoppingCart,
  Store, Stethoscope, UserRound, Users, HeartPulse,
} from "lucide-react";
import "./VetMapAdminChrome.css";

const LINKS = [
  { id: "inicio", label: "Inicio", icon: House },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "tiendas", label: "Tiendas", icon: Store },
  { id: "veterinarias", label: "Veterinarias", icon: Stethoscope },
  { id: "productos", label: "Productos", icon: Package },
  { id: "pedidos", label: "Pedidos", icon: ShoppingCart },
  { id: "reservas", label: "Reservas", icon: ClipboardList },
  { id: "reportes", label: "Reportes", icon: FileBarChart2 },
  { id: "mascotas", label: "Mascotas", icon: PawPrint },
  { id: "clinico", label: "Fichas clínicas", icon: HeartPulse },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

export default function VetMapAdminChrome({
  currentUser,
  adminUsers = [],
  marketStores = [],
  clinics = [],
  notifications = [],
  activeKey = "inicio",
  onNavigate,
  onOpenNotification,
  onMarkAllRead,
  onLogout,
}) {
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  // Cierra el menú al pulsar fuera o presionar Escape.
  useEffect(() => {
    const closeOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    const closeEscape = (event) => {
      if (event.key === "Escape") setShowProfile(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);
  const unread = notifications.filter(item => !item.is_read).length;
  const firstLetter = (currentUser?.name || "A").charAt(0).toUpperCase();

  const matches = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("es");
    if (!term) return [];
    return [
      ...adminUsers.filter(u => `${u.name || ""} ${u.email || ""}`.toLocaleLowerCase("es").includes(term))
        .slice(0, 3).map(u => ({ label: u.name, detail: "Usuario", section: "usuarios", id: `user-${u.id}` })),
      ...marketStores.filter(s => (s.name || "").toLocaleLowerCase("es").includes(term))
        .slice(0, 3).map(s => ({ label: s.name, detail: "Tienda", section: "tiendas", id: `store-${s.id}` })),
      ...clinics.filter(c => (c.name || "").toLocaleLowerCase("es").includes(term))
        .slice(0, 3).map(c => ({ label: c.name, detail: "Veterinaria", section: "veterinarias", id: `clinic-${c.id}` })),
    ];
  }, [query, adminUsers, marketStores, clinics]);

  function navigate(id) {
    setQuery("");
    setShowNotifications(false);
    setShowProfile(false);
    onNavigate(id);
  }

  return <>
    <header className="vmv10-topbar" aria-label="Cabecera VetMap Admin">
      <button type="button" className="vmv10-brand" onClick={() => navigate("inicio")}>
        <span className="vmv10-brand-mark"><PawPrint size={27} strokeWidth={2.8}/></span>
        <span className="vmv10-brand-text">VetMap<small>ADMINISTRACIÓN</small></span>
      </button>

      <div className="vmv10-search">
        <Search size={21} strokeWidth={2}/>
        <input type="search" aria-label="Buscar en administración" placeholder="Buscar usuarios, tiendas, veterinarias o reportes..."
          value={query} onChange={e => setQuery(e.target.value)} />
        {query.trim() && <div className="vmv10-search-results">
          {matches.length ? matches.map(item => <button key={item.id} type="button" onClick={() => navigate(item.section)}>
            <strong>{item.label}</strong><small>{item.detail}</small>
          </button>) : <p>No se encontraron coincidencias.</p>}
        </div>}
      </div>

      <div className="vmv10-actions">
        <div className="vmv10-popover-anchor">
          <button type="button" className="vmv10-bell" aria-label="Ver notificaciones" aria-expanded={showNotifications}
            onClick={() => {setShowNotifications(v => !v); setShowProfile(false);}}>
            <Bell size={23}/>{unread > 0 && <span className="vmv10-unread">{Math.min(unread, 99)}</span>}
          </button>
          {showNotifications && <div className="vmv10-dropdown vmv10-notify">
            <div className="vmv10-dropdown-head"><strong>Notificaciones</strong>
              <button type="button" onClick={onMarkAllRead}>Marcar leídas</button></div>
            {notifications.length ? notifications.slice(0, 8).map(n =>
              <button key={n.id} type="button" className="vmv10-notice" onClick={() => {onOpenNotification(n);setShowNotifications(false);}}>
                <strong>{n.title}</strong><small>{n.message}</small>
              </button>) : <p className="vmv10-empty">No tienes notificaciones.</p>}
          </div>}
        </div>
        <div className="vmv10-popover-anchor vmv10-account-area" ref={profileRef}>
          <button type="button" className="vmv10-profile"
            aria-label="Abrir menú de mi perfil"
            aria-haspopup="menu"
            aria-expanded={showProfile}
            onClick={() => { setShowProfile(v => !v); setShowNotifications(false); }}>
            <span className="vmv10-avatar">{firstLetter}</span>
            <span className="vmv10-user-name">
              <strong>{currentUser?.name || "Administrador"}</strong>
              <small>Administrador</small>
            </span>
            <ChevronDown className={showProfile ? "vmv10-chevron-open" : ""} size={17}/>
          </button>
          {showProfile && <div className="vmv10-dropdown vmv10-profile-menu" role="menu" aria-label="Opciones de mi cuenta">
            <div className="vmv10-account-summary">
              <span className="vmv10-avatar">{firstLetter}</span>
              <div>
                <strong>{currentUser?.name || "Administrador"}</strong>
                <small>{currentUser?.email || "Cuenta Administrador"}</small>
              </div>
            </div>
            <button role="menuitem" type="button" onClick={() => navigate("configuracion")}>
              <UserRound size={18}/> Ver mi perfil
            </button>
            <div className="vmv10-menu-separator"/>
            <button role="menuitem" type="button" className="vmv10-logout-action"
              onClick={() => { setShowProfile(false); onLogout(); }}>
              <LogOut size={18}/> Cerrar sesión
            </button>
          </div>}
        </div>
      </div>
    </header>

    <aside className="vmv10-sidebar" aria-label="Menú de administración">
      <nav>
        {LINKS.map(({id,label,icon:Icon}, i) => <React.Fragment key={id}>
          {i === 8 && <div className="vmv10-sidebar-divider" aria-hidden="true" />}
          <button type="button" className={activeKey === id ? "active" : ""}
            aria-current={activeKey === id ? "page" : undefined} onClick={() => navigate(id)}>
            <Icon size={19} strokeWidth={2.2}/><span>{label}</span>
          </button>
        </React.Fragment>)}
      </nav>
      <div className="vmv10-sidebar-foot"><PawPrint size={19}/><span>VetMap · Administración</span></div>
    </aside>
  </>;
}

/** No agrega un DOM wrapper a Dueño/Tienda/Veterinaria. */
export function VetMapAdminRouteBody({ admin, children }) {
  return admin ? <div className="vmv10-route-body">{children}</div> : <>{children}</>;
}
