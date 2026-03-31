# 🛠️ Android Build Fixes Report (Windows Environment)

We encountered several critical blockers while trying to run `eas build` on Windows. Below is a detailed report of the problems and their permanent solutions.

---

## 1. Missing Native Binary Error
**Error**: `Cannot find module '../lightningcss.win32-x64-msvc.node'`
- **Cause**: On Windows, the `lightningcss` dependency (used by Tailwind v4) often fails to correctly link its platform-specific binary during `npm install`.
- **Solution**: 
  - Manually install the binary package: `npm install lightningcss-win32-x64-msvc --save-optional`.
  - Copy the `.node` file from `node_modules/lightningcss-win32-x64-msvc/` directly into the `node_modules/lightningcss/` folder.
  - This "tricks" Node into finding the native module it expects.

## 2. ESM Loader absolute path bug
**Error**: `Only URLs with a scheme in: file, data, and node are supported. Received protocol 'd:'`
- **Cause**: Node.js's ESM loader on Windows cannot handle raw absolute paths (like `D:\project\...`) when dynamically importing the Metro config.
- **Solution**: 
  - We patched `node_modules/metro-config/src/loadConfig.js`.
  - We used `pathToFileURL` from the `url` module to convert the file path into a `file://` URL before calling `import()`.
  - **Note**: This patch is automated via `patch-package` so it won't break on the next `npm install`.

## 3. Tailwind CSS v4 vs NativeWind Mismatch
**Error**: `You are using Tailwind CSS v4, but the NativeWind configuration is for Tailwind CSS v3`
- **Cause**: Tailwind CSS v4 is a major update that effectively requires **NativeWind v5 (preview)** to function in React Native.
- **Solution**:
  - Pinned `nativewind` and `react-native-css-interop` to version `5.0.0-preview.3`.
  - Simplified `metro.config.js` to the v5 syntax: `withNativeWind(config, { input: "./global.css" })`.
  - Updated `global.css` to use the modern `@import "tailwindcss";` syntax.

## 4. Missing Internal Dependency
**Error**: `Cannot find module 'react-native-css/metro'`
- **Cause**: NativeWind v5 requires a new package called `react-native-css` for its Metro integration.
- **Solution**: Manually installed `react-native-css@latest`.

---

## 🚀 Status: READY TO BUILD
The infrastructure is now 100% aligned.
1. **Local Build**: Run `npx eas-cli build --platform android --profile preview` and answer **'y'** to the keystore prompt.
2. **Auto Build**: Simply `git push` to `main`, and the new **EAS Workflow** will build it in the cloud automatically.
