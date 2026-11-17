import React, { useEffect, useRef, useState } from 'react';
import './VetMapChat.css';
import './VetMapChatDelete.css';

const API = 'http://localhost:8000/api/chat';
async function req(token, path, method='GET', body) {
  const r = await fetch(API + path, {method, headers:{Authorization:`Bearer ${token}`, ...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.detail || 'No se pudo conectar con el chat');
  return data;
}

function ChatIcon({ size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8.6 8.6 0 0 1-3.2-.6L4 20l1.6-5.1a8.1 8.1 0 0 1-.6-3.4 7.5 7.5 0 0 1 7.5-7.5 7.5 7.5 0 0 1 7.5 7.5Z" />
    <path d="M9 11.5h7M9 14.5h4" />
  </svg>;
}

function DeleteIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
  </svg>;
}

function formatMessageTimestamp(value) {
  if(typeof value!=='string'||!value.trim())return null;
  let iso=value.trim().replace(' ','T');
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/i.test(iso))return null;
  iso=iso.replace(/z$/i,'Z').replace(/([+-]\d{2})(\d{2})$/,'$1:$2');
  iso=iso.replace(/\.(\d+)(?=Z|[+-]|$)/,(_,digits)=>'.'+digits.slice(0,3).padEnd(3,'0'));
  // El backend guarda created_at con datetime.utcnow(), sin sufijo de zona.
  if(!/(Z|[+-]\d{2}:\d{2})$/.test(iso))iso+='Z';
  const date=new Date(iso);
  if(Number.isNaN(date.getTime()))return null;
  const pad=number=>String(number).padStart(2,'0');
  return {
    iso:date.toISOString(),
    label:`${pad(date.getDate())}/${pad(date.getMonth()+1)}/${date.getFullYear()} · ${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function MessageTime({value}) {
  const stamp=formatMessageTimestamp(value);
  if(!stamp)return null;
  return <time className="vmchat-message-time" dateTime={stamp.iso}>{stamp.label}</time>;
}

export default function VetMapChat({token, user}) {
  const [open,setOpen]=useState(false), [threads,setThreads]=useState([]), [active,setActive]=useState(null);
  const [messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[error,setError]=useState('');
  const [type,setType]=useState('store'),[targets,setTargets]=useState([]),[target,setTarget]=useState('');
  const [driverIds,setDriverIds]=useState([]),[driverId,setDriverId]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [eta,setEta]=useState('');
  const [deletingId,setDeletingId]=useState(null);
  const activeChatId=useRef(null), messageSequence=useRef(0), deletedMessageIds=useRef(new Set()), deleteBusy=useRef(false);
  function chooseThread(chat) {
    activeChatId.current=chat?.id ?? null;
    messageSequence.current+=1;
    setActive(chat);
    setMessages([]);
  }
  async function removeMessage(message) {
    const chatId=activeChatId.current;
    if(!chatId || message.sender_id!==user?.id || deleteBusy.current) return;
    if(!window.confirm('¿Eliminar este mensaje? Se eliminará del chat para ambos participantes.')) return;
    deleteBusy.current=true;
    setDeletingId(message.id);
    try {
      await req(token,`/conversations/${chatId}/messages/${message.id}`,'DELETE');
      deletedMessageIds.current.add(message.id);
      setMessages(current=>current.filter(item=>item.id!==message.id));
      setError('');
      try { await load(); }
      catch { setError('El mensaje se eliminó, pero no se pudo actualizar la lista de conversaciones.'); }
    } catch(e) { setError(e.message); }
    finally { deleteBusy.current=false;setDeletingId(null); }
  }
  const role=user?.role;
  async function load() { if(!token) return; const data=await req(token,'/conversations');setThreads(data); }
  async function loadMessages(id) {
    if(activeChatId.current!==id)return;
    const sequence=++messageSequence.current;
    const data=await req(token,`/conversations/${id}/messages`);
    if(activeChatId.current===id && sequence===messageSequence.current) {
      setMessages(data.filter(message=>!deletedMessageIds.current.has(message.id)));
    }
  }
  useEffect(()=>{chooseThread(null);setThreads([]);setDraft('');setEta('');setError('');deletedMessageIds.current.clear();},[token,user?.id]);
  useEffect(()=>{if(!open||!token)return;load().catch(e=>setError(e.message));const t=setInterval(()=>{load().catch(()=>{});if(active)loadMessages(active.id).catch(()=>{});},5000);return()=>clearInterval(t)},[open,token,active?.id]);
  useEffect(()=>{if(!open||role!=='owner')return;const ctrl=new AbortController();fetch('http://localhost:8000/api/'+(type==='store'?'storefront/stores':type==='vet'?'reservations/clinics':'storefront/orders'),{headers:{Authorization:`Bearer ${token}`},signal:ctrl.signal}).then(r=>r.json()).then(d=>setTargets(Array.isArray(d)?d:(d.items||d.orders||[]))).catch(()=>setTargets([]));return()=>ctrl.abort()},[open,token,role,type]);
  useEffect(()=>{if(!open||role!=='store')return;req(token,'/drivers/unlinked').then(setDriverIds).catch(()=>{})},[open,token,role]);
  async function start(e){e.preventDefault();try{let payload=type==='delivery'?{kind:type,order_id:Number(target)}:{kind:type,target_id:Number(target)};let c=await req(token,'/conversations','POST',payload);chooseThread(c);setError('');await load();await loadMessages(c.id)}catch(e){setError(e.message)}}
  async function send(e){e.preventDefault();if(!active||!draft.trim())return;try{const payload={body:draft.trim(),...(role==='driver'&&active.kind==='delivery'&&eta?{eta_minutes:Number(eta)}:{})};await req(token,`/conversations/${active.id}/messages`,'POST',payload);setDraft('');setEta('');await loadMessages(active.id);await load();setError('')}catch(e){setError(e.message)}}
  async function makeDriver(e){e.preventDefault();try{await req(token,`/drivers/${Number(driverId)}/account`,'POST',{email,password});setEmail('');setPassword('');setDriverId('');setDriverIds(await req(token,'/drivers/unlinked'));setError('Cuenta creada; el repartidor puede iniciar sesión con su correo y contraseña.')}catch(e){setError(e.message)}}
  if(!token||!['owner','store','vet','driver'].includes(role))return null;
  return <div className="vmchat">
    <button type="button" className="vmchat-launch" onClick={()=>setOpen(!open)} aria-label={open?'Cerrar chat de VetMap':'Abrir mensajes de VetMap'}><ChatIcon size={19}/><span>{open?'Cerrar':'Mensajes'}</span></button>
    {open&&<section className="vmchat-panel" aria-label="Mensajes de VetMap">
      <div className="vmchat-header"><strong><span className="vmchat-header-icon"><ChatIcon size={21}/></span><span>Mensajes <span className="vmchat-brand">VetMap</span></span></strong><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar ventana de mensajes">×</button></div>
      {error&&<p className="vmchat-error" role="status">{error}</p>}
      {!active?<>
        {role==='owner'&&<form className="vmchat-form" onSubmit={start}>
          <label>Conversar con</label><select value={type} onChange={e=>{setType(e.target.value);setTarget('')}}><option value="store">Tienda</option><option value="vet">Veterinaria</option><option value="delivery">Repartidor (pedido)</option></select>
          <select required value={target} onChange={e=>setTarget(e.target.value)}><option value="">Seleccionar…</option>{targets.map(t=><option key={t.id} value={t.id}>{type==='delivery'?`Pedido #${t.id}`:t.name}</option>)}</select>
          <button disabled={!target}>Iniciar conversación</button>
        </form>}
        {role==='store'&&driverIds.length>0&&<details className="vmchat-form"><summary>Crear acceso de repartidor</summary><form onSubmit={makeDriver}><select required value={driverId} onChange={e=>setDriverId(e.target.value)}><option value="">Elegir repartidor</option>{driverIds.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select><input type="email" placeholder="Correo del repartidor" required value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Contraseña inicial (mín. 8)" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/><button>Crear cuenta</button></form></details>}
        <div className="vmchat-list">{threads.map(t=><button key={t.id} onClick={()=>{chooseThread(t);loadMessages(t.id).catch(e=>setError(e.message))}}><strong>{t.title}</strong><small><span className="vmchat-type">{t.kind==='delivery'?'Repartidor':t.kind==='vet'?'Veterinaria':'Tienda'}</span>{t.last_message||'Conversación nueva'}</small></button>)}{threads.length===0&&<p>No tienes conversaciones todavía.</p>}</div>
      </>:<>
        <div className="vmchat-back"><button onClick={()=>chooseThread(null)}>← Volver</button><strong>{active.title}</strong></div>
        <div className="vmchat-messages">
          {messages.length===0&&<p className="vmchat-empty">No hay mensajes en esta conversación.</p>}
          {messages.map(m=><div key={m.id} className={'vmchat-bubble '+(m.sender_id===user.id?'mine':'other')}>
            <span>{m.body}</span>
            {m.eta_minutes&&<small>Llegada estimada: {m.eta_minutes} min (informada por el repartidor)</small>}
            <div className="vmchat-message-meta">
              <MessageTime value={m.created_at}/>
              {m.sender_id===user.id&&<button type="button" className="vmchat-delete" disabled={deletingId!==null} onClick={()=>removeMessage(m)} aria-label="Eliminar mensaje" title={deletingId===m.id?'Eliminando mensaje...':'Eliminar mensaje'} aria-busy={deletingId===m.id}><DeleteIcon/></button>}
            </div>
          </div>)}
        </div>
        <form className="vmchat-send" onSubmit={send}>{role==='driver'&&active.kind==='delivery'&&<input type="number" min="1" max="1440" placeholder="ETA en minutos (opcional)" value={eta} onChange={e=>setEta(e.target.value)}/>}<div><input maxLength={1000} required value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Escribe tu mensaje..."/><button>Enviar</button></div></form>
      </>}
      <footer>Se actualiza cada 5 segundos · ETA informativa, sin GPS en vivo</footer>
    </section>}
  </div>
}
