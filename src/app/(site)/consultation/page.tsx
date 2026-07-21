import type { Metadata } from "next";
import { ConsultationForm } from "./_components/ConsultationForm";

export const metadata: Metadata = {
  title: "Scam Consultation | BTCSCAM.COM",
  description:
    "Ask before you send. Free community-desk answers or a private expert session — scam-or-fame analysis before it costs anything.",
};

export default function ConsultationPage() {
  return (
    <div className="mx-auto w-full max-w-[980px] px-6 pt-9 fade-up">
      <div className="kicker text-meta">Scam consultation — live or by email</div>
      <h1
        className="mt-2 font-display text-ink"
        style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.1, textWrap: "balance" }}
      >
        Ask before you send.
      </h1>
      <p
        className="mt-3 max-w-[62ch] text-[18px] leading-[1.65] text-body-2"
        style={{ textWrap: "pretty" }}
      >
        Getting involved with a new crypto project — or already in one that feels off? A BTC scam
        expert tears it down with you: scam-or-fame analysis before it costs anything.
      </p>

      <ConsultationForm />
      <div className="h-4" />
    </div>
  );
}
