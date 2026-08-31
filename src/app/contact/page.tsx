import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Mail } from "lucide-react";
import { BRAND_SHORT, BRAND_NAME } from "@/lib/brand";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: `Contact | ${BRAND_NAME}`,
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-display text-base font-semibold text-brand sm:text-lg">
              {BRAND_SHORT}
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-brand"
          >
            <ArrowLeft size={15} />
            Back home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <div className="overflow-hidden rounded-3xl bg-surface shadow-sm ring-1 ring-line">
            <div className="flex items-center justify-center gap-2.5 bg-brand px-6 py-5 text-white">
              <Mail size={20} />
              <h1 className="font-display text-xl font-semibold sm:text-2xl">
                Get in Touch
              </h1>
            </div>
            <div className="p-6 md:p-10">
              <p className="text-center text-sm text-ink-soft">
                Spotted a wrong answer, found a bug, or just want to say hello?
                Send a note below and it comes straight to my inbox - I read
                every message myself.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
