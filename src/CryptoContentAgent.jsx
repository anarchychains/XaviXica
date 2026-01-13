import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Twitter,
  Instagram,
  Linkedin,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  Link as LinkIcon,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import { storage } from "./lib/storage";

/* ===============================
   CONFIG BASE
================================ */
const CHARACTERISTICS = [
  { id: "sell", label: "Vender (direto ao ponto)", hint: "Oferta, benefício, CTA forte." },
  { id: "reflective", label: "Reflexivo / filosófico", hint: "Humano, introspectivo, perguntas." },
  { id: "investigative", label: "Repórter investigativo", hint: "Apuração, evidência, contraste." },
  { id: "educational", label: "Educativo / didático", hint: "Explica sem jargão, passo a passo." },
  { id: "controversial", label: "Polêmico (controlado)", hint: "Provoca sem ser tóxico." },
  { id: "storytelling", label: "Storytelling", hint: "História → insight → ação." },
];

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "twitter", label: "Twitter/X", icon: Twitter },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
];

const FORMATS_BY_PLATFORM = {
  instagram: [
    { id: "feed", label: "Feed Post", ratio: "1:1" },
    { id: "stories", label: "Stories", ratio: "9:16" },
    { id: "reels", label: "Reels", ratio: "9:16" },
    { id: "carousel", label: "Carrossel", ratio: "1:1" },
  ],
  twitter: [
    { id: "tweet", label: "Tweet", ratio: "16:9" },
    { id: "thread", label: "Thread", ratio: "16:9" },
  ],
  linkedin: [
    { id: "post", label: "Post", ratio: "1.91:1" },
    { id: "article", label: "Artigo", ratio: "1.91:1" },
  ],
};

/* ===============================
   COMPONENTS
================================ */
function Pill({ active, children, onClick, Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
        active ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-gray-300",
      ].join(" ")}
    >
      {Icon ? <Icon size={18} /> : null}
      <span className="font-medium">{children}</span>
    </button>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={[
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition",
        copied
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
      ].join(" ")}
      title="Copiar conteúdo"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copiado ✅" : "Copiar"}
    </button>
  );
}

function Notice({ type = "info", children }) {
  const styles =
    type === "error"
