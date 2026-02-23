#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

async function uninstallPlugin(pluginId) {
  const pluginPath = path.join(__dirname, "../src/plugins", pluginId);

  if (!(await fs.pathExists(pluginPath))) {
    console.error(`❌ Plugin "${pluginId}" not found`);
    return;
  }

  try {
    const config = await fs.readJson(path.join(pluginPath, "plugin.json"));
    console.log(
      `🗑️  Uninstalling: ${config.name || pluginId} v${config.version || "1.0.0"}`,
    );
  } catch {
    console.log(`🗑️  Uninstalling: ${pluginId}`);
  }

  await fs.remove(pluginPath);
  console.log("✅ Plugin uninstalled successfully");
  console.log("🔄 Restart the app to update");
}

const pluginId = process.argv[2];
if (!pluginId) {
  console.log("Usage: npm run uninstall-plugin <plugin-id>");
  console.log("\nAvailable plugins:");

  const pluginsDir = path.join(__dirname, "../src/plugins");
  if (fs.existsSync(pluginsDir)) {
    const plugins = fs.readdirSync(pluginsDir);
    plugins.forEach((p) => console.log(`  - ${p}`));
  }
  process.exit(1);
}

uninstallPlugin(pluginId).catch(console.error);
