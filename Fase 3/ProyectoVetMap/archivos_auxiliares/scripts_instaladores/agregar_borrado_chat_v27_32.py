#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""VetMap V27.32: eliminar mensajes propios en el chat web y la app.

Copiar a ProyectoVetMap y ejecutar:
    python .\agregar_borrado_chat_v27_32.py
Para restaurar únicamente el código:
    python .\agregar_borrado_chat_v27_32.py --deshacer

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

PAYLOAD = "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"
PREFIX = "respaldo_antes_v27_32_"


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
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.vetmap_v2732_', suffix='.tmp', delete=False) as file:
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
        print('VETMAP V27.32: YA INSTALADO. No se repitieron los cambios.')
        return
    if any(states) or any(originals[path] is not None for path in payload['create']):
        raise RuntimeError('V27.32 aparece parcialmente aplicado o editado. No se sobrescribió ningún archivo.')
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
    manifest = {'version': '27.32', 'status': 'prepared', 'files': {}}
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
    print('\nVETMAP V27.32 - ELIMINAR MENSAJES DE CHAT INSTALADO')
    print(' + Web y app: botón Eliminar en tus propios mensajes, con confirmación.')
    print(' + El servidor comprueba que seas el remitente y tengas acceso al chat.')
    print(' + El mensaje se elimina del chat para ambos participantes.')
    print(' Respaldo del código:', folder)
    print(' Reinicia el backend y actualiza la web con Ctrl + F5.')
    print(' App: recarga Expo; un APK ya compilado requiere generar una versión nueva.')
    print(' Para deshacer el código: python .\\agregar_borrado_chat_v27_32.py --deshacer')


def undo(root, payload):
    candidates = []
    for base in backup_bases(root):
        if base.is_dir():
            for folder in base.glob(PREFIX + '*'):
                file = folder / 'manifest.json'
                if file.is_file():
                    manifest = json.loads(file.read_text(encoding='utf-8'))
                    if manifest.get('version') == '27.32' and manifest.get('status') in {'installed', 'prepared'}:
                        candidates.append((folder, manifest))
    if not candidates:
        print('No hay un respaldo pendiente de V27.32 para restaurar.')
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
    print('V27.32 deshecho. Código restaurado desde:', folder)
    print('Reinicia el backend y actualiza la web. Esto no recupera mensajes eliminados.')


def main():
    parser = argparse.ArgumentParser(description='Agregar eliminación de mensajes propios al chat web y app de VetMap.')
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
        print('NO SE COMPLETÓ V27.32:', error)
        sys.exit(1)
