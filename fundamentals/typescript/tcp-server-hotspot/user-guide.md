# 🔐 Guide d'Installation - Serveur TCP Sécurisé

## 🎯 Système de Sécurité

### Architecture de Chiffrement

```
Client                                    Serveur
  |                                          |
  |---- Échange de clés Diffie-Hellman ---->|
  |<--- Clé publique du serveur ------------|
  |                                          |
  |---- Secret partagé calculé --------------|
  |                                          |
  |==== Canal sécurisé AES-256 établi =======|
  |                                          |
  |---- Message chiffré + HMAC ------------->|
  |<--- Message chiffré + HMAC --------------|
```

**Sécurité:**
- 🔑 **Échange de clés**: Diffie-Hellman (2048-bit côté serveur)
- 🔒 **Chiffrement**: AES-256-CBC
- ✅ **Intégrité**: HMAC-SHA256
- 🔄 **IV unique**: Nouveau vecteur d'initialisation pour chaque message

## 📦 Installation du Serveur

### 1. Créer le projet

```bash
mkdir secure-tcp-server
cd secure-tcp-server

# Initialiser avec Bun
bun init
```

### 2. Installer les dépendances

```bash
bun add qrcode-terminal
bun add -d @types/node
```

### 3. Créer les fichiers

Créez deux fichiers:
- `crypto-utils.ts` - Module de chiffrement
- `secure-server.ts` - Serveur principal

### 4. Lancer le serveur

```bash
# Sans hotspot (via routeur uniquement)
bun secure-server.ts

# Avec hotspot virtuel
sudo $(which bun) secure-server.ts
```

## 📱 Installation de l'Application

### 1. Dépendances React Native

```bash
# Dans votre projet React Native
npm install react-native-tcp-socket
npm install react-native-camera
npm install react-native-permissions
npm install crypto-js
npm install --save-dev @types/crypto-js

# iOS
cd ios && pod install && cd ..
```

### 2. Configuration Android

**android/app/src/main/AndroidManifest.xml:**

```xml
<manifest>
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  <uses-permission android:name="android.permission.CAMERA" />
  
  <application
    android:usesCleartextTraffic="true">
    <!-- ... -->
  </application>
</manifest>
```

### 3. Configuration iOS

**ios/YourApp/Info.plist:**

```xml
<key>NSCameraUsageDescription</key>
<string>Scanner le QR code pour la connexion sécurisée</string>
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

## 🔄 Protocole d'Échange de Clés

### Étape 1: Connexion initiale

```javascript
// Le client se connecte
Client -> Serveur: TCP connect

// Le serveur répond
Serveur -> Client: {
  type: "connected",
  clientId: "client_xxx",
  message: "Connecté..."
}
```

### Étape 2: Initiation échange de clés

```javascript
// Le client envoie sa clé publique
Client -> Serveur: {
  type: "key_exchange_init",
  publicKey: "base64_encoded_public_key",
  fingerprint: "abc123...",
  timestamp: 1234567890
}
```

### Étape 3: Réponse du serveur

```javascript
// Le serveur envoie sa clé publique
Serveur -> Client: {
  type: "key_exchange_response",
  publicKey: "base64_encoded_public_key",
  fingerprint: "def456...",
  timestamp: 1234567890
}
```

### Étape 4: Confirmation

```javascript
// Les deux parties calculent le secret partagé
// Le client confirme
Client -> Serveur: {
  type: "key_exchange_complete",
  timestamp: 1234567890
}

// Canal sécurisé établi! 🔒
```

### Étape 5: Communication chiffrée

```javascript
// Tous les messages sont maintenant chiffrés
Client -> Serveur: {
  type: "secure_message",
  encrypted: "HMAC:IV:encrypted_data",
  timestamp: 1234567890
}
```

## 🔒 Format des Messages Chiffrés

Chaque message chiffré suit ce format:

```
HMAC:IV:ENCRYPTED_DATA
```

**Exemple:**
```
a7b3c9...:Zy8xQw...:k9mPqR...
  |         |          |
  |         |          └── Données chiffrées (AES-256-CBC)
  |         └───────────── Vecteur d'initialisation (16 bytes, base64)
  └─────────────────────── HMAC-SHA256 pour intégrité (base64)
```

## 🛡️ Sécurité en Détail

### Diffie-Hellman Key Exchange

```
Client                    Serveur
  a (privé)                 b (privé)
  A = g^a mod p             B = g^b mod p
  
  A ────────────────────►
  ◄────────────────────── B
  
  S = B^a mod p             S = A^b mod p
  
  (Même secret partagé S des deux côtés!)
```

### Dérivation de Clés (PBKDF2)

```
Secret Partagé (S)
       |
       ├─── PBKDF2 (100,000 iterations)
       |
       ├──► Clé de Chiffrement (32 bytes)
       └──► Clé HMAC (32 bytes)
```

### Chiffrement d'un Message

```
Message original
       |
       ├─── Générer IV aléatoire (16 bytes)
       |
       ├─── AES-256-CBC (Clé + IV)
       |
       └──► Message chiffré
               |
               ├─── Calculer HMAC (Message + HMAC Key)
               |
               └──► Message final: HMAC:IV:Encrypted
```

## 🧪 Tester la Sécurité

### Test 1: Sans échange de clés

```bash
# Le serveur rejettera les messages non chiffrés
echo '{"type":"message","data":"test"}' | nc localhost 8888
# Résultat: Ignoré ou erreur
```

### Test 2: Avec mauvais HMAC

```javascript
// Modifier le HMAC d'un message
const fakeMsg = "wrong_hmac:iv:encrypted";
// Résultat: "HMAC invalide - message corrompu"
```

### Test 3: Interception

```bash
# Capturer le trafic
tcpdump -i any port 8888
# Résultat: Données illisibles (chiffrées)
```

## 🚨 Dépannage

### Erreur "Secret partagé non établi"

**Cause:** L'échange de clés n'est pas terminé

**Solution:**
```javascript
// Attendre que secure === true avant d'envoyer
if (!secure) {
  console.log("Attente de la sécurisation...");
  return;
}
```

### Messages déchiffrés incorrectement

**Cause:** Les clés ne correspondent pas

**Solution:**
1. Vérifier les fingerprints des deux côtés
2. Redémarrer la connexion
3. Réinitialiser l'échange de clés

### HMAC invalide

**Cause:** Message corrompu ou clé incorrecte

**Solution:**
1. Vérifier la connexion réseau
2. S'assurer que l'échange de clés est complet
3. Redémarrer si nécessaire

## 📊 Monitoring

### Logs du serveur

```
🔐 Échange de clés initié par client_xxx
🔐 Clé publique envoyée à client_xxx (Fingerprint: abc123)
✓ Canal sécurisé établi avec client_xxx 🔒
→ Message déchiffré de client_xxx: Hello
```

### Logs de l'app

```
🔐 Initiation de l'échange de clés...
🔐 Clé publique reçue du serveur
🔐 Fingerprint serveur: def456
🔒 Canal sécurisé établi! Tous les messages sont chiffrés.
```

## ⚡ Performance

**Impact du chiffrement:**
- Latence ajoutée: ~5-10ms par message
- CPU: Négligeable pour <100 messages/seconde
- Mémoire: ~1KB par client connecté

**Optimisations possibles:**
- Utiliser ChaCha20-Poly1305 (plus rapide sur mobile)
- Réduire les iterations PBKDF2 (mais moins sécurisé)
- Cache des clés dérivées

## 🎯 Cas d'Usage

### ✅ Recommandé pour:
- Chat privé
- Transfert de fichiers sensibles
- Commandes à distance
- Données médicales/financières
- Communication IoT sécurisée

### ⚠️ Pas adapté pour:
- Streaming vidéo (overhead trop important)
- Gaming temps réel (latence ajoutée)
- Données publiques non sensibles

## 🔧 Améliorations Futures

1. **Perfect Forward Secrecy**: Régénérer les clés périodiquement
2. **Authentification**: Ajouter un système de login
3. **Certificats**: Utiliser TLS/SSL au lieu de TCP raw
4. **Compression**: Compresser avant chiffrement
5. **Rate Limiting**: Limiter les tentatives de connexion

## 📚 Ressources

- [AES Explained](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
- [Diffie-Hellman](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)
- [HMAC](https://en.wikipedia.org/wiki/HMAC)
- [Best Practices](https://www.owasp.org/index.php/Cryptographic_Storage_Cheat_Sheet)

---

**⚠️ IMPORTANT: Ce code est pour l'apprentissage. Pour la production:**
- Utilisez TLS/SSL
- Auditez le code de sécurité
- Testez contre les attaques connues
- Suivez les standards de l'industrie