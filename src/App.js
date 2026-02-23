import React, { useState, useEffect } from "react";
import { nexus } from "./core/PluginManager";
import { PluginSlot } from "./core/PluginSlot";
import { usePlugins } from "./core/PluginLoader";

function App() {
  const [plugins, setPlugins] = useState([]);

  usePlugins();

  useEffect(() => {
    setPlugins(nexus.getPlugins());

    const unsubscribe = nexus.subscribe((updated) => {
      setPlugins(updated);
    });

    return unsubscribe;
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <header
        style={{
          background: "#282c34",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Nexus Plugin System</h1>
      </header>

      <main
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#f5f5f5",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <strong>Active Plugins: </strong>
          {plugins.filter((p) => p.enabled).length}/{plugins.length}
          <span style={{ color: "#666", fontSize: "12px", marginLeft: "10px" }}>
            (All sharing root node_modules)
          </span>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #ddd",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0" }}>Installed Plugins</h3>
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                <span style={{ marginRight: "8px", fontSize: "18px" }}></span>
                {plugin.name}
                <small
                  style={{
                    marginLeft: "10px",
                    color: "#666",
                    fontSize: "12px",
                  }}
                >
                  v{plugin.version}
                </small>
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <button
                  onClick={() => nexus.toggle(plugin.id)}
                  style={{
                    padding: "5px 15px",
                    border: "none",
                    borderRadius: "4px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                    background: plugin.enabled ? "#dc3545" : "#28a745",
                  }}
                >
                  {plugin.enabled ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ margin: "0 0 15px 0" }}>Each Plugin Output</h3>
          <PluginSlot />
        </div>
      </main>

      <footer>
        <p>
          Footer - Nexus Plugin System Demo. All plugins share the same root
          node_modules for maximum compatibility.
        </p>
      </footer>
    </div>
  );
}

export default App;
