# MiniMax AI 对话平台

基于 MiniMax 大模型的智能对话应用，集成多模态 AI 能力（文本对话 / 图片生成 / 音乐生成 / 视频生成 / 语音合成），使用 [Nuxt UI](https://ui.nuxt.com) + [AI SDK](https://ai-sdk.dev) 构建。

## 功能特性

- **文本对话** — MiniMax-M2.7 / M2.5-Turbo / Text-01 等模型，流式响应
- **图片生成** — MiniMax Image-01 模型，支持多种宽高比
- **音乐生成** — 输入歌词或描述，生成完整音乐
- **视频生成** — Hailuo-2.3 模型，文生视频
- **语音合成** — TTS HD 高质量语音，支持多种音色调节
- **对话管理** — 历史记录持久化，公开/私密分享
- **文件上传** — 拖拽上传，图片/文档支持
- **GitHub 登录** — OAuth 认证，数据隔离

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Nuxt 4 + Vue 3 + Nuxt UI 4 |
| AI 集成 | AI SDK (Vercel) + MiniMax API |
| 数据库 | SQLite (开发) / Turso (生产) + Drizzle ORM |
| 文件存储 | NuxtHub Blob (本地 / Vercel Blob / R2) |
| 认证 | nuxt-auth-utils + GitHub OAuth |

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```bash
# MiniMax API（必填）
MINIMAX_API_KEY=your_minimax_api_key
MINIMAX_GROUP_ID=your_minimax_group_id

# 后端地址（开发环境指向本地 Java 后端）
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080

# GitHub OAuth（可选，不填则无法登录）
NUXT_OAUTH_GITHUB_CLIENT_ID=your_github_client_id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
NUXT_SESSION_PASSWORD=your_random_session_password_32chars

# 文件存储（可选，默认使用本地 .data/blob）
# BLOB_READ_WRITE_TOKEN=your_blob_token
```

> [!TIP]
> MiniMax API Key 和 Group ID 在 [MiniMax Platform](https://platform.minimaxi.com) 获取。

### 3. 启动后端

Java 后端项目 [JOSP-MiniMaxApi](https://github.com/junwOpenSourceProjects/JOSP-MiniMaxApi)：

```bash
cd ../JOSP-MiniMaxApi
mvn spring-boot:run
```

后端默认运行在 `http://localhost:8080`。

### 4. 启动前端

```bash
pnpm dev
```

访问 `http://localhost:3000`。

### 5. 数据库迁移

```bash
pnpm db:migrate
```

## 项目结构

```
JOSP-MiniMaxApiVue3/
├── app/
│   ├── components/          # Vue 组件
│   │   ├── chat/            # 对话相关组件
│   │   └── MiniMaxPanel.vue # 多模态 AI 面板（文生图/音乐/视频/TTS）
│   ├── composables/          # 组合式函数
│   ├── layouts/              # 布局
│   └── pages/               # 页面
│       ├── index.vue        # 首页
│       └── chat/[id].vue    # 对话页
├── server/
│   ├── api/                 # API 路由
│   │   ├── chats/           # 对话 CRUD
│   │   ├── minimax/         # MiniMax 多模态代理
│   │   └── upload/          # 文件上传
│   └── db/                  # 数据库 Schema
└── shared/                  # 前后端共享
    └── utils/models.ts      # MiniMax 模型定义
```

## 部署

推荐使用 Vercel，克隆后配置以下环境变量：

| 环境变量 | 说明 |
|----------|------|
| `MINIMAX_API_KEY` | MiniMax API Key |
| `MINIMAX_GROUP_ID` | MiniMax Group ID |
| `NUXT_PUBLIC_API_BASE_URL` | 后端地址（Vercel 部署时指向线上后端） |
| `NUXT_OAUTH_GITHUB_CLIENT_ID` | GitHub OAuth Client ID |
| `NUXT_OAUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret |
| `NUXT_SESSION_PASSWORD` | Session 加密密码（32字符随机字符串） |
| `TURSO_DATABASE_URL` | Turso 数据库 URL（生产） |
| `TURSO_AUTH_TOKEN` | Turso 认证 Token（生产） |

## 后端 API

后端项目 [JOSP-MiniMaxApi](https://github.com/junwOpenSourceProjects/JOSP-MiniMaxApi) 提供以下接口：

| 接口 | 说明 |
|------|------|
| `POST /api/chat/chat` | 文本对话（流式） |
| `POST /api/minimax/image` | 图片生成 |
| `POST /api/minimax/music` | 音乐生成 |
| `POST /api/minimax/video` | 视频生成（异步轮询） |
| `POST /api/minimax/speech` | 语音合成 |

## License

MIT
