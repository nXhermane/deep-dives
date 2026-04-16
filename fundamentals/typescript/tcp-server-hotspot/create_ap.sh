#!/bin/bash

# Script pour créer un hotspot avec create_ap (alternative à nmcli)
# Ce script est plus robuste quand nmcli a des problèmes

echo "Installation de create_ap..."

# Installer les dépendances
sudo apt update
sudo apt install -y hostapd dnsmasq git

# Cloner create_ap si pas déjà fait
if [ ! -d "/tmp/create_ap" ]; then
    git clone https://github.com/oblique/create_ap /tmp/create_ap
    cd /tmp/create_ap
    sudo make install
fi

# Trouver l'interface WiFi
WIFI_INTERFACE=$(iw dev | grep Interface | awk '{print $2}' | head -n1)
echo "Interface WiFi trouvée: $WIFI_INTERFACE"

# Trouver l'interface ethernet (ou autre interface connectée)
ETH_INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n1)
echo "Interface internet trouvée: $ETH_INTERFACE"

# Créer le hotspot
echo "Création du hotspot DevHotspot..."
sudo create_ap $WIFI_INTERFACE $ETH_INTERFACE DevHotspot dev123456

# Note: Pour arrêter le hotspot, faire Ctrl+C