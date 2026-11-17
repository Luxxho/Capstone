import React from "react";
import {
  Activity, House, UserRound, AlertTriangle, ArrowRight, BarChart3, CalendarDays,
  CheckCircle2, ChevronRight, ClipboardList, Clock3, HeartPulse,
  Package, PawPrint, ShoppingCart, Stethoscope, Users, Syringe,
  TrendingUp, Store, Boxes, FileText, Settings2, Search, PackageCheck,
  Scissors, CalendarClock, Heart, ShieldCheck,
} from "lucide-react";
import "./VetMapReferenceHomes.css";

const asArray = (value) => Array.isArray(value) ? value : [];
const n = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const first = (text) => String(text || "").trim().split(/\s+/)[0] || "";
const money = (value) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n(value));
const dateText = (value) => {
  if (!value) return "Sin fecha";
  const d = new Date(String(value).slice(0, 10) + "T12:00:00");
  return Number.isNaN(d.getTime()) ? String(value) : new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", year: "numeric" }).format(d);
};
const statusName = (value) => ({
  pending: "Pendiente", preparing: "En preparación", ready: "Listo",
  dispatched: "Despachado", delivered: "Entregado", cancelled: "Cancelado",
  confirmed: "Confirmada", completed: "Completada",
}[value] || value || "Sin estado");
const iconProps = { size: 20, strokeWidth: 2.1, "aria-hidden": true };
function Kpi({ icon: Icon, count, label, tone = "blue" }) {
  return <article className="vmref-kpi"><span className={`vmref-kpi-icon tone-${tone}`}><Icon {...iconProps}/></span><div><strong>{count}</strong><small>{label}</small></div></article>;
}
function Block({ title, action, onAction, children, className = "" }) {
  return <section className={`vmref-block ${className}`}><header className="vmref-block-title"><h2>{title}</h2>{action && <button type="button" className="vmref-text-action" onClick={onAction}>{action}<ArrowRight size={14}/></button>}</header>{children}</section>;
}
function Empty({ icon: Icon = CheckCircle2, title, text }) {
  return <div className="vmref-empty"><Icon size={28} strokeWidth={1.8}/><strong>{title}</strong><small>{text}</small></div>;
}
function Thumbnail({ src, name, pet = false }) {
  const valid = typeof src === "string" && (/^data:image\//.test(src) || /^https?:\/\//i.test(src) || src.startsWith("/"));
  return <span className={`vmref-thumbnail ${pet ? "vmref-pet-avatar" : ""}`}>{valid ? <img src={src} alt={name || ""}/> : pet ? <PawPrint size={21}/> : <Package size={21}/>}</span>;
}
const topSales = (orders, products) => {
  const grouped = new Map();
  orders.filter(o => o.status !== "cancelled").forEach(order => asArray(order.items).forEach(item => {
    const id = String(item.product_id || item.product_name);
    const prev = grouped.get(id) || { name: item.product_name || "Producto", units: 0, id: item.product_id };
    prev.units += n(item.quantity);
    grouped.set(id, prev);
  }));
  return [...grouped.values()].sort((a,b) => b.units - a.units).slice(0,3).map(entry => ({ ...entry, product: products.find(p => p.id === entry.id) }));
};
const deriveClients = (orders) => {
  const m = new Map();
  for (const o of orders) {
    const key = o.user_id || o.user_name || o.id;
    const old = m.get(key) || { name: o.user_name || "Cliente", orders: 0, total: 0 };
    old.orders++; old.total += n(o.total); m.set(key,old);
  }
  return [...m.values()].sort((a,b) => b.orders-a.orders);
};
function StoreHome({ user, dashboard, products, orders, navigate }) {
  const stats = dashboard?.stats || {};
  const total = orders.filter(o => o.status === "delivered").reduce((sum,o) => sum + n(o.total),0);
  const lowProducts = products.filter(p => p.active !== false && n(p.stock) <= 5);
  const popular = topSales(orders,products);
  const recent = asArray(dashboard?.recent_orders).length ? dashboard.recent_orders : orders;
  return <div className="vmref-dashboard vmref-store">
    <section className="vmref-hero vmref-store-hero">
      <div className="vmref-hero-copy"><h1>¡Hola, {first(user?.name)}!</h1><p>Gestiona tus productos, pedidos y ventas<br className="vmref-br"/> de forma simple y efectiva.</p></div>
      
      <div className="vmref-hero-tag"><strong>Tu tienda<br/>también cuida<br/>vidas</strong><ShoppingCart size={24}/></div>
    </section>
    <div className="vmref-stats">
      <Kpi icon={Package} count={stats.products ?? products.filter(x => x.active !== false).length} label="Productos activos" tone="orange"/>
      <Kpi icon={ShoppingCart} count={stats.pending_orders ?? orders.filter(x => ["pending", "preparing"].includes(x.status)).length} label="Pedidos pendientes" tone="rose"/>
      <Kpi icon={AlertTriangle} count={stats.low_stock ?? lowProducts.length} label="Stock bajo" tone="amber"/>
      <Kpi icon={BarChart3} count={money(total)} label="Ventas entregadas" tone="teal"/>
    </div>
    <div className="vmref-store-columns">
      <Block title="Pedidos recientes" action="Ver todos" onAction={() => navigate("storeOrders")}>
        <div className="vmref-list">
          {recent.length ? recent.slice(0,4).map(o => <button type="button" className="vmref-order-line" key={o.id} onClick={() => navigate("storeOrders")}><Thumbnail name="Pedido"/><span className="vmref-row-text"><strong>#PD-{o.id}</strong><small>{o.user_name || "Cliente"}</small></span><span className="vmref-row-money"><strong>{money(o.total)}</strong><small>{dateText(o.created_at)}</small></span><span className={`vmref-status status-${o.status}`}>{statusName(o.status)}</span><ChevronRight size={16}/></button>) : <Empty icon={ShoppingCart} title="Aún no hay pedidos" text="Los pedidos nuevos aparecerán aquí"/>}
        </div>
      </Block>
      <Block title="Productos con stock bajo" action="Ver todos" onAction={() => navigate("storeStock")} className="vmref-low-stock">
        <div className="vmref-list">{lowProducts.length ? lowProducts.slice(0,4).map(p => <button type="button" className="vmref-product-line" key={p.id} onClick={() => navigate("storeStock")}><Thumbnail name={p.name}/><span className="vmref-row-text"><strong>{p.name}</strong><small>Quedan {n(p.stock)} unidades</small></span><ChevronRight size={16}/></button>) : <Empty title="Stock en buen estado" text="No hay productos con cinco unidades o menos"/>}</div>
      </Block>
    </div>
    <div className="vmref-store-bottom">
      <Block title="Productos más vendidos" action="Ver todos" onAction={() => navigate("storeProducts")}>
        <div className="vmref-feature-products">{popular.length ? popular.map(p => <button className="vmref-popular" type="button" key={p.id || p.name} onClick={() => navigate("storeProducts")}><Thumbnail name={p.name}/><span><strong>{p.name}</strong><small>{p.units} unidades vendidas</small></span></button>) : <Empty icon={Package} title="Sin ventas registradas" text="Aquí aparecerán tus productos más vendidos"/>}</div>
      </Block>
      <div className="vmref-promo"><div><strong>Aumenta tus ventas</strong><p>haciendo felices a más mascotas</p></div><TrendingUp size={52}/><button type="button" onClick={() => navigate("storeProducts")} aria-label="Gestionar productos"><ArrowRight size={20}/></button></div>
    </div>
  </div>;
}
function StoreExtra({ view, dashboard, products, orders, navigate }) {
  const low = products.filter(p => p.active !== false && n(p.stock) <= 5);
  const heading = {storeStock:"Control de stock",storeCustomers:"Clientes de la tienda",storeAnalytics:"Analíticas de ventas",storeInfo:"Mi tienda"}[view] || "Tienda";
  const clients = deriveClients(orders);
  return <div className="vmref-dashboard vmref-store vmref-extra"><div className="vmref-extra-head"><span>GESTIÓN DE TIENDA</span><h1>{heading}</h1><p>Información actualizada con los datos registrados en VetMap.</p></div>
    {view === "storeStock" && <Block title="Productos con 5 unidades o menos" action="Gestionar productos" onAction={() => navigate("storeProducts")}><div className="vmref-data-list">{low.length ? low.map(p=><div className="vmref-data-line" key={p.id}><Thumbnail name={p.name}/><div><strong>{p.name}</strong><small>{p.category || "Producto"}</small></div><span className="vmref-bad-qty">{n(p.stock)} disponibles</span></div>) : <Empty title="No hay alertas de stock" text="Tu inventario está en buen estado"/>}</div></Block>}
    {view === "storeCustomers" && <Block title="Compradores registrados"><div className="vmref-data-list">{clients.length ? clients.map((c,i)=><div className="vmref-data-line" key={i}><span className="vmref-avatar-initial">{c.name.slice(0,1).toUpperCase()}</span><div><strong>{c.name}</strong><small>{c.orders} pedidos registrados</small></div><b>{money(c.total)}</b></div>) : <Empty icon={Users} title="Todavía no hay clientes" text="Aparecerán al recibir pedidos"/>}</div></Block>}
    {view === "storeAnalytics" && <><div className="vmref-stats"><Kpi icon={Package} count={dashboard?.stats?.products ?? products.length} label="Productos" tone="orange"/><Kpi icon={ShoppingCart} count={orders.length} label="Pedidos registrados" tone="rose"/><Kpi icon={PackageCheck} count={orders.filter(o=>o.status==="delivered").length} label="Entregados" tone="teal"/><Kpi icon={TrendingUp} count={money(orders.filter(o=>o.status==="delivered").reduce((s,o)=>s+n(o.total),0))} label="Ventas entregadas" tone="amber"/></div><Block title="Últimos movimientos">{orders.slice(0,8).map(o=><div className="vmref-data-line" key={o.id}><Thumbnail/><div><strong>Pedido #{o.id}</strong><small>{o.user_name}</small></div><b>{money(o.total)}</b></div>)}</Block></>}
    {view === "storeInfo" && <Block title="Datos de tu tienda"><div className="vmref-info"><Store size={35}/><div><h2>{dashboard?.store?.name || "Mi tienda"}</h2><p>{dashboard?.store?.commune || "Comuna no registrada"}</p><p>{dashboard?.store?.address || "Dirección no registrada"}</p></div></div></Block>}
  </div>;
}
export function VetMapReferenceStore({ user, dashboard, products = [], orders = [], view = "inicio", onNavigate = () => {} }) {
  const navigate = (where) => onNavigate(where);
  const common = { user, dashboard, products: asArray(products), orders: asArray(orders), navigate };
  return view === "inicio" ? <StoreHome {...common}/> : <StoreExtra {...common} view={view}/>;
}
function ClinicHome({user,dashboard,appointments,patients,prescriptions,navigate}) {
  const stats = dashboard?.stats || {};
  const upcoming = asArray(dashboard?.upcoming);
  const today = new Date().toLocaleDateString("en-CA");
  const agenda = upcoming.filter(a => a.appointment_date === today);
  const shown = agenda.length ? agenda : upcoming;
  const clinicServices = Array.isArray(dashboard?.clinic?.services) ? dashboard.clinic.services : String(dashboard?.clinic?.services || "").split(/[;,\n]/).map(x => x.trim()).filter(Boolean);
  return <div className="vmref-dashboard vmref-vet">
    <section className="vmref-hero vmref-vet-hero"><div className="vmref-hero-copy"><h1>¡Hola, {first(user?.name)}!</h1><p>Gestiona tus reservas, pacientes y servicios<br className="vmref-br"/> de forma simple.</p></div><div className="vmref-vet-tag">Profesionales<br/>por mascotas<br/>más saludables <Heart size={16}/></div></section>
    <div className="vmref-stats"><Kpi icon={CalendarDays} count={stats.today_appointments ?? agenda.length} label="Reservas hoy" tone="blue"/><Kpi icon={Users} count={patients.length} label="Pacientes registrados" tone="blue"/><Kpi icon={Stethoscope} count={clinicServices.length} label="Servicios activos" tone="blue"/><Kpi icon={Clock3} count={stats.pending_appointments ?? 0} label="Pendientes de atención" tone="rose"/></div>
    <div className="vmref-vet-columns"><Block title="Agenda de hoy" action="Ver calendario" onAction={()=>navigate("clinicAgenda")}><div className="vmref-list">{shown.length ? shown.slice(0,4).map(a=><button type="button" className="vmref-clinic-appt" key={a.id} onClick={()=>navigate("clinicAgenda")}><time>{String(a.appointment_time || "--:--").slice(0,5)}</time><Thumbnail pet name={a.pet_name}/><span className="vmref-row-text"><strong>{a.pet_name || "Mascota"}</strong><small>{a.service || "Atención veterinaria"}</small></span><span className={`vmref-status status-${a.status}`}>{statusName(a.status)}</span></button>) : <Empty icon={CalendarDays} title="No hay reservas próximas" text="Tu agenda está al día"/>}</div></Block>
    <Block title="Pacientes recientes" action="Ver todos" onAction={()=>navigate("clinicPatients")}><div className="vmref-list">{patients.length ? patients.slice(0,4).map(p=><button type="button" className="vmref-clinic-patient" key={p.id} onClick={()=>navigate("clinicPatients")}><Thumbnail pet name={p.name} src={p.photo_data}/><span className="vmref-row-text"><strong>{p.name}</strong><small>{p.breed || p.species || "Mascota"}</small></span><span className="vmref-patient-link">Ver ficha</span></button>) : <Empty icon={PawPrint} title="Sin pacientes registrados" text="Aparecerán al recibir reservas"/>}</div></Block>
    <Block title="Accesos rápidos"><div className="vmref-quick-actions"><button type="button" onClick={()=>navigate("clinicAgenda")}><CalendarDays/>Revisar agenda<ChevronRight/></button><button type="button" onClick={()=>navigate("clinicPatients")}><ClipboardList/>Historial clínico<ChevronRight/></button><button type="button" onClick={()=>navigate("clinicPatients")}><Users/>Gestionar pacientes<ChevronRight/></button><button type="button" onClick={()=>navigate("clinicServices")}><Stethoscope/>Servicios y precios<ChevronRight/></button></div></Block></div>
    <div className="vmref-vet-bottom"><Block title="Resumen de atenciones"><div className="vmref-clinic-summary"><Kpi icon={ClipboardList} count={appointments.length} label="Reservas registradas" tone="blue"/><Kpi icon={CheckCircle2} count={appointments.filter(a=>a.status==="completed").length} label="Atenciones completadas" tone="teal"/><Kpi icon={FileText} count={prescriptions.length || stats.prescriptions || 0} label="Recetas emitidas" tone="blue"/><Kpi icon={Users} count={patients.length} label="Pacientes registrados" tone="blue"/></div></Block><div className="vmref-vet-promo"><div><strong>Cuidamos su salud<br/>en cada etapa</strong><HeartPulse size={28}/></div><PawPrint size={84}/></div></div>
  </div>;
}
function ClinicExtra({view,dashboard,appointments,patients,prescriptions,navigate}) {
  const services = Array.isArray(dashboard?.clinic?.services) ? dashboard.clinic.services : String(dashboard?.clinic?.services || "").split(/[;,\n]/).map(s=>s.trim()).filter(Boolean);
  return <div className="vmref-dashboard vmref-vet vmref-extra"><div className="vmref-extra-head"><span>PANEL VETERINARIO</span><h1>{view === "clinicServices" ? "Servicios veterinarios" : "Reportes de la clínica"}</h1><p>Información registrada para {dashboard?.clinic?.name || "tu veterinaria"}.</p></div>{view === "clinicServices" ? <Block title="Servicios disponibles"><div className="vmref-services">{services.length ? services.map((s,i)=><div className="vmref-service" key={i}><Stethoscope/><strong>{typeof s === "string" ? s : s.name || "Servicio"}</strong></div>) : <Empty icon={Stethoscope} title="Sin servicios configurados" text="Los servicios se mostrarán cuando estén registrados"/>}</div></Block> : <><div className="vmref-stats"><Kpi icon={CalendarDays} count={appointments.length} label="Reservas"/><Kpi icon={CheckCircle2} count={appointments.filter(x=>x.status==="completed").length} label="Atenciones completadas" tone="teal"/><Kpi icon={Users} count={patients.length} label="Pacientes"/><Kpi icon={FileText} count={prescriptions.length || dashboard?.stats?.prescriptions || 0} label="Recetas"/></div><Block title="Actividad general"><div className="vmref-data-line"><Stethoscope/><div><strong>{dashboard?.clinic?.name || "Veterinaria"}</strong><small>Datos reales de VetMap</small></div><button className="vmref-text-action" onClick={()=>navigate("clinicAgenda")}>Abrir agenda <ArrowRight size={16}/></button></div></Block></>}</div>;
}
export function VetMapReferenceClinic({ user, dashboard, appointments = [], patients = [], prescriptions = [], view = "inicio", onNavigate = () => {} }) {
  const props = { user, dashboard, appointments: asArray(appointments), patients: asArray(patients), prescriptions: asArray(prescriptions), navigate: onNavigate };
  return view === "inicio" ? <ClinicHome {...props}/> : <ClinicExtra {...props} view={view}/>;
}
export function VetMapReferenceNavIcon({name}) {
  const icons = {home:House,products:Package,orders:ShoppingCart,stock:Boxes,users:Users,analytics:BarChart3,store:Store,settings:Settings2,patients:PawPrint,agenda:CalendarDays,history:ClipboardList,services:Stethoscope,calendar:CalendarClock,reports:FileText,profile:UserRound,recipes:FileText};
  const Icon = icons[name] || Package;
  return <Icon className="vmref-nav-svg" size={18} strokeWidth={2} aria-hidden="true"/>;
}
