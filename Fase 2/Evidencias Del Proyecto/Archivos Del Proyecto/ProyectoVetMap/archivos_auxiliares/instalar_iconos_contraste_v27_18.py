# -*- coding: utf-8 -*-
"""VetMap V27.18: contraste de iconos de Dueño y Veterinaria como Admin.
Ejecutar desde la raiz del proyecto: python instalar_iconos_contraste_v27_18.py
Para deshacer solo este cambio: python instalar_iconos_contraste_v27_18.py --deshacer
No usa recursos externos ni toca backend, móvil, base de datos ni los otros roles.
"""
from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path(__file__).resolve().parent
MAIN = ROOT / 'web' / 'src' / 'main.jsx'
CSS = ROOT / 'web' / 'src' / 'vetmap_v27_18_iconos_contraste.css'
SOURCE_CSS = ROOT / 'vetmap_v27_18_iconos_contraste.css'
IMPORT_LINE = 'import "./vetmap_v27_18_iconos_contraste.css";'
ANCHOR = 'const VETMAP_PET_SPECIES = ['

def main():
    if not MAIN.is_file():
        raise RuntimeError('No se encontro web/src/main.jsx. Copia los archivos en la raiz de ProyectoVetMap.')
    text = MAIN.read_text(encoding='utf-8')
    if '--deshacer' in sys.argv:
        if IMPORT_LINE not in text:
            print('V27.18 no estaba instalada; no hay nada que deshacer.')
            return
        # Elimina solo el import que agregó este instalador (no restaura main.jsx entero).
        text = text.replace(IMPORT_LINE+'\n', '', 1)
        MAIN.write_text(text, encoding='utf-8')
        if CSS.exists():
            CSS.unlink()
        print('VETMAP V27.18: ajuste deshecho. Otros cambios permanecen intactos.')
        return
    if not SOURCE_CSS.is_file():
        raise RuntimeError('Falta vetmap_v27_18_iconos_contraste.css junto al instalador.')
    if ANCHOR not in text:
        raise RuntimeError('La estructura de main.jsx es diferente; por seguridad no se modificó nada.')
    if ('vm-v22-hero' not in text or 'VetMapOwnerHome' not in text):
        raise RuntimeError('No reconoci las vistas de Dueño y Veterinaria; no se modificó nada.')
    content = SOURCE_CSS.read_text(encoding='utf-8')
    already = IMPORT_LINE in text
    if already and CSS.exists() and CSS.read_text(encoding='utf-8') == content:
        print('VETMAP V27.18: ya esta instalada; no se duplicaron cambios.')
        return
    backup = ROOT / 'respaldos_instaladores' / f'antes_iconos_v27_18_{datetime.now():%Y%m%d_%H%M%S_%f}'
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(MAIN, backup / 'main.jsx')
    if CSS.exists():
        shutil.copy2(CSS, backup / CSS.name)
    if not already:
        text = text.replace(ANCHOR, IMPORT_LINE+'\n\n'+ANCHOR, 1)
    MAIN.write_text(text, encoding='utf-8')
    CSS.write_text(content, encoding='utf-8')
    print('\nVETMAP V27.18 - ICONOS CON CONTRASTE INSTALADOS')
    print(' + Dueño: huella en tarjeta celeste/menta, como el icono de Admin')
    print(' + Veterinaria: estetoscopio y iconos clinicos con base celeste y trazo azul')
    print(' + Los iconos no invaden botones de Agenda ni Perfil')
    print(' + No se modificaron los datos, backend, mobile, chat ni Admin')
    print(' Respaldo:', backup)
    print(' Abre la web y presiona Ctrl+F5.')

if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('NO SE APLICO:', exc)
        sys.exit(1)
