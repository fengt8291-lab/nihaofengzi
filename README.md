# 你好丰子 / Nihao Fengzi

你好丰子个人数字主页（[nihaofengzi.top](https://nihaofengzi.top)），用于长期记录 AI 时代的个人创造力探索、人机协作研究、AI 产品实践与成长过程。

项目的正式产品与技术方案见 [docs/WEBSITE_PLAN.md](docs/WEBSITE_PLAN.md)，开发过程同时遵守仓库根目录的 `AGENTS.md`。

## 当前阶段

当前处于 Phase 1 基础架构阶段。仓库只包含可验证的最小页面入口、内容模型和工程配置，尚未进入 Hero、完整首页、动画与真实项目内容开发。

## 技术栈

- Astro：页面路由、内容渲染与静态生成
- TypeScript strict mode：类型安全
- Tailwind CSS：设计令牌、布局与响应式样式
- React integration：仅用于确实需要客户端交互的 Islands
- Astro Content Collections：管理 Projects、Research 和未来 Blog 内容

项目不在基础阶段引入数据库、CMS、组件库或全站客户端状态。

## 环境要求

- Node.js `>= 22.12.0`
- npm `>= 9.6.5`

首次安装或服务器复现环境时使用锁文件：

```bash
npm ci
```

不要删除或忽略 `package-lock.json`，也不要使用 `--force` 或 `--legacy-peer-deps` 绕过依赖约束。

## 常用命令

```bash
npm run dev      # 启动本地开发服务器
npm run check    # 执行 Astro 与 TypeScript 检查
npm run build    # 生成静态网站到 dist/
npm run preview  # 本地预览生产构建
```

提交代码前至少运行：

```bash
npm run check
npm run build
```

## 目录结构

```text
src/
├── assets/                 # 交由 Astro 优化的图片与项目素材
├── components/
│   ├── layout/             # 全局布局组件
│   ├── ui/                 # 基础 UI 组件
│   ├── home/               # 首页模块
│   ├── projects/           # 项目展示组件
│   ├── research/           # 研究展示组件
│   └── motion/             # 必要时使用的 React 动效 Islands
├── content/
│   ├── projects/           # 项目 Markdown
│   ├── research/           # 研究 Markdown
│   └── blog/               # 未来博客 Markdown
├── data/                   # 站点配置、Now、导航与简历数据
├── layouts/                # Astro 页面布局
├── pages/                  # Astro 文件路由
├── styles/                 # 全局样式与设计令牌
└── types/                  # 项目公共类型
public/
├── media/                  # 需要原样公开的视频等资源
├── resume/                 # PDF 简历
├── favicon/                # 网站图标
└── robots.txt
```

## 内容维护方式

- Projects、Research 和 Blog 使用 `src/content.config.ts` 定义的集合校验。
- 每条内容使用独立 Markdown 文件，正文与结构化元数据放在同一内容源。
- 新内容默认保留为草稿，确认真实、完整且允许公开后再发布。
- 项目顺序、角色、状态、成果和研究结论必须来自真实资料，不编造用户量、奖项或商业结果。
- Blog 至少具备 3 篇完整文章后再进入主导航。
- 图片优先放入 `src/assets/`；需要保持原文件名的 PDF、视频和 favicon 放入 `public/`。

## 架构原则

- 页面默认由 Astro 静态生成。
- React 只用于需要状态或复杂交互的局部 Islands，普通布局与 hover 不使用 React。
- 在真正开发 Hero 动画前不安装 Framer Motion。
- 优先使用系统字体、原生平台能力和少量官方集成。
- 所有交互都需要考虑移动端、键盘操作和 `prefers-reduced-motion`。

## 手动部署原则

Phase 1 使用以下流程，不启用 GitHub Actions 自动部署：

```text
本地开发与检查
→ Git 提交
→ 推送 GitHub
→ Ubuntu 服务器拉取 main
→ npm ci
→ npm run build
→ 确认构建成功后更新 /var/www/nihaofengzi/dist
```

生产服务器由 Nginx 提供 `dist/` 静态文件。部署失败时不得覆盖当前可用版本；每次部署应记录生产提交，并保留可回滚版本。Nginx 和服务器配置不属于日常内容开发修改范围。
