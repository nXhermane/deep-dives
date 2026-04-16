import { serve } from "bun";
import qrcode from "qrcode-terminal";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Configuration
const TCP_PORT = 8888;
const HOTSPOT_SSID = "DevHotspot";
const HOTSPOT_PASSWORD = "dev123456";
const HOTSPOT_IP = "192.168.50.1";

// Couleurs pour les logs
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg: string) =>
    console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  data: (msg: string) => console.log(`${colors.cyan}→ ${msg}${colors.reset}`),
};

// Fonction pour créer le hotspot virtuel
async function createVirtualHotspot() {
  try {
    log.info("Création du hotspot virtuel...");

    // Vérifier si NetworkManager est disponible
    try {
      await execAsync("which nmcli");
    } catch {
      log.error("NetworkManager (nmcli) n'est pas installé");
      log.warning("Installation: sudo apt install network-manager");
      return false;
    }

    // Supprimer l'ancienne connexion si elle existe
    try {
      await execAsync(`nmcli connection delete ${HOTSPOT_SSID}`);
    } catch {}

    // Créer le hotspot
    const createCmd = `nmcli device wifi hotspot \
      ssid ${HOTSPOT_SSID} \
      password ${HOTSPOT_PASSWORD} \
      ifname wlan0`;

    await execAsync(createCmd);

    // Attendre un peu que le hotspot se stabilise
    await Bun.sleep(2000);

    log.success(`Hotspot créé: ${HOTSPOT_SSID}`);
    log.success(`Mot de passe: ${HOTSPOT_PASSWORD}`);

    return true;
  } catch (error: any) {
    log.error(`Erreur création hotspot: ${error.message}`);
    log.warning("Essayez avec sudo: sudo bun run server.ts");
    return false;
  }
}

// Fonction pour obtenir l'IP locale
async function getLocalIP() {
  try {
    const { stdout } = await execAsync("hostname -I");
    const ips = stdout.trim().split(" ");
    return ips[0]; // Première IP (généralement celle du routeur)
  } catch {
    return "127.0.0.1";
  }
}

// Stockage des clients connectés
const clients = new Set<any>();

// Serveur TCP
function startTCPServer() {
  const server = Bun.listen({
    hostname: "0.0.0.0",
    port: TCP_PORT,
    tls: {
      cert: Bun.file(
        "/home/hermane/nxhermane/perso/secrets/malnutrix/server-cert.pem"
      ),
      key: Bun.file(
        "/home/hermane/nxhermane/perso/secrets/malnutrix/server-key.pem"
      ),
    },
    socket: {
      data(socket, data) {
        const message = data.toString();
        log.data(`Reçu: ${message}`);
        try {
          const parsed = JSON.parse(message);
          
          // Handle synchronization protocol messages with string literals (new format)
          if (parsed.type === "SYNC_START_REQUEST") {
            // Client wants to start sync process
            log.info("Received SYNC_START_REQUEST from client");
            
            // Send ready for client data message
            socket.write(
              JSON.stringify({
                type: "SYNC_READY_FOR_CLIENT_DATA",
                content: { lastSyncTimestamp: null },
              })
            );
          } else if (parsed.type === "CLIENT_PATIENT_EXPORT") {
            // Client is sending patient data
            log.info("Received CLIENT_PATIENT_EXPORT from client");
            
            // Acknowledge the export
            socket.write(
              JSON.stringify({
                type: "SERVER_ACK_CLIENT_EXPORT",
                content: null,
              })
            );
            
            // Notify client that export is completed
            socket.write(
              JSON.stringify({
                type: "SERVER_CLIENT_EXPORT_COMPLETED",
                content: { data: [] }, // Empty array for testing
              })
            );
            
            // Send some test patient data to import
            socket.write(
              JSON.stringify({
                type: "SERVER_PATIENT_IMPORT",
                content: { 
                  data: [
                    // Sample patient data for testing
                    {
                      id: "test-patient-1",
                      firstName: "John",
                      lastName: "Doe",
                      birthDate: "1990-01-01",
                      sex: "male",
                      isLocked: false,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    }
                  ] 
                },
              })
            );
            
            // Notify sync process completed
            socket.write(
              JSON.stringify({
                type: "SYNC_PROCESS_COMPLETED",
                content: null,
              })
            );
          } else if (parsed.type === "CLIENT_ACK_SERVER_PATIENT") {
            // Client acknowledged receipt of patient data
            log.info("Received CLIENT_ACK_SERVER_PATIENT from client");
            log.success("Synchronization completed successfully!");
          }
          
          // Handle legacy numeric message types (for backward compatibility)
          else if (parsed.type === 0) {
            socket.write(
              JSON.stringify({
                type: "SYNC_READY_FOR_CLIENT_DATA", // Changed from 0
                content: { timestamp: null },
              })
            );
          } else if (parsed.type === 1) {
            socket.write(
              JSON.stringify({
                type: "SERVER_CLIENT_EXPORT_COMPLETED", // Changed from 2
                content: { data: [] },
              })
            );
            socket.write(
              JSON.stringify({
                type: "SERVER_PATIENT_IMPORT", // Changed from 1
                content: { data: [] },
              })
            );
          } else if (parsed.type === 2) {
            socket.write(
              JSON.stringify({
                type: "SYNC_PROCESS_COMPLETED", // Changed from 3
                content: { data: [] },
              })
            );
          }
          
          // Handle other message types
          else if (parsed.type === "ping") {
            socket.write(
              JSON.stringify({ type: "pong", timestamp: Date.now() })
            );
          } else if (parsed.type === "message") {
            // Broadcaster à tous les autres clients
            clients.forEach((client) => {
              if (client !== socket) {
                client.write(
                  JSON.stringify({
                    type: "message",
                    from: "server",
                    data: parsed.data,
                    timestamp: Date.now(),
                  })
                );
              }
            });

            // Réponse au sender
            socket.write(
              JSON.stringify({
                type: "ack",
                message: "Message reçu et diffusé",
                timestamp: Date.now(),
              })
            );
          }
        } catch (e) {
          // Si ce n'est pas du JSON, renvoyer tel quel
          socket.write(`Echo: ${message}`);
        }
      },

      open(socket) {
        clients.add(socket);
        log.success(`Client connecté (Total: ${clients.size})`);

        socket.write(
          JSON.stringify({
            type: "welcome",
            message: "Connecté au serveur TCP",
            timestamp: Date.now(),
          })
        );
      },

      close(socket) {
        clients.delete(socket);
        log.warning(`Client déconnecté (Total: ${clients.size})`);
      },

      error(socket, error) {
        log.error(`Erreur socket: ${error}`);
        clients.delete(socket);
      },
    },
  });

  log.success(`Serveur TCP démarré sur le port ${TCP_PORT}`);
  return server;
}

// Fonction principale
async function main() {
  console.clear();
  console.log(
    `${colors.bright}${colors.cyan}═══════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.bright}  Serveur TCP + Hotspot Virtuel${colors.reset}`);
  console.log(
    `${colors.bright}${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`
  );

  // Obtenir l'IP locale
  const localIP = await getLocalIP();
  log.info(`IP locale (routeur): ${localIP}`);

  // Créer le hotspot virtuel
  const hotspotCreated = await createVirtualHotspot();

  if (!hotspotCreated) {
    log.warning("Hotspot non créé, continuation avec IP locale seulement...");
  }

  // Démarrer le serveur TCP
  const tcpServer = startTCPServer();

  // Préparer les informations de connexion
  const connectionInfo = {
    tcp: {
      host: localIP,
      port: TCP_PORT,
    },
    hotspot: hotspotCreated
      ? {
          ssid: HOTSPOT_SSID,
          password: HOTSPOT_PASSWORD,
          host: HOTSPOT_IP,
          port: TCP_PORT,
        }
      : null,
  };

  // Afficher le QR code
  console.log(
    `\n${colors.bright}${colors.green}Scannez ce QR code avec votre application:${colors.reset}\n`
  );

  const qrData = JSON.stringify(connectionInfo);
  const isWorkQrcode = false;
  if (isWorkQrcode) {
    qrcode.generate(
      `malnutrix::data::GT8QmH6DVmojnerF8Yym9BsJvGlMSt5gF23bT0baSf5YT4iwS1jOln0+PwPqINAUShS5gLIxrNhTqU/2E4bVSpHP3f9X0mpC496laTiQJqby1YpW4R6+ETEcIFnJUdiKvYmdz674qOxegGVD`,
      { small: true }
    );
  } else {
    qrcode.generate(
      `malnutrix::data::ria7a3xBElyJ+4PLxZ04I/aotTrBjy6oPy3wWg+/kDThTiF+kOfNiIP/2BzSxk5DKwrIbmjrvm15cmXQ4rAnmsHgjSsWyT+RSj+O9UbBdH3r9Z+V3ZcslNguVAi2sOo/eoYgG9C2CnSoogVyrQI=`,
      { small: true }
    );
  }

  // Afficher les infos de connexion
  console.log(`\n${colors.bright}Informations de connexion:${colors.reset}`);
  console.log(
    `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(`${colors.yellow}Option 1 - Via Routeur:${colors.reset}`);
  console.log(`  IP: ${localIP}`);
  console.log(`  Port TCP: ${TCP_PORT}`);

  if (hotspotCreated) {
    console.log(`\n${colors.yellow}Option 2 - Via Hotspot:${colors.reset}`);
    console.log(`  SSID: ${HOTSPOT_SSID}`);
    console.log(`  Password: ${HOTSPOT_PASSWORD}`);
    console.log(`  IP Hotspot: ${HOTSPOT_IP}`);
    console.log(`  Port TCP: ${TCP_PORT}`);
  }
  console.log(
    `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
  );

  // Tester la connexion périodiquement
  setInterval(() => {
    if (clients.size > 0) {
      clients.forEach((client) => {
        try {
          client.write(
            JSON.stringify({
              type: "heartbeat",
              timestamp: Date.now(),
            })
          );
        } catch (e) {
          clients.delete(client);
        }
      });
    }
  }, 30000);

  log.success("Serveur en attente de connexions...\n");

  // Cleanup au exit
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
    log.success("Serveur TCP arrêté");
    process.exit(0);
  });
}

main().catch(console.error);