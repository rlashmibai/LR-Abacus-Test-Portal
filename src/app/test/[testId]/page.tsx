import { requireSessionOrRedirect } from "@/lib/auth";
import TestRunner from "@/components/TestRunner";

export default async function TestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  await requireSessionOrRedirect();
  const { testId } = await params;
  return <TestRunner testId={testId} />;
}
