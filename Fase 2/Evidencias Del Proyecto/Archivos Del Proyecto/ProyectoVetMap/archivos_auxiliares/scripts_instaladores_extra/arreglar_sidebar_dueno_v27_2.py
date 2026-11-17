# -*- coding: utf-8 -*-
"""
VetMap V27.2: iconos lineales para el sidebar del Dueño.
Ejecución: python arreglar_sidebar_dueno_v27_2.py
- Modifica únicamente web/src/main.jsx y agrega CSS del menú de Dueño.
- No toca backend, mobile, chat, base de datos ni .env.
- Guarda copia de seguridad.
"""
from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path(__file__).resolve().parent
MAIN = ROOT / "web" / "src" / "main.jsx"
CSS = ROOT / "web" / "src" / "vetmap_sidebar_dueno_v27_2.css"
CSS_IMPORT = 'import "./vetmap_sidebar_dueno_v27_2.css";'
BASE_IMPORT = 'import "./vetmap_repartidores_v26.css";'

ICONS = {
    "Inicio": '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    "Mascotas": '<circle cx="6" cy="8" r="1.7"/><circle cx="11" cy="5.5" r="1.7"/><circle cx="16.5" cy="7" r="1.7"/><circle cx="20" cy="11" r="1.5"/><path d="M12.7 12.7c-1.9-1.9-3.5-.8-4.9.8l-2.5 2.7c-2.6 3.2.6 6.6 3.8 5 1.8-.9 3.4-.8 5.2 0 3.6 1.6 6.2-2 3.5-4.8l-3.2-3.5c-.8-.8-1.6-1.2-2.6-.7z"/>',
    "Reservas": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 18h3"/>',
    "Tienda": '<path d="M3 10h18l-1.5-6h-15zM5 10v11h14V10M3 10c0 3 4.5 3 4.5 0 0 3 4.5 3 4.5 0 0 3 4.5 3 4.5 0 0 3 4.5 3 4.5 0"/><path d="M9 21v-7h6v7"/>',
    "Pedidos": '<path d="m3 7 9-4 9 4v11l-9 4-9-4zM3 7l9 5 9-5M12 12v10"/>',
    "Veterinarias": '<path d="M6 3v6a6 6 0 0 0 12 0V3M6 3H4v4M18 3h2v4M12 15v2a4 4 0 0 0 8 0v-1"/><circle cx="20" cy="14" r="2"/>',
}
CSS_TEXT = r"""/* VetMap V27.2: solo sidebar del Dueño, alineado con el estilo veterinario.
   No afecta Tienda, Admin, Veterinaria ni Chat. */

.vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 12px !important;
  width: 100% !important;
  min-height: 43px !important;
  padding: 10px 12px !important;
  margin: 0 !important;
  border: 1px solid transparent !important;
  border-radius: 11px !important;
  background: transparent !important;
  background-image: none !important;
  color: #e8f1ff !important;
  box-shadow: none !important;
  text-align: left !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  line-height: 1.3 !important;
  letter-spacing: 0 !important;
  transition: background-color .17s ease, border-color .17s ease !important;
}

/* Evita que reaparezcan los emojis creados por reglas antiguas. */
.vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button::before,
.vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button::after {
  content: none !important;
  display: none !important;
}

.vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button > .vm-owner-v27-icon {
  display: block !important;
  width: 19px !important;
  height: 19px !important;
  min-width: 19px !important;
  flex: 0 0 19px !important;
  color: #c6d6ee !important;
  stroke: currentColor !important;
}

.vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button > .vm-owner-v27-label {
  display: inline !important;
  color: inherit !important;
  white-space: normal !important;
}

.vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button:hover {
  background: #24466e !important;
  border-color: #3a5b83 !important;
  color: #fff !important;
}

.vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button.active {
  background: #2c5685 !important;
  border-color: #4177ae !important;
  color: #fff !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
}

.vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button.active .vm-owner-v27-icon,
.vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button:hover .vm-owner-v27-icon {
  color: #fff !important;
}

.vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button:focus-visible {
  outline: 2px solid #8bd3ff !important;
  outline-offset: 2px !important;
}

@media (min-width: 1100px) {
  .vm-member-shell.vmh16-shell > nav.vm-member-nav--owner > .vm-owner-main-nav {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 3px !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }
}

/* Menú responsive: conserva la navegación horizontal de VetMap. */
@media (max-width: 1099px) {
  .vm-member-shell.vmh16-shell > nav.vm-member-nav--owner .vm-owner-main-nav > button {
    width: auto !important;
    min-width: 115px !important;
  }
}
"""

START_MARK = (
    '                  ) : (\n'
    '                    <>\n'
    '                      <button\n'
    '                        type="button"\n'
    '                        onClick={() => {\n'
    '                          setMessage("");\n'
    '                          setSelectedPet(null);\n'
    '                          setOwnerMenuOpen(false);'
)
END_MARK = '                    </>\n                  )}\n                </div>'

def run():
    if not MAIN.exists():
        raise RuntimeError(
            "No encuentro web/src/main.jsx. Pon este instalador en la carpeta principal ProyectoVetMap."
        )
    source = MAIN.read_text(encoding="utf-8")
    if CSS_IMPORT in source and 'vm-owner-v27-icon' in source:
        print("Los iconos V27.2 ya estaban instalados. No se modifico nada.")
        return

    start = source.find(START_MARK)
    if start < 0:
        raise RuntimeError(
            "No reconoci el menu del Dueño en tu version actual. "
            "No modifique nada; envia este mensaje para revisar tu main.jsx."
        )
    end = source.find(END_MARK, start)
    if end < 0:
        raise RuntimeError(
            "No pude delimitar el menu del Dueño. No modifique nada."
        )
    owner = source[start:end]

    if 'vm-owner-v27-icon' in owner:
        raise RuntimeError("El menu ya tiene iconos V27.2, pero falta verificar la importacion; no modifique nada.")

    for label, inner in ICONS.items():
        original = '>\n                        ' + label + '\n                      </button>'
        if owner.count(original) != 1:
            raise RuntimeError(
                f"No encontre una unica entrada '{label}' en el menu del Dueño. "
                "No modifique nada."
            )
        svg = (
            '<svg className="vm-owner-v27-icon" viewBox="0 0 24 24" '
            'fill="none" stroke="currentColor" strokeWidth="1.8" '
            'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">'
            + inner + '</svg>'
        )
        revised = '>\n                        ' + svg + '\n                        <span className="vm-owner-v27-label">' + label + '</span>\n                      </button>'
        owner = owner.replace(original, revised, 1)

    if CSS_IMPORT not in source and BASE_IMPORT not in source:
        raise RuntimeError(
            "No encontre el punto seguro para importar el CSS. No modifique nada."
        )

    amended = source[:start] + owner + source[end:]
    if CSS_IMPORT not in amended:
        amended = amended.replace(BASE_IMPORT, BASE_IMPORT + '\n' + CSS_IMPORT, 1)

    if amended.count(CSS_IMPORT) != 1 or amended.count('className="vm-owner-v27-icon"') != 6:
        raise RuntimeError("Verificacion interna fallida. No modifique nada.")

    backup = ROOT / f"respaldo_sidebar_dueno_antes_v27_2_{datetime.now():%Y%m%d_%H%M%S}"
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(MAIN, backup / "main.jsx")
    if CSS.exists():
        shutil.copy2(CSS, backup / CSS.name)

    MAIN.write_text(amended, encoding="utf-8")
    CSS.write_text(CSS_TEXT, encoding="utf-8")
    print("\nVETMAP V27.2 - ICONOS DEL MENU DUENO INSTALADOS")
    print(" + web/src/main.jsx: iconos Inicio, Mascotas, Reservas, Tienda, Pedidos, Veterinarias")
    print(" + web/src/vetmap_sidebar_dueno_v27_2.css: estilo igual al menu Veterinaria")
    print(f"Respaldo: {backup}")
    print("No se modificaron backend, mobile, mensajes del chat, base de datos ni .env.")
    print("Actualiza tu web con Ctrl+F5 (Vite normalmente actualiza solo).")

if __name__ == "__main__":
    try:
        run()
    except Exception as exc:
        print("NO SE APLICO EL AJUSTE:", exc)
        sys.exit(1)
