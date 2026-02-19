require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

module.exports = {
  expo: {
    name: "TOMI",
    slug: "TOMI",
    version: "1.0.0",
    orientation: "portrait",
    // icon: "./assets/images/icon.png",
    scheme: "tomi",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.tomi.workout",
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.MAP_API_KEY
      }
    },
    android: {
      package: "com.tomi.workout",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.MAP_API_KEY
        }
      },
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    },
    web: {
      output: "static",
      // favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-sqlite",
      [
        "react-native-ble-plx",
        {
          "isBackgroundEnabled": false,
          "modes": ["central"],
          "bluetoothAlwaysPermission": "TOMI needs Bluetooth to connect to your smartwatch sensor during workouts."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow TOMI to use your location for workout tracking."
        }
      ]
      // [
      //   "expo-splash-screen",
      //   {
      //     image: "./assets/images/splash-icon.png",
      //     imageWidth: 200,
      //     resizeMode: "contain",
      //     backgroundColor: "#ffffff",
      //     dark: {
      //       backgroundColor: "#000000"
      //     }
      //   }
      // ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      TOMI_API_BASE_URL: process.env.TOMI_API_BASE_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY
    }
  }
};
