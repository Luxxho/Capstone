#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""VetMap V27.27: igualar la ficha del icono de Tienda y mostrar la clínica actual.

Copiar este .py a ProyectoVetMap y ejecutar:
    python .\ajustar_banners_y_clinica_v27_27.py
Para deshacer:
    python .\ajustar_banners_y_clinica_v27_27.py --deshacer

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


PAYLOAD = "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"
MAIN = "web/src/main.jsx"
CSS = "web/src/vetmap_v27_27_banners_y_clinica.css"
FILES = (MAIN, CSS)
PREFIX = "respaldo_antes_v27_27_"
IMPORT = 'import "./vetmap_v27_27_banners_y_clinica.css";'


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
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=".vetmap_v2727_", suffix=".tmp", delete=False) as f:
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
    manifest = {"version": "27.27", "status": "prepared", "files": records}
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
                print("VETMAP V27.27: YA INSTALADO. No se repitieron los cambios.")
                print("Actualiza la web con Ctrl + F5.")
                return
        raise RuntimeError("V27.27 aparece parcialmente aplicado o editado. No se modificó ningún archivo.")
    if originals[CSS] is not None and text(originals[CSS]) != payload["css"]:
        raise RuntimeError("El CSS de V27.27 ya existe con otro contenido. No se sobrescribió.")
    changed = original
    for index, item in enumerate(changes, 1):
        count = changed.count(item["old"])
        if count != item["count"]:
            raise RuntimeError(
                f"El código local no coincide en el bloque {index} "
                f"({count} coincidencias; se esperaban {item['count']}). No se modificó nada."
            )
        changed = changed.replace(item["old"], item["new"])
    pattern = r'<svg className="vm-v2719-symbol"[\s\S]*?</svg>'
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
    print("\nVETMAP V27.27 - BANNERS Y CLÍNICA ACTUAL ACTUALIZADOS")
    print(" + Tienda: ficha clara, bordes y tamaño como los demás banners.")
    print(" + Veterinaria: nombre real y comuna de la clínica debajo del saludo.")
    print(" + Menús, fotos, funciones y otros roles conservados.")
    print(" Respaldo:", folder)
    print(" Actualiza la web con Ctrl + F5.")
    print(" Para deshacer: python .\\ajustar_banners_y_clinica_v27_27.py --deshacer")


def undo(root):
    candidates = []
    for base in backup_bases(root):
        if base.is_dir():
            for p in base.glob(PREFIX + "*"):
                manifest_file = p / "manifest.json"
                if manifest_file.is_file():
                    data = json.loads(manifest_file.read_text(encoding="utf-8"))
                    if data.get("version") == "27.27" and data.get("status") in {"installed", "prepared"}:
                        candidates.append((p, data))
    if not candidates:
        print("No hay un respaldo pendiente creado por este instalador para deshacer V27.27.")
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
    print("V27.27 deshecho. Los archivos originales se restauraron desde:", folder)
    print("Actualiza la web con Ctrl + F5.")


def main():
    parser = argparse.ArgumentParser(description="Tienda y Veterinaria: icono uniforme y clínica actual visible.")
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
        print("NO SE COMPLETÓ V27.27:", error)
        sys.exit(1)
