module.exports = ({ config }) => ({
  ...config,
  extra: { ...config.extra, useGoogleMaps: Boolean(process.env.GOOGLE_MAPS_ANDROID_API_KEY) },
  plugins: [
    ...config.plugins,
    ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }],
  ],
});
