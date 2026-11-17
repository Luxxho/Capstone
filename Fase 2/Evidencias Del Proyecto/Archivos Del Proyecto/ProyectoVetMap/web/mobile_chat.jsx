import React, {useEffect, useState} from 'react';
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet} from 'react-native';
import {Screen,COLORS} from '../../components/ui';
import {useAuth} from '../../context/AuthContext';
import {API_URL} from '../../services/api';

const endpoint=API_URL+'/api/chat';
async function request(token,path,method='GET',body){
  const response=await fetch(endpoint+path,{method,headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(typeof data.detail==='string'?data.detail:'Error al cargar mensajes');
  return data;
}
function Action({children,onPress,disabled=false}){return <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.action,disabled&&{opacity:0.4}]}><Text style={styles.actionText}>{children}</Text></TouchableOpacity>}
export default function Chats(){
  const {token,user}=useAuth();const role=user?.role;
  const [threads,setThreads]=useState([]),[active,setActive]=useState(null),[messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[error,setError]=useState('');
  const [kind,setKind]=useState('store'),[targets,setTargets]=useState([]),[target,setTarget]=useState('');
  const [drivers,setDrivers]=useState([]),[driver,setDriver]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[eta,setEta]=useState('');
  async function refresh(){if(!token)return;setThreads(await request(token,'/conversations'));if(active)setMessages(await request(token,`/conversations/${active.id}/messages`));}
  useEffect(()=>{refresh().catch(e=>setError(e.message));const t=setInterval(()=>refresh().catch(()=>{}),5000);return()=>clearInterval(t)},[token,active?.id]);
  useEffect(()=>{if(role!=='owner'||!token)return;const url=kind==='store'?'/api/storefront/stores':kind==='vet'?'/api/reservations/clinics':'/api/storefront/orders';fetch(API_URL+url,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(d=>setTargets(Array.isArray(d)?d:(d.items||d.orders||[]))).catch(()=>setTargets([]));},[role,kind,token]);
  useEffect(()=>{if(role==='store'&&token)request(token,'/drivers/unlinked').then(setDrivers).catch(()=>{});},[role,token]);
  async function openThread(c){setActive(c);setMessages(await request(token,`/conversations/${c.id}/messages`));}
  async function start(){try{const c=await request(token,'/conversations','POST',kind==='delivery'?{kind,order_id:Number(target)}:{kind,target_id:Number(target)});await openThread(c);await refresh();setError('');}catch(e){setError(e.message)}}
  async function send(){if(!draft.trim())return;try{await request(token,`/conversations/${active.id}/messages`,'POST',{body:draft.trim(),...(role==='driver'&&active.kind==='delivery'&&eta?{eta_minutes:Number(eta)}:{})});setDraft('');setEta('');await refresh();setError('');}catch(e){setError(e.message)}}
  async function addDriver(){try{await request(token,`/drivers/${Number(driver)}/account`,'POST',{email,password});setDrivers(await request(token,'/drivers/unlinked'));setEmail('');setPassword('');setDriver('');setError('Cuenta creada. El repartidor puede ingresar con sus credenciales.')}catch(e){setError(e.message)}}
  return <Screen title="💬 Mensajes" subtitle="Habla con tiendas, veterinarias y repartidores" back backTo={role==='driver'?'/driver':`/${role||'login'}`} showBottomNav={false}>
    {error?<Text style={styles.error}>{error}</Text>:null}
    {!active?<>
      {role==='owner'&&<View style={styles.card}>
        <Text style={styles.title}>Nueva conversación</Text><View style={styles.row}>{[['store','🏪 Tienda'],['vet','🩺 Veterinaria'],['delivery','🚚 Repartidor']].map(([v,n])=><TouchableOpacity key={v} onPress={()=>{setKind(v);setTarget('')}} style={[styles.chip,kind===v&&styles.selected]}><Text>{n}</Text></TouchableOpacity>)}</View>
        <Text>Selecciona {kind==='delivery'?'un pedido':'un establecimiento'}:</Text>{targets.map(t=><TouchableOpacity key={t.id} onPress={()=>setTarget(String(t.id))} style={[styles.pick,target===String(t.id)&&styles.selected]}><Text>{kind==='delivery'?`Pedido #${t.id}`:t.name}</Text></TouchableOpacity>)}
        <Action disabled={!target} onPress={start}>Iniciar chat</Action>
      </View>}
      {role==='store'&&drivers.length>0&&<View style={styles.card}><Text style={styles.title}>Crear cuenta de repartidor</Text>{drivers.map(d=><TouchableOpacity key={d.id} style={[styles.pick,driver===String(d.id)&&styles.selected]} onPress={()=>setDriver(String(d.id))}><Text>{d.name}</Text></TouchableOpacity>)}<TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Correo del repartidor" autoCapitalize="none" keyboardType="email-address"/><TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Contraseña inicial (mín. 8)" secureTextEntry/><Action disabled={!driver||!email.includes('@')||password.length<8} onPress={addDriver}>Crear cuenta</Action></View>}
      <Text style={styles.title}>Conversaciones</Text>{threads.map(c=><TouchableOpacity key={c.id} style={styles.card} onPress={()=>openThread(c).catch(e=>setError(e.message))}><Text style={styles.title}>{c.title}</Text><Text style={styles.muted}>{c.last_message||'Sin mensajes aún'}</Text></TouchableOpacity>)}{threads.length===0&&<Text style={styles.muted}>Todavía no tienes conversaciones.</Text>}
    </>:<View style={styles.card}><Action onPress={()=>{setActive(null);setMessages([])}}>← Volver a conversaciones</Action><Text style={styles.title}>{active.title}</Text>
      <ScrollView style={{maxHeight:380}}>{messages.map(m=><View key={m.id} style={[styles.bubble,m.sender_id===user?.id?styles.mine:styles.theirs]}><Text>{m.body}</Text>{m.eta_minutes?<Text style={styles.muted}>🚚 Llega en aproximadamente {m.eta_minutes} minutos (estimación del repartidor)</Text>:null}</View>)}</ScrollView>
      {role==='driver'&&active.kind==='delivery'&&<TextInput style={styles.input} keyboardType="number-pad" value={eta} onChangeText={setEta} placeholder="Minutos estimados (opcional)"/>}
      <TextInput style={styles.input} multiline maxLength={1000} value={draft} onChangeText={setDraft} placeholder="Escribe tu mensaje..."/><Action disabled={!draft.trim()} onPress={send}>Enviar mensaje</Action><Text style={styles.muted}>Actualización cada 5 segundos. No es GPS en vivo.</Text>
    </View>}
  </Screen>;
}
const styles=StyleSheet.create({card:{backgroundColor:'#fff',borderRadius:15,padding:14,marginBottom:12,gap:8,borderWidth:1,borderColor:'#d8e7e3'},title:{fontWeight:'800',fontSize:16,color:COLORS.navy,marginBottom:6},row:{flexDirection:'row',gap:5,flexWrap:'wrap'},chip:{padding:7,backgroundColor:'#e9f7f2',borderRadius:10},selected:{borderWidth:2,borderColor:'#078f8a',backgroundColor:'#dff8f5'},pick:{padding:9,backgroundColor:'#f4f8f7',borderRadius:9},input:{padding:11,borderWidth:1,borderColor:'#c5d9d3',borderRadius:10,backgroundColor:'white',color:COLORS.navy},action:{backgroundColor:'#078f8a',padding:12,borderRadius:10,alignItems:'center',marginTop:5},actionText:{color:'white',fontWeight:'800'},muted:{color:COLORS.muted,fontSize:12},bubble:{padding:12,borderRadius:12,marginVertical:4,maxWidth:'85%'},mine:{backgroundColor:'#dff8f5',alignSelf:'flex-end'},theirs:{backgroundColor:'#eef1f6',alignSelf:'flex-start'},error:{color:'#a33',marginBottom:9}});
