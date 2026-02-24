#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const AdmZip = require("adm-zip");
const { execSync } = require("child_process");

const pluginsDir = path.join(__dirname, "../src/plugins");

async function installPlugin(source) {
  console.log("📦 Installing plugin...");

  // Ensure plugins directory exists
  await fs.ensureDir(pluginsDir);

  let pluginId;
  let pluginPath;

  if (source.endsWith(".zip")) {
    // Read ZIP file
    const zip = new AdmZip(source);
    const entries = zip.getEntries();

    // Find plugin.json to get plugin ID
    const configEntry = entries.find((e) =>
      e.entryName.endsWith("plugin.json"),
    );
    if (!configEntry) {
      console.error("❌ Invalid plugin: No plugin.json found");
      process.exit(1);
    }

    const config = JSON.parse(configEntry.getData().toString());
    pluginId = config.id || config.name || path.basename(source, ".zip");

    // Extract to plugins directory
    pluginPath = path.join(pluginsDir, pluginId);

    // Remove existing if present
    if (await fs.pathExists(pluginPath)) {
      console.log(`⚠️  Plugin ${pluginId} already exists. Overwriting...`);
      await fs.remove(pluginPath);
    }

    // Extract
    zip.extractAllTo(pluginPath, true);

    // Handle nested folders
    const files = await fs.readdir(pluginPath);
    if (files.length === 1) {
      const firstFile = path.join(pluginPath, files[0]);
      const stat = await fs.stat(firstFile);
      if (stat.isDirectory()) {
        // Move contents up
        const tempPath = path.join(pluginsDir, `temp_${Date.now()}`);
        await fs.move(firstFile, tempPath);
        await fs.remove(pluginPath);
        await fs.move(tempPath, pluginPath);
      }
    }

    console.log(`✅ Extracted to: ${pluginPath}`);
  } else {
    // Copy directory
    pluginId = path.basename(source);
    pluginPath = path.join(pluginsDir, pluginId);

    if (await fs.pathExists(pluginPath)) {
      console.log(`⚠️  Plugin ${pluginId} already exists. Overwriting...`);
      await fs.remove(pluginPath);
    }

    await fs.copy(source, pluginPath);
    console.log(`✅ Copied to: ${pluginPath}`);
  }

  // Install plugin dependencies
  console.log("📦 Installing plugin dependencies...");
  try {
    // We run this from the root, targeting the specific plugin workspace
    execSync(`npm install`, {
      stdio: "inherit",
      shell: true,
    });
  } catch (err) {
    console.log("Dependency installation failed, continuing...");
  }

  // Update manifest
  await updateManifest();

  console.log("\n✅ Plugin installed successfully!");
  console.log(`📍 Location: ${pluginPath}`);
  console.log("\n🔄 Restart and scan your app to load the new plugin");
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
        console.error(`Error reading ${item}:`, err.message);
      }
    }
  }

  await fs.writeJson(manifestPath, { plugins }, { spaces: 2 });
  console.log(`📝 Manifest updated with ${plugins.length} plugins`);
}

// Command line interface
const source = process.argv[2];
if (!source || source === "--help") {
  console.log(`
🔌 Nexus Plugin Installer

Usage:
  npm run install-plugin <path-to-zip>     Install from ZIP file
 
Examples:
  npm run install-plugin ./dist/plugins/wiki-plugin-v1.0.0.zip
   `);
  process.exit(0);
}

installPlugin(source).catch(console.error);
