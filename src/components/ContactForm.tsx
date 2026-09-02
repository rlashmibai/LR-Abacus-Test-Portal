"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/rlashmibai@gmail.com";

/** Posts straight to FormSubmit's AJAX endpoint - a free third-party
 * form-relay service, no backend of our own involved. It emails the
 * submission to the address in the URL above. The first submission to
 * a given address needs a one-time confirmation click from that inbox
 * before FormSubmit starts forwarding messages.
 *
 * Sent as application/x-www-form-urlencoded (not JSON) deliberately -
 * that's a CORS "simple request", so the browser sends it directly with
 * no preflight OPTIONS round-trip first. A JSON body forces a preflight,
 * and if FormSubmit's preflight handling ever hiccups the whole
 * submission silently never leaves the browser, even though a plain
 * server-to-server request (curl, no preflight involved) looks fine. */
export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot - real users never see or fill this field.
    if (data.get("_honey")) {
      setStatus("success");
      return;
    }

    const name = data.get("name")?.toString() ?? "";
    const email = data.get("email")?.toString() ?? "";
    const message = data.get("message")?.toString() ?? "";

    const params = new URLSearchParams({
      name,
      email,
      message,
      _subject: `LR Abacus Practice Test: feedback from ${name}`,
    });

    try {
      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      });
      if (!res.ok) throw new Error("submit failed");
      setStatus("success");
      form.reset();
    } catch (err) {
      console.error("Contact form submission failed:", err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 size={40} className="text-good" />
        <p className="font-display text-lg font-semibold text-ink">Message sent!</p>
        <p className="text-sm text-ink-soft">
          Thanks for writing in - I read every message myself and will get
          back to you if you left an email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your Name">
          <input
            required
            name="name"
            placeholder="Your name"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
        </Field>
        <Field label="Your Email">
          <input
            required
            type="email"
            name="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
        </Field>
      </div>

      <Field label="Message">
        <textarea
          required
          name="message"
          rows={5}
          placeholder="What's on your mind? A bug, a suggestion, or just a hello..."
          className="w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
        />
      </Field>

      {status === "error" && (
        <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
          Something went wrong sending that. Please try again in a moment.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={16} />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}
