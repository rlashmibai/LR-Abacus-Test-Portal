"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { OPERATIONS, getOperation } from "@/lib/testTypes";

export default function TestSetupForm() {
  const router = useRouter();
  const [operation, setOperation] = useState(OPERATIONS[0].value);
  const [variant, setVariant] = useState(OPERATIONS[0].variants[0].value);

  const activeOperation = getOperation(operation);

  function selectOperation(op: string) {
    setOperation(op as typeof operation);
    const def = getOperation(op);
    setVariant(def.variants[0].value);
  }

  function handleCreateTest() {
    const params = new URLSearchParams({ operation, variant });
    router.push(`/instructions?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          1. Operation
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {OPERATIONS.map((op) => {
            const active = op.value === operation;
            return (
              <button
                key={op.value}
                onClick={() => selectOperation(op.value)}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  active
                    ? "border-brand bg-brand-soft"
                    : "border-line hover:border-brand/40 hover:bg-paper"
                }`}
              >
                <div className="text-2xl">{op.icon}</div>
                <p className="mt-2 text-sm font-bold text-ink">{op.label}</p>
                <p className="mt-1 text-xs text-ink-soft">{op.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          2. Digit Size
        </h3>
        {activeOperation.variants.length === 1 ? (
          <div className="rounded-2xl border-2 border-brand bg-brand-soft p-4">
            <p className="text-sm font-bold text-ink">
              {activeOperation.variants[0].label}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Example: {activeOperation.variants[0].example}
            </p>
            <p className="mt-2 text-xs text-ink-faint">
              This is the only digit size available for {activeOperation.label.toLowerCase()}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activeOperation.variants.map((v) => {
              const active = v.value === variant;
              return (
                <button
                  key={v.value}
                  onClick={() => setVariant(v.value)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    active
                      ? "border-brand bg-brand-soft"
                      : "border-line hover:border-brand/40 hover:bg-paper"
                  }`}
                >
                  <p className="text-sm font-bold text-ink">{v.label}</p>
                  <p className="mt-1 text-xs text-ink-soft">Example: {v.example}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex justify-center pb-4">
        <button
          onClick={handleCreateTest}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Create Test
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
