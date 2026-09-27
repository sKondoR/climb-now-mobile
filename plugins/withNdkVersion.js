const { withProjectBuildGradle } = require('expo/config-plugins');

// Native library modules that build C++ without setting ndkVersion (e.g. expo-updates)
// fall back to AGP's default NDK, which then gets auto-downloaded. Pin them all to the
// NDK version React Native already requires so only one NDK has to be installed.
const SNIPPET = `
// @generated withNdkVersion
subprojects { subproject ->
  subproject.plugins.withId('com.android.library') {
    subproject.android.ndkVersion = rootProject.ext.ndkVersion
  }
}
`;

module.exports = function withNdkVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('@generated withNdkVersion')) {
      config.modResults.contents += SNIPPET;
    }
    return config;
  });
};
