# -*- coding: utf-8 -*-
"""Restituye el main.jsx previo a V22 y quita el CSS añadido por V22.
Se niega a sobrescribir cambios posteriores no respaldados."""
from pathlib import Path
import json
import hashlib
import shutil


def sha(b):
    return hashlib.sha256(b).hexdigest()


def root_dir():
    for path in (Path.cwd(), Path(__file__).resolve().parent):
        for root in (path, *path.parents):
            if (root / "web/src/main.jsx").is_file():
                return root
    raise SystemExit("ERROR: no encontré la carpeta ProyectoVetMap.")


def main():
    root = root_dir()
    backup_root = root / "respaldos_instaladores"
    backups = sorted((p for p in backup_root.glob("antes_inicio_v22_*") if (p / "manifest.json").is_file()), reverse=True) if backup_root.is_dir() else []
    if not backups:
        print("No se encontró ningún respaldo V22. No se modificó nada.")
        return
    backup = backups[0]
    manifest = json.loads((backup / "manifest.json").read_text(encoding="utf-8"))
    target = root / manifest["relative_main"]
    css = root / manifest["relative_css"]
    if not target.is_file() or sha(target.read_bytes()) != manifest["main_after_sha256"]:
        raise SystemExit("No restauré: main.jsx cambió desde instalar V22. Revisa los cambios antes de sobrescribirlos. Respaldo: " + str(backup))
    if not css.is_file() or sha(css.read_bytes()) != manifest["css_after_sha256"]:
        raise SystemExit("No restauré: el archivo CSS V22 cambió o falta. Respaldo: " + str(backup))
    source = backup / "main.jsx"
    if sha(source.read_bytes()) != manifest["main_before_sha256"]:
        raise SystemExit("No restauré: el respaldo original parece estar corrupto.")
    shutil.copy2(source, target)
    css.unlink()
    print("Restauré web/src/main.jsx al estado previo a V22 y eliminé sólo el CSS de V22.")
    print("Backup conservado:", backup)
    print("index.css y el resto de VetMap no se modificaron.")


if __name__ == "__main__":
    main()
