# -*- coding: utf-8 -*-
"""VetMap V21: mejora visual de Inicio Veterinaria + contraste de Admin.

Uso: python aplicar_estilo_vetmap_v21.py
- Detecta ProyectoVetMap automáticamente.
- Crea respaldo con fecha antes de escribir.
- No toca API, backend, .env, base de datos ni roles Dueño/Tienda.
- Si detecta extras de V19, devuelve SOLO el inicio veterinario a los
  paneles originales y después aplica el nuevo estilo visual.
"""
from pathlib import Path
from datetime import datetime
import base64
import json
import shutil
import zlib

STYLE_FILENAME = "vetmap_v21_estilo.css"
STYLE_IMPORT = 'import "./vetmap_v21_estilo.css";'
START_ANCHOR = '              {currentUser.role === "vet" &&\n                memberSection === "inicio" && ('
END_ANCHOR = '              {currentUser.role === "vet" &&\n                memberSection === "clinicAgenda" && ('

V20_VET_BLOCK = """c-rM!%WfMt6y4`5m_ZSY084g@cGFrC45w%pNnpfiwh1+JEwP>%PDqX#K@reJ(@hrXW7VQSk!2TI6xkG6bW#6_f1v$@Ud~Gs*+Y&VcH%@E8yr3^?>#*C@IgrRH}w)BAW~mR5FNn-Al+`4IAc%_xpCtfS@?wz4nQ1&rx=g2sw`q2<GMC+&(tSmSLT(yfJ%9XhR}7!VcQFIyS7i|XuzrP36|lY?GX>59SaCq66!JmN4ies-?pyj^v)TocCe!52n4TbiEVv0HneMdJf74x)<eg%Zd{naK=5yz-T{puAZR}b7E!_Y?zV1b=ymjA{YOIndHy92=oXnCF(H*6*R94g!h+W9`qUxL%+O0_I+{b<Bj)=MbsZ%VaC-m!{^L`th1(_*cVm<JUx3unqC_Q<2tbp^RBn-&dJLxkl1zv$)A*9a2Xe$kNQq=&96-llQSG3++Zg2DwUrToMm<t1f*^0*X84bDzPJB)W%YJyzbTX<4T9di5@8g3OpA<-l;F|OR7Dd-x?*n@3%1|M3i>I^$m7Sv*$+-$U<oBS{B0VWF}H0Wbl2<)vsE4s!z9WK+fxvE?Bt~mO=hCaHVfnpQ80YOelvQiL7;`bj$<Zs-~@C4LD#tpG6^B75=uS2QK6U@z-r*du`}QzN`HQ`K1x>toK#fFen)YiPVUn<<}6Y;eI-f1Pj=QvTe?o}<}^e`d}3WY79^A|zwns+@b{aINlX<hB9YZO$V)l_L_;;&P;?H;)If2mjJdozA=(7FHwn?9LMj-#wZxcZRP>-`MyF-$jF66u1EySO%U<({1xQ1#%M^qy((MubPY10D-BxR}FgTp60w!Y~u|WWr28Bwjr?q3bwJQZ8ALDbDzgnb6b_`SRqtuq|Z>Wf{xnrpKDTcM?^K4xhpFaEZ-@l%{VXmq3;HEf6_n(mrYED{chmFDO0;GZ7ISmE#t=Ye(eVpw}77E&JIz(Skli(cz^+6cDY5_x`^Y+rQY|zRE{it^!PF_A@A?E2UKs?d}fFFz)u;Fr$D8(b=;A#@1@3M-Hu_ll91Lhrfr*6uI5=C)!_v|_uz_WQfEfadp{<sH%WRW7L-~VKEKxVgbH<t&rw#xMSnT46esJ3xQ_H&j;u5vAisM{%ru`=zl=WuDFL#teK$RZM#pc!#NWfM*)S>X;RBRZ*|jl^@F-~`zb_uwJLS#+9gxy(>(A&IZ(!GKBSEXS;6{5lc=3+~Pq`MA{yX<W(Wt|j|7Svt!tAN@OqNq3sc2<FeMwa<5mK6tS<-QZfauUA{TRV)O@-o;$&r5>uJ!~432T;I)O`bo>~!X_)qW<EMRR|`$1Fa&h~>hq9)&9ZsKpzg~UQ0L1_G&rQJnZX60OiN?+`Nymom%PR(Sr54!pEV$j^=3SMP?@rpQi&uVO!HGW4f4aZY+pCXB9T>U%^u7eMe<BnxAZB+>s@VVcJ@S;vS@3z1_jSHxlw2$wu(LU<;bmaC*4?am0NECWz(xDxQdgBbtRYLK5jrSLvfvZqLSXe>|Bo2vL7#<ky;hB3{jE@>ht9U*DZAJycZf%gdK>J=MkX~lam+3OK9YC0*|nFB)a1I;Hs#vGMZ;JSIz@(T6X1TT(a`wsH*p?4l3Pov6^dj(Ng&7DrlC%)>S1-gPQ1_Vw8aZ@U;wGa8asEi*(ZDvZ&&?i`7Vr9!4M@J3USIN6Z`1_gI`fOmLB2jxxDJ$1tSDnOh@mvgdgqF<)SMh*_Fw))FQSa<U-@q^@eyRC7q@9XxMZ?EvO3jG3gxNmWBB0AcU++gH2W__vYDdKb0kY9g$7TOsBm>V5G!N<mMsI9q?4!1;HpIbI7^Mc*~IPc7*W!-90olStj>KDbUS_z?@hX?<pIxERj_aZ7D2XX{4z^w(b+TxwNge4CLN1WxOMV*8d}G07whshF(tgf4H|)`?Z$U#@d`sKZn|eJO9~vI`(v2s5#u*qHg$FJA+h<$_HtWSaCQRa$@m4YGT~Ox9Wy>&oxZ3U`K}1oMnXM%D)m6{36Ez=I7`T)x}L^+x5Iws-}w)ImV`BBwk_pmP09zFjFV<Ga(}o@~-}7N$JUv-#@_>y~HXc}9K^oWA7sxPDlvz_;z%o4n>|cI93Md2fENmYeZ5hPjy*SbB-PrdU>7BdOFN5HiKyO2;)(ugg1b;gQ)=K0By6qTHP0mTq6k(Mx?qk$dfbL2dSR"""
CSS_CONTENT = r"""/* =======================================================================
   VETMAP V21 | REFERENCIA VISUAL VETERINARIA + CONTRASTE ADMIN
   Alcance: SOLO inicio veterinario, menú del rol vet y encabezados admin.
   No añade secciones, datos ficticios, fotografías ni modifica funciones.
   Se importa DESPUÉS de index.css para resolver cascadas antiguas.
   ======================================================================= */

/* 1) NAVEGACIÓN VETERINARIA: blanca como la referencia, iconos y activo azul */
.vm-member-shell.vmh16-shell > nav.vm-member-nav.vm-member-nav--vet {
  background: linear-gradient(180deg,#ffffff 0%,#f5faff 100%) !important;
  border: 0 !important;
  border-right: 1px solid #dce8f4 !important;
  border-radius: 0 !important;
  box-shadow: inset -2px 0 0 rgba(226,239,251,.40) !important;
  padding: 18px 10px !important;
}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet > .vm-member-menu {
  gap: 6px !important;
}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet > .vm-member-menu > button {
  display: flex !important;
  align-items: center !important;
  gap: 13px !important;
  min-height: 47px !important;
  padding: 11px 13px !important;
  border: 1px solid transparent !important;
  border-radius: 11px !important;
  background: transparent !important;
  color: #294c78 !important;
  font-size: 12px !important;
  font-weight: 760 !important;
  transition: background-color .16s ease, color .16s ease, transform .16s ease;
}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet > .vm-member-menu > button:hover {
  background: #e9f3ff !important;
  color: #126cd1 !important;
}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet > .vm-member-menu > button.active {
  border-color: #187df0 !important;
  background: linear-gradient(110deg,#168cf6 0%,#1266d5 100%) !important;
  box-shadow: 0 7px 16px rgba(22,115,221,.19) !important;
  color: #fff !important;
}
/* Iconos SVG: no son imágenes decorativas ni añaden apartados. */
.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet > .vm-member-menu > button::before {
  content: "";
  display: block;
  flex: 0 0 19px;
  width: 19px;
  height: 19px;
  background: currentColor;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-size: contain;
  pointer-events: none;
}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet > .vm-member-menu > button:nth-child(1)::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z'/%3E%3C/svg%3E");
}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet > .vm-member-menu > button:nth-child(2)::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='3' y='5' width='18' height='16' rx='2' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath d='M7 3v4M17 3v4M3 10h18M7 14h2M12 14h2M7 18h2' stroke='black' stroke-width='2'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='3' y='5' width='18' height='16' rx='2' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath d='M7 3v4M17 3v4M3 10h18M7 14h2M12 14h2M7 18h2' stroke='black' stroke-width='2'/%3E%3C/svg%3E");
}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet > .vm-member-menu > button:nth-child(3)::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='8' cy='8' r='3' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath d='M2 20v-2a6 6 0 0 1 12 0v2M17 7a3 3 0 0 1 0 6M17 16c3 0 5 2 5 4' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='8' cy='8' r='3' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath d='M2 20v-2a6 6 0 0 1 12 0v2M17 7a3 3 0 0 1 0 6M17 16c3 0 5 2 5 4' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
}
.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet > .vm-member-menu > button:nth-child(4)::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='5' y='3' width='14' height='18' rx='2' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath d='M9 3v3h6V3M8 11h8M8 15h7' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='5' y='3' width='14' height='18' rx='2' fill='none' stroke='black' stroke-width='2'/%3E%3Cpath d='M9 3v3h6V3M8 11h8M8 15h7' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
}

/* 2) HOME VET: diseño fiel al mockup con SOLO la información real existente */
.vm-member-shell.vmh16-shell .vm-refdash.vm-refdash--vet {
  --rd-main: #197eef;
  --rd-dark: #176bca;
  --rd-soft: #e8f3ff;
  --rd-softer: #f4f9ff;
  --rd-line: #d7e7f6;
  --rd-bg: #f0f7ff;
  width: 100% !important;
  max-width: none !important;
  min-height: calc(100vh - 78px) !important;
  display: block !important;
  padding: 16px 18px 28px !important;
  background: linear-gradient(180deg,#f1f8ff 0%,#f5f9ff 100%) !important;
  color: #102c5c !important;
  font-family: Inter,"Segoe UI",Arial,sans-serif;
}
.vm-refdash--vet .vm-refdash-hero {
  position: relative !important;
  isolation: isolate !important;
  display: grid !important;
  grid-template-columns: minmax(0,1fr) minmax(206px,255px) !important;
  align-items: center !important;
  gap: 18px !important;
  min-height: 149px !important;
  margin: 0 0 11px !important;
  padding: 25px 29px !important;
  overflow: hidden !important;
  border: 1px solid #c7e1ff !important;
  border-radius: 18px !important;
  background: linear-gradient(110deg,#dceeff 0%,#c8e2ff 56%,#afd3ff 100%) !important;
  box-shadow: 0 12px 25px rgba(39,107,174,.08) !important;
}
/* Sólo formas suaves al fondo, SIN emojis flotantes sobre los títulos. */
.vm-refdash--vet .vm-refdash-hero::before {
  content: "" !important;
  display: block !important;
  position: absolute !important;
  z-index: -1 !important;
  top: -105px !important;
  right: 20% !important;
  width: 290px !important;
  height: 290px !important;
  border-radius: 50% !important;
  background: radial-gradient(circle,rgba(255,255,255,.6),transparent 68%) !important;
  pointer-events: none !important;
}
.vm-refdash--vet .vm-refdash-hero::after {
  content: "" !important;
  display: block !important;
  position: absolute !important;
  z-index: -1 !important;
  right: -65px !important;
  bottom: -155px !important;
  width: 315px !important;
  height: 315px !important;
  border: 2px solid rgba(255,255,255,.48) !important;
  border-radius: 50% !important;
  pointer-events: none !important;
}
.vm-refdash--vet .vm-refdash-hero-copy {position: relative !important; z-index: 1 !important;}
.vm-refdash--vet .vm-refdash-eyebrow {
  color: #1270c8 !important;
  font-size: 10px !important;
  font-weight: 900 !important;
  letter-spacing: .13em !important;
}
.vm-refdash--vet .vm-refdash-hero h1 {
  margin: 6px 0 8px !important;
  color: #0d316b !important;
  font-size: clamp(29px,3vw,38px) !important;
  letter-spacing: -.045em !important;
  line-height: 1.12 !important;
}
.vm-refdash--vet .vm-refdash-hero p {
  max-width: 500px !important;
  color: #3c5978 !important;
  font-size: 12.5px !important;
  line-height: 1.5 !important;
}
.vm-refdash--vet .vm-refdash-hero-context {
  justify-self: end !important;
  width: 100% !important;
  max-width: 260px !important;
  min-height: 86px !important;
  padding: 14px !important;
  border: 1px solid #fff !important;
  border-radius: 14px !important;
  background: rgba(255,255,255,.90) !important;
  box-shadow: 0 6px 17px rgba(40,91,155,.09) !important;
}
.vm-refdash--vet .vm-refdash-context-icon {
  width: 43px !important;
  height: 43px !important;
  flex-basis: 43px !important;
  background: #e8f3ff !important;
  border-radius: 12px !important;
  font-size: 22px !important;
}
.vm-refdash--vet .vm-refdash-hero-context small {color:#1974c8 !important;font-size:9px !important;}
.vm-refdash--vet .vm-refdash-hero-context strong {color:#123365 !important;font-size:12px !important;}
.vm-refdash--vet .vm-refdash-hero-context div > span {color:#667e9c !important;font-size:10px !important;}

/* 3) LAS 4 ESTADÍSTICAS, con iconos de color y menos espacio vacío */
.vm-refdash--vet .vm-refdash-kpis {
  display: grid !important;
  grid-template-columns: repeat(4,minmax(0,1fr)) !important;
  gap: 10px !important;
  margin: 0 0 11px !important;
}
.vm-refdash--vet .vm-refdash-kpis > article {
  display: grid !important;
  grid-template-columns: 44px minmax(0,1fr) !important;
  align-items: center !important;
  gap: 11px !important;
  min-height: 82px !important;
  padding: 12px 14px !important;
  border: 1px solid #dae8ef !important;
  border-radius: 14px !important;
  background: #fff !important;
  box-shadow: 0 5px 13px rgba(21,67,116,.045) !important;
}
.vm-refdash--vet .vm-refdash-kpis > article:last-child {border-color:#f2dade !important;}
.vm-refdash--vet .vm-refdash-kpis .vm-refdash-kpi-icon {
  display: grid !important;
  place-items: center !important;
  width: 43px !important;
  height: 43px !important;
  border-radius: 12px !important;
  background: #e7f2ff !important;
  font-size: 20px !important;
}
.vm-refdash--vet .vm-refdash-kpis > article:nth-child(2) .vm-refdash-kpi-icon {background:#e8f5ff !important;}
.vm-refdash--vet .vm-refdash-kpis > article:nth-child(3) .vm-refdash-kpi-icon {background:#e5f7f3 !important;}
.vm-refdash--vet .vm-refdash-kpis > article:nth-child(4) .vm-refdash-kpi-icon {background:#ffebee !important;}
.vm-refdash--vet .vm-refdash-kpis strong {color:#0a2d65 !important;font-size:27px !important;line-height:1.05 !important;}
.vm-refdash--vet .vm-refdash-kpis small {color:#657b97 !important;font-size:10.5px !important;line-height:1.24 !important;}

/* 4) TRES TARJETAS CENTRALES, encabezados legibles y filas compactas */
.vm-refdash--vet .vm-refdash-vet-grid {
  display: grid !important;
  grid-template-columns: minmax(0,1.14fr) minmax(0,1.01fr) minmax(210px,.83fr) !important;
  align-items: stretch !important;
  gap: 10px !important;
  margin: 0 0 11px !important;
}
.vm-refdash--vet .vm-refdash-panel {
  min-width: 0 !important;
  min-height: 308px !important;
  overflow: hidden !important;
  border: 1px solid #d7e6f3 !important;
  border-radius: 16px !important;
  background: #fff !important;
  box-shadow: 0 6px 17px rgba(16,65,121,.045) !important;
}
.vm-refdash--vet .vm-refdash-panel > header {
  position: relative !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  min-height: 63px !important;
  padding: 14px 14px 12px !important;
  border: 0 !important;
  border-bottom: 1px solid #e8f0fa !important;
  border-radius: 0 !important;
  background: #fff !important;
  box-shadow: none !important;
  color: #0d2c5c !important;
}
.vm-refdash--vet .vm-refdash-panel > header::before,
.vm-refdash--vet .vm-refdash-panel > header::after {
  content: none !important;
  display: none !important;
}
.vm-refdash--vet .vm-refdash-panel > header span {color:#2a7acd !important;font-size:8.5px !important;letter-spacing:.08em !important;}
.vm-refdash--vet .vm-refdash-panel > header h2 {color:#0c2b5b !important;font-size:15px !important;line-height:1.2 !important;}
.vm-refdash--vet .vm-refdash-panel > header button {
  padding: 5px 3px !important;
  color: #1679d5 !important;
  font-size: 10px !important;
  font-weight: 850 !important;
  background: transparent !important;
  border: none !important;
}
.vm-refdash--vet .vm-refdash-list {display:grid !important;gap:0 !important;padding:6px 12px 13px !important;}
.vm-refdash--vet .vm-refdash-row {
  min-height: 54px !important;
  padding: 8px 2px !important;
  gap: 7px !important;
  border-bottom: 1px solid #edf2f8 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.vm-refdash--vet .vm-refdash-row:hover {background:#f1f7ff !important;}
.vm-refdash--vet .vm-refdash-row-icon {
  display: grid !important;
  place-items: center !important;
  width: 34px !important;
  height: 34px !important;
  border-radius: 10px !important;
  background: #e8f3ff !important;
  font-size: 18px !important;
}
.vm-refdash--vet .vm-refdash-time {color:#0d356c !important;font-size:10px !important;}
.vm-refdash--vet .vm-refdash-row-main strong {color:#0e3268 !important;font-size:11px !important;}
.vm-refdash--vet .vm-refdash-row-main small {color:#7890aa !important;font-size:9px !important;}
.vm-refdash--vet .vm-refdash-row-link {color:#126dcd !important;font-size:9px !important;}
.vm-refdash--vet .vm-refdash-status {font-size:9px !important;padding:5px 8px !important;}
.vm-refdash--vet .vm-refdash-panel--patients .vm-refdash-row {grid-template-columns: 36px minmax(0,1fr) auto !important;}
.vm-refdash--vet .vm-refdash-panel--agenda .vm-refdash-row {grid-template-columns: 34px 35px minmax(0,1fr) auto !important;}
.vm-refdash--vet .vm-refdash-empty {padding:30px 14px !important;}
.vm-refdash--vet .vm-refdash-empty strong {color:#244b79 !important;font-size:13px !important;}
.vm-refdash--vet .vm-refdash-empty small {font-size:10px !important;}
.vm-refdash--vet .vm-refdash-quick-actions {display:grid !important;gap:7px !important;padding:10px !important;}
.vm-refdash--vet .vm-refdash-quick-actions > button {
  display:grid !important;
  grid-template-columns:35px minmax(0,1fr) 14px !important;
  gap:8px !important;
  min-height:48px !important;
  padding:6px 8px !important;
  border:1px solid #e3ecf6 !important;
  border-radius:10px !important;
  background:#f9fcff !important;
  color:#113365 !important;
}
.vm-refdash--vet .vm-refdash-quick-actions > button:hover {border-color:#bcdcff !important;background:#eaf4ff !important;}
.vm-refdash--vet .vm-refdash-quick-actions > button > span {width:32px !important;height:32px !important;border-radius:9px !important;background:#e9f3ff !important;font-size:16px !important;}
.vm-refdash--vet .vm-refdash-quick-actions > button strong {font-size:10px !important;line-height:1.2 !important;}
.vm-refdash--vet .vm-refdash-quick-actions > button em {font-size:19px !important;color:#3b86d5 !important;}

/* 5) RESUMEN INFERIOR: sin inventar sección. Última métrica azul como el mockup. */
.vm-refdash--vet .vm-refdash-vet-summary {
  border: 1px solid #d7e5f3 !important;
  border-radius: 16px !important;
  background: #fff !important;
  box-shadow: 0 6px 17px rgba(16,65,121,.045) !important;
}
.vm-refdash--vet .vm-refdash-summary-heading {
  min-height: 61px !important;
  padding: 12px 16px 10px !important;
  background: #fff !important;
  border-bottom: 1px solid #e8f0fa !important;
}
.vm-refdash--vet .vm-refdash-summary-heading span {color:#2076cb !important;font-size:8.5px !important;}
.vm-refdash--vet .vm-refdash-summary-heading h2 {color:#0e2e5d !important;font-size:16px !important;}
.vm-refdash--vet .vm-refdash-summary-heading > small {color:#8294ab !important;font-size:9px !important;}
.vm-refdash--vet .vm-refdash-summary-metrics {
  display:grid !important;
  grid-template-columns:repeat(4,minmax(0,1fr)) !important;
  gap:9px !important;
  padding:11px !important;
}
.vm-refdash--vet .vm-refdash-summary-metrics > article {
  display:grid !important;
  grid-template-columns:40px minmax(0,1fr) !important;
  align-items:center !important;
  gap:9px !important;
  min-height:74px !important;
  padding:11px !important;
  border:1px solid #e1edf6 !important;
  border-radius:12px !important;
  background:#f8fbff !important;
  color:#0d346d !important;
}
.vm-refdash--vet .vm-refdash-summary-metrics > article > span {
  width:38px !important;
  height:38px !important;
  border-radius:10px !important;
  background:#e5f2ff !important;
  font-size:18px !important;
}
.vm-refdash--vet .vm-refdash-summary-metrics strong {color:#0d3268 !important;font-size:23px !important;}
.vm-refdash--vet .vm-refdash-summary-metrics small {color:#6a809c !important;font-size:9px !important;}
.vm-refdash--vet .vm-refdash-summary-metrics > article:last-child {
  border-color:#3f96eb !important;
  background:linear-gradient(125deg,#d7eaff 0%,#b8d9ff 100%) !important;
}
.vm-refdash--vet .vm-refdash-summary-metrics > article:last-child > span {background:#fff !important;}
.vm-refdash--vet .vm-refdash-summary-metrics > article:last-child strong {color:#0d3e81 !important;}
.vm-refdash--vet .vm-refdash-summary-metrics > article:last-child small {color:#28609b !important;}

/* 6) ADMIN: fondo oscuro consistente + texto con contraste, sin tocar formularios */
.vm-member-shell.vm-dashboard-admin-mode.vm-admin-v10-mode .vmv10-route-body > section.vmv10-management-heading,
.vm-member-shell.vm-dashboard-admin-mode.vm-admin-v10-mode .vmv10-route-body .vmv10-management-heading {
  background: linear-gradient(120deg,#15325c 0%,#204776 58%,#24608e 100%) !important;
  border: 1px solid #254f80 !important;
  box-shadow: 0 11px 24px rgba(15,45,83,.16) !important;
  color: #ffffff !important;
}
.vm-member-shell.vm-dashboard-admin-mode.vm-admin-v10-mode .vmv10-route-body .vmv10-management-heading h1 {
  color: #fff !important;
  opacity: 1 !important;
  -webkit-text-fill-color: #fff !important;
  text-shadow: 0 1px 0 rgba(7,33,67,.10) !important;
}
.vm-member-shell.vm-dashboard-admin-mode.vm-admin-v10-mode .vmv10-route-body .vmv10-management-heading p {
  color: #dceaf9 !important;
  opacity: 1 !important;
}
.vm-member-shell.vm-dashboard-admin-mode.vm-admin-v10-mode .vmv10-route-body .vmv10-management-heading span {
  color: #8eece6 !important;
  opacity: 1 !important;
}
.vm-member-shell.vm-dashboard-admin-mode.vm-admin-v10-mode .vmv10-route-body .vmv10-management-heading button {
  background: rgba(255,255,255,.16) !important;
  border: 1px solid rgba(255,255,255,.45) !important;
  color: #fff !important;
}

@media (max-width:1180px) {
  .vm-refdash--vet .vm-refdash-vet-grid {grid-template-columns:repeat(2,minmax(0,1fr)) !important;}
  .vm-refdash--vet .vm-refdash-panel--quick {grid-column:1 / -1 !important;min-height:auto !important;}
  .vm-refdash--vet .vm-refdash-quick-actions {grid-template-columns:repeat(4,minmax(0,1fr)) !important;}
}
@media (max-width:950px) {
  .vm-refdash--vet .vm-refdash-hero {grid-template-columns:1fr !important;padding:19px !important;gap:13px !important;}
  .vm-refdash--vet .vm-refdash-hero-context {justify-self:stretch !important;max-width:100% !important;}
  .vm-refdash--vet .vm-refdash-vet-grid {grid-template-columns:1fr !important;}
  .vm-refdash--vet .vm-refdash-panel--quick {grid-column:auto !important;}
  .vm-refdash--vet .vm-refdash-kpis,.vm-refdash--vet .vm-refdash-summary-metrics {grid-template-columns:repeat(2,minmax(0,1fr)) !important;}
  .vm-refdash--vet .vm-refdash-panel {min-height:auto !important;}
  .vm-refdash--vet .vm-refdash-quick-actions {grid-template-columns:repeat(2,minmax(0,1fr)) !important;}
}
@media (max-width:680px) {
  .vm-member-shell.vmh16-shell > nav.vm-member-nav--vet {padding:9px 10px !important;}
  .vm-member-shell.vmh16-shell > nav.vm-member-nav--vet > .vm-member-menu > button {min-height:42px !important;padding:9px 11px !important;}
  .vm-refdash--vet .vm-refdash-hero h1 {font-size:28px !important;}
  .vm-refdash--vet .vm-refdash-kpis {gap:8px !important;}
  .vm-refdash--vet .vm-refdash-kpis > article {min-height:77px !important;padding:10px !important;}
  .vm-refdash--vet .vm-refdash-summary-metrics {gap:7px !important;}
}
@media (max-width:510px) {
  .vm-member-shell.vmh16-shell .vm-refdash.vm-refdash--vet {padding:12px 10px 22px !important;}
  .vm-refdash--vet .vm-refdash-kpis,.vm-refdash--vet .vm-refdash-summary-metrics {grid-template-columns:1fr !important;}
  .vm-refdash--vet .vm-refdash-quick-actions {grid-template-columns:1fr !important;}
}
"""


def find_root():
    locations = [Path.cwd(), Path(__file__).resolve().parent]
    for location in locations:
        for candidate in [location, *location.parents]:
            if (candidate / "web" / "src" / "main.jsx").is_file() and (candidate / "web" / "src" / "index.css").is_file():
                return candidate
    raise SystemExit("ERROR: No encontré web/src/main.jsx e index.css. Coloca este .py en ProyectoVetMap o ejecútalo desde su raíz.")


def main():
    project = find_root()
    source = project / "web" / "src" / "main.jsx"
    stylesheet = project / "web" / "src" / STYLE_FILENAME
    old = source.read_text(encoding="utf-8")
    if START_ANCHOR not in old or END_ANCHOR not in old:
        raise SystemExit("ERROR: No se detectó el Inicio veterinario compatible. No cambié archivos.")
    start = old.index(START_ANCHOR)
    end = old.index(END_ANCHOR, start)
    vet_section = old[start:end]
    if "vm-refdash--vet" not in vet_section:
        raise SystemExit("ERROR: El inicio veterinario es distinto a V18/V19/V20. No cambié archivos.")

    if STYLE_IMPORT in old and stylesheet.is_file() and stylesheet.read_text(encoding="utf-8") == CSS_CONTENT:
        print("VetMap V21 ya está aplicado. No cambié archivos ni creé otro respaldo.")
        return

    new = old
    restored_v19 = False
    # El V19 anterior agregó módulos que no se habían solicitado: quitar
    # SOLO esa sección, preservando el resto del proyecto y los manejadores.
    if "vm-v19-" in vet_section:
        base = zlib.decompress(base64.b85decode(V20_VET_BLOCK.encode("ascii"))).decode("utf-8")
        if not base.startswith(START_ANCHOR) or "vm-refdash--vet" not in base:
            raise SystemExit("ERROR: El bloque de recuperación de Veterinaria falló la validación.")
        new = new[:start] + base + new[end:]
        restored_v19 = True

    if STYLE_IMPORT not in new:
        anchor = 'import "leaflet/dist/leaflet.css";'
        if anchor not in new:
            anchor = 'import "./index.css";'
        if anchor not in new:
            raise SystemExit("ERROR: No encontré el punto de importación de estilos. No cambié archivos.")
        new = new.replace(anchor, anchor + "\n" + STYLE_IMPORT, 1)

    backups = project / "respaldos_vetmap"
    backups.mkdir(exist_ok=True)
    name = datetime.now().strftime("antes_v21_%Y%m%d_%H%M%S_%f")
    bk = backups / name
    bk.mkdir()
    shutil.copy2(source, bk / "main.jsx")
    existed = stylesheet.is_file()
    if existed:
        shutil.copy2(stylesheet, bk / STYLE_FILENAME)
    (bk / "manifest.json").write_text(json.dumps({"css_existed":existed,"main_file":"web/src/main.jsx","css_file":"web/src/"+STYLE_FILENAME}, indent=2), encoding="utf-8")

    try:
        source.write_text(new, encoding="utf-8")
        stylesheet.write_text(CSS_CONTENT, encoding="utf-8")
    except Exception:
        shutil.copy2(bk / "main.jsx", source)
        if existed:
            shutil.copy2(bk / STYLE_FILENAME, stylesheet)
        else:
            stylesheet.unlink(missing_ok=True)
        raise
    print("\n==========================================")
    print("   VETMAP V21 APLICADO CORRECTAMENTE")
    print("==========================================")
    print("Proyecto:", project)
    print("Respaldo:", bk)
    print("Cambios: inicio veterinario (DISEÑO) + cabeceras admin (CONTRASTE).")
    if restored_v19:
        print("También se quitaron SOLO los apartados extras de V19 del Inicio veterinario.")
    print("No se tocaron backend, .env, base de datos, Dueño ni Tienda.")
    print("Abre la página y pulsa Ctrl + F5. Si Vite ya está abierto, se actualiza solo.")

if __name__ == "__main__":
    main()
