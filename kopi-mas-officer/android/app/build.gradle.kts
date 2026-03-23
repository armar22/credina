plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.kopimas.kopi_mas_officer"
    
    // UPGRADED to satisfy plugins
    compileSdk = 36 
    ndkVersion = "27.0.12077973"

    compileOptions {
        // UPGRADED to Java 17 (Required by AGP 8.8+)
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    sourceSets {
        getByName("main").java.srcDirs("src/main/kotlin")
    }

    defaultConfig {
        applicationId = "com.kopimas.kopi_mas_officer"
        minSdk = 24
        targetSdk = 34 // Keep 34 or 35 for Play Store compatibility; targetSdk 36 is preview
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        getByName("release") {
            signingConfig = signingConfigs.getByName("debug")
            isMinifyEnabled = false
            isShrinkResources = false
        }
    }
}

flutter {
    source = "../.."
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib:2.1.0")
}