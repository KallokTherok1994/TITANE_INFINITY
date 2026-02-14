# 🌐 Guide d'Installation TITANE∞ + Ollama via Réseau Production

**Version:** 27.0.2+ | **Date:** 14 Février 2026  
**Scope:** Installation & Configuration en réseau d'entreprise  
**Audience:** Administrateurs systèmes, DevOps, DSI

---

## 📖 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Architecture Réseau](#architecture-réseau)
3. [Prérequis Infrastructure](#prérequis-infrastructure)
4. [Installation Serveur Ollama Centralisé](#installation-serveur-ollama-centralisé)
5. [Configuration Clients TITANE](#configuration-clients-titane)
6. [Sécurité Réseau](#sécurité-réseau)
7. [Proxy Reverse & Load Balancing](#proxy-reverse--load-balancing)
8. [Monitoring & Observabilité](#monitoring--observabilité)
9. [Haute Disponibilité](#haute-disponibilité)
10. [Troubleshooting Réseau](#troubleshooting-réseau)
11. [Optimisation Performance](#optimisation-performance)
12. [Scénarios d'Architecture Entreprise](#scénarios-darchitecture-entreprise)

---

## 📌 INTRODUCTION

Ce guide décrit l'installation et la configuration de **TITANE∞** en mode réseau d'entreprise avec un serveur **Ollama** centralisé. Cette architecture permet à plusieurs clients TITANE de partager un serveur d'IA unique, optimisant les ressources matérielles et la gestion centralisée des modèles.

### Cas d'Usage

- **Entreprises** avec plusieurs postes de travail
- **Équipes** partageant des ressources IA
- **Datacenters** avec infrastructure GPU centralisée
- **Environnements sécurisés** nécessitant un contrôle d'accès strict

### Avantages de l'Architecture Réseau

✅ **Centralisation** : Un seul serveur IA pour toute l'équipe  
✅ **Économies** : Mutualisation des ressources GPU/CPU  
✅ **Maintenance** : Gestion centralisée des modèles  
✅ **Performance** : Serveur dédié avec GPU puissant  
✅ **Sécurité** : Contrôle d'accès et audit centralisés  
✅ **Scalabilité** : Ajout facile de nouveaux clients

---

## 🏗️ ARCHITECTURE RÉSEAU

### Architecture de Base

```
┌─────────────────────────────────────────────────────────────┐
│                    RÉSEAU D'ENTREPRISE                      │
│                      (192.168.1.0/24)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │   Client 1   │   │   Client 2   │   │   Client N   │  │
│  │   TITANE∞    │   │   TITANE∞    │   │   TITANE∞    │  │
│  │              │   │              │   │              │  │
│  │ 192.168.1.10 │   │ 192.168.1.11 │   │ 192.168.1.N  │  │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘  │
│         │                  │                  │           │
│         └──────────────────┼──────────────────┘           │
│                            │                               │
│                            ▼                               │
│                   ┌────────────────┐                      │
│                   │ Load Balancer  │                      │
│                   │   (optionnel)  │                      │
│                   │ 192.168.1.100  │                      │
│                   └────────┬───────┘                      │
│                            │                               │
│                            ▼                               │
│               ┌────────────────────────┐                  │
│               │   Serveur Ollama       │                  │
│               │   + GPU NVIDIA         │                  │
│               │                        │                  │
│               │   192.168.1.50:11434   │                  │
│               │                        │                  │
│               │   Modèles:             │                  │
│               │   • llama3.1 (4.9GB)   │                  │
│               │   • qwen2.5 (4.7GB)    │                  │
│               │   • mistral (4.4GB)    │                  │
│               └────────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Haute Disponibilité

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Clients TITANE∞ (N postes)                                 │
│                                                              │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────┐                                        │
│  │  HAProxy/Nginx  │  ← Load Balancer avec health checks   │
│  │  192.168.1.100  │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│    ┌──────┴──────┐                                          │
│    │             │                                          │
│    ▼             ▼                                          │
│ ┌─────────┐  ┌─────────┐                                   │
│ │ Ollama  │  │ Ollama  │  ← Serveurs en cluster            │
│ │ Node 1  │  │ Node 2  │                                   │
│ │  :11434 │  │  :11434 │                                   │
│ └─────────┘  └─────────┘                                   │
│                                                              │
│        │              │                                      │
│        └──────┬───────┘                                      │
│               ▼                                              │
│        ┌─────────────┐                                      │
│        │  Shared NFS │  ← Modèles partagés                  │
│        │  Storage    │                                      │
│        └─────────────┘                                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 PRÉREQUIS INFRASTRUCTURE

### Serveur Ollama (Requis)

| Composant | Minimum | Recommandé | Production |
|-----------|---------|------------|------------|
| **CPU** | 4 cores | 8 cores | 16+ cores |
| **RAM** | 8 GB | 16 GB | 32+ GB |
| **GPU** | - | NVIDIA GTX 1060+ | NVIDIA RTX 3090/4090 |
| **Disque** | 50 GB SSD | 200 GB NVMe | 500+ GB NVMe RAID |
| **Réseau** | 100 Mbps | 1 Gbps | 10 Gbps |
| **OS** | Ubuntu 20.04+ | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Clients TITANE∞

| Composant | Minimum | Recommandé |
|-----------|---------|------------|
| **CPU** | 2 cores | 4 cores |
| **RAM** | 2 GB | 4 GB |
| **Disque** | 500 MB | 2 GB |
| **Réseau** | 10 Mbps | 100 Mbps |
| **OS** | Linux/Windows/macOS | Ubuntu 22.04 |

### Réseau

- **Latence** : < 10ms entre clients et serveur (recommandé)
- **Bande passante** : 10 Mbps minimum par client
- **Ports** : 11434 (Ollama), 443 (HTTPS optionnel)
- **Firewall** : Règles configurées (voir section Sécurité)

---

## 🖥️ INSTALLATION SERVEUR OLLAMA CENTRALISÉ

### Étape 1 : Préparation du Serveur

```bash
# Connexion au serveur (SSH)
ssh admin@192.168.1.50

# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation dépendances
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    net-tools \
    ufw
```

### Étape 2 : Installation Ollama

```bash
# Installation officielle Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Vérification installation
ollama --version
# Doit afficher : Ollama version 0.x.x
```

### Étape 3 : Configuration Réseau Ollama

Par défaut, Ollama écoute uniquement sur `localhost`. Pour le rendre accessible en réseau :

#### Méthode 1 : Configuration Systemd (Recommandée)

```bash
# Créer override systemd
sudo mkdir -p /etc/systemd/system/ollama.service.d/

sudo tee /etc/systemd/system/ollama.service.d/override.conf <<EOF
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
EOF

# Recharger configuration
sudo systemctl daemon-reload

# Redémarrer Ollama
sudo systemctl restart ollama

# Vérifier status
sudo systemctl status ollama
```

#### Méthode 2 : Configuration Manuelle

```bash
# Exporter variables d'environnement
export OLLAMA_HOST=0.0.0.0:11434
export OLLAMA_ORIGINS=*

# Lancer Ollama
ollama serve &
```

### Étape 4 : Vérification Réseau

```bash
# Vérifier port ouvert
sudo netstat -tlnp | grep 11434
# Doit afficher : tcp 0.0.0.0:11434 ... LISTEN

# Test local
curl http://localhost:11434/api/tags
# Doit retourner JSON

# Test depuis une autre machine (remplacer IP)
curl http://192.168.1.50:11434/api/tags
```

### Étape 5 : Installation des Modèles

```bash
# Télécharger modèles recommandés pour TITANE∞
ollama pull llama3.1:latest    # 4.9 GB - Modèle par défaut
ollama pull qwen2.5:latest     # 4.7 GB - Excellent pour code
ollama pull mistral:latest     # 4.4 GB - Performant général
ollama pull codellama:latest   # 3.8 GB - Spécialiste code

# Lister modèles installés
ollama list
```

**Temps estimé** : ~15-30 minutes selon vitesse réseau

### Étape 6 : Test de Performance

```bash
# Test génération simple
time ollama run llama3.1:latest "Bonjour, qui es-tu?"

# Doit répondre en ~2-5 secondes (avec GPU)
# ou ~10-20 secondes (CPU only)
```

---

## 💻 CONFIGURATION CLIENTS TITANE

### Étape 1 : Installation TITANE∞ sur Clients

#### Option A : Package DEB (Ubuntu/Debian)

```bash
# Sur chaque poste client
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.2/titane-infinity_27.0.2_amd64.deb

sudo dpkg -i titane-infinity_27.0.2_amd64.deb

# Vérifier installation
titane-infinity --version
```

#### Option B : AppImage (Portable)

```bash
# Télécharger AppImage
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.2/Titan-Stable_27.0.2_amd64.AppImage

chmod +x Titan-Stable_27.0.2_amd64.AppImage

# Lancer
./Titan-Stable_27.0.2_amd64.AppImage
```

### Étape 2 : Configuration Réseau Client

Créer fichier de configuration pour pointer vers le serveur Ollama :

```bash
# Créer répertoire config utilisateur
mkdir -p ~/.titane

# Créer fichier configuration
cat > ~/.titane/config.json <<EOF
{
  "providers": {
    "ollama": {
      "enabled": true,
      "endpoint": "http://192.168.1.50:11434",
      "model": "llama3.1:latest",
      "temperature": 0.7,
      "max_tokens": 3000,
      "timeout": 60000
    }
  },
  "network": {
    "mode": "client",
    "server_address": "192.168.1.50",
    "server_port": 11434,
    "use_tls": false,
    "verify_ssl": true
  }
}
EOF
```

### Étape 3 : Configuration Variable d'Environnement

```bash
# Méthode 1 : Variable d'environnement permanente
echo 'export OLLAMA_BASE_URL=http://192.168.1.50:11434' >> ~/.bashrc
source ~/.bashrc

# Méthode 2 : Fichier .env.local dans répertoire TITANE
cd ~/TITANE_INFINITY  # Si installation source
cat > .env.local <<EOF
# Configuration Ollama Réseau
OLLAMA_BASE_URL=http://192.168.1.50:11434
OLLAMA_DEFAULT_MODEL=llama3.1:latest
TITANE_OLLAMA_MODEL=llama3.1:latest

# Mode réseau
TITANE_NETWORK_MODE=client
TITANE_OLLAMA_SERVER=192.168.1.50:11434
EOF
```

### Étape 4 : Test de Connexion Client

```bash
# Test 1 : Curl depuis client
curl http://192.168.1.50:11434/api/tags

# Doit afficher liste des modèles

# Test 2 : Test génération
curl http://192.168.1.50:11434/api/generate -d '{
  "model": "llama3.1:latest",
  "prompt": "Bonjour"
}'
```

### Étape 5 : Lancement TITANE∞

```bash
# Lancer TITANE avec configuration réseau
titane-infinity

# Ou si AppImage
OLLAMA_BASE_URL=http://192.168.1.50:11434 ./Titan-Stable_27.0.2_amd64.AppImage
```

**Vérification dans l'interface** :
1. Ouvrir TITANE∞
2. Aller dans **Paramètres** → **Providers IA**
3. Vérifier que **Ollama** affiche : `✅ Connecté (192.168.1.50:11434)`
4. Sélectionner modèle : `llama3.1:latest`
5. Tester avec un message dans le Chat

---

## 🔒 SÉCURITÉ RÉSEAU

### Pare-feu Serveur (UFW)

```bash
# Sur le serveur Ollama
sudo ufw enable

# Autoriser SSH (pour administration)
sudo ufw allow 22/tcp

# Autoriser Ollama uniquement depuis réseau local
sudo ufw allow from 192.168.1.0/24 to any port 11434 proto tcp

# Vérifier règles
sudo ufw status numbered
```

### Pare-feu Avancé (iptables)

```bash
# Règles iptables plus précises
sudo iptables -A INPUT -p tcp --dport 11434 -s 192.168.1.0/24 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 11434 -j DROP

# Sauvegarder règles
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

### Authentification avec API Key (Futur)

Ollama ne supporte pas nativement l'authentification. Utilisez un proxy reverse (voir section suivante).

### Chiffrement TLS/SSL

Pour sécuriser les communications, utilisez un proxy reverse avec HTTPS :

```nginx
# Configuration Nginx avec SSL
server {
    listen 443 ssl http2;
    server_name ollama.votre-entreprise.local;

    ssl_certificate /etc/ssl/certs/ollama.crt;
    ssl_certificate_key /etc/ssl/private/ollama.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:11434;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts pour streaming
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### Isolation Réseau (VLAN)

```bash
# Créer VLAN dédié pour trafic IA
# Exemple avec VLAN 100

# Sur switch réseau (exemple Cisco)
vlan 100
 name AI_SERVICES
 
interface GigabitEthernet1/0/1
 switchport mode access
 switchport access vlan 100
```

### Audit et Logs

```bash
# Activer logs Ollama
sudo mkdir -p /var/log/ollama

# Modifier systemd service
sudo tee -a /etc/systemd/system/ollama.service.d/override.conf <<EOF
[Service]
StandardOutput=append:/var/log/ollama/access.log
StandardError=append:/var/log/ollama/error.log
EOF

sudo systemctl daemon-reload
sudo systemctl restart ollama

# Rotation logs
sudo tee /etc/logrotate.d/ollama <<EOF
/var/log/ollama/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
EOF
```

---

## 🔄 PROXY REVERSE & LOAD BALANCING

### Option 1 : Nginx (Recommandé)

#### Installation

```bash
sudo apt install -y nginx

# Vérifier installation
nginx -v
```

#### Configuration Load Balancing

```nginx
# /etc/nginx/sites-available/ollama-lb

upstream ollama_backend {
    least_conn;  # Algorithme least connections
    
    # Serveurs Ollama
    server 192.168.1.50:11434 max_fails=3 fail_timeout=30s;
    server 192.168.1.51:11434 max_fails=3 fail_timeout=30s;
    
    # Health check
    check interval=5000 rise=2 fall=3 timeout=1000;
}

server {
    listen 80;
    server_name ollama.entreprise.local;

    # Logs
    access_log /var/log/nginx/ollama-access.log;
    error_log /var/log/nginx/ollama-error.log;

    location / {
        proxy_pass http://ollama_backend;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Timeouts pour requêtes IA (longues)
        proxy_read_timeout 300s;
        proxy_connect_timeout 10s;
        proxy_send_timeout 300s;
        
        # Buffering désactivé pour streaming
        proxy_buffering off;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
    }
}
```

#### Activation Configuration

```bash
# Créer lien symbolique
sudo ln -s /etc/nginx/sites-available/ollama-lb /etc/nginx/sites-enabled/

# Tester configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### Option 2 : HAProxy

```bash
# Installation
sudo apt install -y haproxy

# Configuration /etc/haproxy/haproxy.cfg
sudo tee -a /etc/haproxy/haproxy.cfg <<EOF

frontend ollama_front
    bind *:11434
    mode http
    default_backend ollama_back

backend ollama_back
    mode http
    balance roundrobin
    
    # Health checks
    option httpchk GET /api/tags
    
    # Serveurs
    server ollama1 192.168.1.50:11434 check inter 5s fall 3 rise 2
    server ollama2 192.168.1.51:11434 check inter 5s fall 3 rise 2
    
    # Timeouts
    timeout server 300s
    timeout connect 10s

# Stats page
listen stats
    bind *:8404
    mode http
    stats enable
    stats uri /stats
    stats refresh 10s
    stats admin if TRUE
EOF

# Redémarrer HAProxy
sudo systemctl restart haproxy
```

### Option 3 : Traefik (Moderne)

```yaml
# docker-compose.yml pour Traefik
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yml:/etc/traefik/traefik.yml
    networks:
      - ollama_network

networks:
  ollama_network:
    driver: bridge
```

```yaml
# traefik.yml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  file:
    filename: /etc/traefik/dynamic.yml

api:
  dashboard: true
```

```yaml
# dynamic.yml
http:
  services:
    ollama:
      loadBalancer:
        servers:
          - url: "http://192.168.1.50:11434"
          - url: "http://192.168.1.51:11434"
        healthCheck:
          path: /api/tags
          interval: "10s"
          timeout: "3s"
  
  routers:
    ollama-router:
      rule: "Host(`ollama.entreprise.local`)"
      service: ollama
      entryPoints:
        - web
```

---

## 📊 MONITORING & OBSERVABILITÉ

### Prometheus + Grafana

#### 1. Installation Prometheus

```bash
# Télécharger Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*

# Configuration prometheus.yml
cat > prometheus.yml <<EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ollama'
    static_configs:
      - targets: ['192.168.1.50:11434']
        labels:
          instance: 'ollama-server-1'
      
  - job_name: 'node'
    static_configs:
      - targets: ['192.168.1.50:9100']
EOF

# Lancer Prometheus
./prometheus --config.file=prometheus.yml &
```

#### 2. Node Exporter (Métriques Système)

```bash
# Installation
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.0/node_exporter-1.6.0.linux-amd64.tar.gz
tar xvfz node_exporter-*.tar.gz
cd node_exporter-*

# Lancer
./node_exporter &
```

#### 3. Script Monitoring Ollama

```bash
#!/bin/bash
# /usr/local/bin/ollama-metrics.sh

OLLAMA_URL="http://192.168.1.50:11434"
METRICS_FILE="/var/lib/prometheus/ollama.prom"

# Vérifier disponibilité
if curl -sf "$OLLAMA_URL/api/tags" > /dev/null; then
    echo "ollama_up 1" > $METRICS_FILE
else
    echo "ollama_up 0" > $METRICS_FILE
fi

# Nombre de modèles
MODELS_COUNT=$(curl -sf "$OLLAMA_URL/api/tags" | jq '.models | length' 2>/dev/null || echo 0)
echo "ollama_models_count $MODELS_COUNT" >> $METRICS_FILE

# Utilisation GPU (si NVIDIA)
if command -v nvidia-smi &> /dev/null; then
    GPU_MEM=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits | head -1)
    GPU_UTIL=$(nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits | head -1)
    
    echo "ollama_gpu_memory_mb $GPU_MEM" >> $METRICS_FILE
    echo "ollama_gpu_utilization_percent $GPU_UTIL" >> $METRICS_FILE
fi
```

```bash
# Rendre exécutable
sudo chmod +x /usr/local/bin/ollama-metrics.sh

# Cron toutes les minutes
echo "* * * * * /usr/local/bin/ollama-metrics.sh" | sudo crontab -
```

#### 4. Installation Grafana

```bash
# Ajouter repository
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -

# Installer
sudo apt update
sudo apt install -y grafana

# Démarrer
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

Accès: `http://192.168.1.50:3000` (admin/admin)

#### 5. Dashboard Grafana pour Ollama

```json
{
  "dashboard": {
    "title": "Ollama Production Monitoring",
    "panels": [
      {
        "title": "Ollama Availability",
        "targets": [{
          "expr": "ollama_up"
        }],
        "type": "stat"
      },
      {
        "title": "GPU Memory Usage",
        "targets": [{
          "expr": "ollama_gpu_memory_mb"
        }],
        "type": "graph"
      },
      {
        "title": "GPU Utilization",
        "targets": [{
          "expr": "ollama_gpu_utilization_percent"
        }],
        "type": "graph"
      },
      {
        "title": "Request Rate",
        "targets": [{
          "expr": "rate(nginx_http_requests_total[5m])"
        }],
        "type": "graph"
      },
      {
        "title": "Response Time P95",
        "targets": [{
          "expr": "histogram_quantile(0.95, rate(nginx_http_request_duration_seconds_bucket[5m]))"
        }],
        "type": "graph"
      }
    ]
  }
}
```

### Alerting

```yaml
# /etc/prometheus/alerts.yml
groups:
  - name: ollama_alerts
    rules:
      - alert: OllamaDown
        expr: ollama_up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Serveur Ollama indisponible"
          description: "Le serveur Ollama ne répond plus depuis 2 minutes"

      - alert: HighGPUMemory
        expr: ollama_gpu_memory_mb > 10000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Mémoire GPU élevée"
          description: "Utilisation mémoire GPU > 10GB"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(nginx_http_request_duration_seconds_bucket[5m])) > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Temps de réponse élevé"
          description: "P95 > 30 secondes"
```

---

## ⚡ HAUTE DISPONIBILITÉ

### Architecture Multi-Nœuds

Pour garantir la continuité de service, déployez plusieurs serveurs Ollama :

#### Configuration Cluster (3 Nœuds)

```
Node 1: 192.168.1.50:11434 (Primary)
Node 2: 192.168.1.51:11434 (Replica)
Node 3: 192.168.1.52:11434 (Replica)

Load Balancer: 192.168.1.100
```

#### Synchronisation des Modèles

```bash
# Méthode 1 : NFS Shared Storage

# Sur serveur NFS (192.168.1.200)
sudo apt install -y nfs-kernel-server

# Créer répertoire partagé
sudo mkdir -p /export/ollama-models
sudo chown nobody:nogroup /export/ollama-models

# Configuration NFS
echo "/export/ollama-models 192.168.1.0/24(rw,sync,no_subtree_check)" | sudo tee -a /etc/exports

# Activer export
sudo exportfs -a
sudo systemctl restart nfs-kernel-server

# Sur chaque nœud Ollama
sudo apt install -y nfs-common
sudo mkdir -p /usr/share/ollama/.ollama/models
sudo mount 192.168.1.200:/export/ollama-models /usr/share/ollama/.ollama/models

# Mount permanent (fstab)
echo "192.168.1.200:/export/ollama-models /usr/share/ollama/.ollama/models nfs defaults 0 0" | sudo tee -a /etc/fstab
```

#### Méthode 2 : Rsync Automatique

```bash
#!/bin/bash
# /usr/local/bin/sync-ollama-models.sh

PRIMARY="192.168.1.50"
SECONDARY=("192.168.1.51" "192.168.1.52")
MODELS_DIR="/usr/share/ollama/.ollama/models"

for host in "${SECONDARY[@]}"; do
    rsync -avz --delete $MODELS_DIR/ $host:$MODELS_DIR/
done
```

```bash
# Cron toutes les heures
echo "0 * * * * /usr/local/bin/sync-ollama-models.sh" | sudo crontab -
```

### Failover Automatique

```nginx
# Configuration Nginx avec failover
upstream ollama_backend {
    server 192.168.1.50:11434 max_fails=3 fail_timeout=30s;
    server 192.168.1.51:11434 backup;  # Utilisé si primary fail
    server 192.168.1.52:11434 backup;
}
```

### Keepalived (IP Virtuelle)

```bash
# Installation sur load balancer
sudo apt install -y keepalived

# Configuration /etc/keepalived/keepalived.conf
cat > /etc/keepalived/keepalived.conf <<EOF
vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1
    
    authentication {
        auth_type PASS
        auth_pass secret123
    }
    
    virtual_ipaddress {
        192.168.1.100/24
    }
}
EOF

# Démarrer
sudo systemctl start keepalived
sudo systemctl enable keepalived
```

---

## 🐛 TROUBLESHOOTING RÉSEAU

### Problème 1 : Clients ne peuvent pas se connecter

**Symptômes** : Timeout ou "connection refused"

**Diagnostic** :

```bash
# Depuis client, tester connectivité
ping 192.168.1.50

# Tester port
telnet 192.168.1.50 11434
# ou
nc -zv 192.168.1.50 11434

# Test HTTP
curl -v http://192.168.1.50:11434/api/tags
```

**Solutions** :

1. **Vérifier pare-feu serveur** :
```bash
sudo ufw status
sudo ufw allow from 192.168.1.0/24 to any port 11434
```

2. **Vérifier configuration Ollama** :
```bash
sudo systemctl status ollama
sudo netstat -tlnp | grep 11434
```

3. **Vérifier logs** :
```bash
sudo journalctl -u ollama -f
```

### Problème 2 : Latence Élevée

**Symptômes** : Réponses lentes (> 30 secondes)

**Diagnostic** :

```bash
# Mesurer latence réseau
ping -c 10 192.168.1.50

# Test charge serveur
ssh admin@192.168.1.50
top
nvidia-smi  # Si GPU

# Test IO disque
sudo iotop
```

**Solutions** :

1. **Optimiser réseau** :
   - Utiliser connexion 1 Gbps minimum
   - Réduire nombre de hops réseau
   - Désactiver QoS si conflit

2. **Optimiser serveur** :
   - Ajouter RAM (16GB → 32GB)
   - Utiliser GPU NVIDIA
   - Utiliser SSD NVMe

3. **Optimiser modèle** :
   - Utiliser modèle plus léger (llama3.2 au lieu de llama3.1)

### Problème 3 : Load Balancer ne fonctionne pas

**Diagnostic** :

```bash
# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Logs
sudo tail -f /var/log/nginx/error.log

# Test upstream
curl -v http://localhost/api/tags
```

**Solutions** :

1. Vérifier backends actifs :
```bash
# Dans configuration Nginx
upstream ollama_backend {
    server 192.168.1.50:11434 check;  # Ajouter check
}
```

2. Augmenter timeouts :
```nginx
proxy_read_timeout 600s;
proxy_connect_timeout 60s;
```

### Problème 4 : Modèles non synchronisés

**Diagnostic** :

```bash
# Sur chaque nœud
ssh admin@192.168.1.50 "ollama list"
ssh admin@192.168.1.51 "ollama list"

# Comparer
```

**Solutions** :

```bash
# Re-télécharger sur nœud manquant
ssh admin@192.168.1.51 "ollama pull llama3.1:latest"

# Ou utiliser rsync
rsync -avz ~/.ollama/models/ admin@192.168.1.51:~/.ollama/models/
```

### Problème 5 : GPU Non Détecté

**Diagnostic** :

```bash
# Vérifier drivers NVIDIA
nvidia-smi

# Vérifier CUDA
nvcc --version

# Test Ollama utilise GPU
ollama run llama3.1:latest "test" --verbose
```

**Solutions** :

```bash
# Réinstaller drivers NVIDIA
sudo apt purge nvidia-*
sudo ubuntu-drivers autoinstall
sudo reboot

# Vérifier après reboot
nvidia-smi
```

---

## ⚡ OPTIMISATION PERFORMANCE

### 1. Optimisation Réseau

#### MTU (Maximum Transmission Unit)

```bash
# Augmenter MTU pour jumbo frames (si réseau le supporte)
sudo ip link set eth0 mtu 9000

# Permanent (netplan)
sudo tee /etc/netplan/01-netcfg.yaml <<EOF
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: true
      mtu: 9000
EOF

sudo netplan apply
```

#### TCP Tuning

```bash
# /etc/sysctl.conf
sudo tee -a /etc/sysctl.conf <<EOF

# TCP optimizations
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq

# Connection tracking
net.netfilter.nf_conntrack_max = 262144
net.ipv4.netfilter.ip_conntrack_max = 262144
EOF

# Appliquer
sudo sysctl -p
```

### 2. Optimisation GPU

```bash
# Persistence Mode (conserve état GPU)
sudo nvidia-smi -pm 1

# Clock maximal
sudo nvidia-smi -lgc 1500  # Ajuster selon GPU

# Power limit (éviter throttling)
sudo nvidia-smi -pl 350  # 350W (ajuster selon GPU)
```

### 3. Optimisation Ollama

#### Variables d'Environnement

```bash
# /etc/systemd/system/ollama.service.d/performance.conf
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_NUM_PARALLEL=4"          # Requêtes parallèles
Environment="OLLAMA_MAX_LOADED_MODELS=3"     # Modèles en cache
Environment="OLLAMA_KEEP_ALIVE=5m"           # Garde modèle en mémoire
Environment="OLLAMA_MAX_QUEUE=512"           # Taille queue requêtes
Environment="CUDA_VISIBLE_DEVICES=0"         # GPU à utiliser

sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### 4. Cache & CDN Interne

```nginx
# Nginx avec cache
proxy_cache_path /var/cache/nginx/ollama levels=1:2 keys_zone=ollama_cache:10m max_size=1g inactive=60m;

server {
    location /api/tags {
        proxy_cache ollama_cache;
        proxy_cache_valid 200 5m;
        proxy_pass http://ollama_backend;
    }
}
```

### 5. Connection Pooling

```typescript
// Configuration client TITANE (TypeScript)
// src/services/ai/providers/ollama.ts

const ollamaClient = axios.create({
  baseURL: 'http://192.168.1.50:11434',
  timeout: 60000,
  maxRedirects: 0,
  httpAgent: new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 50,
    maxFreeSockets: 10
  })
});
```

### 6. Benchmark & Profiling

```bash
#!/bin/bash
# benchmark-ollama.sh

OLLAMA_URL="http://192.168.1.50:11434"
MODEL="llama3.1:latest"
REQUESTS=100

echo "Benchmarking $REQUESTS requests..."

for i in $(seq 1 $REQUESTS); do
    START=$(date +%s%3N)
    
    curl -s "$OLLAMA_URL/api/generate" -d "{
        \"model\": \"$MODEL\",
        \"prompt\": \"Test $i\",
        \"stream\": false
    }" > /dev/null
    
    END=$(date +%s%3N)
    DURATION=$((END - START))
    
    echo "$i,$DURATION" >> benchmark_results.csv
done

# Statistiques
awk -F',' '{sum+=$2; if($2>max) max=$2; if(min=="" || $2<min) min=$2} END {
    print "Average:", sum/NR, "ms"
    print "Min:", min, "ms"
    print "Max:", max, "ms"
}' benchmark_results.csv
```

---

## 🏢 SCÉNARIOS D'ARCHITECTURE ENTREPRISE

### Scénario 1 : PME (10-50 Utilisateurs)

```
┌─────────────────────────────────┐
│  Switch 1 Gbps                  │
│                                 │
│  Clients: 10-50 TITANE∞         │
│         ↓                       │
│  Serveur Ollama Unique          │
│  • CPU: 16 cores                │
│  • RAM: 32 GB                   │
│  • GPU: RTX 3090 (24GB)         │
│  • Disque: 500 GB NVMe          │
└─────────────────────────────────┘

Coût estimé: 3000-5000 €
Performance: 5-10 req/s
```

### Scénario 2 : Moyenne Entreprise (50-200 Utilisateurs)

```
┌──────────────────────────────────────────┐
│  Load Balancer (Nginx)                   │
│           ↓           ↓                  │
│  Serveur 1         Serveur 2            │
│  RTX 4090         RTX 4090              │
│           ↓           ↓                  │
│  NFS Shared Storage (Modèles)           │
│                                          │
│  + Monitoring (Prometheus/Grafana)       │
└──────────────────────────────────────────┘

Coût estimé: 8000-15000 €
Performance: 20-50 req/s
Disponibilité: 99.9%
```

### Scénario 3 : Grande Entreprise (200+ Utilisateurs)

```
┌───────────────────────────────────────────────┐
│  Load Balancer HA (Keepalived)               │
│  192.168.1.100 (VIP)                          │
│           │                                   │
│  ┌────────┴──────┬──────────┬──────────┐     │
│  ↓               ↓          ↓          ↓     │
│ Node1          Node2      Node3      Node4   │
│ RTX A6000     RTX A6000  RTX A6000  RTX A6000│
│           │                                   │
│           ↓                                   │
│  Ceph Storage Cluster (1TB+)                 │
│           │                                   │
│           ↓                                   │
│  Monitoring Stack (Prometheus/Grafana/ELK)   │
│                                               │
│  + Backup automatique                         │
│  + Disaster Recovery                          │
└───────────────────────────────────────────────┘

Coût estimé: 50000-100000 €
Performance: 100-500 req/s
Disponibilité: 99.99%
SLA: 24/7
```

### Scénario 4 : Multi-Sites

```
Site A (Paris)                Site B (Lyon)
┌──────────────┐             ┌──────────────┐
│ Cluster 3    │ ← VPN →     │ Cluster 3    │
│ serveurs     │   (GRE)     │ serveurs     │
└──────────────┘             └──────────────┘
      │                            │
      └─────── Sync Models ────────┘
      
Site C (Remote)
┌──────────────┐
│ Client VPN   │
│ TITANE∞      │
└──────────────┘
```

**Configuration VPN** :

```bash
# WireGuard VPN
sudo apt install -y wireguard

# Configuration serveur (Paris)
sudo tee /etc/wireguard/wg0.conf <<EOF
[Interface]
Address = 10.0.0.1/24
PrivateKey = SERVER_PRIVATE_KEY
ListenPort = 51820

[Peer]  # Lyon
PublicKey = LYON_PUBLIC_KEY
AllowedIPs = 10.0.0.2/32

[Peer]  # Remote
PublicKey = REMOTE_PUBLIC_KEY
AllowedIPs = 10.0.0.100/32
EOF

# Démarrer
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0
```

### Scénario 5 : Cloud Hybride

```
┌─────────────────────────────────────────┐
│  On-Premise (Serveurs critiques)        │
│  • Ollama Node 1, 2, 3                  │
│  • Données sensibles                    │
└─────────────────┬───────────────────────┘
                  │ VPN/Direct Connect
                  ↓
┌─────────────────────────────────────────┐
│  Cloud (AWS/Azure/GCP)                  │
│  • Ollama Node 4, 5 (Scale dynamique)  │
│  • Backup & DR                          │
│  • Burst capacity                       │
└─────────────────────────────────────────┘
```

---

## 📋 CHECKLIST DE DÉPLOIEMENT

### Pré-Déploiement

- [ ] Infrastructure réseau validée (bande passante, latence)
- [ ] Serveur(s) Ollama provisionné(s)
- [ ] GPU NVIDIA installé et testé (si applicable)
- [ ] Firewall configuré
- [ ] Sauvegardes configurées
- [ ] Plan de rollback défini

### Installation Serveur

- [ ] Ollama installé et configuré en mode réseau
- [ ] Modèles IA téléchargés
- [ ] Service systemd configuré et actif
- [ ] Logs activés
- [ ] Health checks fonctionnels

### Installation Clients

- [ ] TITANE∞ installé sur tous les postes
- [ ] Configuration réseau appliquée
- [ ] Tests de connexion réussis
- [ ] Fallback local configuré (si applicable)

### Sécurité

- [ ] Pare-feu configuré (serveur + clients)
- [ ] TLS/SSL activé (si applicable)
- [ ] Authentification configurée (si applicable)
- [ ] Audit logs activés
- [ ] Plan de gestion des incidents défini

### Monitoring

- [ ] Prometheus installé et configuré
- [ ] Grafana dashboards créés
- [ ] Alertes configurées
- [ ] Tests d'alerting réussis

### Tests de Charge

- [ ] Benchmark performance effectué
- [ ] Tests de montée en charge réussis
- [ ] Tests de failover réussis (si HA)
- [ ] Latence réseau mesurée (< 10ms recommandé)

### Documentation

- [ ] Documentation admin rédigée
- [ ] Guide utilisateur distribué
- [ ] Procédures d'incident documentées
- [ ] Contacts support définis

### Formation

- [ ] Administrateurs formés
- [ ] Utilisateurs finaux formés
- [ ] Support formé

### Go Live

- [ ] Déploiement progressif planifié (pilote → production)
- [ ] Fenêtre de maintenance communiquée
- [ ] Équipe support disponible
- [ ] Rollback plan prêt

---

## 📚 ANNEXES

### A. Ports Réseau Utilisés

| Service | Port | Protocole | Description |
|---------|------|-----------|-------------|
| Ollama | 11434 | TCP | API principale |
| Nginx | 80 | TCP | HTTP (optionnel) |
| Nginx | 443 | TCP | HTTPS (optionnel) |
| HAProxy Stats | 8404 | TCP | Dashboard stats |
| Prometheus | 9090 | TCP | Métriques |
| Grafana | 3000 | TCP | Dashboard monitoring |
| Node Exporter | 9100 | TCP | Métriques système |

### B. Commandes Utiles

```bash
# Vérifier connectivité Ollama
curl -sf http://IP:11434/api/tags | jq .

# Tester génération
curl http://IP:11434/api/generate -d '{"model":"llama3.1:latest","prompt":"test"}'

# Monitoring GPU temps réel
watch -n 1 nvidia-smi

# Logs Ollama en temps réel
sudo journalctl -u ollama -f

# Statistiques réseau
iftop -i eth0

# Test performance disque
sudo fio --name=randrw --ioengine=libaio --iodepth=16 --rw=randrw --bs=4k --direct=1 --size=1G --runtime=60

# Liste connexions actives
ss -tunap | grep 11434
```

### C. Variables d'Environnement Ollama

| Variable | Description | Défaut | Exemple |
|----------|-------------|--------|---------|
| `OLLAMA_HOST` | Adresse bind | `127.0.0.1:11434` | `0.0.0.0:11434` |
| `OLLAMA_ORIGINS` | CORS origins | `localhost` | `*` |
| `OLLAMA_NUM_PARALLEL` | Requêtes parallèles | `1` | `4` |
| `OLLAMA_MAX_LOADED_MODELS` | Modèles en mémoire | `1` | `3` |
| `OLLAMA_KEEP_ALIVE` | Durée cache modèle | `5m` | `15m` |
| `OLLAMA_MAX_QUEUE` | Taille queue | `512` | `1024` |
| `CUDA_VISIBLE_DEVICES` | GPU à utiliser | all | `0,1` |

### D. Ressources Complémentaires

- **Documentation Ollama** : https://ollama.com/docs
- **TITANE∞ Architecture** : [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **TITANE∞ Guide Installation** : [../GUIDE_INSTALLATION_SETUP_v27.0.0.md](../GUIDE_INSTALLATION_SETUP_v27.0.0.md)
- **Forum Support** : https://github.com/KallokTherok1994/TITANE_INFINITY/discussions
- **Issues Tracker** : https://github.com/KallokTherok1994/TITANE_INFINITY/issues

### E. Calcul Dimensionnement

**Formule estimation utilisateurs** :

```
Nombre d'utilisateurs = (GPU Memory / Model Size) * Concurrency Factor

Exemple RTX 3090 (24 GB) avec llama3.1 (4.9 GB):
  = (24 / 4.9) * 0.7
  ≈ 3-4 utilisateurs simultanés
```

**Bandwidth requis** :

```
Bandwidth = Users * Avg_Request_Size * Requests_per_minute

Exemple 50 utilisateurs:
  = 50 * 100 KB * 2 req/min
  = 10 MB/min
  ≈ 1.4 Mbps minimum
```

---

## ✅ CONCLUSION

Ce guide couvre l'installation complète de **TITANE∞** avec **Ollama** en réseau production. Pour toute question ou support, consultez la documentation officielle ou ouvrez une issue sur GitHub.

**Rappel des points clés** :

1. ✅ Serveur Ollama en mode réseau (`0.0.0.0:11434`)
2. ✅ Pare-feu configuré pour sécuriser l'accès
3. ✅ Load balancer pour haute disponibilité
4. ✅ Monitoring avec Prometheus/Grafana
5. ✅ Backups et disaster recovery
6. ✅ Documentation et formation équipes

**Support** :

- 💬 Discord : https://discord.gg/titane
- 📧 Email : support@titane.dev
- 🐛 Issues : https://github.com/KallokTherok1994/TITANE_INFINITY/issues

---

**Document créé le** : 14 Février 2026  
**Version TITANE∞** : 27.0.2+  
**Auteur** : TITANE∞ Team  
**License** : Voir LICENSE.md

_Copyright © 2025-2026 Humain Total / TITANE Team. Tous droits réservés._
