# -*- coding: utf-8 -*-
"""VetMap V27.20: redimensionar SOLO iconos premium de Inicio a tamaño Admin.

Ejecuta desde la carpeta principal ProyectoVetMap:
    python .\reducir_iconos_v27_20.py
    python .\reducir_iconos_v27_20.py --deshacer

Modifica solamente el CSS creado por V27.19, conservando sus SVG y la logica.
"""
from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path(__file__).resolve().parent
CSS = ROOT / 'web' / 'src' / 'vetmap_v27_19_iconos_premium.css'
MAIN = ROOT / 'web' / 'src' / 'main.jsx'
BACKUPS = ROOT / 'respaldos_instaladores'
START = '/* VETMAP V27.20 - INICIO AJUSTE TAMANO ICONOS */'
END = '/* VETMAP V27.20 - FIN AJUSTE TAMANO ICONOS */'

STYLES = r'''
/* VETMAP V27.20 - INICIO AJUSTE TAMANO ICONOS */
/* Dueño y Veterinaria: mismo tamaño aproximado de la ficha de Admin.
   El icono sigue siendo el SVG premium V27.19, sin emojis ni imagenes. */
body .vm-o15-hero.vm-v2719-hero > .vm-v2719-visual,
body .vm-v22-hero.vm-v2719-hero > .vm-v2719-visual {
  width: 116px !important;
  height: 116px !important;
  min-width: 116px !important;
  min-height: 116px !important;
}
body .vm-v2719-hero .vm-v2719-visual .vm-v2719-icon-tile,
body .vm-v22-hero.vm-v2719-hero .vm-v2719-visual .vm-v2719-icon-tile {
  width: 96px !important;
  height: 96px !important;
  min-width: 96px !important;
  min-height: 96px !important;
  border-radius: 24px !important;
}
body .vm-v2719-hero .vm-v2719-visual .vm-v2719-symbol,
body .vm-v22-hero.vm-v2719-hero .vm-v2719-visual .vm-v2719-symbol {
  width: 58px !important;
  height: 58px !important;
  min-width: 58px !important;
  min-height: 58px !important;
  max-width: 58px !important;
  max-height: 58px !important;
}
/* Mantener el espacio de respiro adecuado al icono mas pequeño. */
body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero .vm-o15-hero-copy,
body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic .vm-v22-hero.vm-v2719-hero .vm-v22-hero-copy {
  max-width: calc(100% - 145px) !important;
}
@media (max-width:950px) {
  body .vm-o15-hero.vm-v2719-hero > .vm-v2719-visual,
  body .vm-v22-hero.vm-v2719-hero > .vm-v2719-visual {
    width: 96px !important; height: 96px !important;
    min-width: 96px !important; min-height: 96px !important;
  }
  body .vm-v2719-hero .vm-v2719-visual .vm-v2719-icon-tile,
  body .vm-v22-hero.vm-v2719-hero .vm-v2719-visual .vm-v2719-icon-tile {
    width: 82px !important; height: 82px !important;
    min-width: 82px !important; min-height: 82px !important;
    border-radius: 20px !important;
  }
  body .vm-v2719-hero .vm-v2719-visual .vm-v2719-symbol,
  body .vm-v22-hero.vm-v2719-hero .vm-v2719-visual .vm-v2719-symbol {
    width: 49px !important; height: 49px !important;
    min-width: 49px !important; min-height: 49px !important;
    max-width: 49px !important; max-height: 49px !important;
  }
}
@media (max-width:610px) {
  /* Respeta el comportamiento mobile ya existente de V27.19. */
  body .vm-o15-hero.vm-v2719-hero > .vm-v2719-visual,
  body .vm-v22-hero.vm-v2719-hero > .vm-v2719-visual { display:none !important; }
  body .vm-member-shell.vm-owner-v15-shell .vm-o15-page .vm-o15-hero.vm-v2719-hero .vm-o15-hero-copy,
  body .vm-member-shell.vmh16-shell:has(nav.vm-member-nav--vet) .vm-v22-classic .vm-v22-hero.vm-v2719-hero .vm-v22-hero-copy {
    max-width:100% !important;
  }
}
/* VETMAP V27.20 - FIN AJUSTE TAMANO ICONOS */
'''

def verify():
    if not (ROOT / 'web' / 'src').is_dir() or not MAIN.is_file():
        raise RuntimeError('Ejecuta este script desde la carpeta principal ProyectoVetMap.')
    if not CSS.exists():
        raise RuntimeError('No encuentro el CSS de V27.19. Instala primero V27.19. No cambie archivos.')
    data = CSS.read_text(encoding='utf-8')
    if not all(x in data for x in ['.vm-v2719-icon-tile', '.vm-v2719-symbol', '.vm-v2719-visual']):
        raise RuntimeError('No reconozco el CSS original de V27.19; no modifique nada.')
    return data

def install():
    original = verify()
    if START in original and END in original:
        print('V27.20 ya está aplicada. No se duplicaron estilos.')
        return
    if START in original or END in original:
        raise RuntimeError('Encontré un ajuste V27.20 incompleto; no se modificó nada.')
    BACKUPS.mkdir(parents=True, exist_ok=True)
    dest = BACKUPS / f'respaldo_css_iconos_antes_v27_20_{datetime.now():%Y%m%d_%H%M%S_%f}'
    dest.mkdir(parents=True, exist_ok=False)
    shutil.copy2(CSS, dest / CSS.name)
    CSS.write_text(original.rstrip() + '\n\n' + STYLES.strip() + '\n', encoding='utf-8')
    print('\nVETMAP V27.20 - ICONOS REDUCIDOS CORRECTAMENTE')
    print(' + Dueño: ficha 96x96 px (antes 138x138)')
    print(' + Veterinaria: ficha 96x96 px (antes 138x138)')
    print(' + Los iconos y colores son los mismos de V27.19')
    print(' + Respaldo:', dest)
    print('Actualiza tu pagina con Ctrl + F5.')

def undo():
    data = verify()
    if START not in data or END not in data:
        print('V27.20 no está aplicada. No se cambió nada.')
        return
    if data.count(START) != 1 or data.count(END) != 1 or data.index(START) > data.index(END):
        raise RuntimeError('Marcadores duplicados o incorrectos; no se modificó nada.')
    s = data.index(START)
    e = data.index(END) + len(END)
    after = (data[:s].rstrip() + '\n' + data[e:].lstrip('\n')).rstrip() + '\n'
    CSS.write_text(after, encoding='utf-8')
    print('V27.20 deshecha. Los iconos volvieron al tamaño anterior. Actualiza con Ctrl + F5.')

if __name__ == '__main__':
    try:
        if len(sys.argv)==1: install()
        elif len(sys.argv)==2 and sys.argv[1]=='--deshacer': undo()
        else: raise RuntimeError('Uso: python .\\reducir_iconos_v27_20.py [--deshacer]')
    except Exception as error:
        print('NO SE APLICO V27.20:', error)
        sys.exit(1)
