import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {Screen,MenuCard,COLORS} from '../../components/ui';
import {router} from 'expo-router';
import {useAuth} from '../../context/AuthContext';
export default function DriverHome(){const {user}=useAuth();return <Screen title="Repartidor VetMap" subtitle={`Hola, ${user?.name||'Repartidor'}`} showBottomNav={false}>
  <View style={styles.card}><Text style={styles.title}>Comunicación con clientes</Text><Text>Consulta los chats de tus pedidos asignados y comunica cualquier demora. La estimación de llegada se informa manualmente y no sustituye el seguimiento en vivo.</Text></View>
  <MenuCard icon="✉" title="Abrir mensajes" text="Responder y comunicar hora estimada de llegada" onPress={()=>router.push('/common/chat')}/>
</Screen>}
const styles=StyleSheet.create({card:{padding:16,backgroundColor:'white',borderRadius:12,marginBottom:16},title:{color:COLORS.navy,fontWeight:'800',fontSize:18,marginBottom:8}})
