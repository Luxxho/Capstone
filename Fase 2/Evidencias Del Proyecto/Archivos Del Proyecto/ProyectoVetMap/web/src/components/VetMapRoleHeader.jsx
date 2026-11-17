import React, { useEffect, useRef, useState } from "react";
import {
  Bell, ChevronDown, LogOut, PawPrint, Search, ShoppingCart, UserRound,
} from "lucide-react";
import "./VetMapRoleHeader.css";

const ROLE_NAMES = {
  owner: "Dueño de mascota",
  vet: "Veterinaria",
  store: "Tienda",
};

const MENU = {
  owner: [
    ["inicio", "Inicio"], ["pets", "Mis mascotas"], ["reserva", "Reservas"],
    ["orders", "Mis pedidos"], ["tienda", "Tiendas"],
    ["veterinarias", "Veterinarias"], ["profile", "Mi perfil"],
  ],
  vet: [
    ["inicio", "Inicio"], ["clinicAgenda", "Agenda"],
    ["clinicPatients", "Pacientes"], ["clinicPrescriptions", "Recetas"],
    ["profile", "Mi perfil"],
  ],
  store: [
    ["inicio", "Inicio"], ["storeProducts", "Productos"],
    ["storeOrders", "Pedidos"], ["storeHistory", "Historial"],
    ["profile", "Mi perfil"],
  ],
};

export default function VetMapRoleHeader({
  user,
  notifications = [],
  cartCount = 0,
  onNavigate,
  onSearchProducts,
  onOpenNotification,
  onMarkAllRead,
  onOpenCart,
  onLogout,
}) {
  const role = ROLE_NAMES[user?.role] ? user.role : "owner";
  const [search, setSearch] = useState("");
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const popoversRef = useRef(null);
  const unread = notifications.filter((item) => !item.is_read).length;
  const initial = String(user?.name || user?.email || "U").trim().slice(0, 1).toUpperCase();
  const menuEntries = MENU[role];
  const normalizedSearch = search.trim().toLocaleLowerCase("es");
  const suggestions = normalizedSearch
    ? menuEntries.filter(([, label]) => label.toLocaleLowerCase("es").includes(normalizedSearch))
    : [];

  useEffect(() => {
    const outside = (event) => {
      if (popoversRef.current && !popoversRef.current.contains(event.target)) {
        setNoticeOpen(false);
        setProfileOpen(false);
      }
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setNoticeOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  const navigate = (section) => {
    setProfileOpen(false);
    setNoticeOpen(false);
    setSearch("");
    onNavigate?.(section);
  };

  const doSearch = (event) => {
    event.preventDefault();
    const term = search.trim();
    if (!term) return;
    if (suggestions.length) {
      navigate(suggestions[0][0]);
    } else if (role === "owner") {
      setSearch("");
      onSearchProducts?.(term);
    }
  };

  return (
    <header className={`vmh16-topbar vmh16-topbar--${role}`} aria-label={`Cabecera VetMap ${ROLE_NAMES[role]}`}>
      <button className="vmh16-brand" type="button" onClick={() => navigate("inicio")} aria-label="Ir al inicio">
        <span className="vmh16-brand-icon"><PawPrint size={25} strokeWidth={2.4} /></span>
        <span className="vmh16-brand-text">VetMap<small>CUIDADO INTEGRAL</small></span>
      </button>

      <form className="vmh16-search" role="search" onSubmit={doSearch}>
        <Search size={19} aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={role === "owner" ? "Buscar productos o secciones..." : "Buscar en el menú de VetMap..."}
          aria-label="Buscar en VetMap"
        />
        {!!suggestions.length && (
          <div className="vmh16-search-results">
            {suggestions.map(([section, label]) => (
              <button key={section} type="button" onClick={() => navigate(section)}>{label}</button>
            ))}
          </div>
        )}
      </form>

      <div className="vmh16-actions" ref={popoversRef}>
        <div className="vmh16-popover-anchor">
          <button
            type="button"
            className="vmh16-icon-button"
            title="Notificaciones"
            aria-label="Abrir notificaciones"
            aria-expanded={noticeOpen}
            onClick={() => { setNoticeOpen((v) => !v); setProfileOpen(false); }}
          >
            <Bell size={22} />
            {unread > 0 && <span className="vmh16-counter">{Math.min(unread, 99)}</span>}
          </button>
          {noticeOpen && (
            <div className="vmh16-dropdown vmh16-notifications">
              <div className="vmh16-drop-heading">
                <strong>Notificaciones</strong>
                {unread > 0 && <button type="button" onClick={onMarkAllRead}>Marcar leídas</button>}
              </div>
              {notifications.length === 0 ? (
                <p className="vmh16-empty">No tienes notificaciones pendientes.</p>
              ) : notifications.slice(0, 10).map((notice) => (
                <button key={notice.id} type="button" className="vmh16-notice" onClick={() => { onOpenNotification?.(notice); setNoticeOpen(false); }}>
                  <strong>{notice.title}</strong><small>{notice.message}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        {role === "owner" && (
          <button
            type="button"
            className="vmh16-icon-button"
            aria-label="Abrir mi carrito"
            title="Mi carrito"
            onClick={() => { setNoticeOpen(false); setProfileOpen(false); onOpenCart?.(); }}
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="vmh16-counter">{Math.min(cartCount, 99)}</span>}
          </button>
        )}

        <div className="vmh16-popover-anchor vmh16-account-anchor">
          <button
            type="button"
            className="vmh16-profile-button"
            aria-label="Abrir menú de perfil"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => { setProfileOpen((v) => !v); setNoticeOpen(false); }}
          >
            <span className="vmh16-avatar">{initial}</span>
            <span className="vmh16-account-copy">
              <strong>{user?.name || "Mi cuenta"}</strong>
              <small>{ROLE_NAMES[role]}</small>
            </span>
            <ChevronDown size={17} aria-hidden="true" />
          </button>
          {profileOpen && (
            <div className="vmh16-dropdown vmh16-account-dropdown" role="menu" aria-label="Opciones de usuario">
              <div className="vmh16-account-summary"><strong>{user?.name || "Mi cuenta"}</strong><small>{user?.email || ROLE_NAMES[role]}</small></div>
              <button type="button" role="menuitem" onClick={() => navigate("profile")}><UserRound size={17} /> Ver mi perfil</button>
              <button type="button" role="menuitem" className="vmh16-logout" onClick={() => { setProfileOpen(false); onLogout?.(); }}><LogOut size={17} /> Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
