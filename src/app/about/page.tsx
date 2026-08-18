import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Heart, ExternalLink, ArrowLeft } from "lucide-react";
import { BRAND_SHORT, BRAND_NAME } from "@/lib/brand";
import AbacusIllustration from "@/components/AbacusIllustration";

export const metadata: Metadata = {
  title: `About Me | ${BRAND_NAME}`,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-8">
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

      <main className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <div className="text-center">
          {/* Photo of the site's creator. Drop the file at
              public/images/lashmi.jpg to have it appear here. */}
          <Image
            src="/images/lashmi.jpg"
            alt="Lashmi Bai Ravindrapandian"
            width={160}
            height={160}
            className="mx-auto rounded-full object-cover shadow-md ring-4 ring-brand-soft"
          />
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-ink">
            <Heart size={13} />
            WHY I BUILT THIS
          </span>
          <h1 className="mt-4 text-balance font-display text-3xl font-semibold text-ink md:text-4xl">
            A &ldquo;Non-Developer&rdquo; Mom, A Loving Son and one very
            stubborn Abacus
          </h1>
        </div>

        <div className="mt-10 space-y-5 rounded-3xl bg-surface p-8 text-ink-soft shadow-sm ring-1 ring-line md:p-12">
          <p>
            I&apos;m <span className="font-semibold text-ink">Lashmi Bai Ravindrapandian</span>,
            a mom to a wonderful teen who loves racing through beads on his
            abacus.
          </p>
          <p>
            I originally built this site simply to give him a little extra
            practice between his classes - a place where he could work on
            speed and accuracy whenever he had a few quiet minutes.
          </p>
          <p>
            I&apos;m not a developer, and I never imagined I would
            build something like this myself. But little by little, question
            by question and page by page, the site came together. Along the
            way, there were plenty of moments when I stopped and thought,
            &ldquo;I actually made this!&rdquo;
          </p>
          <p>That experience made me want to share it.</p>
          <p>
            Abacus learning takes patience, repetition, and regular
            practice, and I know how much encouragement goes into that from
            parents and teachers. So I decided to keep this site{" "}
            <span className="font-semibold text-ink">completely free</span>,
            in the hope that it can give other children a simple place to
            practice too.
          </p>
          <p>
            Building it has been one of the most unexpected and rewarding
            learning experiences of my life. It reminded me that learning
            something new doesn&apos;t have to be limited by age or
            background.
          </p>
          <p className="font-display italic text-ink">
            Thank you for practicing with us. I hope this little site helps
            your child as much as it has helped mine.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <AbacusIllustration className="h-20 w-20" />
          <p className="text-sm text-ink-soft">
            Curious what else I&apos;ve been building?
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://lrvirtualclassroom.co.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Visit My Portfolio
              <ExternalLink size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/lashmibairavindrapandian/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3.5 text-sm font-semibold text-ink-soft transition hover:bg-paper hover:text-brand"
            >
              Connect on LinkedIn
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
