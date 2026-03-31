try {
  console.log("Attempting to require nativewind/metro...");
  const { withNativeWind } = require("nativewind/metro");
  console.log("Success! withNativeWind is defined:", !!withNativeWind);
} catch (e) {
  console.error("FAILED to load nativewind/metro:");
  console.error(e);
}
