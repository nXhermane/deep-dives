
import { createCipheriv, createDecipheriv, createHash, randomBytes, createHmac, pbkdf2Sync } from "crypto";
import { createDiffieHellman, DiffieHellman } from "crypto";

export class SecureChannel {
  private sharedSecret: Buffer | null = null;
  private dh: DiffieHellman;
  private encryptionKey: Buffer | null = null;
  private hmacKey: Buffer | null = null;
  
  constructor() {
    // Créer une instance Diffie-Hellman avec un prime de 2048 bits
    this.dh = createDiffieHellman(2048);
    this.dh.generateKeys();
  }

  // Obtenir la clé publique pour l'envoyer à l'autre partie
  getPublicKey(): string {
    return this.dh.getPublicKey('base64');
  }

  // Calculer le secret partagé à partir de la clé publique de l'autre partie
  computeSharedSecret(otherPublicKey: string): void {
    const otherPublicKeyBuffer = Buffer.from(otherPublicKey, 'base64');
    this.sharedSecret = this.dh.computeSecret(otherPublicKeyBuffer);
    
    // Dériver deux clés : une pour le chiffrement, une pour HMAC
    const salt = createHash('sha256').update('secure-channel-salt').digest();
    const keyMaterial = pbkdf2Sync(this.sharedSecret, salt, 100000, 64, 'sha512');
    
    this.encryptionKey = keyMaterial.slice(0, 32); // 256 bits pour AES-256
    this.hmacKey = keyMaterial.slice(32, 64);      // 256 bits pour HMAC
  }

  // Chiffrer un message
  encrypt(data: string): string {
    if (!this.encryptionKey || !this.hmacKey) {
      throw new Error('Secret partagé non établi. Appelez computeSharedSecret() d\'abord.');
    }

    // Générer un IV aléatoire pour chaque message
    const iv = randomBytes(16);
    
    // Chiffrer avec AES-256-CBC
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Créer le message complet : IV + données chiffrées
    const message = iv.toString('base64') + ':' + encrypted;
    
    // Calculer HMAC pour l'intégrité
    const hmac = createHmac('sha256', this.hmacKey)
      .update(message)
      .digest('base64');
    
    // Retourner : HMAC:IV:encrypted
    return hmac + ':' + message;
  }

  // Déchiffrer un message
  decrypt(encryptedData: string): string {
    if (!this.encryptionKey || !this.hmacKey) {
      throw new Error('Secret partagé non établi. Appelez computeSharedSecret() d\'abord.');
    }

    // Parser : HMAC:IV:encrypted
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Format de message invalide');
    }

    const [receivedHmac, ivBase64, encrypted] = parts;
    const message = ivBase64 + ':' + encrypted;
    
    // Vérifier HMAC
    const calculatedHmac = createHmac('sha256', this.hmacKey)
      .update(message)
      .digest('base64');
    
    if (receivedHmac !== calculatedHmac) {
      throw new Error('Intégrité du message compromise (HMAC invalide)');
    }
    
    // Déchiffrer
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Vérifier si le canal est sécurisé
  isSecure(): boolean {
    return this.sharedSecret !== null && this.encryptionKey !== null;
  }

  // Générer un hash de la clé publique pour vérification
  getPublicKeyFingerprint(): string {
    return createHash('sha256')
      .update(this.getPublicKey())
      .digest('hex')
      .substring(0, 16);
  }
}

// Utilitaire pour chiffrer/déchiffrer avec une clé fixe (moins sécurisé mais plus simple)
export class SimpleEncryption {
  private key: Buffer;
  private hmacKey: Buffer;

  constructor(password: string) {
    // Dériver une clé à partir du mot de passe
    const salt = Buffer.from('secure-tcp-salt-2024');
    const keyMaterial = pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    
    this.key = keyMaterial.slice(0, 32);
    this.hmacKey = keyMaterial.slice(32, 64);
  }

  encrypt(data: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const message = iv.toString('base64') + ':' + encrypted;
    const hmac = createHmac('sha256', this.hmacKey)
      .update(message)
      .digest('base64');
    
    return hmac + ':' + message;
  }

  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Format invalide');
    }

    const [receivedHmac, ivBase64, encrypted] = parts;
    const message = ivBase64 + ':' + encrypted;
    
    const calculatedHmac = createHmac('sha256', this.hmacKey)
      .update(message)
      .digest('base64');
    
    if (receivedHmac !== calculatedHmac) {
      throw new Error('HMAC invalide - message corrompu ou falsifié');
    }
    
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = createDecipheriv('aes-256-cbc', this.key, iv);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Types de messages pour le protocole d'échange de clés
export interface KeyExchangeMessage {
  type: 'key_exchange_init' | 'key_exchange_response' | 'key_exchange_complete';
  publicKey: string;
  fingerprint: string;
  timestamp: number;
}

export interface SecureMessage {
  type: 'secure_message';
  encrypted: string;
  timestamp: number;
}