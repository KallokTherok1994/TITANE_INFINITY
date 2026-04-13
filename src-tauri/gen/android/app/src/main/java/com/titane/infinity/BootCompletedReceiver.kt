package com.titane.infinity

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * BootCompletedReceiver — Reprise TITANE∞ après reboot
 *
 * Reçoit ACTION_BOOT_COMPLETED et QUICKBOOT_POWERON (Samsung Quick Boot)
 * pour relancer le ForegroundService dès que le système démarre.
 *
 * Prérequis manifest:
 *   <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
 *
 * Limites connues:
 *   - Force-stop prior to reboot: si l'utilisateur a forcé l'arrêt de l'app
 *     avant le reboot, Android 3.1+ bloque le démarrage automatique jusqu'au
 *     prochain lancement manuel.
 *   - OEM Doze/Kill: certains OEM (Samsung One UI, Xiaomi MIUI, OPPO ColorOS)
 *     peuvent tout de même bloquer la relance sans exemption explicite.
 */
class BootCompletedReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "BootCompletedReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        if (action != Intent.ACTION_BOOT_COMPLETED &&
            action != "android.intent.action.QUICKBOOT_POWERON") {
            return
        }

        Log.i(TAG, "Boot received (action=$action) — démarrage ForegroundService")

        try {
            TitaneForegroundService.start(context)
            Log.i(TAG, "ForegroundService démarré après boot")
        } catch (e: Exception) {
            Log.e(TAG, "Échec démarrage ForegroundService après boot: ${e.message}", e)
        }
    }
}
