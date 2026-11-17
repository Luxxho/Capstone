from pathlib import Path
import shutil
import sys

# =========================================================
# VETMAP - RESTAURAR FORMATO ANTERIOR A V18
# =========================================================
# Restaura automáticamente el respaldo más reciente creado
# por aplicar_formato_roles_v18.py
# =========================================================

def encontrar_raiz():
    bases = [
        Path.cwd(),
        Path(__file__).resolve().parent,
        Path(__file__).resolve().parent.parent,
    ]

    revisados = set()

    for base in bases:
        for root in [base, *base.parents]:
            if root in revisados:
                continue
            revisados.add(root)

            if (root / "web" / "src" / "main.jsx").exists():
                return root

    raise FileNotFoundError(
        "No encontré ProyectoVetMap. Ejecuta este .py dentro del proyecto."
    )

root = encontrar_raiz()
backups_root = root / "respaldos_vetmap"

if not backups_root.exists():
    print("No existe la carpeta respaldos_vetmap.")
    sys.exit(1)

backups = sorted(
    [
        p for p in backups_root.iterdir()
        if p.is_dir() and p.name.startswith("antes_v18_")
    ],
    key=lambda p: p.name,
    reverse=True,
)

if not backups:
    print("No encontré un respaldo anterior a V18.")
    sys.exit(1)

backup = backups[0]
main_backup = backup / "main.jsx"
css_backup = backup / "index.css"

if not main_backup.exists() or not css_backup.exists():
    print("El respaldo está incompleto:")
    print(backup)
    sys.exit(1)

dest_main = root / "web" / "src" / "main.jsx"
dest_css = root / "web" / "src" / "index.css"

shutil.copy2(main_backup, dest_main)
shutil.copy2(css_backup, dest_css)

print("==========================================")
print(" VETMAP RESTAURADO CORRECTAMENTE")
print("==========================================")
print()
print("Respaldo utilizado:")
print(backup)
print()
print("Restaurado:")
print(" - web/src/main.jsx")
print(" - web/src/index.css")
print()
print("Recarga la web con Ctrl + F5.")
