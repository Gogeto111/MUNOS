import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "MUNOS";
  const subtitle =
    searchParams.get("subtitle") ??
    "Model United Nations Operating System";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)",
            }}
          >
            <svg
              viewBox="0 0 32 32"
              fill="none"
              width="40"
              height="40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 10.5h16M8 21.5h16M16 7.5v17M8.5 16h15"
                stroke="white"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
              <ellipse
                cx="16"
                cy="16"
                rx="8"
                ry="3.6"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.65"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            MUNOS
          </span>
        </div>

        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "800px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "22px",
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "center",
            marginTop: "20px",
            maxWidth: "700px",
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "60px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "18px",
          }}
        >
          munos.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
