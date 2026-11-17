# -*- coding: utf-8 -*-
"""VetMap V27.11 corregida. No usa imagenes ni altera funcionalidad.

Poner este archivo y vetmap_v27_11_veterinaria_sin_fotos.css en la raiz
ProyectoVetMap, junto a backend/, web/ y mobile/.
"""
from datetime import datetime
from pathlib import Path
import re
import shutil
import sys

BASE = Path(__file__).resolve().parent
MAIN = BASE / "web" / "src" / "main.jsx"
CSS_SRC = BASE / "vetmap_v27_11_veterinaria_sin_fotos.css"
CSS_DST = BASE / "web" / "src" / CSS_SRC.name
LINE = 'import "./vetmap_v27_11_veterinaria_sin_fotos.css";'


def install():
    if not MAIN.is_file() or not CSS_SRC.is_file():
        raise RuntimeError("Copia el .py y el .css directamente en ProyectoVetMap (no dentro de web).")
    main = MAIN.read_text(encoding="utf-8")
    css = CSS_SRC.read_text(encoding="utf-8")
    if "vm-v22-hero" not in main or "vm-clinic-section-heading" not in main:
        raise RuntimeError("No encuentro los componentes Veterinaria V22. No se modificaron archivos.")
    # La clase del menu es DINAMICA: vm-member-nav--${currentUser.role}
    # Por ello NO exigimos que aparezca literalmente 'vm-member-nav--vet'.
    if "vm-member-nav--" not in main:
        raise RuntimeError("No encuentro el menu de roles. No se modificaron archivos.")
    if "url(" in css.lower() or "vetmap_v27_10_pets.png" in css.lower():
        raise RuntimeError("El CSS contiene imagenes: se cancela la instalacion.")
    if "vm-v22-hero" not in css or "vm-clinic-page" not in css:
        raise RuntimeError("El CSS no es el esperado. No se modificaron archivos.")

    # Asegurar que la hoja de estilos corregida sea la ultima importacion CSS
    # para que prevalezca sobre los temas antiguos, incluida V27.10.
    lines = main.splitlines(keepends=True)
    css_import_pattern = re.compile(r'^\s*import\s+[\'\"](.+?\.css)[\'\"];\s*$')
    idx_css = [i for i, line in enumerate(lines[:260]) if css_import_pattern.match(line.rstrip("\r\n"))]
    if not idx_css:
        raise RuntimeError("No encuentro imports CSS en main.jsx; no se modifico nada.")
    lines = [l for l in lines if l.strip() != LINE]
    idx_css = [i for i, line in enumerate(lines[:260]) if css_import_pattern.match(line.rstrip("\r\n"))]
    newline = "\r\n" if "\r\n" in main else "\n"
    lines.insert(idx_css[-1] + 1, LINE + newline)
    updated_main = "".join(lines)

    if MAIN.read_text(encoding="utf-8") == updated_main and CSS_DST.is_file() and CSS_DST.read_text(encoding="utf-8") == css:
        print("V27.11 CORREGIDA ya instalada. No se realizaron cambios nuevos.")
        return

    backup = BASE / ("respaldo_antes_v27_11_corregida_" + datetime.now().strftime("%Y%m%d_%H%M%S_%f"))
    backup.mkdir()
    shutil.copy2(MAIN, backup / "main.jsx")
    old_css_exists = CSS_DST.exists()
    if old_css_exists:
        shutil.copy2(CSS_DST, backup / CSS_DST.name)
    try:
        CSS_DST.write_text(css, encoding="utf-8")
        MAIN.write_text(updated_main, encoding="utf-8")
    except Exception:
        shutil.copy2(backup / "main.jsx", MAIN)
        if old_css_exists:
            shutil.copy2(backup / CSS_DST.name, CSS_DST)
        elif CSS_DST.exists():
            CSS_DST.unlink()
        raise

    print("\nVETMAP V27.11 CORREGIDA - INSTALACION EXITOSA")
    print(" + Banner inicio de Veterinaria: turquesa SIN fotografias")
    print(" + Agenda, Pacientes, Fichas, Recetas y Perfil: encabezados turquesa")
    print(" + Solo se alteraron web/src/main.jsx y un archivo CSS nuevo")
    print(" + No se modificaron backend, mobile, BD, .env ni chat")
    print(" + Respaldo original:", backup)
    print("Actualiza el navegador con Ctrl + F5.")


if __name__ == "__main__":
    try:
        install()
    except Exception as exc:
        print("NO SE APLICO:", exc)
        sys.exit(1)
