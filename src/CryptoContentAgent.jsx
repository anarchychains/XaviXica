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
      return (
        <img
          src={brandConfig.logoImage}
          alt="Logo"
          style={{ height: 36, objectFit: "contain" }}
        />
      );
    }
    return <div style={{ fontWeight: 800, fontSize: 18 }}>{brandConfig.logoText}</div>;
  };

  const Tabs = [
    { id: "criar", label: "Criar Conteúdo", icon: Sparkles },
    { id: "config", label: "Configurações", icon: Settings },
    { id: "calendario", label: "Calendário", icon: Calendar },
    { id: "metricas", label: "Métricas", icon: BarChart3 },
  ];

  const DesignPreview = ({ content }) => {
    const platformConfig = platforms[selectedPlatform];
    const formatConfig = platformConfig?.formats?.[selectedFormat];
    const PlatformIcon = iconMap[platformConfig?.iconName] || Instagram;

    return (
      <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
        <div
          style={{
            background: "white",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #e7e7ef",
          }}
        >
          <div
            style={{
              position: "relative",
              padding: 28,
              color: "white",
              background: `linear-gradient(135deg, ${brandConfig.primaryColor} 0%, ${brandConfig.secondaryColor} 100%)`,
              aspectRatio: (formatConfig?.ratio || "1:1").replace(":", "/"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxHeight: 540,
            }}
          >
            <div style={{ position: "absolute", top: 16, left: 16, opacity: 0.95 }}>
              <BrandLogo />
            </div>

            <div style={{ textAlign: "center", maxWidth: 720 }}>
              <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.05 }}>
                {content.designElements?.headline}
              </div>
              <div style={{ marginTop: 10, fontSize: 18, opacity: 0.92 }}>
                {content.designElements?.subheadline}
              </div>
            </div>

            <div style={{ position: "absolute", bottom: 12, right: 12, opacity: 0.15 }}>
              <TrendingUp size={110} strokeWidth={1} />
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #e7e7ef",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800 }}>
            <PlatformIcon size={18} />
            <div>
              {platformConfig?.name} — {formatConfig?.name}
            </div>
          </div>

          <div style={{ marginTop: 12, whiteSpace: "pre-wrap", color: "#1f2937" }}>
            {content.copy}
          </div>

          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(content.hashtags || []).map((t, i) => (
              <span key={i} style={{ color: "#2563eb", fontSize: 13 }}>
                #{t}
              </span>
            ))}
          </div>

          {content.cta ? (
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: "1px solid #ececf6",
                fontWeight: 700,
                color: "#6d28d9",
              }}
            >
              CTA: {content.cta}
            </div>
          ) : null}
        </div>

        <button
          onClick={schedulePost}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "0",
            background: "#16a34a",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Calendar size={18} />
          Agendar Post
        </button>
      </div>
    );
  };

  const ConfigTab = () => {
    const handleLogoUpload = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBrandConfig((prev) => ({ ...prev, logoImage: ev.target.result }));
      };
      reader.readAsDataURL(file);
    };

    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div style={cardStyle}>
          <div style={cardTitle}>
            <Settings size={18} /> Configurações da Marca
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <div>
              <div style={labelStyle}>Nome da Marca</div>
              <input
                value={brandConfig.logoText}
                onChange={(e) => setBrandConfig((p) => ({ ...p, logoText: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div>
              <div style={labelStyle}>Logo (Upload)</div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} />
              {brandConfig.logoImage ? (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={brandConfig.logoImage}
                    alt="Logo preview"
                    style={{ height: 70, objectFit: "contain" }}
                  />
                </div>
              ) : null}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {Object.entries(brandConfig)
                .filter(([k]) => k.includes("Color"))
                .map(([key, value]) => (
                  <div key={key}>
                    <div style={labelStyle}>{key.replace("Color", "")}</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <input
                        type="color"
                        value={value}
                        onChange={(e) =>
                          setBrandConfig((p) => ({ ...p, [key]: e.target.value }))
                        }
                        style={{ height: 40, width: 70 }}
                      />
                      <input
                        value={value}
                        onChange={(e) =>
                          setBrandConfig((p) => ({ ...p, [key]: e.target.value }))
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Configurar Plataformas</div>

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {Object.entries(platforms).map(([key, platform]) => {
              const PlatformIcon = iconMap[platform.iconName] || Instagram;
              const isEditing = editingPlatform === key;

              return (
                <div
                  key={key}
                  style={{
                    border: "1px solid #e7e7ef",
                    borderRadius: 12,
                    padding: 12,
                    background: "white",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <PlatformIcon size={18} />
                      <div style={{ fontWeight: 900 }}>{platform.name}</div>
                    </div>

                    <button
                      onClick={() => setEditingPlatform(isEditing ? null : key)}
                      style={iconBtn}
                      title="Editar"
                    >
                      {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                    </button>
                  </div>

                  {isEditing ? (
                    <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                      <div>
                        <div style={labelStyle}>Público-Alvo</div>
                        <textarea
                          value={platform.audience}
                          onChange={(e) =>
                            setPlatforms((p) => ({
                              ...p,
                              [key]: { ...platform, audience: e.target.value },
                            }))
                          }
                          style={{ ...inputStyle, minHeight: 70 }}
                        />
                      </div>

                      <div>
                        <div style={labelStyle}>Linguagem</div>
                        <textarea
                          value={platform.language}
                          onChange={(e) =>
                            setPlatforms((p) => ({
                              ...p,
                              [key]: { ...platform, language: e.target.value },
                            }))
                          }
                          style={{ ...inputStyle, minHeight: 70 }}
                        />
                      </div>

                      <div>
                        <div style={labelStyle}>Tom</div>
                        <input
                          value={platform.tone}
                          onChange={(e) =>
                            setPlatforms((p) => ({
                              ...p,
                              [key]: { ...platform, tone: e.target.value },
                            }))
                          }
                          style={inputStyle}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <div style={labelStyle}>Max caracteres</div>
                          <input
                            type="number"
                            value={platform.maxChars}
                            onChange={(e) =>
                              setPlatforms((p) => ({
                                ...p,
                                [key]: { ...platform, maxChars: Number(e.target.value) || 0 },
                              }))
                            }
                            style={inputStyle}
                          />
                        </div>

                        <div>
                          <div style={labelStyle}>Hashtags</div>
                          <input
                            type="number"
                            value={platform.hashtags}
                            onChange={(e) =>
                              setPlatforms((p) => ({
                                ...p,
                                [key]: { ...platform, hashtags: Number(e.target.value) || 0 },
                              }))
                            }
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <div>
                        <div style={labelStyle}>Formatos disponíveis</div>
                        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                          {Object.entries(platform.formats).map(([fKey, fmt]) => (
                            <label key={fKey} style={{ display: "flex", gap: 10 }}>
                              <input
                                type="checkbox"
                                checked={fmt.enabled}
                                onChange={(e) =>
                                  setPlatforms((p) => ({
                                    ...p,
                                    [key]: {
                                      ...platform,
                                      formats: {
                                        ...platform.formats,
                                        [fKey]: { ...fmt, enabled: e.target.checked },
                                      },
                                    },
                                  }))
                                }
                              />
                              <span>
                                {fmt.name} ({fmt.ratio})
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const CalendarTab = () => {
    return (
      <div style={cardStyle}>
        <div style={cardTitle}>
          <Calendar size={18} /> Posts Agendados ({scheduledPosts.length})
        </div>

        {scheduledPosts.length === 0 ? (
          <div style={{ padding: 18, color: "#6b7280" }}>
            Nenhum post agendado ainda. Crie conteúdo na aba “Criar”.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {scheduledPosts.map((post) => {
              const platform = platforms[post.platform];
              const PlatformIcon = iconMap[platform?.iconName] || Instagram;

              return (
                <div
                  key={post.id}
                  style={{
                    border: "1px solid #e7e7ef",
                    borderRadius: 12,
                    padding: 12,
                    background: "white",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <PlatformIcon size={18} />
                      <div>
                        <div style={{ fontWeight: 900 }}>{post.topic}</div>
                        <div style={{ color: "#6b7280", fontSize: 13 }}>
                          {platform?.name} — {platform?.formats?.[post.format]?.name || post.format}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setScheduledPosts((prev) => prev.filter((p) => p.id !== post.id))
                      }
                      style={{ ...iconBtn, color: "#dc2626" }}
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div style={{ marginTop: 10, color: "#374151", fontSize: 13 }}>
                    {post.content?.copy?.slice(0, 140)}…
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 12, fontSize: 12 }}>
                    <span>📅 {new Date(post.scheduledDate).toLocaleDateString("pt-BR")}</span>
                    <span>🕐 {post.content?.bestTime}</span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "#FEF3C7",
                        color: "#92400E",
                        fontWeight: 800,
                      }}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const MetricsTab = () => {
    const platformMetrics = Object.keys(platforms).map((pKey) => {
      const posts = scheduledPosts.filter((p) => p.platform === pKey);
      const m = metrics.filter((x) => x.platform === pKey);
      const avg = m.length
        ? Math.round(m.reduce((acc, it) => acc + (it.likes || 0) + (it.comments || 0) + (it.shares || 0), 0) / m.length)
        : 0;

      return {
        platform: pKey,
        totalPosts: posts.length,
        avgEngagement: avg,
      };
    });

    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div style={cardStyle}>
          <div style={cardTitle}>
            <BarChart3 size={18} /> Análise de Performance
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginTop: 12,
            }}
          >
            {platformMetrics.map((item) => {
              const PlatformIcon = iconMap[platforms[item.platform]?.iconName] || Instagram;
              return (
                <div
                  key={item.platform}
                  style={{
                    border: "1px solid #e7e7ef",
                    borderRadius: 12,
                    padding: 14,
                    background: "white",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
                    <PlatformIcon size={16} />
                    {platforms[item.platform]?.name}
                  </div>

                  <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Posts</div>
                      <div style={{ fontSize: 22, fontWeight: 900 }}>{item.totalPosts}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Engajamento médio</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#16a34a" }}>
                        {item.avgEngagement}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 14,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
              <Target size={16} /> Insights & Recomendações (stub)
            </div>

            <ul style={{ marginTop: 10, display: "grid", gap: 8, fontSize: 13 }}>
              <li>✓ Instagram Stories tendem a performar bem — priorize testes.</li>
              <li>✓ LinkedIn: conteúdos educativos e dados costumam ter mais retenção.</li>
              <li>! Horários ideais variam por nicho — depois a gente automatiza isso.</li>
            </ul>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Adicionar métrica manual</div>
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            Em breve: integração automática com APIs das redes sociais.
          </div>
        </div>
      </div>
    );
  };

  const CreateTab = () => {
    const p = platforms[selectedPlatform];
    const PlatformIcon = iconMap[p?.iconName] || Instagram;

    const formatIcons = {
      feed: Grid3x3,
      stories: Film,
      reels: Film,
      carrossel: Grid3x3,
      tweet: MessageSquare,
      thread: MessageSquare,
      post: MessageSquare,
      article: MessageSquare,
    };

    const FormatIcon = formatIcons[selectedFormat] || MessageSquare;

    const stubGenerated = {
      title: topic ? `Post: ${topic}` : "Post",
      copy: topic ? `Aqui vai o texto do post sobre: ${topic}` : "Escreve um tema pra gerar o stub.",
      hashtags: ["xavixica", "conteudo", "socialmedia"],
      designElements: {
        headline: topic || "Headline",
        subheadline: "Subheadline",
        visualConcept: "Conceito visual (stub)",
        layout: "Layout (stub)",
      },
      cta: "Salva pra ver depois 💾",
      bestTime: "18h-20h",
      expectedMetrics: { engagement: "—", reach: "—" },
    };

    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div style={cardStyle}>
          <div style={cardTitle}>
            <Sparkles size={18} /> Criar Conteúdo
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={labelStyle}>Sobre o que você quer postar?</div>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Bitcoin bateu nova máxima histórica"
              style={inputStyle}
            />
          </div>

          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <div style={labelStyle}>Plataforma</div>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {Object.entries(platforms).map(([k, plat]) => {
                  const PI = iconMap[plat.iconName] || Instagram;
                  const active = selectedPlatform === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setSelectedPlatform(k)}
                      style={{
                        ...selectBtn,
                        borderColor: active ? "#7C3AED" : "#e7e7ef",
                        background: active ? "#f5f3ff" : "white",
                      }}
                    >
                      <PI size={16} />
                      <span style={{ fontWeight: 800 }}>{plat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Formato</div>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {enabledFormats.map(([k, fmt]) => {
                  const Ico = formatIcons[k] || MessageSquare;
                  const active = selectedFormat === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setSelectedFormat(k)}
                      style={{
                        ...selectBtn,
                        borderColor: active ? "#7C3AED" : "#e7e7ef",
                        background: active ? "#f5f3ff" : "white",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Ico size={16} />
                        <span>
                          <div style={{ fontWeight: 900 }}>{fmt.name}</div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>{fmt.ratio}</div>
                        </span>
                      </span>

                      <span style={{ opacity: 0.6 }}>
                        <FormatIcon size={14} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            disabled={loading || !topic.trim()}
            onClick={() => alert("Stub: geração de IA vem no próximo passo 😄")}
            style={{
              width: "100%",
              marginTop: 14,
              padding: "12px 14px",
              borderRadius: 12,
              border: "0",
              background: "linear-gradient(90deg, #7C3AED 0%, #2563EB 100%)",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
              opacity: !topic.trim() ? 0.5 : 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Send size={16} /> Gerar Conteúdo
          </button>
        </div>

        <DesignPreview content={stubGenerated} />
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", padding: 18, background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 1000, display: "flex", gap: 10, justifyContent: "center", alignItems: "center" }}>
            <Sparkles size={22} />
            Agente de Criação de Conteúdo
          </div>
          <div style={{ color: "#6b7280", marginTop: 6 }}>
            Agente de IA para creators: crie, planeje e escale conteúdo com consistência.
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e7e7ef",
            borderRadius: 14,
            padding: 8,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {Tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid " + (active ? "#7C3AED" : "transparent"),
                  background: active ? "#7C3AED" : "white",
                  color: active ? "white" : "#374151",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === "criar" ? <CreateTab /> : null}
        {activeTab === "config" ? <ConfigTab /> : null}
        {activeTab === "calendario" ? <CalendarTab /> : null}
        {activeTab === "metricas" ? <MetricsTab /> : null}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  border: "1px solid #e7e7ef",
  borderRadius: 14,
  padding: 16,
};

const cardTitle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 1000,
  fontSize: 16,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 900,
  color: "#374151",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #d8d8e6",
  outline: "none",
};

const selectBtn = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e7e7ef",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const iconBtn = {
  border: "0",
  background: "transparent",
  cursor: "pointer",
};
