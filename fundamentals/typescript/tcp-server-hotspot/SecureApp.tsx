// SecureApp.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import { RNCamera } from 'react-native-camera';
import CryptoJS from 'crypto-js';

// Simulation de Diffie-Hellman avec crypto-js
class SecureChannelRN {
  private sharedSecret: string | null = null;
  private myPrivateKey: string;
  private myPublicKey: string;
  private encryptionKey: string | null = null;
  private hmacKey: string | null = null;
  
  // Prime et générateur (simplifiés pour React Native)
  private prime = '23';
  private generator = '5';

  constructor() {
    // Générer une clé privée aléatoire
    this.myPrivateKey = Math.floor(Math.random() * 1000000).toString();
    
    // Calculer la clé publique: g^a mod p
    this.myPublicKey = this.modPow(
      parseInt(this.generator),
      parseInt(this.myPrivateKey),
      parseInt(this.prime)
    ).toString();
  }

  // Calcul modulaire: (base^exp) mod modulus
  private modPow(base: number, exp: number, modulus: number): number {
    if (modulus === 1) return 0;
    let result = 1;
    base = base % modulus;
    while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % modulus;
      exp = Math.floor(exp / 2);
      base = (base * base) % modulus;
    }
    return result;
  }

  getPublicKey(): string {
    // En production, utiliser une vraie clé DH encodée en base64
    return CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(this.myPublicKey + ':' + this.prime + ':' + this.generator)
    );
  }

  computeSharedSecret(otherPublicKeyB64: string): void {
    try {
      // Décoder la clé publique de l'autre partie
      const decoded = CryptoJS.enc.Base64.parse(otherPublicKeyB64).toString(CryptoJS.enc.Utf8);
      const parts = decoded.split(':');
      const otherPublicKey = parts[0];
      
      // Calculer le secret partagé: (B^a) mod p
      const shared = this.modPow(
        parseInt(otherPublicKey),
        parseInt(this.myPrivateKey),
        parseInt(this.prime)
      );
      
      // Dériver les clés de chiffrement et HMAC
      this.sharedSecret = shared.toString();
      const keyMaterial = CryptoJS.PBKDF2(this.sharedSecret, 'secure-channel-salt', {
        keySize: 512 / 32,
        iterations: 1000
      });
      
      this.encryptionKey = keyMaterial.toString().substring(0, 64);
      this.hmacKey = keyMaterial.toString().substring(64, 128);
    } catch (error) {
      console.error('Erreur calcul secret partagé:', error);
    }
  }

  encrypt(data: string): string {
    if (!this.encryptionKey || !this.hmacKey) {
      throw new Error('Secret partagé non établi');
    }

    // Générer un IV aléatoire
    const iv = CryptoJS.lib.WordArray.random(128 / 8);
    
    // Chiffrer avec AES
    const encrypted = CryptoJS.AES.encrypt(data, 
      CryptoJS.enc.Hex.parse(this.encryptionKey),
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    
    const message = iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
    
    // Calculer HMAC
    const hmac = CryptoJS.HmacSHA256(message, CryptoJS.enc.Hex.parse(this.hmacKey))
      .toString(CryptoJS.enc.Base64);
    
    return hmac + ':' + message;
  }

  decrypt(encryptedData: string): string {
    if (!this.encryptionKey || !this.hmacKey) {
      throw new Error('Secret partagé non établi');
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Format invalide');
    }

    const [receivedHmac, ivB64, encrypted] = parts;
    const message = ivB64 + ':' + encrypted;
    
    // Vérifier HMAC
    const calculatedHmac = CryptoJS.HmacSHA256(message, CryptoJS.enc.Hex.parse(this.hmacKey))
      .toString(CryptoJS.enc.Base64);
    
    if (receivedHmac !== calculatedHmac) {
      throw new Error('HMAC invalide - message corrompu');
    }
    
    // Déchiffrer
    const iv = CryptoJS.enc.Base64.parse(ivB64);
    const decrypted = CryptoJS.AES.decrypt(encrypted,
      CryptoJS.enc.Hex.parse(this.encryptionKey),
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  isSecure(): boolean {
    return this.sharedSecret !== null && this.encryptionKey !== null;
  }

  getFingerprint(): string {
    return CryptoJS.SHA256(this.getPublicKey()).toString().substring(0, 16);
  }
}

interface Message {
  id: string;
  text: string;
  type: 'sent' | 'received' | 'system' | 'secure';
  timestamp: number;
}

export default function SecureApp() {
  const [scanning, setScanning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [secure, setSecure] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [manualHost, setManualHost] = useState('');
  const [manualPort, setManualPort] = useState('8888');
  const [clientId, setClientId] = useState('');
  
  const socketRef = useRef<any>(null);
  const channelRef = useRef<SecureChannelRN>(new SecureChannelRN());
  const scrollViewRef = useRef<ScrollView>(null);

  const addMessage = (text: string, type: Message['type']) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      text,
      type,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const initiateKeyExchange = () => {
    if (!socketRef.current) return;
    
    addMessage('🔐 Initiation de l\'échange de clés...', 'secure');
    
    const publicKey = channelRef.current.getPublicKey();
    const fingerprint = channelRef.current.getFingerprint();
    
    const keyExchangeMsg = {
      type: 'key_exchange_init',
      publicKey: publicKey,
      fingerprint: fingerprint,
      timestamp: Date.now()
    };
    
    socketRef.current.write(JSON.stringify(keyExchangeMsg));
  };

  const connectToServer = (host: string, port: number) => {
    if (socketRef.current) {
      socketRef.current.destroy();
    }

    setConnecting(true);
    addMessage(`Connexion à ${host}:${port}...`, 'system');

    try {
      const socket = TcpSocket.createConnection({ host, port, timeout: 5000 });

      socket.on('connect', () => {
        setConnected(true);
        setConnecting(false);
        addMessage('✓ Connecté au serveur!', 'system');
      });

      socket.on('data', (data: any) => {
        const message = data.toString();
        
        try {
          const parsed = JSON.parse(message);
          
          if (parsed.type === 'connected') {
            setClientId(parsed.clientId);
            addMessage(parsed.message, 'system');
            
            // Initier automatiquement l'échange de clés
            setTimeout(() => initiateKeyExchange(), 500);
            
          } else if (parsed.type === 'key_exchange_response') {
            addMessage('🔐 Clé publique reçue du serveur', 'secure');
            
            // Calculer le secret partagé
            channelRef.current.computeSharedSecret(parsed.publicKey);
            
            addMessage(`🔐 Fingerprint serveur: ${parsed.fingerprint}`, 'secure');
            
            // Confirmer que l'échange est terminé
            const completeMsg = {
              type: 'key_exchange_complete',
              timestamp: Date.now()
            };
            socketRef.current.write(JSON.stringify(completeMsg));
            
            setSecure(true);
            addMessage('🔒 Canal sécurisé établi! Tous les messages sont chiffrés.', 'secure');
            
          } else if (parsed.type === 'secure_message') {
            try {
              const decrypted = channelRef.current.decrypt(parsed.encrypted);
              const originalMsg = JSON.parse(decrypted);
              
              if (originalMsg.type === 'welcome') {
                addMessage('🔒 ' + originalMsg.message, 'secure');
              } else if (originalMsg.type === 'message') {
                addMessage(originalMsg.data, 'received');
              } else if (originalMsg.type === 'ack') {
                addMessage('✓ ' + originalMsg.message, 'system');
              }
            } catch (error: any) {
              addMessage('⚠️ Erreur déchiffrement: ' + error.message, 'system');
            }
            
          } else if (parsed.type === 'error') {
            addMessage('✗ ' + parsed.message, 'system');
          }
          
        } catch (error) {
          addMessage(message, 'received');
        }
      });

      socket.on('error', (error: any) => {
        setConnected(false);
        setSecure(false);
        setConnecting(false);
        addMessage(`✗ Erreur: ${error.message}`, 'system');
        Alert.alert('Erreur', error.message);
      });

      socket.on('close', () => {
        setConnected(false);
        setSecure(false);
        setConnecting(false);
        addMessage('Déconnecté du serveur', 'system');
      });

      socketRef.current = socket;
    } catch (error: any) {
      setConnecting(false);
      addMessage(`✗ Erreur: ${error.message}`, 'system');
    }
  };

  const sendMessage = () => {
    if (!socketRef.current || !connected || !inputText.trim()) return;

    if (!secure) {
      Alert.alert('Attention', 'La connexion n\'est pas encore sécurisée. Veuillez attendre.');
      return;
    }

    try {
      const message = {
        type: 'message',
        data: inputText.trim(),
        timestamp: Date.now()
      };
      
      const messageStr = JSON.stringify(message);
      const encrypted = channelRef.current.encrypt(messageStr);
      
      const secureMsg = {
        type: 'secure_message',
        encrypted: encrypted,
        timestamp: Date.now()
      };
      
      socketRef.current.write(JSON.stringify(secureMsg));
      addMessage(inputText, 'sent');
      setInputText('');
    } catch (error: any) {
      Alert.alert('Erreur', `Impossible d'envoyer: ${error.message}`);
    }
  };

  const handleQRCodeScan = (event: any) => {
    if (!scanning) return;
    
    try {
      const data = JSON.parse(event.data);
      setScanning(false);
      
      Alert.alert(
        'QR Code scanné',
        `Se connecter à ${data.tcp.host}:${data.tcp.port}?\n\n🔐 Chiffrement: ${data.encryption}`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Connecter',
            onPress: () => connectToServer(data.tcp.host, data.tcp.port)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'QR Code invalide');
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.destroy();
      socketRef.current = null;
    }
    setConnected(false);
    setSecure(false);
    channelRef.current = new SecureChannelRN();
    addMessage('Déconnexion...', 'system');
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (scanning) {
    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.camera}
          onBarCodeRead={handleQRCodeScan}
          captureAudio={false}
        />
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setScanning(false)}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TCP Client Sécurisé</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, connected && styles.statusDotConnected]} />
            <Text style={styles.statusText}>
              {connected ? 'Connecté' : connecting ? 'Connexion...' : 'Déconnecté'}
            </Text>
          </View>
          {connected && (
            <View style={styles.statusContainer}>
              <Text style={styles.secureIndicator}>
                {secure ? '🔒 Sécurisé' : '⚠️ Non sécurisé'}
              </Text>
            </View>
          )}
        </View>
        {clientId && <Text style={styles.clientId}>ID: {clientId}</Text>}
      </View>

      {!connected && !connecting && (
        <View style={styles.connectionPanel}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setScanning(true)}
          >
            <Text style={styles.scanButtonText}>📷 Scanner QR Code</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>ou</Text>

          <View style={styles.manualInput}>
            <TextInput
              style={styles.input}
              placeholder="IP du serveur"
              value={manualHost}
              onChangeText={setManualHost}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, styles.portInput]}
              placeholder="Port"
              value={manualPort}
              onChangeText={setManualPort}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => connectToServer(manualHost, parseInt(manualPort))}
            disabled={!manualHost || !manualPort}
          >
            <Text style={styles.connectButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      )}

      {connecting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Connexion en cours...</Text>
        </View>
      )}

      {connected && (
        <>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.message,
                  msg.type === 'sent' && styles.messageSent,
                  msg.type === 'system' && styles.messageSystem,
                  msg.type === 'secure' && styles.messageSecure,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.type === 'sent' && styles.messageTextSent,
                    msg.type === 'system' && styles.messageTextSystem,
                    msg.type === 'secure' && styles.messageTextSecure,
                  ]}
                >
                  {msg.text}
                </Text>
                <Text style={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder={secure ? "Message chiffré..." : "Attente sécurisation..."}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              editable={secure}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || !secure) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || !secure}
            >
              <Text style={styles.sendButtonText}>
                {secure ? '🔒' : '⏳'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
            <Text style={styles.disconnectButtonText}>Déconnecter</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ccc', marginRight: 8 },
  statusDotConnected: { backgroundColor: '#4CAF50' },
  statusText: { fontSize: 14, color: '#666' },
  secureIndicator: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
  clientId: { fontSize: 12, color: '#999', marginTop: 4 },
  connectionPanel: { padding: 20 },
  scanButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  scanButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  orText: { textAlign: 'center', color: '#999', marginVertical: 16, fontSize: 16 },
  manualInput: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  portInput: { flex: 0.3 },
  connectButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  connectButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16 },
  message: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, maxWidth: '80%' },
  messageSent: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  messageSystem: { backgroundColor: '#f0f0f0', alignSelf: 'center', maxWidth: '90%' },
  messageSecure: { backgroundColor: '#E8F5E9', alignSelf: 'center', maxWidth: '90%', borderWidth: 1, borderColor: '#4CAF50' },
  messageText: { fontSize: 16, color: '#333' },
  messageTextSent: { color: '#fff' },
  messageTextSystem: { color: '#666', fontSize: 14, textAlign: 'center' },
  messageTextSecure: { color: '#2E7D32', fontSize: 13, textAlign: 'center' },
  timestamp: { fontSize: 10, color: '#999', marginTop: 4 },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', gap: 8 },
  messageInput: { flex: 1, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 20, fontSize: 16 },
  sendButton: { backgroundColor: '#007AFF', paddingHorizontal: 20, borderRadius: 20, justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#ccc' },
  sendButtonText: { fontSize: 24 },
  disconnectButton: { backgroundColor: '#fff', padding: 12, margin: 16, borderRadius: 8, borderWidth: 1, borderColor: '#FF3B30', alignItems: 'center' },
  disconnectButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
  camera: { flex: 1 },
  cancelButton: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 16, borderRadius: 8 },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});