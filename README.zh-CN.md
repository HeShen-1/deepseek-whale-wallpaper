# 🐋 Harness Whale Wallpaper 鲸鱼壁纸

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/dsh-plugin-harness-whale)](https://www.npmjs.com/package/dsh-plugin-harness-whale)
[![Platform](https://img.shields.io/badge/platform-dsh%20web-6c7ee1.svg)](#兼容范围)
[![dsh compat](https://img.shields.io/badge/dsh-0.1.1--rc.2-8da2ce.svg)](#兼容范围)

**面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI 的动态壁纸插件**——把 DeepSeek 最有识别度的点阵鲸鱼重建为约 1,750 个呼吸着的 WebGL2 粒子：在薄雾中缓慢转身，指针划过时如液体般绕流。浅色、深色主题齐备；没有品牌字样、粒子连线或杂乱特效。

[English](README.md) | **简体中文**

> 📣 已收录 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) —— DeepSeek Harness 插件精选列表。

## ✨ 效果演示

浅色与深色模式均为动态壁纸：鲸鱼持续呼吸、缓慢转身，雾层漂移；指针划过鲸鱼时，周围粒子产生连续液态涡流与向外扩散的径向亮度波，离开后约 650ms 柔和归位。下方 GIF 为 2 倍速录制，实际节奏更舒缓。**[打开在线预览 →](https://heshen-1.github.io/deepseek-whale-wallpaper/)**

### 深色模式

![深色模式动态演示：白色点阵鲸鱼与指针粒子涡流](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-whale-dark.gif)

### 浅色模式

![浅色模式动态演示：墨黑点阵鲸鱼与指针粒子涡流](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-whale-light.gif)

### 真实 Harness 界面

采集自插件实际部署的 DeepSeek Harness Web 客户端：壁纸层位于应用框架*下方*，侧栏、会话画布与输入区照常使用，粒子在界面背后绕流。

| 浅色界面 | 深色界面 |
| --- | --- |
| ![真实 Harness 浅色界面](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-ui-light.jpg) | ![真实 Harness 深色界面](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-ui-dark.jpg) |

![真实 Harness 浅色界面动效](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-ui-light.gif)

![真实 Harness 深色界面动效](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-ui-dark.gif)

## 📦 安装

要求 DeepSeek Harness dev-preview（`@deepseek-ai/dsh`）的 `web` profile，`pnpm` 在 `PATH` 上。

### 方式 A：npm 一行安装（推荐）

```bash
dsh plugin --profile web add dsh-plugin-harness-whale
```

重启 `dsh web` 后刷新 [http://127.0.0.1:3080](http://127.0.0.1:3080)，鲸鱼就会出现在界面背后。该命令会把包装进 profile 并自动注册 bundle 层；如需非默认配置，在 `~/.dsh/profiles/web/cordis.patch.yml` 里覆盖。

### 方式 B：从 Release tarball 安装

1. 从 [Releases](https://github.com/HeShen-1/deepseek-whale-wallpaper/releases) 下载 `dsh-plugin-harness-whale-<version>.tgz`，把其中 `package/` 目录解压到：

   ```text
   ~/.dsh/profiles/node_modules/dsh-plugin-harness-whale
   ```

2. 在 `~/.dsh/profiles/web/cordis.patch.yml` 的 `insert` 列表注册：

   ```yaml
   - insert:
       - id: harness-whale-wallpaper
         name: dsh-plugin-harness-whale
         config:
           enabled: true
           quality: auto
           brightness: 0.9
           scale: 1
           interactionStrength: 1
           activeDimming: 0.22
   ```

3. 重启 `dsh web`。

### 方式 C：先看效果

打开**[在线预览](https://heshen-1.github.io/deepseek-whale-wallpaper/)**——与插件同一渲染内核，无需安装。

## ⚙️ 配置

在 profile 组合层按需覆盖；默认值见插件自带的 [`cordis.patch.yml`](cordis.patch.yml)：

| 字段 | 默认值 | 含义 |
| --- | ---: | --- |
| `enabled` | `true` | 是否启用壁纸与主题 |
| `quality` | `auto` | `auto` / `low` / `medium` / `high` |
| `brightness` | `0.9` | 鲸鱼亮度，范围 0.35–1.4 |
| `scale` | `1` | 鲸鱼比例，范围 0.72–1.25 |
| `interactionStrength` | `1` | 视差、局部亮度与粒子绕流强度，范围 0–1.5 |
| `activeDimming` | `0.22` | 输入/运行状态的不透明度，范围 0.12–0.6 |

配置由宿主侧 Schemastery 校验，并通过同源只读端点提供给客户端。若当前 Harness 构建缺少公共槽位或必要服务，插件会记录明确错误并安全停止。

## 🌊 行为

- 鲸鱼轮廓直接采样自仓库中的 `favicon.svg` 路径，WebGL2 默认渲染约 1,750 个规则网格点。
- 约 11 秒的纵向呼吸、29 秒缓慢转身，叠加尾鳍游动与轻微浮沉；鼠标带来约 6° 视差、位置偏移和向外扩散的局部亮度波。
- 指针进入鲸鱼时，约 160px 半径内的粒子产生连续液态涡流与轻微、正负交替的径向波，范围内部不会形成空洞；离开后约 650ms 柔和归位。原始点阵不被修改。
- 跟随 Harness 通用设置中的"浅色 / 深色 / 跟随系统"：深色保持白色→冰蓝粒子，浅色使用高对比冷调墨黑 `#050b14`，并同步切换界面语义 Token、雾层与背景。
- 明暗模式都透出应用框架与会话画布的全屏底色层；侧栏、输入框、对话内容和设置窗口保留各自表面，避免全屏蒙层洗淡底部点阵。
- 无会话时保持完整亮度；打开会话后降至 72%；输入或任务运行时至少保留 34% 亮度（仍尊重更高的 `activeDimming` 配置），过渡约 600ms。
- 页面隐藏时暂停；`prefers-reduced-motion: reduce` 下完全静止。
- DPR 上限为 1.5，`auto` 会在持续掉帧后从 high 依次降到 medium / low。
- WebGL2 不可用时自动显示静态 Canvas2D 点阵鲸鱼。
- 插件卸载或热替换时移除全部 DOM、CSS、事件和动画，并恢复 Harness 原主题。

## 🧩 架构与生态

本插件是 DeepSeek Harness 首批第三方客户端插件之一：通过公开的 `shell.overlay` 槽位参与生命周期，壁纸画布前插在应用框架下方，不会阻挡 Harness 控件。

```text
src/
├── index.ts        宿主入口 — 经 webServer 注入注册配置路由
├── client.tsx      客户端入口 — 经 shell.overlay 槽位挂载
├── renderer.ts     唯一的 WebGL2 渲染内核（与预览共用）
├── theme.ts        语义 Token 覆盖 + 注入 CSS
├── activity.ts     会话/输入/运行状态的专注调光
├── whale-path.ts   从 favicon.svg 轮廓采样网格点
└── config.ts       Schemastery schema 与默认值
```

零运行时依赖；三个 devDependencies（esbuild、typescript、schemastery）。`lib/` 与 `preview.js` 是 `pnpm build` 产物。

## 🔧 开发

```bash
pnpm install
pnpm build     # 重建 lib/ + preview.js
pnpm check     # schema 与 bundle 健康检查

# 独立预览（与插件同一渲染器）
python3 -m http.server 4173   # 打开 http://127.0.0.1:4173/
```

## ❓ FAQ 与故障排查

**装完没有鲸鱼？** 重启 `dsh web`（客户端 bundle 在启动时组合）后刷新。npm 安装路径用 `dsh plugin --profile web why dsh-plugin-harness-whale` 验证；tarball 路径检查 `~/.dsh/profiles/web/cordis.patch.yml` 是否有 `insert` 条目。页面 body 应带有 `data-dsh-harness-whale="true"`。

**pnpm ≥ 10 提示阻止了安装脚本？** 本插件没有声明任何 lifecycle 脚本，不会触发阻止——无需配置 `allowBuilds`。

**掉帧 / 风扇狂转？** 把 `quality` 设为 `low` 或 `medium`，降低 `brightness` 或 `interactionStrength`。`auto` 本身就会在持续掉帧后自动降档。

**浏览器没有 WebGL2？** 会自动渲染静态 Canvas2D 点阵鲸鱼作为回退。

**卸载。** npm 路径：`dsh plugin --profile web remove dsh-plugin-harness-whale`。tarball 路径：从 `cordis.patch.yml` 移除 `insert` 注册项并删除 `~/.dsh/profiles/node_modules/dsh-plugin-harness-whale` 目录。两种方式重启后都会恢复原主题与布局。

**更新。** npm 路径：`dsh plugin --profile web add dsh-plugin-harness-whale@latest`。tarball 路径：用新版本 tarball 覆盖旧目录。之后重启 `dsh web`。

## 🔭 兼容范围

当前目标为 `@deepseek-ai/dsh 0.1.1-rc.2` 的浏览器 Web UI。Harness 仍处于 dev-preview——若 `dsh.client`、`ctx.theme` 或 `shell.overlay` 协议变更，需要重新核对兼容性。

## 🗒️ 更新日志

见 [CHANGELOG.md](CHANGELOG.md)。

## 📄 许可证

[MIT](LICENSE)
