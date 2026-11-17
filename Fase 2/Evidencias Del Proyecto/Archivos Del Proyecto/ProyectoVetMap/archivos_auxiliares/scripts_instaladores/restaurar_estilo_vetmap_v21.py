# -*- coding: utf-8 -*-
"""Revierte el último cambio hecho por aplicar_estilo_vetmap_v21.py."""
from pathlib import Path
import shutil
import json

def find_root():
    for loc in [Path.cwd(), Path(__file__).resolve().parent]:
        for candidate in [loc,*loc.parents]:
            if (candidate/"web"/"src"/"main.jsx").is_file():
                return candidate
    raise SystemExit("No encontré ProyectoVetMap; ejecuta este script desde la carpeta del proyecto.")

def main():
    root=find_root()
    folder=root/"respaldos_vetmap"
    backups=sorted((b for b in folder.glob("antes_v21_*") if (b/"manifest.json").is_file()),reverse=True) if folder.is_dir() else []
    if not backups:
        raise SystemExit("No hay respaldos de V21 para recuperar. No modifiqué nada.")
    backup=backups[0]
    manifest=json.loads((backup/"manifest.json").read_text(encoding="utf-8"))
    mainfile=root/manifest["main_file"]
    cssfile=root/manifest["css_file"]
    shutil.copy2(backup/"main.jsx", mainfile)
    if manifest["css_existed"]:
        shutil.copy2(backup/cssfile.name,cssfile)
    else:
        cssfile.unlink(missing_ok=True)
    print("Restaurado el estado exacto de main.jsx y V21 previo a:",backup.name)
    print("Recarga el navegador con Ctrl + F5.")

if __name__=="__main__":
    main()
