import React, {useEffect,useRef,useState} from 'react';
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Alert,Platform} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {API_URL} from '../services/api';

const COLORS={navy:'#102A56',muted:'#526A63'};
const endpoint=API_URL+'/api/chat';
async function request(token,path,method='GET',body){
  const response=await fetch(endpoint+path,{method,headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(typeof data.detail==='string'?data.detail:'Error al cargar mensajes');
  return data;
}
function Action({children,onPress,disabled=false}){return <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.action,disabled&&{opacity:0.4}]}><Text style={styles.actionText}>{children}</Text></TouchableOpacity>}
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
  return <Text style={styles.messageTime}>{stamp.label}</Text>;
}

function DeleteIcon() {
  return <View style={styles.trashIcon} pointerEvents="none" accessible={false}>
    <View style={styles.trashHandle}/>
    <View style={styles.trashLid}/>
    <View style={styles.trashCan}>
      <View style={styles.trashLineLeft}/><View style={styles.trashLineRight}/>
    </View>
  </View>;
}

export function useChatController(enabled=true){
  const {token,user}=useAuth();const role=user?.role;
  const [threads,setThreads]=useState([]),[active,setActive]=useState(null),[messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[error,setError]=useState('');
  const [kind,setKind]=useState('store'),[targets,setTargets]=useState([]),[target,setTarget]=useState('');
  const [drivers,setDrivers]=useState([]),[driver,setDriver]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[eta,setEta]=useState('');
  const [deletingId,setDeletingId]=useState(null);
  const activeChatId=useRef(null), messageSequence=useRef(0), deletedMessageIds=useRef(new Set()), deleteBusy=useRef(false);
  function closeThread(){activeChatId.current=null;messageSequence.current+=1;setActive(null);setMessages([]);}
  async function loadMessages(id){
    if(activeChatId.current!==id)return;
    const sequence=++messageSequence.current;
    const data=await request(token,`/conversations/${id}/messages`);
    if(activeChatId.current===id && sequence===messageSequence.current) setMessages(data.filter(message=>!deletedMessageIds.current.has(message.id)));
  }
  async function removeMessage(message,chatId){
    if(!chatId || message.sender_id!==user?.id || deleteBusy.current)return;
    deleteBusy.current=true;setDeletingId(message.id);
    try{
      await request(token,`/conversations/${chatId}/messages/${message.id}`,'DELETE');
      deletedMessageIds.current.add(message.id);
      setMessages(current=>current.filter(item=>item.id!==message.id));setError('');
      try{setThreads(await request(token,'/conversations'));}
      catch{setError('El mensaje se eliminó, pero no se pudo actualizar la lista de conversaciones.');}
    }catch(e){setError(e.message);}
    finally{deleteBusy.current=false;setDeletingId(null);}
  }
  function confirmDelete(message){
    const chatId=activeChatId.current;
    if(!chatId || message.sender_id!==user?.id || deleteBusy.current)return;
    if(Platform.OS==='web'){
      if(typeof globalThis.confirm==='function'&&globalThis.confirm('¿Eliminar este mensaje? Se eliminará del chat para ambos participantes.'))return removeMessage(message,chatId);
      return;
    }
    Alert.alert('¿Eliminar este mensaje?','Se eliminará del chat para ambos participantes.',[
      {text:'Cancelar',style:'cancel'},
      {text:'Eliminar',style:'destructive',onPress:()=>removeMessage(message,chatId)},
    ]);
  }
  async function refresh(){if(!enabled||!token)return;setThreads(await request(token,'/conversations'));const id=activeChatId.current;if(id)await loadMessages(id);}
  useEffect(()=>{closeThread();setThreads([]);setDraft('');setEta('');setError('');deletedMessageIds.current.clear();},[token,user?.id]);
  useEffect(()=>{if(!enabled||!token)return;refresh().catch(e=>setError(e.message));const t=setInterval(()=>refresh().catch(()=>{}),5000);return()=>clearInterval(t)},[token,active?.id,enabled]);
  useEffect(()=>{if(!enabled||role!=='owner'||!token)return;const ctrl=new AbortController();const url=kind==='store'?'/api/storefront/stores':kind==='vet'?'/api/reservations/clinics':'/api/storefront/orders';fetch(API_URL+url,{headers:{Authorization:`Bearer ${token}`},signal:ctrl.signal}).then(r=>r.json()).then(d=>{if(!ctrl.signal.aborted)setTargets(Array.isArray(d)?d:(d.items||d.orders||[]));}).catch(()=>{if(!ctrl.signal.aborted)setTargets([]);});return()=>ctrl.abort();},[role,kind,token,enabled]);
  useEffect(()=>{let current=true;if(enabled&&role==='store'&&token)request(token,'/drivers/unlinked').then(data=>{if(current)setDrivers(data);}).catch(()=>{});return()=>{current=false;};},[role,token,enabled]);
  async function openThread(c){activeChatId.current=c.id;messageSequence.current+=1;setActive(c);setMessages([]);await loadMessages(c.id);}
  async function start(){try{const c=await request(token,'/conversations','POST',kind==='delivery'?{kind,order_id:Number(target)}:{kind,target_id:Number(target)});await openThread(c);await refresh();setError('');}catch(e){setError(e.message)}}
  async function send(){if(!draft.trim())return;try{await request(token,`/conversations/${active.id}/messages`,'POST',{body:draft.trim(),...(role==='driver'&&active.kind==='delivery'&&eta?{eta_minutes:Number(eta)}:{})});setDraft('');setEta('');await refresh();setError('');}catch(e){setError(e.message)}}
  async function addDriver(){try{await request(token,`/drivers/${Number(driver)}/account`,'POST',{email,password});setDrivers(await request(token,'/drivers/unlinked'));setEmail('');setPassword('');setDriver('');setError('Cuenta creada. El repartidor puede ingresar con sus credenciales.')}catch(e){setError(e.message)}}
  return {role,user,threads,active,messages,draft,error,kind,targets,target,drivers,driver,email,password,eta,deletingId,
    setKind,setTarget,setDriver,setEmail,setPassword,setEta,setDraft,setError,openThread,start,send,addDriver,closeThread,confirmDelete};
}

export function ChatBody({controller,floating=false}) {
  const {role,user,threads,active,messages,draft,error,kind,targets,target,drivers,driver,email,password,eta,deletingId,
    setKind,setTarget,setDriver,setEmail,setPassword,setEta,setDraft,openThread,start,send,addDriver,closeThread,confirmDelete}=controller;
  const messageList=useRef(null);
  const ListContainer=floating?ScrollView:View;
  const listProps=floating?{style:styles.list,contentContainerStyle:styles.listContent,keyboardShouldPersistTaps:'handled'}:{};
  return <View style={floating?styles.content:undefined}>
    {error?<Text style={styles.error} accessibilityRole="alert">{error}</Text>:null}
    {!active?<ListContainer {...listProps}>
      {role==='owner'&&<View style={styles.card}>
        <Text style={styles.title}>Nueva conversación</Text><View style={styles.row}>{[['store','Tienda'],['vet','Veterinaria'],['delivery','Repartidor']].map(([v,n])=><TouchableOpacity key={v} onPress={()=>{setKind(v);setTarget('')}} style={[styles.chip,kind===v&&styles.selected]}><Text>{n}</Text></TouchableOpacity>)}</View>
        <Text>Selecciona {kind==='delivery'?'un pedido':'un establecimiento'}:</Text>{targets.map(t=><TouchableOpacity key={t.id} onPress={()=>setTarget(String(t.id))} style={[styles.pick,target===String(t.id)&&styles.selected]}><Text>{kind==='delivery'?`Pedido #${t.id}`:t.name}</Text></TouchableOpacity>)}
        <Action disabled={!target} onPress={start}>Iniciar chat</Action>
      </View>}
      {role==='store'&&drivers.length>0&&<View style={styles.card}><Text style={styles.title}>Crear cuenta de repartidor</Text>{drivers.map(d=><TouchableOpacity key={d.id} style={[styles.pick,driver===String(d.id)&&styles.selected]} onPress={()=>setDriver(String(d.id))}><Text>{d.name}</Text></TouchableOpacity>)}<TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Correo del repartidor" autoCapitalize="none" keyboardType="email-address"/><TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Contraseña inicial (mín. 8)" secureTextEntry/><Action disabled={!driver||!email.includes('@')||password.length<8} onPress={addDriver}>Crear cuenta</Action></View>}
      <Text style={styles.title}>Conversaciones</Text>{threads.map(c=><TouchableOpacity key={c.id} style={styles.card} onPress={()=>openThread(c).catch(e=>controller.setError(e.message))}><Text style={styles.title}>{c.title}</Text><Text style={styles.muted}>{c.last_message||'Sin mensajes aún'}</Text></TouchableOpacity>)}{threads.length===0&&<Text style={styles.muted}>Todavía no tienes conversaciones.</Text>}
    </ListContainer>:<View style={[styles.card,floating&&styles.activePanel]}>
      <Action onPress={closeThread}>← Volver a conversaciones</Action><Text style={styles.title}>{active.title}</Text>
      <ScrollView ref={messageList} style={floating?styles.messages:{maxHeight:380}} keyboardShouldPersistTaps="handled" onContentSizeChange={floating?()=>messageList.current?.scrollToEnd({animated:false}):undefined}>
        {messages.length===0&&<Text style={styles.muted}>No hay mensajes en esta conversación.</Text>}
        {messages.map(m=><View key={m.id} style={[styles.bubble,m.sender_id===user?.id?styles.mine:styles.theirs]}>
          <Text>{m.body}</Text>
          {m.eta_minutes?<Text style={styles.muted}>Llega en aproximadamente {m.eta_minutes} minutos (estimación del repartidor)</Text>:null}
          <View style={[styles.messageMeta,m.sender_id!==user?.id&&styles.messageMetaOther]}>
            <MessageTime value={m.created_at}/>
            {m.sender_id===user?.id&&<TouchableOpacity style={[styles.deleteButton,deletingId!==null&&styles.deleteDisabled]} disabled={deletingId!==null} onPress={()=>confirmDelete(m)} accessibilityRole="button" accessibilityLabel="Eliminar mensaje" accessibilityState={{disabled:deletingId!==null}}><DeleteIcon/></TouchableOpacity>}
          </View>
        </View>)}
      </ScrollView>
      <View style={floating?styles.composer:undefined}>
        {role==='driver'&&active.kind==='delivery'&&<TextInput style={styles.input} keyboardType="number-pad" value={eta} onChangeText={setEta} placeholder="Minutos estimados (opcional)"/>}
        <TextInput style={[styles.input,floating&&styles.composerInput]} multiline maxLength={1000} value={draft} onChangeText={setDraft} placeholder="Escribe tu mensaje..."/>
        <Action disabled={!draft.trim()} onPress={send}>Enviar mensaje</Action>
        <Text style={styles.muted}>{floating?'Mensajes actualizados automáticamente.':'Actualización cada 5 segundos. No es GPS en vivo.'}</Text>
      </View>
    </View>}
  </View>;
}

export default function ChatContent({enabled=true,floating=false}) {
  const controller=useChatController(enabled);
  return <ChatBody controller={controller} floating={floating}/>;
}

const styles=StyleSheet.create({content:{flex:1,minHeight:0},list:{flex:1,minHeight:0},listContent:{padding:12,paddingBottom:20},activePanel:{flex:1,minHeight:0,marginBottom:0,borderWidth:0,borderRadius:0,padding:12},messages:{flex:1,minHeight:0},composer:{flexShrink:0,gap:8},composerInput:{minHeight:44,maxHeight:88},card:{backgroundColor:'#fff',borderRadius:15,padding:14,marginBottom:12,gap:8,borderWidth:1,borderColor:'#d8e7e3'},title:{fontWeight:'800',fontSize:16,color:COLORS.navy,marginBottom:6},row:{flexDirection:'row',gap:5,flexWrap:'wrap'},chip:{padding:7,backgroundColor:'#e9f7f2',borderRadius:10},selected:{borderWidth:2,borderColor:'#078f8a',backgroundColor:'#dff8f5'},pick:{padding:9,backgroundColor:'#f4f8f7',borderRadius:9},input:{padding:11,borderWidth:1,borderColor:'#c5d9d3',borderRadius:10,backgroundColor:'white',color:COLORS.navy},action:{backgroundColor:'#078f8a',padding:12,borderRadius:10,alignItems:'center',marginTop:5},actionText:{color:'white',fontWeight:'800'},muted:{color:COLORS.muted,fontSize:12},bubble:{padding:12,borderRadius:12,marginVertical:4,maxWidth:'85%'},mine:{backgroundColor:'#dff8f5',alignSelf:'flex-end'},theirs:{backgroundColor:'#eef1f6',alignSelf:'flex-start'},messageMeta:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'flex-end',gap:6,marginTop:3},messageMetaOther:{justifyContent:'flex-start'},messageTime:{fontSize:11,lineHeight:15,color:'#526b6d',flexShrink:1},deleteButton:{width:32,height:32,padding:6,alignItems:'center',justifyContent:'center'},deleteDisabled:{opacity:0.5},trashIcon:{width:16,height:18},trashHandle:{position:'absolute',left:5,top:1,width:6,height:4,borderWidth:1.5,borderBottomWidth:0,borderColor:'#873d3b',borderTopLeftRadius:1,borderTopRightRadius:1},trashLid:{position:'absolute',left:1,top:5,width:14,height:1.5,backgroundColor:'#873d3b'},trashCan:{position:'absolute',left:3,top:6,width:10,height:11,borderWidth:1.5,borderTopWidth:0,borderColor:'#873d3b',borderBottomLeftRadius:2,borderBottomRightRadius:2},trashLineLeft:{position:'absolute',left:1.5,top:2,width:1,height:6,backgroundColor:'#873d3b'},trashLineRight:{position:'absolute',right:1.5,top:2,width:1,height:6,backgroundColor:'#873d3b'},error:{color:'#a33',marginBottom:9}});

