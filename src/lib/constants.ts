// ─── Roles, privileges, and domain vocabulary — single source of truth ───

export const ROLES = [
  "member",
  "contributor",
  "copywriter",
  "editor",
  "manager",
  "admin",
] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  member: "Member",
  contributor: "Contributor",
  copywriter: "Copywriter",
  editor: "Editor",
  manager: "Manager",
  admin: "Administrator",
};

// Granular privileges. Roles bundle these; admins can grant/revoke individually.
export const PRIVILEGES = {
  // content
  ARTICLE_CREATE: "article.create",
  ARTICLE_EDIT_OWN: "article.edit_own",
  ARTICLE_EDIT_ANY: "article.edit_any",
  ARTICLE_PUBLISH: "article.publish",
  ARTICLE_DELETE: "article.delete",
  // forum
  FORUM_POST: "forum.post",
  FORUM_COMMENT: "forum.comment",
  FORUM_MODERATE: "forum.moderate",
  // scam database
  SCAM_VERIFY: "scam.verify",
  SCAM_CREATE: "scam.create",
  SCAM_EDIT: "scam.edit",
  // reports
  REPORT_SUBMIT: "report.submit",
  REPORT_TRIAGE: "report.triage",
  REPORT_ASSIGN: "report.assign",
  // store / commerce
  SHOP: "shop",
  STORE_MANAGE: "store.manage",
  ORDER_MANAGE: "order.manage",
  // donations
  DONATE: "donate",
  DONATION_MANAGE: "donation.manage",
  // consultation
  CONSULT_REQUEST: "consult.request",
  CONSULT_HANDLE: "consult.handle",
  // community (events, sting ops, art, media)
  COMMUNITY_MANAGE: "community.manage",
  // users & platform
  USER_MANAGE: "user.manage",
  USER_ASSIGN_ROLE: "user.assign_role",
  USER_GRANT_PRIVILEGE: "user.grant_privilege",
  USER_BAN: "user.ban",
  SETTINGS_MANAGE: "settings.manage",
  AUDIT_VIEW: "audit.view",
  STAFF_ACCESS: "staff.access",
  ADMIN_ACCESS: "admin.access",
} as const;

export type Privilege = (typeof PRIVILEGES)[keyof typeof PRIVILEGES];

export const ALL_PRIVILEGES: Privilege[] = Object.values(PRIVILEGES);

const P = PRIVILEGES;

// Base privileges available to any authenticated member.
const MEMBER_PRIVS: Privilege[] = [
  P.FORUM_POST,
  P.FORUM_COMMENT,
  P.SCAM_VERIFY,
  P.REPORT_SUBMIT,
  P.SHOP,
  P.DONATE,
  P.CONSULT_REQUEST,
];

const CONTRIBUTOR_PRIVS: Privilege[] = [...MEMBER_PRIVS, P.ARTICLE_CREATE, P.ARTICLE_EDIT_OWN];

const COPYWRITER_PRIVS: Privilege[] = [
  ...CONTRIBUTOR_PRIVS,
  P.STAFF_ACCESS,
  P.SCAM_CREATE,
];

const EDITOR_PRIVS: Privilege[] = [
  ...COPYWRITER_PRIVS,
  P.ARTICLE_EDIT_ANY,
  P.ARTICLE_PUBLISH,
  P.ARTICLE_DELETE,
  P.FORUM_MODERATE,
  P.SCAM_EDIT,
  P.REPORT_TRIAGE,
];

const MANAGER_PRIVS: Privilege[] = [
  ...EDITOR_PRIVS,
  P.REPORT_ASSIGN,
  P.STORE_MANAGE,
  P.ORDER_MANAGE,
  P.DONATION_MANAGE,
  P.CONSULT_HANDLE,
  P.COMMUNITY_MANAGE,
];

const ADMIN_PRIVS: Privilege[] = [...ALL_PRIVILEGES];

export const ROLE_PRIVILEGES: Record<Role, Privilege[]> = {
  member: MEMBER_PRIVS,
  contributor: CONTRIBUTOR_PRIVS,
  copywriter: COPYWRITER_PRIVS,
  editor: EDITOR_PRIVS,
  manager: MANAGER_PRIVS,
  admin: ADMIN_PRIVS,
};

export const PRIVILEGE_LABELS: Record<string, string> = {
  [P.ARTICLE_CREATE]: "Create articles",
  [P.ARTICLE_EDIT_OWN]: "Edit own articles",
  [P.ARTICLE_EDIT_ANY]: "Edit any article",
  [P.ARTICLE_PUBLISH]: "Publish articles",
  [P.ARTICLE_DELETE]: "Delete articles",
  [P.FORUM_POST]: "Create forum threads",
  [P.FORUM_COMMENT]: "Comment on forum",
  [P.FORUM_MODERATE]: "Moderate forum",
  [P.SCAM_VERIFY]: "Verify scam entries",
  [P.SCAM_CREATE]: "Create scam entries",
  [P.SCAM_EDIT]: "Edit scam entries",
  [P.REPORT_SUBMIT]: "Submit scam reports",
  [P.REPORT_TRIAGE]: "Triage reports",
  [P.REPORT_ASSIGN]: "Assign reports",
  [P.SHOP]: "Place store orders",
  [P.STORE_MANAGE]: "Manage store & products",
  [P.ORDER_MANAGE]: "Manage orders",
  [P.DONATE]: "Make donations",
  [P.DONATION_MANAGE]: "Manage donations",
  [P.CONSULT_REQUEST]: "Request consultations",
  [P.CONSULT_HANDLE]: "Handle consultations",
  [P.COMMUNITY_MANAGE]: "Manage community (events, art, media)",
  [P.USER_MANAGE]: "Manage users",
  [P.USER_ASSIGN_ROLE]: "Assign roles",
  [P.USER_GRANT_PRIVILEGE]: "Grant / revoke privileges",
  [P.USER_BAN]: "Ban users",
  [P.SETTINGS_MANAGE]: "Manage site settings",
  [P.AUDIT_VIEW]: "View audit log",
  [P.STAFF_ACCESS]: "Access staff area",
  [P.ADMIN_ACCESS]: "Access admin panel",
};

// ─── Domain vocabulary ───

export const ARTICLE_CATEGORIES = [
  "news",
  "threat-intel",
  "field-guide",
  "data",
  "community-win",
  "exchange-watch",
  "investigation",
  "magazine",
  "scamcast",
  "rug-report",
] as const;

export const SEVERITIES = ["none", "elevated", "high", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const SEVERITY_COLORS: Record<string, string> = {
  none: "var(--ink-500)",
  elevated: "var(--btc-orange)",
  high: "var(--btc-orange-dark)",
  critical: "var(--alert-red)",
};

export const SCAM_TYPES = [
  "ponzi",
  "impersonation",
  "drainer",
  "giveaway",
  "phishing",
  "pig-butchering",
  "rug-pull",
  "recovery",
  "other",
] as const;

export const SCAM_STATUSES = ["active", "monitoring", "confirmed", "frozen", "dormant"] as const;

export const REPORT_STATUSES = [
  "pending",
  "triaging",
  "verified",
  "published",
  "rejected",
  "duplicate",
] as const;

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const CONSULT_TOPICS = [
  "victim-support",
  "recovery-guidance",
  "business-security",
  "press",
  "legal",
  "other",
] as const;

export const CONSULT_STATUSES = ["new", "scheduled", "in_progress", "closed"] as const;

// Crypto payment methods (donations + store). Addresses are placeholders in seed.
export const CRYPTO_METHODS = [
  { method: "BTC", label: "Bitcoin", network: "Bitcoin mainnet" },
  { method: "ETH", label: "Ethereum", network: "ERC-20" },
  { method: "USDT", label: "Tether", network: "ERC-20 / TRC-20" },
  { method: "USDC", label: "USD Coin", network: "ERC-20" },
  { method: "XMR", label: "Monero", network: "Monero" },
  { method: "XRP", label: "XRP", network: "XRP Ledger" },
  { method: "TRX", label: "TRON", network: "TRC-20" },
  { method: "CRYPT", label: "CryptoCoin", network: "Native" },
  { method: "OSM", label: "Osmosis", network: "Cosmos / IBC" },
] as const;

export const SITE = {
  name: "BTCSCAM.COM",
  tagline: "COMMUNITY-VERIFIED SCAM INTELLIGENCE",
  mission: "EXPOSE SCAMS · VERIFY REPORTS · PROTECT THE COMMUNITY",
  disclaimer: "NOT FINANCIAL ADVICE · VERIFY EVERYTHING",
} as const;
