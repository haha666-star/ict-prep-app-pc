/// <reference types="vite/client" />

/** 构建期注入：应用版本号（来自 package.json version） */
declare const __APP_VERSION__: string;

/** 构建期注入：构建时间（ISO 8601 字符串） */
declare const __BUILD_TIME__: string;
