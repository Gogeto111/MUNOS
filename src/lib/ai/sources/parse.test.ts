import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  decodeEntities,
  extractPdfLinks,
  htmlToText,
  parseRssFeed,
  titleFromUrl,
} from "@/lib/ai/sources/parse";
import { CONFERENCE_SOURCES, UN_FEEDS } from "@/lib/ai/sources/registry";

describe("registry", () => {
  it("registers eight official conference sources with https urls", () => {
    expect(CONFERENCE_SOURCES).toHaveLength(8);
    for (const source of CONFERENCE_SOURCES) {
      expect(source.url.startsWith("https://")).toBe(true);
      expect(source.conference.length).toBeGreaterThan(0);
      expect(source.description.length).toBeGreaterThan(0);
    }
  });

  it("registers live UN feeds with http(s) urls and topic tags", () => {
    expect(UN_FEEDS.length).toBeGreaterThanOrEqual(8);
    for (const feed of UN_FEEDS) {
      expect(feed.url).toMatch(/^https?:\/\//);
      expect(feed.label.length).toBeGreaterThan(0);
      expect(typeof feed.topics).toBe("string");
      expect(feed.topics.length).toBeGreaterThan(0);
    }
  });

  it("uses unique conference and feed ids", () => {
    const conferenceIds = new Set(CONFERENCE_SOURCES.map((s) => s.id));
    expect(conferenceIds.size).toBe(CONFERENCE_SOURCES.length);
    const feedIds = new Set(UN_FEEDS.map((f) => f.id));
    expect(feedIds.size).toBe(UN_FEEDS.length);
  });
});

describe("decodeEntities", () => {
  it("decodes html entities", () => {
    expect(decodeEntities("A &amp; B &#38; C &quot;D&quot;")).toBe('A & B & C "D"');
  });
});

describe("htmlToText", () => {
  it("strips tags and collapses whitespace", () => {
    const html = "<div><h1>Hello</h1><p>Some <b>bold</b> text.</p></div>";
    expect(htmlToText(html)).toBe("Hello\n\nSome bold text.");
  });

  it("removes scripts and styles", () => {
    const html = "<p>Visible</p><script>bad()</script><style>p{}</style>";
    expect(htmlToText(html)).toBe("Visible");
  });
});

describe("absoluteUrl", () => {
  it("resolves relative and absolute links", () => {
    const base = "https://example.org/committees/";
    expect(absoluteUrl("https://other.com/x.pdf", base)).toBe("https://other.com/x.pdf");
    expect(absoluteUrl("/files/bg.pdf", base)).toBe("https://example.org/files/bg.pdf");
    expect(absoluteUrl("bg.pdf", base)).toBe("https://example.org/committees/bg.pdf");
    expect(absoluteUrl("../guide.pdf", base)).toBe("https://example.org/guide.pdf");
  });
});

describe("extractPdfLinks", () => {
  it("finds pdf anchors and prefers background/guide keywords", () => {
    const html =
      '<a href="/files/schedule.pdf">Schedule</a>' +
      '<a href="https://cdn.example.org/bg-guide.pdf">Background Guide</a>';
    const links = extractPdfLinks(html, "https://example.org/", 4);
    expect(links).toContain("https://example.org/files/schedule.pdf");
    expect(links[0]).toBe("https://cdn.example.org/bg-guide.pdf");
  });

  it("caps the number of links", () => {
    const html = Array.from({ length: 6 }, (_, i) => `<a href="/d/${i}.pdf">doc</a>`).join("");
    expect(extractPdfLinks(html, "https://example.org/", 3)).toHaveLength(3);
  });
});

describe("parseRssFeed", () => {
  const rss = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <title>UN News</title>
  <item>
    <title>UN adopts resolution &amp; on peace</title>
    <link>https://news.un.org/story/1</link>
    <description><![CDATA[<p>The General Assembly <b>adopted</b> a resolution.</p>]]></description>
    <pubDate>Mon, 03 Aug 2026 10:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Second story</title>
    <link>https://news.un.org/story/2</link>
    <description>Plain summary</description>
  </item>
</channel></rss>`;

  it("parses rss items with decoded fields and plain text", () => {
    const items = parseRssFeed(rss);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("UN adopts resolution & on peace");
    expect(items[0].link).toBe("https://news.un.org/story/1");
    expect(items[0].description).toContain("The General Assembly adopted a resolution.");
    expect(items[0].pubDate).toBe("Mon, 03 Aug 2026 10:00:00 GMT");
  });

  it("parses atom entry feeds", () => {
    const atom = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>OHCHR</title>
  <entry>
    <title>New report on human rights</title>
    <link rel="alternate" href="https://ohchr.org/report/1"/>
    <summary type="html">&lt;p&gt;A new report&lt;/p&gt;</summary>
    <updated>2026-08-02T09:00:00Z</updated>
  </entry>
</feed>`;
    const items = parseRssFeed(atom);
    expect(items[0].title).toBe("New report on human rights");
    expect(items[0].link).toBe("https://ohchr.org/report/1");
    expect(items[0].description).toContain("A new report");
    expect(items[0].pubDate).toBe("2026-08-02T09:00:00Z");
  });

  it("returns an empty array for non-feed input", () => {
    expect(parseRssFeed("<html><body>nope</body></html>")).toEqual([]);
    expect(parseRssFeed("")).toEqual([]);
  });
});

describe("titleFromUrl", () => {
  it("derives a human title from a url", () => {
    expect(titleFromUrl("https://example.org/files/un-security-council-bg-guide.pdf")).toBe(
      "un security council bg guide",
    );
    expect(titleFromUrl("https://example.org/")).toBe("example.org");
  });
});
