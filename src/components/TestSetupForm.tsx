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
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
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
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                }`}
              >
                <div className="text-2xl">{op.icon}</div>
                <p className="mt-2 text-sm font-bold text-slate-900">{op.label}</p>
                <p className="mt-1 text-xs text-slate-500">{op.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          2. Digit Size
        </h3>
        {activeOperation.variants.length === 1 ? (
          <div className="rounded-2xl border-2 border-indigo-500 bg-indigo-50 p-4">
            <p className="text-sm font-bold text-slate-900">
              {activeOperation.variants[0].label}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Example: {activeOperation.variants[0].example}
            </p>
            <p className="mt-2 text-xs text-slate-400">
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
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900">{v.label}</p>
                  <p className="mt-1 text-xs text-slate-500">Example: {v.example}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex justify-center pb-4">
        <button
          onClick={handleCreateTest}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
        >
          Create Test
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
