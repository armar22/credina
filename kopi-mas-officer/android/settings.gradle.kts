pluginManagement {
    val flutterSdkPath =
        run {
            val properties = java.util.Properties()
            val propertiesFile = file("local.properties")
            if (propertiesFile.exists()) {
                propertiesFile.inputStream().use { properties.load(it) }
            }
            val path = properties.getProperty("flutter.sdk")
            require(path != null) { "flutter.sdk not set in local.properties" }
            path
        }

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id("dev.flutter.flutter-plugin-loader") version "1.0.0"
    // UPGRADED to 8.9.1 to support SDK 36 and Activity-KTX 1.12.4
    id("com.android.application") version "8.9.1" apply false
    // UPGRADED Kotlin for compatibility
    id("org.jetbrains.kotlin.android") version "2.1.0" apply false
}

include(":app")