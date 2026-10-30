"""
Ranuk Voice Closer (`ranuk_voice_closer`)
Enterprise Full-Duplex B2B AI Voice Receptionist & Inbound Sales Closer
100% Powered by NVIDIA PersonaPlex (`nvidia/personaplex-7b-v1` / `moshi`).
"""

from .engine import (
    PERSONAPLEX_HF_REPO,
    PERSONAPLEX_VOICES,
    PersonaPlexConfig,
    PersonaPlexVoiceEngine,
    VoiceResponse,
)
from .personas import (
    B2B_PERSONAS,
    PersonaDefinition,
    build_personaplex_text_prompt,
    get_persona,
    list_personas,
)

__version__ = "0.1.0"
__all__ = [
    "PERSONAPLEX_HF_REPO",
    "PERSONAPLEX_VOICES",
    "PersonaPlexConfig",
    "PersonaPlexVoiceEngine",
    "VoiceResponse",
    "B2B_PERSONAS",
    "PersonaDefinition",
    "build_personaplex_text_prompt",
    "get_persona",
    "list_personas",
]
