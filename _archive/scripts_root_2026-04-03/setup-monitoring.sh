#!/bin/bash
# TITANE∞ v22.0.0 - Production Monitoring Setup
# Prometheus + Grafana stack for production observability

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║   📊 TITANE∞ Production Monitoring Setup v22.0.0                 ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
  echo "❌ Docker not found. Please install Docker first."
  echo "   https://docs.docker.com/get-docker/"
  exit 1
fi

echo "✅ Docker found: $(docker --version)"
echo ""

# Create monitoring directory
MONITORING_DIR="$PROJECT_ROOT/monitoring"
mkdir -p "$MONITORING_DIR"/{prometheus,grafana/{dashboards,provisioning}}

echo "📁 Creating monitoring stack configuration..."

# Create Prometheus config
cat >"$MONITORING_DIR/prometheus/prometheus.yml" <<'EOF'
# TITANE∞ Prometheus Configuration v22.0.0
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'titane-infinity'
    environment: 'production'

# Alerting rules
alerting:
  alertmanagers:
    - static_configs:
        - targets: []

# Scrape configs
scrape_configs:
  # TITANE∞ Backend Metrics
  - job_name: 'titane-backend'
    static_configs:
      - targets: ['host.docker.internal:9091']
    metrics_path: '/metrics'
    scrape_interval: 5s

  # System Metrics (Node Exporter)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF

# Create Grafana datasource provisioning
cat >"$MONITORING_DIR/grafana/provisioning/datasources.yml" <<'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

# Create Grafana dashboard for TITANE∞
cat >"$MONITORING_DIR/grafana/dashboards/titane-overview.json" <<'EOF'
{
  "dashboard": {
    "title": "TITANE∞ System Overview",
    "tags": ["titane", "system"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "System Health",
        "type": "gauge",
        "targets": [
          {
            "expr": "titane_system_health",
            "legendFormat": "Health Score"
          }
        ],
        "gridPos": {"x": 0, "y": 0, "w": 6, "h": 8}
      },
      {
        "id": 2,
        "title": "Active Cores",
        "type": "stat",
        "targets": [
          {
            "expr": "titane_active_cores",
            "legendFormat": "Cores"
          }
        ],
        "gridPos": {"x": 6, "y": 0, "w": 6, "h": 8}
      },
      {
        "id": 3,
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_cpu_seconds_total[5m])",
            "legendFormat": "CPU {{mode}}"
          }
        ],
        "gridPos": {"x": 0, "y": 8, "w": 12, "h": 8}
      },
      {
        "id": 4,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "node_memory_Active_bytes / node_memory_MemTotal_bytes",
            "legendFormat": "Memory"
          }
        ],
        "gridPos": {"x": 12, "y": 8, "w": 12, "h": 8}
      }
    ]
  }
}
EOF

# Create Docker Compose for monitoring stack
cat >"$MONITORING_DIR/docker-compose.yml" <<'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: titane-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: titane-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=titane2025
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: titane-node-exporter
    ports:
      - "9100:9100"
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
EOF

echo "✅ Configuration files created"
echo ""

# Start monitoring stack
echo "🚀 Starting monitoring stack..."
cd "$MONITORING_DIR"
docker-compose up -d

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║   ✅ Monitoring Stack Deployed                                    ║"
echo "║                                                                    ║"
echo "║   📊 Prometheus: http://localhost:9090                            ║"
echo "║   📈 Grafana:    http://localhost:3000                            ║"
echo "║                  (admin / titane2025)                              ║"
echo "║   📡 Node Exporter: http://localhost:9100                         ║"
echo "║                                                                    ║"
echo "║   Next Steps:                                                      ║"
echo "║   1. Access Grafana and explore dashboards                        ║"
echo "║   2. Configure TITANE∞ to export metrics to :9091                ║"
echo "║   3. Set up alerting rules in Prometheus                          ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
