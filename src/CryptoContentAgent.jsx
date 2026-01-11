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
   MOCK GENERATOR
================================ */
function mockGenerate({ topic, platform, format, characteristic }) {
  const title = `O que você precisa saber sobre ${topic}`;
  const copy =
    platform === "twitter" && format === "thread"
      ? `1/ ${topic}\n\n2/ Contexto rápido.\n\n3/ Insight prático.\n\n4/ Template copiável.\n\n5/ CTA final.`
      : `📌 ${topic}\n\n• Insight prático\n• Erro comum\n• Próximo passo\n\n👉 Salva pra usar depois.`;

  return {
    title,
    copy,
    hashtags: ["conteudo", "criadores", "IA", "produtividade"],
    cta: "Salva e compartilha.",
    designElements: {
      headline: topic,
      subheadline: "Clareza antes de escala.",
    },
    bestTime: "18h–21h",
  };
}

/* ===============================
   COMPONENTS
================================ */
function Pill({ active, children, onClick, Icon }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 ${
        active ? "border-purple-600 bg-purple-50" : "border-gray-200"
      }`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold ${
        copied
          ? "bg-green-100 border-green-300 text-green-700"
          : "bg-white border-gray-200 text-gray-700"
      }`}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

/* ===============================
   MAIN
================================ */
export default function CryptoContentAgent() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [format, setFormat] = useState("feed");
  const [characteristic, setCharacteristic] = useState("educational");
  const [generated, setGenerated] = useState(null);

  const copyPayload = useMemo(() => {
    if (!generated) return "";
    return `${generated.title}\n\n${generated.copy}\n\n${generated.hashtags
      .map((h) => `#${h}`)
      .join(" ")}`;
  }, [generated]);

  function handleGenerate() {
    if (!topic.trim()) return;
    setGenerated(mockGenerate({ topic, platform, format, characteristic }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold flex justify-center gap-2">
            <Sparkles className="text-purple-600" />
            Agente de Criação de Conteúdo
          </h1>
          <p className="text-gray-600">
            Crie, planeje e escale sua produção de conteúdo com IA.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Sobre o que você quer postar?"
            className="w-full px-4 py-3 border rounded-lg"
          />

          <div className="grid grid-cols-2 gap-4">
            {PLATFORMS.map((p) => (
              <Pill
                key={p.id}
                active={platform === p.id}
                onClick={() => setPlatform(p.id)}
                Icon={p.icon}
              >
                {p.label}
              </Pill>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold"
          >
            Gerar Conteúdo
          </button>
        </div>

        {generated && (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
    {/* COPY BAR FIXA (ESSÊNCIA DO PRODUTO) */}
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
      <div className="font-semibold text-sm text-gray-800">
        Conteúdo gerado
      </div>
      <CopyButton text={copyPayload} />
    </div>

    {/* SCROLL DO CONTEÚDO */}
    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      <h2 className="font-bold text-lg">{generated.title}</h2>

      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
        {generated.copy}
      </pre>
    </div>
  </div>
)}

