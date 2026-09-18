# 🐋 Harness Whale Wallpaper 鲸鱼壁纸

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-dsh%20web-6c7ee1.svg)](#兼容范围)
[![dsh compat](https://img.shields.io/badge/dsh-0.1.6--alpha.1-8da2ce.svg)](#兼容范围)

**面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI 的动态壁纸插件**——把 DeepSeek 最有识别度的点阵鲸鱼重建为约 1,750 个呼吸着的 WebGL2 粒子：在薄雾中缓慢转身，指针划过时如液体般绕流。浅色、深色主题齐备；没有品牌字样、粒子连线或杂乱特效。

[English](README.md) | **简体中文**

> 📣 已收录 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) —— DeepSeek Harness 插件精选列表。

## ✨ 效果演示

浅色与深色模式均为动态壁纸：鲸鱼持续呼吸、缓慢转身，雾层漂移；指针划过鲸鱼时，周围粒子如液体般绕指针涡旋（纯运动反馈，无光晕、无圆环），离开后约 800ms 柔和归位。下方 GIF 为精确 2 倍速——18 帧、每帧推进 100ms 动画，由确定性时钟逐帧驱动而非录屏，因此不存在跳帧延时，实际节奏更舒缓。**[打开在线预览 →](https://heshen-1.github.io/deepseek-whale-wallpaper/)**

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

要求 DeepSeek Harness dev-preview（`@deepseek-ai/dsh`）的 `web` profile。

### 方式 A：从 Release tarball 安装

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

3. 重启 `dsh web` 后刷新 [http://127.0.0.1:3080](http://127.0.0.1:3080)，鲸鱼就会出现在界面背后。想要非默认效果，改上面那段配置即可。

### 方式 B：先看效果

打开**[在线预览](https://heshen-1.github.io/deepseek-whale-wallpaper/)**——与插件同一渲染内核，无需安装。

## ⚙️ 配置

在 profile 组合层按需覆盖；默认值见插件自带的 [`cordis.patch.yml`](cordis.patch.yml)：

| 字段 | 默认值 | 含义 |
| --- | ---: | --- |
| `enabled` | `true` | 是否启用壁纸与主题 |
| `quality` | `auto` | `auto` / `low` / `medium` / `high` |
| `brightness` | `0.9` | 鲸鱼亮度，范围 0.35–1.4 |
| `scale` | `1` | 鲸鱼比例，范围 0.72–1.25 |
| `interactionStrength` | `1` | 视差与粒子绕流强度，范围 0–1.5 |
| `activeDimming` | `0.22` | 输入/运行状态的不透明度，范围 0.12–0.6 |

配置由宿主侧 Schemastery 校验，并通过同源只读端点提供给客户端。若当前 Harness 构建缺少公共槽位或必要服务，插件会记录明确错误并安全停止。

## 🌊 行为

- 鲸鱼轮廓直接采样自仓库中的 `favicon.svg` 路径，WebGL2 默认渲染约 1,750 个规则网格点。
- 约 11 秒的纵向呼吸、29 秒缓慢转身，叠加尾鳍游动与轻微浮沉；鼠标带来约 6° 视差与位置偏移。
- 指针进入鲸鱼时，约 200px 半径内的粒子产生连续液态涡流（纯运动反馈，不改变亮度与大小），范围内部不会形成空洞；离开后约 800ms 柔和归位。原始点阵不被修改。
- 跟随 Harness 通用设置中的"浅色 / 深色 / 跟随系统"：深色保持白色→冰蓝粒子并压深鲸鱼身后的水色，浅色使用高对比冷调墨黑 `#050b14` 并提亮身后水色，并同步切换界面语义 Token、雾层与背景。
- 明暗模式都透出应用框架与会话画布的全屏底色层；侧栏、输入框、对话内容和设置窗口保留各自表面，避免全屏蒙层洗淡底部点阵。阅读幕布只覆盖实测出的文字区块而非整列，因此没有文字经过的区域，墨色仍保持近黑（浅色）/ 纯白（深色）。
- 无会话时保持完整亮度；打开会话后降至 78%；输入或任务运行时至少保留 50% 亮度（仍尊重更高的 `activeDimming` 配置），过渡约 600ms。
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
├── reading-zone.ts 实测文字区块，供幕布与点阵软化使用
├── self-check.ts   Harness 升级后自检外壳表面
├── activity.ts     会话/输入/运行状态的专注调光
├── whale-path.ts   从 favicon.svg 轮廓采样网格点
└── config.ts       Schemastery schema 与默认值
```

零运行时依赖；三个 devDependencies（esbuild、typescript、schemastery）。`lib/` 与 `preview.js` 是 `pnpm build` 产物。

## 🔧 开发

```bash
pnpm install
pnpm build     # 重建 lib/ + preview.js
pnpm check     # bundle、外壳契约与调色板检查
pnpm compat    # 已安装的 Harness 是否仍提供全部钩子?

# 独立预览（与插件同一渲染器）
python3 -m http.server 4173   # 打开 http://127.0.0.1:4173/
```

`pnpm shots` 用于重拍 README 的静帧与 GIF：它不按墙上时间录屏，而是用
`scripts/demo-clock.js` 接管动画时钟——每帧精确推进 100ms 动画（按 60Hz 切片，
渲染器的慢机保护因此永不触发），18 帧再以每帧 50ms 合成为演示区承诺的 2 倍速。
按墙上时间采集撑不住截图循环：单次截图约 1s，"每帧间隔 100ms"实际会变成约 1s，
GIF 就成了约 20 倍速的延时片，且慢机保护会在中途关掉光晕，画面与线上效果对不上。
脚本需要 `PATH` 上有 `agent-browser`，以及带 Pillow 的 `python3`；`--url` 可改为
采集已在运行的页面（"真实 Harness 界面"配图即由此而来），`--prefix` 用于改名。

预览页的状态全部走查询串,方便直接分享或复现某一种效果:`?theme=light|dark`、
`?preset=calm|vivid`、`?brightness=0.35..1.4`、`?quality=low|medium|high`,
`?ui=0` 隐藏控制面板(上面的截图就是这么拍的)。同一套控件也在
[在线预览](https://heshen-1.github.io/deepseek-whale-wallpaper/) 上。

## ❓ FAQ 与故障排查

**装完没有鲸鱼？** 重启 `dsh web`（客户端 bundle 在启动时组合）后刷新。检查 `~/.dsh/profiles/web/cordis.patch.yml` 是否有 `insert` 条目。页面 body 应带有 `data-dsh-harness-whale="true"`。

**`dsh plugin --profile web add dsh-plugin-harness-whale` 装的是这个吗？** 不是——npm registry 上目前只有旧的 0.2.0，0.3.x 并未发布。请用[Release tarball](#方式-a从-release-tarball-安装)。

**掉帧 / 风扇狂转？** 把 `quality` 设为 `low` 或 `medium`，降低 `brightness` 或 `interactionStrength`。`auto` 本身就会在持续掉帧后自动降档。

**浏览器没有 WebGL2？** 会自动渲染静态 Canvas2D 点阵鲸鱼作为回退。

**卸载。** 从 `cordis.patch.yml` 移除 `insert` 注册项并删除 `~/.dsh/profiles/node_modules/dsh-plugin-harness-whale` 目录；重启后恢复原主题与布局。

**更新。** 用新版本 tarball 覆盖旧目录，然后重启 `dsh web`。每个历史版本都留在 [`release/`](release) 里，便于一条命令回滚。

## 🔭 兼容范围

当前目标为 `@deepseek-ai/dsh 0.1.1-rc.2` 的浏览器 Web UI。Harness 仍处于 dev-preview——若 `dsh.client`、`ctx.theme` 或 `shell.overlay` 协议变更，需要重新核对兼容性。

## 🗒️ 更新日志

见 [CHANGELOG.md](CHANGELOG.md)。

## 📄 许可证

[MIT](LICENSE)
