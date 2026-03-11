# AI Tutor — 完整架构设计文档

## 目录

1. [项目概览](#1-项目概览)
2. [技术选型总结](#2-技术选型总结)
3. [文件与文件夹结构](#3-文件与文件夹结构)
4. [各模块职责说明](#4-各模块职责说明)
5. [状态管理策略](#5-状态管理策略)
6. [服务连接架构](#6-服务连接架构)
7. [数据库表结构设计](#7-数据库表结构设计)
8. [API 路由设计](#8-api-路由设计)
9. [核心功能流程](#9-核心功能流程)
10. [安全与权限策略](#10-安全与权限策略)

---

## 1. 项目概览

AI Tutor 是一款面向 STEM 领域大学生和研究生的 AI 学习助手，核心目标是帮助用户理解概念、生成测验、整理知识卡片、分析文档。整体视觉风格采用暖米色背景、橙色强调色、大圆角卡片与手绘风图标。

核心功能模块：Explain（知识解释）、Quiz（测验生成）、Card（知识卡片）、Document Analysis（文档分析）。

---

## 2. 技术选型总结

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端框架 | Next.js 14+ (App Router) | SSR/CSR 混合渲染、文件路由 |
| UI 库 | Tailwind CSS + Radix UI | 样式系统与无障碍组件 |
| 状态管理 | Zustand | 轻量客户端全局状态 |
| 数据库 | Supabase (PostgreSQL) | 结构化数据持久存储 |
| 用户认证 | Supabase Auth | OAuth / Email 登录 |
| 文件存储 | Supabase Storage | 用户上传文档存储 |
| AI 文本生成 | OpenAI GPT-4o | Explain、Quiz、Card 文本、文档分析 |
| AI 图片生成 | OpenAI DALL-E 3 | 知识卡片插图 |
| 部署 | Vercel | 自动 CI/CD、边缘函数 |

---

## 3. 文件与文件夹结构

```
ai-tutor/
├── .env.local                        # 环境变量（OPENAI_API_KEY, SUPABASE_URL 等）
├── next.config.js                    # Next.js 配置
├── tailwind.config.ts                # Tailwind 主题（暖米色、橙色调色盘）
├── package.json
├── tsconfig.json
│
├── public/
│   ├── icons/                        # 手绘风 SVG 图标
│   └── images/                       # 静态图片资源
│
├── src/
│   ├── app/                          # ========== Next.js App Router ==========
│   │   ├── layout.tsx                # 根 Layout：字体加载、全局 Provider 注入
│   │   ├── page.tsx                  # 首页：瀑布流卡片 + 分类标签栏
│   │   ├── globals.css               # 全局 CSS（Tailwind @layer 自定义）
│   │   │
│   │   ├── (auth)/                   # 认证路由组（无需登录态的 Layout）
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── explain/                  # Explain 模块
│   │   │   └── page.tsx              # 对话式知识解释页面
│   │   │
│   │   ├── quiz/                     # Quiz 模块
│   │   │   ├── page.tsx              # 测验入口（输入关键词、生成题目）
│   │   │   └── [quizId]/page.tsx     # 单次测验详情（答题 + 结果 + 重练）
│   │   │
│   │   ├── cards/                    # Card 模块
│   │   │   ├── page.tsx              # 卡片列表（瀑布流浏览）
│   │   │   └── [cardId]/page.tsx     # 单张卡片详情
│   │   │
│   │   ├── documents/                # Document Analysis 模块
│   │   │   └── page.tsx              # 上传文档 + 知识点摘要展示
│   │   │
│   │   ├── settings/                 # 用户设置
│   │   │   └── page.tsx              # 偏好设置（回答风格、知识水平、分类管理）
│   │   │
│   │   └── api/                      # ========== API Routes ==========
│   │       ├── auth/
│   │       │   └── callback/route.ts # Supabase OAuth 回调
│   │       │
│   │       ├── explain/
│   │       │   └── route.ts          # POST: 发送问题 → GPT-4o 流式返回解释
│   │       │
│   │       ├── quiz/
│   │       │   ├── generate/route.ts # POST: 关键词 → GPT-4o 生成多选题 JSON
│   │       │   └── submit/route.ts   # POST: 提交答案 → 判分 + 存储结果
│   │       │
│   │       ├── cards/
│   │       │   ├── generate/route.ts # POST: 主题 → GPT-4o 生成卡片文本 + DALL-E 生成插图
│   │       │   ├── route.ts          # GET: 查询用户卡片列表 | DELETE: 删除卡片
│   │       │   └── [cardId]/route.ts # GET: 单卡片详情 | PATCH: 更新收藏状态
│   │       │
│   │       ├── documents/
│   │       │   ├── upload/route.ts   # POST: 接收文件 → 存入 Supabase Storage
│   │       │   └── analyze/route.ts  # POST: 解析文档 → GPT-4o 提取知识点
│   │       │
│   │       └── categories/
│   │           └── route.ts          # GET / POST / DELETE: 用户自定义分类 CRUD
│   │
│   ├── components/                   # ========== 可复用组件 ==========
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # 侧边导航菜单
│   │   │   ├── TopBar.tsx            # 顶部搜索栏 + 新建按钮
│   │   │   ├── BottomTabs.tsx        # 底部分类标签栏（移动端）
│   │   │   └── CategoryBar.tsx       # 分类标签滚动栏
│   │   │
│   │   ├── explain/
│   │   │   ├── ExplainChat.tsx       # 多轮对话主体
│   │   │   ├── MessageBubble.tsx     # 单条消息气泡
│   │   │   └── StyleSelector.tsx     # 回答风格 + 知识水平选择器
│   │   │
│   │   ├── quiz/
│   │   │   ├── QuizForm.tsx          # 关键词输入 + 生成按钮
│   │   │   ├── QuestionCard.tsx      # 单题展示（选项 + 选中状态）
│   │   │   ├── QuizResult.tsx        # 结果面板（得分 + 逐题解析）
│   │   │   └── RetryButton.tsx       # 错题重练按钮
│   │   │
│   │   ├── cards/
│   │   │   ├── CardGrid.tsx          # 瀑布流卡片网格容器
│   │   │   ├── KnowledgeCard.tsx     # 单张知识卡片（折叠/展开）
│   │   │   ├── CardIllustration.tsx  # AI 插图展示组件
│   │   │   └── FavoriteButton.tsx    # Heart/Star 收藏按钮
│   │   │
│   │   ├── documents/
│   │   │   ├── FileUploader.tsx      # 拖拽/点击上传组件
│   │   │   ├── AnalysisResult.tsx    # 知识点摘要卡片列表
│   │   │   └── KeyPointCard.tsx      # 单条知识点卡片
│   │   │
│   │   └── ui/                       # 通用 UI 原子组件
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Skeleton.tsx          # 加载骨架屏
│   │       ├── Toast.tsx
│   │       └── Badge.tsx
│   │
│   ├── lib/                          # ========== 核心工具库 ==========
│   │   ├── supabase/
│   │   │   ├── client.ts             # 浏览器端 Supabase Client（createBrowserClient）
│   │   │   ├── server.ts             # 服务端 Supabase Client（createServerClient）
│   │   │   └── middleware.ts         # Auth 中间件（刷新 Session）
│   │   │
│   │   ├── openai/
│   │   │   ├── client.ts             # OpenAI SDK 初始化
│   │   │   ├── prompts.ts            # 各模块 System Prompt 模板
│   │   │   └── parsers.ts            # GPT 输出 JSON 解析与校验
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                 # className 合并工具（clsx + tailwind-merge）
│   │   │   ├── fileParser.ts         # .txt / .pdf 文本提取
│   │   │   └── validators.ts         # Zod schema 校验
│   │   │
│   │   └── constants.ts              # 全局常量（风格选项、水平选项、默认分类）
│   │
│   ├── hooks/                        # ========== 自定义 Hooks ==========
│   │   ├── useAuth.ts                # 用户登录态管理
│   │   ├── useCards.ts               # 卡片 CRUD + 乐观更新
│   │   ├── useQuiz.ts                # 测验状态管理（答题、计时、提交）
│   │   ├── useExplain.ts             # Explain 流式对话管理
│   │   └── useCategories.ts          # 分类标签 CRUD
│   │
│   ├── stores/                       # ========== Zustand Stores ==========
│   │   ├── uiStore.ts                # 侧边栏开关、当前分类筛选、搜索词
│   │   └── preferencesStore.ts       # 回答风格、知识水平偏好（持久化到 localStorage）
│   │
│   └── types/                        # ========== TypeScript 类型 ==========
│       ├── database.ts               # Supabase 自动生成的表类型
│       ├── quiz.ts                   # Quiz 相关接口定义
│       ├── card.ts                   # Card 相关接口定义
│       └── explain.ts                # Explain 相关接口定义
│
├── supabase/
│   ├── migrations/                   # 数据库迁移文件
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_categories.sql
│   │   ├── 003_create_cards.sql
│   │   ├── 004_create_quizzes.sql
│   │   ├── 005_create_conversations.sql
│   │   └── 006_create_rls_policies.sql
│   └── config.toml                   # Supabase 本地开发配置
│
└── middleware.ts                     # Next.js 中间件（Auth Session 刷新 + 路由保护）
```

---

## 4. 各模块职责说明

### 4.1 `src/app/` — 页面路由层

每个文件夹对应一个功能模块的页面。页面组件负责组合 UI 组件、调用 Hooks 获取数据、处理页面级交互逻辑。`(auth)/` 为路由组，共享未登录状态的 Layout。

### 4.2 `src/app/api/` — API 路由层

运行在 Vercel Serverless Functions 中。职责是作为"安全网关"：验证用户身份、调用 OpenAI API（密钥仅存于服务端）、操作 Supabase 数据库、返回结构化响应。Explain 路由使用 `ReadableStream` 实现流式输出。

### 4.3 `src/components/` — UI 组件层

按功能模块分目录组织。每个组件只关注渲染和局部交互，数据获取由 Hooks 注入。`ui/` 目录存放跨模块复用的原子组件。

### 4.4 `src/lib/` — 核心工具层

封装第三方服务的初始化和调用逻辑。`supabase/` 区分浏览器端和服务端 Client（Next.js App Router 要求不同的创建方式）。`openai/prompts.ts` 集中管理所有 System Prompt，便于调优和版本控制。

### 4.5 `src/hooks/` — 数据逻辑层

自定义 Hooks 封装 API 调用、缓存、乐观更新、错误处理。组件通过 Hooks 获取数据，实现逻辑与视图分离。

### 4.6 `src/stores/` — 全局状态层

Zustand Store 管理需要跨组件共享的 UI 状态（如侧边栏、筛选条件）。用户偏好通过 Zustand 的 `persist` 中间件同步到 `localStorage`。

---

## 5. 状态管理策略

| 数据类型 | 存储位置 | 说明 |
|----------|----------|------|
| 用户偏好（回答风格、知识水平） | Zustand + localStorage | 本地持久化，可选同步到 Supabase `users.preferences` |
| UI 状态（侧边栏、当前分类、搜索词） | Zustand（内存） | 页面刷新重置，无需持久化 |
| Explain 对话消息列表 | React useState / useReducer | 页面级状态，离开页面后由后端持久化 |
| Quiz 答题进度（选中选项、计时） | React useState | 提交后存入 Supabase |
| 卡片列表、测验历史、分类列表 | Supabase（PostgreSQL） | 服务端持久化，通过 API Route 读写 |
| 上传文件原件 | Supabase Storage | `documents/{userId}/{fileName}` |
| AI 生成的卡片插图 | Supabase Storage | `illustrations/{cardId}.png` |

关键原则：敏感数据和需要跨设备同步的数据存 Supabase；短期交互状态存客户端；用户偏好先存本地、可选云同步。

---

## 6. 服务连接架构

```
┌──────────────────────────────────────────────────────────────────┐
│                         用户浏览器                                │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐  │
│  │  React 组件  │ → │  Custom Hooks │ → │ fetch('/api/...')      │  │
│  └─────────────┘  └─────────────┘  └──────────┬───────────────┘  │
│                                                │                  │
│  ┌─────────────────────────────────┐           │                  │
│  │ Supabase Browser Client         │           │                  │
│  │ (Auth 状态监听、实时订阅)         │           │                  │
│  └────────────┬────────────────────┘           │                  │
└───────────────┼────────────────────────────────┼──────────────────┘
                │                                │
    ┌───────────▼───────────┐    ┌───────────────▼──────────────┐
    │     Supabase Auth      │    │   Next.js API Routes         │
    │  (JWT 签发 + 刷新)      │    │  (Vercel Serverless)         │
    └───────────┬───────────┘    │                              │
                │                │  1. 从 Cookie 验证 JWT        │
                │                │  2. 构建 Supabase Server Client│
                │                │  3. 调用 OpenAI / 操作数据库    │
                │                └──┬───────────────┬───────────┘
                │                   │               │
        ┌───────▼───────────┐  ┌───▼──────┐  ┌────▼──────────┐
        │ Supabase PostgreSQL│  │ OpenAI   │  │ Supabase      │
        │ (RLS 行级安全)      │  │ GPT-4o   │  │ Storage       │
        │                    │  │ DALL-E 3 │  │ (文件/插图)     │
        └────────────────────┘  └──────────┘  └───────────────┘
```

### 连接细节

**前端 → API Route**：所有 AI 相关请求通过 `fetch()` 发送到 `/api/*`。Explain 模块使用 `ReadableStream` 实现流式 SSE 推送，前端通过 `EventSource` 或 `fetch` + `getReader()` 逐步渲染。

**API Route → OpenAI**：服务端使用 `openai` SDK，API Key 仅存在 `.env.local` 中（`OPENAI_API_KEY`），绝不暴露给前端。每个模块使用不同的 System Prompt 模板（定义在 `lib/openai/prompts.ts`）。

**API Route → Supabase**：通过 `createServerClient` 创建带用户上下文的 Supabase Client，自动继承 RLS 策略，确保用户只能操作自己的数据。

**前端 → Supabase Auth**：浏览器端使用 `createBrowserClient` 监听登录状态变化，管理 OAuth 登录流程。Auth Session 通过 `middleware.ts` 在每次请求时刷新。

---

## 7. 数据库表结构设计

### 7.1 `users` — 用户扩展信息

```sql
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  preferences   JSONB DEFAULT '{
    "explainStyle": "friendly",
    "knowledgeLevel": "intermediate"
  }'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 新用户注册时自动创建 profile（通过 Supabase Trigger）
```

`preferences` 字段示例结构：
```json
{
  "explainStyle": "friendly",       // professional | concise | humorous | friendly
  "knowledgeLevel": "intermediate"  // beginner | intermediate | advanced
}
```

### 7.2 `categories` — 用户自定义分类

```sql
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,              -- 分类名称（如 General, Ergonomic, MPD）
  color       TEXT DEFAULT '#F97316',     -- 标签颜色（HEX）
  sort_order  INT DEFAULT 0,             -- 排序权重
  is_default  BOOLEAN DEFAULT false,     -- 系统预设分类不可删除
  created_at  TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, name)
);
```

### 7.3 `cards` — 知识卡片

```sql
CREATE TABLE public.cards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  summary           TEXT NOT NULL,           -- AI 生成的摘要（折叠时显示）
  content           TEXT NOT NULL,           -- AI 生成的完整内容（展开时显示）
  illustration_url  TEXT,                    -- Supabase Storage 中的插图 URL
  source            TEXT DEFAULT 'manual',   -- manual | document_analysis
  source_document_id UUID,                   -- 若来自文档分析，关联文档 ID
  is_favorited      BOOLEAN DEFAULT false,
  is_starred        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cards_user_id ON public.cards(user_id);
CREATE INDEX idx_cards_category ON public.cards(category_id);
CREATE INDEX idx_cards_created ON public.cards(created_at DESC);
```

### 7.4 `quizzes` — 测验记录

```sql
CREATE TABLE public.quizzes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  keyword     TEXT NOT NULL,               -- 用户输入的关键词
  questions   JSONB NOT NULL,              -- AI 生成的题目数组
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

`questions` 字段结构：
```json
[
  {
    "id": "q1",
    "question": "Which protocol operates at the transport layer?",
    "options": ["HTTP", "TCP", "IP", "ARP"],
    "correctIndex": 1,
    "explanation": "TCP operates at Layer 4 (Transport) of the OSI model."
  }
]
```

### 7.5 `quiz_results` — 答题结果

```sql
CREATE TABLE public.quiz_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id     UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  answers     JSONB NOT NULL,              -- 用户提交的答案
  score       INT NOT NULL,                -- 正确题数
  total       INT NOT NULL,                -- 总题数
  wrong_ids   TEXT[] DEFAULT '{}',         -- 答错的题目 ID 列表（用于重练）
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quiz_results_user ON public.quiz_results(user_id);
```

`answers` 字段结构：
```json
[
  { "questionId": "q1", "selectedIndex": 1, "isCorrect": true },
  { "questionId": "q2", "selectedIndex": 0, "isCorrect": false }
]
```

### 7.6 `conversations` — Explain 对话记录

```sql
CREATE TABLE public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title           TEXT,                       -- 对话标题（取首条消息摘要）
  messages        JSONB NOT NULL DEFAULT '[]', -- 完整对话消息列表
  explain_style   TEXT DEFAULT 'friendly',
  knowledge_level TEXT DEFAULT 'intermediate',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_user ON public.conversations(user_id);
```

`messages` 字段结构：
```json
[
  { "role": "user", "content": "什么是梯度下降？", "timestamp": "2025-01-01T10:00:00Z" },
  { "role": "assistant", "content": "梯度下降是一种优化算法...", "timestamp": "2025-01-01T10:00:03Z" }
]
```

### 7.7 `documents` — 上传文档记录

```sql
CREATE TABLE public.documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name     TEXT NOT NULL,
  file_type     TEXT NOT NULL,               -- txt | pdf
  storage_path  TEXT NOT NULL,               -- Supabase Storage 路径
  file_size     INT,                         -- 文件大小（bytes）
  key_points    JSONB DEFAULT '[]',          -- AI 提取的知识点摘要（最多 10 条）
  status        TEXT DEFAULT 'pending',      -- pending | processing | completed | failed
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

`key_points` 字段结构：
```json
[
  { "title": "中心极限定理", "summary": "当样本量足够大时，样本均值的分布近似正态分布..." },
  { "title": "假设检验步骤", "summary": "包括建立假设、选择检验统计量、确定显著性水平..." }
]
```

### 7.8 RLS 策略（行级安全）

```sql
-- 所有表启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 统一策略模式：用户只能访问自己的数据
CREATE POLICY "users_own_data" ON public.cards
  FOR ALL USING (auth.uid() = user_id);

-- 对其他表重复相同模式（cards, quizzes, quiz_results, conversations, documents, categories）
```

### ER 关系图（文字描述）

```
users (1) ──── (N) categories
users (1) ──── (N) cards
users (1) ──── (N) quizzes
users (1) ──── (N) quiz_results
users (1) ──── (N) conversations
users (1) ──── (N) documents

categories (1) ──── (N) cards
categories (1) ──── (N) quizzes
categories (1) ──── (N) conversations

quizzes (1) ──── (N) quiz_results

documents (1) ──── (N) cards  (通过 cards.source_document_id)
```

---

## 8. API 路由设计

### 8.1 认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/auth/callback` | Supabase OAuth 回调处理，交换 code 获取 session |

### 8.2 Explain 模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/explain` | 发送问题 + 对话历史 + 偏好设置，返回流式 AI 解释 |

请求体：
```json
{
  "conversationId": "uuid | null",
  "message": "什么是傅里叶变换？",
  "style": "friendly",
  "level": "intermediate",
  "history": [...]
}
```

响应：`Content-Type: text/event-stream`，逐 token 推送，结束后返回 `conversationId`。

### 8.3 Quiz 模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/quiz/generate` | 根据关键词生成多选题（5-10 题），返回 quiz JSON + quizId |
| POST | `/api/quiz/submit` | 提交答案，返回逐题对错 + 总分，存入 quiz_results |

生成请求体：
```json
{
  "keyword": "线性代数 特征值",
  "count": 5,
  "categoryId": "uuid | null"
}
```

提交请求体：
```json
{
  "quizId": "uuid",
  "answers": [
    { "questionId": "q1", "selectedIndex": 2 }
  ]
}
```

### 8.4 Card 模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/cards/generate` | 输入主题 → GPT 生成文本 + DALL-E 生成插图 → 存入 DB + Storage |
| GET | `/api/cards` | 查询用户卡片列表（支持分类筛选、分页、搜索） |
| GET | `/api/cards/[cardId]` | 获取单张卡片详情 |
| PATCH | `/api/cards/[cardId]` | 更新收藏/星标状态、修改分类 |
| DELETE | `/api/cards` | 批量删除卡片 |

生成请求体：
```json
{
  "topic": "贝叶斯定理",
  "categoryId": "uuid | null"
}
```

查询参数：`?category=uuid&search=关键词&page=1&limit=20&sort=created_at`

### 8.5 Document 模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/documents/upload` | 接收 `multipart/form-data`，存入 Supabase Storage，创建 documents 记录 |
| POST | `/api/documents/analyze` | 解析文档文本 → GPT-4o 提取知识点 → 更新 documents.key_points |

分析请求体：
```json
{
  "documentId": "uuid"
}
```

分析响应：
```json
{
  "documentId": "uuid",
  "keyPoints": [
    { "title": "...", "summary": "..." }
  ],
  "status": "completed"
}
```

### 8.6 Categories 模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取当前用户的所有分类 |
| POST | `/api/categories` | 创建新分类 |
| PATCH | `/api/categories` | 更新分类名称/颜色/排序 |
| DELETE | `/api/categories` | 删除分类（关联内容的 category_id 置 NULL） |

---

## 9. 核心功能流程

### 9.1 Explain 流程

```
用户输入问题 → ExplainChat 组件
  → useExplain Hook 拼装 history + preferences
    → POST /api/explain
      → 服务端构建 System Prompt（注入 style + level）
      → openai.chat.completions.create({ stream: true })
      → ReadableStream 逐 chunk 返回
    → 前端 getReader() 逐步渲染消息气泡
  → 对话结束后 → 存入 Supabase conversations 表
```

### 9.2 Quiz 流程

```
用户输入关键词 → QuizForm 组件
  → POST /api/quiz/generate
    → GPT-4o 生成结构化 JSON（经 Zod 校验）
    → 存入 quizzes 表，返回题目 + quizId
  → 用户答题 → QuestionCard 组件管理选中状态
  → 点击提交 → POST /api/quiz/submit
    → 服务端判分 → 存入 quiz_results
    → 返回逐题结果 + 总分
  → QuizResult 展示 → 可选「错题重练」或「重新生成」
```

### 9.3 Card 生成流程

```
用户输入主题 → POST /api/cards/generate
  → 并行执行：
    ├── GPT-4o 生成 title + summary + content
    └── DALL-E 3 根据 title 生成插图 → 上传到 Supabase Storage
  → 写入 cards 表（含 illustration_url）
  → 返回完整卡片数据
  → KnowledgeCard 组件渲染（默认折叠，点击展开）
```

### 9.4 Document Analysis 流程

```
用户上传文件 → FileUploader 组件
  → POST /api/documents/upload（multipart/form-data）
    → 文件存入 Supabase Storage
    → 创建 documents 记录（status: pending）
  → 自动触发 POST /api/documents/analyze
    → 从 Storage 下载文件 → 提取文本（txt 直接读取 / pdf 用 pdf-parse）
    → 文本分块（若超长）→ GPT-4o 提取关键知识点（最多 10 条）
    → 更新 documents.key_points + status: completed
  → 前端轮询或 Supabase Realtime 监听状态变化
  → AnalysisResult 渲染知识点卡片列表
  → 用户可选择「一键生成知识卡片」→ 批量调用 /api/cards/generate
```

---

## 10. 安全与权限策略

**API Key 保护**：OpenAI API Key 和 Supabase Service Role Key 仅存在于 `.env.local`（Vercel 环境变量），所有 AI 调用均在 API Route 中执行，前端无法直接访问。

**认证中间件**：`middleware.ts` 拦截所有 `/api/*`（除 `/api/auth/callback`）和受保护页面，验证 Supabase JWT 有效性，无效则重定向到登录页。

**RLS 行级安全**：所有表开启 RLS，策略确保 `auth.uid() = user_id`，即使绕过 API Route 直接访问数据库也无法读取他人数据。

**文件上传限制**：API Route 校验文件类型（仅 `.txt` / `.pdf`）和大小（建议上限 10MB），拒绝不符合条件的上传。

**Rate Limiting**：建议在 Vercel 层面或 API Route 中添加基于用户的请求频率限制，防止 OpenAI API 费用失控。可使用 `@upstash/ratelimit` + Redis 实现。

**输入清洗**：所有用户输入（问题、关键词、主题）通过 Zod Schema 校验长度和格式，Prompt 注入防护通过 System Prompt 中明确指令边界实现。
