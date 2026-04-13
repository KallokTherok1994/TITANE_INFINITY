package com.titane.infinity

import android.os.Bundle
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    // Always-on: démarrer le service de premier plan et planifier le worker périodique.
    // Ces appels sont idempotents — inoffensifs si déjà actifs.
    TitaneForegroundService.start(this)
    TitaneSyncWorker.schedule(this)
  }
}
