try {
  const lightningcss = require('lightningcss');
  console.log("LightningCSS loaded successfully!");
  console.log("Version:", lightningcss.version);
} catch (e) {
  console.error("FAILED to load LightningCSS:");
  console.error(e);
}
