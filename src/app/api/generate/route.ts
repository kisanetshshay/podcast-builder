
import { NextRequest } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; 

export async function POST(req: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return new Response('Missing ELEVENLABS_API_KEY', { status: 500 });
  }

  const { text, voice_id = DEFAULT_VOICE_ID } = await req.json();

  if (!text || typeof text !== 'string') {
    return new Response('Text is required', { status: 400 });
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.trim(),
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 1,
        similarity_boost: 1,
        style: 0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('ElevenLabs error:', err);
    return new Response(`TTS failed: ${err}`, { status: res.status });
  }

  const audioBuffer = await res.arrayBuffer();
  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="podcast.mp3"',
    },
  });
}