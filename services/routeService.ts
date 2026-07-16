import type { RouteStop, RouteStopInput } from '@/types';

// INTENTIONALLY MOCK — no route/stop-editing backend exists yet. VanRepository/
// VanController in vanmosapi-1 model vans, not per-driver editable route
// stops, and there is no endpoint like POST /api/rotas or similar. Left on
// in-memory mock data on purpose; not an oversight from the API-wiring pass.
// Keep the listRouteStops/addRouteStop signatures stable so app/edit-route.tsx
// doesn't need changes once a real endpoint exists.
let stops: RouteStop[] = [];

export async function listRouteStops(): Promise<RouteStop[]> {
  return stops;
}

export async function addRouteStop(input: RouteStopInput): Promise<RouteStop> {
  const stop: RouteStop = { id: Date.now().toString(), ...input };
  stops = [...stops, stop];
  return stop;
}
