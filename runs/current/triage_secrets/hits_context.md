# HITS CONTEXT (sk- strict)

## ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812
```text
  1809 | ./docs/99_ARCHIVE/complete-reports/CHAT_PIPELINE_SELF_REPAIR_REPORT_v21.md:544:  key: 'sk-ant-...', // Clé API Anthropic
  1810 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:170:    pub api_key: String,
  1811 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:258:      "api_key": "${MISTRAL_API_KEY}",
  1812 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
  1813 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:357:5. Copy the key (starts with `sk-`)
  1814 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:458:        api_key:
  1815 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:501:  -H "Authorization: Bearer $MISTRAL_API_KEY" \
```

## ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880
```text
  1877 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:226:   - Create API key (starts with `sk-ant-...`)
  1878 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:244:- ✅ Stored in `~/.config/titane-infinity/secrets.enc` (when `TITANE_SECRETS_PASSPHRASE` set)
  1879 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:257:export TITANE_SECRETS_PASSPHRASE="your-secure-passphrase-here"
  1880 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
  1881 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:316:6. Repeat for Anthropic with key: `sk-ant-test1234567890ABCDEF`
  1882 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:552:export TITANE_SECRETS_PASSPHRASE="test-passphrase-123"
  1883 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:578:  -H "Authorization: Bearer sk-YOUR-KEY" \
```

## ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158
```text
  2155 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:91:openssl rand -hex 32  # Pour TITANE_SECRETS_PASSPHRASE
  2156 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:103:TITANE_SECRETS_PASSPHRASE=dev_secrets_12345678
  2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
  2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
  2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
  2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
```

## ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160
```text
  2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
  2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
  2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
  2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
  2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
  2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
```

## ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162
```text
  2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
  2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
  2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
  2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
  2164 | ./src/pages/TitanePage.css:434:    mask-image: linear-gradient(
  2165 | ./src/pages/TitanePage.css:441:    -webkit-mask-image: linear-gradient(
```

## ./runs/current/SCANS_SECRETS.md:1812
```text
  1809 | ./docs/99_ARCHIVE/complete-reports/CHAT_PIPELINE_SELF_REPAIR_REPORT_v21.md:544:  key: 'sk-ant-...', // Clé API Anthropic
  1810 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:170:    pub api_key: String,
  1811 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:258:      "api_key": "${MISTRAL_API_KEY}",
  1812 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
  1813 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:357:5. Copy the key (starts with `sk-`)
  1814 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:458:        api_key:
  1815 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:501:  -H "Authorization: Bearer $MISTRAL_API_KEY" \
```

## ./runs/current/SCANS_SECRETS.md:1880
```text
  1877 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:226:   - Create API key (starts with `sk-ant-...`)
  1878 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:244:- ✅ Stored in `~/.config/titane-infinity/secrets.enc` (when `TITANE_SECRETS_PASSPHRASE` set)
  1879 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:257:export TITANE_SECRETS_PASSPHRASE="your-secure-passphrase-here"
  1880 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
  1881 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:316:6. Repeat for Anthropic with key: `sk-ant-test1234567890ABCDEF`
  1882 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:552:export TITANE_SECRETS_PASSPHRASE="test-passphrase-123"
  1883 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:578:  -H "Authorization: Bearer sk-YOUR-KEY" \
```

## ./runs/current/SCANS_SECRETS.md:2158
```text
  2155 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:91:openssl rand -hex 32  # Pour TITANE_SECRETS_PASSPHRASE
  2156 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:103:TITANE_SECRETS_PASSPHRASE=dev_secrets_12345678
  2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
  2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
  2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
  2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
```

## ./runs/current/SCANS_SECRETS.md:2160
```text
  2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
  2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
  2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
  2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
  2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
  2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
```

## ./runs/current/SCANS_SECRETS.md:2162
```text
  2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
  2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
  2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
  2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
  2164 | ./src/pages/TitanePage.css:434:    mask-image: linear-gradient(
  2165 | ./src/pages/TitanePage.css:441:    -webkit-mask-image: linear-gradient(
```

## ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275
```text
   272 | # File: docs/examples/.env.example
   273 | 
   274 | # Mistral AI Configuration (NEW)
   275 | MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
   276 | MISTRAL_BASE_URL=https://api.mistral.ai/v1
   277 | MISTRAL_MODEL=mistral-medium
   278 | MISTRAL_PRIORITY=2
```

## ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308
```text
   305 | - ⚠️ "Aucune clé OpenAI détectée. Configurez pour activer GPT-4, o1, etc."
   306 | - Clé actuelle: `•••• non configurée`
   307 | 
   308 | 4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
   309 | 5. Click **"Enregistrer sécurisé"**
   310 | 
   311 | **Expected:**
```

## ./src/lib/__tests__/UILogger.test.ts:111
```text
   108 |   describe('Sanitization', () => {
   109 |     it('should redact OpenAI API keys', () => {
   110 |       logger.info(
   111 |         'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
   112 |       );
   113 |       const logs = logger.getLogs();
   114 | 
```

## ./src/lib/__tests__/UILogger.test.ts:179
```text
   176 | 
   177 |     it('should handle multiple sensitive patterns in one message', () => {
   178 |       logger.info(
   179 |         'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
   180 |       );
   181 |       const logs = logger.getLogs();
   182 | 
```

## ./src/lib/__tests__/UILogger.integration.ts:37
```text
    34 |   uiLogger.clearLogs();
    35 | 
    36 |   // Log sensitive data
    37 |   logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    38 |   logInfo('Email: user@example.com');
    39 |   logInfo('JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature');
    40 | 
```

