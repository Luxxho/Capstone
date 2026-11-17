# -*- coding: utf-8 -*-
"""VetMap V27.17 - Corrige el acceso al menu Fichas clinicas (rol Veterinaria).

Pon este archivo junto a las carpetas backend, mobile y web; ejecuta:
    python .\\corregir_acceso_fichas_clinicas_v27_17.py
"""
from pathlib import Path
from datetime import datetime
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parent
MAIN = ROOT / "web" / "src" / "main.jsx"
BACKUPS = ROOT / "respaldos_instaladores"

# El boton actualmente desvia al usuario a Pacientes si no habia una ficha cargada.
# La pagina clinicHistory ya contiene un estado vacio con boton Elegir paciente.
PREVIOUS = re.compile(
    r'onClick=\{\(\)\s*=>\s*\{\s*if\s*\(\s*clinicPatientHistory\?\.pet\s*\)'
    r'\s*\{\s*setMemberSection\(\s*["\']clinicHistory["\']\s*\)\s*;\s*\}'
    r'\s*else\s*\{\s*setMemberSection\(\s*["\']clinicPatients["\']\s*\)\s*;\s*\}'
    r'\s*\}\}'
)
NEW = 'onClick={() => setMemberSection("clinicHistory")}'

# Cambia el titulo informativo del boton; no afecta su accion.
OLD_TITLE = 'title="Selecciona un paciente para consultar su historial si todav\u00eda no hay uno abierto"'
NEW_TITLE = 'title="Abrir Fichas cl\u00ednicas; elige un paciente si a\u00fan no hay una ficha abierta"'

def run():
    if not MAIN.is_file():
        raise RuntimeError("No encuentro web/src/main.jsx. Copia este instalador a la carpeta principal ProyectoVetMap.")
    source = MAIN.read_text(encoding="utf-8")
    if NEW in source:
        print("VetMap V27.17 ya estaba aplicado; no se hizo ningun cambio.")
        return
    matches = list(PREVIOUS.finditer(source))
    if len(matches) != 1:
        raise RuntimeError(
            f"No encuentro el boton original de Fichas clinicas (coincidencias: {len(matches)}). "
            "No cambie archivos. Enviame la linea del boton desde web/src/main.jsx para adaptarlo."
        )
    # Seguridad: revisar que la coincidencia sea efectivamente el boton de Fichas clinicas.
    match = matches[0]
    context_before = source[max(0, match.start()-700):match.start()]
    context_after = source[match.end():match.end()+450]
    if 'clinicHistory' not in context_before or 'Fichas cl' not in context_after:
        raise RuntimeError("La coincidencia no corresponde al menu Fichas clinicas. No se modifico nada.")
    fixed = source[:match.start()] + NEW + source[match.end():]
    if OLD_TITLE in fixed:
        fixed = fixed.replace(OLD_TITLE, NEW_TITLE, 1)
    if fixed.count(NEW) != 1:
        raise RuntimeError("Fallo la validacion del boton corregido. No se modifico nada.")
    BACKUPS.mkdir(parents=True, exist_ok=True)
    folder = BACKUPS / ("antes_fichas_clinicas_v27_17_" + datetime.now().strftime("%Y%m%d_%H%M%S_%f"))
    folder.mkdir()
    shutil.copy2(MAIN, folder / "main.jsx")
    MAIN.write_text(fixed, encoding="utf-8")
    print("\nVETMAP V27.17 - ACCESO A FICHAS CLINICAS CORREGIDO")
    print(" + Menu Veterinaria > Fichas clinicas: abre siempre la seccion.")
    print(" + Si no hay paciente seleccionado, puedes pulsar Elegir paciente.")
    print(" + No se modificaron registros ni funciones de las fichas.")
    print("Respaldo:", folder)
    print("Actualiza el navegador con Ctrl + F5 y prueba el menu.")

if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        print("NO SE APLICO:", e)
        sys.exit(1)
