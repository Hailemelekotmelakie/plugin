#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");

const pluginsDir = path.join(__dirname, "../src/plugins");
const distDir = path.join(__dirname, "../dist/plugins");

async function packPlugin(pluginId) {
  console.log(`📦 Packaging plugin: ${pluginId}`);

  const pluginPath = path.join(pluginsDir, pluginId);

  // Check if plugin exists
  if (!(await fs.pathExists(pluginPath))) {
    console.error(`❌ Plugin "${pluginId}" not found in src/plugins/`);
    console.log("Available plugins:");
    const plugins = await fs.readdir(pluginsDir);
    plugins.forEach((p) => console.log(`  - ${p}`));
    process.exit(1);
  }

  // Read plugin.json to get version
  const configPath = path.join(pluginPath, "plugin.json");
  if (!(await fs.pathExists(configPath))) {
    console.error(`❌ plugin.json not found in ${pluginId}`);
    process.exit(1);
  }

  const config = await fs.readJson(configPath);
  const version = config.version || "1.0.0";
  const pluginName = config.name || pluginId;

  // Create dist directory
  await fs.ensureDir(distDir);

  // Create ZIP file
  const zipName = `${pluginId}-v${version}.zip`;
  const zipPath = path.join(distDir, zipName);

  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Maximum compression
  });

  output.on("close", () => {
    console.log(`✅ Packaged: ${zipName}`);
    console.log(`📁 Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📍 Location: ${zipPath}`);

    // Create package info
    createPackageInfo(pluginId, config, zipPath);
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  // Add plugin files (excluding node_modules and other unnecessary files)
  archive.directory(pluginPath, pluginId, (entry) => {
    // Exclude node_modules, .git, etc.
    const excludeDirs = ["node_modules", ".git", ".DS_Store"];
    if (excludeDirs.some((dir) => entry.name.includes(dir))) {
      return false;
    }
    return entry;
  });

  await archive.finalize();
}

async function createPackageInfo(pluginId, config, zipPath) {
  const infoPath = path.join(distDir, `${pluginId}-info.json`);

  const info = {
    id: pluginId,
    name: config.name || pluginId,
    version: config.version || "1.0.0",
    description: config.description || "",
    author: config.author || "",
    license: config.license || "MIT",
    dependencies: config.dependencies || {},
    size: (await fs.stat(zipPath)).size,
    packageFile: path.basename(zipPath),
    installInstructions: `
Installation:
1. Run: npm run install-plugin ${path.basename(zipPath)}
2. Or use the Plugin Manager UI
    `,
  };

  await fs.writeJson(infoPath, info, { spaces: 2 });
  console.log(`📝 Package info: ${infoPath}`);
}

// Pack all plugins
async function packAllPlugins() {
  console.log("📦 Packaging ALL plugins...");

  const plugins = await fs.readdir(pluginsDir);
  let success = 0;
  let failed = 0;

  for (const plugin of plugins) {
    const pluginPath = path.join(pluginsDir, plugin);
    const stat = await fs.stat(pluginPath);

    if (stat.isDirectory()) {
      try {
        await packPlugin(plugin);
        success++;
      } catch (err) {
        console.error(`❌ Failed to pack ${plugin}:`, err.message);
        failed++;
      }
    }
  }

  console.log("\n📊 Summary:");
  console.log(`   ✅ Packed: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Output: ${distDir}`);
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (command === "all") {
  packAllPlugins();
} else if (command) {
  packPlugin(command);
} else {
  console.log(`
🔌 Nexus Plugin Packer

Usage:
  npm run pack-plugin <plugin-id>    Pack a single plugin
  npm run pack-plugin all             Pack all plugins

Examples:
  npm run pack-plugin wiki-plugin
  npm run pack-plugin map-plugin
  npm run pack-plugin all

Output: ./dist/plugins/
  `);
}
