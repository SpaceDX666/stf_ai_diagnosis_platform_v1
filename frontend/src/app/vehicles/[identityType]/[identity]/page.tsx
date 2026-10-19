import { notFound } from "next/navigation";
import { VehicleWorkspace } from "@/components/vehicle-workspace";
import type { IdentityType } from "@/lib/domain";
export default async function VehiclePage({ params }: { params: Promise<{ identityType: string; identity: string }> }) {
  const { identityType, identity } = await params; if (identityType !== "plate" && identityType !== "vin") notFound();
  return <VehicleWorkspace identityType={identityType as IdentityType} identity={decodeURIComponent(identity)} />;
}
