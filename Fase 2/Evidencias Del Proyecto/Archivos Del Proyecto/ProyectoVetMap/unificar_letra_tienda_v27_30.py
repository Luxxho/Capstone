#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""VetMap V27.30: usar la tipografía de Inicio en las secciones de Tienda.

Copiar este .py a ProyectoVetMap y ejecutar:
    python .\unificar_letra_tienda_v27_30.py
Para deshacer:
    python .\unificar_letra_tienda_v27_30.py --deshacer

No requiere Git, archivos de parche ni librerías adicionales.
"""
from __future__ import annotations

import argparse
import base64
from datetime import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
import zlib


PAYLOAD = "eNrFVMtO3TAQ/ZVpVoCSy30UUFOpEksWXZWyadDVJJkkruyxazuX3iI+ia/gxzomvFupUoVEpIntec85Ti6zZkDuKWQlfLvMrG5lkynjrI9QZbP9DUWDbr1ZHq2XB+uoiFtcj6w61WCLsyaEKvuY5ZAxXfxPaMV/j1jNJcLZ3mOn8C74SbXGjhyl3kL22EXy6wfN1XmyhzRRtr8HZxQ/o4Oz5dFsNS9BI9znvblGaAlOWDXKArHYAgRq5MQUQLGkZVGJz+lUH/b2Kx6i0VDbdguzjSkMmZp8EQbSWs7D4nDalwOGnU/AuHniJaeiCNF62q0YoFRhJ1lvNYXDnvIp57Zw3nZK0y5cJsfOciw6NEpvS+lX+soFry/UW4KvJ5UAcuwV6hwCcigCedXBuwlX5CgYX1VcsYBx7LSA7wWEVnlqIhqSbODQI3gi4zT+Qg/dmNRp8sZ6jGojKAzkqRXewhugcO82CN3DUmQl8l7kQOQwByeTO2R5R2+5l9WgFjjI5FDnoHLAPOVIj8aaxFSPMVqJUOzGKAGkBY4cIv2M6AlzsC6q5KCpF+7FMojI2opXK6tWr03O6c11HLW9vXA1MpMvwSgZRXqIQtAWem+D9fBjJCAt+fTY2scr/IbEJHWjlbQhAzYJuGIgbFXiItk2y8Pniscc9/oXJD8F94JUP8QSPsznz5G7s4e41VQCWy+0v/QQ7GJCwGEjVUooZvPVAZk/3BSnVqZCi9li+W+O5KJ8pyifxlba8GbU6JUNJWCDNU7EpD/Kg9tbEjUh++yzeSWEBZns6jcM7iLp"
MAIN = "web/src/main.jsx"
CSS = "web/src/vetmap_v27_30_tipografia_tienda.css"
FILES = (MAIN, CSS)
PREFIX = "respaldo_antes_v27_30_"
IMPORT = 'import "./vetmap_v27_30_tipografia_tienda.css";'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read_bytes(path):
    return path.read_bytes() if path.is_file() else None


def text(data):
    return data.decode("utf-8-sig").replace("\r\n", "\n")


def encoded(value, previous):
    value = value.replace("\r\n", "\n")
    if previous and b"\r\n" in previous:
        value = value.replace("\n", "\r\n")
    bom = b"\xef\xbb\xbf" if previous and previous.startswith(b"\xef\xbb\xbf") else b""
    return bom + value.encode("utf-8")


def project_root():
    for start in (Path.cwd().resolve(), Path(__file__).resolve().parent):
        for p in (start, *start.parents):
            if (p / MAIN).is_file() and (p / "web/package.json").is_file():
                return p
    raise RuntimeError("No encontré VetMap. Ejecuta desde ProyectoVetMap, junto a backend, mobile y web.")


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=".vetmap_v2730_", suffix=".tmp", delete=False) as f:
        temp = Path(f.name)
        try:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        except BaseException:
            f.close()
            temp.unlink(missing_ok=True)
            raise
    try:
        if path.exists():
            shutil.copymode(path, temp)
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)


def backup_bases(root):
    return (root / "archivos_auxiliares/respaldos_instaladores", root / "respaldos_instaladores")


def create_backup(root, originals, updated):
    bases = backup_bases(root)
    base = bases[0] if (root / "archivos_auxiliares").is_dir() else bases[1]
    folder = base / (PREFIX + datetime.now().strftime("%Y%m%d_%H%M%S_%f"))
    folder.mkdir(parents=True, exist_ok=False)
    records = {}
    for rel in FILES:
        old = originals[rel]
        if old is not None:
            dest = folder / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(old)
        records[rel] = {
            "existed": old is not None,
            "before": sha(old) if old is not None else None,
            "after": sha(updated[rel]),
        }
    manifest = {"version": "27.30", "status": "prepared", "files": records}
    atomic_write(folder / "manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2).encode("utf-8"))
    return folder, manifest


def save_manifest(folder, manifest):
    atomic_write(folder / "manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2).encode("utf-8"))


def install(root):
    payload = json.loads(zlib.decompress(base64.b64decode(PAYLOAD)).decode("utf-8"))
    originals = {rel: read_bytes(root / rel) for rel in FILES}
    original = text(originals[MAIN])
    changes = payload["changes"]
    if IMPORT in original:
        if all(original.count(c["new"]) >= c["after_count"] for c in changes):
            if originals[CSS] is not None and text(originals[CSS]) == payload["css"]:
                print("VETMAP V27.30: YA INSTALADO. No se repitieron los cambios.")
                print("Actualiza Tienda con Ctrl + F5.")
                return
        raise RuntimeError("V27.30 aparece parcialmente aplicado o editado. No se modificó ningún archivo.")
    if originals[CSS] is not None and text(originals[CSS]) != payload["css"]:
        raise RuntimeError("El CSS de V27.30 ya existe con otro contenido. No se sobrescribió.")
    changed = original
    for index, item in enumerate(changes, 1):
        count = changed.count(item["old"])
        if count != item["count"]:
            raise RuntimeError(
                f"El código local no coincide en el bloque {index} "
                f"({count} coincidencias; se esperaban {item['count']}). No se modificó nada."
            )
        changed = changed.replace(item["old"], item["new"])
    pattern = r'<section className="vm-v22-hero vm-v2719-hero">[\s\S]*?</section>'
    hero = re.search(pattern, original)
    if not hero or hero.group() not in changed:
        raise RuntimeError("No pude conservar el banner principal. No se modificó nada.")
    if changed.count(IMPORT) != 1:
        raise RuntimeError("La importación del estilo no quedó como se esperaba. No se modificó nada.")
    updated = {MAIN: encoded(changed, originals[MAIN]), CSS: encoded(payload["css"], originals[CSS] or originals[MAIN])}
    folder, manifest = create_backup(root, originals, updated)
    for rel in FILES:
        if read_bytes(root / rel) != originals[rel]:
            raise RuntimeError("Un archivo cambió mientras se preparaba la instalación. No se aplicó el ajuste.")
    written = []
    try:
        for rel in FILES:
            atomic_write(root / rel, updated[rel])
            written.append(rel)
        manifest["status"] = "installed"
        save_manifest(folder, manifest)
    except BaseException:
        for rel in reversed(written):
            if originals[rel] is None:
                (root / rel).unlink(missing_ok=True)
            else:
                atomic_write(root / rel, originals[rel])
        manifest["status"] = "rolled_back"
        save_manifest(folder, manifest)
        raise
    print("\nVETMAP V27.30 - TIPOGRAFÍA DE TIENDA UNIFICADA")
    print(" + Productos, Pedidos, Repartidores, Historial y Mi cuenta: misma letra que Inicio.")
    print(" + Títulos, botones, formularios y textos con tipografía moderna uniforme.")
    print(" + Se conservan las palabras, funciones, datos y los demás roles.")
    print(" Respaldo:", folder)
    print(" Actualiza Tienda con Ctrl + F5.")
    print(" Para deshacer: python .\\unificar_letra_tienda_v27_30.py --deshacer")


def undo(root):
    candidates = []
    for base in backup_bases(root):
        if base.is_dir():
            for p in base.glob(PREFIX + "*"):
                manifest_file = p / "manifest.json"
                if manifest_file.is_file():
                    data = json.loads(manifest_file.read_text(encoding="utf-8"))
                    if data.get("version") == "27.30" and data.get("status") in {"installed", "prepared"}:
                        candidates.append((p, data))
    if not candidates:
        print("No hay un respaldo pendiente creado por este instalador para deshacer V27.30.")
        return
    folder, manifest = max(candidates, key=lambda item: item[0].name)
    restore = {}
    for rel in FILES:
        entry = manifest["files"][rel]
        current = read_bytes(root / rel)
        if current is None or sha(current) != entry["after"]:
            raise RuntimeError(f"{rel} cambió después de instalar. Se conserva tu edición; no se restauró nada.")
        old = read_bytes(folder / rel) if entry["existed"] else None
        if entry["existed"] and (old is None or sha(old) != entry["before"]):
            raise RuntimeError("El respaldo está incompleto. No se restauró nada.")
        restore[rel] = old
    current_files = {rel: read_bytes(root / rel) for rel in FILES}
    written = []
    try:
        for rel in FILES:
            if restore[rel] is None:
                (root / rel).unlink(missing_ok=True)
            else:
                atomic_write(root / rel, restore[rel])
            written.append(rel)
        manifest["status"] = "restored"
        save_manifest(folder, manifest)
    except BaseException:
        for rel in reversed(written):
            atomic_write(root / rel, current_files[rel])
        raise
    print("V27.30 deshecho. Los archivos originales se restauraron desde:", folder)
    print("Actualiza Tienda con Ctrl + F5.")


def main():
    parser = argparse.ArgumentParser(description="Tienda: tipografía uniforme como Inicio.")
    parser.add_argument("--deshacer", action="store_true", help="Restaurar el respaldo de esta instalación.")
    args = parser.parse_args()
    root = project_root()
    if args.deshacer:
        undo(root)
    else:
        install(root)


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    try:
        main()
    except Exception as error:
        print("NO SE COMPLETÓ V27.30:", error)
        sys.exit(1)
