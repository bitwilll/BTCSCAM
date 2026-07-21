import type { Metadata } from "next";
import { Container, PageHeader, SectionHeader, Tag } from "@/components/ui";
import { SITE } from "@/lib/constants";
import { ConsultationForm } from "./_components/ConsultationForm";

export const metadata: Metadata = {
  title: "Consultation & Victim Support | BTCSCAM.COM",
  description:
    "Free, confidential help after a crypto scam — victim support, recovery guidance, business security, press, and legal orientation.",
};

const TRACKS: { topic: string; label: string; blurb: string; tone: "red" | "orange" | "black" }[] = [
  {
    topic: "victim-support",
    label: "Victim Support",
    tone: "red",
    blurb:
      "Just got scammed? Start here. We walk you through the critical first 24 hours — freezing contact, preserving evidence, and where to report.",
  },
  {
    topic: "recovery-guidance",
    label: "Recovery Guidance",
    tone: "orange",
    blurb:
      "Realistic next steps for tracing funds and filing with exchanges and authorities — and how to spot the fake 'recovery agents' who prey on victims twice.",
  },
  {
    topic: "business-security",
    label: "Business Security",
    tone: "black",
    blurb:
      "Running a project, exchange, or treasury? Harden your team against drainers, social engineering, and impersonation before you're the case study.",
  },
  {
    topic: "press",
    label: "Press & Research",
    tone: "black",
    blurb:
      "Journalists and researchers: request background, anonymized data, and on-record commentary from our investigations desk.",
  },
  {
    topic: "legal",
    label: "Legal Orientation",
    tone: "black",
    blurb:
      "General orientation on reporting to law enforcement and working with counsel. This is guidance, not legal representation.",
  },
];

export default function ConsultationPage() {
  return (
    <>
      <Container className="py-10">
        <PageHeader
          kicker="Services · Support"
          title="You're not alone in this."
          lede="Whether you were just scammed, you're helping someone who was, or you're securing a project before it's targeted — our volunteers can help. Free, confidential, and human."
        />

        {/* Safety note */}
        <div className="border-2 border-alert-strong bg-alert-strong/5 p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Tag tone="red">Read this first</Tag>
            <span className="kicker text-alert-strong">Your safety</span>
          </div>
          <p className="text-ink-700 max-w-3xl">
            We will <strong>never</strong> ask for your seed phrase, private keys, wallet passwords,
            or remote access to your device — and neither will any legitimate helper. Anyone
            promising guaranteed fund recovery for an up-front fee is running a second scam. Our help
            is <strong>free and confidential</strong>.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
          {/* Tracks */}
          <div>
            <SectionHeader title="Choose A Track" />
            <ul className="space-y-4">
              {TRACKS.map((t) => (
                <li key={t.topic} className="border border-line bg-paper p-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Tag tone={t.tone}>{t.label}</Tag>
                  </div>
                  <p className="text-ink-600 text-sm leading-snug">{t.blurb}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 border border-line bg-paper-2 p-5">
              <div className="kicker text-ink-600 mb-2">What happens next</div>
              <ol className="space-y-2 text-sm text-ink-600">
                {[
                  "You send this form — nothing you write is public.",
                  "A volunteer reviews it, usually within 24 hours.",
                  "We reply by email with concrete, no-cost next steps.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-display text-xl text-ink-400 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Intake form */}
          <div>
            <SectionHeader title="Request Help" />
            <div className="border-2 border-ink bg-paper p-6 sm:p-8">
              <ConsultationForm />
            </div>
          </div>
        </div>
      </Container>

      {/* Mission strip */}
      <div className="bg-ink text-paper py-6">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <span className="kicker text-btc">{SITE.mission}</span>
          <span className="mono text-[11px] uppercase tracking-wide text-ink-400">{SITE.disclaimer}</span>
        </Container>
      </div>
    </>
  );
}
