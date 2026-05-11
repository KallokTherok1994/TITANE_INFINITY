### App routes
          <Route path="/" element={<Navigate to="/titane" replace />} />
          <Route path="/titane.sh" element={<Navigate to="/titane" replace />} />
          <Route path="/titane.sh/*" element={<Navigate to="/titane" replace />} />
          <Route path="/camera" element={<Navigate to="/titane" replace />} />
          <Route path="/evo" element={<Navigate to="/titane" replace />} />
          <Route path="/dashboard" element={<Navigate to="/titane" replace />} />
          <Route path="/evolution-center" element={<Navigate to="/titane" replace />} />
          <Route path="/progression" element={<Navigate to="/titane" replace />} />
          <Route path="/xp" element={<Navigate to="/experience" replace />} />
          <Route path="/stats" element={<Navigate to="/dev?tab=diagnostics" replace />} />
          <Route path="/experience" element={<Experience />} /> {/* ✨ v∞.D5 - Page XP */}
          <Route path="/temporal-center" element={<Navigate to="/time" replace />} />
          <Route path="/agenda" element={<Navigate to="/time" replace />} />
          <Route path="/time-navigator" element={<Navigate to="/time" replace />} />
          <Route path="/settings" element={<Navigate to="/admin?tab=config" replace />} />
          <Route path="/audio" element={<Navigate to="/admin?tab=audio" replace />} />
          <Route path="/voice" element={<Navigate to="/admin?tab=audio" replace />} />
          <Route path="/tts" element={<Navigate to="/admin?tab=audio" replace />} />
          <Route path="/meta" element={<Navigate to="/orchestration-center" replace />} />
          <Route path="/one-core" element={<Navigate to="/dev?tab=overview" replace />} />
          <Route path="/unified" element={<Navigate to="/dev?tab=overview" replace />} />
          <Route path="/qa" element={<Navigate to="/dev?tab=validation" replace />} />
          <Route path="/tests" element={<Navigate to="/dev?tab=validation" replace />} />
          <Route path="/ia-dev" element={<Navigate to="/dev?tab=operations" replace />} />
          <Route path="/reality" element={<Navigate to="/reality-center" replace />} />
          <Route path="/renderer" element={<Navigate to="/reality-center" replace />} />
          <Route path="/hyper" element={<Navigate to="/hyper-center" replace />} />
          <Route path="/intelligence" element={<Navigate to="/hyper-center" replace />} />
          <Route path="/quantum" element={<Navigate to="/quantum-center" replace />} />
          <Route path="/identity-center" element={<Navigate to="/twins" replace />} />
          <Route path="/identity" element={<Navigate to="/twins" replace />} />
          <Route path="/persona" element={<Navigate to="/twins" replace />} />
          <Route path="/twin" element={<Navigate to="/twins" replace />} />
          <Route path="/cloud-sync" element={<Navigate to="/cloud" replace />} />
          <Route path="/vault" element={<Navigate to="/cloud" replace />} />
          <Route path="/knowledge" element={<KnowledgeFusionPage />} />
          <Route path="/creation" element={<CreationStudio />} />
          <Route path="/evolution" element={<EvolutionMonitor />} />
          <Route path="/sentinel" element={<Sentinel />} />
          <Route path="/watchdog" element={<Watchdog />} />
          <Route path="/selfheal" element={<SelfHeal />} />
          <Route path="/adaptive" element={<AdaptiveEngine />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/skills" element={<SkillManager />} />
          <Route path="/doc" element={<Navigate to="/doc-center" replace />} />
          <Route path="/performance" element={<PerformanceTest />} />
          <Route path="*" element={<Navigate to="/" replace />} />

### TopNav routes
10:    route: '/titane',
22:  { id: 'time', label: 'TIME', route: '/time', description: 'Centre Temporel' },
23:  { id: 'admin', label: 'ADMIN', route: '/admin', description: 'Centre Admin Unifié' },
27:    route: '/dev',
43:    route: '/fusion',
50:    route: '/twins',
57:    route: '/optimization',
64:    route: '/total-dev',

### uiPages routes
4:    route: '/titane',
24:    route: '/experience',
31:    route: '/time',
44:    route: '/dev',
51:    route: '/admin',
65:    route: '/dev',
78:    route: '/fusion',
85:    route: '/cloud',
92:    route: '/reality-center',
99:    route: '/hyper-center',
106:    route: '/quantum-center',
113:    route: '/twins',
120:    route: '/doc-center',
127:    route: '/optimization',
134:    route: '/total-dev',
141:    route: '/orchestration-intelligence',
148:    route: '/orchestration-center',
155:    route: '/singularity',
162:    route: '/sentinel',
169:    route: '/watchdog',
176:    route: '/selfheal',
183:    route: '/adaptive',
190:    route: '/memory',
197:    route: '/research',
204:    route: '/skills',
211:    route: '/knowledge',
218:    route: '/creation',
225:    route: '/evolution',
232:    route: '/performance',

### Module route registry keys (excerpt)
56:  '/chat': '/titane?tab=conversation',
57:  '/camera': '/titane',
58:  '/evo': '/titane',
59:  '/dashboard': '/titane',
60:  '/evolution-center': '/titane',
61:  '/cognitive-evolution': '/titane',
62:  '/identity-memory-evolution': '/titane',
63:  '/progression': '/titane',
64:  '/xp': '/experience',
65:  '/cognitive': '/dev?tab=diagnostics',
66:  '/stats': '/dev?tab=diagnostics',
67:  '/temporal-center': '/time',
68:  '/agenda': '/time',
69:  '/time-navigator': '/time',
70:  '/system-center': '/admin?tab=system',
71:  '/diagnostics': '/admin?tab=production-health',
72:  '/devtools': '/admin?tab=system&systemTab=devtools',
73:  '/cluster': '/admin?tab=production-health',
74:  '/introspection': '/admin?tab=system',
75:  '/hypervision': '/admin?tab=system',
76:  '/configuration': '/admin?tab=config',
77:  '/design-center': '/admin?tab=design',
78:  '/design-system': '/admin?tab=design',
79:  '/settings': '/admin?tab=config',
80:  '/governance-center': '/admin?tab=governance',
81:  '/governance': '/admin?tab=governance',
82:  '/secure': '/admin?tab=governance',
83:  '/audio-center': '/admin?tab=audio',
84:  '/audio': '/admin?tab=audio',
85:  '/voice': '/admin?tab=audio',
86:  '/tts': '/admin?tab=audio',
87:  '/meta': '/orchestration-center',
88:  '/meta-center': '/orchestration-center',
89:  '/multi-ai-dashboard': '/orchestration-center',
90:  '/nexus-engine': '/orchestration-center',
91:  '/harmonia-engine': '/orchestration-center',
92:  '/cognitive-state': '/orchestration-center',
93:  '/orchestration': '/orchestration-intelligence',
94:  '/one-core': '/dev?tab=overview',
95:  '/command-center': '/dev?tab=operations',
96:  '/unified': '/dev?tab=overview',
97:  '/qa-monitoring': '/dev?tab=validation',
98:  '/qa': '/dev?tab=validation',
99:  '/monitoring': '/dev?tab=diagnostics',
100:  '/tests': '/dev?tab=validation',
101:  '/developer-mode': '/dev?tab=operations',
102:  '/dev-mode': '/dev?tab=operations',
103:  '/devmode': '/dev?tab=operations',
104:  '/ia-dev': '/dev?tab=operations',
105:  '/reality': '/reality-center',
106:  '/renderer': '/reality-center',
107:  '/hyper': '/hyper-center',
108:  '/intelligence': '/hyper-center',
109:  '/quantum': '/quantum-center',
110:  '/identity-center': '/twins',
111:  '/identity': '/twins',
112:  '/persona': '/twins',
113:  '/twins': '/twins',
114:  '/twin': '/twins',
115:  '/memory-evo': '/titane?tab=transformation',
116:  '/memory-evolution': '/titane?tab=transformation',
117:  '/cloud-sync': '/cloud',
118:  '/vault': '/cloud',
119:  '/doc': '/doc-center',
123:  '/titane': {
134:  '/experience': {
145:  '/stats': {
156:  '/time': {
185:  '/admin': {
196:  '/dev': {
207:  '/orchestration-center': {
222:  '/orchestration-intelligence': {
233:  '/reality-center': {
244:  '/hyper-center': {
255:  '/quantum-center': {
266:  '/identity-center': {
277:  '/twins': {
288:  '/memory-evolution': {
308:  '/memory': {
327:  '/research': {
338:  '/cloud': {
354:  '/fusion': {
365:  '/optimization': {
376:  '/total-dev': {
387:  '/knowledge': {
398:  '/creation': {
409:  '/evolution': {
420:  '/performance': {
431:  '/singularity': {
446:  '/sentinel': {
457:  '/watchdog': {
468:  '/selfheal': {
479:  '/adaptive': {
490:  '/skills': {
501:  '/doc-center': {

### dist freshness
DIST_EXISTS
2026-05-11 09:20:31.5966365980 dist/assets/core-runtime-DFc4JJqx.js.br
2026-05-11 09:20:25.7941728480 dist/stats.html.br
2026-05-11 09:20:24.2641804810 dist/assets/vendor-D-qmPSyW.js.br
2026-05-11 09:20:23.7756108370 dist/assets/core-runtime-DFc4JJqx.js.gz
2026-05-11 09:20:23.6685272710 dist/assets/vendor-D-qmPSyW.js.gz
2026-05-11 09:20:23.6651834680 dist/stats.html.gz
2026-05-11 09:20:23.6601834930 dist/assets/vendor-onnx-DvOc_54P.js.br
2026-05-11 09:20:23.6301836430 dist/assets/style-i_Gs1SpC.css.br
2026-05-11 09:20:23.6241836720 dist/assets/vendor-onnx-DvOc_54P.js.gz
2026-05-11 09:20:23.4581845000 dist/assets/style-i_Gs1SpC.css.gz
2026-05-11 09:20:23.3221851780 dist/assets/chrono-BOU3IMM7.js.gz
2026-05-11 09:20:23.3221851780 dist/assets/ai-transformers-BbHON6kw.js.gz
2026-05-11 09:20:23.2291856420 dist/assets/validation-D4ZC7LYL.js.gz
2026-05-11 09:20:23.2291856420 dist/assets/chrono-BOU3IMM7.js.br
2026-05-11 09:20:23.2291856420 dist/assets/ai-transformers-BbHON6kw.js.br
2026-05-11 09:20:23.2251856620 dist/assets/validation-D4ZC7LYL.js.br
2026-05-11 09:20:23.2251856620 dist/assets/i18n-jjj6gbc-.js.br
2026-05-11 09:20:23.2211856820 dist/assets/telemetryEngine-Cd2fTYVO.js.gz
2026-05-11 09:20:23.2211856820 dist/assets/main-BVIWRPWV.js.gz
2026-05-11 09:20:23.2211856820 dist/assets/i18n-jjj6gbc-.js.gz
2026-05-11 09:20:22.8721874220 dist/assets/tauri-vendor-KyqfgcBs.js.gz
2026-05-11 09:20:22.8721874220 dist/assets/main-BVIWRPWV.js.br
2026-05-11 09:20:22.8711874270 dist/index.html.gz
2026-05-11 09:20:22.8691874370 dist/sw.js.gz
2026-05-11 09:20:22.8661874520 dist/assets/web-vitals-J_E3b7Hg.js.gz

## Drift Classification v73
- VERSION_BADGE_DRIFT: index.html meta version/title/description stale (33.0.9 / v31.1.0) at startup
- PROD_BUILD_NOT_REGENERATED: stale dist snapshot before this mission build refresh
- PROD_PREVIEW_NOT_AVAILABLE: package preview script intentionally blocked (tauri-only policy)
- TAURI_BINARY_STALE: not detected in this mission lane (desktop installed binary recently validated green)
- ROUTE_NOT_IN_APP: not detected for canonical set audited
- ROUTE_NOT_IN_REGISTRY: not detected in startup infra check
- ROUTE_NOT_IN_TOPNAV: not detected for 8 main menu surfaces
- ROUTE_NOT_IN_UIPAGES: not detected in uiPages parity scan
- ROUTE_NOT_IN_MODULE_CONTEXT: not detected for sampled canonical/aliases
- ROUTE_PROD_404: not reproduced in prior v48/v71 browser proofs
- BASE_PATH_ROUTER_MISMATCH: not detected (base ./ in build, browser routes reachable)
- SERVICE_WORKER_CACHE_STALE: under observation; no hard fail marker in current static gates
- STATIC_ASSET_CACHE_STALE: mitigated by fresh build during mission
- FRONTEND_HANDLER_NOT_WIRED / IPC_COMMAND_MISSING / IPC_CAPABILITY_MISSING: pending dedicated sync audit table
- CI_REMOTE_RED: unknown in this run due remote polling limitation
- UNKNOWN_PROD_DRIFT: none retained at this stage (all discovered issues classified)
