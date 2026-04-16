
import { serve } from "bun";
import qrcode from "qrcode-terminal";
import { exec } from "child_process";
import { promisify } from "util";
import { SecureChannel, KeyExchangeMessage, SecureMessage } from "./crypto-utils";

const execAsync = promisify(exec);

// Configuration
const TCP_PORT = 8888;
const HOTSPOT_SSID = "DevHotspot";
const HOTSPOT_PASSWORD = "dev123456";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m"
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  data: (msg: string) => console.log(`${colors.cyan}→ ${msg}${colors.reset}`),
  secure: (msg: string) => console.log(`${colors.magenta}🔐 ${msg}${colors.reset}`)
};

// Stockage des clients avec leurs canaux sécurisés
interface SecureClient {
  socket: any;
  channel: SecureChannel;
  isSecure: boolean;
  id: string;
}

const clients = new Map<any, SecureClient>();

// Fonction pour trouver l'interface WiFi
async function findWifiInterface() {
  try {
    const { stdout } = await execAsync("nmcli device status | grep wifi");
    const lines = stdout.trim().split('\n');
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        return parts[0];
      }
    }
  } catch (error) {
    try {
      const { stdout } = await execAsync("iw dev | grep Interface");
      const match = stdout.match(/Interface\s+(\S+)/);
      if (match) return match[1];
    } catch {}
  }
  return "wlan0";
}

async function createVirtualHotspot() {
  try {
    log.info("Création du hotspot virtuel...");
    
    try {
      await execAsync("which nmcli");
    } catch {
      log.error("NetworkManager non installé");
      return false;
    }

    const wifiInterface = await findWifiInterface();
    log.info(`Interface WiFi: ${wifiInterface}`);

    try {
      await execAsync(`nmcli connection delete ${HOTSPOT_SSID}`);
    } catch {}

    const createCmd = `nmcli device wifi hotspot ssid ${HOTSPOT_SSID} password ${HOTSPOT_PASSWORD} ifname ${wifiInterface}`;
    await execAsync(createCmd);
    await Bun.sleep(2000);
    
    log.success(`Hotspot créé: ${HOTSPOT_SSID}`);
    return true;
  } catch (error: any) {
    log.error(`Erreur hotspot: ${error.message}`);
    return false;
  }
}

async function getLocalIP() {
  try {
    const { stdout } = await execAsync("hostname -I");
    return stdout.trim().split(" ")[0];
  } catch {
    return "127.0.0.1";
  }
}

// Générer un ID unique pour chaque client
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function startSecureTCPServer() {
  const server = Bun.listen({
    hostname: "0.0.0.0",
    port: TCP_PORT,
    socket: {
      data(socket, data) {
        const client = clients.get(socket);
        if (!client) return;

        const message = data.toString();
        
        try {
          const parsed = JSON.parse(message);
          
          // Protocole d'échange de clés
          if (parsed.type === "key_exchange_init") {
            log.secure(`Échange de clés initié par ${client.id}`);
            
            // Calculer le secret partagé avec la clé publique du client
            client.channel.computeSharedSecret(parsed.publicKey);
            
            // Envoyer notre clé publique
            const response: KeyExchangeMessage = {
              type: "key_exchange_response",
              publicKey: client.channel.getPublicKey(),
              fingerprint: client.channel.getPublicKeyFingerprint(),
              timestamp: Date.now()
            };
            
            socket.write(JSON.stringify(response));
            log.secure(`Clé publique envoyée à ${client.id} (Fingerprint: ${response.fingerprint})`);
            
          } else if (parsed.type === "key_exchange_complete") {
            client.isSecure = true;
            log.success(`Canal sécurisé établi avec ${client.id} 🔒`);
            
            // Envoyer un message de bienvenue chiffré
            const welcomeMsg = JSON.stringify({
              type: "welcome",
              message: "Connexion sécurisée établie!",
              timestamp: Date.now()
            });
            
            const encrypted = client.channel.encrypt(welcomeMsg);
            const secureMsg: SecureMessage = {
              type: "secure_message",
              encrypted: encrypted,
              timestamp: Date.now()
            };
            
            socket.write(JSON.stringify(secureMsg));
            
          } else if (parsed.type === "secure_message") {
            if (!client.isSecure) {
              log.warning(`Message sécurisé reçu d'un canal non sécurisé: ${client.id}`);
              return;
            }
            
            try {
              // Déchiffrer le message
              const decrypted = client.channel.decrypt(parsed.encrypted);
              const originalMsg = JSON.parse(decrypted);
              
              log.data(`Message déchiffré de ${client.id}: ${originalMsg.data}`);
              
              // Broadcaster aux autres clients sécurisés
              clients.forEach((otherClient, otherSocket) => {
                if (otherSocket !== socket && otherClient.isSecure) {
                  const broadcastMsg = JSON.stringify({
                    type: "message",
                    from: client.id,
                    data: originalMsg.data,
                    timestamp: Date.now()
                  });
                  
                  const encrypted = otherClient.channel.encrypt(broadcastMsg);
                  const secureMsg: SecureMessage = {
                    type: "secure_message",
                    encrypted: encrypted,
                    timestamp: Date.now()
                  };
                  
                  otherSocket.write(JSON.stringify(secureMsg));
                }
              });
              
              // Réponse au sender
              const ackMsg = JSON.stringify({
                type: "ack",
                message: "Message sécurisé reçu et diffusé",
                timestamp: Date.now()
              });
              
              const encrypted = client.channel.encrypt(ackMsg);
              const secureMsg: SecureMessage = {
                type: "secure_message",
                encrypted: encrypted,
                timestamp: Date.now()
              };
              
              socket.write(JSON.stringify(secureMsg));
              
            } catch (error: any) {
              log.error(`Erreur déchiffrement: ${error.message}`);
              socket.write(JSON.stringify({
                type: "error",
                message: "Impossible de déchiffrer le message"
              }));
            }
            
          } else if (parsed.type === "ping") {
            socket.write(JSON.stringify({ 
              type: "pong", 
              timestamp: Date.now(),
              secure: client.isSecure 
            }));
          }
          
        } catch (e: any) {
          log.error(`Erreur parsing message: ${e.message}`);
        }
      },
      
      open(socket) {
        const clientId = generateClientId();
        const channel = new SecureChannel();
        
        const client: SecureClient = {
          socket,
          channel,
          isSecure: false,
          id: clientId
        };
        
        clients.set(socket, client);
        log.success(`Client connecté: ${clientId} (Total: ${clients.size})`);
        
        // Envoyer un message d'accueil non chiffré
        socket.write(JSON.stringify({
          type: "connected",
          clientId: clientId,
          message: "Connecté. Initiez l'échange de clés pour sécuriser la connexion.",
          timestamp: Date.now()
        }));
      },
      
      close(socket) {
        const client = clients.get(socket);
        if (client) {
          log.warning(`Client déconnecté: ${client.id} (Total: ${clients.size - 1})`);
          clients.delete(socket);
        }
      },
      
      error(socket, error) {
        const client = clients.get(socket);
        log.error(`Erreur socket${client ? ` (${client.id})` : ''}: ${error}`);
        clients.delete(socket);
      }
    }
  });
  
  log.success(`Serveur TCP sécurisé démarré sur le port ${TCP_PORT}`);
  return server;
}

async function main() {
  console.clear();
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}  Serveur TCP Sécurisé (AES-256 + DH)${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);
  
  const localIP = await getLocalIP();
  log.info(`IP locale: ${localIP}`);
  
  const canCreateHotspot = process.getuid && process.getuid() === 0;
  let hotspotCreated = false;
  
  if (canCreateHotspot) {
    hotspotCreated = await createVirtualHotspot();
  } else {
    log.warning("Hotspot désactivé (nécessite sudo)");
    log.info("Pour activer: sudo $(which bun) secure-server.ts");
  }
  
  const tcpServer = startSecureTCPServer();
  
  const connectionInfo = {
    tcp: { host: localIP, port: TCP_PORT },
    encryption: "AES-256-CBC + Diffie-Hellman",
    hotspot: hotspotCreated ? {
      ssid: HOTSPOT_SSID,
      password: HOTSPOT_PASSWORD,
      ip: "192.168.50.1",
      tcpPort: TCP_PORT
    } : null
  };
  
  console.log(`\n${colors.bright}${colors.green}Scannez ce QR code:${colors.reset}\n`);
  qrcode.generate(JSON.stringify(connectionInfo), { small: true });
  
  console.log(`\n${colors.bright}Informations de connexion:${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.yellow}Connexion:${colors.reset}`);
  console.log(`  IP: ${localIP}`);
  console.log(`  Port: ${TCP_PORT}`);
  console.log(`${colors.yellow}Sécurité:${colors.reset}`);
  console.log(`  Chiffrement: AES-256-CBC`);
  console.log(`  Échange clés: Diffie-Hellman 2048-bit`);
  console.log(`  Intégrité: HMAC-SHA256`);
  
  if (hotspotCreated) {
    console.log(`${colors.yellow}Hotspot:${colors.reset}`);
    console.log(`  SSID: ${HOTSPOT_SSID}`);
    console.log(`  Password: ${HOTSPOT_PASSWORD}`);
  }
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  log.success("Serveur en attente de connexions sécurisées...\n");
  
  // Heartbeat
  setInterval(() => {
    clients.forEach((client, socket) => {
      if (client.isSecure) {
        try {
          const heartbeat = JSON.stringify({
            type: "heartbeat",
            timestamp: Date.now()
          });
          const encrypted = client.channel.encrypt(heartbeat);
          socket.write(JSON.stringify({
            type: "secure_message",
            encrypted: encrypted,
            timestamp: Date.now()
          }));
        } catch (e) {
          clients.delete(socket);
        }
      }
    });
  }, 30000);
  
  process.on("SIGINT", async () => {
    console.log("\n");
    log.info("Arrêt du serveur...");
    
    if (hotspotCreated) {
      try {
        await execAsync(`nmcli connection delete ${HOTSPOT_SSID}`);
        log.success("Hotspot supprimé");
      } catch {}
    }
    
    tcpServer.stop();
    log.success("Serveur arrêté");
    process.exit(0);
  });
}

main().catch(console.error);