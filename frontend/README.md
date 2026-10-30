# STF V3 前端

Next.js 15 工作坊前端，首階段提供現有 V3 帳號登入，以及所屬工作坊和車輛基本檔案的唯讀查閱。手機與電腦使用同一個響應式網頁。邀請碼註冊、建車、日誌、診斷直播及報告留待後續階段。

## 運行邊界

- 瀏覽器只連同源 Next.js 頁面與 `/api/auth/*`、`/api/portal/*`；不連 `127.0.0.1`、V3 API 或資料庫。Next.js BFF 使用服務端的 `STF_V3_API_BASE_URL` 連 V3 API。
- BFF 使用 `POST /v3/auth/login`、`POST /v3/auth/logout`、`GET /v3/users/me`、`GET /v3/workshops/{id}/vehicles` 和 `GET /v3/vehicles/{id}`。JWT 只存在 HttpOnly、SameSite=Strict Cookie；每次受保護請求以 `/v3/users/me` 驗證身份，回傳資料按白名單映射且不緩存。
- `/` 顯示工作坊；`/workshops/{id}` 按 VIN、車牌或暱稱搜尋及分頁；`/vehicles/{id}` 顯示基本車檔。舊車牌/VIN 深鏈只回工作坊入口，不自行配對 V3 車檔。
- Service Worker 只快取靜態資源和離線提示，`/api/auth/*`、`/api/portal/*` 永遠從網絡取資料；離線時不展示先前的車檔。

## 本地開發與驗證

需要 Node.js 24、npm 11 和可用的 V3 API。從本目錄執行：

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

開啟 `http://127.0.0.1:3001`。本地 `OBD Expert.cmd` 仍可作為開發輔助啟動 V3 API 和前端；正式使用者只訪問 PolyU 服務器網站。

| 變數 | 用途 |
| --- | --- |
| `STF_V3_API_BASE_URL` | 只供 Next.js 服務端訪問的 V3 API；本地示例 `http://127.0.0.1:8002` |
| `PORTAL_PUBLIC_ORIGIN` | 公開網頁 Origin；生產值為 `https://stf-diagnosis.dev`，用於登入/登出的同源檢查 |
| `PORT` | 本地預設 3001；PolyU V3 Compose 設為 3002 |

```powershell
npm run typecheck
npm run lint
npm run test
npm run test:contract
npm run build
npx playwright install chromium
npm run test:e2e
```

E2E 使用本地模擬 V3 API，不需要真實帳號或連外網。`docs/api/v3_openapi.json` 是本倉庫凍結的接口契約。

## PolyU 部署

正式服務由 `infra/docker-compose.v3.yml` 加 `infra/docker-compose.v3.polyu.yml` 啟動 `stf-v3-frontend`。容器以 host network 只監聽 `127.0.0.1:3002`，Nginx 將 `https://stf-diagnosis.dev/` 轉發到前端；`/v3/` 仍轉發到現有 V3 API。前端映像的 OCI revision label 記錄構建提交。部署、健康檢查、分支驗收與回滾步驟見 `docs/v3_ops_runbook.md`。正式運行不需要 `vehicle_data_twin` 或任何員工電腦上的本地服務。
