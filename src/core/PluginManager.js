// Plugin Manager - Core of Nexus
class PluginManager {
  constructor() {
    this.plugins = [];
    this.listeners = [];
  }

  getPlugins() {
    return this.plugins;
  }

  // Register a plugin
  register(plugin) {
    if (!this.plugins.find((p) => p.id === plugin.id)) {
      console.log(`📦 Nexus loaded: ${plugin.name}`);
      this.plugins.push(plugin);
      this.notify();
    }
    return plugin;
  }

  // Get all plugins
  getAll() {
    return this.plugins;
  }

  // Get enabled plugins
  getEnabled() {
    return this.plugins.filter((p) => p.enabled === true);
  }

  // Toggle plugin on/off
  toggle(pluginId) {
    const plugin = this.plugins.find((p) => p.id === pluginId);
    if (plugin) {
      plugin.enabled = !plugin.enabled;
      this.notify();
      console.log(
        `${plugin.enabled ? "✅" : "❌"} ${plugin.name} ${plugin.enabled ? "enabled" : "disabled"}`,
      );
    }
  }

  // Uninstall plugin
  uninstall(pluginId) {
    const plugin = this.plugins.find((p) => p.id === pluginId);
    this.plugins = this.plugins.filter((p) => p.id !== pluginId);
    this.notify();
    console.log(`🗑️  Uninstalled: ${plugin?.name || pluginId}`);
    return plugin;
  }

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((l) => l([...this.plugins]));
  }
}

export const nexus = new PluginManager();
