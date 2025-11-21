# TITANE∞ v15.5 - Dockerfile Ubuntu 24.04
# Build Tauri v2 avec GLIBC 2.39

FROM ubuntu:24.04

# Éviter les prompts interactifs
ENV DEBIAN_FRONTEND=noninteractive

# Installer dépendances système
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libssl-dev \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf \
    nodejs \
    npm \
    git \
    && rm -rf /var/lib/apt/lists/*

# Installer Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Vérifier versions
RUN echo "📊 Versions installées :" && \
    echo "  Node : $(node --version)" && \
    echo "  NPM : $(npm --version)" && \
    echo "  Cargo : $(cargo --version)" && \
    echo "  Rustc : $(rustc --version)" && \
    echo "  GLIBC : $(ldd --version | head -1)"

# Répertoire de travail
WORKDIR /app

# Instructions d'utilisation
RUN echo "╔═══════════════════════════════════════════════════════════════╗" && \
    echo "║  TITANE∞ Builder - Ubuntu 24.04 + GLIBC 2.39                ║" && \
    echo "╚═══════════════════════════════════════════════════════════════╝"

# Commande par défaut
CMD ["/bin/bash"]
