# -*- coding: utf-8 -*-
"""VetMap V27.21: ancho y distribución responsive del Inicio de Dueño.

Colocar en la raíz de ProyectoVetMap y ejecutar:
  python ajustar_inicio_dueno_v27_21.py
  python ajustar_inicio_dueno_v27_21.py --deshacer
"""
from pathlib import Path
from datetime import datetime
import sys
import shutil

ROOT = Path(__file__).resolve().parent
CSS_PATH = ROOT / 'web' / 'src' / 'index.css'
START = '/* VETMAP V27.21 - INICIO DUENO ADAPTABLE - INICIO */'
END = '/* VETMAP V27.21 - INICIO DUENO ADAPTABLE - FIN */'

CSS = r'''/* VETMAP V27.21 - INICIO DUENO ADAPTABLE - INICIO */
/* Solo rol Dueño. Conserva banner, colores, iconos y funciones. */

/* No encerrar VetMap en un ancho máximo cuando el dueño está conectado. */
body:has(.vm-owner-v15-shell) .vm-web-app-bg {
  width: 100% !important;
  min-width: 0 !important;
  padding: 12px clamp(10px, 1.5vw, 24px) 22px !important;
}
body:has(.vm-owner-v15-shell) .vm-web-frame {
  width: 100% !important;
  max-width: none !important;
  margin-inline: 0 !important;
}

/* Distribución principal: menú lateral y contenido ocupan el ancho disponible. */
html body .vm-member-shell.vmh16-shell.vm-owner-v15-shell {
  width: 100% !important;
  max-width: none !important;
  min-width: 0 !important;
}
html body .vm-member-shell.vm-owner-v15-shell .vm-o15-page {
  display: block !important;
  width: 100% !important;
  max-width: none !important;
  min-width: 0 !important;
  margin: 0 !important;
  padding: clamp(12px, 1.55vw, 24px) clamp(13px, 1.75vw, 28px) 32px !important;
}

/* Tarjetas: evitar que quede demasiado vacío o comprimido entre columnas. */
html body .vm-owner-v15-shell .vm-o15-stat-grid {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: clamp(10px, 1vw, 17px) !important;
  width: 100% !important;
}
html body .vm-owner-v15-shell .vm-o15-content-grid {
  display: grid !important;
  grid-template-columns: minmax(0, 1.06fr) minmax(0, 0.94fr) !important;
  gap: clamp(12px, 1.2vw, 21px) !important;
  width: 100% !important;
  min-width: 0 !important;
  align-items: start !important;
}
html body .vm-owner-v15-shell .vm-o15-content-grid > *,
html body .vm-owner-v15-shell .vm-o15-stat-grid > * {
  min-width: 0 !important;
}
html body .vm-owner-v15-shell .vm-o15-page .vm-o15-panel {
  padding: clamp(16px, 1.3vw, 22px) !important;
}

/* Portátiles: dejar más espacio para las mascotas y accesos rápidos. */
@media (max-width: 1180px) {
  html body .vm-owner-v15-shell .vm-o15-content-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
  }
  html body .vm-owner-v15-shell .vm-o15-pet-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

/* Pantallas angostas: tarjetas apiladas y legibles, sin desplazamiento horizontal. */
@media (max-width: 900px) {
  html body .vm-owner-v15-shell .vm-o15-content-grid {
    grid-template-columns: minmax(0, 1fr) !important;
  }
  html body .vm-owner-v15-shell .vm-o15-page {
    padding: 14px 12px 26px !important;
  }
}
@media (max-width: 700px) {
  html body .vm-owner-v15-shell .vm-o15-stat-grid {
    grid-template-columns: minmax(0, 1fr) !important;
  }
  html body .vm-owner-v15-shell .vm-o15-action-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
@media (max-width: 390px) {
  html body .vm-owner-v15-shell .vm-o15-action-grid {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}
/* VETMAP V27.21 - INICIO DUENO ADAPTABLE - FIN */
'''


def main():
    if not CSS_PATH.is_file():
        raise RuntimeError('No encuentro web/src/index.css. Coloca el .py en la raíz de ProyectoVetMap.')
    old = CSS_PATH.read_text(encoding='utf-8-sig')
    undo = '--deshacer' in sys.argv
    if old.count(START) != old.count(END):
        raise RuntimeError('Hay un bloque V27.21 incompleto. No hice cambios.')
    if undo:
        if START not in old:
            print('V27.21 no está aplicada. No hay nada que deshacer.')
            return
        start, end = old.index(START), old.index(END) + len(END)
        new = (old[:start].rstrip('\n') + '\n' + old[end:].lstrip('\n'))
        CSS_PATH.write_text(new, encoding='utf-8')
        print('V27.21 DESHECHA. Los demás estilos quedan intactos. Actualiza con Ctrl+F5.')
        return
    if START in old:
        print('V27.21 ya estaba aplicada; no dupliqué los estilos.')
        return
    if '.vm-owner-v15-shell' not in old:
        raise RuntimeError('No detecté el rol Dueño en index.css. No hice cambios.')
    backup_folder = ROOT / 'respaldos_instaladores' / ('antes_diseno_responsive_dueno_v27_21_' + datetime.now().strftime('%Y%m%d_%H%M%S'))
    backup_folder.mkdir(parents=True, exist_ok=False)
    shutil.copy2(CSS_PATH, backup_folder / 'index.css')
    CSS_PATH.write_text(old.rstrip() + '\n\n' + CSS + '\n', encoding='utf-8')
    print('V27.21 INSTALADA: Inicio Dueño adaptado al ancho de pantalla.')
    print('Respaldo:', backup_folder)
    print('No cambié backend, mobile, JSX, imágenes ni otros roles.')
    print('Actualiza la web con Ctrl+F5. Si todo sigue muy pequeño, pulsa Ctrl+0 para restaurar el zoom del navegador.')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print('NO SE APLICO:', e)
        sys.exit(1)
