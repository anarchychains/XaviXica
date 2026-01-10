import React, { useEffect, useState } from "react";
import { storage } from "./lib/storage";

export default function CryptoContentAgent() {
  const [value, setValue] = useState("");

  useEffect(() => {
    storage.get("demo").then((res) => {
      if (res?.value) setValue(res.value);
    });
  }, []);

  useEffect(() => {
    storage.set("demo", value);
  }, [value]);

  return (
    <div style={{ padding: 40 }}>
      <h1>CryptoContentAgent</h1>
      <p>Base pronta ✅</p>

      <div style={{ marginTop: 16 }}>
        <label>Teste de storage (digita e recarrega a página):</label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ display: "block", marginTop: 8, padding: 8, width: "100%" }}
          placeholder="Escreve algo aqui..."
        />
      </div>
    </div>
  );
}
