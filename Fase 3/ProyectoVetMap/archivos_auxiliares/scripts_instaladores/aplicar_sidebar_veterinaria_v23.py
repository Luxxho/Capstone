# -*- coding: utf-8 -*-
"""VetMap V23 - Sidebar azul oscuro para Veterinaria (sin alterar V22)."""
from pathlib import Path
from datetime import datetime
import hashlib
import json
import re
import shutil

STYLE_NAME = "vetmap_sidebar_veterinaria_v23.css"
STYLE_IMPORT = 'import "./vetmap_sidebar_veterinaria_v23.css";'
START = '                  {currentUser.role === "vet" ? ('
END = '                  ) : currentUser.role === "store" ? ('
NAV_OPEN = '<nav className={`vm-member-nav vm-member-nav--${currentUser.role}`}> '
NAV_OPEN_REAL = '<nav className={`vm-member-nav vm-member-nav--${currentUser.role}`}>'
NAV_NEW = '<nav className={`vm-member-nav vm-member-nav--${currentUser.role} ${currentUser.role === "vet" ? "vm-v23-vet-sidebar" : ""}`}>'

NAV_BLOCK = '                  {currentUser.role === "vet" ? (\n                    <>\n                      <button type="button" className={memberSection === "inicio" ? "active" : ""} onClick={() => { setMessage(""); setSelectedPet(null); setMemberSection("inicio"); }}>\n                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>\n                        <span>Inicio</span>\n                      </button>\n                      <button type="button" className={memberSection === "clinicAgenda" ? "active" : ""} onClick={() => setMemberSection("clinicAgenda")}>\n                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 18h3"/></svg>\n                        <span>Agenda</span>\n                      </button>\n                      <button type="button" className={memberSection === "clinicPatients" ? "active" : ""} onClick={() => setMemberSection("clinicPatients")}>\n                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 11a3 3 0 0 0 0-6M18 14a5 5 0 0 1 3 5v1"/></svg>\n                        <span>Pacientes</span>\n                      </button>\n                      <button type="button" title="Selecciona un paciente para consultar su historial si todavía no hay uno abierto" className={memberSection === "clinicHistory" ? "active" : ""} onClick={() => { if (clinicPatientHistory?.pet) { setMemberSection("clinicHistory"); } else { setMemberSection("clinicPatients"); } }}>\n                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 12h6m-3-3v6M9 18h6"/></svg>\n                        <span>Fichas clínicas</span>\n                      </button>\n                      <button type="button" className={memberSection === "clinicPrescriptions" ? "active" : ""} onClick={() => setMemberSection("clinicPrescriptions")}>\n                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM15 3v5h4M8 13h8M8 17h6"/></svg>\n                        <span>Recetas</span>\n                      </button>\n                      <div className="vm-v23-vet-separator" role="separator" aria-label="Herramientas veterinarias" />\n                      <button type="button" className={memberSection === "cuenta" && accountMode === "profile" ? "active" : ""} onClick={() => { setAccountMode("profile"); setMemberSection("cuenta"); }}>\n                        <svg className="vm-v23-vet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3v6a5 5 0 0 0 10 0V3M6 3H4v3a2 2 0 0 0 2 2m10-5h2v3a2 2 0 0 1-2 2m-5 6v2a4 4 0 0 0 8 0v-2m0 0a2 2 0 1 0 0 4"/></svg>\n                        <span>Servicios y perfil</span>\n                      </button>\n                    </>\n                  ) : currentUser.role === "store" ? ('
STYLE = '/* VETMAP V23 - SOLO EL MENU LATERAL DEL ROL VETERINARIA. */\n/* Los otros roles, la cabecera y los paneles V22 quedan intactos. */\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar {\n  background: #182f52 !important;\n  background-image: linear-gradient(180deg,#182e50 0%,#142845 100%) !important;\n  border: none !important;\n  border-right: 1px solid #223d64 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  padding: 18px 12px !important;\n  color: #f7faff !important;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar > .vm-member-brand,\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar > .vm-member-user {\n  display: none !important;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar > .vm-member-menu {\n  display: flex !important;\n  flex-direction: column !important;\n  align-items: stretch !important;\n  gap: 3px !important;\n  width: 100% !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  overflow-y: auto !important;\n  overflow-x: hidden !important;\n  background: transparent !important;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button {\n  display: flex !important;\n  flex-direction: row !important;\n  align-items: center !important;\n  justify-content: flex-start !important;\n  gap: 12px !important;\n  width: 100% !important;\n  min-height: 43px !important;\n  margin: 0 !important;\n  padding: 10px 12px !important;\n  color: #e8f1ff !important;\n  background: transparent !important;\n  background-image: none !important;\n  border: 1px solid transparent !important;\n  border-radius: 11px !important;\n  box-shadow: none !important;\n  text-align: left !important;\n  font-size: 12px !important;\n  font-weight: 700 !important;\n  line-height: 1.3 !important;\n  letter-spacing: 0 !important;\n  transition: background-color .17s ease, border-color .17s ease !important;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button::before,\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button::after {\n  content: none !important;\n  display: none !important;\n  mask-image: none !important;\n  -webkit-mask-image: none !important;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button .vm-v23-vet-icon {\n  display: block !important;\n  width: 19px !important;\n  height: 19px !important;\n  min-width: 19px !important;\n  flex: 0 0 19px !important;\n  color: #c6d6ee !important;\n  stroke: currentColor;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button > span {\n  display: inline !important;\n  color: inherit !important;\n  white-space: normal !important;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button:hover {\n  color: #fff !important;\n  background: #24466e !important;\n  border-color: #3a5b83 !important;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button.active {\n  color: #fff !important;\n  background: #2c5685 !important;\n  border: 1px solid #4177ae !important;\n  box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button.active .vm-v23-vet-icon,\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button:hover .vm-v23-vet-icon {\n  color: #fff !important;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button:focus-visible {\n  outline: 2px solid #8bd3ff !important;\n  outline-offset: 2px !important;\n}\n.vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > .vm-v23-vet-separator {\n  width: calc(100% - 18px) !important;\n  height: 1px !important;\n  min-height: 1px !important;\n  margin: 14px 9px !important;\n  border: 0 !important;\n  background: #3d5779 !important;\n}\n@media (min-width: 1100px) {\n  .vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar {\n    height: calc(100vh - 88px) !important;\n    min-height: 620px !important;\n    top: 73px !important;\n    position: sticky !important;\n  }\n}\n@media (max-width: 1099px) {\n  .vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar {\n    width: 100% !important;\n    min-height: 0 !important;\n    height: auto !important;\n    padding: 11px !important;\n  }\n  .vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar > .vm-member-menu {\n    display: flex !important;\n    flex-direction: row !important;\n    flex-wrap: wrap !important;\n    gap: 6px !important;\n  }\n  .vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > button {\n    width: auto !important;\n    min-width: 115px !important;\n  }\n  .vm-member-shell.vmh16-shell > nav.vm-member-nav--vet.vm-v23-vet-sidebar .vm-member-menu > .vm-v23-vet-separator {\n    display: none !important;\n  }\n}\n'


def root_dir():
    for loc in (Path.cwd(), Path(__file__).resolve().parent):
        for folder in (loc, *loc.parents):
            if (folder / 'web/src/main.jsx').is_file() and (folder / 'web/src/index.css').is_file():
                return folder
    raise SystemExit('ERROR: no encontré web/src/main.jsx ni index.css dentro de ProyectoVetMap.')


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def main():
    root = root_dir()
    target = root / 'web/src/main.jsx'
    css_path = root / 'web/src' / STYLE_NAME
    raw = target.read_bytes()
    bom = raw.startswith(b'\xef\xbb\xbf')
    text = raw.decode('utf-8-sig')
    newline = '\r\n' if b'\r\n' in raw else '\n'
    normalized = text.replace('\r\n', '\n')

    if 'vm-v23-vet-sidebar' in normalized or STYLE_IMPORT in normalized:
        if (normalized.count('vm-v23-vet-sidebar') == 1 and STYLE_IMPORT in normalized and
            css_path.is_file() and css_path.read_text(encoding='utf-8') == STYLE):
            print('V23 ya está instalada. No se duplicaron cambios.')
            return
        raise SystemExit('ERROR: encontré una instalación V23 modificada o incompleta. No sobreescribí nada.')
    if css_path.exists():
        raise SystemExit('ERROR: el CSS V23 ya existe y no voy a sobrescribirlo.')
    if normalized.count(START) != 1 or normalized.count(END) != 1:
        raise SystemExit('ERROR: la navegación del rol Veterinaria no coincide con VetMap V20/V21/V22. No modifiqué nada.')
    if normalized.count(NAV_OPEN_REAL) != 1:
        raise SystemExit('ERROR: no pude identificar la navegación principal de forma única. No modifiqué nada.')
    start = normalized.index(START)
    end = normalized.index(END, start) + len(END)
    current = normalized[start:end]
    if not all(name in current for name in ('clinicAgenda', 'clinicPatients', 'clinicPrescriptions')):
        raise SystemExit('ERROR: faltan opciones de Veterinaria originales. No modifiqué nada.')
    for needed in ['clinicPatientHistory', 'setMemberSection', 'setAccountMode', 'memberSection']:
        if needed not in normalized:
            raise SystemExit('ERROR: falta la referencia: '+needed+'. No modifiqué nada.')

    updated = normalized[:start] + NAV_BLOCK + normalized[end:]
    updated = updated.replace(NAV_OPEN_REAL, NAV_NEW, 1)
    imports = list(re.finditer(r'^import\s+["\'][^"\']+\.css["\'];?[ \t]*$', updated, re.M))
    if not imports:
        raise SystemExit('ERROR: no encontré imports de CSS. No modifiqué nada.')
    last = imports[-1]
    updated = updated[:last.end()] + '\n' + STYLE_IMPORT + updated[last.end():]
    out = (b'\xef\xbb\xbf' if bom else b'') + updated.replace('\n', newline).encode('utf-8')

    folder = root / 'respaldos_instaladores' / ('antes_sidebar_v23_' + datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
    folder.mkdir(parents=True)
    shutil.copy2(target, folder / 'main.jsx')
    shutil.copy2(root / 'web/src/index.css', folder / 'index.css')
    manifest = {
        'relative_main': 'web/src/main.jsx',
        'relative_css': 'web/src/' + STYLE_NAME,
        'main_before_sha256': sha256(raw),
        'main_after_sha256': sha256(out),
        'css_after_sha256': sha256(STYLE.encode('utf-8')),
        'index_css_modified': False,
        'css_existed': False,
    }
    (folder / 'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2), encoding='utf-8')

    tmp_main = target.with_name('.main_v23_tmp.jsx')
    tmp_style = css_path.with_name('.vetmap_sidebar_v23_tmp.css')
    try:
        tmp_main.write_bytes(out)
        tmp_style.write_text(STYLE,encoding='utf-8')
        tmp_main.replace(target)
        tmp_style.replace(css_path)
    except BaseException:
        shutil.copy2(folder / 'main.jsx', target)
        if css_path.exists() and sha256(css_path.read_bytes()) == manifest['css_after_sha256']:
            css_path.unlink()
        tmp_main.unlink(missing_ok=True)
        tmp_style.unlink(missing_ok=True)
        raise

    print('OK: Sidebar azul oscuro Veterinaria V23 instalada.')
    print('Respaldo:', folder)
    print('NO se modificó index.css, el inicio V22 ni otros roles.')
    print('Abre Veterinaria > Inicio y actualiza con Ctrl + F5.')


if __name__ == '__main__':
    main()
