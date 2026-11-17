# -*- coding: utf-8 -*-
"""VetMap V27.15: corrige tamaño y composición de banners de Inicio.
Uso: python instalar_banners_limpios_v27_15.py
Solo instala un CSS aislado, sin tocar lógica, SVG, bases de datos ni otros roles.
"""
from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path(__file__).resolve().parent
MAIN = ROOT / "web" / "src" / "main.jsx"
OWNER = ROOT / "web" / "src" / "components" / "VetMapOwnerHome.jsx"
CSS_SRC = ROOT / "vetmap_v27_15_banners_limpios.css"
CSS_DST = ROOT / "web" / "src" / "vetmap_v27_15_banners_limpios.css"
IMPORT = 'import "./vetmap_v27_15_banners_limpios.css";'
ANCHOR = "const VETMAP_PET_SPECIES = ["

def main():
    if not MAIN.is_file() or not OWNER.is_file() or not (ROOT / 'web' / 'package.json').is_file():
        raise RuntimeError("No encuentro ProyectoVetMap/web. Copia el instalador a la raíz de ProyectoVetMap.")
    if not CSS_SRC.is_file():
        raise RuntimeError("Falta vetmap_v27_15_banners_limpios.css junto al .py. Extrae ambos archivos del ZIP.")
    main_src = MAIN.read_text(encoding='utf-8')
    owner_src = OWNER.read_text(encoding='utf-8')
    css = CSS_SRC.read_text(encoding='utf-8')
    if 'vm-v2713-no-card' not in main_src or 'vm-v2713-no-card' not in owner_src:
        raise RuntimeError("No encuentro los iconos V27.13 en ambos banners. No se aplicó nada.")
    if ANCHOR not in main_src:
        raise RuntimeError("No reconozco el lugar de importación del CSS en main.jsx. No se aplicó nada.")
    if 'VetMap V27.15' not in css or len(css) < 1500:
        raise RuntimeError("El CSS está incompleto. No se aplicó nada.")
    if IMPORT in main_src and CSS_DST.exists() and CSS_DST.read_text(encoding='utf-8') == css:
        print('VetMap V27.15 ya está instalado. No se modificó nada.')
        return
    updated = main_src if IMPORT in main_src else main_src.replace(ANCHOR, IMPORT + '\n\n' + ANCHOR, 1)
    backups = ROOT / 'respaldos_instaladores' / ('respaldo_antes_v27_15_' + datetime.now().strftime('%Y%m%d_%H%M%S'))
    backups.mkdir(parents=True, exist_ok=False)
    shutil.copy2(MAIN, backups / 'main.jsx')
    if CSS_DST.exists():
        shutil.copy2(CSS_DST, backups / CSS_DST.name)
    old_css = CSS_DST.read_bytes() if CSS_DST.exists() else None
    try:
        CSS_DST.write_text(css, encoding='utf-8')
        if updated != main_src:
            MAIN.write_text(updated, encoding='utf-8')
    except Exception:
        shutil.copy2(backups / 'main.jsx', MAIN)
        if old_css is None:
            CSS_DST.unlink(missing_ok=True)
        else:
            CSS_DST.write_bytes(old_css)
        raise
    print('\nVETMAP V27.15 - BANNERS LIMPIOS INSTALADOS')
    print(' + Dueño: icono pequeño, sin texto decorativo ni circulos enormes')
    print(' + Veterinaria: icono pequeño y banner bien alineado')
    print(' + Se mantienen las funciones y los colores propios de cada rol')
    print(' + Respaldo:', backups)
    print(' Actualiza la web con Ctrl + F5.')

if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('NO SE APLICO:', exc)
        sys.exit(1)
