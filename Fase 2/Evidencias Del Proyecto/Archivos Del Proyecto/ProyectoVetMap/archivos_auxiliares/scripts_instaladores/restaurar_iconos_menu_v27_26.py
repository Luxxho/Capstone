#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""VetMap V27.26: restaurar los iconos de navegación de Veterinaria y Tienda.

Copiar este .py a ProyectoVetMap y ejecutar:
    python .\restaurar_iconos_menu_v27_26.py
Para deshacer:
    python .\restaurar_iconos_menu_v27_26.py --deshacer

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


PAYLOAD = "eNrll91u2zYUx1/lQFctULrih76KJMNWYPCAeihaLLtoioKVuJCrLAWUzK4J+kh7ir1Yz5EdV0qrrBe9mQYbpvjnEUn/RB7+9eom8m1toicQBdNHjyDqeu17qt+UO+9N0//WGb+iIDg9PYULiruI4Ad4QNGmqSj2ITyBmfCub735fIMr2+ZNWeuuG8bcsiAkwy4ZNVDA213ftw21vrqJav3W1BT4S+NK1w7zC5cknGAJQz+/6q05vbjbFY4YnHn/U/sXtsUQg1D4RfUPV9coNW1Ds+p6376j2w+zf9rWrT/qv7uqt9jIV/lRe+YaU+orVH27a6qJ/mfrmlGD9k4z66rKkNr7HY54dnKlewsVClsJPIaCZVBAFnisOXCgqXKGV5YlgWXrImRrNW5h/Poienx28hgBnEUfH8GI0o+X+Dz0Iih5U/ZAs5IY8gHLBMv3tyPRQNa4S9tTLcWap1gxkDkC3mQgg9rwfUG0Lc83OXBlJRW5lbMon+vS4T813SJols6XuCNLmliBUSURpf79nvCEmgQRByZ0Cul+0QEXEAdBIDnXEuQg44elG044dQLJIVRCEvgs1Z9daXWHDP/5Gze07pa1VJPDUlXjpaomSzWbW6oFqFVyLm0a+CrBGhc23TLJZEipltt0FuoLU5p+ISw/A0lB2qJWoAKX08y4Tqf58HyUH0m53vAEd3xiFW1yaYctn90D8KXxgY6XDj7AlfEIYXksQ3rcpDEdO/G5JHmtgtQCxKEBr7Y8ZokVI5kzklkCaRAaH8ghNgfKElu8PETuH4EaY349gL51GIMVmHiMb/cN/240dLV1zb1GQ7GhU9bo8H3sxt0O/5em47lvq13Zt91CcRVIK8FfPNfimmGeZgVT13hKFjWK1LjB85GrUMwjMpWrlgkIOWC2qMVKoTewPF4VtWD5ep9sx7aDx7e+Q8QH48G/DMpngr5+7l1hGkGw3iwJ7dFOiIOdyMZ2Qk7sBJ+zE3gC4uNQtSTra1mGuZ7nozyNSXybTTI3KrOk147gOV0vEfP3dm1UpPe4jY37VpPx34E52cPi7guGukMNZ83pBSMnD7F3bSm9YEydw+tPIZ0k8g=="
MAIN = "web/src/main.jsx"
FILES = (MAIN,)
PREFIX = "respaldo_antes_v27_26_"


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
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=".vetmap_v2726_", suffix=".tmp", delete=False) as f:
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
    manifest = {"version": "27.26", "status": "prepared", "files": records}
    atomic_write(folder / "manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2).encode("utf-8"))
    return folder, manifest


def save_manifest(folder, manifest):
    atomic_write(folder / "manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2).encode("utf-8"))


def repair_menu(block, spec):
    edits = []
    buttons = list(re.finditer(r"<button\b[\s\S]*?</button>", block))
    for entry in spec["buttons"]:
        label_pattern = r"<span>\s*" + re.escape(entry["label"]) + r"\s*</span>"
        matches = [m for m in buttons if re.search(label_pattern, m.group())]
        if len(matches) != 1:
            raise RuntimeError("No pude identificar la opción del menú: " + entry["label"] + ". No se modificó nada.")
        match = matches[0]
        button = match.group()
        icon_marker = 'className="' + spec["icon_class"] + '"'
        if icon_marker in button:
            if button.count(icon_marker) != 1:
                raise RuntimeError("Hay iconos duplicados en " + entry["label"] + ". No se modificó nada.")
            continue
        if "<svg" in button:
            raise RuntimeError("La opción " + entry["label"] + " tiene otro icono personalizado. Se conservó.")
        label = re.search(label_pattern, button)
        prefix = button[:label.start()]
        whitespace = re.search(r"(?:^|\n)([ \t]*)$", prefix)
        indent = whitespace[1] if whitespace else "                        "
        fixed = prefix + entry["svg"] + "\n" + indent + button[label.start():]
        edits.append((match.start(), match.end(), fixed))
    result = block
    for start, end, content in reversed(edits):
        result = result[:start] + content + result[end:]
    return result, len(edits)


def install(root):
    roles = json.loads(zlib.decompress(base64.b64decode(PAYLOAD)).decode("utf-8"))
    originals = {MAIN: read_bytes(root / MAIN)}
    original = text(originals[MAIN])
    replacements = []
    restored = 0
    for spec in roles:
        start = original.find(spec["start"])
        end = original.find(spec["end"], start) if start >= 0 else -1
        if start < 0 or end < start:
            raise RuntimeError("No reconocí el menú de " + spec["role"] + ". No se modificó nada.")
        repaired, count = repair_menu(original[start:end], spec)
        replacements.append((start, end, repaired))
        restored += count
    changed = original
    for start, end, content in sorted(replacements, reverse=True):
        changed = changed[:start] + content + changed[end:]
    if not restored:
        print("VETMAP V27.26: LOS ICONOS DEL MENÚ YA ESTÁN PRESENTES. No se duplicaron.")
        print("Actualiza la web con Ctrl + F5.")
        return
    updated = {MAIN: encoded(changed, originals[MAIN])}
    folder, manifest = create_backup(root, originals, updated)
    if read_bytes(root / MAIN) != originals[MAIN]:
        raise RuntimeError("main.jsx cambió durante la preparación. No se aplicó la corrección.")
    written = False
    try:
        atomic_write(root / MAIN, updated[MAIN])
        written = True
        manifest["status"] = "installed"
        save_manifest(folder, manifest)
    except BaseException:
        if written:
            atomic_write(root / MAIN, originals[MAIN])
        manifest["status"] = "rolled_back"
        save_manifest(folder, manifest)
        raise
    print("\nVETMAP V27.26 - ICONOS DEL MENÚ RESTAURADOS")
    print(" + Iconos recuperados:", restored)
    print(" + Veterinaria y Tienda: símbolos relacionados con cada opción.")
    print(" + Los iconos que ya existían se conservaron sin duplicarlos.")
    print(" + Banners, tarjetas, avatares de mascotas y funciones conservados.")
    print(" Respaldo:", folder)
    print(" Actualiza la web con Ctrl + F5.")
    print(" Para deshacer: python .\\restaurar_iconos_menu_v27_26.py --deshacer")


def undo(root):
    candidates = []
    for base in backup_bases(root):
        if base.is_dir():
            for p in base.glob(PREFIX + "*"):
                manifest_file = p / "manifest.json"
                if manifest_file.is_file():
                    data = json.loads(manifest_file.read_text(encoding="utf-8"))
                    if data.get("version") == "27.26" and data.get("status") in {"installed", "prepared"}:
                        candidates.append((p, data))
    if not candidates:
        print("No hay un respaldo pendiente creado por este instalador para deshacer V27.26.")
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
    print("V27.26 deshecho. Los archivos originales se restauraron desde:", folder)
    print("Actualiza la web con Ctrl + F5.")


def main():
    parser = argparse.ArgumentParser(description="Restaurar iconos relacionados con cada opción del menú.")
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
        print("NO SE COMPLETÓ V27.26:", error)
        sys.exit(1)
