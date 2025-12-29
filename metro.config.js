const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.platforms = ['ios', 'android', 'native'];
// config.resolver.extraNodeModules = {
//   'react-native/Libraries/Utilities/codegenNativeCommands': require.resolve('react-native-web/dist/vendor/react-native/Utilities/codegenNativeCommands'),
// };
module.exports = withNativeWind(config, { input: './global.css' });
