# 04 BASELINE REVERIFY — ALL 5 SEALED CHAINS

A. Provider reset (34b2097d7): reset_provider_failures() on probe — CONFIRMED ✅
B. LTM disk write (69c1c948f): std::fs::write() in promote_mtm_to_ltm — CONFIRMED ✅
C. Memory injection (61df44d0b): recall() + MEMORY_CONTEXT in conversation_generate — CONFIRMED ✅
D. Memory backup/restore (a3212d6fb): chat_memory_backup/restore in invoke_handler! — CONFIRMED ✅
E. Cap coverage (d7f59dbf5): G_CAP_COVERAGE=PASS, 0 new dead entries — CONFIRMED ✅
BASELINE REVERIFY VERDICT: PASS — no drift detected
