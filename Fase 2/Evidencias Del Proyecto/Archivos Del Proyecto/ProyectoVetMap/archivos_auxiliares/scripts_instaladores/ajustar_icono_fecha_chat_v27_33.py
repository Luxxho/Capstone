#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""VetMap V27.33: basurero sin texto y fecha/hora debajo del mensaje, en web y app.

Copiar a ProyectoVetMap y ejecutar:
    python .\ajustar_icono_fecha_chat_v27_33.py
Para restaurar únicamente el código:
    python .\ajustar_icono_fecha_chat_v27_33.py --deshacer

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
PREFIX = "respaldo_antes_v27_33_"


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
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.vetmap_v2733_', suffix='.tmp', delete=False) as file:
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
        print('VETMAP V27.33: YA INSTALADO. No se repitieron los cambios.')
        return
    if any(states) or any(originals[path] is not None for path in payload['create']):
        raise RuntimeError('V27.33 aparece parcialmente aplicado o editado. No se sobrescribió ningún archivo.')
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
    manifest = {'version': '27.33', 'status': 'prepared', 'files': {}}
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
    print('\nVETMAP V27.33 - ICONO, FECHA Y HORA DEL CHAT ACTUALIZADOS')
    print(' + Web y app: solo el icono del basurero en tus mensajes.')
    print(' + Fecha y hora reales, pequeñas debajo de cada mensaje, en formato de 24 horas.')
    print(' + Se conserva la confirmación para eliminar y los permisos de V27.32.')
    print(' Respaldo del código:', folder)
    print(' Actualiza la web con Ctrl + F5. No hace falta reiniciar el backend por este ajuste.')
    print(' App: recarga Expo; un APK ya compilado requiere generar una versión nueva.')
    print(' Para deshacer el código: python .\\ajustar_icono_fecha_chat_v27_33.py --deshacer')


def undo(root, payload):
    candidates = []
    for base in backup_bases(root):
        if base.is_dir():
            for folder in base.glob(PREFIX + '*'):
                file = folder / 'manifest.json'
                if file.is_file():
                    manifest = json.loads(file.read_text(encoding='utf-8'))
                    if manifest.get('version') == '27.33' and manifest.get('status') in {'installed', 'prepared'}:
                        candidates.append((folder, manifest))
    if not candidates:
        print('No hay un respaldo pendiente de V27.33 para restaurar.')
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
    print('V27.33 deshecho. Código restaurado desde:', folder)
    print('Actualiza la web y recarga la app. Esto no recupera mensajes eliminados.')


def main():
    parser = argparse.ArgumentParser(description='Ajustar el basurero y mostrar fecha y hora en el chat de VetMap.')
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
        print('NO SE COMPLETÓ V27.33:', error)
        sys.exit(1)
