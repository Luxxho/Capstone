# -*- coding: utf-8 -*-
"""VetMap V27.11: estilos de Veterinaria sin fotos. CSS-only y reversible."""
from pathlib import Path
from datetime import datetime
import shutil
import re
import sys

ROOT = Path(__file__).resolve().parent
MAIN = ROOT / "web" / "src" / "main.jsx"
CSS = ROOT / "web" / "src" / "vetmap_v27_11_veterinaria_sin_fotos.css"
SOURCE_CSS = ROOT / "vetmap_v27_11_veterinaria_sin_fotos.css"
IMPORT = 'import "./vetmap_v27_11_veterinaria_sin_fotos.css";'

def install():
    if not MAIN.is_file() or not SOURCE_CSS.is_file():
        raise RuntimeError("Pon el instalador y el CSS en ProyectoVetMap, junto a backend, web y mobile.")
    main_text = MAIN.read_text(encoding="utf-8")
    for anchor in ("vm-v22-hero", "vm-clinic-section-heading", "vm-member-nav--vet"):
        if anchor not in main_text:
            raise RuntimeError(f"No encuentro {anchor} en web/src/main.jsx. No se modifico nada.")
    css_text = SOURCE_CSS.read_text(encoding="utf-8")
    if 'url(' in css_text or 'vetmap_v27_10_pets.png' in css_text:
        raise RuntimeError("El CSS contiene fotos: no se instala.")
    if main_text.count(IMPORT)>1:
        raise RuntimeError("La importacion aparece duplicada; no se modifico nada.")
    # Insertar despues de la ultima importacion CSS para prevalecer sobre V27.10.
    if IMPORT not in main_text:
        lines = main_text.splitlines(keepends=True)
        imports = [i for i,line in enumerate(lines[:250]) if re.match(r'^import\s+[\'\"].+?\.css[\'\"];', line)]
        if not imports:
            raise RuntimeError("No encuentro las importaciones CSS en main.jsx. No se modifico nada.")
        lines.insert(imports[-1]+1, IMPORT + "\n")
        patched = "".join(lines)
    else:
        patched = main_text
    # Detectar estado ya instalado para no generar respaldos extras.
    if patched == main_text and CSS.exists() and CSS.read_text(encoding="utf-8") == css_text:
        print("VetMap V27.11 ya estaba instalado. No se modifico nada.")
        return
    backup = ROOT / ("respaldo_antes_v27_11_sin_fotos_" + datetime.now().strftime("%Y%m%d_%H%M%S_%f"))
    backup.mkdir(parents=True)
    shutil.copy2(MAIN, backup / "main.jsx")
    if CSS.exists():
        shutil.copy2(CSS, backup / CSS.name)
    try:
        CSS.write_text(css_text, encoding="utf-8")
        if patched != main_text:
            MAIN.write_text(patched, encoding="utf-8")
    except Exception:
        shutil.copy2(backup / "main.jsx", MAIN)
        prev = backup / CSS.name
        if prev.exists():
            shutil.copy2(prev,CSS)
        elif CSS.exists():
            CSS.unlink()
        raise
    print("\nVETMAP V27.11 - VETERINARIA SIN FOTOS INSTALADO")
    print(" + Inicio: banner turquesa sin perro ni gato")
    print(" + Agenda, Pacientes, Fichas, Recetas y Perfil: mismo estilo sin fotos")
    print(" + Solo CSS, decoracion con degradados y circulos")
    print(" + No cambia el chat, backend, base de datos, app ni otros roles")
    print(" Respaldo:", backup)
    print(" Actualiza la web con Ctrl + F5. Si no cambia, reinicia npm run dev.")

if __name__ == "__main__":
    try:
        install()
    except Exception as exc:
        print("NO SE APLICO:", exc)
        sys.exit(1)
