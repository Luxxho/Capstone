import React, { useEffect, useState } from 'react';
import './VetMapChat.css';

const API = 'http://localhost:8000/api/chat';
async function req(token, path, method='GET', body) {
  const r = await fetch(API + path, {method, headers:{Authorization:`Bearer ${token}`, ...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.detail || 'No se pudo conectar con el chat');
  return data;
}

export default function VetMapChat({token, user}) {
  const [open,setOpen]=useState(false), [threads,setThreads]=useState([]), [active,setActive]=useState(null);
  const [messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[error,setError]=useState('');
  const [type,setType]=useState('store'),[targets,setTargets]=useState([]),[target,setTarget]=useState('');
  const [driverIds,setDriverIds]=useState([]),[driverId,setDriverId]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [eta,setEta]=useState('');
  const role=user?.role;
  async function load() { if(!token) return; const data=await req(token,'/conversations');setThreads(data); }
  async function loadMessages(id) {const data=await req(token,`/conversations/${id}/messages`);setMessages(data);}
  useEffect(()=>{if(!open||!token)return;load().catch(e=>setError(e.message));const t=setInterval(()=>{load().catch(()=>{});if(active)loadMessages(active.id).catch(()=>{});},5000);return()=>clearInterval(t)},[open,token,active?.id]);
  useEffect(()=>{if(!open||role!=='owner')return;const ctrl=new AbortController();fetch('http://localhost:8000/api/'+(type==='store'?'storefront/stores':type==='vet'?'reservations/clinics':'storefront/orders'),{headers:{Authorization:`Bearer ${token}`},signal:ctrl.signal}).then(r=>r.json()).then(d=>setTargets(Array.isArray(d)?d:(d.items||d.orders||[]))).catch(()=>setTargets([]));return()=>ctrl.abort()},[open,token,role,type]);
  useEffect(()=>{if(!open||role!=='store')return;req(token,'/drivers/unlinked').then(setDriverIds).catch(()=>{})},[open,token,role]);
  async function start(e){e.preventDefault();try{let payload=type==='delivery'?{kind:type,order_id:Number(target)}:{kind:type,target_id:Number(target)};let c=await req(token,'/conversations','POST',payload);setActive(c);setMessages([]);setError('');await load();await loadMessages(c.id)}catch(e){setError(e.message)}}
  async function send(e){e.preventDefault();if(!active||!draft.trim())return;try{const payload={body:draft.trim(),...(role==='driver'&&active.kind==='delivery'&&eta?{eta_minutes:Number(eta)}:{})};await req(token,`/conversations/${active.id}/messages`,'POST',payload);setDraft('');setEta('');await loadMessages(active.id);await load();setError('')}catch(e){setError(e.message)}}
  async function makeDriver(e){e.preventDefault();try{await req(token,`/drivers/${Number(driverId)}/account`,'POST',{email,password});setEmail('');setPassword('');setDriverId('');setDriverIds(await req(token,'/drivers/unlinked'));setError('Cuenta creada; el repartidor puede iniciar sesión con su correo y contraseña.')}catch(e){setError(e.message)}}
  if(!token||!['owner','store','vet','driver'].includes(role))return null;
  return <div className="vmchat">
    <button type="button" className="vmchat-launch" onClick={()=>setOpen(!open)} aria-label="Abrir chat de VetMap">💬 {open?'Cerrar':'Mensajes'}</button>
    {open&&<section className="vmchat-panel" aria-label="Mensajes de VetMap">
      <header><strong>💬 Mensajes VetMap</strong><button onClick={()=>setOpen(false)}>✕</button></header>
      {error&&<p className="vmchat-error" role="status">{error}</p>}
      {!active?<>
        {role==='owner'&&<form className="vmchat-form" onSubmit={start}>
          <label>Conversar con</label><select value={type} onChange={e=>{setType(e.target.value);setTarget('')}}><option value="store">Tienda</option><option value="vet">Veterinaria</option><option value="delivery">Repartidor (pedido)</option></select>
          <select required value={target} onChange={e=>setTarget(e.target.value)}><option value="">Seleccionar…</option>{targets.map(t=><option key={t.id} value={t.id}>{type==='delivery'?`Pedido #${t.id}`:t.name}</option>)}</select>
          <button disabled={!target}>Iniciar conversación</button>
        </form>}
        {role==='store'&&driverIds.length>0&&<details className="vmchat-form"><summary>Crear acceso de repartidor</summary><form onSubmit={makeDriver}><select required value={driverId} onChange={e=>setDriverId(e.target.value)}><option value="">Elegir repartidor</option>{driverIds.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select><input type="email" placeholder="Correo del repartidor" required value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Contraseña inicial (mín. 8)" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/><button>Crear cuenta</button></form></details>}
        <div className="vmchat-list">{threads.map(t=><button key={t.id} onClick={()=>{setActive(t);loadMessages(t.id).catch(e=>setError(e.message))}}><strong>{t.title}</strong><small>{t.kind==='delivery'?'🚚 ':t.kind==='vet'?'🩺 ':'🏪 '}{t.last_message||'Conversación nueva'}</small></button>)}{threads.length===0&&<p>No tienes conversaciones todavía.</p>}</div>
      </>:<>
        <div className="vmchat-back"><button onClick={()=>setActive(null)}>← Volver</button><strong>{active.title}</strong></div>
        <div className="vmchat-messages">{messages.map(m=><div key={m.id} className={'vmchat-bubble '+(m.sender_id===user.id?'mine':'other')}><span>{m.body}</span>{m.eta_minutes&&<small>🚚 Estimación: {m.eta_minutes} min (informada por repartidor)</small>}</div>)}</div>
        <form className="vmchat-send" onSubmit={send}>{role==='driver'&&active.kind==='delivery'&&<input type="number" min="1" max="1440" placeholder="ETA en minutos (opcional)" value={eta} onChange={e=>setEta(e.target.value)}/>}<div><input maxLength={1000} required value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Escribe tu mensaje..."/><button>Enviar</button></div></form>
      </>}
      <footer>Se actualiza cada 5 segundos · ETA informativa, sin GPS en vivo</footer>
    </section>}
  </div>
}
