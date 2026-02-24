import { useEffect } from "react";
import { nexus } from "./PluginManager";
import manifest from "../plugin-manifest.json";

export const usePlugins = () => {
  useEffect(() => {
    console.log("📦 Loading plugins from manifest...");

    const loadPlugins = async () => {
      for (const pluginInfo of manifest.plugins) {
        try {
          // For CRA, we need to use relative paths from the current file
          const module = await import(`../plugins/${pluginInfo.id}/index.js`);

          // Get the component (handle different export patterns)
          const component = module.default || module;

          nexus.register({
            id: pluginInfo.id,
            name: pluginInfo.name,
            version: pluginInfo.version,
            description: pluginInfo.description,
            icon: pluginInfo.icon,
            zone: pluginInfo.zone,
            enabled: pluginInfo.enabled,
            component: component,
            ...pluginInfo,
          });

          console.log(`✅ Loaded: ${pluginInfo.name}`);
        } catch (err) {
          console.error(`❌ Failed to load ${pluginInfo.id}:`, err);
        }
      }
    };

    loadPlugins();
  }, []);

  return nexus;
};
