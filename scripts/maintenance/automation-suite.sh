#!/bin/bash
# TITANE∞ Maintenance Automation Suite
# Comprehensive monitoring, maintenance, and operations scripts
# Version: 27.0.0 | Updated: 31 January 2026

set -e

LOG_DIR="/var/log/titane"
BACKUP_DIR="/var/backups/titane"
REPORT_DIR="/var/reports/titane"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_DIR/maintenance.log"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_DIR/maintenance.log"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_DIR/maintenance.log"
}

log_error() {
  echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_DIR/maintenance.log"
}

ensure_dirs() {
  mkdir -p "$LOG_DIR" "$BACKUP_DIR" "$REPORT_DIR"
}

# ═══════════════════════════════════════════════════════════════════════════
# DAILY OPERATIONS
# ═══════════════════════════════════════════════════════════════════════════

daily_morning_check() {
  log_info "🔍 Starting daily morning check..."
  
  # 1. Check GitHub Issues
  log_info "Checking GitHub issues..."
  OPEN_ISSUES=$(gh issue list --state open --limit 100 | wc -l)
  log_info "Open issues: $OPEN_ISSUES"
  
  if [ "$OPEN_ISSUES" -gt 50 ]; then
    log_warning "High number of open issues: $OPEN_ISSUES"
  fi
  
  # 2. Check system status
  log_info "Checking system status..."
  DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
  
  if [ "$DISK_USAGE" -gt 90 ]; then
    log_error "DISK USAGE CRITICAL: ${DISK_USAGE}%"
    send_slack_alert "DISK USAGE CRITICAL: ${DISK_USAGE}%"
  elif [ "$DISK_USAGE" -gt 80 ]; then
    log_warning "Disk usage high: ${DISK_USAGE}%"
  fi
  
  # 3. Check memory
  log_info "Checking memory usage..."
  MEMORY_USAGE=$(free | awk 'NR==2 {print int($3/$2 * 100)}')
  
  if [ "$MEMORY_USAGE" -gt 90 ]; then
    log_error "MEMORY CRITICAL: ${MEMORY_USAGE}%"
  fi
  
  # 4. Database backup
  log_info "Creating daily database backup..."
  BACKUP_FILE="$BACKUP_DIR/db-$(date +%Y%m%d).sql"
  sqlite3 /var/titane/db/memory.db ".dump" > "$BACKUP_FILE"
  gzip "$BACKUP_FILE"
  log_success "Database backup created: ${BACKUP_FILE}.gz"
  
  # 5. Check CI/CD
  log_info "Checking CI/CD status..."
  CI_STATUS=$(gh api repos/KallokTherok1994/TITANE_INFINITY/actions/runs --per_page=1 | jq -r '.workflow_runs[0].status')
  log_info "Latest CI/CD status: $CI_STATUS"
  
  log_success "✅ Daily morning check complete!"
}

# ═══════════════════════════════════════════════════════════════════════════
# WEEKLY OPERATIONS
# ═══════════════════════════════════════════════════════════════════════════

weekly_code_audit() {
  log_info "📊 Starting weekly code quality audit..."
  
  cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
  
  # 1. Rust linting
  log_info "Running Rust clippy..."
  if cargo clippy --all -- -D warnings > "$LOG_DIR/clippy.log" 2>&1; then
    log_success "Rust linting passed ✓"
  else
    log_warning "Rust linting found issues - see $LOG_DIR/clippy.log"
  fi
  
  # 2. TypeScript linting
  log_info "Running ESLint..."
  if pnpm run lint > "$LOG_DIR/eslint.log" 2>&1; then
    log_success "TypeScript linting passed ✓"
  else
    log_warning "TypeScript linting found issues - see $LOG_DIR/eslint.log"
  fi
  
  # 3. Tests
  log_info "Running test suite..."
  if cargo test --all > "$LOG_DIR/cargo-tests.log" 2>&1; then
    log_success "Cargo tests passed ✓"
  else
    log_error "Cargo tests failed - see $LOG_DIR/cargo-tests.log"
  fi
  
  if pnpm run test > "$LOG_DIR/jest-tests.log" 2>&1; then
    log_success "Jest tests passed ✓"
  else
    log_error "Jest tests failed - see $LOG_DIR/jest-tests.log"
  fi
  
  # 4. Security audit
  log_info "Running security audits..."
  cargo audit > "$LOG_DIR/cargo-audit.log" 2>&1 || true
  npm audit > "$LOG_DIR/npm-audit.log" 2>&1 || true
  
  log_success "✅ Weekly code audit complete!"
}

weekly_docs_audit() {
  log_info "📚 Starting weekly documentation audit..."
  
  cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
  
  # 1. Markdown linting
  log_info "Checking markdown syntax..."
  mdl docs/ > "$LOG_DIR/markdown.log" 2>&1 || true
  
  # 2. Check for outdated version references
  log_info "Checking for outdated references..."
  OLD_REFS=$(grep -r "v26\." docs/ | wc -l)
  if [ "$OLD_REFS" -gt 0 ]; then
    log_warning "Found $OLD_REFS references to v26.x (should be v27.x)"
  fi
  
  # 3. Link validation
  log_info "Validating documentation links..."
  BROKEN_LINKS=0
  while IFS= read -r file; do
    while IFS= read -r link; do
      link=$(echo "$link" | sed 's/.*(\(.*\)).*/\1/')
      if [[ "$link" == http* ]]; then
        continue
      fi
      if [ ! -f "$link" ] && [ ! -d "$link" ]; then
        log_warning "Broken link: $link in $file"
        ((BROKEN_LINKS++))
      fi
    done < <(grep -o '\[.*\](.*)'  "$file")
  done < <(find docs -name "*.md")
  
  if [ "$BROKEN_LINKS" -eq 0 ]; then
    log_success "All documentation links valid ✓"
  else
    log_warning "Found $BROKEN_LINKS broken links"
  fi
  
  log_success "✅ Weekly documentation audit complete!"
}

# ═══════════════════════════════════════════════════════════════════════════
# MONTHLY OPERATIONS
# ═══════════════════════════════════════════════════════════════════════════

monthly_infrastructure_review() {
  log_info "🏗️  Starting monthly infrastructure review..."
  
  # 1. Database optimization
  log_info "Optimizing database..."
  sqlite3 /var/titane/db/memory.db "VACUUM;"
  sqlite3 /var/titane/db/memory.db "ANALYZE;"
  log_success "Database optimized ✓"
  
  # 2. Dependency check
  log_info "Checking for outdated dependencies..."
  cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
  
  OUTDATED_RUST=$(cargo outdated 2>/dev/null | wc -l)
  OUTDATED_NPM=$(npm outdated 2>/dev/null | wc -l)
  
  log_warning "Outdated Rust crates: $OUTDATED_RUST"
  log_warning "Outdated NPM packages: $OUTDATED_NPM"
  
  # 3. Performance comparison
  log_info "Analyzing performance trends..."
  # (This would compare current metrics vs previous month)
  
  # 4. Community metrics
  log_info "Calculating community metrics..."
  ISSUES_CLOSED=$(gh issue list --state closed --since "30 days ago" | wc -l)
  STARS=$(gh repo view --json stargazerCount | jq '.stargazerCount')
  
  log_info "Issues closed this month: $ISSUES_CLOSED"
  log_info "Total repository stars: $STARS"
  
  # 5. Generate report
  REPORT_FILE="$REPORT_DIR/MONTHLY_REPORT_$(date +%Y-%m).md"
  cat > "$REPORT_FILE" << EOF
# Monthly Infrastructure Report - $(date +"%B %Y")

## Database
- VACUUM completed
- ANALYZE completed
- Size: $(du -h /var/titane/db | awk '{print $1}')

## Dependencies
- Outdated Rust crates: $OUTDATED_RUST
- Outdated NPM packages: $OUTDATED_NPM

## Community
- Issues closed: $ISSUES_CLOSED
- Total stars: $STARS

## Recommendations
- [ ] Review outdated dependencies
- [ ] Update critical packages
- [ ] Plan next optimization

Generated: $(date)
EOF
  
  log_success "Report saved to $REPORT_FILE"
  log_success "✅ Monthly infrastructure review complete!"
}

# ═══════════════════════════════════════════════════════════════════════════
# EMERGENCY PROCEDURES
# ═══════════════════════════════════════════════════════════════════════════

emergency_service_restart() {
  log_error "🚨 EMERGENCY SERVICE RESTART INITIATED"
  
  log_info "Stopping TITANE services..."
  systemctl stop titane || true
  
  sleep 2
  
  log_info "Restarting TITANE services..."
  systemctl start titane
  
  sleep 2
  
  log_info "Verifying service status..."
  if systemctl is-active --quiet titane; then
    log_success "✅ Service restarted successfully"
  else
    log_error "❌ Service failed to restart - manual intervention needed"
    return 1
  fi
}

emergency_data_restore() {
  log_error "🚨 EMERGENCY DATA RESTORE INITIATED"
  
  log_info "Stopping TITANE services..."
  systemctl stop titane || true
  
  log_info "Backing up current data..."
  CORRUPTION_BACKUP="$BACKUP_DIR/backup-corruption-$(date +%s)"
  mkdir -p "$CORRUPTION_BACKUP"
  cp -r /var/titane/db "$CORRUPTION_BACKUP/"
  
  log_info "Restoring from latest backup..."
  LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/db-*.sql.gz 2>/dev/null | head -1)
  
  if [ -z "$LATEST_BACKUP" ]; then
    log_error "❌ No backup found!"
    return 1
  fi
  
  log_info "Restoring from $LATEST_BACKUP..."
  gunzip -c "$LATEST_BACKUP" | sqlite3 /var/titane/db/memory.db
  
  log_info "Verifying database integrity..."
  if sqlite3 /var/titane/db/memory.db "PRAGMA integrity_check;" | grep -q "ok"; then
    log_success "Database integrity verified ✓"
  else
    log_error "❌ Database integrity check failed"
    return 1
  fi
  
  log_info "Restarting services..."
  systemctl start titane
  
  log_success "✅ Data restored successfully"
}

# ═══════════════════════════════════════════════════════════════════════════
# NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════

send_slack_alert() {
  local message="$1"
  # This would require SLACK_WEBHOOK_URL environment variable
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
      -H 'Content-Type: application/json' \
      -d "{\"text\": \"🚨 TITANE Alert: $message\"}" \
      2>/dev/null || true
  fi
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN MENU
# ═══════════════════════════════════════════════════════════════════════════

show_menu() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║       TITANE∞ Maintenance Automation Suite v27.0.0           ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
  echo "📋 DAILY OPERATIONS:"
  echo "  1. Morning Check (health + backups + alerts)"
  echo ""
  echo "📊 WEEKLY OPERATIONS:"
  echo "  2. Code Quality Audit (linting + tests + security)"
  echo "  3. Documentation Audit (links + consistency + freshness)"
  echo ""
  echo "📈 MONTHLY OPERATIONS:"
  echo "  4. Infrastructure Review (optimization + dependencies)"
  echo ""
  echo "🚨 EMERGENCY PROCEDURES:"
  echo "  5. Emergency Service Restart"
  echo "  6. Emergency Data Restore"
  echo ""
  echo "🔧 UTILITIES:"
  echo "  7. Run all daily tasks"
  echo "  8. Run all weekly tasks"
  echo "  9. Run all monthly tasks"
  echo "  0. Exit"
  echo ""
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

main() {
  ensure_dirs
  
  if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
      show_menu
      read -p "Select option: " choice
      
      case $choice in
        1) daily_morning_check ;;
        2) weekly_code_audit ;;
        3) weekly_docs_audit ;;
        4) monthly_infrastructure_review ;;
        5) emergency_service_restart ;;
        6) emergency_data_restore ;;
        7) daily_morning_check ;;
        8) weekly_code_audit && weekly_docs_audit ;;
        9) monthly_infrastructure_review ;;
        0) log_info "Exiting..."; exit 0 ;;
        *) log_error "Invalid option" ;;
      esac
      
      echo ""
      read -p "Press Enter to continue..."
    done
  else
    # Command-line mode
    case "$1" in
      daily) daily_morning_check ;;
      weekly-code) weekly_code_audit ;;
      weekly-docs) weekly_docs_audit ;;
      monthly) monthly_infrastructure_review ;;
      emergency-restart) emergency_service_restart ;;
      emergency-restore) emergency_data_restore ;;
      *) 
        log_error "Unknown command: $1"
        echo "Usage: $0 {daily|weekly-code|weekly-docs|monthly|emergency-restart|emergency-restore}"
        exit 1
        ;;
    esac
  fi
}

# Execute if run directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
