# -*- coding: utf-8 -*-
r"""VetMap V27.12: únicamente estilos de Administrador, con respaldo y deshacer.

Coloca ESTE .py y vetmap_admin_v27_12.css en la raíz de ProyectoVetMap.
Ejecuta: python .\instalar_diseno_admin_v27_12.py
Deshacer solo este cambio: python .\instalar_diseno_admin_v27_12.py --deshacer
"""
from datetime import datetime
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
TARGET = ROOT / 'web' / 'src' / 'index.css'
MAIN = ROOT / 'web' / 'src' / 'main.jsx'
ADMIN = ROOT / 'web' / 'src' / 'components' / 'VetMapAdminDashboard.jsx'
THEME = ROOT / 'vetmap_admin_v27_12.css'
START = '/* === BEGIN VETMAP ADMIN V27.12 === */'
END = '/* === END VETMAP ADMIN V27.12 === */'


def main():
    if not all(x.is_file() for x in (TARGET, MAIN, ADMIN)):
        raise ValueError('No encuentro web/src o el Dashboard Admin. Pon el instalador en la raíz ProyectoVetMap.')
    main_text = MAIN.read_text(encoding='utf-8')
    admin_text = ADMIN.read_text(encoding='utf-8')
    if not all(x in main_text for x in ('vm-admin-v10-mode','vm-admin-people-section','vmv10-management-heading')):
        raise ValueError('Tu estructura del administrador es diferente. No modifiqué archivos.')
    if not all(x in admin_text for x in ('vmv8-hero','vmv8-metrics','vmv8-metric-card')):
        raise ValueError('No reconozco el inicio de Administración. No modifiqué archivos.')
    old = TARGET.read_text(encoding='utf-8')
    if old.count(START) != old.count(END) or old.count(START)>1:
        raise ValueError('Hay marcadores incompletos o repetidos. No modifiqué archivos.')

    if START in old:
        a=old.index(START)
        b=old.index(END,a)+len(END)
        base=(old[:a]+old[b:]).rstrip()+'\n'
    else:
        base=old.rstrip()+'\n'

    if '--deshacer' in sys.argv:
        if START not in old:
            print('V27.12 no estaba instalado. No hay nada que deshacer.')
            return
        updated=base
        action='ELIMINADO (revertido únicamente V27.12)'
    else:
        if not THEME.is_file():
            raise ValueError('No encuentro vetmap_admin_v27_12.css junto al instalador. No modifiqué archivos.')
        css=THEME.read_text(encoding='utf-8')
        if not all(x in css for x in ('.vmv8-hero', '.vm-admin-user-card', '.vmv10-management-heading')):
            raise ValueError('CSS de instalación incompleto. No modifiqué archivos.')
        updated=base+'\n'+START+'\n'+css.rstrip()+'\n'+END+'\n'
        action='APLICADO'

    if old==updated:
        print('V27.12 ya estaba al día. No se hicieron cambios.')
        return
    backup=ROOT / ('respaldo_antes_admin_v27_12_'+datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
    backup.mkdir(parents=False,exist_ok=False)
    shutil.copy2(TARGET,backup/'index.css')
    TARGET.write_text(updated,encoding='utf-8')
    print('\nVetMap V27.12 - DISEÑO ADMIN '+action)
    print(' + Banner de inicio diferenciado, separado de indicadores')
    print(' + Encabezado Gestión de usuarios y tarjetas alineadas')
    print(' + Diseños adaptables a monitores más pequeños')
    print('Archivo cambiado: web/src/index.css')
    print('Respaldo: '+str(backup))
    print('No se modificaron JSX, backend, app móvil, .env ni PostgreSQL.')
    print('En el navegador: Ctrl+F5.')


if __name__=='__main__':
    try:
        main()
    except Exception as e:
        print('NO SE APLICÓ:',e)
        sys.exit(1)
