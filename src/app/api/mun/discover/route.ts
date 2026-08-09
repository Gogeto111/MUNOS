import { env } from "@/lib/env";

const MUN_KEYWORDS = [
  "mun", "model united nations", "model un", "delegate", "committee",
  "united nations", "un conference", "diplomacy", "resolution",
  "secretary general", "best delegate", "chair", "bloc",
  "harvard mun", "thimun", "naimun", "wasmun", "cmun",
];

function isMunRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return MUN_KEYWORDS.some((kw) => lower.includes(kw));
}

interface InstagramProfile {
  username: string;
  name: string;
  biography: string;
  website: string;
  followers_count: number;
  media_count: number;
  profile_picture_url: string;
  source_hashtag: string;
  last_post_caption?: string;
}

async function searchHashtag(
  hashtag: string,
  userId: string,
  token: string,
): Promise<string | null> {
  const url = `https://graph.facebook.com/v20.0/ig_hashtag_search?user_id=${userId}&q=${encodeURIComponent(hashtag)}&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.[0]?.id ?? null;
}

async function getRecentMedia(
  hashtagId: string,
  userId: string,
  token: string,
): Promise<{ username: string; caption: string }[]> {
  const url = `https://graph.facebook.com/v20.0/${hashtagId}/recent_media?user_id=${userId}&fields=id,caption,username,like_count,timestamp&access_token=${token}&limit=25`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data ?? []).map((m: any) => ({
    username: m.username,
    caption: m.caption ?? "",
  }));
}

async function getProfile(
  userId: string,
  username: string,
  token: string,
): Promise<Omit<InstagramProfile, "source_hashtag" | "last_post_caption"> | null> {
  const url = `https://graph.facebook.com/v20.0/${userId}?fields=business_discovery.username(${username}){username,name,biography,website,followers_count,media_count,follows_count,profile_picture_url}&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.business_discovery ?? null;
}

export async function POST(req: Request) {
  const token = env.IG_ACCESS_TOKEN;
  const userId = env.IG_BUSINESS_ID;

  if (!token || !userId) {
    return Response.json(
      { error: "Instagram API not configured. Set IG_ACCESS_TOKEN and IG_BUSINESS_ID." },
      { status: 500 },
    );
  }

  try {
    const { hashtags = ["mun", "modelunitednations", "harvardmun", "mun2026", "thimun"] } = await req.json();

    const allProfiles: Map<string, InstagramProfile> = new Map();

    for (const tag of hashtags) {
      // Step 1: Search hashtag
      const hashtagId = await searchHashtag(tag, userId, token);
      if (!hashtagId) continue;

      // Rate limit protection
      await new Promise((r) => setTimeout(r, 200));

      // Step 2: Get recent media
      const media = await getRecentMedia(hashtagId, userId, token);
      const usernames = [...new Set(media.map((m) => m.username))];

      for (const username of usernames) {
        if (allProfiles.has(username)) continue;

        // Rate limit protection
        await new Promise((r) => setTimeout(r, 200));

        // Step 3: Get profile
        const profile = await getProfile(userId, username, token);
        if (!profile) continue;

        const lastCaption = media.find((m) => m.username === username)?.caption ?? "";

        // Step 4: Filter — keep only MUN-related
        if (isMunRelated(profile.biography) || isMunRelated(lastCaption) || profile.website) {
          allProfiles.set(username, {
            ...profile,
            source_hashtag: tag,
            last_post_caption: lastCaption.slice(0, 200),
          });
        }
      }
    }

    const results = Array.from(allProfiles.values());

    return Response.json({
      status: "success",
      count: results.length,
      data: results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
