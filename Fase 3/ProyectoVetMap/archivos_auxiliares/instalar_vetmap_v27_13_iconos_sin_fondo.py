# -*- coding: utf-8 -*-
"""VetMap V27.13 — iconos lineales SIN tarjetas blancas, SIN fotografias.

Colocar este archivo en la raiz de ProyectoVetMap y ejecutar:
    python instalar_vetmap_v27_13_iconos_sin_fondo.py

Alcance: solo los banners de INICIO del Dueño y Veterinaria (web).
Los iconos son SVG inline en el JSX: ningun PNG/JPG ni recurso externo.
No toca backend, mobile, PostgreSQL, .env, chat, ni otros roles.
"""
from datetime import datetime
from pathlib import Path
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "web" / "src"
MAIN = SRC / "main.jsx"
OWNER = SRC / "components" / "VetMapOwnerHome.jsx"
CSS_FILE = SRC / "vetmap_v27_13_iconos_sin_fondo.css"
CSS_IMPORT = 'import "./vetmap_v27_13_iconos_sin_fondo.css";'

OWNER_OLD = '<div className="vm-o15-hero-note"><span>♥</span><strong>Cuidamos lo que más amas</strong></div>'
OWNER_NEW = '''<div className="vm-o15-hero-note vm-v2713-no-card">
            <svg className="vm-v2713-line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="6" cy="7.5" r="1.55" />
              <circle cx="10.5" cy="4.8" r="1.55" />
              <circle cx="15.6" cy="5.9" r="1.55" />
              <circle cx="19.3" cy="9.5" r="1.55" />
              <path d="M12 10.4c-2.3 0-3.3 2-4.9 3.8-1.4 1.7-2.8 3.1-2.8 4.5 0 1.5 1.1 2.6 2.7 2.6 1.4 0 2.3-.9 3.7-.9s2.3.9 3.7.9c1.6 0 2.7-1.1 2.7-2.6 0-1.4-1.4-2.8-2.8-4.5-1.6-1.8-2.6-3.8-4.9-3.8z" />
            </svg>
            <strong>Cuidamos lo que más amas</strong>
          </div>'''

VET_OLD_RE = re.compile(
    r'<div\s+className="vm-v22-hero-note">\s*'
    r'<strong>Profesionales<br\s*/>por mascotas<br\s*/>más saludables</strong>\s*'
    r'<span\s+aria-hidden="true">♥</span>\s*'
    r'</div>',
    re.MULTILINE,
)
VET_NEW = '''<div className="vm-v22-hero-note vm-v2713-no-card">
                        <svg className="vm-v2713-line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 3v6a6 6 0 0 0 12 0V3" />
                          <path d="M6 3H4v3M18 3h2v3M12 15v2a4 4 0 0 0 8 0v-1" />
                          <circle cx="20" cy="14" r="2" />
                        </svg>
                        <strong>Profesionales por mascotas más saludables</strong>
                      </div>'''

CSS = r'''/* VetMap V27.13. Solo los banners de Inicio de Dueño y Veterinaria.
   SIN fondos blancos para el icono, SIN fotografias, SIN assets externos.
   El SVG esta escrito en los componentes React (no es un archivo de imagen). */

/* DUEÑO — banner petróleo con icono integrado, sin tarjeta flotante. */
.vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero {
  background: linear-gradient(112deg,#174c55 0%,#114550 49%,#0c3947 100%) !important;
  border-color: #286470 !important;
}
.vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero .vm-o15-hero-decor {
  display: block !important;
  position: relative !important;
  flex: 0 0 min(29%,275px) !important;
  min-width: 175px !important;
  min-height: 170px !important;
  transform: none !important;
}
.vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero .vm-o15-big-paw {
  display: none !important; /* elimina emoji decorativo anterior */
}
.vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero .vm-o15-orbit {
  border-color: rgba(176,246,237,.24) !important;
  background: transparent !important;
}
.vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero .vm-o15-hero-note.vm-v2713-no-card {
  position: absolute !important;
  z-index: 4 !important;
  top: 50% !important;
  right: 0 !important;
  bottom: auto !important;
  transform: translateY(-50%) !important;
  width: 210px !important;
  max-width: 100% !important;
  min-width: 0 !important;
  min-height: 150px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px !important;
  padding: 10px 4px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  text-align: center !important;
}
.vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero .vm-o15-hero-note.vm-v2713-no-card strong {
  max-width: 180px !important;
  color: #e5fffb !important;
  font-family: Inter,'Segoe UI',Arial,sans-serif !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  line-height: 1.35 !important;
  text-shadow: 0 1px 8px rgba(0,36,48,.30) !important;
}
.vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero .vm-o15-hero-note.vm-v2713-no-card .vm-v2713-line-icon {
  display: block !important;
  width: 75px !important;
  height: 75px !important;
  flex: none !important;
  color: #8ff0e2 !important;
  filter: drop-shadow(0 4px 9px rgba(0,30,38,.17));
}

/* VETERINARIA — azul clínico/teal, no igual al Admin. */
.vm-member-shell.vmh16-shell .vm-clinic-dashboard.vm-vet-home-premium.vm-v22-classic > .vm-v22-hero {
  background: linear-gradient(112deg,#194575 0%,#146179 60%,#078e90 100%) !important;
  border-color: #2b8794 !important;
}
.vm-member-shell.vmh16-shell .vm-clinic-dashboard.vm-vet-home-premium.vm-v22-classic .vm-v22-hero .vm-v22-hero-copy::before {
  color: #9affed !important;
}
.vm-member-shell.vmh16-shell .vm-clinic-dashboard.vm-vet-home-premium.vm-v22-classic .vm-v22-hero .vm-v22-hero-copy h1,
.vm-member-shell.vmh16-shell .vm-clinic-dashboard.vm-vet-home-premium.vm-v22-classic .vm-v22-hero .vm-v22-hero-copy p {
  color: #ffffff !important;
}
.vm-member-shell.vmh16-shell .vm-clinic-dashboard.vm-vet-home-premium.vm-v22-classic .vm-v22-hero .vm-v22-hero-note.vm-v2713-no-card {
  position: relative !important;
  z-index: 4 !important;
  flex: 0 0 min(27%,238px) !important;
  width: 225px !important;
  max-width: 26% !important;
  min-width: 155px !important;
  min-height: 155px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px !important;
  margin: 0 !important;
  padding: 10px 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  text-align: center !important;
}
.vm-member-shell.vmh16-shell .vm-clinic-dashboard.vm-vet-home-premium.vm-v22-classic .vm-v22-hero .vm-v22-hero-note.vm-v2713-no-card strong {
  max-width: 190px !important;
  color: #f0fffd !important;
  font-family: Inter,'Segoe UI',Arial,sans-serif !important;
  font-size: 14px !important;
  line-height: 1.35 !important;
  font-weight: 800 !important;
  text-shadow: 0 1px 7px rgba(0,32,54,.25) !important;
}
.vm-member-shell.vmh16-shell .vm-clinic-dashboard.vm-vet-home-premium.vm-v22-classic .vm-v22-hero .vm-v22-hero-note.vm-v2713-no-card .vm-v2713-line-icon {
  display: block !important;
  flex: none !important;
  width: 78px !important;
  height: 78px !important;
  color: #96fff0 !important;
  filter: drop-shadow(0 5px 9px rgba(0,30,50,.18));
}

/* Mantiene iconos visibles en escritorio compacto y evita solapamientos. */
@media (max-width: 900px) {
  .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero .vm-o15-hero-decor {
    min-width: 135px !important;
    flex-basis: 160px !important;
  }
  .vm-member-shell.vmh16-shell .vm-clinic-dashboard.vm-vet-home-premium.vm-v22-classic .vm-v22-hero .vm-v22-hero-note.vm-v2713-no-card {
    flex-basis: 155px !important;
    min-width: 155px !important;
    max-width: 34% !important;
  }
}
@media (max-width: 680px) {
  .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero .vm-o15-hero-decor,
  .vm-member-shell.vmh16-shell .vm-clinic-dashboard.vm-vet-home-premium.vm-v22-classic .vm-v22-hero .vm-v22-hero-note.vm-v2713-no-card {
    display: none !important;
  }
  .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero,
  .vm-member-shell.vmh16-shell .vm-clinic-dashboard.vm-vet-home-premium.vm-v22-classic .vm-v22-hero {
    padding: 24px 22px !important;
    min-height: 165px !important;
  }
}
'''


def install():
    for p in (MAIN, OWNER):
        if not p.is_file():
            raise RuntimeError(f"No encuentro {p.relative_to(ROOT)}. Copia el .py en la raiz de ProyectoVetMap.")

    orig_main = MAIN.read_text(encoding="utf-8")
    orig_owner = OWNER.read_text(encoding="utf-8")
    orig_css = CSS_FILE.read_text(encoding="utf-8") if CSS_FILE.exists() else None

    if "vm-v22-hero" not in orig_main or "VetMapOwnerHome" not in orig_main:
        raise RuntimeError("No encuentro el Inicio Veterinaria/Dueño esperado; no se modifico nada.")

    # No reemplaza otros componentes ni codigo de las funciones.
    if 'vm-v2713-no-card' in orig_owner:
        new_owner = orig_owner
    elif orig_owner.count(OWNER_OLD) == 1:
        new_owner = orig_owner.replace(OWNER_OLD, OWNER_NEW, 1)
    else:
        raise RuntimeError("No reconozco la tarjeta del banner Dueño en tu version. No se modifico nada.")

    if 'className="vm-v22-hero-note vm-v2713-no-card"' in orig_main:
        new_main = orig_main
    else:
        matches = list(VET_OLD_RE.finditer(orig_main))
        if len(matches) != 1:
            raise RuntimeError("No reconozco la tarjeta del banner Veterinaria en tu version. No se modifico nada.")
        new_main = orig_main[:matches[0].start()] + VET_NEW + orig_main[matches[0].end():]

    # Importar CSS nuevo despues de las otras hojas de estilo para que gane la cascada.
    lines = [ln for ln in new_main.splitlines(keepends=True) if ln.strip() != CSS_IMPORT]
    css_import_re = re.compile(r'^\s*import\s+["\'][^"\']+\.css["\'];')
    matches = [i for i, ln in enumerate(lines[:300]) if css_import_re.match(ln)]
    if not matches:
        raise RuntimeError("No encuentro importaciones CSS en main.jsx. No se modifico nada.")
    lines.insert(matches[-1] + 1, CSS_IMPORT + ('\r\n' if '\r\n' in orig_main else '\n'))
    new_main = ''.join(lines)

    if new_main.count(CSS_IMPORT) != 1 or new_owner.count('vm-v2713-no-card') != 1 or new_main.count('className="vm-v22-hero-note vm-v2713-no-card"') != 1:
        raise RuntimeError("Verificacion interna fallida. No se modifico nada.")

    if orig_main == new_main and orig_owner == new_owner and orig_css == CSS:
        print("VetMap V27.13 ya esta instalada. No se cambiaron archivos.")
        return

    backups = ROOT / 'respaldos_instaladores'
    backups.mkdir(parents=True, exist_ok=True)
    backup = backups / ('antes_v27_13_' + datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
    backup.mkdir(exist_ok=False)
    shutil.copy2(MAIN, backup / 'main.jsx')
    shutil.copy2(OWNER, backup / 'VetMapOwnerHome.jsx')
    if CSS_FILE.exists():
        shutil.copy2(CSS_FILE, backup / CSS_FILE.name)

    try:
        CSS_FILE.write_text(CSS, encoding="utf-8")
        OWNER.write_text(new_owner, encoding="utf-8")
        MAIN.write_text(new_main, encoding="utf-8")
    except Exception:
        shutil.copy2(backup / 'main.jsx', MAIN)
        shutil.copy2(backup / 'VetMapOwnerHome.jsx', OWNER)
        if orig_css is not None:
            shutil.copy2(backup / CSS_FILE.name, CSS_FILE)
        elif CSS_FILE.exists():
            CSS_FILE.unlink()
        raise

    print("\nVETMAP V27.13 INSTALADA CORRECTAMENTE")
    print(" + Inicio Dueño: icono de huella sobre banner, SIN tarjeta blanca")
    print(" + Inicio Veterinaria: icono de estetoscopio sobre banner, SIN tarjeta blanca")
    print(" + Iconos SVG incluidos en el codigo; no se usan archivos de imagen ni assets")
    print(" + No se alteraron backend, mobile, PostgreSQL, .env ni chat")
    print(" + Respaldo:", backup)
    print("Actualiza la pagina con Ctrl + F5")


if __name__ == '__main__':
    try:
        install()
    except Exception as exc:
        print('NO SE APLICO:', exc)
        sys.exit(1)
