package com.titane.infinity

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log

/**
 * TitaneForegroundService — Maintien actif TITANE∞
 *
 * Ce service de premier plan permet à TITANE de rester actif pour les
 * traitements de longue durée (sync IA, mises à jour, etc.) en affichant
 * une notification persistante visible par l'utilisateur.
 *
 * Contraintes platform connues:
 * - Force-stop utilisateur: le service ne peut pas survivre à un force-stop explicite.
 * - Restrictions OEM (Samsung/Xiaomi/...): certains OEM ajoutent des restrictions
 *   supplémentaires. L'utilisateur peut activer "Optimisation batterie désactivée"
 *   pour TITANE dans les paramètres pour garantir la persistance maximale.
 * - Android 14+: foregroundServiceType="dataSync" requis dans le manifest.
 */
class TitaneForegroundService : Service() {

    companion object {
        private const val TAG = "TitaneForegroundService"
        const val CHANNEL_ID = "titane_foreground_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_START = "com.titane.infinity.action.START_FOREGROUND"
        const val ACTION_STOP  = "com.titane.infinity.action.STOP_FOREGROUND"

        fun start(context: Context) {
            val intent = Intent(context, TitaneForegroundService::class.java).apply {
                action = ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, TitaneForegroundService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "onCreate")
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.i(TAG, "onStartCommand action=${intent?.action}")

        return when (intent?.action) {
            ACTION_STOP -> {
                Log.i(TAG, "Stop requested — arrêt du service")
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                START_NOT_STICKY
            }
            else -> {
                // START or re-delivered — start foreground with persistent notification
                startForeground(NOTIFICATION_ID, buildNotification())
                Log.i(TAG, "Service démarré en premier plan")
                // START_STICKY: Android redémarre le service si tué par le système
                // (ne protège PAS contre le force-stop utilisateur)
                START_STICKY
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        Log.i(TAG, "onDestroy")
    }

    // ─── Notification ──────────────────────────────────────────────────────

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "TITANE∞ Service",
                NotificationManager.IMPORTANCE_LOW   // LOW = pas de son, discret
            ).apply {
                description = "Maintien actif TITANE∞ pour traitements IA"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        // Intent pour ouvrir l'app au tap sur la notification
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val pendingIntent = PendingIntent.getActivity(this, 0, openIntent, pendingFlags)

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        return builder
            .setContentTitle("TITANE∞")
            .setContentText("Actif en arrière-plan")
            .setSmallIcon(android.R.drawable.ic_menu_info_details)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }
}
