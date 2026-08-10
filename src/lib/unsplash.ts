const UNSPLASH_BASE = "https://api.unsplash.com";

export async function searchConferencePhotos(query: string, count = 6) {
  const res = await fetch(
    `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.map((photo: { id: string; urls: { regular: string; small: string }; alt_description: string | null; user: { name: string; links: { html: string } } }) => ({
    id: photo.id,
    url: photo.urls.regular,
    thumb: photo.urls.small,
    alt: photo.alt_description || query,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
  })) ?? [];
}

export async function getRandomConferencePhoto(query = "model united nations conference") {
  const res = await fetch(
    `${UNSPLASH_BASE}/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  );
  if (!res.ok) return null;
  const photo = await res.json();
  return {
    id: photo.id,
    url: photo.urls.regular,
    thumb: photo.urls.small,
    alt: photo.alt_description || query,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
  };
}
