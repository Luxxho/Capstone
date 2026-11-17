#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""VetMap V27.34: mover el acceso al chat móvil a un botón flotante inferior.

Copiar a ProyectoVetMap y ejecutar:
    python .\mover_chat_abajo_movil_v27_34.py
Para restaurar únicamente el código:
    python .\mover_chat_abajo_movil_v27_34.py --deshacer

No requiere instalar librerías ni ejecutar migraciones de base de datos.
"""
from __future__ import annotations
import argparse
import base64
from datetime import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import zlib

PAYLOAD = "eNrVWFtu2zgU3cqNBgjswiPHztuxUzTpFBMgnRRJkH7U+aCka5upTBokZSc1tIDZw/zMGmYJ3cmsZC4tWQ9beaHox+jHInkfh/dxSHnuYMCNdjowd8bS4yE2fTmeSIHC6GbE3Tt9T4tf5o4MA3px8H4ilYFBJHzDpYArXyGK2hz8EQ8DhaIBhpsQG6AjL33zmP8VejBgoU5H15LGIgrDBigcKNQjLoa5iBSXySxZGcnZO9+XkTDvFh41iRkVYbJ0Io2R4z/YNJ2FuE47aYAjcGbhZjg/hJIZcnI6YubMl6JGcn0B5N5ESkDNvgN0bzjOQJuHEHvzxY92ByuaMUwkFwbVb1MbpF7fERSuvgPM91Fr7lndxUbi48Tq83ZPIo/UcvnnNc65wHMphjE0X6l1NaIEFtW6Tav1YqzXjIe5ekG5ftQXcV/0xf+iRuIGZEUNQHnVBibMjAQbIwlGGj+lo1r9qFBRz8raUCQi1nmx7ki0AurmJmxskAlFb0lMv/QdOROo+uS270zRJC/aSIXJa6D41K7fulz4YRSgrlkLrpIh1jM7GcSNXo+UbGePpWj6BKXvHK1EoPjMfxTB22VDFZ/utYzINxX6xYT53DysiwA1kSHDqUBvvuUetOMqOSk+UfJ1b06N3DuGOWg0l+T7I4roYkLVtiiT+hEoGVGvupNIj2qrMaDluNJ6ufqFNHzAfWbzdRJRMYm4GnrS/zwk6OfMw5C44Z2nuIIxCs3uUPeddcXjKlvda7w3SxjzgRTmin/DTnu74ctQqs7pxfnF5ZUr2PQhjo///evPbtNqVNiihZWwrwnVobNotLhU5qWCaL6Bm/a+u73TAQyTnUpgIdg4Amrz/W9AYZc8ab7/I4AIwzAiSeBigIpL5cKbZlxRcl0iBxmGlkRyWOXw6wV9JHLrEKvoKtE4kcFDgYJf6+ix9ngLJfHP3IwyhilHNolqI5+8fSzCP2AT1mmmwlppvQpXRWaaecSOLa2npVCiKlhh2M3N9QQ9YqcCdoE0niSL50ji55DDU8f3GimUyMD6Ji7wFmJlDng1aZQUfqeLSCKPtvkW3Rgg3KD5yCbE/4pRc/qKpKvNlaigu3pHKl8tHueRjD/WbhQvLppy+RUbkW6mxCZ434EWxI1SdeVtXhBq0PVMc0vVHTqmFIbM1gpdz+JFwVe3hNWfsCCgYQKrA4d7qcZ6ojvJ1RFKnpinZUjVRMdjsqj4cESGW3vp2EsNZxMzHphRB3aX4xEmGru5hgpQXbKAR7oD7YN0moV8KM4MjrX166O9i2Ze7yJNh9XDKZ0YtFAhYK9WQ6p7EZwuThJIjxJPMRG8Z+prKqdHLJCzVKbv/LK1t326c5iZSZYvBgNqLRu9dDNbjWwbO2n8MtmkakjGbe+UVpY7bG2l0xjilCWBbS13/e1MBDbB7URoPTe2YgtI2ns5lHZ1Lu2d+2W5DHFgU5mOjJyQzXIWsy0tfbYOS1n8nIi13IPSdB7fD4snT1Mp9/uP7Hn5FfDcLtIN7DYS7PSbwm618ii13N1K563GetGsAq6GtvjUeCW2wwzb/s+CZr9gXomKynAJq1BX5UY9J41CmtPZhE9env4XN6ihsR5INbaf53SSGWbQmvq1tRvg0BLebWH/T1BqfEvs69A6GbB/BMTxf+WeEs0="
PREFIX = "respaldo_antes_v27_34_"


def sha(data):
    return hashlib.sha256(data).hexdigest() if data is not None else None


def read_bytes(path):
    return path.read_bytes() if path.is_file() else None


def decode(data):
    return data.decode('utf-8-sig').replace('\r\n', '\n')


def encode(text, previous):
    text = text.replace('\r\n', '\n')
    if previous and b'\r\n' in previous:
        text = text.replace('\n', '\r\n')
    bom = b'\xef\xbb\xbf' if previous and previous.startswith(b'\xef\xbb\xbf') else b''
    return bom + text.encode('utf-8')


def project_root():
    for start in (Path.cwd().resolve(), Path(__file__).resolve().parent):
        for path in (start, *start.parents):
            if (path / 'web/package.json').is_file() and (path / 'backend/app/routers/chat.py').is_file():
                return path
    raise RuntimeError('Ejecuta el instalador desde ProyectoVetMap, junto a backend, mobile y web.')


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.vetmap_v2734_', suffix='.tmp', delete=False) as file:
        temporary = Path(file.name)
        try:
            file.write(data)
            file.flush()
            os.fsync(file.fileno())
        except BaseException:
            file.close()
            temporary.unlink(missing_ok=True)
            raise
    try:
        if path.exists():
            shutil.copymode(path, temporary)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def backup_bases(root):
    return (root / 'archivos_auxiliares/respaldos_instaladores', root / 'respaldos_instaladores')


def save_manifest(folder, manifest):
    atomic_write(folder / 'manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2).encode('utf-8'))


def install(root, payload):
    paths = [*payload['edits'], *payload['create']]
    originals = {path: read_bytes(root / path) for path in paths}
    for path in payload['edits']:
        if originals[path] is None:
            raise RuntimeError(f'Falta {path}. No se modificó ningún archivo.')
    texts = {path: decode(originals[path]) for path in payload['edits']}
    states = [texts[path].count(item['new']) == 1 for path, items in payload['edits'].items() for item in items]
    css_ready = all(originals[path] is not None and decode(originals[path]) == value for path, value in payload['create'].items())
    if all(states) and css_ready:
        print('VETMAP V27.34: YA INSTALADO. No se repitieron los cambios.')
        return
    if any(states) or any(originals[path] is not None for path in payload['create']):
        raise RuntimeError('V27.34 aparece parcialmente aplicado o editado. No se sobrescribió ningún archivo.')
    updated = {}
    for path, items in payload['edits'].items():
        value = texts[path]
        for number, item in enumerate(items, 1):
            count = value.count(item['old'])
            if count != 1:
                raise RuntimeError(f'{path}: el bloque {number} no coincide con el chat esperado ({count} coincidencias). No se modificó nada.')
            value = value.replace(item['old'], item['new'], 1)
        if path.endswith('.py'):
            compile(value, path, 'exec')
        updated[path] = encode(value, originals[path])
    for path, value in payload['create'].items():
        updated[path] = encode(value, originals['web/src/components/VetMapChat.jsx'])
    base = backup_bases(root)[0] if (root / 'archivos_auxiliares').is_dir() else backup_bases(root)[1]
    folder = base / (PREFIX + datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
    folder.mkdir(parents=True, exist_ok=False)
    manifest = {'version': '27.34', 'status': 'prepared', 'files': {}}
    for path, original in originals.items():
        if original is not None:
            target = folder / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(original)
        manifest['files'][path] = {'existed': original is not None, 'before': sha(original), 'after': sha(updated[path])}
    save_manifest(folder, manifest)
    for path in paths:
        if read_bytes(root / path) != originals[path]:
            raise RuntimeError('Un archivo cambió durante la preparación. No se aplicó la actualización.')
    written = []
    try:
        for path, content in updated.items():
            atomic_write(root / path, content)
            written.append(path)
        manifest['status'] = 'installed'
        save_manifest(folder, manifest)
    except BaseException:
        for path in reversed(written):
            if originals[path] is None:
                (root / path).unlink(missing_ok=True)
            else:
                atomic_write(root / path, originals[path])
        manifest['status'] = 'rolled_back'
        save_manifest(folder, manifest)
        raise
    print('\nVETMAP V27.34 - CHAT FLOTANTE MÓVIL INSTALADO')
    print(' + App: botón redondo con símbolo de chat abajo a la derecha.')
    print(' + Queda sobre el menú inferior y permanece visible al desplazarte.')
    print(' + Abre la pantalla de mensajes existente; se retira el sobre de la cabecera.')
    print(' Respaldo del código:', folder)
    print(' Recarga Expo con R; en la vista web de la app, actualiza con Ctrl + F5.')
    print(' App: recarga Expo; un APK ya compilado requiere generar una versión nueva.')
    print(' Para deshacer el código: python .\\mover_chat_abajo_movil_v27_34.py --deshacer')


def undo(root, payload):
    candidates = []
    for base in backup_bases(root):
        if base.is_dir():
            for folder in base.glob(PREFIX + '*'):
                file = folder / 'manifest.json'
                if file.is_file():
                    manifest = json.loads(file.read_text(encoding='utf-8'))
                    if manifest.get('version') == '27.34' and manifest.get('status') in {'installed', 'prepared'}:
                        candidates.append((folder, manifest))
    if not candidates:
        print('No hay un respaldo pendiente de V27.34 para restaurar.')
        return
    folder, manifest = max(candidates, key=lambda item: item[0].name)
    paths = [*payload['edits'], *payload['create']]
    current = {path: read_bytes(root / path) for path in paths}
    originals = {}
    for path in paths:
        entry = manifest['files'][path]
        expected = {entry['after']}
        if manifest['status'] == 'prepared':
            expected.add(entry['before'])
        if sha(current[path]) not in expected:
            raise RuntimeError(f'{path} tiene cambios posteriores. No se restauró ningún archivo.')
        original = read_bytes(folder / path) if entry['existed'] else None
        if sha(original) != entry['before']:
            raise RuntimeError('El respaldo no está completo. No se restauró ningún archivo.')
        originals[path] = original
    written = []
    try:
        for path, original in originals.items():
            if original is None:
                (root / path).unlink(missing_ok=True)
            else:
                atomic_write(root / path, original)
            written.append(path)
        manifest['status'] = 'restored'
        save_manifest(folder, manifest)
    except BaseException:
        for path in reversed(written):
            if current[path] is None:
                (root / path).unlink(missing_ok=True)
            else:
                atomic_write(root / path, current[path])
        raise
    print('V27.34 deshecho. Código restaurado desde:', folder)
    print('Recarga Expo o actualiza la vista web de la app con Ctrl + F5.')


def main():
    parser = argparse.ArgumentParser(description='Mover el acceso al chat móvil a un botón flotante inferior.')
    parser.add_argument('--deshacer', action='store_true', help='Restaurar el código anterior; no recupera mensajes eliminados.')
    args = parser.parse_args()
    payload = json.loads(zlib.decompress(base64.b64decode(PAYLOAD)).decode('utf-8'))
    root = project_root()
    if args.deshacer:
        undo(root, payload)
    else:
        install(root, payload)


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(errors='replace')
    try:
        main()
    except Exception as error:
        print('NO SE COMPLETÓ V27.34:', error)
        sys.exit(1)
