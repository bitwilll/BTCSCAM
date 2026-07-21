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
  // v4 art direction: public-domain paintings (Wikimedia Commons) as editorial imagery.
  const painting = (file: string, width = 900) =>
    `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`;
  const body = (paras: string[]) => paras.join("\n\n");
  const article = (a: {
    title: string; dek: string; kicker: string; category: string; severity?: string;
    author: { id: string }; cover: string; coverUrl?: string; read: number; featured?: boolean; developing?: boolean; paras: string[];
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
        coverImageUrl: a.coverUrl ?? null,
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
    author: mara, cover: "[ photo: seized fake trading dashboard ]",
    coverUrl: painting("Hieronymus_Bosch_051.jpg", 1800), read: 14, featured: true,
    paras: [
      "For six months, the operators of \"NovaTrade Pro\" ran what looked like a boutique derivatives exchange: a polished dashboard, a 24/7 support desk, even a proof-of-reserves page. None of it was real. Our review of 3,800 victim statements, domain records and on-chain flows shows a single syndicate moving at least $47 million through 61 cloned exchange front-ends.",
      "## The romance funnel",
      "Victims never found NovaTrade through an ad. They were walked in — patiently — by \"mentors\" met on dating apps and language-exchange groups. The playbook is industrial: three weeks of small talk, a screenshot of a winning trade, then an invitation to \"practice\" with $200.",
      "> They let me withdraw twice. That's what convinced me. The third deposit was my pension.",
      "Withdrawals worked until they didn't. Once an account crossed roughly $15,000, the dashboard invented a reason to freeze it: a \"withdrawal insurance fee\", a \"tax clearance\", an \"account upgrade\". Each fee was payable only by fresh deposit.",
      "### Four red flags visible from day one",
      "- Domain registered 11 days before the first deposit — always check registration dates.\n- \"Proof of reserves\" page had no verifiable on-chain addresses.\n- Support pushed victims from email to Telegram within one message.\n- Withdrawal fees payable only by new deposit. No legitimate venue does this.",
      "The database entry for NovaTrade Pro and its 60 sibling domains is live, with wallet clusters and indicator hashes. If a \"mentor\" is coaching you into any platform on that list, stop. Ask the forum first — the community answers in minutes.",
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
      dek: "The trojanized wallet asked users to 'restore' their 24 words on first launch. Google pulled it in 72 hours; the seeds were gone in minutes.", kicker: "News", category: "news", severity: "critical",
      author: dev, cover: "[ photo: phone with fake wallet app ]", coverUrl: painting("Quentin_Massys_001.jpg"), read: 6,
      paras: [
        "The listing looked immaculate: the right logo, a plausible changelog, 4.6 stars from farmed reviews. \"Ledger Live 3.0 — Official Update\" sat in search results for three days and was installed more than 12,000 times before Google removed it.",
        "## Verify signatures, every time",
        "The app itself did almost nothing — except at first launch, where a pixel-perfect \"restore your wallet\" screen collected 24-word phrases and posted them to a server in real time. Drains began within four minutes of entry, our on-chain review shows.",
        "### Protect yourself",
        "- Download wallet apps only from links on the vendor's own domain.\n- Check the developer name and release hash before installing.\n- No app ever needs your full seed to 'sync' or 'verify'.\n- Typed a seed into a screen? Assume it is burned. Move funds now.",
      ],
    },
    {
      title: "Drainer-as-a-Service Kit 'Inferno v4' Now Rents for $99 a Week",
      dek: "The kit behind most fake mints this quarter ships with cloned UIs, approval-swap scripts and a revenue dashboard for its 'affiliates'.", kicker: "Threat Intel", category: "threat-intel", severity: "high",
      author: lena, cover: "[ diagram: drainer kit rental flow ]", coverUrl: painting("Pieter_Bruegel_d._Ä._037.jpg"), read: 8,
      paras: [
        "Wallet draining is no longer a skill — it's a subscription. Inferno v4, the kit our tracker links to over 400 live phishing deployments, now advertises weekly rentals with onboarding support and a 20% platform fee on stolen funds.",
        "## Crime, subscription-priced",
        "Point-and-click phishing pages, hosted signing prompts, affiliate splits. Signing an opaque approval is the whole attack — revoke unused allowances regularly.",
      ],
    },
    {
      title: "Deepfake 'Saylor' Giveaway Streams Are Back — 240 Channels Pulled This Weekend",
      dek: "The 'send 1 BTC, get 2 back' loop never dies; it just changes faces.", kicker: "News", category: "news",
      author: dev, cover: "[ photo: deepfake stream still ]", coverUrl: painting("Marinus_Claesz._van_Reymerswaele_001.jpg"), read: 4,
      paras: ["Over a single weekend, 240 livestream channels running deepfaked 'giveaway' loops were reported and pulled.", "No one doubles your Bitcoin. Every 'send X, receive 2X' stream is a theft funnel."],
    },
    {
      title: "Address Poisoning, Explained: Why You Should Never Copy From History",
      dek: "Attackers seed your history with lookalike addresses that match the first and last four characters.", kicker: "Field Guide", category: "field-guide",
      author: contributor, cover: "[ diagram: address poisoning attack ]", coverUrl: painting("Van_Eyck_-_Arnolfini_Portrait.jpg"), read: 7,
      paras: ["Address poisoning plants a lookalike address into your transaction history so a careless copy-paste sends funds to the attacker.", "Verify the full address, use an allow-list, and never paste from history."],
    },
    {
      title: "The 'Recovery Agent' Who Scams You Twice",
      dek: "After the rug comes the DM: 'We can trace your funds.'", kicker: "Field Guide", category: "field-guide",
      author: mara, cover: "[ photo: recovery scam dm thread ]", coverUrl: painting("The_Garden_of_earthly_delights.jpg"), read: 6,
      paras: ["Recovery scams target victims at their most desperate, promising to trace and return stolen funds for an upfront fee.", "Legitimate recovery never asks for gas fees, taxes, or 'unlock' payments up front."],
    },
    {
      title: "Court Freezes $9.8M Tied to 'BitVault Capital' After Community Dossier",
      dek: "A 214-page evidence pack assembled by forum members became Exhibit A.", kicker: "Community Win", category: "community-win",
      author: manager, cover: "[ photo: court filing stack ]", coverUrl: painting("Sanzio_01.jpg"), read: 9,
      paras: ["A freeze order over $9.8M cites wallet clusters first mapped in this community's forum threads.", "Distributed, documented, on-chain evidence works. This is what the Watch is for."],
    },
    {
      title: "Five Wallet-Hygiene Rules the Pros Actually Follow",
      dek: "No hardware fetishism, no paranoia theater — just the habits that keep coins where they belong.", kicker: "Field Guide", category: "field-guide",
      author: contributor, cover: "[ photo: hardware wallet on desk ]", coverUrl: painting("Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg"), read: 5,
      paras: ["Segregate funds, revoke allowances, verify addresses, keep a cold vault, and never sign what you can't read.", "These five habits prevent the overwhelming majority of retail losses."],
    },
    {
      title: "Q2 2026 Scam Losses Hit $2.1B — Down 8%, but Drainer Kits Doubled",
      dek: "Fewer mega-ponzis, far more industrialized wallet-draining.", kicker: "Data", category: "data",
      author: lena, cover: "[ chart: q2 losses by category ]", coverUrl: painting("Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg"), read: 10,
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

  // Donations
  await prisma.donation.create({ data: { donorName: "Anonymous", cryptoMethod: "BTC", cryptoAddress: "PLACEHOLDER-BTC-ADDRESS-REPLACE-ME", amountUsd: 25000, status: "confirmed", isAnonymous: true, message: "Keep exposing them." } });

  // Consultation
  const cReq = await prisma.consultationRequest.create({
    data: { name: "Worried Investor", email: "help@example.com", topic: "victim-support", urgency: "high", message: "I think I sent funds to a fake exchange yesterday. What can I do in the first 24 hours?", status: "new", amountUsd: BigInt(12000) },
  });
  await prisma.consultationMessage.create({ data: { requestId: cReq.id, authorId: manager.id, fromStaff: true, body: "Thanks for reaching out. First: stop all contact with them, screenshot everything, and file at /report. A volunteer will follow up within 24h." } });

  // Sting ops, gatherings, art, media — v4 content
  await prisma.stingOperation.create({ data: { slug: "operation-cold-wallet", title: "Operation Cold Wallet", status: "active", summary: "Coordinated honeypot of 12 fake-recovery agents to map their infrastructure.", body: "Volunteers pose as victims to document scripts and wallet flows. Evidence feeds the Scam Database." } });

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

  // ScamCast — v4 episode list
  const casts = [
    { slug: "ep-012-tracing-inferno-v4", title: "EP 012 — The analyst who traced Inferno v4", duration: "48 MIN", description: "with Lena Vogt", daysAgo: 3 },
    { slug: "ep-011-reformed-recovery-agent", title: "EP 011 — Confessions of a reformed 'recovery agent'", duration: "61 MIN", description: "guest anonymized", daysAgo: 10 },
    { slug: "ep-010-forum-dossier-froze-9-8m", title: "EP 010 — How a forum dossier froze $9.8M", duration: "44 MIN", description: "with ModSentinel", daysAgo: 17 },
    { slug: "ep-009-pig-butchering-industry", title: "EP 009 — Pig-butchering: the industry behind the DM", duration: "57 MIN", description: "with Mara Okafor", daysAgo: 24 },
  ];
  for (const c of casts) {
    await prisma.mediaItem.create({ data: { slug: c.slug, title: c.title, kind: "podcast", duration: c.duration, description: c.description, publishedAt: new Date(Date.now() - day * c.daysAgo) } });
  }

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
