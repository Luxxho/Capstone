#!/usr/bin/env python3
"""VetMap V26 - aplica modulo Repartidores sin sustituir archivos completos.

Ejecutar desde raiz VetMap o desde scripts_instaladores, con carpeta payload adjunta.
"""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile

VERSION = "VetMap V26 - Repartidores tienda"
PATCH_NAME = "vetmap_v26_payload"


def find_root(script_location):
    spots = [Path.cwd(), script_location]
    spots += list(Path.cwd().parents) + list(script_location.parents)
    for root in spots:
        if (root / "backend/app/models.py").is_file() and (root / "web/src/main.jsx").is_file():
            return root
    raise RuntimeError("No encontré la raíz del proyecto VetMap. Ejecuta este instalador dentro de ProyectoVetMap.")


def sha(blob):
    return hashlib.sha256(blob).hexdigest()


def patch_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: esperada una coincidencia, encontradas {count}. No se alteró el proyecto.")
    return text.replace(old, new, 1)


def read_payload(name):
    path = Path(__file__).resolve().parent / PATCH_NAME / name
    if not path.is_file():
        raise RuntimeError(f"Falta el archivo del paquete: {path}")
    return path.read_text(encoding="utf-8")


def preserve_bytes(normalized_text, original_bytes):
    new_text = normalized_text.replace("\r\n", "\n")
    newline = "\r\n" if b"\r\n" in original_bytes else "\n"
    return new_text.replace("\n", newline).encode("utf-8")


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=".vetmap_v26_", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def prepare(root):
    touched = [
        "backend/app/models.py",
        "backend/app/main.py",
        "backend/app/routers/store.py",
        "web/src/main.jsx",
        "web/src/api.js",
    ]
    fresh = ["backend/app/routers/delivery.py", "web/src/vetmap_repartidores_v26.css"]
    original = {name: (root/name).read_bytes() for name in touched}
    for file_name in fresh:
        if (root/file_name).exists():
            raise RuntimeError(f"Existe {file_name}. Antes de continuar, revisa si V26 ya está instalado.")
    if any(b"VETMAP V26" in b for b in original.values()):
        raise RuntimeError("Hay marcadores de V26 en el código. No se vuelve a instalar encima.")
    text = {key: value.decode("utf-8").replace("\r\n", "\n") for key, value in original.items()}
    text["backend/app/models.py"] += read_payload("models_append.txt")
    main = text["backend/app/main.py"]
    main = patch_once(main,
        "from .routers import dashboard as vetmap_admin_dashboard_v8",
        "from .routers import delivery as vetmap_delivery_v26  # VETMAP V26\nfrom .routers import dashboard as vetmap_admin_dashboard_v8",
        "main.py import router")
    main = patch_once(main,
        "app.include_router(store.manager_router)",
        "app.include_router(store.manager_router)\napp.include_router(vetmap_delivery_v26.router)  # VETMAP V26",
        "main.py incluir router")
    text["backend/app/main.py"] = main

    store = text["backend/app/routers/store.py"]
    store = patch_once(store,
        "    StoreOrderStatusHistory,\n)",
        "    StoreOrderStatusHistory,\n    DeliveryAssignment,  # VETMAP V26\n)",
        "store.py import modelo")
    store = patch_once(store,
        "    current_index = ORDER_AUTO_INDEX.get(\n        order.status\n    )",
        "    # VETMAP V26: los pedidos asignados requieren confirmación real del reparto.\n    if db.query(DeliveryAssignment.id).filter(DeliveryAssignment.order_id == order.id).first():\n        return False\n\n    current_index = ORDER_AUTO_INDEX.get(\n        order.status\n    )",
        "store.py desactivar simulación en asignaciones")
    store = patch_once(store,
        "    if order.status in STORE_FINAL_ORDER_STATUSES:\n        raise HTTPException(",
        "    # VETMAP V26: entregas asignadas se finalizan desde Repartidores.\n    if db.query(DeliveryAssignment.id).filter(DeliveryAssignment.order_id == order.id).first():\n        raise HTTPException(400, 'Gestiona este pedido desde Repartidores; ya tiene un despacho asignado.')\n\n    if order.status in STORE_FINAL_ORDER_STATUSES:\n        raise HTTPException(",
        "store.py bloquear pedidos asignados en vista antigua")
    text["backend/app/routers/store.py"] = store

    api = text["web/src/api.js"]
    text["web/src/api.js"] = patch_once(api,
        "// ADMINISTRADOR - USUARIOS",
        read_payload("api_functions.txt") + "// ADMINISTRADOR - USUARIOS",
        "web api.js")

    page = text["web/src/main.jsx"]
    page = patch_once(page,
        'import "./vetmap_tienda_v24.css";',
        'import "./vetmap_tienda_v24.css";\nimport "./vetmap_repartidores_v26.css"; // VETMAP V26',
        "web import CSS")
    page = patch_once(page,
        '  getStoreOrders,\n',
        '  getStoreOrders,\n  getStoreDeliveryDrivers, createStoreDeliveryDriver, setStoreDeliveryDriverActive,\n  getStoreDeliveryAssignments, assignStoreDeliveryOrder, updateStoreDeliveryAssignment, // VETMAP V26\n',
        "web import API")
    page = patch_once(page,
        '  const [storeOrders, setStoreOrders] = useState([]);',
        '  const [storeOrders, setStoreOrders] = useState([]);\n  // VETMAP V26: estado aislado de Repartidores (Tienda).\n  const [deliveryDrivers, setDeliveryDrivers] = useState([]);\n  const [deliveryAssignments, setDeliveryAssignments] = useState([]);\n  const [deliveryDriverForm, setDeliveryDriverForm] = useState({ name: "", phone: "" });\n  const [deliverySelectedDriver, setDeliverySelectedDriver] = useState({});\n  const [deliveryIncidentNotes, setDeliveryIncidentNotes] = useState({});\n  const [deliveryIncidentOpen, setDeliveryIncidentOpen] = useState({});\n  const [deliveryBusy, setDeliveryBusy] = useState(false);',
        "web state hooks")
    page = patch_once(page,
        '  function marketplaceCategories() {',
        read_payload("jsx_functions.txt") + '  function marketplaceCategories() {',
        "web actions")
    nav_anchor = '                      <button type="button" className={memberSection === "storeHistory" ? "active" : ""} onClick={() => setMemberSection("storeHistory")}>'
    nav_insert = """                      {/* VETMAP V26 - menú Repartidores */}
                      <button type="button" className={memberSection === "storeDelivery" ? "active" : ""} onClick={() => { setMemberSection("storeDelivery"); loadStoreData(); loadDeliveryData(); }}>
                        <svg className="vm-v24-store-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="13" height="11" rx="2"/><path d="M15 11h4l3 3v4h-7M6 18a2 2 0 1 0 4 0m7 0a2 2 0 1 0 4 0"/></svg>
                        <span>Repartidores</span>
                      </button>
"""
    page = patch_once(page, nav_anchor, nav_insert+nav_anchor, "web nav")
    page = patch_once(page,
        '              {currentUser.role === "store" &&\n                memberSection === "storeHistory" && (',
        read_payload("jsx_section.txt") + '              {currentUser.role === "store" &&\n                memberSection === "storeHistory" && (',
        "web sección Repartidores")
    text["web/src/main.jsx"] = page

    # The original files' newline conventions are retained, avoiding huge Git diffs.
    result = {name: preserve_bytes(text[name], original[name]) for name in touched}
    result[fresh[0]] = read_payload("delivery.py").encode("utf-8")
    result[fresh[1]] = read_payload("vetmap_repartidores_v26.css").encode("utf-8")
    return original, result, fresh


def main():
    parser = argparse.ArgumentParser(description=VERSION)
    parser.add_argument("--check", action="store_true", help="Verifica anclas sin escribir archivos")
    args = parser.parse_args()
    root = find_root(Path(__file__).resolve().parent)
    original, updates, fresh = prepare(root)
    print("VetMap V26: todas las anclas de código verificadas.")
    if args.check:
        print("MODO PRUEBA: nada fue modificado.")
        return
    date = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    backup = root / "respaldos_instaladores" / f"antes_repartidores_v26_{date}"
    backup.mkdir(parents=True, exist_ok=False)
    manifest = {"version": VERSION, "files": []}
    for name, data in updates.items():
        existed = name in original
        if existed:
            target = backup / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(original[name])
        manifest["files"].append({"path": name, "existed": existed, "installed_sha256": sha(data),
                                  "before_sha256": sha(original[name]) if existed else None})
    (backup / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    written = []
    try:
        for name, data in updates.items():
            atomic_write(root/name, data)
            written.append(name)
    except Exception:
        for name in reversed(written):
            if name in original:
                atomic_write(root/name, original[name])
            else:
                (root/name).unlink(missing_ok=True)
        raise
    print("VETMAP V26 INSTALADO: Repartidores en el rol Tienda.")
    print("Tablas nuevas: delivery_drivers, delivery_assignments (creadas al iniciar backend).")
    print("Respaldo de código:", backup)
    print("No se alteraron datos de PostgreSQL.")
    print("Siguiente: iniciar FastAPI, abrir web e ingresar a Tienda > Repartidores.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("ERROR: " + str(exc), file=sys.stderr)
        sys.exit(1)
