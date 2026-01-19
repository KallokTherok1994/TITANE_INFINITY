#!/bin/bash

################################################################################

# 📋 DEPLOYMENT SCRIPTS QUICK REFERENCE

################################################################################

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════╗
║ ║
║ 🚀 TITANE∞ v26.3.0 DEPLOYMENT SUITE ║
║ ║
║ Complete Build • Test • Deploy • Install ║
║ ║
╚══════════════════════════════════════════════════════════════════════════╝

📦 WHAT'S INCLUDED:

1. 🎯 deploy-interactive.sh
   └─ Interactive menu-driven deployment system
   └─ Best for: First-time users, flexible workflows
   └─ Usage: ./deploy-interactive.sh

2. 🔧 scripts/deploy-complete.sh
   └─ Comprehensive Bash deployment script
   └─ Best for: CI/CD, automation, power users
   └─ Features: 10 phases, full control, extensive logging
   └─ Usage: ./scripts/deploy-complete.sh [OPTIONS]

3. 🐍 scripts/deploy-orchestrator.py
   └─ Advanced Python deployment orchestrator
   └─ Best for: Complex deployments, detailed reporting
   └─ Features: JSON reports, error recovery, statistics
   └─ Usage: python3 scripts/deploy-orchestrator.py [OPTIONS]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 QUICK START:

# Option 1: Interactive Menu (Recommended)

./deploy-interactive.sh

# Option 2: Complete Deployment

./scripts/deploy-complete.sh

# Option 3: Fast Build Only

./scripts/deploy-complete.sh --skip-tests

# Option 4: Build + Install

./scripts/deploy-complete.sh --install

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

See DEPLOYMENT_GUIDE_COMPLETE.md for full documentation.

EOF
