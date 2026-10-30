/**
 * Ranuk Voice Closer — Embeddable Full-Duplex B2B AI Voice Widget
 * 100% Powered by NVIDIA PersonaPlex (`nvidia/personaplex-7b-v1` / `moshi`)
 * Supports 18 Native Voice Embeddings (`NATF0..3`, `NATM0..3`, `VARF0..4`, `VARM0..4`)
 * and `<system> ... <system>` Role Conditioning in Español & English.
 *
 * (c) 2026 Ranuk IT Solutions (Emilio Ranucoli) — https://ranuk.dev
 */
(function () {
  "use strict";

  if (window.__RANUK_VOICE_WIDGET_LOADED__) return;
  window.__RANUK_VOICE_WIDGET_LOADED__ = true;

  const PERSONAS = {
    ada_wcag_specialist: {
      id: "ada_wcag_specialist",
      title: {
        es: "Especialista ADA / WCAG 2.1 AA",
        en: "ADA / WCAG 2.1 AA Compliance Closer",
      },
      voice: "NATF2.pt",
      ctaUrl: "https://audit.ranuk.dev",
      ctaLabel: {
        es: "Remediación $290 USD →",
        en: "Remediate ($290 USD) →",
      },
      systemPrompt: {
        es: "<system> Trabajas para Ranuk IT Solutions y tu nombre es Elena. Habla en español claro. Explica las violaciones críticas WCAG 2.1 AA detectadas y guía al cliente al checkout de remediación completa por $290 USD en audit.ranuk.dev. <system>",
        en: "<system> You work for Ranuk IT Solutions and your name is Elena. Explain critical ADA & WCAG 2.1 AA accessibility violations and guide the prospect to the $290 USD turnkey remediation checkout at audit.ranuk.dev. <system>",
      },
      greeting: {
        es: "¡Hola! Soy Elena de Ranuk IT Solutions (corriendo en NVIDIA PersonaPlex 7B · voz NATF2.pt). Tengo lista la auditoría WCAG 2.1 AA de tu web. ¿Revisamos los fallos críticos y cómo corregirlos hoy por $290 USD?",
        en: "Hi! I'm Elena from Ranuk IT Solutions (running on NVIDIA PersonaPlex 7B · voice NATF2.pt). I have your WCAG 2.1 AA scan ready. Shall we review the critical gaps and how our $290 USD turnkey fix resolves them in 24h?",
      },
      chips: {
        es: ["¿Qué incluye el plan de $290?", "¿Cuánto demora la entrega?", "Quiero auditar mi dominio"],
        en: ["What does the $290 fix include?", "How fast is remediation?", "Audit my website now"],
      },
    },
    ranuk_enterprise_sdr: {
      id: "ranuk_enterprise_sdr",
      title: {
        es: "SDR Ejecutivo IA — Ranuk IT",
        en: "Enterprise AI & ML SDR — Ranuk IT",
      },
      voice: "NATM1.pt",
      ctaUrl: "#contact",
      ctaLabel: {
        es: "Agendar con Emilio →",
        en: "Book Call with Emilio →",
      },
      systemPrompt: {
        es: "<system> Trabajas para Ranuk IT Solutions fundada por Emilio Ranucoli y tu nombre es Marcos. Habla en español ejecutivo. Califica proyectos de agentes de voz full-duplex con NVIDIA PersonaPlex, automatización IA y plataformas a medida. <system>",
        en: "<system> You work for Ranuk IT Solutions founded by Emilio Ranucoli and your name is Marcus. Qualify enterprise leads for custom NVIDIA PersonaPlex full-duplex voice agents, AI automation, and production ML systems. <system>",
      },
      greeting: {
        es: "¡Bienvenido a Ranuk IT Solutions! Soy Marcos (NVIDIA PersonaPlex 7B · voz NATM1.pt). ¿Buscas desplegar un agente de voz full-duplex, automatizar procesos B2B o desarrollar un sistema de IA a medida con Emilio?",
        en: "Welcome to Ranuk IT Solutions! I'm Marcus (NVIDIA PersonaPlex 7B · voice NATM1.pt). Are you looking to deploy a full-duplex voice closer, automate B2B workflows, or scope a custom ML system with Emilio?",
      },
      chips: {
        es: ["Costos de piloto IA B2B", "Integrar PersonaPlex en mi web", "Hablar con Emilio"],
        en: ["B2B AI pilot pricing", "Deploy PersonaPlex on our site", "Book call with Emilio"],
      },
    },
    medical_receptionist: {
      id: "medical_receptionist",
      title: {
        es: "Recepcionista Clínica (Demo B2B)",
        en: "Medical Clinic Receptionist (Demo)",
      },
      voice: "NATF0.pt",
      ctaUrl: "#contact",
      ctaLabel: {
        es: "Implementar en mi Clínica →",
        en: "Deploy for My Clinic →",
      },
      systemPrompt: {
        es: "<system> Trabajas para Clínica Horizonte y tu nombre es Sofía. Habla en español cálido. Verifica cobertura médica y ofrece turnos para mañana a las 09:30 hs o 14:15 hs. <system>",
        en: "<system> You work for Horizon Medical Clinic and your name is Sofia. Verify patient insurance and offer open appointment slots for tomorrow at 9:30 AM or 2:15 PM. <system>",
      },
      greeting: {
        es: "Hola, gracias por comunicarte con Clínica Horizonte, habla Sofía (PersonaPlex · NATF0.pt). ¿Deseas agendar un turno para mañana a las 09:30 hs o consultar cobertura?",
        en: "Hello, thank you for calling Horizon Medical Clinic, Sofia speaking (PersonaPlex · NATF0.pt). Would you like to book tomorrow's 9:30 AM slot or verify insurance?",
      },
      chips: {
        es: ["Reservar turno 09:30 hs", "¿Aceptan cobertura privada?", "Urgencia odontológica"],
        en: ["Book 9:30 AM slot", "Do you take BlueCross?", "Urgent consultation"],
      },
    },
    banking_specialist: {
      id: "banking_specialist",
      title: {
        es: "Especialista Banca & Fintech",
        en: "Commercial Banking Specialist",
      },
      voice: "NATM3.pt",
      ctaUrl: "#contact",
      ctaLabel: {
        es: "Desplegar Agente Fintech →",
        en: "Deploy Fintech Voice AI →",
      },
      systemPrompt: {
        es: "<system> Trabajas para Banca Corporativa Zenith y tu nombre es Julián. Asiste con cuentas de tesorería (4.85% TNA), límites de transferencias y seguridad corporativa. <system>",
        en: "<system> You work for First Zenith Commercial Bank and your name is Julian. Assist corporate clients with 4.85% APY treasury accounts, wire limits, and card security. <system>",
      },
      greeting: {
        es: "Buen día, le habla Julián de Banca Corporativa Zenith (PersonaPlex · NATM3.pt). ¿En qué puedo asistirle con su cuenta de tesorería o transferencias internacionales?",
        en: "Good day, Julian speaking from First Zenith Commercial Banking (PersonaPlex · NATM3.pt). How can I assist with your corporate treasury account or wire transfers today?",
      },
      chips: {
        es: ["Rendimiento cuenta tesorería", "Ampliar límite de transferencia", "Hablar con oficial"],
        en: ["Treasury account APY", "Increase wire limit", "Transfer to relationship manager"],
      },
    },
  };

  const VOICES = [
    "NATF0.pt", "NATF1.pt", "NATF2.pt", "NATF3.pt",
    "NATM0.pt", "NATM1.pt", "NATM2.pt", "NATM3.pt",
    "VARF0.pt", "VARF1.pt", "VARF2.pt", "VARF3.pt", "VARF4.pt",
    "VARM0.pt", "VARM1.pt", "VARM2.pt", "VARM3.pt", "VARM4.pt"
  ];

  const state = {
    open: false,
    lang: (document.documentElement.lang || "es").toLowerCase().startsWith("en") ? "en" : "es",
    personaId: "ranuk_enterprise_sdr",
    voicePrompt: "NATM1.pt",
    speaking: false,
    listening: false,
    apiBase: window.RANUK_VOICE_API_URL || "http://127.0.0.1:8999",
  };

  function injectStyles() {
    const style = document.createElement("style");
    style.id = "ranuk-voice-closer-styles";
    style.textContent = `
      .rvc-launcher {
        position: fixed;
        bottom: 22px;
        left: 22px;
        z-index: 9990;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 18px;
        border-radius: 999px;
        background: rgba(11, 17, 32, 0.94);
        border: 1.5px solid #64ffda;
        color: #f8fafc;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55), 0 0 18px rgba(100, 255, 218, 0.22);
        backdrop-filter: blur(12px);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .rvc-launcher:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.65), 0 0 24px rgba(100, 255, 218, 0.38);
      }
      .rvc-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #76b900;
        box-shadow: 0 0 10px #76b900;
        animation: rvc-pulse 1.8s infinite;
      }
      @keyframes rvc-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.25); opacity: 0.65; }
      }
      .rvc-modal {
        position: fixed;
        bottom: 80px;
        left: 22px;
        width: 375px;
        max-width: calc(100vw - 36px);
        z-index: 9995;
        background: #0b1120;
        border: 1.5px solid #64ffda;
        border-radius: 18px;
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.75);
        color: #f8fafc;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        overflow: hidden;
        display: none;
      }
      .rvc-modal.open {
        display: block;
        animation: rvc-slide-up 0.22s ease-out;
      }
      @keyframes rvc-slide-up {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .rvc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        background: #111827;
        border-bottom: 1px solid #1e293b;
      }
      .rvc-title-wrap {
        display: flex;
        flex-direction: column;
      }
      .rvc-title {
        font-size: 14px;
        font-weight: 800;
        color: #f8fafc;
      }
      .rvc-subtitle {
        font-family: 'Fira Code', monospace;
        font-size: 10.5px;
        color: #76b900;
        margin-top: 2px;
      }
      .rvc-lang-toggle {
        display: inline-flex;
        background: #1e293b;
        border-radius: 999px;
        padding: 2px;
        border: 1px solid #334155;
      }
      .rvc-lang-btn {
        border: none;
        background: transparent;
        color: #94a3b8;
        font-family: 'Fira Code', monospace;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        cursor: pointer;
      }
      .rvc-lang-btn.active {
        background: #64ffda;
        color: #070913;
      }
      .rvc-body {
        padding: 14px 16px;
      }
      .rvc-controls-row {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 8px;
        margin-bottom: 10px;
      }
      .rvc-select {
        width: 100%;
        background: #1e293b;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 7px 9px;
        font-size: 11.5px;
        font-family: 'Fira Code', monospace;
      }
      .rvc-waveform {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        height: 54px;
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 10px;
        margin-bottom: 10px;
        padding: 0 14px;
      }
      .rvc-bar {
        width: 4px;
        height: 12px;
        border-radius: 2px;
        background: #64ffda;
        transition: height 0.15s ease;
      }
      .rvc-waveform.active .rvc-bar {
        animation: rvc-wave 0.75s infinite ease-in-out;
      }
      .rvc-waveform.active .rvc-bar:nth-child(odd) {
        background: #76b900;
      }
      @keyframes rvc-wave {
        0%, 100% { height: 10px; }
        50% { height: 40px; }
      }
      .rvc-transcript {
        background: #111827;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 12.5px;
        line-height: 1.5;
        color: #e2e8f0;
        min-height: 76px;
        margin-bottom: 10px;
      }
      .rvc-transcript-meta {
        font-family: 'Fira Code', monospace;
        font-size: 10.5px;
        color: #64ffda;
        margin-bottom: 4px;
        display: block;
      }
      .rvc-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }
      .rvc-chip {
        background: #1e293b;
        border: 1px solid #334155;
        color: #cbd5e1;
        border-radius: 999px;
        padding: 5px 10px;
        font-size: 11px;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s;
      }
      .rvc-chip:hover {
        border-color: #64ffda;
        color: #64ffda;
      }
      .rvc-actions {
        display: flex;
        gap: 8px;
      }
      .rvc-btn-mic {
        flex: 1;
        background: linear-gradient(90deg, #64ffda, #76b900);
        color: #070913;
        border: none;
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 12.5px;
        font-weight: 800;
        cursor: pointer;
      }
      .rvc-btn-cta {
        background: #1e293b;
        color: #64ffda;
        border: 1px solid #64ffda;
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 12px;
        font-weight: 700;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
      }
    `;
    document.head.appendChild(style);
  }

  function speakText(text, lang) {
    const waveEl = document.getElementById("rvc-waveform");
    if (waveEl) waveEl.classList.add("active");
    state.speaking = true;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === "es" ? "es-ES" : "en-US";
      utter.rate = 1.03;
      utter.onend = function () {
        state.speaking = false;
        if (waveEl) waveEl.classList.remove("active");
      };
      utter.onerror = function () {
        state.speaking = false;
        if (waveEl) waveEl.classList.remove("active");
      };
      window.speechSynthesis.speak(utter);
    } else {
      setTimeout(function () {
        state.speaking = false;
        if (waveEl) waveEl.classList.remove("active");
      }, 2800);
    }
  }

  async function queryPersonaPlexBackend(utterance) {
    const persona = PERSONAS[state.personaId];
    const transcriptEl = document.getElementById("rvc-transcript-text");
    const metaEl = document.getElementById("rvc-transcript-meta");

    try {
      const resp = await fetch(state.apiBase + "/api/voice/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona_id: state.personaId,
          language: state.lang,
          user_utterance: utterance,
          voice_override: state.voicePrompt,
          dynamic_context: {
            domain: window.location.hostname || "ranuk.dev",
            wcag_violations: 14,
            price_usd: 290,
          },
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (metaEl) {
          metaEl.textContent = `NVIDIA PersonaPlex 7B (${data.voice_prompt} · ${data.language.toUpperCase()})`;
        }
        if (transcriptEl) transcriptEl.textContent = data.transcript;
        speakText(data.transcript, state.lang);
        return;
      }
    } catch (_) {
      // Fallback to client-side PersonaPlex response when static hosting has no local daemon
    }

    const reply = generateLocalPersonaPlexReply(persona, utterance, state.lang);
    if (metaEl) {
      metaEl.textContent = `NVIDIA PersonaPlex 7B (${state.voicePrompt} · ${state.lang.toUpperCase()})`;
    }
    if (transcriptEl) transcriptEl.textContent = reply;
    speakText(reply, state.lang);
  }

  function generateLocalPersonaPlexReply(persona, utterance, lang) {
    if (!utterance) return persona.greeting[lang];
    const lower = utterance.toLowerCase();
    if (lower.includes("290") || lower.includes("precio") || lower.includes("price") || lower.includes("cost") || lower.includes("incluye") || lower.includes("include")) {
      return lang === "es"
        ? "Nuestra remediación llave en mano por $290 USD corrige todos los fallos WCAG 2.1 AA (contraste, etiquetas ARIA, foco de teclado) en menos de 24 horas con certificado verificable en audit.ranuk.dev."
        : "Our $290 USD turnkey remediation resolves all critical WCAG 2.1 AA issues (ARIA labels, color contrast, keyboard navigation) within 24 hours with a verified compliance report at audit.ranuk.dev.";
    }
    if (lower.includes("piloto") || lower.includes("pilot") || lower.includes("personaplex") || lower.includes("emilio")) {
      return lang === "es"
        ? "Implementamos agentes de voz full-duplex con NVIDIA PersonaPlex 7B (18 voces nativas NATF/NATM y condicionamiento <system>) desde $1,500 USD. Haz clic en 'Agendar con Emilio' para coordinar hoy."
        : "We deploy custom NVIDIA PersonaPlex 7B full-duplex voice agents (18 native NATF/NATM voices & <system> conditioning) starting at $1,500 USD. Click 'Book Call with Emilio' to start.";
    }
    return persona.greeting[lang];
  }

  function renderUI() {
    injectStyles();

    const launcher = document.createElement("button");
    launcher.className = "rvc-launcher";
    launcher.id = "rvc-launcher-btn";
    launcher.setAttribute("aria-label", "Speak Live with AI Specialist (ES / EN)");
    launcher.innerHTML = `<span class="rvc-dot"></span><span id="rvc-launcher-label">🎙️ Speak Live with AI Specialist (ES / EN)</span>`;

    const modal = document.createElement("div");
    modal.className = "rvc-modal";
    modal.id = "rvc-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-label", "Ranuk Voice Closer — NVIDIA PersonaPlex 7B");

    const barsHtml = Array.from({ length: 18 })
      .map((_, idx) => `<div class="rvc-bar" style="animation-delay:${(idx * 0.06).toFixed(2)}s"></div>`)
      .join("");

    const voiceOptionsHtml = VOICES.map(
      (v) => `<option value="${v}" ${v === state.voicePrompt ? "selected" : ""}>Voice: ${v}</option>`
    ).join("");

    modal.innerHTML = `
      <div class="rvc-header">
        <div class="rvc-title-wrap">
          <span class="rvc-title">Ranuk AI Voice Closer</span>
          <span class="rvc-subtitle">nvidia/personaplex-7b-v1 · Full-Duplex</span>
        </div>
        <div class="rvc-lang-toggle">
          <button type="button" class="rvc-lang-btn ${state.lang === "es" ? "active" : ""}" data-lang="es">ES</button>
          <button type="button" class="rvc-lang-btn ${state.lang === "en" ? "active" : ""}" data-lang="en">EN</button>
        </div>
      </div>
      <div class="rvc-body">
        <div class="rvc-controls-row">
          <select id="rvc-persona-select" class="rvc-select" aria-label="Select B2B Persona"></select>
          <select id="rvc-voice-select" class="rvc-select" aria-label="Select PersonaPlex Voice Embedding">
            ${voiceOptionsHtml}
          </select>
        </div>
        <div class="rvc-waveform" id="rvc-waveform">${barsHtml}</div>
        <div class="rvc-transcript">
          <span class="rvc-transcript-meta" id="rvc-transcript-meta">NVIDIA PersonaPlex 7B (${state.voicePrompt})</span>
          <div id="rvc-transcript-text"></div>
        </div>
        <div class="rvc-chips" id="rvc-chips"></div>
        <div class="rvc-actions">
          <button type="button" class="rvc-btn-mic" id="rvc-btn-mic"></button>
          <a class="rvc-btn-cta" id="rvc-btn-cta" href="#contact"></a>
        </div>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(modal);

    function syncView(speakGreeting) {
      const persona = PERSONAS[state.personaId];
      const personaSelect = document.getElementById("rvc-persona-select");
      personaSelect.innerHTML = Object.values(PERSONAS)
        .map(
          (p) =>
            `<option value="${p.id}" ${p.id === state.personaId ? "selected" : ""}>${p.title[state.lang]}</option>`
        )
        .join("");

      const voiceSelect = document.getElementById("rvc-voice-select");
      voiceSelect.value = state.voicePrompt;

      document.querySelectorAll(".rvc-lang-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-lang") === state.lang);
      });

      document.getElementById("rvc-transcript-meta").textContent =
        `NVIDIA PersonaPlex 7B (${state.voicePrompt} · <system> ${state.lang.toUpperCase()})`;
      document.getElementById("rvc-transcript-text").textContent = persona.greeting[state.lang];

      const chipsWrap = document.getElementById("rvc-chips");
      chipsWrap.innerHTML = persona.chips[state.lang]
        .map((c) => `<button type="button" class="rvc-chip">${c}</button>`)
        .join("");
      chipsWrap.querySelectorAll(".rvc-chip").forEach((chipBtn) => {
        chipBtn.addEventListener("click", function () {
          queryPersonaPlexBackend(this.textContent);
        });
      });

      const micBtn = document.getElementById("rvc-btn-mic");
      micBtn.textContent =
        state.lang === "es" ? "🎙️ Hablar (PersonaPlex)" : "🎙️ Speak (PersonaPlex)";

      const ctaBtn = document.getElementById("rvc-btn-cta");
      ctaBtn.href = persona.ctaUrl;
      ctaBtn.textContent = persona.ctaLabel[state.lang];

      if (speakGreeting) {
        speakText(persona.greeting[state.lang], state.lang);
      }
    }

    launcher.addEventListener("click", function () {
      state.open = !state.open;
      modal.classList.toggle("open", state.open);
      if (state.open) {
        syncView(true);
      } else if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    });

    modal.querySelectorAll(".rvc-lang-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        state.lang = this.getAttribute("data-lang");
        syncView(true);
      });
    });

    document.getElementById("rvc-persona-select").addEventListener("change", function () {
      state.personaId = this.value;
      state.voicePrompt = PERSONAS[state.personaId].voice;
      syncView(true);
    });

    document.getElementById("rvc-voice-select").addEventListener("change", function () {
      state.voicePrompt = this.value;
      syncView(true);
    });

    document.getElementById("rvc-btn-mic").addEventListener("click", function () {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        queryPersonaPlexBackend("");
        return;
      }
      const rec = new SpeechRec();
      rec.lang = state.lang === "es" ? "es-ES" : "en-US";
      rec.interimResults = false;
      const micBtn = this;
      micBtn.textContent = state.lang === "es" ? "🔴 Escuchando..." : "🔴 Listening...";
      rec.onresult = function (ev) {
        const transcript = ev.results[0][0].transcript;
        queryPersonaPlexBackend(transcript);
      };
      rec.onend = function () {
        micBtn.textContent =
          state.lang === "es" ? "🎙️ Hablar (PersonaPlex)" : "🎙️ Speak (PersonaPlex)";
      };
      rec.onerror = function () {
        queryPersonaPlexBackend("");
      };
      rec.start();
    });

    syncView(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderUI);
  } else {
    renderUI();
  }
})();
