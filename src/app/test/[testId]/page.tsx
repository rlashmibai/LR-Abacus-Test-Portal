import TestRunner from "@/components/TestRunner";

export default async function TestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  return <TestRunner testId={testId} />;
}
