# 部署说明（PC 版 · 国一冲刺）

目标仓库：`haha666-star/ict-prep-app-pc`，分支 `main`
线上地址：https://haha666-star.github.io/ict-prep-app-pc/
（本工程为**电脑版**，与手机版 `ict-prep-app` 同源同内容，独立仓库部署）

> 最新版本：**v7 · 省赛+国赛双对齐冲刺（2026-09-21）**，详见文末章节。

## 一、部署方式（二选一）

### 方式 A：git push（推荐）
```bash
git init
git remote add origin https://github.com/haha666-star/ict-prep-app.git
git add -A
git commit -m "v3: 修复图标404/PWA离线缓存/判断题过滤"
git push -f origin main
```
> 本地仓库已是全新快照（无历史），必须用 `-f` 强推覆盖。

### 方式 B：GitHub 网页端上传
1. 打开 https://github.com/haha666-star/ict-prep-app
2. `Add file → Upload files`
3. 把本包**解压后的全部文件和文件夹**拖入（保留目录结构）
4. 提交到 `main` 分支

> ⚠️ 网页端无法删除文件。旧的 `public/manifest.json` 会残留，但**已无害**（新版 `index.html` 不再引用它），可不管。
> ⚠️ 不要上传 `node_modules` 和 `dist`，本包已排除。

## 二、构建由 GitHub Actions 自动完成
`.github/workflows/deploy.yml` 会在 push 后自动 `npm ci && npm run build` 并发布到 Pages，约 1–2 分钟。

## 三、验证清单
- [ ] 仓库 **Actions** 标签出现绿色对勾
- [ ] 访问站点，手机端强刷新（PWA 缓存需清一次）
- [ ] 「添加到主屏幕」显示青色网络拓扑图标（图标 404 已修）
- [ ] 刷题页出现「仅考试题型」开关（判断题过滤已生效）
- [ ] 断网后仍能切换 Tab（SW 预缓存 23 项已修）

## 四、本版变更
| 项目 | 说明 |
|---|---|
| PWA 图标 | 新增 `public/icons/`：`icon-192/512.png`、`apple-touch-icon.png`(180)、`icon-maskable-512.png`、`icon.svg`、`splash.svg` |
| manifest | 删除手写 `public/manifest.json`，仅保留 PWA 插件生成的 `manifest.webmanifest` |
| iOS 适配 | `apple-touch-icon` 改指 PNG（iOS 不支持 SVG） |
| 判断题过滤 | QuizPage 新增「仅考试题型」开关（默认开），随机/方向练习跳过 87 道判断题，错题本不受影响 |
| 离线缓存 | 本地重建后 precache 覆盖 23 项（含路由分包与图标），修复离线切 Tab 白屏 |

## 五、技术栈
Vite 5 + React 18 + TypeScript + Tailwind + vite-plugin-pwa。
Node 版本要求 ≥ 18（`npm ci` 依赖 `package-lock.json`）。

---

## v4 更新（2026-09-07 深夜）

### 变更内容
1. **新增 `src/data/quizzes-extra-c.ts`（25 题）**，已在 `quizzes.ts` 中通过 `...EXTRA_QUIZZES_C` 展开合入
   - `datacom-bgp4plus` 从 **0 题补到 7 题**（真考点漏题）
   - 另 10 个薄弱叶子知识点各补 1–2 题（application-layer / link-aggregation / stack / security-ha / security-utm / arp / bfd / osi-tcpip / ospfv3 / antivirus）
2. **删除 4 道重复题干**：`dc-e001`、`dc-e002`、`dc-f004`、`dcn-108`（与原题 dc-131 / dc-132 / dc-075 / dcn-009 完全重复）
3. **难度标签补齐到 100%**：30 道缺 `difficulty` 的题已按关键词启发式标注

### 部署后题库数据（源码级实测）
- 总题量 **555**（原 530）
- 题型：单选 350 / 多选 **119** / 判断 87
- 方向：datacom 266 / security 120 / dcn **95** / wlan 75
- 难度：IA 193 / IP 270 / IE 92（覆盖率 100%）
- 重复题干 **0**、重复 id **0**、悬空 knowledgeId **0**

### 验证状态
- `tsc --noEmit` 零错误
- `vite build` 成功，PWA precache **23 项**
- 本地 HTTP 冒烟测试：首页 / 6 个 chunk / 6 个图标 / sw.js / manifest 全部 200

### 部署方式（同上一版）
- `git push -f origin main`（推荐），或网页端全量覆盖上传
- 产物：`ict-prep-app-v4-dist.zip` 直接解压覆盖仓库亦可

### 部署后自检 3 条
1. Actions 绿勾
2. 「刷题」页显示总题量 **555**
3. 「仅考试题型」开关存在且默认开启

---

## v5 性能与交互修复（2026-09-08）

用户反馈：**点击 Tab 时页面闪两次、跳转很慢**。定位到 3 个叠加原因，全部修复。

### 1. 闪两次 —— `<Outlet />` 放进 `AnimatePresence` 的经典坑
React Router 的 `<Outlet />` 在路由变化瞬间就渲染**新页面**，而 `AnimatePresence mode="wait"` 还在播旧组件的退场动画。
结果：新内容先「淡出」再「淡入」，同一页面走两遍动画 = 看到闪两次。
**修复**：改用 `useOutlet()` 取得元素快照传给 `motion.div`，退场期间冻结的是旧页面内容。

### 2. 跳转慢 —— 首屏打包了 1MB ECharts
`StatisticsPage` 静态引入 `echarts-for-react`，因为路由全静态导入，打开首页就要下载 1MB 图表库。
**修复**：路由改 `React.lazy` 懒加载（首页 DashboardPage 保持即时渲染），ECharts 只在进「统计」页时才加载。

### 3. 滚动/切换卡顿 —— 全屏实时毛玻璃
容器 `backdrop-blur-sm` 覆盖整个可滚动区域，移动端每帧都要重算全屏模糊；外加两个 `blur-[120px]` 大光晕。
**修复**：
- 容器改为 `bg-background/85`（高不透明度，免去 blur，同时保留网格透出感）
- 两处光晕改用 `radial-gradient` 静态渐变，不再用 filter blur
- 底部 Tab 栏 `backdrop-blur-2xl` → `backdrop-blur-md`

附带把页面切换动画从 0.2s×2（横向位移）缩到 **0.15s×2（纵向微移）**，并加 `initial={false}` 去掉首屏多余动画。

### 构建结果对比
| 指标 | 修复前 | 修复后 |
|---|---|---|
| 入口 JS | 124.65 kB | **39.75 kB** |
| 首屏是否加载 ECharts | 是（1,046 kB） | **否**（按需） |
| 首屏 gzip 合计 | ≈799 kB | **≈452 kB** |
| PWA precache | 23 项 | **32 项**（8 个页面分包全部缓存，离线仍可用） |

### 验证
- `tsc --noEmit` 零错误
- `vite build` 成功，precache 32 项
- 本地冒烟：首页 / 4 个首屏 chunk / sw.js / manifest / 图标 全部 200
- `index.html` 中已无 echarts 引用（确认不再首屏加载）

---

## v6 · 国家一等奖冲刺升级（2026-09-21）

面向目标：**华为 ICT 大赛实践赛·网络赛道 国家一等奖**。按官方考纲做全方位升级。

### 升级依据（官方考纲权重）
| 赛段 | datacom | DCN | security | WLAN |
|---|---|---|---|---|
| 省初赛 / 省复赛 | 40% | 20% | 20% | 20% |
| **国家总决赛** | **50%** | **0%** | **25%** | **25%** |
| 全球总决赛 | 50% | — | 20% | 30% |

> 关键结论：**国家总决赛不考 DCN**，datacom 占半壁江山——题库与模考权重据此重排。

### 一、题库扩容：556 → **730**（+174 题）
| 项目 | 数值 |
|---|---|
| 新增文件 | `src/data/quizzes-extra-d.ts`（174 题，由 `scripts/gen_questions.py` 离线生成） |
| 合入方式 | `quizzes.ts` 中 `...EXTRA_QUIZZES_D` 展开 |
| 方向分布 | datacom 339 / security 174 / wlan 110 / dcn 107 |
| 难度分布 | IA 245 / IP 373 / IE 111 |
| 题型分布 | 单选 476 / 多选 126 / 判断 128 |

生成器内置三重校验：knowledgeId 存在性、答案必须在选项中、题干去重。

### 二、押题命中率升级（真题 + 高频标签）
- `IQuizQuestion` 新增 `tag?: 'real' | 'hot'`
- 全库命中：**真题(real) 29 题 + 高频(hot) 74 题**
- 刷题页新增 **全部 / 真题 / 高频** 三段筛选开关（冲刺期一键只刷高价值题）
- 答题卡与错题本均渲染「真题」「高频」徽章
- 「题库总数」卡显示「真题 N · 高频 N」

### 三、知识点补充（+12，共 89 个）
新增 `src/data/knowledge-extra.ts`，补齐考纲缺口：
- **数通**：MSTP、VLAN 聚合、策略路由(PBR)、网管(NMS/SNMP/LLDP/NQA)
- **安全**：DHCP Snooping、端口安全、Portal 认证、防火墙高级(Vsys/智能选路)
- **WLAN**：STA 上线(CAPWAP)、WLAN 规划（容量/信道/功率）
- **DCN**：Clos 架构、SDN 控制器

### 四、模考引擎赛制对齐
- 修正省初赛/省复赛方向权重为官方值（原 DCN 15%/安全 25% → 统一 20%/20%）
- 新增 **国家总决赛模考** 预设：**90 题 / 90 分钟**，datacom 50% + security 25% + WLAN 25%，**不含 DCN**

### 五、数据质量 & 验证
- 悬空 knowledgeId **0**、答案越界 **0**、重复题干 **0**
- `tsc --noEmit` **零错误**
- `vite build` **成功**，PWA precache **17 项**

### 部署方式
**方式 A（推荐 · git push）**
```bash
git init
git remote add origin https://github.com/haha666-star/ict-prep-app-pc.git
git add -A
git commit -m "v6: 国一冲刺升级(题库730/真题高频标签/12知识点/国赛模考)"
git push -f origin main
```
> `base: './'` 为相对路径，子路径部署无需改配置；本地无历史，用 `-f` 强推覆盖。

**方式 B：网页端全量覆盖上传**（排除 `node_modules` 与 `dist`）

### 部署后自检
- [ ] Actions 绿色对勾
- [ ] 「刷题」页题库总数显示 **730**，且可见「真题 N · 高频 N」
- [ ] 「模考」页出现「**国家总决赛模考**」选项
- [ ] 答题卡出现「真题」「高频」徽章，筛选开关可用

---

## v7 · 省赛+国赛双对齐冲刺（2026-09-21 晚）

**触发背景**：国一是最终目标，但**必须先过省资格赛/省复赛**。省赛按 DCN 20% 命题，而 v6 按国赛（DCN=0）优化，导致 DCN 权重被压到 12%——这是省赛出线的隐患。本版做双对齐。

### 一、双赛段权重对齐（核心）
| 赛段 | 数通 | DCN | 安全 | WLAN |
|---|---|---|---|---|
| 省赛目标 | 40% | 20% | 20% | 20% |
| **省赛现状** | 38.6% | **20.6%** | 21.2% | 19.7% |
| 国赛目标 | 50% | 0% | 25% | 25% |
| **国赛现状** | 48.6% | — | 26.8% | 24.6% |

> 省赛口径按「单选+多选」统计（省赛不考判断），两赛段均已对齐。

### 二、题库扩容：882 → **964**（本版 +82）
- 新增 `src/data/quizzes-extra-f.ts`（**DCN 81 题**，省赛专项，由 `scripts/gen_questions_v7b.py` 生成）
  - DCN IE 难度从 44 → **96**，覆盖 VXLAN/EVPN/Spine-Leaf/SDN/网关/控制器
- 保留 v6.2 已上线的 `quizzes-real.ts`（53 真题）

### 三、国赛方向补齐（v6 已含，此处汇总）
- `quizzes-extra-e.ts`（103 题）：补 WLAN 权重缺口 + 安全/数通 IE 深水区

### 四、题库质量修复
| 问题 | 处理 |
|---|---|
| 2 处重复题干（IPv6 链路本地 / Wi-Fi 6 标准） | 生成器改为**归一化全局去重**，自动剔除 |
| `dc-066` 多选题只有 1 个正确答案 | 改为单选并重述题干 |
| **答案位置严重偏斜**（A+B 占 78%，可被"蒙位置"） | 新增 `src/lib/options.ts`：按题号定种子的**稳定打乱**，现 A/B/C/D ≈ 25% 各；排除自引用选项与解析引用字母的题 |

### 五、数据质量 & 验证
- 重复题干 **0**、答案越界 **0**、多选单答案 **0**、悬空 knowledgeId **0**
- IE 难度占比 **24.5%**（v6 前为 15.6%），贴合国赛 HCIP/HCIE 定位
- 真题 95 + 高频 167 = **262 题已标注**（占 27%），可按标签专项突击
- `tsc --noEmit` 零错误；`vite build` 成功；PWA precache 17 项

### 部署方式（PC 仓库）
```bash
git init
git remote add origin https://github.com/haha666-star/ict-prep-app-pc.git
git add -A
git commit -m "v7: 省赛+国赛双对齐(964题/DCN补全省赛20%/选项打乱/去重修复)"
git push -f origin main
```

### 部署后自检
- [ ] Actions 绿勾
- [ ] 「刷题」页题库总数 **964**
- [ ] 「真题/高频」筛选可用，徽章正常
- [ ] 「模考」页含「国家总决赛模考」；省赛模考的 DCN 题量明显增加
- [ ] 同一道题重复进入时，选项顺序稳定（非每次刷新都变）
