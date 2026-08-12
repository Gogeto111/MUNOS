import { env } from "@/lib/env";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs "Rachel"

export async function POST(req: Request) {
  const apiKey = env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Server is missing ELEVENLABS_API_KEY." },
      { status: 500 },
    );
  }

  try {
    const { text, voiceId = DEFAULT_VOICE_ID } = await req.json();

    if (!text || !text.trim()) {
      return Response.json({ error: "No text provided." }, { status: 400 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      return Response.json(
        { error: `ElevenLabs API error: ${errText}` },
        { status: response.status },
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
