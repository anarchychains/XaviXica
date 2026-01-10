# XaviXica — AI Content Agent (React)

Um app em React para criação de conteúdo com IA, pensado para creators e times de social media.

Ele gera copy + hashtags + direção de design por plataforma/formato, permite salvar configs de marca, agendar posts e acompanhar métricas (manual, por enquanto).

## ✨ O que já faz

- **Gerar conteúdo** por:
  - Plataforma: Instagram, Twitter/X, LinkedIn
  - Formato: feed/stories/reels/carrossel, tweet/thread, post/artigo
- **Prompt inteligente** com contexto de marca + público + tom + limites (chars/hashtags)
- **Preview visual** (mock simples) do criativo
- **Configurações editáveis**
  - Nome/logo (upload)
  - Cores da marca
  - Config de plataformas (público, tom, formatos, limites)
- **Calendário de posts**
  - Salva posts agendados
  - Lista e permite remover
- **Métricas (manual)**
  - Base para evolução futura (integração com APIs)

## 🧱 Stack

- React
- lucide-react (ícones)
- TailwindCSS (estilos)
- Persistência local (localStorage / storage wrapper)
- Integração com IA (Anthropic API)

## 🚀 Como rodar localmente (modo fácil)

### 1) Instalar dependências
```bash
npm install
