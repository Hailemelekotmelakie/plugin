const fs = require("fs");
const path = require("path");

const pluginsDir = path.join(__dirname, "../src/plugins");
const manifestPath = path.join(__dirname, "../src/plugin-manifest.json");

function scanPlugins() {
  console.log("🔍 Scanning plugins directory...");

  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });
  }

  const items = fs.readdirSync(pluginsDir);
  const plugins = [];

  items.forEach((item) => {
    const pluginPath = path.join(pluginsDir, item);
    const stats = fs.statSync(pluginPath);

    if (stats.isDirectory()) {
      try {
        const configPath = path.join(pluginPath, "plugin.json");
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

          const indexPath = path.join(pluginPath, "index.js");
          if (fs.existsSync(indexPath)) {
            plugins.push({
              id: item,
              name: config.name || item,
              version: config.version || "1.0.0",
              description: config.description || "",
              author: config.author || "",
              enabled: config.enabled !== false,
              icon: config.icon || "🔌",
              zone: config.zone || "main",
              // Fix: Use relative path from src
              path: `../plugins/${item}/index.js`,
            });
            console.log(`✅ Found plugin: ${config.name || item}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error reading plugin ${item}:`, err.message);
      }
    }
  });

  const manifest = {
    generated: new Date().toISOString(),
    count: plugins.length,
    plugins: plugins,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📝 Manifest generated with ${plugins.length} plugins`);
}

if (require.main === module) {
  scanPlugins();
}

module.exports = scanPlugins;
