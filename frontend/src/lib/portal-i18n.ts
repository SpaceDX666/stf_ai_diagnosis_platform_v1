import type { Locale } from "@/lib/domain";

const zhHK = {
  brand: "車輛健康門戶", publicPortal: "公開只讀資料", traditional: "繁體中文", simplified: "简体中文",
  nav: { vehicles: "車輛目錄", openTree: "開啟部件樹", closeTree: "關閉部件樹", back: "返回", home: "首頁" },
  common: { search: "搜尋", retry: "重試", loading: "正在載入…", noRecords: "暫無記錄", error: "資料暫時無法載入", errorId: "錯誤編號", pending: "資料來源尚未提供", deferred: "本期暫不接入 V3", offline: "目前離線，顯示最近一次已清洗資料", cachedAt: "離線資料時間", plate: "車牌", vin: "VIN", manufacturer: "品牌", model: "型號", unknown: "-", records: "筆", view: "查看車輛", wholeVehicle: "整車", days: "日", language: "語言" },
  directory: { eyebrow: "Fleet intelligence", title: "車輛資料，一目了然", subtitle: "以車牌、品牌或型號搜尋。車牌為必填主資料；VIN 一旦由來源平台提供，即成為正式車輛身份。", placeholder: "搜尋車牌、品牌、型號或部門", allVehicles: "車輛", orders: "維修工單", events: "事件", components: "部件實例", result: "搜尋結果", empty: "找不到符合條件的車輛", class: "車輛類別", fuel: "燃料", department: "部門", maintenance: "維修", quality: "資料提示" },
  vehicle: { overview: "車輛概覽", profile: "車輛資料", bom: "動態 BOM", recentEvents: "最近維修／故障事件", coverage: "資料覆蓋", readiness: "生存分析準備度", intervals: "生命周期區間", noVin: "上游車輛平台尚未提供 VIN；目前只以車牌作臨時尋址。", historical: "以下為歷史事件，不代表目前仍有故障。", windows: "觀測窗口", gaps: "資料缺口", instances: "部件實例", observedFailures: "觀測故障", excluded: "已排除", leftTruncated: "左截斷", timeAxis: "時間區間", mileageAxis: "里程區間", observedEvent: "已觀測事件", censored: "截尾", v3Boundary: "V3 邊界", v3Note: "日誌、診斷、報告和手冊保留為未來 V3 接入邊界，本期不發出運行時請求。", eventType: "事件類型", occurredAt: "發生時間", odometer: "里程", component: "部件", order: "工單" },
  component: { title: "部件詳情", summary: "資料摘要", events: "相關事件", orders: "維修工單", parts: "零件", instances: "部件實例", transitions: "生命周期轉移", intervals: "時間／里程區間", coverage: "資料覆蓋", quality: "品質提示", generation: "代次", state: "狀態", installed: "安裝／首次觀測", removed: "拆除", quantity: "數量", severity: "嚴重程度" },
  summaryMetrics: { events: "事件", faults: "故障事件", actions: "維修動作", partEvents: "零件更換", orders: "工單", parts: "零件", instances: "實例", transitions: "轉移", intervals: "區間", qualityIssues: "品質提示" },
  offlinePage: { title: "目前離線", body: "請檢查網絡連線。已瀏覽的只讀車輛資料仍可從本機快取開啟。", back: "返回車輛目錄" },
  notFound: { title: "找不到頁面", back: "返回門戶" },
} as const;

type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };
const zhCN: DeepStrings<typeof zhHK> = {
  brand: "车辆健康门户", publicPortal: "公开只读数据", traditional: "繁體中文", simplified: "简体中文",
  nav: { vehicles: "车辆目录", openTree: "打开部件树", closeTree: "关闭部件树", back: "返回", home: "首页" },
  common: { search: "搜索", retry: "重试", loading: "正在加载…", noRecords: "暂无记录", error: "数据暂时无法加载", errorId: "错误编号", pending: "数据源尚未提供", deferred: "本期暂不接入 V3", offline: "当前离线，显示最近一次已清洗数据", cachedAt: "离线数据时间", plate: "车牌", vin: "VIN", manufacturer: "品牌", model: "型号", unknown: "-", records: "条", view: "查看车辆", wholeVehicle: "整车", days: "日", language: "语言" },
  directory: { eyebrow: "Fleet intelligence", title: "车辆数据，一目了然", subtitle: "按车牌、品牌或型号搜索。车牌为必填主数据；VIN 一旦由来源平台提供，即成为正式车辆身份。", placeholder: "搜索车牌、品牌、型号或部门", allVehicles: "车辆", orders: "维修工单", events: "事件", components: "部件实例", result: "搜索结果", empty: "找不到符合条件的车辆", class: "车辆类别", fuel: "燃料", department: "部门", maintenance: "维修", quality: "数据提示" },
  vehicle: { overview: "车辆概览", profile: "车辆数据", bom: "动态 BOM", recentEvents: "最近维修／故障事件", coverage: "数据覆盖", readiness: "生存分析准备度", intervals: "生命周期区间", noVin: "上游车辆平台尚未提供 VIN；目前仅以车牌临时寻址。", historical: "以下为历史事件，不代表当前仍有故障。", windows: "观测窗口", gaps: "数据缺口", instances: "部件实例", observedFailures: "观测故障", excluded: "已排除", leftTruncated: "左截断", timeAxis: "时间区间", mileageAxis: "里程区间", observedEvent: "已观测事件", censored: "截尾", v3Boundary: "V3 边界", v3Note: "日志、诊断、报告和手册保留为未来 V3 接入边界，本期不发出运行时请求。", eventType: "事件类型", occurredAt: "发生时间", odometer: "里程", component: "部件", order: "工单" },
  component: { title: "部件详情", summary: "数据摘要", events: "相关事件", orders: "维修工单", parts: "零件", instances: "部件实例", transitions: "生命周期转移", intervals: "时间／里程区间", coverage: "数据覆盖", quality: "质量提示", generation: "代次", state: "状态", installed: "安装／首次观测", removed: "拆除", quantity: "数量", severity: "严重程度" },
  summaryMetrics: { events: "事件", faults: "故障事件", actions: "维修动作", partEvents: "零件更换", orders: "工单", parts: "零件", instances: "实例", transitions: "转移", intervals: "区间", qualityIssues: "质量提示" },
  offlinePage: { title: "当前离线", body: "请检查网络连接。已浏览的只读车辆数据仍可从本机缓存打开。", back: "返回车辆目录" },
  notFound: { title: "找不到页面", back: "返回门户" },
};

export type Dictionary = DeepStrings<typeof zhHK>;
export const dictionaries: Record<Locale, Dictionary> = { "zh-HK": zhHK, "zh-CN": zhCN };
export function isLocale(value: unknown): value is Locale { return value === "zh-HK" || value === "zh-CN"; }
