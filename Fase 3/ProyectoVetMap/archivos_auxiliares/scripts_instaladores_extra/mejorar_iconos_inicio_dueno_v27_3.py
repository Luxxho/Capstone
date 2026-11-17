# -*- coding: utf-8 -*-
"""VetMap V27.3: iconos lineales en las tarjetas del inicio del Dueño.
Poner este archivo en la carpeta raíz ProyectoVetMap y ejecutar con Python.
No modifica backend, mobile, BD, chat, ni las acciones de las tarjetas.
"""
from datetime import datetime
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
JSX = ROOT / 'web' / 'src' / 'components' / 'VetMapOwnerHome.jsx'
CSS = ROOT / 'web' / 'src' / 'components' / 'VetMapOwnerHome.css'

IMPORT_OLD = 'import React, { useState } from "react";'
IMPORT_NEW = ('import React, { useState } from "react";\n'
              'import { PawPrint, CalendarDays, CalendarPlus, Package, Store, Stethoscope } from "lucide-react";')

# Todas las sustituciones son específicas del componente, no cambian textos ni onClick.
REPLACEMENTS = [
    ('<span className="vm-o15-stat-icon vm-o15-icon-teal">🐾</span>',
     '<span className="vm-o15-stat-icon vm-o15-icon-teal"><PawPrint size={25} strokeWidth={2.2} aria-hidden="true" /></span>'),
    ('<span className="vm-o15-stat-icon vm-o15-icon-pink">▣</span>',
     '<span className="vm-o15-stat-icon vm-o15-icon-pink"><CalendarDays size={25} strokeWidth={2.2} aria-hidden="true" /></span>'),
    ('<span className="vm-o15-stat-icon vm-o15-icon-orange">▢</span>',
     '<span className="vm-o15-stat-icon vm-o15-icon-orange"><Package size={25} strokeWidth={2.2} aria-hidden="true" /></span>'),
    ('<span className="vm-o15-order-icon" aria-hidden="true">▢</span>',
     '<span className="vm-o15-order-icon" aria-hidden="true"><Package size={21} strokeWidth={2.2} /></span>'),
    ('<span className="vm-o15-action-icon">▣</span><strong>Agendar hora</strong>',
     '<span className="vm-o15-action-icon"><CalendarPlus size={24} strokeWidth={2.2} aria-hidden="true" /></span><strong>Agendar hora</strong>'),
    ('<span className="vm-o15-action-icon">▤</span><strong>Explorar tiendas</strong>',
     '<span className="vm-o15-action-icon"><Store size={24} strokeWidth={2.2} aria-hidden="true" /></span><strong>Explorar tiendas</strong>'),
    ('<span className="vm-o15-action-icon">⌖</span><strong>Ver veterinarias</strong>',
     '<span className="vm-o15-action-icon"><Stethoscope size={24} strokeWidth={2.2} aria-hidden="true" /></span><strong>Ver veterinarias</strong>'),
    ('<span className="vm-o15-action-icon">▢</span><strong>Mis pedidos</strong>',
     '<span className="vm-o15-action-icon"><Package size={24} strokeWidth={2.2} aria-hidden="true" /></span><strong>Mis pedidos</strong>'),
    ('<div className="vm-o15-empty"><span aria-hidden="true">▢</span>',
     '<div className="vm-o15-empty"><span aria-hidden="true"><Package size={28} strokeWidth={2.1} /></span>'),
]
CSS_MARKER = '/* VETMAP V27.3 - ICONOS LINEALES DE INICIO DEL DUENO */'
CSS_EXTRA = '''\n\n/* VETMAP V27.3 - ICONOS LINEALES DE INICIO DEL DUENO */
.vm-o15-page .vm-o15-stat-icon svg,
.vm-o15-page .vm-o15-action-icon svg,
.vm-o15-page .vm-o15-order-icon svg,
.vm-o15-page .vm-o15-empty > span svg {
  display: block;
  width: 25px;
  height: 25px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.vm-o15-page .vm-o15-action-icon svg { width: 24px; height: 24px; }
.vm-o15-page .vm-o15-order-icon svg { width: 21px; height: 21px; }
.vm-o15-page .vm-o15-empty > span svg { width: 28px; height: 28px; }
'''


def main():
    if not JSX.is_file() or not CSS.is_file():
        raise ValueError('No encuentro los archivos de VetMap. Copia este instalador a la carpeta principal ProyectoVetMap (junto a web, backend y mobile).')

    source = JSX.read_text(encoding='utf-8')
    style = CSS.read_text(encoding='utf-8')

    if 'vm-o15-action-icon"><CalendarPlus' in source and CSS_MARKER in style:
        print('V27.3 ya estaba instalado. No se modificó nada.')
        return

    if IMPORT_OLD not in source:
        raise ValueError('No reconozco el import de VetMapOwnerHome.jsx. No se ha modificado nada.')
    if 'from "lucide-react"' in source:
        raise ValueError('Ya existe otra importación Lucide en el componente; revisar antes de modificar. No se ha modificado nada.')

    # Verificar TODAS las referencias antes de tocar ningún archivo.
    for old, new in REPLACEMENTS:
        count = source.count(old)
        if count != 1:
            raise ValueError(f'No pude identificar un icono de forma única ({count} apariciones): {old[:85]}. No se ha modificado nada.')

    updated = source.replace(IMPORT_OLD, IMPORT_NEW, 1)
    for old, new in REPLACEMENTS:
        updated = updated.replace(old, new, 1)
    if updated == source or updated.count('from "lucide-react"') != 1:
        raise ValueError('La verificación del cambio falló. No se ha modificado nada.')

    backup = ROOT / ('respaldo_antes_iconos_inicio_v27_3_' + datetime.now().strftime('%Y%m%d_%H%M%S'))
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(JSX, backup / JSX.name)
    shutil.copy2(CSS, backup / CSS.name)

    try:
        JSX.write_text(updated, encoding='utf-8')
        if CSS_MARKER not in style:
            CSS.write_text(style.rstrip() + CSS_EXTRA, encoding='utf-8')
    except Exception:
        shutil.copy2(backup / JSX.name, JSX)
        shutil.copy2(backup / CSS.name, CSS)
        raise

    print('\nVetMap V27.3 - Iconos de Inicio del Dueño actualizados correctamente')
    print(' + 3 indicadores (Mascotas, Reservas, Pedidos)')
    print(' + 4 acciones rápidas')
    print(' + Iconos de pedidos recientes')
    print(' Respaldo creado en:', backup)
    print(' No se modificaron backend, mobile, chat, base de datos ni configuración.')
    print(' Recarga http://localhost:5173 con Ctrl+F5 y revisa el inicio del Dueño.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('No se aplicaron los cambios:', exc)
        sys.exit(1)
