#!/bin/bash

set -e

echo "Vérification des prérequis Rust et Cargo..."
if ! command -v cargo &> /dev/null; then
  echo "Rust/Cargo n'est pas installé. Veuillez installer Rust via https://rustup.rs/"
  exit 1
fi

echo "Installation de tauri-driver via Cargo..."
cargo install tauri-driver

echo "Vérification de l'installation..."
if ! command -v tauri-driver &> /dev/null; then
  echo "Échec de l'installation de tauri-driver."
  exit 1
fi

echo "Installation réussie. Commande disponible : tauri-driver --help"