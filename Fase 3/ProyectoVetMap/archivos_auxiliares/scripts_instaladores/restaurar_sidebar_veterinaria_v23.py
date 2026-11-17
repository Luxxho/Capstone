# -*- coding: utf-8 -*-
"""Restaura únicamente la modificación V23 (no revierte V22)."""
from pathlib import Path
import json
import shutil
import hashlib

def sha256(data):
    return hashlib.sha256(data).hexdigest()

def main():
    here = Path(__file__).resolve().parent
    for loc in (Path.cwd(),here):
        for folder in (loc, *loc.parents):
            if (folder/'web/src/main.jsx').is_file():
                root=folder
                break
        else:
            continue
        break
    else:
        raise SystemExit('ERROR: no se encontró ProyectoVetMap.')
    backups = sorted((root/'respaldos_instaladores').glob('antes_sidebar_v23_*'), reverse=True)
    backups=[b for b in backups if (b/'manifest.json').is_file()]
    if not backups:
        raise SystemExit('No hay respaldos V23. No se modificó nada.')
    backup=backups[0]
    manifest=json.loads((backup/'manifest.json').read_text(encoding='utf-8'))
    main=root/manifest['relative_main']
    css=root/manifest['relative_css']
    if sha256(main.read_bytes())!=manifest['main_after_sha256']:
        raise SystemExit('main.jsx fue modificado después de V23. Para no borrar trabajo posterior, no restauré nada.')
    if not css.is_file() or sha256(css.read_bytes())!=manifest['css_after_sha256']:
        raise SystemExit('El CSS V23 fue alterado. No restauré nada.')
    if sha256((backup/'main.jsx').read_bytes())!=manifest['main_before_sha256']:
        raise SystemExit('La copia original no coincide con el respaldo. No restauré nada.')
    shutil.copy2(backup/'main.jsx',main)
    css.unlink()
    print('OK: V23 restaurada. La versión V22 y tus otros archivos continúan sin cambios.')
    print('Respaldo original:',backup)

if __name__=='__main__':
    main()
