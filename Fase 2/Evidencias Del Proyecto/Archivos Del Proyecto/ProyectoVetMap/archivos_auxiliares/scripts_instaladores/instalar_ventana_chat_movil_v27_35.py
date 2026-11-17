#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""VetMap V27.35: abrir el chat móvil en una ventana flotante sin cambiar de página.

Copiar a ProyectoVetMap y ejecutar:
    python .\instalar_ventana_chat_movil_v27_35.py
Para restaurar únicamente el código:
    python .\instalar_ventana_chat_movil_v27_35.py --deshacer

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
PREFIX = "respaldo_antes_v27_35_"


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
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.vetmap_v2735_', suffix='.tmp', delete=False) as file:
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
        print('VETMAP V27.35: YA INSTALADO. No se repitieron los cambios.')
        return
    if any(states) or any(originals[path] is not None for path in payload['create']):
        raise RuntimeError('V27.35 aparece parcialmente aplicado o editado. No se sobrescribió ningún archivo.')
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
        updated[path] = encode(value, originals['mobile/components/ui.jsx'])
    base = backup_bases(root)[0] if (root / 'archivos_auxiliares').is_dir() else backup_bases(root)[1]
    folder = base / (PREFIX + datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
    folder.mkdir(parents=True, exist_ok=False)
    manifest = {'version': '27.35', 'status': 'prepared', 'files': {}}
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
    print('\nVETMAP V27.35 - VENTANA FLOTANTE DE CHAT MÓVIL INSTALADA')
    print(' + El botón abre una ventana sobre Inicio o la pantalla donde estés.')
    print(' + X, tocar fuera o Volver de Android cierran el chat sin navegar.')
    print(' + Se conservan conversaciones, basurero, fecha, hora y el borrador al minimizar.')
    print(' Respaldo del código:', folder)
    print(' Recarga Expo con R; en la vista web de la app, actualiza con Ctrl + F5.')
    print(' App: recarga Expo; un APK ya compilado requiere generar una versión nueva.')
    print(' Para deshacer el código: python .\\instalar_ventana_chat_movil_v27_35.py --deshacer')


def undo(root, payload):
    candidates = []
    for base in backup_bases(root):
        if base.is_dir():
            for folder in base.glob(PREFIX + '*'):
                file = folder / 'manifest.json'
                if file.is_file():
                    manifest = json.loads(file.read_text(encoding='utf-8'))
                    if manifest.get('version') == '27.35' and manifest.get('status') in {'installed', 'prepared'}:
                        candidates.append((folder, manifest))
    if not candidates:
        print('No hay un respaldo pendiente de V27.35 para restaurar.')
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
    print('V27.35 deshecho. Código restaurado desde:', folder)
    print('Recarga Expo o actualiza la vista web de la app. Esto no recupera mensajes eliminados.')


def main():
    parser = argparse.ArgumentParser(description='Abrir el chat móvil como una ventana flotante sobre la pantalla actual.')
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
        print('NO SE COMPLETÓ V27.35:', error)
        sys.exit(1)
