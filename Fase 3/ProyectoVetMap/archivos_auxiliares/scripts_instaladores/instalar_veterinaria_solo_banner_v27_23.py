#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""VetMap V27.23: conservar el icono principal y retirar los adornos de Veterinaria.

Copiar este .py a ProyectoVetMap y ejecutar:
    python .\instalar_veterinaria_solo_banner_v27_23.py
Para deshacer:
    python .\instalar_veterinaria_solo_banner_v27_23.py --deshacer

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
CSS = "web/src/vetmap_v27_23_veterinaria_solo_banner.css"
FILES = (MAIN, CSS)
PREFIX = "respaldo_antes_v27_23_"
IMPORT = 'import "./vetmap_v27_23_veterinaria_solo_banner.css";'


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
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=".vetmap_v2723_", suffix=".tmp", delete=False) as f:
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
    manifest = {"version": "27.23", "status": "prepared", "files": records}
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
                print("VETMAP V27.23: YA INSTALADO. No se repitieron los cambios.")
                print("Actualiza Veterinaria con Ctrl + F5.")
                return
        raise RuntimeError("V27.23 aparece parcialmente aplicado o editado. No se modificó ningún archivo.")
    if originals[CSS] is not None and text(originals[CSS]) != payload["css"]:
        raise RuntimeError("El CSS de V27.23 ya existe con otro contenido. No se sobrescribió.")
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
    print("\nVETMAP V27.23 - VETERINARIA SIN ADORNOS INSTALADO")
    print(" + Se conserva el icono del banner principal.")
    print(" + Menú, tarjetas, agenda, fichas, recetas y perfil sin iconos decorativos.")
    print(" + Fotos, funciones y otros roles conservados.")
    print(" Respaldo:", folder)
    print(" Actualiza Veterinaria con Ctrl + F5.")
    print(" Para deshacer: python .\\instalar_veterinaria_solo_banner_v27_23.py --deshacer")


def undo(root):
    candidates = []
    for base in backup_bases(root):
        if base.is_dir():
            for p in base.glob(PREFIX + "*"):
                manifest_file = p / "manifest.json"
                if manifest_file.is_file():
                    data = json.loads(manifest_file.read_text(encoding="utf-8"))
                    if data.get("version") == "27.23" and data.get("status") in {"installed", "prepared"}:
                        candidates.append((p, data))
    if not candidates:
        print("No hay un respaldo pendiente creado por este instalador para deshacer V27.23.")
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
    print("V27.23 deshecho. Los archivos originales se restauraron desde:", folder)
    print("Actualiza Veterinaria con Ctrl + F5.")


def main():
    parser = argparse.ArgumentParser(description="Veterinaria: conservar el icono del banner principal.")
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
        print("NO SE COMPLETÓ V27.23:", error)
        sys.exit(1)
