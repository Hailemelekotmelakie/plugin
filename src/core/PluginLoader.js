import { useEffect } from "react";
import { nexus } from "./PluginManager";
import mapPlugin from "../plugins/map-plugin";
import wikiPlugin from "../plugins/wiki-plugin";

export const usePlugins = () => {
  useEffect(() => {
    // Clear existing plugins (optional)
    nexus.plugins = [];

    // Register Map Plugin
    const map = {
      id: "map-plugin",
      name: mapPlugin.name || "Map Plugin",
      version: mapPlugin.version || "1.0.0",
      component: mapPlugin.component,
      enabled: true,
      ...mapPlugin,
    };
    nexus.register(map);

    const wiki = {
      id: "wiki-plugin",
      name: "Wiki Plugin",
      version: "1.0.0",
      component: wikiPlugin.component,
      enabled: true,
      ...wikiPlugin,
    };
    nexus.register(wiki);
  }, []);
  console.log("nexus", nexus);
  return nexus;
};
