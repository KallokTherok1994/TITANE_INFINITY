#!/usr/bin/env node

/**
 * TITANE∞ v26.3.0 — LTM Integration Optimizer
 * Script d'optimisation et de correction du système de mémoire LTM
 *
 * OBJECTIFS :
 * 1. Audit complet de la cohérence des données mémoire
 * 2. Migration vers le schéma unifié (UnifiedMemoryService)
 * 3. Optimisation des performances (caches, indexes)
 * 4. Nettoyage et déduplication
 * 5. Validation d'intégrité
 *
 * EXÉCUTION : node scripts/optimize-ltm-integration.js
 */

import fs from 'fs/promises';
import path from 'path';

const MEMORY_DIR = path.join(process.cwd(), 'memory');
const BACKUP_DIR = path.join(process.cwd(), 'memory', 'backup');

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '═'.repeat(60));
  log(title, 'bold');
  console.log('═'.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

class LTMOptimizer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      entriesMigrated: 0,
      duplicatesRemoved: 0,
      errorsFixed: 0,
      backupCreated: false,
    };
    this.issues = [];
    this.fixes = [];
  }

  async run() {
    console.log('=== DEBUG: run() method called ===');
    logSection('🚀 TITANE∞ LTM Integration Optimizer v26.3.0');
    logInfo("Démarrage de l'optimisation du système de mémoire...\n");

    try {
      // Étape 1: Créer backup
      await this.createBackup();

      // Étape 2: Audit des fichiers mémoire
      await this.auditMemoryFiles();

      // Étape 3: Vérifier la cohérence des schémas
      await this.validateSchemas();

      // Étape 4: Migrer vers le schéma unifié
      await this.migrateToUnifiedSchema();

      // Étape 5: Nettoyage et déduplication
      await this.cleanupAndDeduplicate();

      // Étape 6: Optimisation des indexes
      await this.optimizeIndexes();

      // Étape 7: Validation d'intégrité finale
      await this.finalValidation();

      // Étape 8: Générer le rapport
      await this.generateReport();

      logSection('✨ Optimisation Terminée');
      logSuccess(`Fichiers traités: ${this.stats.filesProcessed}`);
      logSuccess(`Entrées migrées: ${this.stats.entriesMigrated}`);
      logSuccess(`Doublons supprimés: ${this.stats.duplicatesRemoved}`);
      logSuccess(`Erreurs corrigées: ${this.stats.errorsFixed}`);

      if (this.issues.length > 0) {
        logWarn(`\n⚠️  Problèmes détectés (non critiques): ${this.issues.length}`);
        this.issues.forEach(issue => logWarn(`   - ${issue}`));
      }

      logSuccess('\n🎉 Optimisation LTM réussie ! Système de mémoire harmonisé.');
    } catch (error) {
      logError(`\n❌ Erreur fatale: ${error.message}`);
      logError(error.stack);
      process.exit(1);
    }
  }

  async createBackup() {
    logSection('📦 Création Backup');
    logInfo("Création d'un backup des fichiers mémoire...");

    try {
      await fs.mkdir(BACKUP_DIR, { recursive: true });

      const files = [
        'stm.json',
        'mtm.json',
        'ltm.json',
        'cognitive.json',
        'harmonics.json',
        'singularity.json',
        'system_state.json',
      ];
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      for (const file of files) {
        const sourcePath = path.join(MEMORY_DIR, file);
        const destPath = path.join(BACKUP_DIR, `${file}.backup-${timestamp}`);

        try {
          const content = await fs.readFile(sourcePath, 'utf-8');
          await fs.writeFile(destPath, content);
          logSuccess(`   Backup: ${file}`);
        } catch (e) {
          // Fichier peut-être inexistant, ignorer
          if (e.code !== 'ENOENT') {
            throw e;
          }
        }
      }

      this.stats.backupCreated = true;
      logSuccess('Backup créé avec succès');
    } catch (error) {
      logError(`Échec du backup: ${error.message}`);
      throw error;
    }
  }

  async auditMemoryFiles() {
    logSection('🔍 Audit des fichiers mémoire');
    logInfo('Analyse des fichiers mémoire existants...\n');

    const files = [
      'stm.json',
      'mtm.json',
      'ltm.json',
      'cognitive.json',
      'harmonics.json',
      'singularity.json',
      'system_state.json',
    ];

    for (const file of files) {
      const filePath = path.join(MEMORY_DIR, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);

        this.stats.filesProcessed++;
        logSuccess(`   ${file}: ${JSON.stringify(data).length} bytes, structure valide`);

        // Détecter les problèmes potentiels
        this.detectIssues(file, data);
      } catch (error) {
        if (error.code === 'ENOENT') {
          logWarn(`   ${file}: Fichier manquant (sera créé)`);
        } else {
          logError(`   ${file}: Erreur de parsing - ${error.message}`);
          this.issues.push(`Fichier ${file} corrompu ou invalide`);
        }
      }
    }
  }

  detectIssues(filename, data) {
    // Vérifier la présence des champs requis selon le type de fichier
    if (filename === 'cognitive.json') {
      if (!data.cognitive_memory) {
        this.issues.push(`${filename}: champ 'cognitive_memory' manquant`);
      }
      if (!data.conversations || !Array.isArray(data.conversations)) {
        this.issues.push(`${filename}: 'conversations' doit être un tableau`);
      }
    }

    if (filename === 'system_state.json') {
      if (!data.system_state) {
        this.issues.push(`${filename}: champ 'system_state' manquant`);
      }
      if (!data.engines) {
        this.issues.push(`${filename}: champ 'engines' manquant`);
      }
    }

    // Vérifier les timestamps
    if (data.last_compaction || data.last_update || data.timestamp) {
      const timestamp = data.last_compaction || data.last_update || data.timestamp;
      if (timestamp && isNaN(new Date(timestamp).getTime())) {
        this.issues.push(`${filename}: timestamp invalide`);
      }
    }
  }

  async validateSchemas() {
    logSection('🔬 Validation des schémas');
    logInfo('Vérification de la cohérence des schémas mémoire...\n');

    // Charger les trois fichiers principaux
    const [stm, mtm, ltm] = await Promise.all([
      this.loadJson('stm.json'),
      this.loadJson('mtm.json'),
      this.loadJson('ltm.json'),
    ]);

    // Vérifier que tous les entrées ont le bon schéma
    const allEntries = [...(stm || []), ...(mtm || []), ...(ltm || [])];

    let invalidCount = 0;
    for (const entry of allEntries) {
      if (!entry.id || !entry.content || typeof entry.importance !== 'number') {
        invalidCount++;
        this.issues.push(`Entrée invalide: ${entry.id || 'sans ID'} - champs manquants`);
      }
    }

    if (invalidCount > 0) {
      logWarn(`   ${invalidCount} entrées avec schéma invalide détectées`);
    } else {
      logSuccess('   Toutes les entrées ont un schéma valide');
    }

    // Vérifier les chevauchements entre niveaux
    const stmIds = new Set(stm.map(e => e.id));
    const mtmIds = new Set(mtm.map(e => e.id));
    const ltmIds = new Set(ltm.map(e => e.id));

    const stmMtmOverlap = [...stmIds].filter(id => mtmIds.has(id));
    const stmLtmOverlap = [...stmIds].filter(id => ltmIds.has(id));
    const mtmLtmOverlap = [...mtmIds].filter(id => ltmIds.has(id));

    if (stmMtmOverlap.length > 0) {
      this.issues.push(`${stmMtmOverlap.length} ID dupliqués entre STM et MTM`);
    }
    if (stmLtmOverlap.length > 0) {
      this.issues.push(`${stmLtmOverlap.length} ID dupliqués entre STM et LTM`);
    }
    if (mtmLtmOverlap.length > 0) {
      this.issues.push(`${mtmLtmOverlap.length} ID dupliqués entre MTM et LTM`);
    }
  }

  async migrateToUnifiedSchema() {
    logSection('🔄 Migration vers schéma unifié');
    logInfo('Migration des données vers le schéma UnifiedMemoryService...\n');

    const files = ['stm.json', 'mtm.json', 'ltm.json'];

    for (const file of files) {
      const tier = file.split('.')[0].toUpperCase();
      const data = (await this.loadJson(file)) || [];

      let migratedCount = 0;
      const migrated = data.map(entry => {
        // Vérifier si l'entrée a déjà le bon schéma
        if (entry.id && entry.content && typeof entry.importance === 'number') {
          return entry;
        }

        // Migrer l'entrée
        migratedCount++;
        return {
          id:
            entry.id ||
            `${tier.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: entry.content || entry.text || entry.message || 'Contenu manquant',
          type: entry.type || this.inferType(entry),
          importance:
            typeof entry.importance === 'number'
              ? entry.importance
              : this.inferImportance(entry, tier),
          timestamp: entry.timestamp || entry.createdAt || Date.now(),
          lastAccessed:
            entry.lastAccessed || entry.accessedAt || entry.timestamp || Date.now(),
          accessCount: entry.accessCount || entry.views || 0,
          ...(entry.conversationId && { conversationId: entry.conversationId }),
          ...(entry.metadata && { metadata: entry.metadata }),
          ...(entry.ttl && { ttl: entry.ttl }),
        };
      });

      // Écrire le fichier migré
      await fs.writeFile(path.join(MEMORY_DIR, file), JSON.stringify(migrated, null, 2));

      this.stats.entriesMigrated += migratedCount;
      if (migratedCount > 0) {
        logSuccess(`   ${file}: ${migratedCount} entrées migrées`);
      } else {
        logInfo(`   ${file}: déjà au format unifié`);
      }
    }
  }

  inferType(entry) {
    // Inférer le type basé sur le contenu ou les métadonnées
    if (entry.type) return entry.type;

    const content = (entry.content || '').toLowerCase();

    if (content.includes('préférence') || content.includes('je préfère')) {
      return 'preference';
    }
    if (content.includes('conversation') || content.includes('discussion')) {
      return 'conversation';
    }
    if (content.includes('décision') || content.includes('choix')) {
      return 'decision';
    }
    if (content.includes('projet') || content.includes('travail')) {
      return 'project';
    }
    if (content.includes('connaissance') || content.includes('savoir')) {
      return 'knowledge';
    }

    return 'fact';
  }

  inferImportance(entry, tier) {
    // Si l'importance est déjà définie, la retourner
    if (typeof entry.importance === 'number') {
      return entry.importance;
    }

    // Sinon, inférer basé sur le tier et d'autres facteurs
    const tierImportance = {
      STM: 0.2,
      MTM: 0.5,
      LTM: 0.8,
    };

    let importance = tierImportance[tier] || 0.5;

    // Ajuster basé sur l'accessCount si disponible
    if (entry.accessCount) {
      importance += Math.min(0.2, entry.accessCount * 0.01);
    }

    // Ajuster basé sur la longueur du contenu
    if (entry.content) {
      const length = entry.content.length;
      if (length > 500) importance += 0.1;
      if (length > 1000) importance += 0.1;
    }

    return Math.min(1.0, importance);
  }

  async cleanupAndDeduplicate() {
    logSection('🧹 Nettoyage et déduplication');
    logInfo('Suppression des doublons et nettoyage des données...\n');

    const files = ['stm.json', 'mtm.json', 'ltm.json'];
    let totalDuplicates = 0;

    for (const file of files) {
      const data = (await this.loadJson(file)) || [];
      const beforeCount = data.length;

      // Déduplication basée sur le contenu (hash simple)
      const seen = new Map();
      const deduplicated = [];

      for (const entry of data) {
        const hash = this.simpleHash(entry.content);

        if (seen.has(hash)) {
          totalDuplicates++;
          // Fusionner les métadonnées de l'existant
          const existing = seen.get(hash);
          existing.accessCount += entry.accessCount || 0;
          existing.lastAccessed = Math.max(
            existing.lastAccessed,
            entry.lastAccessed || 0
          );
          if (entry.importance > existing.importance) {
            existing.importance = entry.importance;
          }
        } else {
          seen.set(hash, entry);
          deduplicated.push(entry);
        }
      }

      const afterCount = deduplicated.length;
      const removed = beforeCount - afterCount;

      if (removed > 0) {
        await fs.writeFile(
          path.join(MEMORY_DIR, file),
          JSON.stringify(deduplicated, null, 2)
        );
        logSuccess(`   ${file}: ${removed} doublons supprimés`);
        this.stats.duplicatesRemoved += removed;
      } else {
        logInfo(`   ${file}: aucun doublon détecté`);
      }
    }
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  async optimizeIndexes() {
    logSection('⚡ Optimisation des indexes');
    logInfo("Création d'indexes pour améliorer les performances...\n");

    // Créer un fichier d'index pour les recherches rapides
    const index = {
      stm: { byId: new Map(), byType: new Map() },
      mtm: { byId: new Map(), byType: new Map() },
      ltm: { byId: new Map(), byType: new Map() },
    };

    const files = ['stm.json', 'mtm.json', 'ltm.json'];

    for (const file of files) {
      const tier = file.split('.')[0].toLowerCase();
      const data = (await this.loadJson(file)) || [];

      for (const entry of data) {
        // Index par ID
        index[tier].byId.set(entry.id, entry);

        // Index par type
        if (!index[tier].byType.has(entry.type)) {
          index[tier].byType.set(entry.type, []);
        }
        index[tier].byType.get(entry.type).push(entry.id);
      }

      logSuccess(`   ${file}: ${data.length} entrées indexées`);
    }

    // Sauvegarder l'index (pour usage futur)
    const serializableIndex = {};
    for (const tier of ['stm', 'mtm', 'ltm']) {
      serializableIndex[tier] = {
        byId: Array.from(index[tier].byId.entries()),
        byType: Object.fromEntries(index[tier].byType),
      };
    }

    await fs.writeFile(
      path.join(MEMORY_DIR, 'memory-index.json'),
      JSON.stringify(serializableIndex, null, 2)
    );

    logSuccess('   Index mémoire créé: memory-index.json');
  }

  async finalValidation() {
    logSection("✅ Validation d'intégrité finale");
    logInfo("Vérification de l'intégrité du système après optimisation...\n");

    const [stm, mtm, ltm] = await Promise.all([
      this.loadJson('stm.json'),
      this.loadJson('mtm.json'),
      this.loadJson('ltm.json'),
    ]);

    // Vérifier qu'aucun ID n'est dupliqué entre tiers
    const allIds = new Set();
    const duplicates = new Set();

    for (const entry of [...(stm || []), ...(mtm || []), ...(ltm || [])]) {
      if (allIds.has(entry.id)) {
        duplicates.add(entry.id);
      } else {
        allIds.add(entry.id);
      }
    }

    if (duplicates.size > 0) {
      logWarn(`   ${duplicates.size} ID dupliqués détectés (doivent être résolus)`);
      this.issues.push(
        `ID dupliqués: ${Array.from(duplicates).slice(0, 5).join(', ')}...`
      );
    } else {
      logSuccess('   Aucun ID dupliqué entre les tiers');
    }

    // Vérifier les importance ranges
    let outOfRange = 0;
    for (const entry of [...(stm || []), ...(mtm || []), ...(ltm || [])]) {
      if (entry.importance < 0 || entry.importance > 1) {
        outOfRange++;
      }
    }

    if (outOfRange > 0) {
      logWarn(`   ${outOfRange} entrées avec importance hors [0,1]`);
    } else {
      logSuccess('   Toutes les importances sont dans la plage [0,1]');
    }

    // Vérifier la taille totale
    const totalEntries = (stm?.length || 0) + (mtm?.length || 0) + (ltm?.length || 0);
    logSuccess(`   Total entrées mémoire: ${totalEntries}`);
  }

  async generateReport() {
    logSection("📊 Rapport d'optimisation");

    const report = {
      timestamp: new Date().toISOString(),
      version: 'v26.3.0',
      stats: this.stats,
      issues: this.issues,
      recommendations: this.generateRecommendations(),
    };

    const reportPath = path.join(MEMORY_DIR, 'optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    logSuccess(`   Rapport généré: ${reportPath}`);
    logInfo('\n   Recommandations:');
    report.recommendations.forEach(rec => logInfo(`   • ${rec}`));
  }

  generateRecommendations() {
    const recs = [];

    if (this.stats.duplicatesRemoved > 0) {
      recs.push('Exécuter régulièrement la déduplication pour maintenir la cohérence');
    }

    if (this.issues.some(i => i.includes('ID dupliqué'))) {
      recs.push('Résoudre les ID dupliqués manuellement pour éviter les conflits');
    }

    if (this.issues.some(i => i.includes('schéma invalide'))) {
      recs.push('Vérifier les entrées avec schéma invalide et les corriger');
    }

    recs.push('Intégrer ce script dans le pipeline de déploiement');
    recs.push('Configurer des backups automatiques avant chaque optimisation');

    return recs;
  }

  async loadJson(filename) {
    try {
      const content = await fs.readFile(path.join(MEMORY_DIR, filename), 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }
}

// Exécution
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const optimizer = new LTMOptimizer();
  optimizer.run().catch(console.error);
}

export { LTMOptimizer };
