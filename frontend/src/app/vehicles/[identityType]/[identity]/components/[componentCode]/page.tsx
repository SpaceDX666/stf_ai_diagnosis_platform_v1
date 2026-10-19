import { notFound } from "next/navigation";
import { ComponentWorkspace } from "@/components/component-workspace";
import type { IdentityType } from "@/lib/domain";
export default async function ComponentPage({ params }: { params: Promise<{ identityType: string; identity: string; componentCode: string }> }) {
  const { identityType, identity, componentCode } = await params; if (identityType !== "plate" && identityType !== "vin") notFound();
  return <ComponentWorkspace identityType={identityType as IdentityType} identity={decodeURIComponent(identity)} componentCode={decodeURIComponent(componentCode)} />;
}
