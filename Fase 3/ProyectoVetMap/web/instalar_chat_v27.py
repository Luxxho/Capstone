"""Instalador VetMap V27: ejecutar desde carpeta ProyectoVetMap.

Requiere que los archivos incluidos en este ZIP estén junto al instalador.
No cambia .env, mobile/eas.json ni los datos de PostgreSQL.
"""
from pathlib import Path
from datetime import datetime
import shutil
import sys
import py_compile

root=Path.cwd()
source=Path(__file__).resolve().parent
required=['backend/app/models.py','backend/app/main.py','web/src/main.jsx','mobile/components/ui.jsx','mobile/app/_layout.jsx','mobile/app/login.jsx','mobile/app/index.jsx']
missing=[p for p in required if not (root/p).is_file()]
if missing:
    sys.exit('No se encontro la estructura de VetMap. Abre PowerShell en la raiz ProyectoVetMap. Faltan: '+', '.join(missing))
if 'class ChatConversation(Base):' in (root/'backend/app/models.py').read_text(encoding='utf-8'):
    sys.exit('La V27 ya aparece instalada en models.py. No se repetiran los cambios.')

def replace_one(text,old,new,path):
    count=text.count(old)
    if count!=1:
        raise RuntimeError(f'No coincide la estructura esperada de {path}: {old[:85]!r} ({count} coincidencias). No se hizo ningun cambio.')
    return text.replace(old,new,1)

changes={}
def edit(rel,func):
    old=(root/rel).read_text(encoding='utf-8')
    new=func(old)
    if new==old:raise RuntimeError('No hay cambios en '+rel)
    changes[rel]=new

def models(txt):
    txt=replace_one(txt,'    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)\n    last_login_at:',
        '''    delivery_driver_id: Mapped[int | None] = mapped_column(ForeignKey("delivery_drivers.id", ondelete="SET NULL"), nullable=True, index=True)\n\n    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)\n    last_login_at:''','models.py')
    txt+='''\n\n# VetMap V27 - conversaciones y mensajes\nclass ChatConversation(Base):\n    __tablename__ = "chat_conversations"\n    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)\n    kind: Mapped[str] = mapped_column(String(20), nullable=False, index=True)\n    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)\n    target_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)\n    order_id: Mapped[int | None] = mapped_column(ForeignKey("store_orders.id", ondelete="CASCADE"), nullable=True, index=True)\n    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)\n    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)\n\nclass ChatMessage(Base):\n    __tablename__ = "chat_messages"\n    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)\n    conversation_id: Mapped[int] = mapped_column(ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False, index=True)\n    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)\n    body: Mapped[str] = mapped_column(String(1000), nullable=False)\n    eta_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)\n    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)\n'''
    return txt
edit('backend/app/models.py',models)

def main(txt):
    txt=replace_one(txt,'from .routers import delivery as vetmap_delivery_v26', 'from .routers import chat as vetmap_chat_v27\nfrom .routers import delivery as vetmap_delivery_v26','main.py')
    txt=replace_one(txt,'    # Actividad de usuarios para el Inicio del administrador.', '''    connection.execute(\n        text("ALTER TABLE users ADD COLUMN IF NOT EXISTS delivery_driver_id INTEGER REFERENCES delivery_drivers(id) ON DELETE SET NULL")\n    )\n\n    # Actividad de usuarios para el Inicio del administrador.''','main.py')
    txt=replace_one(txt,'app.include_router(vetmap_delivery_v26.router)', 'app.include_router(vetmap_chat_v27.router)\napp.include_router(vetmap_delivery_v26.router)', 'main.py')
    return txt
edit('backend/app/main.py',main)

def web(txt):
    txt=replace_one(txt,'import React, { useEffect, useRef, useState } from "react";', 'import React, { useEffect, useRef, useState } from "react";\nimport VetMapChat from "./components/VetMapChat";', 'web main.jsx')
    # La ultima etiqueta main pertenece al retorno principal de App.
    marker='    </main>\n  );\n}\n\nReactDOM.createRoot'
    txt=replace_one(txt,marker,'      <VetMapChat token={token} user={currentUser} />\n    </main>\n  );\n}\n\nReactDOM.createRoot','web main.jsx')
    return txt
edit('web/src/main.jsx',web)

def layout(txt):
    txt=replace_one(txt,'  "admin",\n]);','  "admin",\n  "driver",\n]);','mobile _layout')
    txt=replace_one(txt,'  if (role === "admin") return "/admin";', '  if (role === "admin") return "/admin";\n  if (role === "driver") return "/driver";', 'mobile _layout')
    return txt
edit('mobile/app/_layout.jsx',layout)
for rel in ['mobile/app/login.jsx','mobile/app/index.jsx']:
    edit(rel,lambda txt,rel=rel:replace_one(txt,'  if (role === "admin") return "/admin";', '  if (role === "admin") return "/admin";\n  if (role === "driver") return "/driver";',rel))

def mobile_ui(txt):
    return replace_one(txt,'          {showAccountActions && user ? (\n            <View style={styles.headerActions}>', '''          {showAccountActions && user ? (\n            <View style={styles.headerActions}>\n              {["owner", "vet", "store", "driver"].includes(user.role) ? (\n                <TouchableOpacity\n                  activeOpacity={0.82}\n                  onPress={() => { setRoleMenuOpen(false); router.push("/common/chat"); }}\n                  style={styles.notificationButton}\n                  accessibilityLabel="Abrir mensajes"\n                >\n                  <Text style={{fontSize:22}}>💬</Text>\n                </TouchableOpacity>\n              ) : null}''','mobile UI')
edit('mobile/components/ui.jsx',mobile_ui)

newfiles={'backend/app/routers/chat.py':'chat.py',
          'web/src/components/VetMapChat.jsx':'VetMapChat.jsx',
          'web/src/components/VetMapChat.css':'VetMapChat.css',
          'mobile/app/common/chat.jsx':'mobile_chat.jsx',
          'mobile/app/driver/index.jsx':'mobile_driver.jsx'}
for dest,src in newfiles.items():
    if (root/dest).exists():raise RuntimeError(f'Archivo ya existe: {dest}. No se sobrescribira.')
    changes[dest]=(source/src).read_text(encoding='utf-8')

# Verificacion de sintaxis antes de tocar el proyecto.
for rel in ('backend/app/models.py','backend/app/main.py','backend/app/routers/chat.py'):
    compile(changes[rel],rel,'exec')

backup=root/('respaldo_antes_chat_v27_'+datetime.now().strftime('%Y%m%d_%H%M%S'))
for rel in changes:
    p=root/rel
    if p.exists():
        saved=backup/rel
        saved.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(p,saved)
try:
    for rel,content in changes.items():
        p=root/rel
        p.parent.mkdir(parents=True,exist_ok=True)
        p.write_text(content,encoding='utf-8')
except Exception:
    for rel in changes:
        old=backup/rel
        if old.exists():shutil.copy2(old,root/rel)
        else:(root/rel).unlink(missing_ok=True)
    raise
print('\nVETMAP V27 - ARCHIVOS INSTALADOS')
for p in changes:print(' +',p)
print('\nRespaldo original:',backup)
print('No se modificaron tus .env ni mobile/eas.json. Conserva el respaldo por seguridad.')
print('Reinicia backend, web y Expo para tomar los cambios. La BD se actualiza al iniciar el backend.')
