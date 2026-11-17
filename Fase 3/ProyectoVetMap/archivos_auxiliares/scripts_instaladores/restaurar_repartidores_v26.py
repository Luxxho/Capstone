#!/usr/bin/env python3
"""Restaurador conservador VetMap V26: vuelve al código previo, sin borrar PostgreSQL."""
import argparse
import hashlib
import json
import sys
from pathlib import Path


def root_dir(location):
    spots = [Path.cwd(), location, *Path.cwd().parents, *location.parents]
    for p in spots:
        if (p / 'backend/app/models.py').is_file() and (p / 'web/src/main.jsx').is_file():
            return p
    raise RuntimeError('No encuentro la carpeta ProyectoVetMap')


def h(b):
    return hashlib.sha256(b).hexdigest()


def main():
    p = argparse.ArgumentParser(description='Restaurar código VetMap anterior a V26')
    p.add_argument('--backup', help='Ruta a un respaldo específico; por defecto usa el V26 más reciente')
    p.add_argument('--check', action='store_true', help='Sólo verifica que la restauración sea segura')
    args = p.parse_args()
    root = root_dir(Path(__file__).resolve().parent)
    folder = root / 'respaldos_instaladores'
    matches = sorted(folder.glob('antes_repartidores_v26_*/manifest.json'))
    manifest_path = Path(args.backup).resolve()/'manifest.json' if args.backup else (matches[-1] if matches else None)
    if not manifest_path or not manifest_path.is_file():
        raise RuntimeError('No se encontró respaldo V26. No es seguro restaurar sin respaldo.')
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    if manifest.get('version') != 'VetMap V26 - Repartidores tienda':
        raise RuntimeError('El manifiesto no corresponde a VetMap V26.')
    operations = []
    for item in manifest['files']:
        name = item['path']
        target = (root/name).resolve()
        if not target.is_relative_to(root.resolve()):
            raise RuntimeError('Ruta de respaldo no válida: '+name)
        if not target.is_file() or h(target.read_bytes()) != item['installed_sha256']:
            raise RuntimeError(f'{name} fue modificado después del instalador. Restauración cancelada para proteger cambios posteriores.')
        if item['existed']:
            original = manifest_path.parent/name
            if not original.is_file() or h(original.read_bytes()) != item['before_sha256']:
                raise RuntimeError(f'El respaldo original falta o no coincide: {name}')
            operations.append((target, original.read_bytes()))
        else:
            operations.append((target, None))
    print('Respaldo verificado:', manifest_path.parent)
    if args.check:
        print('MODO PRUEBA: no se modificó nada.')
        return
    for target, before in operations:
        if before is None:
            target.unlink()
        else:
            target.write_bytes(before)
    print('Código VetMap restaurado a versión previa V26.')
    print('Las tablas y datos delivery_drivers/delivery_assignments siguen en PostgreSQL, por seguridad.')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print('ERROR:', e, file=sys.stderr)
        raise SystemExit(1)
