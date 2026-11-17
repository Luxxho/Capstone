# -*- coding: utf-8 -*-
"""VetMap V24. Repara SOLO el inicio y el menú lateral de Tienda.

Compatible con el código V19/V20 y con V21+V22+V23 aplicados.
Hace un respaldo antes de modificar web/src/main.jsx. No modifica index.css.
"""
from pathlib import Path
from datetime import datetime
import hashlib
import json
import re
import shutil

CSS_FILENAME = "vetmap_tienda_v24.css"
CSS_IMPORT = 'import "./vetmap_tienda_v24.css";'
HOME_START = '{currentUser.role === "store" && memberSection === "inicio" && ('
HOME_END = '{currentUser.role === "store" &&\n                memberSection === "storeProducts" && ('
NAV_START = '                  ) : currentUser.role === "store" ? ('
NAV_END = '                  ) : currentUser.role === "admin" ? ('

HOME = r'''{currentUser.role === "store" && memberSection === "inicio" && (
                <section className="vm-store-dashboard vm-v24-store-home">
                  <section className="vm-v24-store-hero">
                    <div className="vm-v24-store-hero-copy">
                      <span className="vm-v24-store-eyebrow">PANEL DE TIENDA</span>
                      <h1>¡Hola, {firstName(currentUser.name)}!</h1>
                      <p>Gestiona tus productos, pedidos y ventas de forma simple y efectiva.</p>
                    </div>
                    <div className="vm-v24-store-identity">
                      <span className="vm-v24-store-identity-icon" aria-hidden="true">🏬</span>
                      <div>
                        <small>MI TIENDA</small>
                        <strong>{storeDashboard?.store?.name || "Tienda VetMap"}</strong>
                        <span>{storeDashboard?.store?.commune || "Panel comercial"}</span>
                      </div>
                    </div>
                  </section>

                  <section className="vm-v24-store-kpis" aria-label="Indicadores de tienda">
                    <article className="vm-v24-store-kpi">
                      <span className="vm-v24-store-kpi-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-5 9 5v10l-9 4-9-4zM3 9l9 5 9-5M12 14v9" /></svg>
                      </span>
                      <div><strong>{storeDashboard?.stats?.products ?? storeProducts.length}</strong><small>Productos activos</small></div>
                    </article>
                    <article className="vm-v24-store-kpi">
                      <span className="vm-v24-store-kpi-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h2l2.4 11h10.9l2-8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
                      </span>
                      <div><strong>{storeDashboard?.stats?.pending_orders ?? 0}</strong><small>Pedidos pendientes</small></div>
                    </article>
                    <article className="vm-v24-store-kpi">
                      <span className="vm-v24-store-kpi-icon vm-v24-store-kpi-icon--alert" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 10 18H2z"/><path d="M12 9v5m0 3h.01"/></svg>
                      </span>
                      <div><strong>{storeDashboard?.stats?.low_stock ?? storeLowStockCount()}</strong><small>Stock bajo</small></div>
                    </article>
                    <article className="vm-v24-store-kpi">
                      <span className="vm-v24-store-kpi-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5m0 14h17M7 15l5-6 4 3 5-7"/></svg>
                      </span>
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
                          <span aria-hidden="true">📦</span>
                          <strong>Sin pedidos recientes</strong>
                          <small>Los nuevos pedidos aparecerán aquí.</small>
                        </div>
                      ) : (
                        <div className="vm-v24-store-list">
                          {storeDashboard.recent_orders.slice(0, 4).map((order) => (
                            <button type="button" className="vm-v24-store-list-row" key={order.id} onClick={() => setMemberSection("storeOrders")}>
                              <span className="vm-v24-store-row-icon" aria-hidden="true">📦</span>
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
                          <span className="vm-v24-store-empty-success" aria-hidden="true">✓</span>
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
                        <button type="button" onClick={() => setMemberSection("storeProducts")}><span aria-hidden="true">📦</span>Gestionar productos <b>›</b></button>
                        <button type="button" onClick={() => setMemberSection("storeOrders")}><span aria-hidden="true">🛒</span>Revisar pedidos <b>›</b></button>
                        <button type="button" onClick={() => setMemberSection("storeHistory")}><span aria-hidden="true">📋</span>Historial de ventas <b>›</b></button>
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
                      <svg aria-hidden="true" className="vm-v24-store-highlight-art" viewBox="0 0 100 100" fill="none"><path d="M18 39V25l32-15 32 15v14L50 55 18 39Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/><path d="M18 40v35l32 15 32-15V40M50 55v35" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/><path d="M70 20v18" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg>
                    </article>
                  </section>
                </section>
              )}
'''
NAV = r'''                  ) : currentUser.role === "store" ? (
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
'''
CSS = r'''/* VetMap V24: tienda: dashboard clásico y barra lateral. Aislado al rol store. */
.vm-store-dashboard.vm-v24-store-home {
  --v24-ink: #102d5e;
  --v24-line: #d4e7e3;
  --v24-accent: #ef8b36;
  display: grid !important;
  gap: 12px !important;
  padding: 0 0 22px !important;
  margin: 0 !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  color: var(--v24-ink) !important;
  width: 100% !important;
  max-width: none !important;
}
.vm-v24-store-home *, .vm-v24-store-sidebar * {box-sizing:border-box;}
.vm-v24-store-home .vm-v24-store-hero {
  display: flex !important; justify-content: space-between !important; align-items:center !important;
  min-height: 170px !important; gap: 20px !important; padding: 22px 26px !important;
  border-radius: 22px !important; border: 1px solid #f1ddc8 !important;
  background: linear-gradient(110deg,#fff9f0 0%,#fff1dc 64%,#ffe9d1 100%) !important;
  box-shadow: none !important; overflow: hidden !important;
}
.vm-v24-store-hero-copy {min-width:0; flex:1;}
.vm-v24-store-home .vm-v24-store-eyebrow {color:#b85815 !important; font-size:10px !important; font-weight:900 !important; letter-spacing:1.5px !important;}
.vm-v24-store-home .vm-v24-store-hero h1 {font-size:clamp(28px,3vw,38px) !important; line-height:1.15 !important; margin:8px 0 6px !important; color:var(--v24-ink) !important; letter-spacing:-1.2px !important; font-weight:900 !important;}
.vm-v24-store-home .vm-v24-store-hero p {font-size:14px !important; line-height:1.5 !important; color:#355273 !important; margin:0 !important; max-width:510px !important;}
.vm-v24-store-identity {display:flex;align-items:center;gap:12px;min-width:225px;max-width:36%;padding:16px;border-radius:17px;background:rgba(255,255,255,.9);box-shadow:0 6px 19px rgba(86,60,32,.035);}
.vm-v24-store-identity-icon {display:grid;place-items:center;flex:0 0 46px;width:46px;height:46px;border-radius:12px;background:#fff0de;font-size:23px;}
.vm-v24-store-identity div{display:grid;gap:3px;min-width:0;}
.vm-v24-store-identity small {font-size:9px;color:#cb6e22;font-weight:900;letter-spacing:.8px;}
.vm-v24-store-identity strong {font-size:14px;color:var(--v24-ink);overflow-wrap:anywhere;}
.vm-v24-store-identity div>span {font-size:11px;color:#66818a;}
.vm-v24-store-kpis {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;}
.vm-v24-store-home .vm-v24-store-kpi {display:flex;gap:11px;align-items:center;min-width:0;min-height:92px;padding:16px 14px !important;background:#fff !important;border:1px solid var(--v24-line) !important;border-radius:19px !important;box-shadow:0 5px 12px rgba(35,79,89,.025) !important;}
.vm-v24-store-kpi-icon {display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;border-radius:12px;background:#fff1df;color:#dc8637;}
.vm-v24-store-kpi-icon--alert {background:#fff1e5;color:#db8d37;}
.vm-v24-store-kpi-icon svg {width:23px;height:23px;}
.vm-v24-store-kpi div{display:grid;gap:2px;min-width:0;}
.vm-v24-store-kpi strong {font-size:clamp(18px,1.9vw,25px);font-weight:900;line-height:1.12;color:var(--v24-ink);overflow-wrap:anywhere;}
.vm-v24-store-kpi small {font-size:11px;color:#546e87;line-height:1.4;}
.vm-v24-store-grid {display:grid;grid-template-columns:1.12fr 1fr .82fr;gap:11px;align-items:stretch;}
.vm-v24-store-home .vm-v24-store-card {min-width:0;padding:20px 17px !important;border:1px solid var(--v24-line) !important;border-radius:21px !important;background:#fff !important;box-shadow:0 5px 13px rgba(33,67,81,.025) !important;}
.vm-v24-store-grid>.vm-v24-store-card {min-height:308px;}
.vm-v24-store-card-heading {display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:40px;padding-bottom:12px;border-bottom:1px solid #e5efed;margin-bottom:10px;}
.vm-v24-store-card-heading h2 {color:var(--v24-ink) !important;margin:0 !important;font-size:16px !important;font-weight:900 !important;line-height:1.3 !important;}
.vm-v24-store-card-heading button {flex:0 0 auto;border:0 !important;box-shadow:none !important;background:transparent !important;color:#0766bf !important;padding:4px !important;font-size:10px !important;font-weight:800 !important;}
.vm-v24-store-list {display:flex;flex-direction:column;}
.vm-v24-store-list-row {display:flex;align-items:center;gap:9px;width:100%;min-width:0;min-height:54px;padding:8px 0 !important;border:0 !important;border-bottom:1px solid #e8f0ee !important;background:transparent !important;box-shadow:none !important;border-radius:0 !important;text-align:left !important;color:var(--v24-ink) !important;}
.vm-v24-store-list-row:last-child {border-bottom:0 !important;}
.vm-v24-store-list-row:hover {background:#f6faf9 !important;}
.vm-v24-store-row-icon {display:grid;place-items:center;flex:0 0 34px;width:34px;height:34px;background:#fff1e1;border-radius:10px;font-size:18px;}
.vm-v24-store-row-info {display:grid;min-width:0;flex:1;gap:3px;}
.vm-v24-store-row-info strong{font-size:11px;line-height:1.35;color:var(--v24-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.vm-v24-store-row-info small{font-size:10px;color:#658096;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.vm-v24-store-row-meta{display:grid;gap:3px;text-align:right;min-width:0;}
.vm-v24-store-row-meta strong{font-size:10px;line-height:1.3;white-space:nowrap;color:#153963;}
.vm-v24-store-row-meta small{font-size:9px;color:#668099;}
.vm-v24-store-row-meta--warning strong{color:#c16b14;}
.vm-v24-store-chevron{font-size:19px;color:#7b9fb9;padding-left:2px;}
.vm-v24-store-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:192px;padding:14px;text-align:center;}
.vm-v24-store-empty > span {font-size:30px;}
.vm-v24-store-empty .vm-v24-store-empty-success{font-size:24px;display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#d8f5ea;color:#14a673;}
.vm-v24-store-empty strong{color:var(--v24-ink);font-size:13px;}
.vm-v24-store-empty small{font-size:10px;line-height:1.5;color:#71879c;}
.vm-v24-store-quick-links {display:grid;gap:9px;margin-top:13px;}
.vm-v24-store-quick-links button {display:flex;align-items:center;gap:10px;min-height:48px;width:100%;padding:7px 10px !important;border:1px solid #dce9f3 !important;border-radius:12px !important;background:#fbfdff !important;color:var(--v24-ink) !important;font-size:11px !important;font-weight:800 !important;text-align:left !important;box-shadow:none !important;}
.vm-v24-store-quick-links button:hover{background:#eff8ff !important;}
.vm-v24-store-quick-links button span {display:grid;place-items:center;width:31px;height:31px;flex:0 0 31px;border-radius:9px;background:#e9f3ff;font-size:17px;}
.vm-v24-store-quick-links b{margin-left:auto;color:#5592c5;font-size:19px;font-weight:400;}
.vm-v24-store-bottom{display:grid;grid-template-columns:minmax(0,2fr) minmax(240px,.92fr);gap:11px;}
.vm-v24-store-home .vm-v24-store-card--products {min-height:181px;}
.vm-v24-store-featured{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;}
.vm-v24-store-featured button{display:flex;align-items:center;gap:8px;width:100%;min-width:0;min-height:77px;padding:10px !important;background:#fff !important;border:1px solid #f1e4d7 !important;border-radius:12px !important;text-align:left !important;box-shadow:none !important;}
.vm-v24-store-featured button:hover{background:#fff8ef !important;}
.vm-v24-store-featured button>span{display:grid;place-items:center;flex:0 0 34px;width:34px;height:34px;border-radius:10px;background:#fff0df;font-size:19px;}
.vm-v24-store-featured button>div{min-width:0;display:grid;gap:3px;}
.vm-v24-store-featured strong{font-size:10px;color:var(--v24-ink);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
.vm-v24-store-featured small{font-size:10px;color:#d07124;font-weight:800;}
.vm-v24-store-featured em{font-size:9px;color:#768d9e;font-style:normal;}
.vm-v24-store-home .vm-v24-store-highlight{position:relative;display:flex;align-items:center;min-height:180px;padding:23px;border-radius:21px;background:#ffe7ca;border:1px solid #f5d5b6;overflow:hidden;}
.vm-v24-store-highlight-copy{position:relative;z-index:1;max-width:235px;display:grid;gap:8px;}
.vm-v24-store-highlight-label{font-size:9px;font-weight:900;color:#b56227;letter-spacing:1px;}
.vm-v24-store-highlight h2{margin:0 !important;font-size:18px !important;line-height:1.25 !important;color:var(--v24-ink) !important;}
.vm-v24-store-highlight p{margin:0 !important;color:#566c80 !important;font-size:11px !important;line-height:1.4 !important;}
.vm-v24-store-highlight button{padding:4px 0 !important;border:0 !important;background:transparent !important;color:#b05c1b !important;font-size:11px !important;text-align:left !important;font-weight:900 !important;}
.vm-v24-store-highlight-art{position:absolute;right:-14px;bottom:-12px;width:130px;height:130px;color:rgba(213,116,33,.21);}
.vm-v24-store-empty--compact{min-height:90px;}
/* SIDEBAR: replicamos el tono marino del Admin; solamente afecta Tienda. */
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar{
  background:#182f52 !important;background-image:linear-gradient(180deg,#182e50,#142845) !important;
  border:0 !important;border-right:1px solid #223d64 !important;border-radius:0 !important;
  box-shadow:none !important;color:#edf4ff !important;padding:18px 12px !important;
}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar > .vm-member-brand,
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar > .vm-member-user{display:none !important;}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar > .vm-member-menu{display:flex !important;flex-direction:column !important;align-items:stretch !important;gap:4px !important;width:100% !important;margin:0 !important;padding:0 !important;background:transparent !important;overflow-x:hidden !important;}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > button{display:flex !important;align-items:center !important;justify-content:flex-start !important;gap:12px !important;width:100% !important;min-height:43px !important;padding:10px 12px !important;margin:0 !important;border:1px solid transparent !important;border-radius:11px !important;color:#e9f1ff !important;background:transparent !important;background-image:none !important;font-size:12px !important;font-weight:700 !important;line-height:1.2 !important;box-shadow:none !important;text-align:left !important;letter-spacing:0 !important;}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > button::before,
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > button::after{content:none !important;display:none !important;-webkit-mask-image:none !important;mask-image:none !important;}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > button .vm-v24-store-nav-icon {width:19px !important;height:19px !important;flex:0 0 19px !important;display:block !important;color:#c6d6ee !important;stroke:currentColor;}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > button span{color:inherit !important;font-size:inherit !important;}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > button:hover{background:#24466e !important;color:white !important;border-color:#3a5b83 !important;}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > button.active{background:#2c5685 !important;color:#fff !important;border:1px solid #4177ae !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06) !important;}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > button.active .vm-v24-store-nav-icon{color:white !important;}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > button:focus-visible{outline:2px solid #8bd3ff !important;outline-offset:2px !important;}
 .vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > .vm-v24-store-separator{width:calc(100% - 18px) !important;height:1px !important;min-height:1px !important;border:0 !important;margin:13px 9px !important;background:#3d5779 !important;}
@media (min-width:1100px){
 .vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar{height:calc(100vh - 88px) !important;min-height:620px !important;top:73px !important;position:sticky !important;}
}
@media (max-width:1100px){
 .vm-v24-store-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
 .vm-v24-store-grid > .vm-v24-store-card--quick{grid-column:1/-1;min-height:0;}
 .vm-v24-store-quick-links{grid-template-columns:repeat(3,minmax(0,1fr));}
 .vm-v24-store-kpis{grid-template-columns:repeat(2,minmax(0,1fr));}
 .vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar{height:auto !important;min-height:0 !important;padding:11px !important;}
 .vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > .vm-v24-store-separator{display:none !important;}
 .vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar > .vm-member-menu{flex-direction:row !important;flex-wrap:wrap !important;gap:6px !important;}
 .vm-member-shell.vmh16-shell > nav.vm-member-nav--store.vm-v24-store-sidebar .vm-member-menu > button{width:auto !important;min-width:115px !important;}
}
@media (max-width:780px){
 .vm-v24-store-home .vm-v24-store-hero{flex-direction:column;align-items:flex-start !important;}
 .vm-v24-store-identity{max-width:100%;width:100%;}
 .vm-v24-store-grid,.vm-v24-store-bottom{grid-template-columns:1fr;}
 .vm-v24-store-grid > .vm-v24-store-card--quick{grid-column:auto;}
 .vm-v24-store-featured,.vm-v24-store-quick-links{grid-template-columns:1fr;}
}
@media (max-width:460px){
 .vm-v24-store-kpis{grid-template-columns:1fr;}
 .vm-v24-store-home .vm-v24-store-card{padding:15px 12px !important;}
 .vm-v24-store-card-heading{flex-wrap:wrap;}
}
'''


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def find_project():
    for root in (Path.cwd(), Path(__file__).resolve().parent):
        for candidate in (root, *root.parents):
            if (candidate / "web/src/main.jsx").is_file() and (candidate / "web/src/index.css").is_file():
                return candidate
    raise SystemExit("ERROR: No encontré ProyectoVetMap/web/src. Ejecuta este .py desde el proyecto.")


def main():
    root = find_project()
    main_file = root / 'web/src/main.jsx'
    index_css = root / 'web/src/index.css'
    style_file = root / 'web/src' / CSS_FILENAME
    raw = main_file.read_bytes()
    bom = raw.startswith(b'\xef\xbb\xbf')
    newline = '\r\n' if b'\r\n' in raw else '\n'
    source = raw.decode('utf-8-sig').replace('\r\n', '\n')

    if CSS_IMPORT in source or 'vm-v24-store-home' in source or 'vm-v24-store-sidebar' in source:
        if (CSS_IMPORT in source and 'vm-v24-store-home' in source and 'vm-v24-store-sidebar' in source
                and style_file.is_file() and style_file.read_text(encoding='utf-8') == CSS):
            print('V24 ya instalada. No modifiqué nada.')
            return
        raise SystemExit('ERROR: Existe una V24 parcial o modificada. No sobrescribí ningún archivo.')
    if style_file.exists():
        raise SystemExit('ERROR: Ya existe ' + CSS_FILENAME + '. No sobrescribí nada.')

    for name, token in [('inicio de Tienda', HOME_START), ('página de Productos', HOME_END),
                        ('menú Tienda', NAV_START), ('menú Admin', NAV_END)]:
        if source.count(token) != 1:
            raise SystemExit('ERROR: No se reconoce de forma única ' + name + '. No modifiqué nada.')
    a = source.index(HOME_START)
    b = source.index(HOME_END, a)
    old_home = source[a:b]
    if 'vm-refdash--store' not in old_home or 'storeDashboard' not in old_home:
        raise SystemExit('ERROR: Inicio de Tienda incompatible. No modifiqué nada.')
    before_nav = source.index(NAV_START)
    after_nav = source.index(NAV_END, before_nav)
    old_nav = source[before_nav:after_nav+len(NAV_END)]
    if ('setMemberSection("storeProducts")' not in old_nav
            or 'setMemberSection("storeOrders")' not in old_nav
            or 'setMemberSection("storeHistory")' not in old_nav):
        raise SystemExit('ERROR: Navegación Tienda incompatible. No modifiqué nada.')

    expected = ['storeDashboard', 'storeProducts', 'storeOrders', 'storeLowStockCount',
                'firstName', 'formatCLP', 'productEmoji', 'orderStatusLabel',
                'setMemberSection', 'setAccountMode', 'accountMode']
    missing = [name for name in expected if name not in source]
    if missing:
        raise SystemExit('ERROR: Faltan funciones o datos: ' + ', '.join(missing))

    edited = source[:a] + HOME + '\n              \n\n              ' + source[b:]
    a = edited.index(NAV_START)
    b = edited.index(NAV_END, a) + len(NAV_END)
    edited = edited[:a] + NAV.rstrip('\n') + edited[b:]

    # No quita la clase de Veterinaria V23: añade su propio modificador a Tienda.
    patt = r'(<nav className=\{`vm-member-nav vm-member-nav--\$\{currentUser\.role\})([^`]*)(`\}>)'
    matches = list(re.finditer(patt, edited))
    if len(matches) != 1:
        raise SystemExit('ERROR: No encontré un único contenedor de menú. No modifiqué nada.')
    match = matches[0]
    replacement = (match.group(1) + match.group(2)
                   + ' ${currentUser.role === "store" ? "vm-v24-store-sidebar" : ""}'
                   + match.group(3))
    edited = edited[:match.start()] + replacement + edited[match.end():]

    imports = list(re.finditer(r'^import\s+["\'][^"\']+\.css["\'];?[ \t]*$', edited, re.M))
    if not imports:
        raise SystemExit('ERROR: No hay imports CSS en main.jsx. No modifiqué nada.')
    p = imports[-1].end()
    edited = edited[:p] + '\n' + CSS_IMPORT + edited[p:]
    updated = (b'\xef\xbb\xbf' if bom else b'') + edited.replace('\n', newline).encode('utf-8')

    # Respaldo SOLO si todo lo anterior validó.
    backup = root / 'respaldos_instaladores' / ('antes_tienda_v24_' + datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(main_file, backup / 'main.jsx')
    shutil.copy2(index_css, backup / 'index.css')  # adicional por seguridad
    manifest = {
        'main_before_sha256': sha256(raw),
        'main_after_sha256': sha256(updated),
        'css_after_sha256': sha256(CSS.encode('utf-8')),
        'css_filename': CSS_FILENAME,
        'index_css_modified': False,
    }
    (backup / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')

    tmp_main = main_file.with_name('.main_v24_tmp.jsx')
    tmp_css = style_file.with_name('.vetmap_tienda_v24_tmp.css')
    try:
        tmp_main.write_bytes(updated)
        tmp_css.write_text(CSS, encoding='utf-8')
        tmp_main.replace(main_file)
        tmp_css.replace(style_file)
    except Exception:
        shutil.copy2(backup / 'main.jsx', main_file)
        if style_file.exists() and sha256(style_file.read_bytes()) == manifest['css_after_sha256']:
            style_file.unlink()
        tmp_main.unlink(missing_ok=True)
        tmp_css.unlink(missing_ok=True)
        raise

    print('\nV24 INSTALADA: INICIO Y SIDEBAR DE TIENDA')
    print('Proyecto:', root)
    print('Respaldo:', backup)
    print('Archivos modificados: web/src/main.jsx y web/src/' + CSS_FILENAME)
    print('index.css SIN CAMBIOS. No se alteraron Admin, Veterinaria, Dueño ni backend.')
    print('Abre Tienda > Inicio y pulsa Ctrl+F5.')


if __name__ == '__main__':
    main()
