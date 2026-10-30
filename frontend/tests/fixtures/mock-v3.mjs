import http from "node:http";

const workshopId = "11111111-1111-4111-8111-111111111111";
const vinA = "JHMGK5830HX202404";
const vinB = "1HGCM82633A123456";
const vehicles = Array.from({ length: 51 }, (_, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  workshop_id: workshopId,
  vin: index % 2 === 0 ? vinA : vinB,
  plate: `STF-${String(index + 1).padStart(3, "0")}`,
  manufacturer: index % 2 === 0 ? "Honda" : "Toyota",
  model: index % 2 === 0 ? "Civic" : "Hiace",
  nickname: index === 0 ? "測試車輛" : null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
  secret_internal: "must-not-leak",
}));
const jwt = `${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.mock`;

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:4010");
  if (url.pathname === "/health" || url.pathname === "/v3/health") return send(res, 200, { status: "ok" });
  if (url.pathname === "/v3/auth/login" && req.method === "POST") {
    let body = ""; for await (const chunk of req) body += chunk;
    const fields = new URLSearchParams(body);
    return fields.get("username") === "manager" && fields.get("password") === "valid-password"
      ? send(res, 200, { access_token: jwt, token_type: "bearer" })
      : send(res, 400, { detail: "LOGIN_BAD_CREDENTIALS" });
  }
  if (url.pathname === "/v3/auth/logout" && req.method === "POST") { res.writeHead(204); return res.end(); }
  if (req.headers.authorization !== `Bearer ${jwt}`) return send(res, 401, { detail: "Unauthorized" });
  if (url.pathname === "/v3/users/me") return send(res, 200, { id: "22222222-2222-4222-8222-222222222222", username: "manager", email: null, display_name: "測試管理員", memberships: [{ workshop_id: workshopId, workshop_name: "測試工作坊", role: "manager" }] });
  if (url.pathname === `/v3/workshops/${workshopId}/vehicles`) {
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const offset = Number(url.searchParams.get("offset") || 0);
    const limit = Number(url.searchParams.get("limit") || 50);
    return send(res, 200, vehicles.filter((vehicle) => [vehicle.vin, vehicle.plate, vehicle.nickname].some((value) => value?.toLowerCase().includes(q))).slice(offset, offset + limit));
  }
  const vehicle = vehicles.find((entry) => url.pathname === `/v3/vehicles/${entry.id}`);
  if (vehicle) return send(res, 200, vehicle);
  return send(res, 404, { detail: "Not found" });
});

server.listen(4010, "127.0.0.1", () => process.stdout.write("mock-v3-ready\n"));
