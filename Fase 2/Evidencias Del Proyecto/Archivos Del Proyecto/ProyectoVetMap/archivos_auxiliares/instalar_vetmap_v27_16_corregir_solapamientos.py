# -*- coding: utf-8 -*-
"""VetMap V27.16: arregla solapamientos de banners de Veterinaria.

Uso desde la raíz ProyectoVetMap:
  python .\\instalar_vetmap_v27_16_corregir_solapamientos.py
  python .\\instalar_vetmap_v27_16_corregir_solapamientos.py --deshacer

Solo importa una hoja CSS nueva; no modifica los componentes ni la lógica.
"""
from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path(__file__).resolve().parent
MAIN = ROOT / 'web' / 'src' / 'main.jsx'
SRC = ROOT / 'vetmap_v27_16_ajuste_encabezados_vet.css'
DST = ROOT / 'web' / 'src' / SRC.name
IMPORT = 'import "./vetmap_v27_16_ajuste_encabezados_vet.css";'
ANCHOR = 'const VETMAP_PET_SPECIES = ['

def main():
    if not MAIN.is_file() or not (ROOT / 'web' / 'package.json').is_file():
        raise RuntimeError('No encuentro web/src/main.jsx. Pon el .py en la carpeta ProyectoVetMap.')
    old = MAIN.read_text(encoding='utf-8')
    if '--deshacer' in sys.argv[1:]:
        if IMPORT not in old and not DST.exists():
            print('No hay cambios de V27.16 por deshacer.')
            return
        backup = ROOT/'respaldos_instaladores'/('respaldo_antes_deshacer_v27_16_'+datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
        backup.mkdir(parents=True,exist_ok=False)
        shutil.copy2(MAIN,backup/'main.jsx')
        if DST.exists(): shutil.copy2(DST,backup/DST.name)
        MAIN.write_text(old.replace(IMPORT+'\n','').replace(IMPORT,''),encoding='utf-8')
        DST.unlink(missing_ok=True)
        print('V27.16 deshecha. Actualiza navegador Ctrl+F5. Respaldo:',backup)
        return
    if not SRC.is_file():
        raise RuntimeError('Falta el .css junto al instalador. Descomprime los DOS archivos del ZIP.')
    if ANCHOR not in old or 'vm-clinic-section-heading' not in old or 'vm-v22-hero' not in old:
        raise RuntimeError('No reconozco el código de este VetMap. No se cambió nada.')
    css = SRC.read_text(encoding='utf-8')
    if 'VetMap V27.16' not in css or len(css)<3000:
        raise RuntimeError('CSS incompleto. No se cambió nada.')
    updated = old if IMPORT in old else old.replace(ANCHOR,IMPORT+'\n\n'+ANCHOR,1)
    if IMPORT in old and DST.exists() and DST.read_text(encoding='utf-8')==css:
        print('V27.16 ya está aplicada. No se cambió nada.')
        return
    backup = ROOT/'respaldos_instaladores'/('respaldo_antes_v27_16_'+datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
    backup.mkdir(parents=True,exist_ok=False)
    shutil.copy2(MAIN,backup/'main.jsx')
    before_css = DST.read_bytes() if DST.exists() else None
    if DST.exists(): shutil.copy2(DST,backup/DST.name)
    try:
        DST.write_text(css,encoding='utf-8')
        if old != updated: MAIN.write_text(updated,encoding='utf-8')
    except Exception:
        shutil.copy2(backup/'main.jsx',MAIN)
        if before_css is None: DST.unlink(missing_ok=True)
        else: DST.write_bytes(before_css)
        raise
    print('\nVETMAP V27.16 - AJUSTE DE BANNERS VETERINARIA INSTALADO')
    print(' + Agenda: botón Actualizar separado del icono decorativo')
    print(' + Pacientes / Fichas / Recetas / Perfil: iconos pequeños, sin círculos sobre el título')
    print(' + No se cambiaron backend, PostgreSQL, web funcional, chat ni otros roles')
    print(' + Respaldo:',backup)
    print('Actualiza la página con Ctrl + F5.')
    print('Si quieres deshacer: python .\\instalar_vetmap_v27_16_corregir_solapamientos.py --deshacer')

if __name__=='__main__':
    try: main()
    except Exception as exc:
        print('NO SE APLICO:',exc)
        sys.exit(1)
