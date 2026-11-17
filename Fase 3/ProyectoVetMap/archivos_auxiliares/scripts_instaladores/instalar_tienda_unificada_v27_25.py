#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""VetMap V27.25: aplicar el estilo unificado al rol Tienda conservando sus funciones.

Copiar este .py a ProyectoVetMap y ejecutar:
    python .\instalar_tienda_unificada_v27_25.py
Para deshacer:
    python .\instalar_tienda_unificada_v27_25.py --deshacer

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
CSS = "web/src/vetmap_v27_25_tienda_unificada.css"
FILES = (MAIN, CSS)
PREFIX = "respaldo_antes_v27_25_"
IMPORT = 'import "./vetmap_v27_25_tienda_unificada.css";'


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
    manifest = {"version": "27.25", "status": "prepared", "files": records}
    atomic_write(folder / "manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2).encode("utf-8"))
    return folder, manifest


def save_manifest(folder, manifest):
    atomic_write(folder / "manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2).encode("utf-8"))


def install(root):
    payload = json.loads(zlib.decompress(base64.b64decode(PAYLOAD)).decode("utf-8"))
    originals = {rel: read_bytes(root / rel) for rel in FILES}
    original = text(originals[MAIN])
    changes = payload["changes"]
    variants = payload["profile_variants"]
    if IMPORT in original:
        if all(original.count(c["new"]) >= c["after_count"] for c in changes) and any(v["new"] in original for v in variants):
            if originals[CSS] is not None and text(originals[CSS]) == payload["css"]:
                print("VETMAP V27.25: YA INSTALADO. No se repitieron los cambios.")
                print("Actualiza Tienda con Ctrl + F5.")
                return
        raise RuntimeError("V27.25 aparece parcialmente aplicado o editado. No se modificó ningún archivo.")
    if originals[CSS] is not None and text(originals[CSS]) != payload["css"]:
        raise RuntimeError("El CSS de V27.25 ya existe con otro contenido. No se sobrescribió.")
    compatible = [v for v in variants if original.count(v["old"]) == v["count"]]
    if len(compatible) != 1:
        raise RuntimeError("El perfil local no coincide con las versiones compatibles. No se modificó nada.")
    changes = changes + compatible
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
    print("\nVETMAP V27.25 - TIENDA: DISEÑO UNIFICADO INSTALADO")
    print(" + Banner principal con icono SVG, acento cálido y datos reales de tu tienda.")
    print(" + Inicio, Productos, Pedidos, Repartidores, Historial y Perfil actualizados.")
    print(" + Funciones, miniaturas de productos y demás roles conservados.")
    print(" Respaldo:", folder)
    print(" Actualiza Tienda con Ctrl + F5.")
    print(" Para deshacer: python .\\instalar_tienda_unificada_v27_25.py --deshacer")


def undo(root):
    candidates = []
    for base in backup_bases(root):
        if base.is_dir():
            for p in base.glob(PREFIX + "*"):
                manifest_file = p / "manifest.json"
                if manifest_file.is_file():
                    data = json.loads(manifest_file.read_text(encoding="utf-8"))
                    if data.get("version") == "27.25" and data.get("status") in {"installed", "prepared"}:
                        candidates.append((p, data))
    if not candidates:
        print("No hay un respaldo pendiente creado por este instalador para deshacer V27.25.")
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
    print("V27.25 deshecho. Los archivos originales se restauraron desde:", folder)
    print("Actualiza Tienda con Ctrl + F5.")


def main():
    parser = argparse.ArgumentParser(description="Tienda: banners, tarjetas y formularios con el estilo unificado.")
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
        print("NO SE COMPLETÓ V27.25:", error)
        sys.exit(1)
