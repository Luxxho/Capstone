import React from 'react';
import {KeyboardAvoidingView,Modal,Platform,SafeAreaView,StyleSheet,Text,TouchableOpacity,useWindowDimensions,View} from 'react-native';
import {ChatBody,useChatController} from './ChatContent';

export default function FloatingChatWindow({visible,onClose}) {
  const chat=useChatController(visible);
  const {height}=useWindowDimensions();
  const panelHeight=Math.min(560,Math.round(height*0.75));
  return (
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS==='ios'?'padding':'height'}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.positioner}>
            <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar chat al tocar fuera" />
            <View style={[styles.panel,{height:panelHeight}]} accessibilityViewIsModal>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title} accessibilityRole="header">Mensajes</Text>
                  <Text style={styles.subtitle}>VetMap</Text>
                </View>
                <TouchableOpacity style={styles.close} activeOpacity={0.75} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar ventana de mensajes">
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>
              <ChatBody controller={chat} floating />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles=StyleSheet.create({
  overlay:{flex:1,backgroundColor:'rgba(16,42,86,0.10)'},
  safeArea:{flex:1},
  positioner:{flex:1,justifyContent:'flex-end',alignItems:'flex-end',padding:12},
  panel:{width:'100%',maxWidth:420,maxHeight:'100%',flexShrink:1,backgroundColor:'#F5FCFB',borderRadius:20,borderWidth:1,borderColor:'#D8E7E3',overflow:'hidden',shadowColor:'#102A56',shadowOpacity:0.22,shadowRadius:18,shadowOffset:{width:0,height:6},elevation:24},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:10,paddingLeft:16,paddingRight:8,backgroundColor:'#078F8A',flexShrink:0},
  title:{fontSize:18,fontWeight:'800',color:'#FFFFFF'},
  subtitle:{fontSize:11,color:'#DFF8F5',marginTop:1},
  close:{width:44,height:44,alignItems:'center',justifyContent:'center',borderRadius:22},
  closeText:{fontSize:30,lineHeight:32,color:'#FFFFFF'},
});
