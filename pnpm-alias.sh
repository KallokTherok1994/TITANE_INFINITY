# TITANE∞ - Alias pnpm pour développement
# Source ce fichier dans ~/.bashrc ou ~/.zshrc:
#   echo 'source /path/to/TITANE_INFINITY/pnpm-alias.sh' >> ~/.bashrc

# Alias pour utiliser pnpm local avec la bonne toolchain
alias pnpm-titane='cd /home/titane-os/Documents/GitHub/TITANE_INFINITY && ./pnpm-local.sh'

# Raccourcis communs
alias titane-install='cd /home/titane-os/Documents/GitHub/TITANE_INFINITY && ./pnpm-local.sh install'
alias titane-build='cd /home/titane-os/Documents/GitHub/TITANE_INFINITY && ./pnpm-local.sh run build'
alias titane-dev='cd /home/titane-os/Documents/GitHub/TITANE_INFINITY && ./pnpm-local.sh run dev:tauri'
alias titane-test='cd /home/titane-os/Documents/GitHub/TITANE_INFINITY && ./pnpm-local.sh run test -- --run'
alias titane-check='cd /home/titane-os/Documents/GitHub/TITANE_INFINITY && ./pnpm-local.sh run check'
alias titane-lint='cd /home/titane-os/Documents/GitHub/TITANE_INFINITY && ./pnpm-local.sh run lint'

echo "✅ TITANE∞ aliases loaded!"
echo "Available commands:"
echo "  pnpm-titane <cmd>  - Run pnpm with local toolchain"
echo "  titane-install     - Install dependencies"
echo "  titane-build       - Build production"
echo "  titane-dev         - Start dev server"
echo "  titane-test        - Run tests"
echo "  titane-check       - TypeScript check"
echo "  titane-lint        - ESLint check"
