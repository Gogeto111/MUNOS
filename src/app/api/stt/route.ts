import { env } from "@/lib/env";

export async function POST(req: Request) {
  const apiKey = env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Server is missing OPENAI_API_KEY." },
      { status: 500 },
    );
  }

  try {
    const incomingForm = await req.formData();
    const audioFile = incomingForm.get("audio");

    if (!audioFile || typeof audioFile === "string") {
      return Response.json({ error: "No audio file provided." }, { status: 400 });
    }

    const upstreamForm = new FormData();
    upstreamForm.append("file", audioFile, "recording.webm");
    upstreamForm.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: upstreamForm,
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json(
        { error: `Whisper API error: ${errText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json({ text: data.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
