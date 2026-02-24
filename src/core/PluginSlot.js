import React, { useState, useEffect } from "react";
import { nexus } from "./PluginManager";

export const PluginSlot = ({ ...props }) => {
  const [plugins, setPlugins] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const enabled = nexus.getEnabled();
    setPlugins(enabled);

    console.log(enabled);

    if (enabled.length > 0) {
      setActiveTab(enabled[0].id); // default first tab
    }

    const unsubscribe = nexus.subscribe((updated) => {
      const enabledPlugins = updated.filter((p) => p.enabled);
      setPlugins(enabledPlugins);

      // If active tab was removed, reset to first
      if (!enabledPlugins.find((p) => p.id === activeTab)) {
        setActiveTab(enabledPlugins[0]?.id || null);
      }
    });

    return unsubscribe;
  }, []);

  const activePlugin = plugins.find((p) => p.id === activeTab);

  return (
    <div>
      {/* Tabs Header */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {plugins.map((plugin) => (
          <button
            key={plugin.id}
            onClick={() => setActiveTab(plugin.id)}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: activeTab === plugin.id ? "#333" : "#f5f5f5",
              color: activeTab === plugin.id ? "#fff" : "#000",
            }}
          >
            {plugin.icon} {plugin.name}
          </button>
        ))}
      </div>

      {/* Active Plugin Content */}
      <div>
        {activePlugin && activePlugin.component && (
          <activePlugin.component.component {...props} />
        )}
      </div>
    </div>
  );
};
