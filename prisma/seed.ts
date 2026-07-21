import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CRYPTO_METHODS } from "../src/lib/constants";
import { DEFAULT_NEWS_SOURCES } from "../src/lib/news-sources";

const prisma = new PrismaClient();

const DEV_PASSWORD = "watchtower";
const slug = (s: string) =>
  s.toLowerCase().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

async function main() {
  console.log("Resetting database…");
  // Order matters for FK-free deleteMany on Postgres (cascades handle children).
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
        reputation: Math.floor(Math.random() * 4000),
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
  const prices = [
    ["BTC", 121437, 2.14], ["ETH", 6204, -0.82], ["SOL", 318.4, 4.06], ["XRP", 3.41, 0.34],
    ["BNB", 942.1, -1.12], ["DOGE", 0.3021, 1.9], ["ADA", 1.64, -0.44], ["LINK", 41.25, 2.87],
  ] as const;
  for (const [symbol, priceUsd, changePct] of prices) {
    await prisma.marketTicker.create({ data: { symbol, priceUsd, changePct } });
  }
  await prisma.siteSetting.createMany({
    data: [
      { key: "watchmen", value: "41208" },
      { key: "threatcon", value: "ELEVATED" },
      { key: "todays_number", value: "$43.2M" },
    ],
  });

  console.log("Seeding alerts…");
  const alerts = [
    { severity: "critical", title: "QuantumYield AI confirmed Ponzi — withdrawals frozen, 1,204 reports", chain: "multi-chain" },
    { severity: "high", title: "Fake 'Ledger Live 3.0' APK circulating via Telegram — verify release hashes", chain: "bitcoin" },
    { severity: "high", title: "Address-poisoning wave on TRON — always verify full addresses", chain: "tron" },
    { severity: "elevated", title: "Deepfake 'Saylor' giveaway streams back — 240 channels pulled this weekend", chain: "bitcoin" },
    { severity: "high", title: "Inferno Drainer v4 kit now rents for $99/week", chain: "evm" },
  ];
  for (const a of alerts) await prisma.alert.create({ data: a });

  console.log("Seeding articles…");
  const body = (paras: string[]) => paras.join("\n\n");
  const article = (a: {
    title: string; dek: string; kicker: string; category: string; severity?: string;
    author: { id: string }; cover: string; read: number; featured?: boolean; developing?: boolean; paras: string[];
  }) =>
    prisma.article.create({
      data: {
        slug: slug(a.title),
        title: a.title,
        dek: a.dek,
        kicker: a.kicker,
        category: a.category,
        severity: a.severity ?? "none",
        coverLabel: a.cover,
        readMinutes: a.read,
        isFeatured: a.featured ?? false,
        isDeveloping: a.developing ?? false,
        status: "published",
        authorId: a.author.id,
        viewCount: Math.floor(Math.random() * 40000),
        body: body(a.paras),
        tags: ["scam", a.category],
      },
    });

  await article({
    title: "Inside the $47M 'Pig-Butchering' Ring That Ran on Fake Exchange Apps",
    dek: "A six-month trail of shell domains, cloned trading dashboards and 3,800 victims — and the four red flags that were visible from day one.",
    kicker: "Investigation", category: "investigation", severity: "critical",
    author: mara, cover: "[ photo: seized fake trading dashboard ]", read: 14, featured: true,
    paras: [
      "For six months, the operators of \"NovaTrade Pro\" ran what looked like a boutique derivatives exchange: a polished dashboard, a 24/7 support desk, even a proof-of-reserves page. None of it was real.",
      "Our review of 3,800 victim statements, domain records and on-chain flows shows a single syndicate moving at least $47 million through 61 cloned exchange front-ends.",
      "## How the front-end fooled everyone",
      "The dashboard rendered live-looking balances that never touched a real order book. Deposits were swept within minutes to a rotating set of consolidation wallets.",
      "## The four red flags",
      "Every victim we interviewed encountered at least one of four signals before depositing: an unsolicited DM, a too-smooth onboarding call, a withdrawal that 'required' a tax pre-payment, and a domain registered less than 90 days earlier.",
      "The lesson is old but keeps costing people everything: if you did not seek out the platform yourself, assume it sought out you for a reason.",
    ],
  });

  await article({
    title: "HexaSwap Withdrawal Complaints Spike 4× in Ten Days",
    dek: "'Pending review' is the new 'insolvent'. Pattern-matching the last five exchange failures, the clock is likely already running.",
    kicker: "Exchange Watch", category: "exchange-watch", severity: "high",
    author: lena, cover: "[ chart: withdrawal complaint volume ]", read: 4, developing: true,
    paras: [
      "Complaints about stuck withdrawals at HexaSwap have quadrupled in ten days, according to forum reports and our own tracking.",
      "The pattern rhymes with five previous exchange failures: first a trickle of 'pending review' notices, then selective processing for vocal users, then silence.",
      "We are not calling insolvency. We are saying the base rate for this pattern ending well is low. Reduce exposure and export your records now.",
    ],
  });

  const others = [
    {
      title: "Fake 'Ledger Live' App Slips Past Play Store Review — 12,000 Downloads Before Takedown",
      dek: "A trojanized wallet manager reached the store's front page before removal.", kicker: "News", category: "news",
      author: dev, cover: "[ photo: fake app listing ]", read: 5,
      paras: ["A counterfeit 'Ledger Live' listing passed automated review and stayed live long enough to reach 12,000 installs.", "The app harvested recovery phrases entered during a fake 'device sync' step. Ledger never asks for your 24 words in software."],
    },
    {
      title: "Drainer-as-a-Service Kit 'Inferno v4' Now Rents for $99 a Week",
      dek: "Industrialized wallet-draining keeps getting cheaper and easier.", kicker: "Threat Intel", category: "threat-intel", severity: "high",
      author: lena, cover: "[ diagram: drainer kit architecture ]", read: 6,
      paras: ["The latest Inferno build lowers the technical bar for wallet-draining to almost nothing: point-and-click phishing pages, hosted signing prompts, and affiliate splits.", "Signing an opaque approval is the whole attack. Revoke unused allowances regularly."],
    },
    {
      title: "Deepfake 'Saylor' Giveaway Streams Are Back — 240 Channels Pulled This Weekend",
      dek: "The 'send 1 BTC, get 2 back' loop never dies; it just changes faces.", kicker: "News", category: "news",
      author: dev, cover: "[ photo: deepfake stream still ]", read: 4,
      paras: ["Over a single weekend, 240 livestream channels running deepfaked 'giveaway' loops were reported and pulled.", "No one doubles your Bitcoin. Every 'send X, receive 2X' stream is a theft funnel."],
    },
    {
      title: "Address Poisoning, Explained: Why You Should Never Copy From History",
      dek: "Attackers seed your history with lookalike addresses that match the first and last four characters.", kicker: "Field Guide", category: "field-guide",
      author: contributor, cover: "[ diagram: address poisoning attack ]", read: 7,
      paras: ["Address poisoning plants a lookalike address into your transaction history so a careless copy-paste sends funds to the attacker.", "Verify the full address, use an allow-list, and never paste from history."],
    },
    {
      title: "The 'Recovery Agent' Who Scams You Twice",
      dek: "After the rug comes the DM: 'We can trace your funds.'", kicker: "Field Guide", category: "field-guide",
      author: mara, cover: "[ photo: recovery scam dm thread ]", read: 6,
      paras: ["Recovery scams target victims at their most desperate, promising to trace and return stolen funds for an upfront fee.", "Legitimate recovery never asks for gas fees, taxes, or 'unlock' payments up front."],
    },
    {
      title: "Court Freezes $9.8M Tied to 'BitVault Capital' After Community Dossier",
      dek: "A 214-page evidence pack assembled by forum members became Exhibit A.", kicker: "Community Win", category: "community-win",
      author: manager, cover: "[ photo: court filing stack ]", read: 9,
      paras: ["A freeze order over $9.8M cites wallet clusters first mapped in this community's forum threads.", "Distributed, documented, on-chain evidence works. This is what the Watch is for."],
    },
    {
      title: "Five Wallet-Hygiene Rules the Pros Actually Follow",
      dek: "No hardware fetishism, no paranoia theater — just the habits that keep coins where they belong.", kicker: "Field Guide", category: "field-guide",
      author: contributor, cover: "[ photo: hardware wallet on desk ]", read: 5,
      paras: ["Segregate funds, revoke allowances, verify addresses, keep a cold vault, and never sign what you can't read.", "These five habits prevent the overwhelming majority of retail losses."],
    },
    {
      title: "Q2 2026 Scam Losses Hit $2.1B — Down 8%, but Drainer Kits Doubled",
      dek: "Fewer mega-ponzis, far more industrialized wallet-draining.", kicker: "Data", category: "data",
      author: lena, cover: "[ chart: q2 losses by category ]", read: 10,
      paras: ["Total reported losses fell 8% quarter-over-quarter to $2.1B, but drainer-kit incidents doubled.", "The damage is shifting from a few enormous ponzis to a long tail of automated theft."],
    },
  ];
  for (const a of others) await article(a);

  console.log("Seeding scam database…");
  const scams = [
    { name: "QuantumYield AI", type: "ponzi", chains: ["multi-chain"], severity: "critical", status: "frozen", verified: 3412, summary: "AI-branded yield Ponzi; withdrawals frozen after 1,204 reports.", risk: 24000000 },
    { name: "Ledger Live 3.0 (fake APK)", type: "impersonation", chains: ["bitcoin"], severity: "high", status: "active", verified: 2760, summary: "Trojanized wallet manager harvesting recovery phrases.", risk: 3000000 },
    { name: "Inferno Drainer v4", type: "drainer", chains: ["evm"], severity: "high", status: "active", verified: 2114, summary: "Drainer-as-a-service kit rented weekly to affiliates.", risk: 8000000 },
    { name: "BitVault Capital", type: "ponzi", chains: ["bitcoin"], severity: "high", status: "confirmed", verified: 1893, summary: "Fake fund; $9.8M frozen after community dossier.", risk: 9800000 },
    { name: "SaylorGiveaway.live", type: "giveaway", chains: ["bitcoin"], severity: "elevated", status: "monitoring", verified: 1677, summary: "Deepfake 'send 1 get 2' giveaway stream network.", risk: 1200000 },
    { name: "NovaTrade Pro", type: "pig-butchering", chains: ["multi-chain"], severity: "critical", status: "confirmed", verified: 1540, summary: "Cloned exchange front-end syndicate; $47M across 61 domains.", risk: 47000000 },
    { name: "HexaSwap", type: "other", chains: ["evm"], severity: "high", status: "monitoring", verified: 980, summary: "Withdrawal complaints spiking 4× in ten days.", risk: 5000000 },
  ];
  for (const s of scams) {
    await prisma.scamEntry.create({
      data: {
        slug: slug(s.name), name: s.name, type: s.type, chains: s.chains, severity: s.severity,
        status: s.status, verifiedCount: s.verified, reportCount: Math.floor(s.verified / 3),
        summary: s.summary, amountAtRiskUsd: BigInt(s.risk),
        addresses: ["PLACEHOLDER-observed-address-1", "PLACEHOLDER-observed-address-2"],
        details: `${s.summary}\n\nThis entry is community-verified. Add evidence via Report a Scam.`,
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
    data: { slug: slug("New drainer signature spotted on Base"), title: "New drainer signature spotted on Base", body: "Saw a new approval prompt pattern draining tokens on Base. Signature below — revoke if you interacted with the airdrop site.", categoryId: catRecords["scam-alerts"], authorId: member1.id, upvotes: 142, score: 142, tags: ["base", "drainer"] },
  });
  await prisma.forumComment.create({ data: { threadId: t1.id, authorId: contributor.id, body: "Confirmed. Clustered with three wallets from the Inferno set. Adding to the dossier.", upvotes: 38, score: 38 } });
  await prisma.forumComment.create({ data: { threadId: t1.id, authorId: member2.id, body: "Thank you — just revoked. This community is a lifesaver.", upvotes: 21, score: 21 } });
  await prisma.forumThread.create({
    data: { slug: slug("Lost 4 BTC to a recovery agent - what now"), title: "Lost 4 BTC to a 'recovery agent' — what now?", body: "After the first scam I paid a 'recovery agent' who then vanished. Documenting everything here. What are my realistic options?", categoryId: catRecords["help-i-was-scammed"], authorId: member2.id, upvotes: 96, score: 96, tags: ["recovery", "support"] },
  });

  // Store — merch (crypto checkout only)
  const products = [
    { name: "\"Verify Everything\" Heavy Tee", description: "Union-made heavyweight cotton tee, broadsheet print. Proceeds fund investigations.", priceUsd: 3400, category: "apparel", badge: "BESTSELLER", images: ["[ tee: front ]", "[ tee: back ]"] },
    { name: "Threat Board Enamel Pin", description: "Die-struck enamel pin of the struck-through SCAM wordmark.", priceUsd: 1200, category: "sticker", images: ["[ pin ]"] },
    { name: "The Rug Report — Print Annual 2026", description: "224-page print collection of the year's biggest scams, charts and field guides.", priceUsd: 4800, category: "print", badge: "NEW", images: ["[ book cover ]"] },
    { name: "Wallet-Hygiene Field Card (5-pack)", description: "Pocket reference cards of the five rules the pros follow.", priceUsd: 900, category: "print", images: ["[ card ]"] },
    { name: "\"Not Financial Advice\" Mug", description: "Enamel camp mug for your morning threat brief.", priceUsd: 1800, category: "apparel", images: ["[ mug ]"] },
    { name: "Cold-Storage Sticker Sheet", description: "Weatherproof vinyl sticker sheet — tag your hardware.", priceUsd: 700, category: "sticker", images: ["[ stickers ]"] },
  ];
  for (const p of products) {
    await prisma.product.create({ data: { slug: slug(p.name), name: p.name, description: p.description, priceUsd: p.priceUsd, category: p.category, badge: p.badge, imageLabels: p.images } });
  }

  // Crypto wallets (PLACEHOLDER addresses — replace before going live)
  let order = 0;
  for (const m of CRYPTO_METHODS) {
    await prisma.cryptoWallet.create({
      data: { method: m.method, label: m.label, network: m.network, address: `PLACEHOLDER-${m.method}-ADDRESS-REPLACE-ME`, order: order++ },
    });
  }

  // Donations
  await prisma.donation.create({ data: { donorName: "Anonymous", cryptoMethod: "BTC", cryptoAddress: "PLACEHOLDER-BTC-ADDRESS-REPLACE-ME", amountUsd: 25000, status: "confirmed", isAnonymous: true, message: "Keep exposing them." } });

  // Consultation
  const cReq = await prisma.consultationRequest.create({
    data: { name: "Worried Investor", email: "help@example.com", topic: "victim-support", urgency: "high", message: "I think I sent funds to a fake exchange yesterday. What can I do in the first 24 hours?", status: "new", amountUsd: BigInt(12000) },
  });
  await prisma.consultationMessage.create({ data: { requestId: cReq.id, authorId: manager.id, fromStaff: true, body: "Thanks for reaching out. First: stop all contact with them, screenshot everything, and file at /report. A volunteer will follow up within 24h." } });

  // Sting ops, gatherings, art, media
  await prisma.stingOperation.create({ data: { slug: "operation-cold-wallet", title: "Operation Cold Wallet", status: "active", summary: "Coordinated honeypot of 12 fake-recovery agents to map their infrastructure.", body: "Volunteers pose as victims to document scripts and wallet flows. Evidence feeds the Scam Database." } });
  await prisma.gathering.create({ data: { slug: "watch-meetup-lisbon", title: "Watch Meetup — Lisbon", description: "In-person meetup for community investigators. Talks on on-chain tracing.", location: "Lisbon, PT", startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21) } });
  await prisma.scamArt.create({ data: { slug: "the-doubler", title: "The Doubler", artist: "Anon", imageLabel: "[ art: neon 'send 1 get 2' ]", description: "Satirical piece on giveaway scams." } });
  await prisma.mediaItem.create({ data: { slug: "scamcast-ep-41", title: "ScamCast Ep. 41 — Anatomy of a Pig-Butchering Ring", kind: "podcast", duration: "42:10", description: "Mara Okafor breaks down the NovaTrade Pro investigation." } });

  // Subscribers
  await prisma.subscriber.createMany({ data: [{ email: "reader1@example.com" }, { email: "reader2@example.com", list: "alerts" }] });

  console.log("Seeding news sources…");
  for (const s of DEFAULT_NEWS_SOURCES) {
    await prisma.newsSource.create({ data: { name: s.name, feedUrl: s.feedUrl, homepage: s.homepage } });
  }
  // Note: articles ship with hatched placeholders (matching the design). Admins/copywriters
  // add a real cover image per article via the editor's "Cover image URL" field, and the
  // News Aggregator carries each source item's real image into the draft it creates.

  console.log("\n✔ Seed complete.");
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
