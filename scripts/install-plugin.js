#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const AdmZip = require("adm-zip");
const { execSync } = require("child_process");

async function installPlugin(source) {
  const pluginsDir = path.join(__dirname, "../src/plugins");

  console.log("📦 Installing plugin into Nexus...");

  await fs.ensureDir(pluginsDir);

  let pluginPath;
  let pluginName;

  if (source.endsWith(".zip")) {
    const zip = new AdmZip(source);
    const zipEntries = zip.getEntries();

    const configEntry = zipEntries.find((e) =>
      e.entryName.endsWith("plugin.json"),
    );
    if (!configEntry) {
      console.error("❌ Invalid plugin: No plugin.json found");
      return;
    }

    const config = JSON.parse(configEntry.getData().toString());
    pluginName = config.id || config.name;
    pluginPath = path.join(pluginsDir, pluginName);

    zip.extractAllTo(pluginPath, true);
    console.log(`✅ Plugin extracted to: ${pluginPath}`);
  } else {
    pluginName = path.basename(source);
    pluginPath = path.join(pluginsDir, pluginName);
    await fs.copy(source, pluginPath);
    console.log(`✅ Plugin copied to: ${pluginPath}`);
  }

  // Install plugin dependencies
  console.log("📦 Installing plugin dependencies...");
  execSync(`cd ${pluginPath} && npm install`, { stdio: "inherit" });

  console.log("✅ Plugin installed successfully!");
  console.log("🔄 Restart the app to load the new plugin");
}

const source = process.argv[2];
if (!source) {
  console.log("Usage: npm run install-plugin <path-to-plugin-or-zip>");
  process.exit(1);
}

installPlugin(source).catch(console.error);
