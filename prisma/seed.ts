import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CRYPTO_METHODS } from "../src/lib/constants";
import { DEFAULT_NEWS_SOURCES } from "../src/lib/news-sources";

const prisma = new PrismaClient();

const DEV_PASSWORD = "watchtower";
const slug = (s: string) =>
  s.toLowerCase().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

// ─── Authentic dataset ───
// Real, documented crypto-scam cases researched from primary sources (DOJ/SEC/OFAC/
// FBI-IC3/CFTC and reputable security vendors), then adversarially fact-checked.
// Produced by the `authentic-scam-data` research workflow; see prisma/authentic-data.json.
type AuthScam = {
  slug: string; name: string; type: string; chains: string[]; status: string;
  severity: string; summary: string; details: string; lossUsd: number;
  firstSeenYear: number; officialAction: string; sources: string[]; verdict: string;
};
type AuthArticle = {
  slug: string; title: string; dek: string; kicker: string; category: string;
  severity: string; readMinutes: number; sourceName: string; sourceUrl: string;
  tags: string[]; paras: string[];
};
type AuthAlert = { severity: string; title: string; chain: string; body?: string; sourceUrl?: string };
type AuthFigures = {
  figures: { label: string; value: string; source: string }[];
  todaysNumber: string; todaysNumberBasis: string; sources: string[];
} | null;
type AuthenticData = { scams: AuthScam[]; articles: AuthArticle[]; alerts: AuthAlert[]; figures: AuthFigures };

const authentic = JSON.parse(
  readFileSync(join(__dirname, "authentic-data.json"), "utf8"),
) as AuthenticData;

// Public-record OFAC-sanctioned on-chain addresses, keyed by scam slug. These are
// published on the U.S. Treasury SDN list for the named, documented sanctioned actor
// (DPRK / Lazarus Group) — the only case where seeding real addresses is appropriate.
// Every other entry keeps an empty address list until on-chain evidence is verified.
const REAL_ADDRESSES: Record<string, string[]> = {
  // OFAC SDN designation (2022-04-14) of the Lazarus Group ETH address that received
  // the stolen Ronin Bridge funds. Source: U.S. Treasury / OFAC recent actions.
  "ronin-bridge": ["0x098B716B8Aaf21512996dC57EB0615e2383E2f96"],
};

// Per-article editorial dressing (author desk, public-domain cover painting, placement,
// recency). Content is authentic and verified; only the art direction is assigned here.
const painting = (file: string, width = 900) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`;

async function main() {
  console.log("Resetting database…");
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.vote.deleteMany(),
    prisma.forumComment.deleteMany(),
    prisma.forumThread.deleteMany(),
    prisma.forumCategory.deleteMany(),
    prisma.savedArticle.deleteMany(),
    prisma.scamVerification.deleteMany(),
    prisma.scamReport.deleteMany(),
    prisma.scamEntry.deleteMany(),
    prisma.article.deleteMany(),
    prisma.alert.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.product.deleteMany(),
    prisma.donation.deleteMany(),
    prisma.consultationMessage.deleteMany(),
    prisma.consultationRequest.deleteMany(),
    prisma.stingOperation.deleteMany(),
    prisma.gathering.deleteMany(),
    prisma.scamArt.deleteMany(),
    prisma.mediaItem.deleteMany(),
    prisma.subscriber.deleteMany(),
    prisma.newsFeedItem.deleteMany(),
    prisma.newsSource.deleteMany(),
    prisma.marketTicker.deleteMany(),
    prisma.siteSetting.deleteMany(),
    prisma.cryptoWallet.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const hash = await bcrypt.hash(DEV_PASSWORD, 10);

  console.log("Seeding users…");
  const u = async (
    username: string,
    displayName: string,
    role: string,
    title?: string,
    email?: string,
  ) =>
    prisma.user.create({
      data: {
        username,
        displayName,
        email: email ?? `${username}@btcscam.com`,
        passwordHash: hash,
        role,
        title,
        reputation: 0, // earned on-site, not seeded
        bio: title ? `${title} at BTCSCAM.COM.` : undefined,
      },
    });

  const admin = await u("admin", "Site Admin", "admin", "Administrator", "admin@btcscam.com");
  const mara = await u("mokafor", "Mara Okafor", "editor", "Chief Investigations Editor");
  const dev = await u("dpatel", "Dev Patel", "copywriter", "Staff Reporter");
  const lena = await u("lvogt", "Lena Vogt", "copywriter", "Threat Intel Correspondent");
  const manager = await u("jmanager", "Jules Renner", "manager", "Community Manager");
  const member1 = await u("chainwatcher", "ChainWatcher", "member");
  const member2 = await u("satoshigrandma", "SatoshiGrandma", "member");
  const contributor = await u("hexdiver", "HexDiver", "contributor", "Volunteer Analyst");

  console.log("Seeding market ticker + settings…");
  // Real CoinGecko snapshot (2026-07-22). The ticker self-refreshes from CoinGecko
  // every 5 minutes at runtime (src/lib/ticker.ts) — these are just first-paint values.
  const prices = [
    ["BTC", 66249, 1.67], ["ETH", 1920.86, 1.26], ["SOL", 77.94, 0.32], ["XRP", 1.14, 2.64],
    ["BNB", 572.78, 0.41], ["DOGE", 0.073217, 1.76], ["ADA", 0.172733, 1.85], ["LINK", 8.61, 0.9],
  ] as const;
  for (const [symbol, priceUsd, changePct] of prices) {
    await prisma.marketTicker.create({ data: { symbol, priceUsd, changePct } });
  }
  // todays_number = latest authoritative annual crypto-fraud loss ÷ 365, from the
  // research desk's verified figures (basis stored in the seed log below).
  const todaysNumber = authentic.figures?.todaysNumber ?? "$25.5M";
  await prisma.siteSetting.createMany({
    data: [
      { key: "watchmen", value: String(await prisma.user.count()) },
      { key: "threatcon", value: "ELEVATED" },
      { key: "todays_number", value: todaysNumber },
    ],
  });

  console.log(`Seeding alerts… (${authentic.alerts.length})`);
  for (const a of authentic.alerts) {
    await prisma.alert.create({
      data: {
        severity: a.severity,
        title: a.title,
        chain: a.chain,
        // Keep the source link inside the body so nothing is fabricated and the
        // provenance travels with the alert.
        body: a.sourceUrl ? `${a.body ?? ""}${a.body ? "\n\n" : ""}Source: ${a.sourceUrl}`.trim() : a.body,
      },
    });
  }

  console.log(`Seeding articles… (${authentic.articles.length})`);
  const body = (paras: string[]) => paras.join("\n\n");

  // slug → art direction. Every authentic article is matched here; a fallback keeps
  // seeding resilient if the research set changes.
  const ART: Record<
    string,
    { author: { id: string }; cover: string; img: string; featured?: boolean; developing?: boolean; hoursAgo: number }
  > = {
    "prince-group-feature": { author: mara, cover: "[ painting: Bosch — The Garden of Earthly Delights ]", img: painting("The_Garden_of_earthly_delights.jpg", 1800), featured: true, hoursAgo: 3 },
    "bybit-hack-story": { author: lena, cover: "[ painting: Bruegel — The Fall of the Rebel Angels ]", img: painting("Pieter_Bruegel_the_Elder_-_The_Fall_of_the_Rebel_Angels_-_Google_Art_Project.jpg"), hoursAgo: 8 },
    "fake-ledger-app": { author: dev, cover: "[ painting: Massys — The Moneylender and his Wife ]", img: painting("Quentin_Massys_001.jpg"), hoursAgo: 12 },
    "inferno-drainer-story": { author: lena, cover: "[ painting: Bruegel — The Triumph of Death ]", img: painting("Pieter_Bruegel_d._Ä._037.jpg"), hoursAgo: 20 },
    "deepfake-giveaways": { author: dev, cover: "[ painting: van Reymerswaele — Two Tax Collectors ]", img: painting("Marinus_Claesz._van_Reymerswaele_001.jpg"), hoursAgo: 28 },
    "ftx-retrospective": { author: lena, cover: "[ painting: Holbein — The Ambassadors ]", img: painting("Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg"), developing: false, hoursAgo: 34 },
    "zachxbt-genesis-heist": { author: manager, cover: "[ painting: Raphael — The School of Athens ]", img: painting("Sanzio_01.jpg"), hoursAgo: 40 },
    "address-poisoning-guide": { author: contributor, cover: "[ painting: van Eyck — Arnolfini Portrait ]", img: painting("Van_Eyck_-_Arnolfini_Portrait.jpg"), hoursAgo: 50 },
    "recovery-scam-guide": { author: mara, cover: "[ painting: Bosch — detail from a moral allegory ]", img: painting("Hieronymus_Bosch_051.jpg", 1400), hoursAgo: 60 },
    "crime-data-2026": { author: lena, cover: "[ painting: Friedrich — Wanderer above the Sea of Fog ]", img: painting("Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg"), hoursAgo: 72 },
  };
  const fallbackArt = { author: dev, cover: "[ editorial illustration ]", img: painting("Hieronymus_Bosch_051.jpg", 1400), hoursAgo: 24 };
  const seedTime = Date.now();

  for (const a of authentic.articles) {
    const meta = ART[a.slug] ?? fallbackArt;
    await prisma.article.create({
      data: {
        slug: slug(a.title),
        title: a.title,
        dek: a.dek,
        kicker: a.kicker,
        category: a.category,
        severity: a.severity,
        coverLabel: meta.cover,
        coverImageUrl: meta.img,
        sourceName: a.sourceName || null,
        sourceUrl: a.sourceUrl || null,
        readMinutes: a.readMinutes,
        isFeatured: meta.featured ?? false,
        isDeveloping: meta.developing ?? false,
        status: "published",
        authorId: meta.author.id,
        viewCount: 0, // earned, not seeded
        publishedAt: new Date(seedTime - meta.hoursAgo * 3600_000),
        body: body(a.paras),
        tags: a.tags,
      },
    });
  }

  console.log(`Seeding scam database… (${authentic.scams.length})`);
  for (const s of authentic.scams) {
    await prisma.scamEntry.create({
      data: {
        slug: s.slug,
        name: s.name,
        type: s.type,
        chains: s.chains,
        severity: s.severity,
        status: s.status,
        // Community-engagement counts are earned on-site, not fabricated. These entries
        // are seeded from primary public records; their authority is the official action.
        verifiedCount: 0,
        reportCount: 0,
        summary: s.summary,
        amountAtRiskUsd: BigInt(Math.round(s.lossUsd)),
        addresses: REAL_ADDRESSES[s.slug] ?? [],
        // firstSeen = January of the documented first-seen year.
        firstSeen: new Date(Date.UTC(s.firstSeenYear, 0, 1)),
        details: s.officialAction
          ? `${s.details}\n\n**Official action:** ${s.officialAction}`
          : s.details,
      },
    });
  }

  console.log("Seeding reports, forum, store, crypto, community…");
  await prisma.scamReport.create({
    data: { scamName: "Giga Staking Pool", category: "ponzi", chain: "evm", description: "Guaranteed 3%/day staking; withdrawals now failing.", status: "triaging", reporterEmail: "tip@example.com", walletAddresses: ["PLACEHOLDER-reported-address"], submittedById: member1.id, assignedToId: mara.id },
  });
  await prisma.scamReport.create({
    data: { scamName: "Fake Trezor Support", category: "impersonation", chain: "bitcoin", description: "Google-ad 'support' line asking for seed phrase.", status: "pending", submittedById: member2.id },
  });

  // Forum
  const fcats = [
    { slug: "scam-alerts", name: "Scam Alerts", description: "Fresh sightings and warnings.", order: 1 },
    { slug: "help-i-was-scammed", name: "Help — I Was Scammed", description: "Support and next steps for victims.", order: 2 },
    { slug: "investigations", name: "Investigations", description: "Collaborative on-chain sleuthing.", order: 3 },
    { slug: "wallet-security", name: "Wallet Security", description: "Hygiene, hardware, and best practices.", order: 4 },
  ];
  const catRecords: Record<string, string> = {};
  for (const c of fcats) {
    const r = await prisma.forumCategory.create({ data: c });
    catRecords[c.slug] = r.id;
  }
  const t1 = await prisma.forumThread.create({
    data: { slug: slug("New drainer signature spotted on Base"), title: "New drainer signature spotted on Base", body: "Saw a new approval prompt pattern draining tokens on Base. Signature below — revoke if you interacted with the airdrop site.", categoryId: catRecords["scam-alerts"], authorId: member1.id, upvotes: 0, score: 0, tags: ["base", "drainer"] },
  });
  await prisma.forumComment.create({ data: { threadId: t1.id, authorId: contributor.id, body: "Confirmed. Clustered with three wallets from a known drainer set. Adding to the dossier.", upvotes: 0, score: 0 } });
  await prisma.forumComment.create({ data: { threadId: t1.id, authorId: member2.id, body: "Thank you — just revoked. This community is a lifesaver.", upvotes: 0, score: 0 } });
  await prisma.forumThread.create({
    data: { slug: slug("Lost 4 BTC to a recovery agent - what now"), title: "Lost 4 BTC to a 'recovery agent' — what now?", body: "After the first scam I paid a 'recovery agent' who then vanished. Documenting everything here. What are my realistic options?", categoryId: catRecords["help-i-was-scammed"], authorId: member2.id, upvotes: 0, score: 0, tags: ["recovery", "support"] },
  });

  // Store — v4's nine-product catalog (crypto checkout only; Unsplash imagery per design)
  const unsplash = (id: string) => `https://images.unsplash.com/${id}?w=800&q=75`;
  const products = [
    { name: "NOT YOUR KEYS Tee", description: "Heavyweight cotton. The full sentence on the back: not your coins.", priceUsd: 3200, category: "apparel", badge: "BESTSELLER", img: unsplash("photo-1576566588028-4147f3842f27"), label: "[ photo: black tee, orange block print ]" },
    { name: "VERIFY EVERYTHING Hoodie", description: "The moderator uniform. Embroidered wordmark, kangaroo pocket for your hardware wallet.", priceUsd: 6800, category: "apparel", img: unsplash("photo-1556821840-3a63f95609a7"), label: "[ photo: hoodie flat lay ]" },
    { name: "SEED PHRASE Steel Plate", description: "410 stainless, letter punches included. Your 24 words, fireproof. Not a toy.", priceUsd: 4500, category: "gear", img: unsplash("photo-1544816155-12df9643f363"), label: "[ photo: steel backup plate + punch set ]" },
    { name: "SCAM ALERT Klaxon Mug", description: "Enamel, 350ml. The ticker's red badge, on your desk before coffee.", priceUsd: 2200, category: "desk", img: unsplash("photo-1517256064527-09c73fc73e38"), label: "[ photo: red enamel mug ]" },
    { name: "RED FLAGS Field Notebook", description: "48 pages. Checklist per page: domain age, custody, yield math, exit path.", priceUsd: 1400, category: "desk", img: unsplash("photo-1544716278-ca5e3f4abd8c"), label: "[ photo: pocket notebook ]" },
    { name: "WATCHMAN Cap", description: "Unstructured, orange stitch. For duty hours, which are all hours.", priceUsd: 2800, category: "apparel", img: unsplash("photo-1588850561407-ed78c282e89b"), label: "[ photo: black cap, orange stitch ]" },
    { name: "THREAT BOARD Poster", description: "A2 risograph print of the ten scam archetypes. Frame not included; vigilance is.", priceUsd: 1800, category: "desk", img: unsplash("photo-1513519245088-0e12902e5a38"), label: "[ photo: risograph poster ]" },
    { name: "COLD STORAGE Sticker Pack", description: "12 vinyl stickers. Laptop-grade adhesive, scam-grade skepticism.", priceUsd: 900, category: "gear", img: unsplash("photo-1572375992501-4b0892d50c69"), label: "[ photo: sticker sheet ]" },
    { name: "BTC SCAM Gift Card", description: "Crypto-only store credit, emailed as a redeem code. The safest gift in crypto.", priceUsd: 2500, category: "gift", img: unsplash("photo-1613243555988-441166d4d6fd"), label: "[ photo: orange gift card ]" },
  ] as const;
  for (const p of products) {
    await prisma.product.create({ data: { slug: slug(p.name), name: p.name, description: p.description, priceUsd: p.priceUsd, category: p.category, badge: "badge" in p ? (p as { badge?: string }).badge : undefined, imageUrl: p.img, imageLabels: [p.label] } });
  }

  // Crypto wallets (PLACEHOLDER addresses — replace before going live)
  let order = 0;
  for (const m of CRYPTO_METHODS) {
    await prisma.cryptoWallet.create({
      data: { method: m.method, label: m.label, network: m.network, address: `PLACEHOLDER-${m.method}-ADDRESS-REPLACE-ME`, order: order++ },
    });
  }

  // Donations: none seeded — the ledger starts honest and fills with real pledges.

  // Consultation
  const cReq = await prisma.consultationRequest.create({
    data: { name: "Worried Investor", email: "help@example.com", topic: "victim-support", urgency: "high", message: "I think I sent funds to a fake exchange yesterday. What can I do in the first 24 hours?", status: "new", amountUsd: BigInt(12000) },
  });
  await prisma.consultationMessage.create({ data: { requestId: cReq.id, authorId: manager.id, fromStaff: true, body: "Thanks for reaching out. First: stop all contact with them, screenshot everything, and file at /report. A volunteer will follow up within 24h." } });

  // Sting ops, gatherings, art, media — v4 content
  await prisma.stingOperation.create({ data: { slug: "operation-cold-wallet", title: "Operation Cold Wallet", status: "active", summary: "Standing volunteer program documenting fake-recovery agents — their scripts, fee funnels and wallet flows.", body: "Volunteers engage 'recovery agents' who approach scam victims, and document the scripts, upfront-fee demands and wallet flows they use. The FBI's IC3 has repeatedly warned that fund-recovery fraud re-victimizes people who have already lost money. Documented evidence feeds the Scam Database." } });

  const day = 1000 * 60 * 60 * 24;
  const gatherings = [
    { slug: "spotting-drainers-101", title: "Spotting drainers 101 — live workshop", description: "Hands-on session: reading signing prompts, spotting approval swaps, revoking allowances.", location: "Online · 19:00 UTC", isVirtual: true, days: 1 },
    { slug: "btcscam-meetup-verification-night", title: "BTCSCAM meetup: verification night", description: "In-person verification sprint — bring dossiers, leave with confirmations.", location: "Berlin · c-base", isVirtual: false, days: 12 },
    { slug: "ask-a-forensic-analyst-ama", title: "Ask a forensic analyst — open AMA", description: "On-chain tracing questions answered live by the watchdesk's analysts.", location: "Online · 17:00 UTC", isVirtual: true, days: 25 },
    { slug: "scam-ctf-48h", title: "Scam CTF — 48h defense exercise", description: "Teams of four defend a simulated victim through a weekend of live social-engineering.", location: "Online · teams of 4", isVirtual: true, days: 46 },
  ];
  for (const g of gatherings) {
    await prisma.gathering.create({ data: { slug: g.slug, title: g.title, description: g.description, location: g.location, isVirtual: g.isVirtual, startsAt: new Date(Date.now() + day * g.days) } });
  }

  // Scam Art — v4 gallery: community pieces presented via public-domain paintings
  const artPieces = [
    { t: "Rug Pull No. 5", a: "@satoshiglass", m: "RISOGRAPH · EDITION OF 50", img: painting("Pieter_Bruegel_the_Elder_-_The_Fall_of_the_Rebel_Angels_-_Google_Art_Project.jpg"), d: "After Bruegel's falling angels — a token chart mid-collapse, holders tumbling out of the frame." },
    { t: "Seed Phrase (Redacted)", a: "Anna K.", m: "OIL ON STEEL PLATE", img: painting("Van_Eyck_-_Arnolfini_Portrait.jpg"), d: "Twelve words she never wrote down. A portrait of the only secret worth keeping." },
    { t: "1000x — A Study in Greed", a: "@blockprintbob", m: "WOODCUT", img: painting("Quentin_Massys_001.jpg"), d: "Massys' money changer, re-cut: the scales weigh a promise against a private key." },
    { t: "Cold Storage", a: "M. Iwata", m: "SILVER GELATIN PRINT", img: painting("Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg"), d: "Alone above the fog with nothing but a steel plate of entropy. Self-custody as landscape." },
    { t: "The Mempool Dreams", a: "@txfeepoet", m: "GENERATIVE · NFT", img: painting("The_Garden_of_earthly_delights.jpg"), d: "Bosch's garden as an unconfirmed-transaction queue: every pleasure pending, every fee a sin." },
    { t: "Exit Scam Sunset", a: "watchmen collective", m: "SCREEN PRINT · NFT TWIN", img: painting("Claude_Monet,_Impression,_soleil_levant.jpg"), d: "An impressionist sunrise over a dead exchange — the founders sailed at dawn." },
  ];
  for (const ap of artPieces) {
    await prisma.scamArt.create({ data: { slug: slug(ap.t), title: ap.t, artist: ap.a, imageLabel: ap.m, imageUrl: ap.img, description: ap.d } });
  }

  // ScamCast — site-produced show; episode themes track our real coverage
  const casts = [
    { slug: "ep-012-anatomy-of-the-bybit-heist", title: "EP 012 — Anatomy of the Bybit heist", duration: "48 MIN", description: "with Lena Vogt", daysAgo: 3 },
    { slug: "ep-011-the-recovery-scam-funnel", title: "EP 011 — The recovery-scam funnel, mapped", duration: "61 MIN", description: "with Mara Okafor", daysAgo: 10 },
    { slug: "ep-010-reading-the-ofac-list", title: "EP 010 — Reading the OFAC list like a watchman", duration: "44 MIN", description: "with HexDiver", daysAgo: 17 },
    { slug: "ep-009-pig-butchering-industry", title: "EP 009 — Pig-butchering: the industry behind the DM", duration: "57 MIN", description: "with Mara Okafor", daysAgo: 24 },
  ];
  for (const c of casts) {
    await prisma.mediaItem.create({ data: { slug: c.slug, title: c.title, kind: "podcast", duration: c.duration, description: c.description, publishedAt: new Date(Date.now() - day * c.daysAgo) } });
  }

  console.log("Seeding news sources…");
  for (const s of DEFAULT_NEWS_SOURCES) {
    await prisma.newsSource.create({ data: { name: s.name, feedUrl: s.feedUrl, homepage: s.homepage } });
  }
  // The News Aggregator (staff area) pulls real headlines from these RSS sources and
  // creates attributed drafts for a human to rewrite before publishing.

  console.log("\n✔ Seed complete.");
  console.log("─────────────────────────────────────────────");
  if (authentic.figures) console.log("todays_number basis: " + authentic.figures.todaysNumberBasis);
  console.log(`Seeded ${authentic.scams.length} scam entries, ${authentic.articles.length} articles, ${authentic.alerts.length} alerts.`);
  console.log("─────────────────────────────────────────────");
  console.log("Dev accounts (password for all: " + DEV_PASSWORD + ")");
  console.log("  admin@btcscam.com        → Administrator");
  console.log("  mokafor@btcscam.com      → Editor (Chief Investigations)");
  console.log("  jmanager@btcscam.com     → Manager");
  console.log("  dpatel@btcscam.com       → Copywriter");
  console.log("  chainwatcher@btcscam.com → Member");
  console.log("─────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
