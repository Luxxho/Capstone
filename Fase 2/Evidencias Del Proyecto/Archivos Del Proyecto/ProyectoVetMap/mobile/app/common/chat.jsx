import React from 'react';
import {Screen} from '../../components/ui';
import {useAuth} from '../../context/AuthContext';
import ChatContent from '../../components/ChatContent';

export default function Chats(){
  const {user}=useAuth();
  const role=user?.role;
  return <Screen title="Mensajes" subtitle="Habla con tiendas, veterinarias y repartidores" back backTo={role==='driver'?'/driver':`/${role||'login'}`} showBottomNav={false}>
    <ChatContent />
  </Screen>;
}
