# -*- coding: utf-8 -*-
r"""VetMap V27.19 — Iconos premium en los banners de Inicio Dueño/Veterinaria.

Uso desde la carpeta raiz ProyectoVetMap:
    python .\instalar_iconos_premium_v27_19.py
    python .\instalar_iconos_premium_v27_19.py --deshacer

No modifica datos, backend, mobile, otros roles ni funcionalidades.
Los iconos son SVG vectoriales escritos dentro de JSX: no se instalan fotos ni archivos PNG.
"""
from datetime import datetime
from pathlib import Path
import hashlib
import json
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parent
MAIN = ROOT / 'web' / 'src' / 'main.jsx'
OWNER = ROOT / 'web' / 'src' / 'components' / 'VetMapOwnerHome.jsx'
CSS = ROOT / 'web' / 'src' / 'vetmap_v27_19_iconos_premium.css'
STATES = ROOT / 'respaldos_instaladores'
STATE = STATES / '.vetmap_v27_19_estado.json'
CSS_IMPORT = 'import "./vetmap_v27_19_iconos_premium.css";'
OWNER_TAG = '<section className="vm-o15-hero">'
VET_TAG = '<section className="vm-v22-hero">'
IMPORT_ANCHOR = '} from "./api";'

OWNER_VISUAL = '''<div className="vm-v2719-visual vm-v2719-visual--owner" aria-hidden="true">
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
        </div>'''

VET_VISUAL = '''<div className="vm-v2719-visual vm-v2719-visual--vet" aria-hidden="true">
                        <span className="vm-v2719-ring vm-v2719-ring--one" />
                        <span className="vm-v2719-ring vm-v2719-ring--two" />
                        <div className="vm-v2719-icon-tile">
                          <svg className="vm-v2719-symbol" viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                            <path d="M23 19v22c0 16 10 27 25 27s25-11 25-27V19" />
                            <path d="M23 19h-4v11M73 19h4v11" />
                            <path d="M48 68v8c0 7 5 12 12 12s12-5 12-12v-5" />
                            <circle cx="72" cy="65" r="7" />
                            <g fill="currentColor" stroke="none">
                              <circle cx="37" cy="37" r="3.2"/><circle cx="46" cy="33" r="3.2"/><circle cx="55" cy="37" r="3.2"/>
                              <path d="M46 40c-4 0-6 4-9 8-2 3-1 7 3 7 2 0 4-2 6-2s4 2 6 2c4 0 5-4 3-7-3-4-5-8-9-8Z" />
                            </g>
                          </svg>
                        </div>
                      </div>'''

# Note: only banner styles are affected. Extra specificity beats V27.10–V27.18 styles.
STYLES = r'''/* ==========================================================
   VetMap V27.19 | Banners iconos premium de Inicio
   REFERENCIA: icono de Admin, pero colores propios de cada rol
   SVG inline en React. SIN fotos, PNG/JPG, assets, emojis flotantes.
   Solo Dueño de mascota y Veterinaria. Ningún otro rol.
   ========================================================== */

/* No dejes que los estilos de las V27.10-V27.18 vuelvan a mostrar
   el icono viejo, la huellita duplicada o el texto decorativo. */
body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero .vm-o15-hero-decor,
body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero .vm-o15-hero-note,
body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic .vm-v22-hero.vm-v2719-hero .vm-v22-hero-note {
  display: none !important;
  visibility: hidden !important;
}

/* El saludo queda limpio, tal como en las referencias aprobadas. */
body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero h1 > span[aria-hidden="true"] {
  display: none !important;
}

/* Dos gradientes diferenciados, sobre el mismo sistema de diseño. */
body .vm-member-shell.vm-owner-v15-shell .vm-o15-page section.vm-o15-hero.vm-v2719-hero {
  background: linear-gradient(116deg,#063c49 0%,#07535a 58%,#058b82 100%) !important;
  background-image: linear-gradient(116deg,#063c49 0%,#07535a 58%,#058b82 100%) !important;
  border:1px solid rgba(25,171,170,.23) !important;
  border-radius: 24px !important;
  box-shadow: 0 14px 32px rgba(9,67,79,.11) !important;
  min-height: 220px !important;
  padding: 34px 42px !important;
  isolation: isolate !important;
  position:relative !important;
  overflow:hidden !important;
}
body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic section.vm-v22-hero.vm-v2719-hero {
  background: linear-gradient(115deg,#07365b 0%,#075976 54%,#079e96 100%) !important;
  background-image: linear-gradient(115deg,#07365b 0%,#075976 54%,#079e96 100%) !important;
  border:1px solid rgba(52,168,183,.25) !important;
  border-radius: 24px !important;
  box-shadow:0 14px 30px rgba(6,56,88,.11) !important;
  min-height: 218px !important;
  padding: 34px 42px !important;
  isolation:isolate !important;
  position:relative !important;
  overflow:hidden !important;
}

/* Eliminar decoraciones antiguas que se cruzaban sobre el texto. */
body .vm-member-shell.vm-owner-v15-shell .vm-o15-page section.vm-o15-hero.vm-v2719-hero::before,
body .vm-member-shell.vm-owner-v15-shell .vm-o15-page section.vm-o15-hero.vm-v2719-hero::after,
body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic section.vm-v22-hero.vm-v2719-hero::before,
body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic section.vm-v22-hero.vm-v2719-hero::after {
  display:none !important;
  content:none !important;
}

body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero .vm-o15-hero-copy,
body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic .vm-v22-hero.vm-v2719-hero .vm-v22-hero-copy {
  position:relative !important;
  z-index:6 !important;
  max-width:calc(100% - 190px) !important;
  min-width:0 !important;
}
body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero h1,
body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic .vm-v22-hero.vm-v2719-hero h1 {
  color:#fff !important;
  font-family:Inter,'Segoe UI',Arial,sans-serif !important;
  font-size:clamp(32px,3.4vw,52px) !important;
  font-weight:900 !important;
  letter-spacing:-.035em !important;
  line-height:1.12 !important;
}
body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero .vm-o15-eyebrow,
body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic .vm-v22-hero.vm-v2719-hero .vm-v22-hero-copy::before {
  color:#9ff5ef !important;
  font-weight:900 !important;
  letter-spacing:.16em !important;
}
body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero .vm-o15-hero-copy > p:not(.vm-o15-eyebrow),
body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic .vm-v22-hero.vm-v2719-hero .vm-v22-hero-copy p {
  color:#e6f9fa !important;
  font-weight:550 !important;
  line-height:1.5 !important;
  font-size:clamp(13px,1.15vw,17px) !important;
  text-shadow:none !important;
}

/* NUEVA composición: 2 anillos discretos y una sola ficha celeste. */
body .vm-o15-hero.vm-v2719-hero > .vm-v2719-visual,
body .vm-v22-hero.vm-v2719-hero > .vm-v2719-visual {
  position:absolute !important;
  right:clamp(26px,5vw,82px) !important;
  top:50% !important;
  transform:translateY(-50%) !important;
  display:grid !important;
  place-items:center !important;
  flex:none !important;
  width:154px !important;
  height:154px !important;
  min-width:154px !important;
  min-height:154px !important;
  z-index:8 !important;
  pointer-events:none !important;
  isolation:isolate !important;
}
body .vm-v2719-hero .vm-v2719-visual .vm-v2719-ring {
  position:absolute !important;
  z-index:-1 !important;
  display:block !important;
  border:1px solid rgba(201,255,255,.22) !important;
  border-radius:50% !important;
  background:transparent !important;
  pointer-events:none !important;
}
body .vm-v2719-hero .vm-v2719-visual .vm-v2719-ring--one {
  width:270px !important;
  height:270px !important;
  top:-59px !important;
  left:-60px !important;
}
body .vm-v2719-hero .vm-v2719-visual .vm-v2719-ring--two {
  width:365px !important;
  height:365px !important;
  top:-107px !important;
  left:-107px !important;
  border-color:rgba(212,255,255,.12) !important;
}
body .vm-v2719-hero .vm-v2719-visual .vm-v2719-icon-tile {
  width:138px !important;
  height:138px !important;
  padding:0 !important;
  display:grid !important;
  place-items:center !important;
  position:relative !important;
  z-index:1 !important;
  flex:none !important;
  border:1px solid rgba(255,255,255,.96) !important;
  border-radius:31px !important;
  box-shadow:0 15px 28px rgba(0,20,37,.26),inset 0 2px 0 rgba(255,255,255,.95) !important;
  opacity:1 !important;
  background:linear-gradient(145deg,#f5ffff 0%,#b6f4f0 100%) !important;
}
body .vm-v22-hero.vm-v2719-hero .vm-v2719-icon-tile {
  background:linear-gradient(145deg,#f6ffff,#c8f9f5) !important;
}
body .vm-v2719-hero .vm-v2719-visual .vm-v2719-symbol {
  display:block !important;
  visibility:visible !important;
  width:83px !important;
  height:83px !important;
  min-width:83px !important;
  min-height:83px !important;
  max-width:83px !important;
  max-height:83px !important;
  color:#056a70 !important;
  fill:currentColor;
  filter:none !important;
  opacity:1 !important;
}
body .vm-v22-hero.vm-v2719-hero .vm-v2719-visual .vm-v2719-symbol {
  color:#075b6b !important;
  fill:none;
}

@media (max-width:950px) {
  body .vm-o15-hero.vm-v2719-hero > .vm-v2719-visual,
  body .vm-v22-hero.vm-v2719-hero > .vm-v2719-visual {
    right:22px !important;
    width:98px !important;
    height:98px !important;
    min-width:98px !important;
    min-height:98px !important;
  }
  body .vm-v2719-hero .vm-v2719-visual .vm-v2719-icon-tile {
    width:94px !important;
    height:94px !important;
    border-radius:24px !important;
  }
  body .vm-v2719-hero .vm-v2719-visual .vm-v2719-symbol {
    width:57px !important;height:57px !important;
    min-width:57px !important;min-height:57px !important;
  }
  body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero .vm-o15-hero-copy,
  body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic .vm-v22-hero.vm-v2719-hero .vm-v22-hero-copy {
    max-width:calc(100% - 117px) !important;
  }
}
@media (max-width:610px) {
  body .vm-o15-hero.vm-v2719-hero > .vm-v2719-visual,
  body .vm-v22-hero.vm-v2719-hero > .vm-v2719-visual {
    display:none !important;
  }
  body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero .vm-o15-hero-copy,
  body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic .vm-v22-hero.vm-v2719-hero .vm-v22-hero-copy {
    max-width:100% !important;
  }
  body .vm-member-shell.vm-owner-v15-shell .vm-o15-page section.vm-o15-hero.vm-v2719-hero,
  body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic section.vm-v22-hero.vm-v2719-hero {
    padding:25px 22px !important;
    min-height:175px !important;
  }
}
'''


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fail(message):
    raise RuntimeError(message)


def check_files():
    if not MAIN.is_file() or not OWNER.is_file():
        fail('Pon el instalador en la raíz ProyectoVetMap, donde están backend, mobile y web.')


def install():
    check_files()
    current_main = MAIN.read_text(encoding='utf-8')
    current_owner = OWNER.read_text(encoding='utf-8')
    installed = CSS_IMPORT in current_main or 'vm-v2719-visual' in current_owner or 'vm-v2719-visual' in current_main
    if installed:
        if CSS_IMPORT in current_main and 'vm-v2719-visual' in current_owner and 'vm-v2719-visual' in current_main and CSS.exists():
            print('VetMap V27.19 ya está instalada. No se duplicaron cambios.')
            return
        fail('Encontré una instalación parcial V27.19. No modifiqué nada; revisa el archivo principal.')
    if STATE.exists():
        fail('Existe un respaldo activo de V27.19 pero el código cambió. No modifiqué nada; revisa el estado antes de reinstalar.')
    if CSS.exists():
        fail(f'El archivo {CSS.name} ya existe. No lo sobrescribí.')
    if current_main.count(VET_TAG) != 1 or current_owner.count(OWNER_TAG) != 1:
        fail('El código local de los banners cambió y no puedo identificar ambos con seguridad. No modifiqué nada.')
    if current_main.count(IMPORT_ANCHOR) != 1:
        fail('No encuentro el import de la API en web/src/main.jsx. No modifiqué nada.')

    owner_next = current_owner.replace(
        OWNER_TAG, '<section className="vm-o15-hero vm-v2719-hero">\n        ' + OWNER_VISUAL, 1
    )
    main_next = current_main.replace(
        VET_TAG, '<section className="vm-v22-hero vm-v2719-hero">\n                      ' + VET_VISUAL, 1
    )
    main_next = main_next.replace(IMPORT_ANCHOR, IMPORT_ANCHOR + '\n' + CSS_IMPORT, 1)
    if owner_next.count('className="vm-v2719-visual') != 1 or main_next.count('className="vm-v2719-visual') != 1:
        fail('Validación interna de JSX no superada. No modifiqué nada.')

    STATES.mkdir(parents=True, exist_ok=True)
    backup = STATES / f'respaldo_antes_iconos_v27_19_{datetime.now():%Y%m%d_%H%M%S_%f}'
    backup.mkdir(parents=True, exist_ok=False)
    main_backup = backup / 'main.jsx'
    owner_backup = backup / 'VetMapOwnerHome.jsx'
    shutil.copy2(MAIN, main_backup)
    shutil.copy2(OWNER, owner_backup)
    original = {str(p.relative_to(ROOT)).replace('\\','/'): sha(p.read_bytes()) for p in (MAIN,OWNER)}

    try:
        MAIN.write_text(main_next, encoding='utf-8')
        OWNER.write_text(owner_next, encoding='utf-8')
        CSS.write_text(STYLES, encoding='utf-8')
        modified = {str(p.relative_to(ROOT)).replace('\\','/'): sha(p.read_bytes()) for p in (MAIN,OWNER,CSS)}
        state = {'backup':str(backup.relative_to(ROOT)).replace('\\','/'), 'original':original,'installed':modified}
        STATE.write_text(json.dumps(state,indent=2,ensure_ascii=False),encoding='utf-8')
    except Exception:
        shutil.copy2(main_backup, MAIN)
        shutil.copy2(owner_backup, OWNER)
        if CSS.exists():
            CSS.unlink()
        raise

    print('\nVETMAP V27.19 - ICONOS PREMIUM INSTALADOS')
    print(' + Dueño: huella sólida turquesa sobre ficha clara, como Admin')
    print(' + Veterinaria: estetoscopio con huella sobre ficha clara')
    print(' + Ocultos: iconos antiguos/duplicados y textos decorativos')
    print(' + Sin fotos ni imágenes externas. Otros roles sin cambios.')
    print(' + Respaldo:',backup)
    print('Actualiza la página con Ctrl+F5. Si no te convence: python .\\instalar_iconos_premium_v27_19.py --deshacer')


def undo():
    if not STATE.exists():
        fail('No encuentro una instalación V27.19 activa para deshacer.')
    data=json.loads(STATE.read_text(encoding='utf-8'))
    check_files()
    installed=data['installed']
    for rel,h in installed.items():
        p=ROOT / rel
        if not p.exists() or sha(p.read_bytes()) != h:
            fail(f'{rel} cambió después de instalar V27.19. No restauré archivos para no perder cambios nuevos.')
    backup = ROOT / data['backup']
    if not (backup / 'main.jsx').exists() or not (backup / 'VetMapOwnerHome.jsx').exists():
        fail('No encuentro el respaldo original; no modifiqué nada.')
    shutil.copy2(backup / 'main.jsx',MAIN)
    shutil.copy2(backup / 'VetMapOwnerHome.jsx',OWNER)
    CSS.unlink()
    STATE.unlink()
    print('VETMAP V27.19 DESHECHA. Archivos originales restaurados desde:',backup)
    print('Actualiza VetMap con Ctrl+F5.')


if __name__ == '__main__':
    try:
        if len(sys.argv) == 2 and sys.argv[1] == '--deshacer':
            undo()
        elif len(sys.argv) == 1:
            install()
        else:
            fail('Uso: python instalar_iconos_premium_v27_19.py [--deshacer]')
    except Exception as exc:
        print('\nNO SE APLICÓ V27.19:',exc)
        sys.exit(1)
