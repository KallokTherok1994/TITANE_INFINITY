#!/usr/bin/env python3
"""
Manual IPC conversion for multi-line patterns in useDebuggerLiveOS
"""
import re

FILE = 'src/features/system-center/hooks/useDebuggerLiveOS.ts'

def convert_debugger_live_os():
    with open(FILE, 'r') as f:
        content = f.read()
    
    # Pattern 1: Multi-line await secureInvoke (singularity_get_full_state)
    content = re.sub(
        r"const singularity = await secureInvoke<\{[^}]*physical:[^}]*cognitive:[^}]*symbolic:[^}]*adaptive:[^}]*meta:[^}]*\}>\\('singularity_get_full_state'\\);",
        "const singularity = await tauriClient.singularityGetFullState() as { physical: Record<string, unknown>; cognitive: Record<string, unknown>; symbolic: Record<string, unknown>; adaptive: Record<string, unknown>; meta: Record<string, unknown>; };",
        content,
        flags=re.DOTALL
    )
    
    # Pattern 2: Multi-line await secureInvoke (get_memory_state)
    content = re.sub(
        r"const memoryState = await secureInvoke<\{[^}]*recent_memories:[^}]*long_term_count:[^}]*total_size_kb:[^}]*\}>\\('get_memory_state'\\);",
        "const memoryState = await tauriClient.getMemoryState() as { recent_memories: Array<Record<string, unknown>>; long_term_count: number; total_size_kb: number; };",
        content,
        flags=re.DOTALL
    )
    
    # Pattern 3: Multi-line await secureInvoke (titan_get_persistence_status)
    content = re.sub(
        r"const persistenceStatus = await secureInvoke<\{[^}]*snapshot_id:[^}]*events_count:[^}]*integrity_hash:[^}]*\}>\\('titan_get_persistence_status'\\);",
        "const persistenceStatus = await tauriClient.titanGetPersistenceStatus() as { snapshot_id: string; events_count: number; integrity_hash: string; };",
        content,
        flags=re.DOTALL
    )
    
    # Pattern 4: Multi-line await secureInvoke (get_system_health) in Promise.all  
    content = re.sub(
        r'secureInvoke<\{ healthy: boolean; status: string \}>\(\s*\'get_system_health\'\s*\)',
        'tauriClient.getSystemHealth() as Promise<{ healthy: boolean; status: string }>',
        content
    )
    
    with open(FILE, 'w') as f:
        f.write(content)
    
    print(f"✅ Converted {FILE}")

if __name__ == '__main__':
    convert_debugger_live_os()
