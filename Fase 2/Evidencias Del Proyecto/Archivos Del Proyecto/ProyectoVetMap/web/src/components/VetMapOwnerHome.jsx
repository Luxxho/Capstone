import React, { useState } from "react";
import { PawPrint, CalendarDays, CalendarPlus, Package, Store, Stethoscope } from "lucide-react";
import "./VetMapOwnerHome.css";

/**
 * Inicio del dueño V15.
 * No contiene imágenes generadas: usa fotos cargadas por el dueño (photo_data)
 * y símbolos sencillos como respaldo.
 * Las acciones y los datos se reciben desde main.jsx para conservar la lógica.
 */
export default function VetMapOwnerHome({
  user,
  pets = [],
  reservations = [],
  orders = [],
  onPets,
  onAddPet,
  onViewPet,
  onReservations,
  onStores,
  onClinics,
  onOrders,
  onAccount,
  onSearchProducts,
  formatDate,
  formatAge,
  formatCLP,
  orderStatusLabel,
  getPetEmoji,
  nextReservation,
}) {
  const [search, setSearch] = useState("");
  const firstName = String(user?.name || "").trim().split(/\s+/)[0] || "amigo";
  const activeReservations = reservations.filter((item) =>
    !["completed", "cancelled"].includes(item.status)
  ).length;
  const activeOrders = orders.filter((item) =>
    !["delivered", "cancelled"].includes(item.status)
  ).length;
  const latestOrders = orders.slice(0, 3);
  const next = nextReservation || null;

  return (
    <section className="vm-o15-page" aria-label="Inicio del dueño de mascota">
      <div className="vm-o15-topbar">
        <div className="vm-o15-context"><span className="vm-o15-context-icon">🐾</span><span>Mi espacio VetMap</span></div>
        <form
          className="vm-o15-search"
          onSubmit={(event) => { event.preventDefault(); onSearchProducts(search.trim()); }}
        >
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar productos para tu mascota..."
            aria-label="Buscar productos"
          />
          <button type="submit" aria-label="Buscar productos">Buscar</button>
        </form>
        <button className="vm-o15-avatar-button" type="button" onClick={onAccount} title="Abrir mi perfil">
          <span className="vm-o15-avatar">{firstName.slice(0, 1).toUpperCase()}</span>
          <span className="vm-o15-avatar-text"><strong>{user?.name || "Mi perfil"}</strong><small>Dueño de mascota</small></span>
        </button>
      </div>

      <section className="vm-o15-hero vm-v2719-hero">
        <div className="vm-v2719-visual vm-v2719-visual--owner" aria-hidden="true">
          <span className="vm-v2719-ring vm-v2719-ring--one" />
          <span className="vm-v2719-ring vm-v2719-ring--two" />
          <div className="vm-v2719-icon-tile">
            <svg className="vm-v2719-symbol" viewBox="0 0 96 96" fill="currentColor" aria-hidden="true" focusable="false">
              <ellipse cx="18" cy="34" rx="8" ry="11" transform="rotate(-23 18 34)" />
              <ellipse cx="37" cy="22" rx="9" ry="11" transform="rotate(-10 37 22)" />
              <ellipse cx="60" cy="22" rx="9" ry="11" transform="rotate(10 60 22)" />
              <ellipse cx="79" cy="34" rx="8" ry="11" transform="rotate(23 79 34)" />
              <path d="M48 42c-11 0-15 10-23 19-8 9-4 22 7 23 6 1 10-4 16-4s10 5 16 4c11-1 15-14 7-23-8-9-12-19-23-19Z" />
            </svg>
          </div>
        </div>
        <div className="vm-o15-hero-copy">
          <p className="vm-o15-eyebrow">BIENVENIDO A TU ESPACIO</p>
          <h1>¡Hola, {firstName}! <span aria-hidden="true">👋</span></h1>
          <p>Todo lo que tus mascotas necesitan, en un solo lugar.</p>
          <button className="vm-o15-hero-link" type="button" onClick={onPets}>
            Ver mis mascotas <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="vm-o15-hero-decor" aria-hidden="true">
          <div className="vm-o15-orbit vm-o15-orbit-a" />
          <div className="vm-o15-orbit vm-o15-orbit-b" />
          <span className="vm-o15-big-paw">🐾</span>
          <div className="vm-o15-hero-note vm-v2713-no-card">
            <svg className="vm-v2713-line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="6" cy="7.5" r="1.55" />
              <circle cx="10.5" cy="4.8" r="1.55" />
              <circle cx="15.6" cy="5.9" r="1.55" />
              <circle cx="19.3" cy="9.5" r="1.55" />
              <path d="M12 10.4c-2.3 0-3.3 2-4.9 3.8-1.4 1.7-2.8 3.1-2.8 4.5 0 1.5 1.1 2.6 2.7 2.6 1.4 0 2.3-.9 3.7-.9s2.3.9 3.7.9c1.6 0 2.7-1.1 2.7-2.6 0-1.4-1.4-2.8-2.8-4.5-1.6-1.8-2.6-3.8-4.9-3.8z" />
            </svg>
            <strong>Cuidamos lo que más amas</strong>
          </div>
        </div>
      </section>

      <div className="vm-o15-stat-grid">
        <article className="vm-o15-stat"><span className="vm-o15-stat-icon vm-o15-icon-teal"><PawPrint size={25} strokeWidth={2.2} aria-hidden="true" /></span><div><strong>{pets.length}</strong><small>Mascotas registradas</small></div></article>
        <article className="vm-o15-stat"><span className="vm-o15-stat-icon vm-o15-icon-pink"><CalendarDays size={25} strokeWidth={2.2} aria-hidden="true" /></span><div><strong>{activeReservations}</strong><small>Reservas activas</small></div></article>
        <article className="vm-o15-stat"><span className="vm-o15-stat-icon vm-o15-icon-orange"><Package size={25} strokeWidth={2.2} aria-hidden="true" /></span><div><strong>{activeOrders}</strong><small>Pedidos en curso</small></div></article>
      </div>

      <div className="vm-o15-content-grid">
        <div className="vm-o15-stack">
          <section className="vm-o15-panel vm-o15-pets-panel">
            <div className="vm-o15-panel-head"><h2>Mis mascotas</h2><button type="button" onClick={onPets}>Ver todas <span aria-hidden="true">→</span></button></div>
            <div className="vm-o15-pet-grid">
              {pets.slice(0, 3).map((pet) => (
                <button className="vm-o15-pet-tile" type="button" key={pet.id} onClick={() => onViewPet(pet)} title={`Ver ficha de ${pet.name}`}>
                  <span className="vm-o15-pet-photo">
                    {pet.photo_data ? <img src={pet.photo_data} alt={`Foto registrada de ${pet.name}`} loading="lazy" /> : <span aria-hidden="true">{getPetEmoji(pet.species)}</span>}
                  </span>
                  <strong>{pet.name}</strong>
                  <small>{pet.breed || pet.species || "Mascota"}</small>
                  <small>{formatAge(pet.age, pet.age_months)}</small>
                </button>
              ))}
              <button className="vm-o15-add-pet" type="button" onClick={onAddPet}>
                <span aria-hidden="true">+</span><strong>Agregar mascota</strong>
              </button>
            </div>
            {pets.length === 0 && <p className="vm-o15-empty-inline">Registra tu primera mascota y aquí aparecerá su ficha.</p>}
          </section>

          <section className="vm-o15-panel">
            <div className="vm-o15-panel-head"><h2>Mis pedidos recientes</h2><button type="button" onClick={onOrders}>Ver todos <span aria-hidden="true">→</span></button></div>
            {latestOrders.length ? (
              <div className="vm-o15-orders">
                {latestOrders.map((order) => (
                  <button type="button" className="vm-o15-order" key={order.id} onClick={onOrders}>
                    <span className="vm-o15-order-icon" aria-hidden="true"><Package size={21} strokeWidth={2.2} /></span>
                    <div><strong>Pedido #{order.id}</strong><small>{order.store_name || "Tienda VetMap"}</small></div>
                    <div className="vm-o15-order-end"><strong>{formatCLP(order.total)}</strong><span className={`vm-o15-status vm-o15-status--${order.status}`}>{orderStatusLabel(order.status)}</span></div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="vm-o15-empty"><span aria-hidden="true"><Package size={28} strokeWidth={2.1} /></span><strong>Sin pedidos todavía</strong><p>Explora tiendas para encontrar lo que tu mascota necesita.</p><button type="button" onClick={onStores}>Explorar tiendas →</button></div>
            )}
          </section>
        </div>

        <div className="vm-o15-stack">
          <section className="vm-o15-panel">
            <div className="vm-o15-panel-head"><h2>Acciones rápidas</h2></div>
            <div className="vm-o15-action-grid">
              <button className="vm-o15-action vm-o15-action-blue" type="button" onClick={onReservations}><span className="vm-o15-action-icon"><CalendarPlus size={24} strokeWidth={2.2} aria-hidden="true" /></span><strong>Agendar hora</strong><small>Con una veterinaria</small><span className="vm-o15-action-arrow">↗</span></button>
              <button className="vm-o15-action vm-o15-action-warm" type="button" onClick={onStores}><span className="vm-o15-action-icon"><Store size={24} strokeWidth={2.2} aria-hidden="true" /></span><strong>Explorar tiendas</strong><small>Productos para mascotas</small><span className="vm-o15-action-arrow">↗</span></button>
              <button className="vm-o15-action vm-o15-action-sky" type="button" onClick={onClinics}><span className="vm-o15-action-icon"><Stethoscope size={24} strokeWidth={2.2} aria-hidden="true" /></span><strong>Ver veterinarias</strong><small>Centros y servicios</small><span className="vm-o15-action-arrow">↗</span></button>
              <button className="vm-o15-action vm-o15-action-peach" type="button" onClick={onOrders}><span className="vm-o15-action-icon"><Package size={24} strokeWidth={2.2} aria-hidden="true" /></span><strong>Mis pedidos</strong><small>Compra y seguimiento</small><span className="vm-o15-action-arrow">↗</span></button>
            </div>
          </section>

          <section className="vm-o15-panel vm-o15-appointment-panel">
            <div className="vm-o15-panel-head"><h2>Próxima reserva</h2><button type="button" onClick={onReservations}>Ver reservas →</button></div>
            {next ? (
              <div className="vm-o15-appointment-detail">
                <span className="vm-o15-appointment-date">{formatDate(next.appointment_date)} · {String(next.appointment_time || "").slice(0, 5)}</span>
                <strong>{next.service || "Atención veterinaria"}</strong>
                <small>{next.pet_name || "Tu mascota"} · {next.veterinary_name || "Veterinaria VetMap"}</small>
              </div>
            ) : (
              <div className="vm-o15-appointment-empty"><span>♡</span><strong>Todo al día</strong><p>No tienes próximas reservas. Puedes agendar una cuando quieras.</p></div>
            )}
          </section>
          <div className="vm-o15-footer-message"><span aria-hidden="true">♥</span><div><strong>Mascotas saludables, dueños más felices</strong><small>Gracias por cuidar de quienes te acompañan.</small></div></div>
        </div>
      </div>
    </section>
  );
}
