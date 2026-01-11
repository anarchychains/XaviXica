import { useState } from "react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      alert("Erro ao copiar 😢");
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: copied ? "#16a34a" : "#111827",
        color: "#fff",
        fontWeight: 500,
        cursor: "pointer",
        alignSelf: "flex-end",
      }}
    >
      {copied ? "Copiado ✓" : "Copiar"}
    </button>
  );
}
