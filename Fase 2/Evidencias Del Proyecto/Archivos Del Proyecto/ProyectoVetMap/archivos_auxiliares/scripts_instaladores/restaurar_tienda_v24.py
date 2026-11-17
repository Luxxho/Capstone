# -*- coding: utf-8 -*-
"""Restaurador seguro de los cambios de Tienda V24. """
from pathlib import Path
import json
import hashlib
import shutil


def sha(data):
    return hashlib.sha256(data).hexdigest()


def root_dir():
    for root in (Path.cwd(), Path(__file__).resolve().parent):
        for candidate in (root, *root.parents):
            if (candidate / 'web/src/main.jsx').is_file():
                return candidate
    raise SystemExit('No encontré la carpeta ProyectoVetMap.')


def main():
    root = root_dir()
    folder = root / 'respaldos_instaladores'
    backups = sorted((b for b in folder.glob('antes_tienda_v24_*')
                      if (b / 'manifest.json').is_file()), reverse=True) if folder.is_dir() else []
    if not backups:
        raise SystemExit('No hay un respaldo V24. No modifiqué nada.')
    backup = backups[0]
    info = json.loads((backup / 'manifest.json').read_text(encoding='utf-8'))
    target = root / 'web/src/main.jsx'
    css = root / 'web/src' / info['css_filename']
    if sha(target.read_bytes()) != info['main_after_sha256']:
        raise SystemExit('El main.jsx cambió después de V24. No restauré para evitar perder trabajo. Revisa el respaldo: ' + str(backup))
    if not css.is_file() or sha(css.read_bytes()) != info['css_after_sha256']:
        raise SystemExit('El CSS V24 no está intacto. No restauré nada. Revisa: ' + str(backup))
    old = (backup / 'main.jsx').read_bytes()
    if sha(old) != info['main_before_sha256']:
        raise SystemExit('El respaldo main.jsx no coincide con su firma. No restauré nada.')
    shutil.copy2(backup / 'main.jsx', target)
    css.unlink()
    print('V24 RESTAURADA: main.jsx anterior recuperado y CSS de tienda V24 retirado.')
    print('No se tocó index.css ni el backend. Reinicia o refresca con Ctrl+F5.')


if __name__ == '__main__':
    main()
