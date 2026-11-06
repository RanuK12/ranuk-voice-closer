"""
aiohttp Full-Duplex Server for Ranuk Voice Closer (`ranuk_voice_closer.server`).

Exposes:
- `POST /api/voice/respond`: Conditioning & 24kHz WAV response via NVIDIA PersonaPlex (`nvidia/personaplex-7b-v1`)
- `GET  /api/voice/personas`: Pre-built B2B personas (EN & ES) + all 18 PersonaPlex `.pt` voice embeddings
- `GET  /api/chat`: Native `moshi.server`-compatible WebSocket endpoint (`0x00` handshake, `0x01` audio, `0x02` text)
- `GET  /health`: Health & model telemetry check
- `GET  /widget/ranuk-voice-widget.js`: Embeddable B2B Voice Closer frontend widget
"""

from __future__ import annotations

import base64
import json
from pathlib import Path
from typing import Any, Dict, Optional

from aiohttp import WSMsgType, web

from .engine import (
    MOSHI_WS_AUDIO_FRAME,
    MOSHI_WS_HANDSHAKE,
    MOSHI_WS_TEXT_TOKEN,
    PERSONAPLEX_HF_REPO,
    PersonaPlexConfig,
    PersonaPlexVoiceEngine,
)
from .personas import build_personaplex_text_prompt, list_personas

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

VOICE_ENGINE_KEY = web.AppKey("voice_engine", PersonaPlexVoiceEngine)


@web.middleware
async def cors_middleware(request: web.Request, handler):
    if request.method == "OPTIONS":
        return web.Response(status=204, headers=CORS_HEADERS)
    response = await handler(request)
    for k, v in CORS_HEADERS.items():
        response.headers[k] = v
    return response


async def handle_health(request: web.Request) -> web.Response:
    engine: PersonaPlexVoiceEngine = request.app[VOICE_ENGINE_KEY]
    payload = {
        "status": "ok",
        "service": "ranuk-voice-closer",
        "model": PERSONAPLEX_HF_REPO,
        "architecture": "moshi-full-duplex-s2s",
        "sample_rate_hz": 24000,
        "voices_count": len(engine.list_voices()),
        "supported_languages": ["en", "es"],
    }
    return web.json_response(payload)


async def handle_personas(request: web.Request) -> web.Response:
    engine: PersonaPlexVoiceEngine = request.app[VOICE_ENGINE_KEY]
    payload = {
        "model": PERSONAPLEX_HF_REPO,
        "personas": list_personas(),
        "voices": engine.list_voices(),
    }
    return web.json_response(payload)


async def handle_respond(request: web.Request) -> web.Response:
    engine: PersonaPlexVoiceEngine = request.app[VOICE_ENGINE_KEY]
    try:
        body: Dict[str, Any] = await request.json()
    except Exception:
        body = {}

    persona_id = body.get("persona_id", "ada_wcag_specialist")
    language = body.get("language", "en")
    user_utterance = body.get("user_utterance")
    voice_override = body.get("voice_override")
    dynamic_context = body.get("dynamic_context")
    custom_instructions = body.get("custom_instructions")

    try:
        result = engine.respond(
            persona_id=persona_id,
            language=language,
            user_utterance=user_utterance,
            voice_override=voice_override,
            dynamic_context=dynamic_context,
            custom_instructions=custom_instructions,
        )
        return web.json_response(result.to_dict())
    except (KeyError, ValueError) as exc:
        return web.json_response({"error": str(exc)}, status=400)


async def handle_moshi_ws_chat(request: web.Request) -> web.WebSocketResponse:
    """
    `moshi.server`-compatible binary WebSocket endpoint (`/api/chat`).
    Supports query params: `voice_prompt` (e.g. `NATF2.pt`), `text_prompt` (`<system> ... <system>`),
    or `persona_id` & `lang`.
    """
    engine: PersonaPlexVoiceEngine = request.app[VOICE_ENGINE_KEY]
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    persona_id = request.query.get("persona_id", "ada_wcag_specialist")
    lang = request.query.get("lang", "en")
    voice_prompt = request.query.get("voice_prompt", "NATF2.pt")
    text_prompt = request.query.get("text_prompt") or build_personaplex_text_prompt(
        persona_id=persona_id, language=lang
    )

    # Send 0x00 Moshi handshake frame immediately upon connection
    await ws.send_bytes(engine.encode_moshi_ws_frame(MOSHI_WS_HANDSHAKE, b""))

    async for msg in ws:
        if msg.type == WSMsgType.BINARY:
            frame_type, payload = engine.decode_moshi_ws_frame(msg.data)
            if frame_type == MOSHI_WS_AUDIO_FRAME:
                resp = engine.respond(
                    persona_id=persona_id,
                    language=lang,
                    voice_override=voice_prompt,
                    custom_instructions=text_prompt,
                )
                await ws.send_bytes(
                    engine.encode_moshi_ws_frame(MOSHI_WS_TEXT_TOKEN, resp.transcript.encode("utf-8"))
                )
                wav_bytes = base64.b64decode(resp.audio_wav_base64)
                await ws.send_bytes(
                    engine.encode_moshi_ws_frame(MOSHI_WS_AUDIO_FRAME, wav_bytes)
                )
        elif msg.type == WSMsgType.TEXT:
            try:
                data = json.loads(msg.data)
            except Exception:
                data = {"user_utterance": msg.data}
            resp = engine.respond(
                persona_id=data.get("persona_id", persona_id),
                language=data.get("language", lang),
                user_utterance=data.get("user_utterance"),
                voice_override=data.get("voice_override", voice_prompt),
                dynamic_context=data.get("dynamic_context"),
            )
            await ws.send_json(resp.to_dict())

    return ws


async def handle_widget_js(request: web.Request) -> web.Response:
    widget_path = Path(__file__).resolve().parent.parent / "widget" / "ranuk-voice-widget.js"
    if not widget_path.exists():
        return web.Response(text="// Widget file not found", status=404, content_type="application/javascript")
    return web.Response(
        text=widget_path.read_text(encoding="utf-8"),
        content_type="application/javascript",
    )


def create_app(config: Optional[PersonaPlexConfig] = None) -> web.Application:
    """Create and configure the `aiohttp.web.Application` instance."""
    app = web.Application(middlewares=[cors_middleware])
    app[VOICE_ENGINE_KEY] = PersonaPlexVoiceEngine(config=config)
    app.router.add_get("/health", handle_health)
    app.router.add_get("/api/voice/personas", handle_personas)
    app.router.add_post("/api/voice/respond", handle_respond)
    app.router.add_get("/api/chat", handle_moshi_ws_chat)
    app.router.add_get("/widget/ranuk-voice-widget.js", handle_widget_js)
    return app


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Ranuk Voice Closer — NVIDIA PersonaPlex 7B Server")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host")
    parser.add_argument("--port", type=int, default=8999, help="Bind port")
    args = parser.parse_args()

    app = create_app()
    web.run_app(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
