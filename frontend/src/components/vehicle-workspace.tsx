"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, ChevronRight, Clock3, Database, Gauge, Menu, ShieldCheck, Wrench } from "lucide-react";
import { BomTree } from "@/components/bom-tree";
import { CoverageView } from "@/components/coverage-view";
import { DataStateView } from "@/components/data-state-view";
import { useLocale } from "@/components/locale-provider";
import { OfflineBanner } from "@/components/offline-banner";
import { IntervalView } from "@/components/interval-view";
import { Sheet } from "@/components/ui/sheet";
import { PortalApiError, portalFetch } from "@/lib/api-client";
import type { IdentityType, PortalEvent, VehicleHome } from "@/lib/domain";

export function VehicleWorkspace({ identityType, identity }: { identityType: IdentityType; identity: string }) {
  const { messages, locale } = useLocale(); const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false); const scope = params.get("scope");
  const query = useQuery({ queryKey: ["vehicle-home", identityType, identity], queryFn: () => portalFetch<VehicleHome>(`/api/portal/vehicles/${identityType}/${encodeURIComponent(identity)}/home`) });
  const home = query.data?.data;
  useEffect(() => { if (home && pathname !== home.vehicle.canonicalPath) router.replace(`${home.vehicle.canonicalPath}${scope ? `?scope=${encodeURIComponent(scope)}` : ""}`); }, [home, pathname, router, scope]);
  const setScope = (next: string | null) => { router.replace(next ? `${pathname}?scope=${encodeURIComponent(next)}` : pathname, { scroll: false }); setSheetOpen(false); };
  const selectedNode = home?.bom.kind === "ready" ? home.bom.value.find((node) => node.code === scope) ?? null : null;
  const filteredEvents = useMemo(() => home?.events.kind === "ready" ? home.events.value.filter((event) => !scope || event.componentCode === scope || event.systemCode === scope) : [], [home, scope]);
  if (query.isLoading) return <main className="loading-page">{messages.common.loading}</main>;
  if (query.isError || !home) return <main className="error-page"><AlertTriangle /><h1>{messages.common.error}</h1><p>{query.error?.message}{query.error instanceof PortalApiError && query.error.errorId ? ` · ${messages.common.errorId}: ${query.error.errorId}` : ""}</p><button className="button" onClick={() => void query.refetch()}>{messages.common.retry}</button></main>;
  const tree = home.bom.kind === "ready" ? <BomTree nodes={home.bom.value} selected={scope} onSelect={setScope} /> : <DataStateView state={home.bom} render={() => null} onRetry={() => void query.refetch()} />;
  return <main className="vehicle-page">{query.data?.offline && <OfflineBanner cachedAt={query.data.cachedAt} />}
    <div className="crumb"><Link href="/"><ArrowLeft />{messages.nav.vehicles}</Link><ChevronRight /><span>{home.vehicle.plate}</span></div>
    <section className="vehicle-hero"><div><span className="plate large">{home.vehicle.plate}</span><h1>{home.vehicle.manufacturer} {home.vehicle.model}</h1><p>{home.vehicle.vehicleClass ?? "-"} · {home.vehicle.fuelType ?? "-"} · {home.vehicle.department ?? "-"}</p></div><div className="identity-card"><span>{messages.common.vin}</span><strong>{home.vehicle.vin ?? "-"}</strong>{!home.vehicle.vin && <small>{messages.vehicle.noVin}</small>}</div></section>
    <button className="tree-mobile-trigger button secondary" onClick={() => setSheetOpen(true)}><Menu />{messages.nav.openTree}</button>
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen} title={messages.vehicle.bom}>{tree}</Sheet>
    <div className="vehicle-layout"><aside className="bom-sidebar"><div className="section-heading"><span>{messages.vehicle.bom}</span><small>{home.bom.kind === "ready" ? home.bom.value.length : "-"}</small></div>{tree}</aside>
      <div className="vehicle-content"><section className="profile-grid"><Info icon={<ShieldCheck />} label={messages.common.vin} value={home.vehicle.vin} pending={!home.vehicle.vin} /><Info icon={<Database />} label={messages.common.plate} value={home.vehicle.plate} /><Info icon={<Wrench />} label={messages.common.manufacturer} value={home.vehicle.manufacturer} /><Info icon={<Gauge />} label={messages.common.model} value={home.vehicle.model} /></section>
        {selectedNode && <section className="scope-bar"><div><small>{messages.vehicle.component}</small><strong>{selectedNode.nameZh}</strong><span>{selectedNode.code}</span></div><Link className="button" href={`${home.vehicle.canonicalPath}/components/${encodeURIComponent(selectedNode.code)}?returnScope=${encodeURIComponent(selectedNode.code)}`}>{messages.component.title}<ChevronRight /></Link></section>}
        <section className="panel"><PanelTitle icon={<Clock3 />} title={messages.vehicle.recentEvents} note={messages.vehicle.historical} /><DataStateView state={home.events.kind === "ready" && scope ? (filteredEvents.length ? { kind: "ready", value: filteredEvents } : { kind: "empty" }) : home.events} onRetry={() => void query.refetch()} render={(events) => <EventList events={events.slice(0, 12)} locale={locale} />} /></section>
        <div className="two-column"><section className="panel"><PanelTitle icon={<Database />} title={messages.vehicle.coverage} /><DataStateView state={home.coverage} onRetry={() => void query.refetch()} render={(coverage) => <CoverageView windows={coverage.windows} gaps={coverage.gaps} />} /></section><section className="panel"><PanelTitle icon={<Gauge />} title={messages.vehicle.readiness} /><DataStateView state={home.readiness} onRetry={() => void query.refetch()} render={(item) => <div className="metric-grid"><Metric label={messages.vehicle.instances} value={item.instances} /><Metric label={messages.vehicle.observedFailures} value={item.observedFailures} /><Metric label={messages.vehicle.leftTruncated} value={item.leftTruncated} /><Metric label={messages.vehicle.excluded} value={item.excluded} /></div>} /></section></div>
        <section className="panel"><PanelTitle icon={<Gauge />} title={messages.vehicle.intervals} /><DataStateView state={home.survivalIntervals} onRetry={() => void query.refetch()} render={(item) => <IntervalView time={item.time} mileage={item.mileage} />} /></section>
        <section className="v3-boundary"><div><span>{messages.vehicle.v3Boundary}</span><h2>{messages.common.deferred}</h2><p>{messages.vehicle.v3Note}</p></div><div className="boundary-items"><span>logs —</span><span>diagnosis —</span><span>report —</span><span>manuals —</span></div></section>
      </div></div>
  </main>;
}
function Info({ icon, label, value, pending }: { icon: React.ReactNode; label: string; value: string | null; pending?: boolean }) { const { messages } = useLocale(); return <div className="info-card"><span>{icon}</span><div><small>{label}</small><strong aria-label={pending ? messages.common.pending : undefined}>{value ?? "-"}</strong></div></div>; }
function PanelTitle({ icon, title, note }: { icon: React.ReactNode; title: string; note?: string }) { return <div className="panel-title"><span>{icon}</span><div><h2>{title}</h2>{note && <p>{note}</p>}</div></div>; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="metric"><strong>{value}</strong><span>{label}</span></div>; }
function EventList({ events, locale }: { events: PortalEvent[]; locale: string }) { return <div className="event-list">{events.map((event) => { const occurred = event.occurredAt ?? event.occurredAtUpperBound; return <article key={event.id}><div className={`event-mark ${event.type}`} /><div><div className="event-head"><strong>{event.descriptionZh ?? event.subtype ?? event.type}</strong><span>{occurred ? new Date(occurred).toLocaleDateString(locale) : "-"}</span></div><p>{event.type}{event.componentCode ? ` · ${event.componentCode}` : ""}{event.orderNo ? ` · ${event.orderNo}` : ""}</p></div></article>; })}</div>; }
