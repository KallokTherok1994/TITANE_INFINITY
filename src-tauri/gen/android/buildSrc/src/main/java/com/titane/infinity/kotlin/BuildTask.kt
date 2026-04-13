import java.io.File
import org.apache.tools.ant.taskdefs.condition.Os
import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.logging.LogLevel
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

open class BuildTask : DefaultTask() {
    @Input
    var rootDirRel: String? = null
    @Input
    var target: String? = null
    @Input
    var release: Boolean? = null

    @TaskAction
    fun assemble() {
        val executable = """pnpm""";
        try {
            runTauriCli(executable)
        } catch (e: Exception) {
            if (Os.isFamily(Os.FAMILY_WINDOWS)) {
                // Try different Windows-specific extensions
                val fallbacks = listOf(
                    "$executable.exe",
                    "$executable.cmd",
                    "$executable.bat",
                )
                
                var lastException: Exception = e
                for (fallback in fallbacks) {
                    try {
                        runTauriCli(fallback)
                        return
                    } catch (fallbackException: Exception) {
                        lastException = fallbackException
                    }
                }
                throw lastException
            } else {
                throw e;
            }
        }
    }

    fun runTauriCli(executable: String) {
        val rootDirRel = rootDirRel ?: throw GradleException("rootDirRel cannot be null")
        val target = target ?: throw GradleException("target cannot be null")
        val release = release ?: throw GradleException("release cannot be null")
        val ideArgs = listOf("tauri", "android", "android-studio-script")

        try {
            execTauri(executable, rootDirRel, target, release, ideArgs)
            return
        } catch (e: Exception) {
            // android-studio-script requires an IDE WebSocket bridge; fallback for headless CI/local shells.
            project.logger.warn("android-studio-script failed, trying headless build fallback", e)
        }

        val headlessArgs = listOf("tauri", "android", "build")
        execTauri(executable, rootDirRel, target, release, headlessArgs)
    }

    private fun execTauri(
        executableName: String,
        rootDirRel: String,
        target: String,
        release: Boolean,
        baseArgs: List<String>,
    ) {
        project.exec {
            workingDir(File(project.projectDir, rootDirRel))
            executable(executableName)
            args(baseArgs)
            if (project.logger.isEnabled(LogLevel.DEBUG)) {
                args("-vv")
            } else if (project.logger.isEnabled(LogLevel.INFO)) {
                args("-v")
            }
            if (release) {
                args("--release")
            }
            args(listOf("--target", target))
        }.assertNormalExitValue()
    }
}