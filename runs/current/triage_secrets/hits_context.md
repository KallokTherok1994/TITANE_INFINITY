# HITS CONTEXT (sk- strict)

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:8
```text
     5 |   1809 | ./docs/99_ARCHIVE/complete-reports/CHAT_PIPELINE_SELF_REPAIR_REPORT_v21.md:544:  key: 'sk-ant-...', // Clé API Anthropic
     6 |   1810 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:170:    pub api_key: String,
     7 |   1811 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:258:      "api_key": "${MISTRAL_API_KEY}",
     8 |   1812 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     9 |   1813 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:357:5. Copy the key (starts with `sk-`)
    10 |   1814 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:458:        api_key:
    11 |   1815 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:501:  -H "Authorization: Bearer $MISTRAL_API_KEY" \
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:19
```text
    16 |   1877 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:226:   - Create API key (starts with `sk-ant-...`)
    17 |   1878 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:244:- ✅ Stored in `~/.config/titane-infinity/secrets.enc` (when `TITANE_SECRETS_PASSPHRASE` set)
    18 |   1879 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:257:export TITANE_SECRETS_PASSPHRASE="your-secure-passphrase-here"
    19 |   1880 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
    20 |   1881 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:316:6. Repeat for Anthropic with key: `sk-ant-test1234567890ABCDEF`
    21 |   1882 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:552:export TITANE_SECRETS_PASSPHRASE="test-passphrase-123"
    22 |   1883 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:578:  -H "Authorization: Bearer sk-YOUR-KEY" \
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:30
```text
    27 |   2155 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:91:openssl rand -hex 32  # Pour TITANE_SECRETS_PASSPHRASE
    28 |   2156 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:103:TITANE_SECRETS_PASSPHRASE=dev_secrets_12345678
    29 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    30 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    31 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    32 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    33 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:32
```text
    29 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    30 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    31 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    32 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    33 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    34 | ```
    35 | 
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:39
```text
    36 | ## ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160
    37 | ```text
    38 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    39 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    40 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    41 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    42 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:41
```text
    38 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    39 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    40 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    41 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    42 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    43 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    44 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:43
```text
    40 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    41 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    42 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    43 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    44 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
    45 | ```
    46 | 
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:50
```text
    47 | ## ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162
    48 | ```text
    49 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    50 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    51 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    52 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    53 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:52
```text
    49 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    50 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    51 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    52 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    53 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
    54 |   2164 | ./src/pages/TitanePage.css:434:    mask-image: linear-gradient(
    55 |   2165 | ./src/pages/TitanePage.css:441:    -webkit-mask-image: linear-gradient(
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:63
```text
    60 |   1809 | ./docs/99_ARCHIVE/complete-reports/CHAT_PIPELINE_SELF_REPAIR_REPORT_v21.md:544:  key: 'sk-ant-...', // Clé API Anthropic
    61 |   1810 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:170:    pub api_key: String,
    62 |   1811 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:258:      "api_key": "${MISTRAL_API_KEY}",
    63 |   1812 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
    64 |   1813 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:357:5. Copy the key (starts with `sk-`)
    65 |   1814 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:458:        api_key:
    66 |   1815 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:501:  -H "Authorization: Bearer $MISTRAL_API_KEY" \
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:74
```text
    71 |   1877 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:226:   - Create API key (starts with `sk-ant-...`)
    72 |   1878 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:244:- ✅ Stored in `~/.config/titane-infinity/secrets.enc` (when `TITANE_SECRETS_PASSPHRASE` set)
    73 |   1879 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:257:export TITANE_SECRETS_PASSPHRASE="your-secure-passphrase-here"
    74 |   1880 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
    75 |   1881 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:316:6. Repeat for Anthropic with key: `sk-ant-test1234567890ABCDEF`
    76 |   1882 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:552:export TITANE_SECRETS_PASSPHRASE="test-passphrase-123"
    77 |   1883 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:578:  -H "Authorization: Bearer sk-YOUR-KEY" \
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:85
```text
    82 |   2155 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:91:openssl rand -hex 32  # Pour TITANE_SECRETS_PASSPHRASE
    83 |   2156 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:103:TITANE_SECRETS_PASSPHRASE=dev_secrets_12345678
    84 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    85 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    86 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    87 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    88 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:87
```text
    84 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    85 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    86 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    87 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    88 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    89 | ```
    90 | 
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:94
```text
    91 | ## ./runs/current/SCANS_SECRETS.md:2160
    92 | ```text
    93 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    94 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    95 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    96 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    97 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:96
```text
    93 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    94 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    95 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    96 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    97 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    98 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    99 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:98
```text
    95 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    96 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    97 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    98 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    99 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
   100 | ```
   101 | 
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:105
```text
   102 | ## ./runs/current/SCANS_SECRETS.md:2162
   103 | ```text
   104 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
   105 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
   106 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
   107 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
   108 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:107
```text
   104 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
   105 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
   106 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
   107 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
   108 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
   109 |   2164 | ./src/pages/TitanePage.css:434:    mask-image: linear-gradient(
   110 |   2165 | ./src/pages/TitanePage.css:441:    -webkit-mask-image: linear-gradient(
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:118
```text
   115 |    272 | # File: docs/examples/.env.example
   116 |    273 | 
   117 |    274 | # Mistral AI Configuration (NEW)
   118 |    275 | MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
   119 |    276 | MISTRAL_BASE_URL=https://api.mistral.ai/v1
   120 |    277 | MISTRAL_MODEL=mistral-medium
   121 |    278 | MISTRAL_PRIORITY=2
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:129
```text
   126 |    305 | - ⚠️ "Aucune clé OpenAI détectée. Configurez pour activer GPT-4, o1, etc."
   127 |    306 | - Clé actuelle: `•••• non configurée`
   128 |    307 | 
   129 |    308 | 4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
   130 |    309 | 5. Click **"Enregistrer sécurisé"**
   131 |    310 | 
   132 |    311 | **Expected:**
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:140
```text
   137 |    108 |   describe('Sanitization', () => {
   138 |    109 |     it('should redact OpenAI API keys', () => {
   139 |    110 |       logger.info(
   140 |    111 |         'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
   141 |    112 |       );
   142 |    113 |       const logs = logger.getLogs();
   143 |    114 | 
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:151
```text
   148 |    176 | 
   149 |    177 |     it('should handle multiple sensitive patterns in one message', () => {
   150 |    178 |       logger.info(
   151 |    179 |         'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
   152 |    180 |       );
   153 |    181 |       const logs = logger.getLogs();
   154 |    182 | 
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_context.md:162
```text
   159 |     34 |   uiLogger.clearLogs();
   160 |     35 | 
   161 |     36 |   // Log sensitive data
   162 |     37 |   logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
   163 |     38 |   logInfo('Email: user@example.com');
   164 |     39 |   logInfo('JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature');
   165 |     40 | 
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:3
```text
     1 | # CLASSIFICATION (final)
     2 | 
     3 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     4 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:4
```text
     1 | # CLASSIFICATION (final)
     2 | 
     3 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     4 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:5
```text
     2 | 
     3 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     4 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:6
```text
     3 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     4 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:7
```text
     4 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:8
```text
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:9
```text
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:10
```text
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:11
```text
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:12
```text
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:13
```text
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    16 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:179 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:14
```text
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    16 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:179 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    17 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.integration.ts:37 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:15
```text
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    16 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:179 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    17 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.integration.ts:37 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:16
```text
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    16 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:179 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    17 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.integration.ts:37 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.md:17
```text
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    16 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:179 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    17 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.integration.ts:37 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:5
```text
     2 |   {
     3 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
     4 |     "line": 1812,
     5 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
     6 |     "class": "FALSE_POSITIVE",
     7 |     "text": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
     8 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:7
```text
     4 |     "line": 1812,
     5 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
     6 |     "class": "FALSE_POSITIVE",
     7 |     "text": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
     8 |   },
     9 |   {
    10 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:12
```text
     9 |   {
    10 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
    11 |     "line": 1880,
    12 |     "match": "sk-test1234567890ABCDEF",
    13 |     "class": "FALSE_POSITIVE",
    14 |     "text": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    15 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:14
```text
    11 |     "line": 1880,
    12 |     "match": "sk-test1234567890ABCDEF",
    13 |     "class": "FALSE_POSITIVE",
    14 |     "text": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    15 |   },
    16 |   {
    17 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:19
```text
    16 |   {
    17 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
    18 |     "line": 2158,
    19 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    20 |     "class": "FALSE_POSITIVE",
    21 |     "text": "./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    22 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:21
```text
    18 |     "line": 2158,
    19 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    20 |     "class": "FALSE_POSITIVE",
    21 |     "text": "./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    22 |   },
    23 |   {
    24 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:26
```text
    23 |   {
    24 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
    25 |     "line": 2160,
    26 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    27 |     "class": "FALSE_POSITIVE",
    28 |     "text": "./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    29 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:28
```text
    25 |     "line": 2160,
    26 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    27 |     "class": "FALSE_POSITIVE",
    28 |     "text": "./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    29 |   },
    30 |   {
    31 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:33
```text
    30 |   {
    31 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
    32 |     "line": 2162,
    33 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    34 |     "class": "FALSE_POSITIVE",
    35 |     "text": "./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
    36 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:35
```text
    32 |     "line": 2162,
    33 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    34 |     "class": "FALSE_POSITIVE",
    35 |     "text": "./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
    36 |   },
    37 |   {
    38 |     "file": "./runs/current/SCANS_SECRETS.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:40
```text
    37 |   {
    38 |     "file": "./runs/current/SCANS_SECRETS.md",
    39 |     "line": 1812,
    40 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
    41 |     "class": "FALSE_POSITIVE",
    42 |     "text": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
    43 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:42
```text
    39 |     "line": 1812,
    40 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
    41 |     "class": "FALSE_POSITIVE",
    42 |     "text": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
    43 |   },
    44 |   {
    45 |     "file": "./runs/current/SCANS_SECRETS.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:47
```text
    44 |   {
    45 |     "file": "./runs/current/SCANS_SECRETS.md",
    46 |     "line": 1880,
    47 |     "match": "sk-test1234567890ABCDEF",
    48 |     "class": "FALSE_POSITIVE",
    49 |     "text": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    50 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:49
```text
    46 |     "line": 1880,
    47 |     "match": "sk-test1234567890ABCDEF",
    48 |     "class": "FALSE_POSITIVE",
    49 |     "text": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    50 |   },
    51 |   {
    52 |     "file": "./runs/current/SCANS_SECRETS.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:54
```text
    51 |   {
    52 |     "file": "./runs/current/SCANS_SECRETS.md",
    53 |     "line": 2158,
    54 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    55 |     "class": "FALSE_POSITIVE",
    56 |     "text": "./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    57 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:56
```text
    53 |     "line": 2158,
    54 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    55 |     "class": "FALSE_POSITIVE",
    56 |     "text": "./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    57 |   },
    58 |   {
    59 |     "file": "./runs/current/SCANS_SECRETS.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:61
```text
    58 |   {
    59 |     "file": "./runs/current/SCANS_SECRETS.md",
    60 |     "line": 2160,
    61 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    62 |     "class": "FALSE_POSITIVE",
    63 |     "text": "./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    64 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:63
```text
    60 |     "line": 2160,
    61 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    62 |     "class": "FALSE_POSITIVE",
    63 |     "text": "./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    64 |   },
    65 |   {
    66 |     "file": "./runs/current/SCANS_SECRETS.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:68
```text
    65 |   {
    66 |     "file": "./runs/current/SCANS_SECRETS.md",
    67 |     "line": 2162,
    68 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    69 |     "class": "FALSE_POSITIVE",
    70 |     "text": "./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
    71 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:70
```text
    67 |     "line": 2162,
    68 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    69 |     "class": "FALSE_POSITIVE",
    70 |     "text": "./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
    71 |   },
    72 |   {
    73 |     "file": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:75
```text
    72 |   {
    73 |     "file": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md",
    74 |     "line": 275,
    75 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
    76 |     "class": "FALSE_POSITIVE",
    77 |     "text": "MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
    78 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:77
```text
    74 |     "line": 275,
    75 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
    76 |     "class": "FALSE_POSITIVE",
    77 |     "text": "MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
    78 |   },
    79 |   {
    80 |     "file": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:82
```text
    79 |   {
    80 |     "file": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md",
    81 |     "line": 308,
    82 |     "match": "sk-test1234567890ABCDEF",
    83 |     "class": "FALSE_POSITIVE",
    84 |     "text": "4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    85 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:84
```text
    81 |     "line": 308,
    82 |     "match": "sk-test1234567890ABCDEF",
    83 |     "class": "FALSE_POSITIVE",
    84 |     "text": "4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    85 |   },
    86 |   {
    87 |     "file": "./src/lib/__tests__/UILogger.test.ts",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:89
```text
    86 |   {
    87 |     "file": "./src/lib/__tests__/UILogger.test.ts",
    88 |     "line": 111,
    89 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    90 |     "class": "FALSE_POSITIVE",
    91 |     "text": "'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    92 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:91
```text
    88 |     "line": 111,
    89 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    90 |     "class": "FALSE_POSITIVE",
    91 |     "text": "'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    92 |   },
    93 |   {
    94 |     "file": "./src/lib/__tests__/UILogger.test.ts",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:96
```text
    93 |   {
    94 |     "file": "./src/lib/__tests__/UILogger.test.ts",
    95 |     "line": 179,
    96 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    97 |     "class": "FALSE_POSITIVE",
    98 |     "text": "'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    99 |   },
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:98
```text
    95 |     "line": 179,
    96 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    97 |     "class": "FALSE_POSITIVE",
    98 |     "text": "'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    99 |   },
   100 |   {
   101 |     "file": "./src/lib/__tests__/UILogger.integration.ts",
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:103
```text
   100 |   {
   101 |     "file": "./src/lib/__tests__/UILogger.integration.ts",
   102 |     "line": 37,
   103 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
   104 |     "class": "FALSE_POSITIVE",
   105 |     "text": "logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
   106 |   }
```

## ./runs/p462_468/proof_pack/TRIAGE/classification.json:105
```text
   102 |     "line": 37,
   103 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
   104 |     "class": "FALSE_POSITIVE",
   105 |     "text": "logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
   106 |   }
   107 | ]
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:1
```text
     1 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     2 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     3 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     4 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:2
```text
     1 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     2 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     3 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     4 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
     5 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:3
```text
     1 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     2 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     3 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     4 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
     5 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
     6 | ./runs/current/SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:4
```text
     1 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     2 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     3 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     4 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
     5 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
     6 | ./runs/current/SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     7 | ./runs/current/SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:5
```text
     2 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     3 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     4 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
     5 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
     6 | ./runs/current/SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     7 | ./runs/current/SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     8 | ./runs/current/SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:6
```text
     3 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     4 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
     5 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
     6 | ./runs/current/SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     7 | ./runs/current/SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     8 | ./runs/current/SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     9 | ./runs/current/SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:7
```text
     4 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
     5 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
     6 | ./runs/current/SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     7 | ./runs/current/SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     8 | ./runs/current/SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     9 | ./runs/current/SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    10 | ./runs/current/SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:8
```text
     5 | ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
     6 | ./runs/current/SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     7 | ./runs/current/SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     8 | ./runs/current/SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     9 | ./runs/current/SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    10 | ./runs/current/SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    11 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:9
```text
     6 | ./runs/current/SCANS_SECRETS.md:1812:./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     7 | ./runs/current/SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     8 | ./runs/current/SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     9 | ./runs/current/SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    10 | ./runs/current/SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    11 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
    12 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:10
```text
     7 | ./runs/current/SCANS_SECRETS.md:1880:./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
     8 | ./runs/current/SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     9 | ./runs/current/SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    10 | ./runs/current/SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    11 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
    12 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
    13 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:11
```text
     8 | ./runs/current/SCANS_SECRETS.md:2158:./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
     9 | ./runs/current/SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    10 | ./runs/current/SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    11 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
    12 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
    13 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    14 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:12
```text
     9 | ./runs/current/SCANS_SECRETS.md:2160:./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    10 | ./runs/current/SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    11 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
    12 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
    13 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    14 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    15 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:13
```text
    10 | ./runs/current/SCANS_SECRETS.md:2162:./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    11 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
    12 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
    13 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    14 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    15 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:14
```text
    11 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
    12 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
    13 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    14 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    15 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
```

## ./runs/p462_468/proof_pack/TRIAGE/hits_raw.txt:15
```text
    12 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
    13 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    14 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    15 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
```

## ./runs/current/triage_secrets/hits_context.md:8
```text
     5 |   1809 | ./docs/99_ARCHIVE/complete-reports/CHAT_PIPELINE_SELF_REPAIR_REPORT_v21.md:544:  key: 'sk-ant-...', // Clé API Anthropic
     6 |   1810 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:170:    pub api_key: String,
     7 |   1811 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:258:      "api_key": "${MISTRAL_API_KEY}",
     8 |   1812 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
     9 |   1813 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:357:5. Copy the key (starts with `sk-`)
    10 |   1814 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:458:        api_key:
    11 |   1815 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:501:  -H "Authorization: Bearer $MISTRAL_API_KEY" \
```

## ./runs/current/triage_secrets/hits_context.md:19
```text
    16 |   1877 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:226:   - Create API key (starts with `sk-ant-...`)
    17 |   1878 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:244:- ✅ Stored in `~/.config/titane-infinity/secrets.enc` (when `TITANE_SECRETS_PASSPHRASE` set)
    18 |   1879 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:257:export TITANE_SECRETS_PASSPHRASE="your-secure-passphrase-here"
    19 |   1880 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
    20 |   1881 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:316:6. Repeat for Anthropic with key: `sk-ant-test1234567890ABCDEF`
    21 |   1882 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:552:export TITANE_SECRETS_PASSPHRASE="test-passphrase-123"
    22 |   1883 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:578:  -H "Authorization: Bearer sk-YOUR-KEY" \
```

## ./runs/current/triage_secrets/hits_context.md:30
```text
    27 |   2155 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:91:openssl rand -hex 32  # Pour TITANE_SECRETS_PASSPHRASE
    28 |   2156 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:103:TITANE_SECRETS_PASSPHRASE=dev_secrets_12345678
    29 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    30 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    31 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    32 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    33 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
```

## ./runs/current/triage_secrets/hits_context.md:32
```text
    29 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    30 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    31 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    32 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    33 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    34 | ```
    35 | 
```

## ./runs/current/triage_secrets/hits_context.md:39
```text
    36 | ## ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160
    37 | ```text
    38 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    39 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    40 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    41 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    42 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
```

## ./runs/current/triage_secrets/hits_context.md:41
```text
    38 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    39 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    40 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    41 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    42 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    43 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    44 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
```

## ./runs/current/triage_secrets/hits_context.md:43
```text
    40 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    41 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    42 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    43 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    44 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
    45 | ```
    46 | 
```

## ./runs/current/triage_secrets/hits_context.md:50
```text
    47 | ## ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162
    48 | ```text
    49 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    50 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    51 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    52 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    53 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
```

## ./runs/current/triage_secrets/hits_context.md:52
```text
    49 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    50 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    51 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    52 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    53 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
    54 |   2164 | ./src/pages/TitanePage.css:434:    mask-image: linear-gradient(
    55 |   2165 | ./src/pages/TitanePage.css:441:    -webkit-mask-image: linear-gradient(
```

## ./runs/current/triage_secrets/hits_context.md:63
```text
    60 |   1809 | ./docs/99_ARCHIVE/complete-reports/CHAT_PIPELINE_SELF_REPAIR_REPORT_v21.md:544:  key: 'sk-ant-...', // Clé API Anthropic
    61 |   1810 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:170:    pub api_key: String,
    62 |   1811 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:258:      "api_key": "${MISTRAL_API_KEY}",
    63 |   1812 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
    64 |   1813 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:357:5. Copy the key (starts with `sk-`)
    65 |   1814 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:458:        api_key:
    66 |   1815 | ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:501:  -H "Authorization: Bearer $MISTRAL_API_KEY" \
```

## ./runs/current/triage_secrets/hits_context.md:74
```text
    71 |   1877 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:226:   - Create API key (starts with `sk-ant-...`)
    72 |   1878 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:244:- ✅ Stored in `~/.config/titane-infinity/secrets.enc` (when `TITANE_SECRETS_PASSPHRASE` set)
    73 |   1879 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:257:export TITANE_SECRETS_PASSPHRASE="your-secure-passphrase-here"
    74 |   1880 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
    75 |   1881 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:316:6. Repeat for Anthropic with key: `sk-ant-test1234567890ABCDEF`
    76 |   1882 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:552:export TITANE_SECRETS_PASSPHRASE="test-passphrase-123"
    77 |   1883 | ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:578:  -H "Authorization: Bearer sk-YOUR-KEY" \
```

## ./runs/current/triage_secrets/hits_context.md:85
```text
    82 |   2155 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:91:openssl rand -hex 32  # Pour TITANE_SECRETS_PASSPHRASE
    83 |   2156 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:103:TITANE_SECRETS_PASSPHRASE=dev_secrets_12345678
    84 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    85 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    86 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    87 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    88 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
```

## ./runs/current/triage_secrets/hits_context.md:87
```text
    84 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    85 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    86 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    87 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    88 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    89 | ```
    90 | 
```

## ./runs/current/triage_secrets/hits_context.md:94
```text
    91 | ## ./runs/current/SCANS_SECRETS.md:2160
    92 | ```text
    93 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    94 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    95 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    96 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    97 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
```

## ./runs/current/triage_secrets/hits_context.md:96
```text
    93 |   2157 | ./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
    94 |   2158 | ./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
    95 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    96 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    97 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    98 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    99 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
```

## ./runs/current/triage_secrets/hits_context.md:98
```text
    95 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
    96 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    97 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
    98 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
    99 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
   100 | ```
   101 | 
```

## ./runs/current/triage_secrets/hits_context.md:105
```text
   102 | ## ./runs/current/SCANS_SECRETS.md:2162
   103 | ```text
   104 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
   105 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
   106 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
   107 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
   108 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
```

## ./runs/current/triage_secrets/hits_context.md:107
```text
   104 |   2159 | ./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
   105 |   2160 | ./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
   106 |   2161 | ./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
   107 |   2162 | ./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
   108 |   2163 | ./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
   109 |   2164 | ./src/pages/TitanePage.css:434:    mask-image: linear-gradient(
   110 |   2165 | ./src/pages/TitanePage.css:441:    -webkit-mask-image: linear-gradient(
```

## ./runs/current/triage_secrets/hits_context.md:118
```text
   115 |    272 | # File: docs/examples/.env.example
   116 |    273 | 
   117 |    274 | # Mistral AI Configuration (NEW)
   118 |    275 | MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
   119 |    276 | MISTRAL_BASE_URL=https://api.mistral.ai/v1
   120 |    277 | MISTRAL_MODEL=mistral-medium
   121 |    278 | MISTRAL_PRIORITY=2
```

## ./runs/current/triage_secrets/hits_context.md:129
```text
   126 |    305 | - ⚠️ "Aucune clé OpenAI détectée. Configurez pour activer GPT-4, o1, etc."
   127 |    306 | - Clé actuelle: `•••• non configurée`
   128 |    307 | 
   129 |    308 | 4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
   130 |    309 | 5. Click **"Enregistrer sécurisé"**
   131 |    310 | 
   132 |    311 | **Expected:**
```

## ./runs/current/triage_secrets/hits_context.md:140
```text
   137 |    108 |   describe('Sanitization', () => {
   138 |    109 |     it('should redact OpenAI API keys', () => {
   139 |    110 |       logger.info(
   140 |    111 |         'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
   141 |    112 |       );
   142 |    113 |       const logs = logger.getLogs();
   143 |    114 | 
```

## ./runs/current/triage_secrets/hits_context.md:151
```text
   148 |    176 | 
   149 |    177 |     it('should handle multiple sensitive patterns in one message', () => {
   150 |    178 |       logger.info(
   151 |    179 |         'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
   152 |    180 |       );
   153 |    181 |       const logs = logger.getLogs();
   154 |    182 | 
```

## ./runs/current/triage_secrets/hits_context.md:162
```text
   159 |     34 |   uiLogger.clearLogs();
   160 |     35 | 
   161 |     36 |   // Log sensitive data
   162 |     37 |   logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
   163 |     38 |   logInfo('Email: user@example.com');
   164 |     39 |   logInfo('JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature');
   165 |     40 | 
```

## ./runs/current/triage_secrets/classification.json:5
```text
     2 |   {
     3 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
     4 |     "line": 1812,
     5 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
     6 |     "class": "FALSE_POSITIVE",
     7 |     "text": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
     8 |   },
```

## ./runs/current/triage_secrets/classification.json:7
```text
     4 |     "line": 1812,
     5 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
     6 |     "class": "FALSE_POSITIVE",
     7 |     "text": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
     8 |   },
     9 |   {
    10 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
```

## ./runs/current/triage_secrets/classification.json:12
```text
     9 |   {
    10 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
    11 |     "line": 1880,
    12 |     "match": "sk-test1234567890ABCDEF",
    13 |     "class": "FALSE_POSITIVE",
    14 |     "text": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    15 |   },
```

## ./runs/current/triage_secrets/classification.json:14
```text
    11 |     "line": 1880,
    12 |     "match": "sk-test1234567890ABCDEF",
    13 |     "class": "FALSE_POSITIVE",
    14 |     "text": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    15 |   },
    16 |   {
    17 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
```

## ./runs/current/triage_secrets/classification.json:19
```text
    16 |   {
    17 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
    18 |     "line": 2158,
    19 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    20 |     "class": "FALSE_POSITIVE",
    21 |     "text": "./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    22 |   },
```

## ./runs/current/triage_secrets/classification.json:21
```text
    18 |     "line": 2158,
    19 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    20 |     "class": "FALSE_POSITIVE",
    21 |     "text": "./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    22 |   },
    23 |   {
    24 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
```

## ./runs/current/triage_secrets/classification.json:26
```text
    23 |   {
    24 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
    25 |     "line": 2160,
    26 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    27 |     "class": "FALSE_POSITIVE",
    28 |     "text": "./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    29 |   },
```

## ./runs/current/triage_secrets/classification.json:28
```text
    25 |     "line": 2160,
    26 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    27 |     "class": "FALSE_POSITIVE",
    28 |     "text": "./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    29 |   },
    30 |   {
    31 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
```

## ./runs/current/triage_secrets/classification.json:33
```text
    30 |   {
    31 |     "file": "./runs/p462_468/proof_pack/05_SCANS_SECRETS.md",
    32 |     "line": 2162,
    33 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    34 |     "class": "FALSE_POSITIVE",
    35 |     "text": "./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
    36 |   },
```

## ./runs/current/triage_secrets/classification.json:35
```text
    32 |     "line": 2162,
    33 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    34 |     "class": "FALSE_POSITIVE",
    35 |     "text": "./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
    36 |   },
    37 |   {
    38 |     "file": "./runs/current/SCANS_SECRETS.md",
```

## ./runs/current/triage_secrets/classification.json:40
```text
    37 |   {
    38 |     "file": "./runs/current/SCANS_SECRETS.md",
    39 |     "line": 1812,
    40 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
    41 |     "class": "FALSE_POSITIVE",
    42 |     "text": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
    43 |   },
```

## ./runs/current/triage_secrets/classification.json:42
```text
    39 |     "line": 1812,
    40 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
    41 |     "class": "FALSE_POSITIVE",
    42 |     "text": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
    43 |   },
    44 |   {
    45 |     "file": "./runs/current/SCANS_SECRETS.md",
```

## ./runs/current/triage_secrets/classification.json:47
```text
    44 |   {
    45 |     "file": "./runs/current/SCANS_SECRETS.md",
    46 |     "line": 1880,
    47 |     "match": "sk-test1234567890ABCDEF",
    48 |     "class": "FALSE_POSITIVE",
    49 |     "text": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    50 |   },
```

## ./runs/current/triage_secrets/classification.json:49
```text
    46 |     "line": 1880,
    47 |     "match": "sk-test1234567890ABCDEF",
    48 |     "class": "FALSE_POSITIVE",
    49 |     "text": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    50 |   },
    51 |   {
    52 |     "file": "./runs/current/SCANS_SECRETS.md",
```

## ./runs/current/triage_secrets/classification.json:54
```text
    51 |   {
    52 |     "file": "./runs/current/SCANS_SECRETS.md",
    53 |     "line": 2158,
    54 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    55 |     "class": "FALSE_POSITIVE",
    56 |     "text": "./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    57 |   },
```

## ./runs/current/triage_secrets/classification.json:56
```text
    53 |     "line": 2158,
    54 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    55 |     "class": "FALSE_POSITIVE",
    56 |     "text": "./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    57 |   },
    58 |   {
    59 |     "file": "./runs/current/SCANS_SECRETS.md",
```

## ./runs/current/triage_secrets/classification.json:61
```text
    58 |   {
    59 |     "file": "./runs/current/SCANS_SECRETS.md",
    60 |     "line": 2160,
    61 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    62 |     "class": "FALSE_POSITIVE",
    63 |     "text": "./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    64 |   },
```

## ./runs/current/triage_secrets/classification.json:63
```text
    60 |     "line": 2160,
    61 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    62 |     "class": "FALSE_POSITIVE",
    63 |     "text": "./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    64 |   },
    65 |   {
    66 |     "file": "./runs/current/SCANS_SECRETS.md",
```

## ./runs/current/triage_secrets/classification.json:68
```text
    65 |   {
    66 |     "file": "./runs/current/SCANS_SECRETS.md",
    67 |     "line": 2162,
    68 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    69 |     "class": "FALSE_POSITIVE",
    70 |     "text": "./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
    71 |   },
```

## ./runs/current/triage_secrets/classification.json:70
```text
    67 |     "line": 2162,
    68 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    69 |     "class": "FALSE_POSITIVE",
    70 |     "text": "./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
    71 |   },
    72 |   {
    73 |     "file": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md",
```

## ./runs/current/triage_secrets/classification.json:75
```text
    72 |   {
    73 |     "file": "./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md",
    74 |     "line": 275,
    75 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
    76 |     "class": "FALSE_POSITIVE",
    77 |     "text": "MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
    78 |   },
```

## ./runs/current/triage_secrets/classification.json:77
```text
    74 |     "line": 275,
    75 |     "match": "sk-xxxxxxxxxxxxxxxxxxxx",
    76 |     "class": "FALSE_POSITIVE",
    77 |     "text": "MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx"
    78 |   },
    79 |   {
    80 |     "file": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md",
```

## ./runs/current/triage_secrets/classification.json:82
```text
    79 |   {
    80 |     "file": "./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md",
    81 |     "line": 308,
    82 |     "match": "sk-test1234567890ABCDEF",
    83 |     "class": "FALSE_POSITIVE",
    84 |     "text": "4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    85 |   },
```

## ./runs/current/triage_secrets/classification.json:84
```text
    81 |     "line": 308,
    82 |     "match": "sk-test1234567890ABCDEF",
    83 |     "class": "FALSE_POSITIVE",
    84 |     "text": "4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)"
    85 |   },
    86 |   {
    87 |     "file": "./src/lib/__tests__/UILogger.test.ts",
```

## ./runs/current/triage_secrets/classification.json:89
```text
    86 |   {
    87 |     "file": "./src/lib/__tests__/UILogger.test.ts",
    88 |     "line": 111,
    89 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    90 |     "class": "FALSE_POSITIVE",
    91 |     "text": "'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    92 |   },
```

## ./runs/current/triage_secrets/classification.json:91
```text
    88 |     "line": 111,
    89 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    90 |     "class": "FALSE_POSITIVE",
    91 |     "text": "'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'"
    92 |   },
    93 |   {
    94 |     "file": "./src/lib/__tests__/UILogger.test.ts",
```

## ./runs/current/triage_secrets/classification.json:96
```text
    93 |   {
    94 |     "file": "./src/lib/__tests__/UILogger.test.ts",
    95 |     "line": 179,
    96 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    97 |     "class": "FALSE_POSITIVE",
    98 |     "text": "'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    99 |   },
```

## ./runs/current/triage_secrets/classification.json:98
```text
    95 |     "line": 179,
    96 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
    97 |     "class": "FALSE_POSITIVE",
    98 |     "text": "'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'"
    99 |   },
   100 |   {
   101 |     "file": "./src/lib/__tests__/UILogger.integration.ts",
```

## ./runs/current/triage_secrets/classification.json:103
```text
   100 |   {
   101 |     "file": "./src/lib/__tests__/UILogger.integration.ts",
   102 |     "line": 37,
   103 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
   104 |     "class": "FALSE_POSITIVE",
   105 |     "text": "logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
   106 |   }
```

## ./runs/current/triage_secrets/classification.json:105
```text
   102 |     "line": 37,
   103 |     "match": "sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234",
   104 |     "class": "FALSE_POSITIVE",
   105 |     "text": "logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');"
   106 |   }
   107 | ]
```

## ./runs/current/triage_secrets/classification.md:3
```text
     1 | # CLASSIFICATION (final)
     2 | 
     3 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     4 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/current/triage_secrets/classification.md:4
```text
     1 | # CLASSIFICATION (final)
     2 | 
     3 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     4 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/current/triage_secrets/classification.md:5
```text
     2 | 
     3 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     4 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
```

## ./runs/current/triage_secrets/classification.md:6
```text
     3 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     4 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
```

## ./runs/current/triage_secrets/classification.md:7
```text
     4 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/current/triage_secrets/classification.md:8
```text
     5 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/current/triage_secrets/classification.md:9
```text
     6 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/current/triage_secrets/classification.md:10
```text
     7 | - **FALSE_POSITIVE** — ./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
```

## ./runs/current/triage_secrets/classification.md:11
```text
     8 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1812 — `sk-xxxxxxxxxxxxxxxxxxxx`
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
```

## ./runs/current/triage_secrets/classification.md:12
```text
     9 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:1880 — `sk-test1234567890ABCDEF`
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/current/triage_secrets/classification.md:13
```text
    10 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2158 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    16 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:179 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/current/triage_secrets/classification.md:14
```text
    11 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2160 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    16 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:179 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    17 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.integration.ts:37 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/current/triage_secrets/classification.md:15
```text
    12 | - **FALSE_POSITIVE** — ./runs/current/SCANS_SECRETS.md:2162 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    16 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:179 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    17 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.integration.ts:37 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/current/triage_secrets/classification.md:16
```text
    13 | - **FALSE_POSITIVE** — ./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275 — `sk-xxxxxxxxxxxxxxxxxxxx`
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    16 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:179 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    17 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.integration.ts:37 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
```

## ./runs/current/triage_secrets/classification.md:17
```text
    14 | - **FALSE_POSITIVE** — ./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308 — `sk-test1234567890ABCDEF`
    15 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:111 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    16 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.test.ts:179 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
    17 | - **FALSE_POSITIVE** — ./src/lib/__tests__/UILogger.integration.ts:37 — `sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234`
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

