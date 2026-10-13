import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import App from "./app";
import "./index.css";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  // 动态导入失败（Failed to fetch dynamically imported module）通常是 PWA 缓存了旧版主包、
  // 它引用的旧 hash chunk 已被新版本替换删除。此时单纯 reset 会再次加载同一不存在的 chunk 陷入死循环；
  // 必须注销 SW、清空所有缓存后强制刷新，让浏览器拉取最新版本。
  const handleReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const k of keys) await caches.delete(k);
      }
    } catch {
      // 忽略清理异常，直接刷新
    }
    // 绕过缓存强制重载
    window.location.reload();
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050914] p-6">
      <div className="max-w-md w-full glass-card rounded-xl p-6 text-center">
        <h2 className="text-lg font-bold text-rose-400 mb-2 font-tech">系统异常</h2>
        <p className="text-sm text-muted-foreground mb-4 font-mono-data break-all">
          {errorMessage}
        </p>
        <button
          onClick={handleReload}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
        >
          重新加载（自动清缓存）
        </button>
      </div>
    </div>
  );
}

// ---------- 手机端「打开即更新」 ----------
// 线上 registerSW.js 只注册了 Service Worker，没有「发现新版就刷新」的逻辑，
// 导致新版本已装上、但当前页面仍在跑旧代码，用户以为「更新失败」去清数据（连带删掉做题数据）。
// 这里补上两件事：
//   ① 新 SW 接管（controllerchange）后自动刷新一次。
//      仅当「之前已有 SW 在控制页面」时才刷新 —— 首次安装也会触发 controllerchange，此时刷新会白屏。
//   ② 主动调用 registration.update()。
//      浏览器对 Service Worker 的更新检查**只在导航时**触发：所以「按 Home 键切后台、再点图标切回」
//      这类没有发生导航的操作，永远不会发现新版本（已实测复现：切回后仍停在旧主包）。
//      改为在启动、回到前台、网络恢复、以及页面常驻期间定时各主动查一次。
// 刷新不会丢做题数据：答题记录与刷题进度都存在 localStorage（useQuizProgress），刷新后回到同一题，
// 仅丢失「当前题尚未提交的勾选」。
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });

  // ---- 主动检查更新 ----
  const UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 页面常驻时的定时检查
  const UPDATE_MIN_GAP_MS = 30 * 1000; // 两次检查最小间隔，避免频繁切前后台造成抖动
  let lastCheckAt = 0;
  let checking = false;

  const checkForUpdate = async (): Promise<void> => {
    if (checking) return;
    if (document.visibilityState !== 'visible') return;
    const now = Date.now();
    if (now - lastCheckAt < UPDATE_MIN_GAP_MS) return;
    checking = true;
    lastCheckAt = now;
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      // sw.js 内含 skipWaiting + clientsClaim：一旦拉到新版本，
      // 新 SW 会立即接管并触发上面的 controllerchange → 自动刷新到新版本。
      await reg?.update();
    } catch {
      // 离线或网络异常，忽略，下次再试
    } finally {
      checking = false;
    }
  };

  // 启动时查一次。registerSW.js 是在 window load 时才注册 SW 的，
  // 早于 load 调用 getRegistration() 会拿到空，故等 load 之后再查。
  if (document.readyState === 'complete') {
    void checkForUpdate();
  } else {
    window.addEventListener('load', () => void checkForUpdate());
  }
  // 回到前台 —— 手机上就是「点图标切回 App」，这是最主要的一条通道
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkForUpdate();
  });
  // 网络恢复
  window.addEventListener('online', () => void checkForUpdate());
  // 页面长时间开着（例如挂在主屏幕一直没关）
  window.setInterval(() => void checkForUpdate(), UPDATE_INTERVAL_MS);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </StrictMode>,
);
