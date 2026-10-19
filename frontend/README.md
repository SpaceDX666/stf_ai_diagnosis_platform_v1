# Towngas 車輛健康門戶

移動優先的公開匿名、只讀車輛門戶。瀏覽器只存取本門戶 `/api/*`；Next.js BFF 從同一台 Windows 主機上的 `vehicle_data_twin` 讀取資料、驗證最小契約並以白名單模型回傳。產品運行時不呼叫 STF V3，也不使用 `/v1` 或 `/v2`。

## 當前資料邊界

- 車牌是必填主資料，但不是 V3 車輛身份。
- VIN 遵循 V3 的 17 位規則，是正式業務身份。當來源平台尚無 VIN 時，門戶顯示 ASCII `-` 和「資料來源尚未提供」，並暫時以 `/vehicles/plate/{plate}` 尋址。
- `vehicle_data_twin` 未來提供有效 `vin` 後，目錄會改用 `/vehicles/vin/{vin}`；舊車牌頁讀取資料後會自動切換至 VIN URL。
- 維修、事件、BOM、覆蓋率、生命周期與部件詳情來自車輛平台。BFF 不回傳 `source_xlsx`、`profile_json`、`payload_json`、證據檔案、復核清單或構建資訊。
- V3 日誌、診斷、conversation、報告與手冊是已凍結契約的未來邊界，本期不發運行時請求。
- 本期沒有登入、註冊、重設密碼、四字段驗證、上傳日誌或一鍵診斷功能；舊路徑均為 404。

## 已接受的公開資料風險

本版本按產品決策允許公網匿名存取。VIN 一旦由上游提供，會在頁面、URL 和門戶 JSON 響應中完整公開。`robots: noindex, nofollow` 只表達搜尋引擎偏好，不是存取控制；任何能連到門戶的人都可能讀取已發布的車輛資料。恢復用戶級認證與細粒度授權屬後續版本。

## 本地開發

需要 Node.js 24、npm 11，以及已構建資料的 `E:\vehicle_data_twin`。

第一個終端啟動只讀車輛平台：

```powershell
Set-Location -LiteralPath 'E:\vehicle_data_twin'
node .\src\server.mjs --no-open
```

第二個終端啟動門戶：

```powershell
Set-Location -LiteralPath 'E:\stf_ai_diagnosis_platform_v3\frontend'
Copy-Item -LiteralPath '.env.example' -Destination '.env.local'
npm ci
npm run dev
```

開啟 `http://127.0.0.1:3001`。

| 變數 | 用途 |
| --- | --- |
| `VEHICLE_TWIN_API_BASE_URL` | 車輛平台只讀 API；預設 `http://127.0.0.1:4173` |
| `PORTAL_PUBLIC_ORIGIN` | 門戶公開 Origin；用於語言偏好 POST 的同源檢查 |
| `PORT` | 生產服務端口；預設 `3001` |
| `STF_V3_API_BASE_URL` | 只供可選 V3 OpenAPI live smoke；產品運行時不讀取 |

## 驗證

```powershell
npm run typecheck
npm run lint
npm run test
npm run test:contract
npm run build
npx playwright install chromium
npm run test:e2e
# 在 production 服務已運行於 127.0.0.1:3001 時執行
npm run lighthouse:portal
```

`tests/contract/openapi.test.ts` 必定讀取本倉庫 `docs/api/v3_openapi.json`，凍結車輛、日誌、診斷、conversation、SSE、report 與 manuals 邊界。若設定 `E2E_LIVE=1` 和 `STF_V3_API_BASE_URL`，測試只讀取 `/v3/openapi.json`，不存取受保護業務資料。

Playwright 使用本地 mock 車輛平台，覆蓋 360×800、390×844、768×1024、1280×800 和 1672×941；包括匿名目錄搜尋、VIN 身份切換、動態 BOM、部件詳情、舊路徑 404、axe、manifest、service worker、離線頁及視覺基線。人工確認視覺變更後使用 `npm run test:e2e:update` 更新基線。

Lighthouse 固定為 13.5.0，執行目前保留的 accessibility、best-practices 與 SEO 分類並將報告寫入被忽略的 `lighthouse-report.json`。Lighthouse 13 已移除舊 PWA 分類，因此可安裝 manifest、service worker 控制、離線導航與已清洗 API 離線快取由上面的 Playwright PWA 用例作為硬性驗收，不把不存在的 Lighthouse 分類宣稱為已通過。

## PWA 與離線資料

- 靜態資源 cache-first。
- 只有 `/api/portal/*` 的成功、已清洗 GET 響應會以 network-first 存入獨立快取。
- 斷網命中快取時，service worker 增加離線標記與快取時間；頁面會明確顯示離線橫幅，不把舊資料冒充即時資料。
- POST、健康檢查、車輛平台原始響應和內部證據從不加入資料快取。

## 生產部署（Windows 同機直跑）

1. 讓 `vehicle_data_twin` 繼續只監聽 `127.0.0.1:4173`。
2. 在 `frontend` 執行 `npm ci && npm run build`。
3. 以 `npm run start` 啟動門戶；它只監聽 `127.0.0.1:3001`。
4. 反向代理只公開 3001 門戶，不得代理或暴露 4173。
5. `GET /api/health` 同時檢查車輛平台；上游不可用時返回 503。

上線前先停止任何佔用 3001 的舊 `obd-ui`。回滾時停止新門戶並重新啟動已記錄版本的舊服務；本門戶不執行資料庫遷移，也不修改 `stf_v3`、`infra` 或 `vehicle_data_twin`。

Dockerfile 會以 `PORTAL_STANDALONE=1` 產生 standalone 映像；一般 Windows `npm run build` 使用標準 `.next` 輸出。`scripts/next-build.cjs` 只在 Node 24/Windows 把「對非符號連結文件／目錄呼叫 `readlink`」的 `EISDIR` 正規化為 Next 15 內置追蹤器原本處理的 `EINVAL`，不改寫依賴或真正的符號連結。本期批准的部署拓撲仍是 Windows 同機直跑，以確保只綁定環回地址的車輛平台不被容器網絡或公網暴露。

## 安全與限制

- 匿名門戶 GET 按客戶端 IP 採用單實例令牌桶，預設每分鐘 120 次。多實例部署必須在反向代理或共享儲存增加統一限流。
- 上游一般請求超時 8 秒；健康檢查超時 2 秒。
- CSP、`X-Frame-Options: DENY`、`nosniff`、`Referrer-Policy: no-referrer` 和 `X-Robots-Tag` 由 Next.js 統一設定。
- `ready`、`empty`、`pendingSource`、`deferred` 與 `error` 是不同狀態。只有來源尚無 VIN 才顯示 `-`；網絡或契約錯誤顯示錯誤編號和重試。
- 生命周期／風險區間只作描述性呈現，不代表概率、預測或安全結論；歷史故障事件不會被稱作「目前故障」。
