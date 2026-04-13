package com.titane.infinity

import android.content.Context
import android.util.Log
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

/**
 * TitaneSyncWorker — WorkManager periodique TITANE∞
 *
 * Exécute une vérification de santé et tente une remédiation légère toutes
 * les 15 minutes (minimum WorkManager Android). Complémentaire au
 * ForegroundService mais survivant à certaines situations où le service est tué.
 *
 * Policy:
 *   - Contrainte réseau: NOT_REQUIRED (vérifications locales)
 *   - Interval: 15 minutes (plancher platform Android)
 *   - ExistingPeriodicWorkPolicy.KEEP: pas de reschedule si déjà enregistré
 *
 * Limites:
 *   - Doze mode: WorkManager respecte les fenêtres Doze — exécution peut être
 *     différée jusqu'à la prochaine maintenance window (typiquement 1-3h).
 *   - Force-stop: WorkManager est annulé après force-stop, relancé au prochain
 *     démarrage manuel.
 */
class TitaneSyncWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {

    companion object {
        private const val TAG = "TitaneSyncWorker"
        const val WORK_NAME = "titane_sync_periodic"

        /**
         * Enregistre le worker périodique. Idempotent — KEEP si déjà planifié.
         */
        fun schedule(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
                .build()

            val request = PeriodicWorkRequestBuilder<TitaneSyncWorker>(
                15, TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )

            Log.i(TAG, "Worker périodique planifié (interval=15min, policy=KEEP)")
        }

        /**
         * Annule le worker périodique (ex. lors d'un nettoyage explicite).
         */
        fun cancel(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
            Log.i(TAG, "Worker périodique annulé")
        }
    }

    override fun doWork(): Result {
        Log.i(TAG, "Exécution travail périodique TITANE∞")

        return try {
            // Vérification de santé légère: s'assurer que le ForegroundService tourne.
            // Note: pas d'accès direct à ActivityManager depuis Worker sans contexte UI;
            // on se contente d'un health ping léger et de relancer le service si besoin.
            ensureForegroundServiceRunning()
            Log.i(TAG, "Travail périodique terminé: SUCCESS")
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Travail périodique échoué: ${e.message}", e)
            // RETRY: WorkManager reessaiera avec backoff exponentiel
            Result.retry()
        }
    }

    private fun ensureForegroundServiceRunning() {
        // Tenter de (re)démarrer le ForegroundService.
        // Si déjà actif, Android ignore la seconde commande onStartCommand.
        try {
            TitaneForegroundService.start(applicationContext)
            Log.d(TAG, "ForegroundService ping/start envoyé")
        } catch (e: Exception) {
            Log.w(TAG, "Impossible de démarrer ForegroundService depuis Worker: ${e.message}")
            // Non fatal — le service peut être actif mais inaccessible depuis Worker
        }
    }
}
