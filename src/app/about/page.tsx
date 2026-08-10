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
            A mom, a son, and one very stubborn abacus
          </h1>
        </div>

        <div className="mt-10 space-y-5 rounded-3xl bg-surface p-8 text-ink-soft shadow-sm ring-1 ring-line md:p-12">
          <p>
            Hi, I&apos;m <span className="font-semibold text-ink">Lashmi Bai Ravindrapandian</span> -
            mom to a wonderful 12-year-old boy who spends his evenings racing
            beads across an abacus. I built this site as a simple practice
            tool for him, something to keep his speed and accuracy sharp
            between his classes.
          </p>
          <p>
            Here&apos;s the part that still makes me smile: I am not a
            technical person. Not even a little bit. I had never built
            anything like this in my life. And yet, somehow, question by
            question and page by page, this whole portal came together. I
            genuinely could not believe what I was able to create for my
            son - there were so many &ldquo;wow, I actually did that?&rdquo;
            moments along the way that I lost count.
          </p>
          <p>
            What started as one mother&apos;s attempt to help her own child
            turned into something I wanted to share more widely. Abacus
            learning takes patience, repetition, and a lot of quiet practice
            - and not every family has an easy way to get that practice in.
            So this site is, and always will be,{" "}
            <span className="font-semibold text-ink">completely free</span> -
            my small way of giving back to every abacus kid out there, and
            every parent cheering them on the way I cheer for mine.
          </p>
          <p>
            More than anything, building this has been one of the best
            learning experiences of my life. If a non-technical mom trying
            to help her son can end up building something like this, I hope
            it&apos;s proof that it&apos;s never too late to learn something
            new - at any age, for any reason.
          </p>
          <p className="font-display italic text-ink">
            Thank you for practicing with us. I hope it helps your child the
            way it helps mine.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <AbacusIllustration className="h-20 w-20" />
          <p className="text-sm text-ink-soft">
            Curious what else I&apos;ve been building?
          </p>
          <a
            href="https://lrvirtualclassroom.co.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Visit My Portfolio
            <ExternalLink size={16} />
          </a>
        </div>
      </main>
    </div>
  );
}
