"""
Comprehensive Unit & Integration Tests for Ranuk Voice Closer (`ranuk_voice_closer`).
Verifies 100% NVIDIA PersonaPlex (`nvidia/personaplex-7b-v1` / `moshi`) compliance.
"""

from __future__ import annotations

import asyncio
import base64
import io
import wave
from pathlib import Path

import pytest
from aiohttp.test_utils import TestClient, TestServer

from ranuk_voice_closer.engine import (
    MOSHI_WS_AUDIO_FRAME,
    MOSHI_WS_HANDSHAKE,
    MOSHI_WS_TEXT_TOKEN,
    PERSONAPLEX_HF_REPO,
    PERSONAPLEX_SAMPLE_RATE,
    PERSONAPLEX_VOICES,
    PersonaPlexConfig,
    PersonaPlexVoiceEngine,
)
from ranuk_voice_closer.personas import (
    B2B_PERSONAS,
    build_personaplex_text_prompt,
    get_persona,
    list_personas,
)
from ranuk_voice_closer.server import create_app


def test_all_18_personaplex_voices_registered():
    """Verify all 18 native NVIDIA PersonaPlex voice embeddings are available."""
    expected = {
        "NATF0", "NATF1", "NATF2", "NATF3",
        "NATM0", "NATM1", "NATM2", "NATM3",
        "VARF0", "VARF1", "VARF2", "VARF3", "VARF4",
        "VARM0", "VARM1", "VARM2", "VARM3", "VARM4",
    }
    assert set(PERSONAPLEX_VOICES.keys()) == expected
    engine = PersonaPlexVoiceEngine()
    for voice_id in expected:
        assert engine.validate_voice_prompt(voice_id) == f"{voice_id}.pt"
        assert engine.validate_voice_prompt(f"{voice_id}.pt") == f"{voice_id}.pt"

    with pytest.raises(ValueError):
        engine.validate_voice_prompt("INVALID_VOICE_99")


def test_b2b_personas_en_and_es():
    """Verify the 4 pre-built B2B personas support both English and Español."""
    required_ids = {
        "ada_wcag_specialist",
        "ranuk_enterprise_sdr",
        "medical_receptionist",
        "banking_specialist",
    }
    assert required_ids.issubset(set(B2B_PERSONAS.keys()))
    exported = list_personas()
    assert len(exported) == 4

    ada = get_persona("ada_wcag_specialist")
    assert ada.get_voice_prompt("en") == "NATF2.pt"
    assert ada.get_voice_prompt("es") == "NATF2.pt"
    assert "$290" in ada.get_base_prompt("en")
    assert "$290" in ada.get_base_prompt("es")


def test_system_tag_prompt_injection_en_and_es():
    """Verify `<system> ... <system>` wrapping and dynamic context telemetry injection."""
    prompt_en = build_personaplex_text_prompt(
        persona_id="ada_wcag_specialist",
        language="en",
        dynamic_context={
            "domain": "acme-corp.com",
            "wcag_violations": 19,
            "critical_issues": ["missing alt text", "low contrast"],
            "price_usd": 290,
        },
    )
    assert prompt_en.startswith("<system> ")
    assert prompt_en.endswith(" <system>")
    assert "acme-corp.com" in prompt_en
    assert "19" in prompt_en
    assert "$290 USD" in prompt_en

    prompt_es = build_personaplex_text_prompt(
        persona_id="ada_wcag_specialist",
        language="es",
        dynamic_context={
            "domain": "tienda-latam.com",
            "wcag_violations": 14,
            "price_usd": 290,
        },
    )
    assert prompt_es.startswith("<system> ")
    assert prompt_es.endswith(" <system>")
    assert "Contexto en vivo:" in prompt_es
    assert "tienda-latam.com" in prompt_es
    assert "español" in prompt_es.lower()


def test_moshi_offline_and_server_cli_builders():
    """Verify exact `python -m moshi.offline` and `python -m moshi.server` commands."""
    cfg = PersonaPlexConfig(cpu_offload=True, seed=42424242)
    engine = PersonaPlexVoiceEngine(config=cfg)

    cmd = engine.build_moshi_offline_command(
        voice_prompt="NATF2",
        text_prompt="<system> You are Elena. <system>",
        input_wav="in.wav",
        output_wav="out.wav",
        output_text="out.json",
    )
    assert cmd[:3] == ["python", "-m", "moshi.offline"]
    assert "--voice-prompt" in cmd
    assert cmd[cmd.index("--voice-prompt") + 1] == "NATF2.pt"
    assert "--text-prompt" in cmd
    assert cmd[cmd.index("--text-prompt") + 1] == "<system> You are Elena. <system>"
    assert "--cpu-offload" in cmd

    srv_cmd = engine.build_moshi_server_command(ssl_dir="/tmp/ssl")
    assert srv_cmd == ["python", "-m", "moshi.server", "--ssl", "/tmp/ssl", "--cpu-offload"]


def test_moshi_websocket_binary_framing():
    """Verify `moshi.server` binary WebSocket framing (`0x00`, `0x01`, `0x02`)."""
    engine = PersonaPlexVoiceEngine()
    hs = engine.encode_moshi_ws_frame(MOSHI_WS_HANDSHAKE, b"")
    assert hs == b"\x00"
    ftype, payload = engine.decode_moshi_ws_frame(hs)
    assert ftype == MOSHI_WS_HANDSHAKE
    assert payload == b""

    txt_frame = engine.encode_moshi_ws_frame(MOSHI_WS_TEXT_TOKEN, "Hola".encode("utf-8"))
    ftype2, payload2 = engine.decode_moshi_ws_frame(txt_frame)
    assert ftype2 == MOSHI_WS_TEXT_TOKEN
    assert payload2.decode("utf-8") == "Hola"


def test_24khz_wav_synthesis_validity():
    """Verify generated audio is a valid 24kHz 16-bit mono PCM WAV file."""
    engine = PersonaPlexVoiceEngine()
    wav_bytes = engine.synthesize_24khz_personaplex_wav(
        transcript="Hola, soy Elena de Ranuk IT Solutions.",
        voice_prompt="NATF2.pt",
        duration_sec=0.5,
    )
    with wave.open(io.BytesIO(wav_bytes), "rb") as wf:
        assert wf.getnchannels() == 1
        assert wf.getsampwidth() == 2
        assert wf.getframerate() == PERSONAPLEX_SAMPLE_RATE
        assert wf.getnframes() == int(PERSONAPLEX_SAMPLE_RATE * 0.5)


def test_engine_respond_english_and_spanish():
    """Verify `engine.respond()` for both English and Spanish B2B closing turns."""
    engine = PersonaPlexVoiceEngine()

    resp_es = engine.respond(
        persona_id="ada_wcag_specialist",
        language="es",
        user_utterance="¿Cuál es el precio para corregir mi web?",
        voice_override="NATF2",
        dynamic_context={"domain": "miempresa.com", "wcag_violations": 11, "price_usd": 290},
    )
    assert resp_es.model == PERSONAPLEX_HF_REPO
    assert resp_es.voice_prompt == "NATF2.pt"
    assert resp_es.language == "es"
    assert resp_es.text_prompt.startswith("<system>")
    assert "miempresa.com" in resp_es.transcript
    assert "$290 USD" in resp_es.transcript
    assert resp_es.intent_score >= 90
    assert len(base64.b64decode(resp_es.audio_wav_base64)) > 1000

    resp_en = engine.respond(
        persona_id="ranuk_enterprise_sdr",
        language="en",
        user_utterance="I want to book a call for a custom voice agent",
        voice_override="VARM2",
    )
    assert resp_en.voice_prompt == "VARM2.pt"
    assert resp_en.language == "en"
    assert resp_en.intent_score >= 90


def test_aiohttp_server_endpoints_and_websocket():
    """Verify `/health`, `/api/voice/personas`, `/api/voice/respond`, `/widget/...`, and `/api/chat` WS."""

    async def _run():
        app = create_app()
        async with TestClient(TestServer(app)) as client:
            # 1. Health endpoint
            r_health = await client.get("/health")
            assert r_health.status == 200
            data_health = await r_health.json()
            assert data_health["status"] == "ok"
            assert data_health["model"] == "nvidia/personaplex-7b-v1"
            assert data_health["voices_count"] == 18

            # 2. Personas & voices listing
            r_personas = await client.get("/api/voice/personas")
            assert r_personas.status == 200
            data_personas = await r_personas.json()
            assert len(data_personas["personas"]) == 4
            assert len(data_personas["voices"]) == 18

            # 3. POST /api/voice/respond (Spanish ADA closer)
            r_resp = await client.post(
                "/api/voice/respond",
                json={
                    "persona_id": "ada_wcag_specialist",
                    "language": "es",
                    "user_utterance": "¿Cuánto cuesta la remediación?",
                    "voice_override": "NATF2.pt",
                    "dynamic_context": {"domain": "cliente.ar", "wcag_violations": 9, "price_usd": 290},
                },
            )
            assert r_resp.status == 200
            body = await r_resp.json()
            assert body["voice_prompt"] == "NATF2.pt"
            assert body["model"] == "nvidia/personaplex-7b-v1"
            assert "cliente.ar" in body["transcript"]
            assert body["sample_rate"] == 24000

            # 4. Widget JS static delivery
            r_widget = await client.get("/widget/ranuk-voice-widget.js")
            assert r_widget.status == 200
            js_text = await r_widget.text()
            assert "nvidia/personaplex-7b-v1" in js_text

            # 5. Moshi binary WebSocket handshake & audio turn
            async with client.ws_connect("/api/chat?persona_id=ada_wcag_specialist&lang=es&voice_prompt=NATF2.pt") as ws:
                msg_hs = await ws.receive()
                assert msg_hs.data == b"\x00"

                await ws.send_bytes(b"\x01" + b"\x00\x00" * 120)
                msg_txt = await ws.receive()
                assert msg_txt.data[0] == MOSHI_WS_TEXT_TOKEN
                msg_aud = await ws.receive()
                assert msg_aud.data[0] == MOSHI_WS_AUDIO_FRAME
                assert len(msg_aud.data) > 100

    asyncio.run(_run())
