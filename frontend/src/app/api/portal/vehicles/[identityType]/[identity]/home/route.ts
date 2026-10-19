import type { IdentityType } from "@/lib/domain";
import { PortalError } from "@/server/errors";
import { portalError, portalJson } from "@/server/http";
import { vehicleHome } from "@/server/portal-data";
import { rateLimit } from "@/server/rate-limit";

export async function GET(request: Request, context: { params: Promise<{ identityType: string; identity: string }> }) {
  const limited = rateLimit(request); if (limited) return limited;
  try {
    const { identityType, identity } = await context.params;
    if (identityType !== "plate" && identityType !== "vin") throw new PortalError(404, "ROUTE_NOT_FOUND", "Route not found");
    return portalJson(await vehicleHome(identityType as IdentityType, decodeURIComponent(identity)));
  } catch (error) { return portalError(error); }
}
