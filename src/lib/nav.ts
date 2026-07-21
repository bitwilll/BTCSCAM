// Site navigation — used by the primary nav, dropdowns, and footer.

export type NavLink = { label: string; href: string };
export type NavGroup = { label: string; href?: string; children?: NavLink[] };

export const PRIMARY_NAV: NavGroup[] = [
  { label: "Scam Database", href: "/database" },
  { label: "Alerts", href: "/alerts" },
  {
    label: "Community",
    children: [
      { label: "Forum", href: "/forum" },
      { label: "Report a Scam", href: "/report" },
      { label: "Sting Operations", href: "/sting-operations" },
      { label: "Gatherings", href: "/gatherings" },
      { label: "Scam Art", href: "/scam-art" },
    ],
  },
  {
    label: "Media",
    children: [
      { label: "Magazine", href: "/magazine" },
      { label: "ScamCast", href: "/scamcast" },
      { label: "The Rug Report", href: "/rug-report" },
      { label: "Latest News", href: "/news" },
    ],
  },
  {
    label: "Services",
    children: [
      { label: "Consultation", href: "/consultation" },
      { label: "Donate", href: "/donate" },
      { label: "Film Fundraiser", href: "/film-fundraiser" },
      { label: "About Us", href: "/about" },
    ],
  },
  { label: "Store", href: "/store" },
];

export const FOOTER_NAV: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Sections",
    links: [
      { label: "Front Page", href: "/" },
      { label: "Crypto Scam Alerts", href: "/alerts" },
      { label: "Scam Database", href: "/database" },
      { label: "ScamCast", href: "/scamcast" },
      { label: "Magazine", href: "/magazine" },
      { label: "The Rug Report", href: "/rug-report" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Report a Scam", href: "/report" },
      { label: "Forum", href: "/forum" },
      { label: "Sting Operations", href: "/sting-operations" },
      { label: "Gatherings", href: "/gatherings" },
      { label: "Scam Art", href: "/scam-art" },
      { label: "Store", href: "/store" },
    ],
  },
  {
    heading: "Organization",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Donate", href: "/donate" },
      { label: "Consultation", href: "/consultation" },
      { label: "Film Fundraiser", href: "/film-fundraiser" },
      { label: "For Satoshi", href: "/about#for-satoshi" },
    ],
  },
  {
    heading: "Staff",
    links: [
      { label: "Admin Panel", href: "/admin" },
      { label: "Editor Desk", href: "/editor" },
      { label: "Manager Console", href: "/manager" },
    ],
  },
];
