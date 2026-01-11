import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Settings,
  Calendar,
  BarChart3,
  Send,
  Instagram,
  Twitter,
  Linkedin,
  Edit2,
  X,
  Trash2,
  TrendingUp,
  Target,
  Grid3x3,
  Film,
  MessageSquare,
} from "lucide-react";

import { storage } from "./lib/storage";

const DEFAULT_BRAND = {
  logoText: "XaviXica",
  logoImage: null,
  primaryColor: "#7C3AED",
  secondaryColor: "#10B981",
  accentColor: "#F59E0B",
  backgroundColor: "#1F2937",
};

const DEFAULT_PLATFORMS = {
  instagram: {
    name: "Instagram",
    iconName: "Instagram",
    active: true,
    audience: "Millennials e Gen Z interessados em investimentos",
    language: "Descontraído, visual, use emojis 💎",
    tone: "Inspiracional e educativo",
    formats: {
      feed: { name: "Feed Post", ratio: "1:1", enabled: true },
      stories: { name: "Stories", ratio: "9:16", enabled: true },
      reels: { name: "Reels", ratio: "9:16", enabled: true },
      carrossel: { name: "Carrossel", ratio: "1:1", enabled: true },
    },
    hashtags: 15,
    maxChars: 2200,
  },
  twitter: {
    name: "Twitter/X",
    iconName: "Twitter",
    active: true,
    audience: "Traders, entusiastas de cripto, early adopters",
    language: "Direto, use threads para tópicos longos",
    tone: "Provocativo e atual",
    formats: {
      tweet: { name: "Tweet", ratio: "16:9", enabled: true },
      thread: { name: "Thread", ratio: "16:9", enabled: true },
    },
    hashtags: 3,
    maxChars: 280,
  },
  linkedin: {
    name: "LinkedIn",
    iconName: "Linkedin",
    active: true,
    audience: "Profissionais, investidores, CTOs, CFOs",
    language: "Formal, dados e insights",
    tone: "Profissional e analítico",
    formats: {
      post: { name: "Post", ratio: "1.91:1", enabled: true },
      article: { name: "Artigo", ratio: "1.91:1", enabled: true },
    },
    hashtags: 5,
    maxChars: 3000,
  },
};

const iconMap = {
  Instagram,
  Twitter,
  Linkedin,
};

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export default function CryptoContentAgent() {
  const [activeTab, setActiveTab] = useState("criar");
  const [topic, setTopic] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [selectedFormat, setSelectedFormat] = useState("feed");
  const [loading] = useState(false);

  const [brandConfig, setBrandConfig] = useState(DEFAULT_BRAND);
  const [platforms, setPlatforms] = useState(DEFAULT_PLATFORMS);

  const [editingPlatform, setEditingPlatform] = useState(null);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [metrics, setMetrics] = useState([]);

  // Load once
  useEffect(() => {
    (async () => {
      const brand = await storage.get("brand-config");
      const plats = await storage.get("platforms-config");
      const posts = await storage.get("scheduled-posts");
      const mets = await storage.get("metrics-data");

      if (brand?.value) setBrandConfig(safeParse(brand.value, DEFAULT_BRAND));
      if (plats?.value) {
        const parsed = safeParse(plats.value, DEFAULT_PLATFORMS);
        // guarantee iconName
        Object.keys(parsed).forEach((k) => {
          if (!parsed[k]?.iconName) {
            parsed[k].iconName =
              k === "instagram" ? "Instagram" : k === "twitter" ? "Twitter" : "Linkedin";
          }
        });
        setPlatforms(parsed);
      }
      if (posts?.value) setScheduledPosts(safeParse(posts.value, []));
      if (mets?.value) setMetrics(safeParse(mets.value, []));
    })();
  }, []);

  // Save on change
  useEffect(() => {
    storage.set("brand-config", JSON.stringify(brandConfig));
  }, [brandConfig]);

  useEffect(() => {
    storage.set("platforms-config", JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    storage.set("scheduled-posts", JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  useEffect(() => {
    storage.set("metrics-data", JSON.stringify(metrics));
  }, [metrics]);

  const enabledFormats = useMemo(() => {
    const p = platforms[selectedPlatform];
    if (!p) return [];
    return Object.entries(p.formats).filter(([, f]) => f.enabled);
  }, [platforms, selectedPlatform]);

  // keep selectedFormat valid
  useEffect(() => {
    const p = platforms[selectedPlatform];
    if (!p) return;
    const enabled = Object.entries(p.formats).filter(([, f]) => f.enabled);
    if (enabled.length === 0) return;
    const exists = enabled.some(([k]) => k === selectedFormat);
    if (!exists) setSelectedFormat(enabled[0][0]);
  }, [platforms, selectedPlatform, selectedFormat]);

  const schedulePost = () => {
    // Stub content for now (no AI yet)
    const content = {
      title: topic || "Novo post",
      copy: `Rascunho: ${topic || "tema do post"}`,
      hashtags: ["xavixica", "conteudo", "ia"],
      designElements: {
        headline: topic || "Ideia de headline",
        subheadline: "Subheadline",
        visualConcept: "Conceito visual (placeholder)",
        layout: "Layout (placeholder)",
      },
      cta: "Comenta aqui 👇",
      bestTime: "18h-20h",
      expectedMetrics: { engagement: "—", reach: "—" },
    };

    const newPost = {
      id: Date.now(),
      platform: selectedPlatform,
      format: selectedFormat,
      content,
      scheduledDate: new Date().toISOString(),
      status: "agendado",
      topic: topic || "Sem título",
    };

    setScheduledPosts((prev) => [newPost, ...prev]);
    alert("Post agendado (stub) ✅");
  };

  const BrandLogo = () => {
    if (brandConfig.logoImage) {
