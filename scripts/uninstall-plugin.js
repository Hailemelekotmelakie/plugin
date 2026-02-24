#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pluginsDir = path.join(__dirname, "../src/plugins");

async function uninstallPlugin(pluginId, force = false) {
  console.log(`🗑️  Uninstalling plugin: ${pluginId}`);

  const pluginPath = path.join(pluginsDir, pluginId);

  if (!(await fs.pathExists(pluginPath))) {
    console.error(`❌ Plugin "${pluginId}" not found`);

    // List available plugins
    const plugins = await fs.readdir(pluginsDir);
    if (plugins.length > 0) {
      console.log("\nAvailable plugins:");
      plugins.forEach((p) => console.log(`  - ${p}`));
    }
    process.exit(1);
  }

  // Read plugin info
  let pluginName = pluginId;
  let pluginVersion = "unknown";

  try {
    const configPath = path.join(pluginPath, "plugin.json");
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      pluginName = config.name || pluginId;
      pluginVersion = config.version || "unknown";
    }
  } catch (err) {
    // Ignore
  }

  console.log(`\n📦 Plugin details:`);
  console.log(`   Name: ${pluginName}`);
  console.log(`   ID: ${pluginId}`);
  console.log(`   Version: ${pluginVersion}`);
  console.log(`   Path: ${pluginPath}`);

  if (!force) {
    const answer = await new Promise((resolve) => {
      rl.question("\n⚠️  Are you sure you want to uninstall? (y/N) ", resolve);
    });

    if (answer.toLowerCase() !== "y") {
      console.log("❌ Uninstall cancelled");
      rl.close();
      process.exit(0);
    }
  }

  // Remove plugin
  await fs.remove(pluginPath);
  console.log("✅ Plugin files removed");

  // Update manifest
  await updateManifest();

  console.log(`\n✅ Plugin "${pluginName}" uninstalled successfully!`);
  rl.close();
}

async function updateManifest() {
  const manifestPath = path.join(__dirname, "../src/plugin-manifest.json");
  const plugins = [];

  const items = await fs.readdir(pluginsDir);

  for (const item of items) {
    const pluginPath = path.join(pluginsDir, item);
    const stat = await fs.stat(pluginPath);

    if (stat.isDirectory()) {
      try {
        const configPath = path.join(pluginPath, "plugin.json");
        if (await fs.pathExists(configPath)) {
          const config = await fs.readJson(configPath);
          plugins.push({
            id: item,
            ...config,
            path: `../plugins/${item}/index.js`,
          });
        }
      } catch (err) {
        // Ignore
      }
    }
  }

  await fs.writeJson(manifestPath, { plugins }, { spaces: 2 });
}

// Command line interface
const args = process.argv.slice(2);
const pluginId = args[0];
const force = args.includes("--force") || args.includes("-f");

if (!pluginId || args.includes("--help")) {
  console.log(`
🔌 Nexus Plugin Uninstaller

Usage:
  npm run uninstall-plugin <plugin-id>          Uninstall a plugin
  npm run uninstall-plugin <plugin-id> --force  Force uninstall (no prompt)

Examples:
  npm run uninstall-plugin wiki-plugin
  npm run uninstall-plugin map-plugin --force
  `);
  process.exit(0);
}

uninstallPlugin(pluginId, force).catch(console.error);
