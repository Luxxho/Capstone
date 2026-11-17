# -*- coding: utf-8 -*-
"""VetMap V17 - Replica visual de las referencias Tienda y Veterinaria.
Solo cambia la pantalla Inicio y los menus laterales de esos dos perfiles.
No cambia Admin/Dueno/API/backend ni reutiliza archivos antiguos.
Ejecutar desde la raiz ProyectoVetMap con Python 3.10+.
"""
from pathlib import Path
from datetime import datetime
from shutil import copy2
import re
import sys

HERE = Path(__file__).resolve().parent
RELATIVE_FILES = [
    'web/src/components/VetMapReferenceHomes.jsx',
    'web/src/components/VetMapReferenceHomes.css',
    'web/src/assets/vmref_tienda_mascota.png',
    'web/src/assets/vmref_veterinaria_mascotas.png',
]
IMPORT = 'import { VetMapReferenceStore, VetMapReferenceClinic, VetMapReferenceNavIcon } from "./components/VetMapReferenceHomes";'
MARK = 'VetMapReferenceStore'


def detect_root():
    for where in [Path.cwd(), Path.cwd().parent, HERE, HERE.parent]:
        if (where / 'web/src/main.jsx').exists() and (where / 'backend').exists():
            return where
    raise SystemExit('ERROR: abre PowerShell en la raiz ProyectoVetMap antes de ejecutar el instalador.')


def replace_section(text, role, end_section, component):
    start_re = r'\{\s*currentUser\.role\s*===\s*"%s"\s*&&\s*memberSection\s*===\s*"inicio"\s*&&\s*\(' % role
    end_re = r'\{\s*currentUser\.role\s*===\s*"%s"\s*&&\s*memberSection\s*===\s*"%s"' % (role, end_section)
    starts = list(re.finditer(start_re, text))
    if len(starts) != 1:
        raise ValueError(f'No puedo localizar de forma inequívoca la pantalla Inicio de {role}: {len(starts)} coincidencias.')
    start = starts[0].start()
    ends = list(re.finditer(end_re, text[starts[0].end():]))
    if len(ends) != 1:
        raise ValueError(f'No puedo localizar el fin del Inicio de {role} sin riesgo de alterar otras pantallas.')
    end = starts[0].end() + ends[0].start()
    old = text[start:end]
    # Comprobar que el contenido es realmente el panel antiguo y no otro condicional intermedio.
    expected = 'vm-store-dashboard' if role == 'store' else 'vm-clinic-dashboard'
    if expected not in old:
        raise ValueError(f'La pantalla Inicio de {role} no coincide con la versión esperada ({expected}). No se cambió nada.')
    common = 'user={currentUser} dashboard={storeDashboard} products={storeProducts} orders={storeOrders}' if role == 'store' else 'user={currentUser} dashboard={clinicDashboard} appointments={clinicAppointments} patients={clinicPatients} prescriptions={clinicPrescriptions}'
    result = f'''{{currentUser.role === "{role}" && memberSection === "inicio" && (
                <{component} {common} onNavigate={{setMemberSection}} />
              )}}
              '''
    extra = f'''{{currentUser.role === "{role}" && {('["storeStock", "storeCustomers", "storeAnalytics", "storeInfo"]' if role == 'store' else '["clinicServices", "clinicReports"]')}.includes(memberSection) && (
                <{component} {common} view={{memberSection}} onNavigate={{setMemberSection}} />
              )}}
              '''
    return text[:start] + result + extra + text[end:]


def menu_items(role):
    if role == 'vet':
        items = [
            ('Inicio', 'home', 'inicio'), ('Pacientes', 'patients', 'clinicPatients'),
            ('Reservas', 'agenda', 'clinicAgenda'), ('Historia clínica', 'history', 'clinicPatients'),
            ('Servicios', 'services', 'clinicServices'), ('Calendario', 'calendar', 'clinicAgenda'),
            ('Productos', 'products', 'tienda'), ('Reportes', 'reports', 'clinicReports'),
            ('Mi perfil', 'profile', 'cuenta'), ('Recetas', 'recipes', 'clinicPrescriptions'),
        ]
    else:
        items = [
            ('Inicio','home','inicio'), ('Productos','products','storeProducts'),
            ('Pedidos','orders','storeOrders'), ('Stock','stock','storeStock'),
            ('Clientes','users','storeCustomers'), ('Analíticas','analytics','storeAnalytics'),
            ('Mi tienda','store','storeInfo'), ('Configuración','settings','cuenta'),
            ('Historial','history','storeHistory'),
        ]
    rows = []
    for label, icon, key in items:
        onclick = '() => { setAccountMode("profile"); setMemberSection("cuenta"); }' if key == 'cuenta' else f'() => setMemberSection("{key}")'
        rows.append(f'                      <button type="button" onClick={{{onclick}}} className={{memberSection === "{key}" ? "active" : ""}}><VetMapReferenceNavIcon name="{icon}" />{label}</button>')
    return '\n'.join(rows)


def replace_menu(text):
    # Limitar el reemplazo al bloque exacto del menú por rol (nunca afecta Admin ni Dueño).
    start_tag = '{currentUser.role === "vet" ? ('
    middle_tag = ') : currentUser.role === "store" ? ('
    end_tag = ') : currentUser.role === "admin" ? ('
    p0 = text.find(start_tag)
    if p0 == -1 or text.find(start_tag, p0+1) != -1:
        raise ValueError('No se encontró un menú lateral único para Veterinaria.')
    p1 = text.find(middle_tag,p0)
    p2 = text.find(end_tag,p1)
    if p1 == -1 or p2 == -1:
        raise ValueError('No encontré los menús esperados de Tienda y Admin.')
    # Validación estructural; si hay código distinto, no arriesgamos modificar la aplicación.
    vet_old = text[p0:p1]; store_old = text[p1:p2]
    if '<button' not in vet_old or '<button' not in store_old or 'clinicAgenda' not in vet_old or 'storeProducts' not in store_old:
        raise ValueError('El menú tiene una estructura diferente a la esperada. No se aplicó el cambio.')
    vet_new = start_tag + '\n                    <>\n' + menu_items('vet') + '\n                    </>\n                  '
    store_new = middle_tag + '\n                    <>\n' + menu_items('store') + '\n                    </>\n                  '
    return text[:p0] + vet_new + store_new + text[p2:]


def main():
    root = detect_root()
    main_path = root/'web/src/main.jsx'
    src = main_path.read_text(encoding='utf-8-sig')
    print('Proyecto:', root)
    if MARK in src and IMPORT in src:
        print('AVISO: Diseño V17 ya instalado en main.jsx; no se aplicarán duplicados.')
        return
    if 'VetMapRoleHeader' not in src or 'VetMapOwnerHome' not in src:
        raise SystemExit('ERROR: falta la base estable V16 (RoleHeader/OwnerHome). No se modifica el proyecto.')
    for filename in RELATIVE_FILES:
        if not (HERE / filename).exists():
            raise SystemExit('ERROR: falta un archivo dentro de la carpeta del instalador: ' + filename)
    try:
        altered = replace_section(src, 'store', 'storeProducts', 'VetMapReferenceStore')
        altered = replace_section(altered, 'vet', 'clinicAgenda', 'VetMapReferenceClinic')
        altered = replace_menu(altered)
    except ValueError as exc:
        raise SystemExit('ERROR DE SEGURIDAD: ' + str(exc))
    if altered.count(IMPORT) != 0:
        raise SystemExit('ERROR: el import existe parcialmente; se canceló para evitar conflictos.')
    altered = IMPORT + '\n' + altered
    checks = [
      altered.count('<VetMapReferenceStore ') == 2,
      altered.count('<VetMapReferenceClinic ') == 2,
      'VetMapAdminChrome' in altered, 'VetMapOwnerHome' in altered,
      'getStoreDashboard' in altered, 'getClinicDashboard' in altered,
      altered.count(IMPORT) == 1,
    ]
    if not all(checks):
        raise SystemExit('ERROR: falló una comprobación de integridad. No se modificó nada.')
    print('Revisión completada. Solo se cambiarán Inicio y los menús laterales de Tienda/Veterinaria.')
    if '--comprobar' in sys.argv:
        print('OK: instalación compatible. Ejecuta sin --comprobar para aplicarla.')
        return
    # Crear respaldo antes de escribir cualquier cambio.
    backups = root/'respaldos_instaladores'/'copias_codigo'
    backups.mkdir(parents=True, exist_ok=True)
    backup = backups / f'main_antes_diseno_v17_{datetime.now():%Y%m%d_%H%M%S}.jsx'
    copy2(main_path, backup)
    print('RESPALDO:',backup)
    for item in RELATIVE_FILES:
        dst = root/item
        if dst.exists():
            if dst.read_bytes() != (HERE/item).read_bytes():
                raise SystemExit('ERROR: ya existe una versión distinta de '+item+'. No se sobrescribe. Respaldo creado.')
            print('CONSERVADO:',item)
        else:
            dst.parent.mkdir(parents=True, exist_ok=True)
            copy2(HERE/item,dst)
            print('AÑADIDO:',item)
    main_path.write_text(altered,encoding='utf-8')
    print('OK: diseño de Tienda y Veterinaria integrado. Admin y Dueño intactos.')
    print('SIGUIENTE: cd web; npm run build')

if __name__ == '__main__':
    main()
