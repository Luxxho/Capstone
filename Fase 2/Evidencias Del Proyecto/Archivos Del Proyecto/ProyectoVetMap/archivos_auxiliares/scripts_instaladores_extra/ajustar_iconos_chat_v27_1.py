# VetMap V27.1 - Cambios visuales del chat. Sin cambios de BD ni backend.
from pathlib import Path
from datetime import datetime
import shutil
import sys

root = Path(__file__).resolve().parent
paths = [
    'web/src/components/VetMapChat.jsx',
    'web/src/components/VetMapChat.css',
    'mobile/app/common/chat.jsx',
    'mobile/app/driver/index.jsx',
    'mobile/components/ui.jsx',
]
missing = [p for p in paths if not (root / p).is_file()]
if missing:
    sys.exit('No se encontro VetMap V27 en esta carpeta. Faltan: ' + ', '.join(missing))

changes = {rel: (root / rel).read_text(encoding='utf-8') for rel in paths}

def replace_once(rel, before, after):
    old = changes[rel]
    count = old.count(before)
    if count != 1:
        sys.exit(f'No se hicieron cambios: archivo {rel} inesperado. Coincidencias: {count} para {before[:65]!r}')
    changes[rel] = old.replace(before, after, 1)

web = 'web/src/components/VetMapChat.jsx'
replace_once(web, 'export default function VetMapChat({token, user}) {', '''function ChatIcon({ size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8.6 8.6 0 0 1-3.2-.6L4 20l1.6-5.1a8.1 8.1 0 0 1-.6-3.4 7.5 7.5 0 0 1 7.5-7.5 7.5 7.5 0 0 1 7.5 7.5Z" />
    <path d="M9 11.5h7M9 14.5h4" />
  </svg>;
}

export default function VetMapChat({token, user}) {''')
replace_once(web,
    '''<button type="button" className="vmchat-launch" onClick={()=>setOpen(!open)} aria-label="Abrir chat de VetMap">💬 {open?'Cerrar':'Mensajes'}</button>''',
    '''<button type="button" className="vmchat-launch" onClick={()=>setOpen(!open)} aria-label={open?'Cerrar chat de VetMap':'Abrir mensajes de VetMap'}><ChatIcon size={19}/><span>{open?'Cerrar':'Mensajes'}</span></button>''')
replace_once(web,
    '''<header><strong>💬 Mensajes VetMap</strong><button onClick={()=>setOpen(false)}>✕</button></header>''',
    '''<div className="vmchat-header"><strong><span className="vmchat-header-icon"><ChatIcon size={21}/></span><span>Mensajes <span className="vmchat-brand">VetMap</span></span></strong><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar ventana de mensajes">×</button></div>''')
replace_once(web,
    "{t.kind==='delivery'?'🚚 ':t.kind==='vet'?'🩺 ':'🏪 '}{t.last_message||'Conversación nueva'}",
    "<span className=\"vmchat-type\">{t.kind==='delivery'?'Repartidor':t.kind==='vet'?'Veterinaria':'Tienda'}</span>{t.last_message||'Conversación nueva'}")
replace_once(web,
    '🚚 Estimación: {m.eta_minutes} min (informada por repartidor)',
    'Llegada estimada: {m.eta_minutes} min (informada por el repartidor)')

css='web/src/components/VetMapChat.css'
if 'VetMap V27.1:' in changes[css]:
    sys.exit('Este ajuste de iconos ya fue aplicado. No se haran cambios.')
changes[css] += '''
/* VetMap V27.1: iconos lineales y encabezado aislado del resto de la web. */
.vmchat-launch { display:inline-flex; align-items:center; justify-content:center; gap:9px; font-family:inherit; }
.vmchat-launch svg { flex-shrink:0; }
.vmchat-panel .vmchat-header { display:flex; align-items:center; justify-content:space-between; padding:15px; min-height:65px; box-sizing:border-box; background:#e9f7f2; border-bottom:1px solid #d7ebe4; }
.vmchat-panel .vmchat-header strong { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:800; color:#102a56; letter-spacing:0; }
.vmchat-panel .vmchat-header strong::before, .vmchat-panel .vmchat-header strong::after, .vmchat-panel .vmchat-header::before, .vmchat-panel .vmchat-header::after { content:none !important; display:none !important; }
.vmchat-header-icon { color:#078f8a; background:white; border:1px solid #cce6de; border-radius:11px; width:37px; height:37px; display:grid; place-items:center; flex-shrink:0; }
.vmchat-brand { color:#078f8a; }
.vmchat-panel .vmchat-header button { border:0; background:transparent; color:#078f8a; cursor:pointer; font-size:24px; line-height:1; font-weight:400; padding:3px 6px; border-radius:8px; }
.vmchat-panel .vmchat-header button:hover { background:#d8ece7; }
.vmchat-type { display:inline-block; margin-right:7px; padding:2px 7px; border-radius:6px; background:#edf7f3; color:#176859; font-size:11px; font-weight:700; }
'''

mobile='mobile/app/common/chat.jsx'
for before,after in [
    ('title="💬 Mensajes"','title="Mensajes"'),
    ('🏪 Tienda','Tienda'),
    ('🩺 Veterinaria','Veterinaria'),
    ('🚚 Repartidor','Repartidor'),
    ('🚚 Llega en aproximadamente','Llega en aproximadamente'),
]:
    replace_once(mobile,before,after)

mobile_driver='mobile/app/driver/index.jsx'
replace_once(mobile_driver,'title="🚚 Repartidor VetMap"','title="Repartidor VetMap"')
replace_once(mobile_driver,'icon="💬" title="Abrir mensajes"','icon="✉" title="Abrir mensajes"')

ui='mobile/components/ui.jsx'
replace_once(ui,'<Text style={{fontSize:22}}>💬</Text>','<Text style={{fontSize:23,color:COLORS.navy}}>✉</Text>')

# Solo se guardan cambios cuando todo coincide; respaldo antes de escribir.
backup=root/('respaldo_iconos_chat_v27_1_'+datetime.now().strftime('%Y%m%d_%H%M%S'))
for rel in paths:
    p=backup/rel
    p.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(root/rel,p)
try:
    for rel in paths:
        (root/rel).write_text(changes[rel],encoding='utf-8')
except Exception:
    for rel in paths:
        shutil.copy2(backup/rel,root/rel)
    raise
print('\nVETMAP V27.1 - ICONOS ACTUALIZADOS CORRECTAMENTE')
print('Se ajusto el chat web y movil. No se modificaron backend, PostgreSQL, .env ni conexiones.')
print('Respaldo original:',backup)
print('Recarga la web con Ctrl+F5. Para la app, reinicia Expo.')
