# -*- coding: utf-8 -*-
"""VetMap V27.14 — Diseño turquesa integral, rol Veterinaria.
Ejecutar desde la raíz del proyecto (o dejar este archivo allí).
Solo instala una hoja de estilos y su importación en web/src/main.jsx.
"""
from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path(__file__).resolve().parent
MAIN = ROOT / 'web' / 'src' / 'main.jsx'
DEST = ROOT / 'web' / 'src' / 'vetmap_v27_14_veterinaria.css'
SRC = ROOT / 'vetmap_v27_14_veterinaria.css'
IMPORT = 'import "./vetmap_v27_14_veterinaria.css";'
ANCHOR = 'const VETMAP_PET_SPECIES = ['

def apply():
    if not MAIN.exists() or not (ROOT/'web'/'package.json').exists():
        raise RuntimeError('No encuentro web/src/main.jsx. Coloca los archivos directamente en ProyectoVetMap (no dentro de web).')
    if not SRC.exists():
        raise RuntimeError('Falta vetmap_v27_14_veterinaria.css junto al instalador. Copia los DOS archivos del ZIP.')
    text = MAIN.read_text(encoding='utf-8')
    essential = ['vm-v22-hero', 'vm-clinic-section-heading', 'vm-my-profile-heading', 'vm-member-nav--${currentUser.role}']
    missing = [term for term in essential if term not in text]
    if missing:
        raise RuntimeError('Tu main.jsx tiene una estructura distinta ('+', '.join(missing)+'). No se modificó nada.')
    css = SRC.read_text(encoding='utf-8')
    if 'VETMAP V27.14' not in css or len(css) < 1000:
        raise RuntimeError('El archivo CSS parece incompleto. No se modificó nada.')
    contains_import = IMPORT in text
    if not contains_import and ANCHOR not in text:
        raise RuntimeError('No pude identificar un lugar seguro para importar el CSS. No se modificó nada.')
    target_text = text if contains_import else text.replace(ANCHOR, IMPORT+'\n\n'+ANCHOR, 1)
    if contains_import and DEST.exists() and DEST.read_text(encoding='utf-8') == css:
        print('VETMAP V27.14: Ya estaba instalado y actualizado. No se modificó nada.')
        return
    backup = ROOT/'respaldos_instaladores'/('respaldo_antes_v27_14_'+datetime.now().strftime('%Y%m%d_%H%M%S'))
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(MAIN, backup/'main.jsx')
    if DEST.exists():
        shutil.copy2(DEST, backup/'vetmap_v27_14_veterinaria.css')
    try:
        DEST.write_text(css, encoding='utf-8')
        if target_text != text:
            MAIN.write_text(target_text, encoding='utf-8')
    except Exception:
        shutil.copy2(backup/'main.jsx', MAIN)
        if (backup/'vetmap_v27_14_veterinaria.css').exists():
            shutil.copy2(backup/'vetmap_v27_14_veterinaria.css', DEST)
        else:
            DEST.unlink(missing_ok=True)
        raise
    print('\nVETMAP V27.14 - DISEÑO VETERINARIA INSTALADO')
    print(' + Web veterinaria: Inicio, Agenda, Pacientes, Fichas clínicas, Recetas y Perfil')
    print(' + Sin fotografías, sin assets, solo CSS e iconos SVG vectoriales integrados')
    print(' + Sin cambios en otros roles, backend, app ni base de datos')
    print(' Respaldo:', backup)
    print(' Actualiza el navegador con Ctrl+F5.')

if __name__ == '__main__':
    try:
        apply()
    except Exception as exc:
        print('NO SE APLICÓ:', exc)
        sys.exit(1)
