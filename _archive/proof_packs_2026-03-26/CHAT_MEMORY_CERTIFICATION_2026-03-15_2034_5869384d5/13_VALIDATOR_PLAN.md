# 13_VALIDATOR_PLAN

Voir: scripts/validators/VALIDATOR_PLAN.md (source of truth)

## 5 Validators créés

| ID  | Script                             | Règle                                           | Statut attendu    |
| --- | ---------------------------------- | ----------------------------------------------- | ----------------- |
| V1  | validate_chat_commands.sh          | Ghost cmds active:true sans handler             | PASS (après fix)  |
| V2  | validate_memory_persistence.sh     | chat_history non vide + localStorage disconnect | FAIL (structural) |
| V3  | validate_no_send_message_stub.sh   | send_message sans stub silencieux registered    | PASS (après fix)  |
| V4  | validate_ipc_no_silent_mock.sh     | memory_get sans Ok(None) silencieux             | PASS (après fix)  |
| V5  | validate_conversation_id_stable.sh | conv_id chargé depuis storage                   | PASS              |
