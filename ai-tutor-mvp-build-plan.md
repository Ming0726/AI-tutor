# AI Tutor — MVP 分步构建计划

> **使用方式**：将此文件与 `ai-tutor-architecture.md` 一起放在项目根目录。在 Cursor 中逐个任务执行，每完成一个任务后按「验证清单」测试通过再进入下一个。

---

## 全局约束（每个任务都必须遵守）

```
设计令牌 (Design Tokens):
- 背景色:       #FFF5E6 (暖米色)
- 主强调色:     #F5A623 (橙色)
- 主强调色悬停: #E6951A
- 文字主色:     #3D3D3D
- 文字次色:     #8C8C8C
- 卡片背景:     #FFFFFF
- 卡片边框:     #F0E6D6
- 成功色:       #4CAF50
- 错误色:       #E74C3C
- 圆角:         16px (卡片/按钮/输入框统一)
- 卡片阴影:     0 2px 12px rgba(0,0,0,0.06)
- 字体:         "Nunito", sans-serif (正文) / "Baloo 2", cursive (标题/手绘风)
```

```
技术栈:
- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS 4
- Supabase (@supabase/supabase-js + @supabase/ssr)
- OpenAI SDK (openai ^4.x)
- Zustand (状态管理)
- Zod (校验)
- clsx + tailwind-merge (className 工具)
```

---

## 阶段一：项目基础（任务 1-3）

### 任务 1：初始化 Next.js 项目 + Tailwind 主题配置

**目标**：创建空白项目骨架，配置暖色调主题，确保开发服务器能启动并看到带主题色的欢迎页面。

**操作步骤**：
1. 执行 `npx create-next-app@latest ai-tutor --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` 初始化项目
2. 安装额外依赖：`npm install clsx tailwind-merge`
3. 修改 `tailwind.config.ts`，在 `theme.extend` 中添加自定义颜色：
   ```ts
   colors: {
     cream:   { DEFAULT: '#FFF5E6', dark: '#F5E6D0' },
     accent:  { DEFAULT: '#F5A623', hover: '#E6951A', light: '#FFF0D4' },
     text:    { primary: '#3D3D3D', secondary: '#8C8C8C' },
     card:    { DEFAULT: '#FFFFFF', border: '#F0E6D6' },
     success: '#4CAF50',
     error:   '#E74C3C',
   },
   borderRadius: {
     card: '16px',
   },
   boxShadow: {
     card: '0 2px 12px rgba(0,0,0,0.06)',
   },
   fontFamily: {
     sans:    ['Nunito', 'sans-serif'],
     display: ['Baloo 2', 'cursive'],
   },
   ```
4. 在 `src/app/globals.css` 中导入 Google Fonts（Nunito 400/600/700 + Baloo 2 500/700）
5. 修改 `src/app/layout.tsx`：设置 `<body className="bg-cream text-text-primary font-sans">`
6. 修改 `src/app/page.tsx` 为一个简单的暖色欢迎页：居中显示 "AI Tutor" 标题（font-display）、一个橙色按钮（bg-accent rounded-card）
7. 创建 `src/lib/utils/cn.ts`：导出 `cn()` 函数（clsx + tailwind-merge 合并）

**创建的文件**：
- `tailwind.config.ts`（修改）
- `src/app/globals.css`（修改）
- `src/app/layout.tsx`（修改）
- `src/app/page.tsx`（修改）
- `src/lib/utils/cn.ts`（新建）

**验证清单**：
- [ ] `npm run dev` 启动无报错
- [ ] 浏览器访问 `localhost:3000`，背景色为暖米色 `#FFF5E6`
- [ ] 标题文字使用 Baloo 2 字体
- [ ] 橙色按钮显示，圆角 16px，悬停有颜色变化
- [ ] `cn('px-4', 'px-6')` 正确合并为 `px-6`

---

### 任务 2：创建 Supabase 项目 + 环境变量配置

**目标**：在 Supabase 控制台创建项目，获取密钥，在本地配置环境变量，验证连接可用。

**操作步骤**：
1. 在 [supabase.com](https://supabase.com) 创建新项目 `ai-tutor`，选择离自己最近的区域
2. 从 Project Settings → API 获取以下值：
   - `Project URL`（即 SUPABASE_URL）
   - `anon public key`（即 SUPABASE_ANON_KEY）
   - `service_role secret`（即 SUPABASE_SERVICE_ROLE_KEY）
3. 从 [platform.openai.com](https://platform.openai.com) 获取 `OPENAI_API_KEY`
4. 在项目根目录创建 `.env.local`：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   ```
5. 确认 `.gitignore` 包含 `.env.local`
6. 在 `src/lib/constants.ts` 创建全局常量文件：
   ```ts
   export const EXPLAIN_STYLES = ['professional', 'concise', 'humorous', 'friendly'] as const;
   export const KNOWLEDGE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
   export const DEFAULT_CATEGORIES = ['General', 'Ergonomic', 'MPD', 'Statistic'];
   ```

**创建的文件**：
- `.env.local`（新建，不入版本控制）
- `src/lib/constants.ts`（新建）

**验证清单**：
- [ ] `.env.local` 中四个变量都有值
- [ ] `.gitignore` 包含 `.env.local`
- [ ] `process.env.NEXT_PUBLIC_SUPABASE_URL` 在浏览器控制台可读
- [ ] `constants.ts` 可被其他文件正常导入

---

### 任务 3：初始化 Supabase Client（浏览器端 + 服务端）

**目标**：封装两个 Supabase Client 工厂函数，编写 Next.js 中间件用于刷新 Auth Session。

**操作步骤**：
1. 安装依赖：`npm install @supabase/supabase-js @supabase/ssr`
2. 创建 `src/lib/supabase/client.ts`：
   - 导出 `createBrowserClient()` 函数，使用 `@supabase/ssr` 的 `createBrowserClient` 方法
   - 传入 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 创建 `src/lib/supabase/server.ts`：
   - 导出 `createServerClient()` 异步函数，用于 Server Components 和 API Routes
   - 使用 `@supabase/ssr` 的 `createServerClient` 方法，从 `next/headers` 的 `cookies()` 读写 cookie
4. 创建 `src/lib/supabase/middleware.ts`：
   - 导出 `updateSession(request)` 函数
   - 刷新 Auth Session，确保 cookie 中的 JWT 不过期
5. 创建 `src/middleware.ts`（项目根 src 目录）：
   - 调用 `updateSession`
   - `config.matcher` 排除静态资源路径（`_next/static`, `_next/image`, `favicon.ico`）

**创建的文件**：
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/middleware.ts`

**验证清单**：
- [ ] 项目启动无报错
- [ ] 在任意 Server Component 中调用 `createServerClient()` 不报错
- [ ] 在任意 Client Component 中调用 `createBrowserClient()` 不报错
- [ ] 中间件日志可见请求被拦截（可在 middleware 中加临时 console.log 验证）

---

## 阶段二：用户认证（任务 4-6）

### 任务 4：创建注册页面（Email + Password）

**目标**：实现用户注册页面，用户填写 email 和 password 后调用 Supabase Auth 注册，成功后显示「请查收确认邮件」提示。

**操作步骤**：
1. 创建 `src/app/(auth)/layout.tsx`：居中布局，暖米色背景，中间白色卡片容器（`max-w-md mx-auto mt-20 bg-card rounded-card shadow-card p-8`）
2. 创建 `src/app/(auth)/register/page.tsx`：
   - 标题 "Create Account"（font-display）
   - Email 输入框 + Password 输入框 + 确认密码输入框
   - 橙色 "Sign Up" 按钮
   - 底部 "Already have an account? Log in" 链接
3. 表单提交逻辑：
   - 客户端组件（`'use client'`）
   - 使用 `createBrowserClient()` 调用 `supabase.auth.signUp({ email, password })`
   - 校验：密码长度 ≥ 8，两次输入一致
   - 成功：显示绿色提示 "Please check your email to confirm your account"
   - 失败：显示红色错误信息
4. 创建通用 UI 组件 `src/components/ui/Button.tsx`：
   - Props：`variant` ('primary' | 'secondary' | 'ghost'), `size` ('sm' | 'md' | 'lg'), `loading` (boolean)
   - primary 样式：`bg-accent text-white rounded-card hover:bg-accent-hover`
   - loading 状态：显示 spinner + 禁用点击
5. 创建通用 UI 组件 `src/components/ui/Input.tsx`：
   - Props：`label`, `error`, 原生 input props
   - 样式：`border border-card-border rounded-card px-4 py-3 focus:border-accent focus:ring-accent`

**创建的文件**：
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`

**验证清单**：
- [ ] 访问 `/register` 显示注册表单，暖米色背景 + 白色卡片
- [ ] 密码不匹配时显示红色错误提示
- [ ] 填写有效 email + password 点击注册，Supabase Dashboard → Authentication → Users 中出现新用户
- [ ] 注册成功后页面显示确认邮件提示
- [ ] Button 组件 loading 状态显示 spinner

---

### 任务 5：创建登录页面 + OAuth 回调

**目标**：实现 Email/Password 登录页面，登录成功后跳转首页。配置 OAuth 回调路由（为未来 Google 登录预留）。

**操作步骤**：
1. 创建 `src/app/(auth)/login/page.tsx`：
   - 标题 "Welcome Back"（font-display）
   - Email 输入框 + Password 输入框
   - 橙色 "Log In" 按钮
   - 底部 "Don't have an account? Sign up" 链接
   - 表单提交：`supabase.auth.signInWithPassword({ email, password })`
   - 成功：`router.push('/')` 跳转首页
   - 失败：显示 "Invalid email or password" 错误
2. 创建 `src/app/api/auth/callback/route.ts`：
   - GET 请求处理
   - 从 `searchParams` 获取 `code`
   - 使用 `createServerClient()` 调用 `supabase.auth.exchangeCodeForSession(code)`
   - 成功后 `redirect('/')`，失败 `redirect('/login?error=auth_failed')`
3. 在 Supabase Dashboard → Authentication → URL Configuration：
   - 将 `http://localhost:3000/api/auth/callback` 添加到 Redirect URLs

**创建的文件**：
- `src/app/(auth)/login/page.tsx`
- `src/app/api/auth/callback/route.ts`

**验证清单**：
- [ ] 访问 `/login` 显示登录表单
- [ ] 使用任务 4 注册的邮箱登录成功后自动跳转到 `/`
- [ ] 输入错误密码时显示错误提示
- [ ] Login ↔ Register 页面链接可相互跳转
- [ ] `/api/auth/callback?code=xxx` 路由存在且不报 500

---

### 任务 6：实现登出 + 路由保护 + useAuth Hook

**目标**：创建 `useAuth` Hook 管理登录态，保护需要登录的路由，未登录用户自动跳转到 `/login`。

**操作步骤**：
1. 创建 `src/hooks/useAuth.ts`：
   - 使用 `createBrowserClient()` 获取 Supabase 实例
   - 暴露 `user`（当前用户）、`loading`（初始加载中）、`signOut` 方法
   - 使用 `supabase.auth.getSession()` 初始化
   - 使用 `supabase.auth.onAuthStateChange()` 监听变化
   - `signOut`：调用 `supabase.auth.signOut()` → `router.push('/login')`
2. 创建 `src/components/layout/AuthGuard.tsx`：
   - 包裹需要登录的页面
   - 使用 `useAuth()`
   - loading 时显示全屏 Skeleton
   - 未登录时 `redirect('/login')`
   - 已登录时渲染 `children`
3. 修改 `src/app/layout.tsx`：
   - 不在这里加 AuthGuard（auth 页面不需要保护）
4. 创建 `src/app/(protected)/layout.tsx`：
   - 新的路由组，使用 `AuthGuard` 包裹
   - 后续所有需登录的页面都放在 `(protected)` 下
5. 将 `src/app/page.tsx`（首页）移动到 `src/app/(protected)/page.tsx`
6. 在首页临时显示用户邮箱 + 一个 "Log Out" 按钮用于验证

**创建的文件**：
- `src/hooks/useAuth.ts`
- `src/components/layout/AuthGuard.tsx`
- `src/app/(protected)/layout.tsx`
- `src/app/(protected)/page.tsx`（从原 page.tsx 移动）

**验证清单**：
- [ ] 未登录访问 `/` 自动跳转到 `/login`
- [ ] 登录后访问 `/` 显示用户邮箱
- [ ] 点击 "Log Out" 按钮后跳回 `/login`
- [ ] 登出后直接访问 `/` 再次被拦截
- [ ] 浏览器刷新后登录态保持（Session 有效期内）

---

## 阶段三：数据库建表（任务 7-10）

### 任务 7：创建 users 和 categories 表 + Auth Trigger

**目标**：在 Supabase 中创建 `users` 扩展表和 `categories` 表，配置新用户注册时自动创建 profile 的触发器，并预置默认分类。

**操作步骤**：
1. 在 Supabase Dashboard → SQL Editor 中执行以下 SQL：
   ```sql
   -- users 扩展表
   CREATE TABLE public.users (
     id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     email         TEXT NOT NULL,
     display_name  TEXT,
     avatar_url    TEXT,
     preferences   JSONB DEFAULT '{"explainStyle":"friendly","knowledgeLevel":"intermediate"}'::jsonb,
     created_at    TIMESTAMPTZ DEFAULT now(),
     updated_at    TIMESTAMPTZ DEFAULT now()
   );

   -- 新用户注册时自动创建 profile
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.users (id, email, display_name)
     VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
     -- 同时插入默认分类
     INSERT INTO public.categories (user_id, name, is_default, sort_order) VALUES
       (NEW.id, 'General', true, 0),
       (NEW.id, 'Ergonomic', true, 1),
       (NEW.id, 'MPD', true, 2),
       (NEW.id, 'Statistic', true, 3);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

   -- categories 表
   CREATE TABLE public.categories (
     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
     name        TEXT NOT NULL,
     color       TEXT DEFAULT '#F5A623',
     sort_order  INT DEFAULT 0,
     is_default  BOOLEAN DEFAULT false,
     created_at  TIMESTAMPTZ DEFAULT now(),
     UNIQUE(user_id, name)
   );

   CREATE INDEX idx_categories_user ON public.categories(user_id);
   ```
2. 将此 SQL 也保存到 `supabase/migrations/001_users_and_categories.sql`

**创建的文件**：
- `supabase/migrations/001_users_and_categories.sql`

**验证清单**：
- [ ] 在 Supabase Dashboard → Table Editor 中可以看到 `users` 和 `categories` 表
- [ ] 注册一个新用户后，`users` 表自动出现一行数据
- [ ] 同时 `categories` 表自动出现 4 行默认分类（General, Ergonomic, MPD, Statistic）
- [ ] `categories` 表的 `user_id` 外键指向 `users.id`

---

### 任务 8：创建 cards 和 documents 表

**目标**：创建知识卡片表和文档表，包含所有字段、索引和外键关系。

**操作步骤**：
1. 在 Supabase SQL Editor 执行：
   ```sql
   CREATE TABLE public.cards (
     id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
     category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
     title             TEXT NOT NULL,
     summary           TEXT NOT NULL,
     content           TEXT NOT NULL,
     illustration_url  TEXT,
     source            TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'document_analysis')),
     source_document_id UUID,
     is_favorited      BOOLEAN DEFAULT false,
     is_starred        BOOLEAN DEFAULT false,
     created_at        TIMESTAMPTZ DEFAULT now(),
     updated_at        TIMESTAMPTZ DEFAULT now()
   );

   CREATE INDEX idx_cards_user ON public.cards(user_id);
   CREATE INDEX idx_cards_category ON public.cards(category_id);
   CREATE INDEX idx_cards_created ON public.cards(created_at DESC);

   CREATE TABLE public.documents (
     id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
     file_name     TEXT NOT NULL,
     file_type     TEXT NOT NULL CHECK (file_type IN ('txt', 'pdf')),
     storage_path  TEXT NOT NULL,
     file_size     INT,
     key_points    JSONB DEFAULT '[]'::jsonb,
     status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
     created_at    TIMESTAMPTZ DEFAULT now()
   );

   CREATE INDEX idx_documents_user ON public.documents(user_id);

   -- 给 cards 添加外键引用 documents
   ALTER TABLE public.cards
     ADD CONSTRAINT fk_cards_source_document
     FOREIGN KEY (source_document_id) REFERENCES public.documents(id) ON DELETE SET NULL;
   ```
2. 保存到 `supabase/migrations/002_cards_and_documents.sql`

**创建的文件**：
- `supabase/migrations/002_cards_and_documents.sql`

**验证清单**：
- [ ] `cards` 表存在，包含所有 12 个字段
- [ ] `documents` 表存在，包含所有 8 个字段
- [ ] 手动插入一条 card 数据（`user_id` 使用已有用户），插入成功
- [ ] `cards.source` 字段只接受 'manual' 或 'document_analysis'
- [ ] `documents.status` 字段只接受 'pending', 'processing', 'completed', 'failed'

---

### 任务 9：创建 quizzes、quiz_results 和 conversations 表

**目标**：创建测验、答题结果和对话记录三张表。

**操作步骤**：
1. 在 Supabase SQL Editor 执行：
   ```sql
   CREATE TABLE public.quizzes (
     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
     category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
     keyword     TEXT NOT NULL,
     questions   JSONB NOT NULL,
     created_at  TIMESTAMPTZ DEFAULT now()
   );

   CREATE INDEX idx_quizzes_user ON public.quizzes(user_id);

   CREATE TABLE public.quiz_results (
     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     quiz_id     UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
     user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
     answers     JSONB NOT NULL,
     score       INT NOT NULL,
     total       INT NOT NULL,
     wrong_ids   TEXT[] DEFAULT '{}',
     created_at  TIMESTAMPTZ DEFAULT now()
   );

   CREATE INDEX idx_quiz_results_user ON public.quiz_results(user_id);
   CREATE INDEX idx_quiz_results_quiz ON public.quiz_results(quiz_id);

   CREATE TABLE public.conversations (
     id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
     category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
     title           TEXT,
     messages        JSONB NOT NULL DEFAULT '[]'::jsonb,
     explain_style   TEXT DEFAULT 'friendly',
     knowledge_level TEXT DEFAULT 'intermediate',
     created_at      TIMESTAMPTZ DEFAULT now(),
     updated_at      TIMESTAMPTZ DEFAULT now()
   );

   CREATE INDEX idx_conversations_user ON public.conversations(user_id);
   ```
2. 保存到 `supabase/migrations/003_quizzes_and_conversations.sql`

**创建的文件**：
- `supabase/migrations/003_quizzes_and_conversations.sql`

**验证清单**：
- [ ] 三张表（quizzes, quiz_results, conversations）均存在
- [ ] `quiz_results.quiz_id` 外键指向 `quizzes.id`
- [ ] 手动插入一个 quiz（`questions` 使用示例 JSON），插入成功
- [ ] 手动插入一个 conversation（`messages` 使用示例 JSON），插入成功
- [ ] 删除一个 quiz 后其关联的 quiz_results 自动删除（CASCADE）

---

### 任务 10：配置全表 RLS 策略 + Supabase Storage Bucket

**目标**：为所有 7 张表启用行级安全策略，创建文件存储 Bucket。

**操作步骤**：
1. 在 Supabase SQL Editor 执行 RLS 策略：
   ```sql
   -- 启用 RLS
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

   -- users: 只能读写自己的 profile
   CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

   -- categories: 完整 CRUD 自己的分类
   CREATE POLICY "categories_all_own" ON public.categories FOR ALL USING (auth.uid() = user_id);

   -- cards
   CREATE POLICY "cards_all_own" ON public.cards FOR ALL USING (auth.uid() = user_id);

   -- documents
   CREATE POLICY "documents_all_own" ON public.documents FOR ALL USING (auth.uid() = user_id);

   -- quizzes
   CREATE POLICY "quizzes_all_own" ON public.quizzes FOR ALL USING (auth.uid() = user_id);

   -- quiz_results
   CREATE POLICY "quiz_results_all_own" ON public.quiz_results FOR ALL USING (auth.uid() = user_id);

   -- conversations
   CREATE POLICY "conversations_all_own" ON public.conversations FOR ALL USING (auth.uid() = user_id);
   ```
2. 在 Supabase Dashboard → Storage 创建两个 Bucket：
   - `documents`：Private，用于用户上传的 .txt/.pdf 文件
   - `illustrations`：Public，用于 AI 生成的卡片插图（需要公开访问展示）
3. 为 Storage Bucket 配置策略：
   ```sql
   -- documents bucket: 用户只能操作自己的文件夹
   CREATE POLICY "documents_upload" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
   CREATE POLICY "documents_read" ON storage.objects
     FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- illustrations bucket: 登录用户可上传，所有人可读
   CREATE POLICY "illustrations_upload" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'illustrations' AND auth.role() = 'authenticated');
   CREATE POLICY "illustrations_read" ON storage.objects
     FOR SELECT USING (bucket_id = 'illustrations');
   ```
4. 保存到 `supabase/migrations/004_rls_and_storage.sql`

**创建的文件**：
- `supabase/migrations/004_rls_and_storage.sql`

**验证清单**：
- [ ] 所有 7 张表在 Dashboard 中显示 "RLS enabled"
- [ ] 使用 anon key 直接查询 `cards` 表返回空（RLS 拦截）
- [ ] 登录用户只能看到自己的 categories
- [ ] Storage 中存在 `documents`（Private）和 `illustrations`（Public）两个 Bucket
- [ ] 在 `illustrations` Bucket 手动上传一张图片，可通过公开 URL 访问

---

## 阶段四：首页 UI（任务 11-15）

### 任务 11：创建 TopBar 组件（搜索框 + 新建按钮 + 菜单图标）

**目标**：构建页面顶部栏，包含搜索输入框、"新建" 按钮、侧边栏菜单触发图标。

**操作步骤**：
1. 安装 Zustand：`npm install zustand`
2. 创建 `src/stores/uiStore.ts`：
   - state：`sidebarOpen` (boolean), `searchQuery` (string), `selectedCategoryId` (string | null)
   - actions：`toggleSidebar()`, `setSearchQuery(q)`, `setSelectedCategoryId(id)`
3. 创建 `src/components/layout/TopBar.tsx`：
   - 左侧：汉堡菜单图标（三条横线 SVG，手绘风格，圆角端点），点击调用 `toggleSidebar()`
   - 中间：搜索输入框（`placeholder="Search cards..."`，左侧放大镜图标，`rounded-card bg-white border-card-border`）
   - 右侧：橙色圆形 "+" 按钮（`bg-accent text-white w-10 h-10 rounded-full`）
   - 整体高度 64px，`sticky top-0 z-50 bg-cream`
   - 搜索输入时调用 `setSearchQuery()`（带 300ms debounce）
4. 在 `src/app/(protected)/page.tsx` 中引入 TopBar 组件验证显示

**创建的文件**：
- `src/stores/uiStore.ts`
- `src/components/layout/TopBar.tsx`

**验证清单**：
- [ ] 首页顶部显示 TopBar，背景暖米色
- [ ] 搜索框有放大镜图标，输入文字后 uiStore.searchQuery 更新
- [ ] "+" 按钮为橙色圆形
- [ ] 汉堡菜单图标点击后 `sidebarOpen` 变为 true

---

### 任务 12：创建 Sidebar 侧边导航组件

**目标**：实现从左侧滑入的侧边导航菜单，包含用户信息、功能模块入口和登出按钮。

**操作步骤**：
1. 创建 `src/components/layout/Sidebar.tsx`：
   - 使用 `uiStore.sidebarOpen` 控制显隐
   - 打开时：左侧抽屉滑入（`translate-x-0`），右侧半透明遮罩层
   - 关闭时：`-translate-x-full` 滑出
   - 过渡动画：`transition-transform duration-300 ease-in-out`
   - 内容从上到下：
     - 用户头像（圆形占位图）+ display_name + email
     - 分割线
     - 导航链接（各用一个手绘风 SVG 图标 + 文字）：
       - 🏠 Home（`/`）
       - 💡 Explain（`/explain`）
       - 📝 Quiz（`/quiz`）
       - 🗂 Cards（`/cards`）
       - 📄 Documents（`/documents`）
       - ⚙️ Settings（`/settings`）
     - 底部："Log Out" 按钮（调用 `useAuth().signOut()`）
   - 点击遮罩或导航链接时自动关闭 Sidebar
2. 在 `src/app/(protected)/layout.tsx` 中添加 Sidebar（与 `{children}` 同级）

**创建的文件**：
- `src/components/layout/Sidebar.tsx`

**验证清单**：
- [ ] 点击 TopBar 的汉堡菜单，Sidebar 从左侧滑入
- [ ] Sidebar 显示用户邮箱
- [ ] 点击 "Explain" 链接跳转到 `/explain`（虽然页面还没建，URL 变化即可）
- [ ] 点击遮罩层关闭 Sidebar
- [ ] 点击 "Log Out" 成功登出并跳转到 `/login`

---

### 任务 13：创建 CategoryBar 分类标签栏

**目标**：在首页 TopBar 下方展示可横向滚动的分类标签栏，从 Supabase 读取用户的分类数据。

**操作步骤**：
1. 创建 `src/hooks/useCategories.ts`：
   - 使用 `createBrowserClient()` 查询 `categories` 表（`order by sort_order`）
   - 暴露 `categories`, `loading`, `error`
   - 使用 `useEffect` + `useState` 实现
2. 创建 `src/components/layout/CategoryBar.tsx`：
   - 横向滚动容器（`overflow-x-auto scrollbar-hide flex gap-2 px-4 py-3`）
   - 首个标签固定为 "All"（选中时表示不筛选）
   - 每个标签：`rounded-full px-4 py-1.5 text-sm font-semibold`
   - 选中态：`bg-accent text-white`
   - 未选中态：`bg-white text-text-secondary border border-card-border`
   - 点击标签调用 `uiStore.setSelectedCategoryId(id)`（"All" 传 null）
3. 在首页 TopBar 下方引入 CategoryBar

**创建的文件**：
- `src/hooks/useCategories.ts`
- `src/components/layout/CategoryBar.tsx`

**验证清单**：
- [ ] 首页显示 "All | General | Ergonomic | MPD | Statistic" 标签
- [ ] 默认 "All" 选中（橙色背景白色文字）
- [ ] 点击其他标签，该标签变为选中态，"All" 恢复未选中
- [ ] 标签超出屏幕宽度时可横向滚动
- [ ] 标签数据来自 Supabase（在 Dashboard 中添加一个分类后刷新页面可见）

---

### 任务 14：创建 KnowledgeCard 和 CardGrid 瀑布流组件

**目标**：实现首页的瀑布流卡片布局和单张知识卡片组件（使用 Mock 数据）。

**操作步骤**：
1. 创建 `src/components/cards/KnowledgeCard.tsx`：
   - Props：`card: { id, title, summary, illustration_url, is_favorited, is_starred, category_name }`
   - 布局从上到下：
     - 插图区域（若有 illustration_url 显示图片，否则显示渐变色占位，`rounded-t-card`）
     - 分类 Badge（绝对定位在图片右上角，`bg-accent/80 text-white text-xs rounded-full px-2 py-0.5`）
     - 标题（`font-display text-lg font-bold text-text-primary`，最多两行 `line-clamp-2`）
     - 摘要（`text-sm text-text-secondary line-clamp-3`）
     - 底部操作栏：Heart 收藏按钮（空心/实心切换）+ Star 按钮
   - 整体样式：`bg-card rounded-card shadow-card overflow-hidden hover:shadow-lg transition-shadow`
   - 点击卡片区域（非按钮区域）跳转到 `/cards/[id]`（暂时只 console.log）
2. 创建 `src/components/cards/FavoriteButton.tsx`：
   - Props：`active`, `icon` ('heart' | 'star'), `onClick`
   - active 时填充橙色，非 active 时灰色描边
   - 点击有缩放动画（`scale-125` 后恢复）
3. 创建 `src/components/cards/CardGrid.tsx`：
   - 使用 CSS columns 实现瀑布流：`columns-1 sm:columns-2 lg:columns-3 gap-4`
   - 每个 KnowledgeCard 加 `break-inside-avoid mb-4`
   - Props：`cards[]` 数组
4. 在首页添加 6-8 条 Mock 数据（不同标题长度、有/无插图），渲染 CardGrid

**创建的文件**：
- `src/components/cards/KnowledgeCard.tsx`
- `src/components/cards/FavoriteButton.tsx`
- `src/components/cards/CardGrid.tsx`

**验证清单**：
- [ ] 首页显示瀑布流布局的卡片（桌面端 3 列，平板 2 列，手机 1 列）
- [ ] 每张卡片有圆角、阴影、标题、摘要
- [ ] Heart 按钮点击后变为实心橙色，再点恢复空心
- [ ] 卡片间距均匀，无重叠
- [ ] 不同高度的卡片正确错落排列（瀑布流效果）

---

### 任务 15：首页接入真实数据 + 搜索与分类筛选

**目标**：将首页卡片从 Mock 数据切换为 Supabase 真实数据，实现搜索和分类筛选功能。

**操作步骤**：
1. 创建 `src/hooks/useCards.ts`：
   - 参数：`{ categoryId?: string, searchQuery?: string }`
   - 使用 `createBrowserClient()` 查询 `cards` 表
   - 查询逻辑：
     - 若 `categoryId` 不为 null → `eq('category_id', categoryId)`
     - 若 `searchQuery` 不为空 → `or('title.ilike.%${q}%,summary.ilike.%${q}%')`
     - 按 `created_at` 降序排列
   - 左连接 `categories` 表获取分类名称
   - 暴露 `cards`, `loading`, `error`, `refetch()`
2. 修改 `src/app/(protected)/page.tsx`：
   - 从 `uiStore` 读取 `searchQuery` 和 `selectedCategoryId`
   - 传入 `useCards({ categoryId, searchQuery })`
   - loading 时在 CardGrid 位置显示 3-6 个 Skeleton 占位卡片
   - 无数据时显示空状态：手绘风的空盒子插图 + "No cards yet. Create your first one!" + 橙色 "Create Card" 按钮
3. 创建 `src/components/ui/Skeleton.tsx`：
   - 矩形脉冲动画组件（`animate-pulse bg-card-border rounded-card`）
   - Props：`width`, `height`, `className`
4. 在 Supabase Dashboard 手动插入 2-3 条 cards 数据用于测试

**创建的文件**：
- `src/hooks/useCards.ts`
- `src/components/ui/Skeleton.tsx`
- 修改 `src/app/(protected)/page.tsx`

**验证清单**：
- [ ] 首页从 Supabase 加载卡片数据并渲染
- [ ] 加载过程中显示 Skeleton 占位
- [ ] 在搜索框输入关键词后，卡片列表实时筛选
- [ ] 点击分类标签后，仅显示该分类下的卡片
- [ ] 点击 "All" 标签恢复显示全部
- [ ] 无数据时显示空状态提示

---

## 阶段五：Explain 功能（任务 16-20）

### 任务 16：创建 Explain 页面布局 + 聊天消息气泡

**目标**：搭建 Explain 页面的基础聊天 UI，能显示静态的对话消息列表。

**操作步骤**：
1. 创建 `src/app/(protected)/explain/page.tsx`：
   - 整体布局：顶部标题栏 + 中间消息列表（flex-1 overflow-y-auto）+ 底部输入栏
   - 顶部：返回箭头 + "AI Explain" 标题（font-display）
2. 创建 `src/components/explain/MessageBubble.tsx`：
   - Props：`role` ('user' | 'assistant'), `content` (string), `timestamp?` (string)
   - 用户消息：靠右对齐，`bg-accent text-white rounded-card rounded-br-sm`
   - AI 消息：靠左对齐，`bg-white text-text-primary rounded-card rounded-bl-sm shadow-card`
   - AI 消息前加一个小机器人头像（手绘风 SVG）
   - 内容支持基础 Markdown 渲染（加粗、列表、代码块）——安装 `react-markdown`
3. 创建 `src/components/explain/ExplainChat.tsx`：
   - 管理 `messages` state（`useState<Message[]>`）
   - 渲染 MessageBubble 列表
   - 新消息加入后自动滚动到底部（`useRef` + `scrollIntoView`）
   - 临时使用 Mock 消息验证 UI
4. 底部输入栏：文本输入框 + 发送按钮（橙色圆形箭头图标）
   - 输入框样式与 TopBar 搜索框一致
   - 空内容时发送按钮禁用（灰色）

**创建的文件**：
- `src/app/(protected)/explain/page.tsx`
- `src/components/explain/MessageBubble.tsx`
- `src/components/explain/ExplainChat.tsx`

**依赖安装**：`npm install react-markdown`

**验证清单**：
- [ ] 访问 `/explain` 显示聊天界面
- [ ] Mock 消息正确渲染（用户消息靠右橙色，AI 消息靠左白色）
- [ ] AI 消息中的 Markdown（加粗、代码）正确渲染
- [ ] 消息列表可滚动，新消息自动滚到底部
- [ ] 底部输入框可输入文字，空内容时发送按钮禁用

---

### 任务 17：创建 StyleSelector（回答风格 + 知识水平选择器）

**目标**：在 Explain 页面顶部添加风格和知识水平选择器，使用 Zustand 持久化用户偏好。

**操作步骤**：
1. 安装：`npm install zustand`（如未安装）
2. 创建 `src/stores/preferencesStore.ts`：
   - state：`explainStyle`（默认 'friendly'）, `knowledgeLevel`（默认 'intermediate'）
   - actions：`setExplainStyle(s)`, `setKnowledgeLevel(l)`
   - 使用 Zustand `persist` 中间件，存储 key 为 `ai-tutor-preferences`
3. 创建 `src/components/explain/StyleSelector.tsx`：
   - 两行选择器，紧凑排列在聊天区域上方
   - 第一行 "Style"：4 个胶囊按钮（Professional / Concise / Humorous / Friendly）
   - 第二行 "Level"：3 个胶囊按钮（Beginner / Intermediate / Advanced）
   - 选中态：`bg-accent text-white`
   - 未选中态：`bg-white text-text-secondary border border-card-border`
   - 点击更新 `preferencesStore`
   - 可折叠：默认展开，点击 "▾ Preferences" 标题可收起
4. 在 ExplainChat 中引入 StyleSelector，放在消息列表上方

**创建的文件**：
- `src/stores/preferencesStore.ts`
- `src/components/explain/StyleSelector.tsx`

**验证清单**：
- [ ] Explain 页面显示 Style 和 Level 两行选择器
- [ ] 点击 "Humorous" 后刷新页面，仍然选中 "Humorous"（localStorage 持久化）
- [ ] 选择器可收起/展开
- [ ] 各按钮选中态为橙色背景，未选中为白色

---

### 任务 18：创建 OpenAI Client + Explain Prompt 模板

**目标**：封装 OpenAI SDK 初始化，编写 Explain 模块的 System Prompt 模板，支持根据 style 和 level 动态生成。

**操作步骤**：
1. 安装 OpenAI SDK：`npm install openai`
2. 创建 `src/lib/openai/client.ts`：
   - 导出 `openai` 实例：`new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`
   - 仅在服务端使用
3. 创建 `src/lib/openai/prompts.ts`：
   - 导出 `getExplainSystemPrompt(style, level)` 函数
   - 根据 style 参数切换语气描述：
     - professional → "Use formal academic language, cite relevant theories..."
     - concise → "Be brief and to the point, use bullet points..."
     - humorous → "Use analogies, jokes, and fun examples..."
     - friendly → "Be warm and encouraging, use simple language..."
   - 根据 level 参数切换深度描述：
     - beginner → "Assume no prior knowledge, explain from basics..."
     - intermediate → "Assume foundational knowledge, focus on connections..."
     - advanced → "Assume expert-level background, discuss nuances..."
   - 通用指令：始终使用用户的提问语言回复，使用 Markdown 格式化
4. 创建 `src/lib/openai/parsers.ts`：
   - 导出 `safeJSONParse<T>(text: string, fallback: T): T` 工具函数
   - 尝试 `JSON.parse`，失败时尝试提取 ```json 代码块后再次解析
5. 安装 Zod：`npm install zod`
6. 创建 `src/lib/utils/validators.ts`：
   - 导出 `explainRequestSchema`：`z.object({ message: z.string().min(1).max(2000), style, level, history, conversationId })`

**创建的文件**：
- `src/lib/openai/client.ts`
- `src/lib/openai/prompts.ts`
- `src/lib/openai/parsers.ts`
- `src/lib/utils/validators.ts`

**验证清单**：
- [ ] `getExplainSystemPrompt('humorous', 'beginner')` 返回包含幽默和初学者提示的字符串
- [ ] `safeJSONParse('{"a":1}', {})` 返回 `{a: 1}`
- [ ] `safeJSONParse('bad json', {})` 返回 `{}`
- [ ] `explainRequestSchema.parse({ message: "test", style: "friendly", level: "beginner", history: [] })` 通过校验
- [ ] `openai` 实例创建不报错（需要有效的 OPENAI_API_KEY）

---

### 任务 19：创建 Explain API Route（流式输出）

**目标**：实现 `/api/explain` POST 路由，接收用户问题，调用 GPT-4o 流式返回解释。

**操作步骤**：
1. 创建 `src/app/api/explain/route.ts`：
   - POST handler
   - 步骤：
     a. 使用 `createServerClient()` 获取当前用户（`supabase.auth.getUser()`），未登录返回 401
     b. 解析请求体，用 `explainRequestSchema` 校验
     c. 构建 messages 数组：`[systemPrompt, ...history, newMessage]`
     d. 调用 `openai.chat.completions.create({ model: 'gpt-4o', messages, stream: true })`
     e. 使用 `ReadableStream` + `TextEncoder` 将 chunk 逐个编码推送
     f. 返回 `new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })`
   - 流结束后，异步保存/更新 `conversations` 表（不阻塞响应）

**创建的文件**：
- `src/app/api/explain/route.ts`

**验证清单**：
- [ ] 使用 curl 测试：`curl -X POST http://localhost:3000/api/explain -H "Content-Type: application/json" -d '{"message":"什么是量子力学?","style":"friendly","level":"beginner","history":[]}' --cookie "..."` 返回流式文本
- [ ] 未登录时返回 401
- [ ] 空 message 时返回 400
- [ ] 响应头包含 `Content-Type: text/event-stream`
- [ ] 完整响应是合理的中文解释（匹配 friendly + beginner 风格）

---

### 任务 20：前端对接 Explain 流式输出 + 多轮对话

**目标**：将 ExplainChat 组件接入真实 API，实现流式渲染和多轮对话。

**操作步骤**：
1. 创建 `src/hooks/useExplain.ts`：
   - 管理 `messages` state, `isStreaming` state, `conversationId` state
   - `sendMessage(content: string)` 方法：
     a. 将用户消息加入 messages
     b. 创建一个空的 assistant 消息占位
     c. `fetch('/api/explain', { method: 'POST', body })`
     d. 获取 `response.body.getReader()`
     e. 循环 `reader.read()`，每次将 `chunk` 追加到 assistant 消息的 content 中
     f. 流结束后设 `isStreaming = false`
   - `clearConversation()` 方法：重置 messages 和 conversationId
2. 修改 `ExplainChat.tsx`：
   - 使用 `useExplain()` 替代 Mock 数据
   - 从 `preferencesStore` 读取 style 和 level 传给 hook
   - 发送按钮在 streaming 时显示 "stop" 图标（可选停止流）
   - AI 消息在 streaming 时末尾显示闪烁光标 `|`
3. 多轮对话：发送新消息时自动携带之前的 messages 作为 history

**创建的文件**：
- `src/hooks/useExplain.ts`
- 修改 `src/components/explain/ExplainChat.tsx`

**验证清单**：
- [ ] 在输入框输入 "什么是梯度下降？"，按发送后 AI 消息逐字流式出现
- [ ] 流式过程中显示闪烁光标
- [ ] 切换 Style 为 "Humorous" 后再提问，AI 回答风格明显不同
- [ ] 追问 "能举个例子吗？"，AI 基于上下文回答（不重复解释概念）
- [ ] 网络错误时显示错误提示（可临时断网测试）

---

## 阶段六：Quiz 功能（任务 21-25）

### 任务 21：创建 Quiz 入口页面 + QuizForm 组件

**目标**：搭建 Quiz 页面 UI，用户可输入关键词和选择题目数量，点击生成。

**操作步骤**：
1. 创建 `src/app/(protected)/quiz/page.tsx`：
   - 顶部：返回箭头 + "AI Quiz" 标题（font-display）
   - 中间：QuizForm 组件
   - 下方：历史测验列表区域（暂时空白，显示 "Your quizzes will appear here"）
2. 创建 `src/components/quiz/QuizForm.tsx`：
   - 关键词输入框（`placeholder="Enter a topic, e.g. Linear Algebra"`）
   - 题目数量选择器：3 个胶囊按钮（5 / 8 / 10 题），默认选中 5
   - 橙色 "Generate Quiz" 按钮（全宽）
   - 空输入时按钮禁用
   - 点击后触发 `onGenerate({ keyword, count })` 回调
3. 为 QuizForm 使用暖色调卡片容器包裹（`bg-card rounded-card shadow-card p-6`）

**创建的文件**：
- `src/app/(protected)/quiz/page.tsx`
- `src/components/quiz/QuizForm.tsx`

**验证清单**：
- [ ] 访问 `/quiz` 显示测验入口页面
- [ ] 输入框可输入关键词
- [ ] 题目数量可选择 5 / 8 / 10
- [ ] 空输入时 "Generate Quiz" 按钮为禁用态
- [ ] 输入关键词后按钮可点击（console.log 输出 `{ keyword, count }`）

---

### 任务 22：创建 Quiz Generate API Route

**目标**：实现 `/api/quiz/generate` 路由，调用 GPT-4o 生成结构化多选题 JSON。

**操作步骤**：
1. 在 `src/lib/openai/prompts.ts` 中添加 `getQuizSystemPrompt(count: number)` 函数：
   - 要求 GPT-4o 生成指定数量的多选题
   - 返回严格 JSON 格式：`{ questions: [{ id, question, options: string[4], correctIndex: 0-3, explanation }] }`
   - 强调：选项必须恰好 4 个，correctIndex 范围 0-3，explanation 解释为什么正确答案是对的
2. 在 `src/lib/utils/validators.ts` 中添加 `quizGenerateSchema` 和 `quizQuestionsSchema`：
   - 请求校验：`{ keyword: z.string().min(1).max(200), count: z.enum(['5','8','10']), categoryId: z.string().uuid().optional() }`
   - 响应校验：验证 GPT 返回的 JSON 结构是否合法
3. 创建 `src/app/api/quiz/generate/route.ts`：
   - POST handler
   - 验证用户身份
   - 调用 GPT-4o（非流式，`response_format: { type: "json_object" }`）
   - 用 Zod 校验返回的 JSON
   - 存入 `quizzes` 表
   - 返回 `{ quizId, questions }`（questions 中 **不包含** correctIndex，防止前端作弊）

**创建的文件**：
- 修改 `src/lib/openai/prompts.ts`
- 修改 `src/lib/utils/validators.ts`
- `src/app/api/quiz/generate/route.ts`

**验证清单**：
- [ ] POST `/api/quiz/generate` `{ "keyword": "photosynthesis", "count": "5" }` 返回 5 道题
- [ ] 每道题有 4 个选项
- [ ] 返回的 questions 中没有 correctIndex 字段
- [ ] Supabase `quizzes` 表新增一行，`questions` JSONB 包含完整数据（含 correctIndex）
- [ ] 无效输入（空关键词）返回 400

---

### 任务 23：创建 QuestionCard 答题组件 + 答题页面

**目标**：用户看到生成的题目后，可以逐题选择答案。

**操作步骤**：
1. 创建 `src/types/quiz.ts`：
   - `Question`：`{ id, question, options: string[] }`（前端版本，无 correctIndex）
   - `QuizState`：`{ quizId, questions, answers: Record<string, number>, submitted: boolean }`
2. 创建 `src/components/quiz/QuestionCard.tsx`：
   - Props：`question`, `index`, `selectedIndex`, `onSelect`, `result?`（提交后的对错信息）
   - 布局：题号 + 题目文字 + 4 个选项按钮
   - 选项按钮：大圆角，选中态 `border-accent bg-accent/10`，未选中态 `border-card-border bg-white`
   - 提交后：正确选项加绿色边框 + ✓，错误选项加红色边框 + ✗
   - 整体容器：`bg-card rounded-card shadow-card p-5 mb-4`
3. 修改 `src/app/(protected)/quiz/page.tsx`：
   - 使用 `useState` 管理 `quizState`
   - QuizForm 的 `onGenerate` 调用 `/api/quiz/generate`，成功后进入答题模式
   - 答题模式：隐藏 QuizForm，显示 QuestionCard 列表 + 底部 "Submit Answers" 按钮
   - "Submit" 按钮：只有所有题目都已选择答案时才可点击
4. 创建 `src/hooks/useQuiz.ts`：
   - 管理 `generateQuiz(keyword, count)` → fetch + 状态更新
   - 管理 `selectAnswer(questionId, optionIndex)` → 更新 answers
   - `loading`, `error` 状态

**创建的文件**：
- `src/types/quiz.ts`
- `src/components/quiz/QuestionCard.tsx`
- `src/hooks/useQuiz.ts`
- 修改 `src/app/(protected)/quiz/page.tsx`

**验证清单**：
- [ ] 输入 "Machine Learning" 点击生成，等待后显示 5 道题
- [ ] 每题显示 4 个选项按钮，点击选中高亮为橙色边框
- [ ] 未答完所有题时 Submit 按钮禁用
- [ ] 全部选择后 Submit 按钮可点击
- [ ] 生成过程中显示 loading 状态

---

### 任务 24：创建 Quiz Submit API + 结果展示

**目标**：实现答题提交接口，服务端判分，前端展示逐题对错和总分。

**操作步骤**：
1. 创建 `src/app/api/quiz/submit/route.ts`：
   - POST handler
   - 请求体：`{ quizId, answers: [{ questionId, selectedIndex }] }`
   - 从 `quizzes` 表读取完整 questions（含 correctIndex）
   - 逐题比对，计算 score 和 wrong_ids
   - 存入 `quiz_results` 表
   - 返回 `{ score, total, results: [{ questionId, selectedIndex, correctIndex, isCorrect, explanation }] }`
2. 创建 `src/components/quiz/QuizResult.tsx`：
   - 顶部：大号得分显示（`8/10` 圆形进度环，橙色/绿色/红色根据得分率）
   - 得分率 ≥ 80% 显示 "Excellent! 🎉"，60-79% 显示 "Good job! 💪"，< 60% 显示 "Keep studying! 📚"
   - 下方：逐题显示对错状态（QuestionCard 变为 result 模式，显示正确答案 + explanation）
   - 底部两个按钮："Retry Wrong Answers"（仅错题 > 0 时显示）+ "New Quiz"
3. 在 `useQuiz.ts` 中添加 `submitQuiz()` 方法
4. 修改 quiz 页面：提交成功后切换到结果展示模式

**创建的文件**：
- `src/app/api/quiz/submit/route.ts`
- `src/components/quiz/QuizResult.tsx`
- 修改 `src/hooks/useQuiz.ts`
- 修改 `src/app/(protected)/quiz/page.tsx`

**验证清单**：
- [ ] 完成答题并提交后，显示得分（如 3/5）
- [ ] 答对的题显示绿色 ✓，答错的题显示红色 ✗ + 正确答案
- [ ] 每题下方显示 explanation 解析
- [ ] `quiz_results` 表新增一行数据
- [ ] 得分率不同时显示不同鼓励语

---

### 任务 25：错题重练 + 重新生成

**目标**：用户可以只重做答错的题目，也可以用相同关键词重新生成一套新题。

**操作步骤**：
1. 在 `useQuiz.ts` 中添加：
   - `retryWrongAnswers()`：从 `quiz_results` 的 `wrong_ids` 筛选出错题，重置这些题的 answers，回到答题模式
   - `regenerateQuiz()`：使用相同 keyword 和 count 重新调用 `/api/quiz/generate`，完全重置状态
2. 创建 `src/components/quiz/RetryButton.tsx`：
   - 两种变体按钮：
     - "Retry Wrong (N)" → 橙色描边样式（secondary variant）
     - "New Quiz" → 橙色实心样式（primary variant）
3. 修改 QuizResult 中引入 RetryButton
4. 错题重练模式：
   - 只显示答错的题目
   - 题目编号保持原始序号（如原第 2、5 题）
   - 提交后只判断这些题，与之前结果合并显示总成绩

**创建的文件**：
- `src/components/quiz/RetryButton.tsx`
- 修改 `src/hooks/useQuiz.ts`
- 修改 `src/app/(protected)/quiz/page.tsx`

**验证清单**：
- [ ] 结果页面显示 "Retry Wrong (2)" 按钮（假设错了 2 题）
- [ ] 点击后只显示 2 道错题
- [ ] 重新作答并提交后，显示新的得分
- [ ] 点击 "New Quiz" 回到 QuizForm 入口，关键词自动回填
- [ ] 全部答对时不显示 "Retry Wrong" 按钮

---

## 阶段七：Card 功能（任务 26-30）

### 任务 26：创建 Card Generate API（GPT 文本生成）

**目标**：实现 `/api/cards/generate` 路由的文本生成部分，输入主题，GPT-4o 生成标题、摘要和完整内容。

**操作步骤**：
1. 在 `src/lib/openai/prompts.ts` 中添加 `getCardSystemPrompt()` 函数：
   - 指令：根据主题生成知识卡片，返回 JSON `{ title, summary (50字以内), content (详细解释，使用 Markdown) }`
   - summary 用于折叠态展示，content 用于展开态展示
   - 使用用户的提问语言
2. 在 `src/lib/utils/validators.ts` 中添加 `cardGenerateSchema`：
   - `{ topic: z.string().min(1).max(200), categoryId: z.string().uuid().optional() }`
3. 创建 `src/app/api/cards/generate/route.ts`：
   - POST handler
   - 验证用户身份
   - 调用 GPT-4o 生成卡片文本（`response_format: { type: "json_object" }`）
   - 暂不生成插图（任务 27 处理）
   - 存入 `cards` 表（`illustration_url` 暂时为 null）
   - 返回完整 card 对象

**创建的文件**：
- 修改 `src/lib/openai/prompts.ts`
- 修改 `src/lib/utils/validators.ts`
- `src/app/api/cards/generate/route.ts`

**验证清单**：
- [ ] POST `/api/cards/generate` `{ "topic": "贝叶斯定理" }` 返回包含 title, summary, content 的 card 对象
- [ ] `cards` 表新增一行
- [ ] summary 长度在 50 字以内
- [ ] content 是详细的 Markdown 格式解释
- [ ] 无效输入返回 400

---

### 任务 27：集成 DALL-E 插图生成

**目标**：在卡片生成流程中，调用 DALL-E 3 生成知识主题插图，上传至 Supabase Storage。

**操作步骤**：
1. 修改 `src/app/api/cards/generate/route.ts`：
   - 在 GPT-4o 返回文本后，并行调用 DALL-E 3：
     ```ts
     const imageResponse = await openai.images.generate({
       model: 'dall-e-3',
       prompt: `Educational illustration for the concept: "${title}". Style: hand-drawn, warm colors, simple and clear, suitable for a study flashcard.`,
       n: 1,
       size: '1024x1024',
       quality: 'standard',
     });
     ```
   - 获取图片 URL → `fetch` 下载图片 buffer
   - 上传到 Supabase Storage `illustrations` bucket：`supabase.storage.from('illustrations').upload(path, buffer)`
   - 获取公开 URL：`supabase.storage.from('illustrations').getPublicUrl(path)`
   - 更新 `cards` 表的 `illustration_url` 字段
2. 错误处理：DALL-E 调用失败时不阻断卡片生成，`illustration_url` 保持 null
3. 加入环境变量检查：若 `OPENAI_API_KEY` 不支持 DALL-E（如额度不足），优雅降级

**创建的文件**：
- 修改 `src/app/api/cards/generate/route.ts`

**验证清单**：
- [ ] 生成卡片后，`illustration_url` 字段有值（Supabase Storage URL）
- [ ] 该 URL 在浏览器中可直接打开并显示图片
- [ ] 插图风格为手绘/暖色调/教育场景
- [ ] DALL-E 调用失败时，卡片仍然成功生成（无插图）
- [ ] `illustrations` bucket 中出现新上传的图片文件

---

### 任务 28：Card 列表页面 + 生成入口

**目标**：创建 Cards 列表页面，复用 CardGrid 瀑布流组件，并添加新建卡片的入口。

**操作步骤**：
1. 创建 `src/app/(protected)/cards/page.tsx`：
   - 顶部：TopBar（复用）+ CategoryBar（复用）
   - 主体：CardGrid 渲染用户的所有卡片（使用 `useCards` Hook）
   - 右下角浮动按钮（FAB）："+" 新建卡片（`fixed bottom-20 right-6 bg-accent w-14 h-14 rounded-full shadow-lg`）
2. 创建新建卡片 Modal（`src/components/cards/CreateCardModal.tsx`）：
   - 点击 FAB 打开
   - 内容：主题输入框 + 分类下拉选择（可选）+ "Generate" 按钮
   - 生成过程中显示 loading 动画（旋转的手绘风图标）
   - 成功后自动关闭 Modal，新卡片出现在列表顶部
3. 创建 `src/components/ui/Modal.tsx`：
   - 遮罩层 + 居中白色卡片容器
   - 支持 `isOpen`, `onClose` Props
   - 点击遮罩关闭 + ESC 键关闭
   - 进入/退出动画（scale + opacity）

**创建的文件**：
- `src/app/(protected)/cards/page.tsx`
- `src/components/cards/CreateCardModal.tsx`
- `src/components/ui/Modal.tsx`

**验证清单**：
- [ ] 访问 `/cards` 显示用户的卡片列表（瀑布流）
- [ ] 右下角有橙色 "+" 浮动按钮
- [ ] 点击 "+" 弹出 Modal，可输入主题
- [ ] 输入 "Fourier Transform" 点击 Generate，等待后 Modal 关闭，新卡片出现在列表中
- [ ] 卡片有 AI 生成的插图（或渐变色占位）

---

### 任务 29：卡片折叠/展开交互

**目标**：知识卡片默认折叠（只显示标题 + 摘要缩略），点击后展开显示完整内容。

**操作步骤**：
1. 修改 `src/components/cards/KnowledgeCard.tsx`：
   - 添加 `expanded` state（默认 false）
   - 折叠态：显示插图缩略 + title + summary（`line-clamp-3`）+ "Read more ▾"
   - 展开态：显示完整 content（Markdown 渲染）+ "Show less ▴"
   - 展开/折叠动画：使用 CSS `max-height` 过渡或 `grid-template-rows: 0fr → 1fr`
   - 展开时 content 区域显示完整 Markdown（使用 `react-markdown`）
2. 创建 `src/components/cards/CardIllustration.tsx`：
   - Props：`url`, `alt`
   - 有 URL：显示 `<img>` + 渐入 loading 效果
   - 无 URL：显示渐变色占位（`bg-gradient-to-br from-accent/20 to-cream`）+ 手绘风占位图标
   - 统一高度比例：`aspect-[16/10]`
3. 在展开态底部增加元信息行：创建时间 + 分类名称

**创建的文件**：
- `src/components/cards/CardIllustration.tsx`
- 修改 `src/components/cards/KnowledgeCard.tsx`

**验证清单**：
- [ ] 卡片默认折叠，只显示标题 + 摘要前三行
- [ ] 点击 "Read more" 展开，显示完整 Markdown 内容
- [ ] 展开后点击 "Show less" 收起
- [ ] 有插图的卡片正确显示图片
- [ ] 无插图的卡片显示渐变色占位
- [ ] 展开/收起有平滑动画

---

### 任务 30：卡片收藏功能（Heart + Star）

**目标**：实现知识卡片的收藏（Heart）和星标（Star）功能，状态持久化到 Supabase。

**操作步骤**：
1. 创建 `src/app/api/cards/[cardId]/route.ts`：
   - PATCH handler：更新 `is_favorited` 或 `is_starred`
   - 请求体：`{ is_favorited?: boolean, is_starred?: boolean }`
   - 验证用户身份 + 验证卡片属于该用户
   - GET handler：返回单张卡片详情（预留给详情页）
2. 修改 `src/components/cards/FavoriteButton.tsx`：
   - 点击后立即切换本地状态（乐观更新）
   - 同时调用 PATCH API 持久化
   - 若 API 失败，回滚本地状态并显示 Toast 错误
3. 修改 `useCards.ts`：
   - 添加 `toggleFavorite(cardId)` 和 `toggleStar(cardId)` 方法
   - 乐观更新本地 cards 列表
4. 创建 `src/components/ui/Toast.tsx`：
   - 简单的底部弹出通知组件
   - Props：`message`, `type` ('success' | 'error'), `visible`
   - 3 秒后自动消失
   - 使用 fixed 定位，底部居中

**创建的文件**：
- `src/app/api/cards/[cardId]/route.ts`
- `src/components/ui/Toast.tsx`
- 修改 `src/components/cards/FavoriteButton.tsx`
- 修改 `src/hooks/useCards.ts`

**验证清单**：
- [ ] 点击 Heart 按钮，图标变为实心橙色
- [ ] 刷新页面后，收藏状态保持
- [ ] 点击 Star 按钮同理
- [ ] 断网时点击收藏，图标先变再回滚，显示错误 Toast
- [ ] Supabase `cards` 表中 `is_favorited` 字段正确更新

---

## 阶段八：Document Analysis（任务 31-34）

### 任务 31：创建文件上传组件 + Upload API

**目标**：实现文件拖拽上传 UI 和后端上传接口，将文件存入 Supabase Storage。

**操作步骤**：
1. 创建 `src/components/documents/FileUploader.tsx`：
   - 拖拽区域：虚线边框容器（`border-2 border-dashed border-card-border rounded-card p-10 text-center`）
   - 拖拽悬停时：`border-accent bg-accent/5`
   - 中间显示：手绘风上传云图标 + "Drag & drop your file here" + "or click to browse"
   - 支持 `.txt` 和 `.pdf` 文件（accept 属性限制）
   - 文件大小限制 10MB，超出显示错误
   - 选中文件后显示文件名 + 文件大小 + "Upload" 按钮
   - 上传过程中显示进度条（或 loading spinner）
2. 创建 `src/app/api/documents/upload/route.ts`：
   - POST handler，接收 `multipart/form-data`
   - 校验文件类型和大小
   - 上传到 Supabase Storage `documents` bucket：路径 `{userId}/{timestamp}_{fileName}`
   - 在 `documents` 表创建记录（status: 'pending'）
   - 返回 `{ documentId, fileName, status: 'pending' }`
3. 创建 `src/app/(protected)/documents/page.tsx`：
   - 顶部：返回箭头 + "Document Analysis" 标题
   - FileUploader 组件
   - 下方预留分析结果区域

**创建的文件**：
- `src/components/documents/FileUploader.tsx`
- `src/app/api/documents/upload/route.ts`
- `src/app/(protected)/documents/page.tsx`

**验证清单**：
- [ ] 访问 `/documents` 显示上传页面
- [ ] 拖拽 .txt 文件到虚线区域，文件名显示
- [ ] 点击 Upload 后文件出现在 Supabase Storage `documents` bucket
- [ ] `documents` 表新增一行（status: pending）
- [ ] 上传 .jpg 文件时被拒绝
- [ ] 上传超过 10MB 文件时显示错误

---

### 任务 32：创建 Document Analyze API（文本提取 + 知识点生成）

**目标**：实现 `/api/documents/analyze` 路由，解析上传的文档，GPT-4o 提取关键知识点。

**操作步骤**：
1. 安装 PDF 解析库：`npm install pdf-parse`
2. 创建 `src/lib/utils/fileParser.ts`：
   - `extractTextFromTxt(buffer: Buffer): string` → 直接 `buffer.toString('utf-8')`
   - `extractTextFromPdf(buffer: Buffer): string` → 使用 `pdf-parse`
   - `extractText(buffer: Buffer, fileType: string): string` → 路由到对应方法
3. 在 `src/lib/openai/prompts.ts` 中添加 `getDocumentAnalysisPrompt()` 函数：
   - 指令：从提供的文本中提取最重要的知识点（最多 10 个）
   - 返回 JSON：`{ keyPoints: [{ title, summary }] }`
   - 每个 summary 控制在 100 字以内
4. 创建 `src/app/api/documents/analyze/route.ts`：
   - POST handler，请求体：`{ documentId }`
   - 从 `documents` 表读取 `storage_path`
   - 从 Supabase Storage 下载文件
   - 更新状态为 'processing'
   - 提取文本 → 若文本过长则截断前 10000 字符
   - 调用 GPT-4o 提取知识点
   - 更新 `documents` 表：`key_points` + `status: 'completed'`
   - 返回 `{ documentId, keyPoints, status: 'completed' }`
   - 失败时更新 `status: 'failed'`

**创建的文件**：
- `src/lib/utils/fileParser.ts`
- 修改 `src/lib/openai/prompts.ts`
- `src/app/api/documents/analyze/route.ts`

**验证清单**：
- [ ] 上传一个 .txt 文件后调用 analyze API，返回知识点列表
- [ ] 上传一个 .pdf 文件后调用 analyze API，返回知识点列表
- [ ] `documents` 表 status 更新为 'completed'，`key_points` 有值
- [ ] 知识点数量 ≤ 10
- [ ] 空文件或无法解析时 status 变为 'failed'

---

### 任务 33：知识点卡片列表展示

**目标**：上传并分析文档后，在页面下方以卡片列表展示提取的关键知识点。

**操作步骤**：
1. 创建 `src/components/documents/KeyPointCard.tsx`：
   - Props：`keyPoint: { title, summary }`, `index`
   - 布局：左侧编号圆圈（`bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center`）+ 右侧标题和摘要
   - 整体：`bg-card rounded-card shadow-card p-4 mb-3`
   - 底部可选操作："Save as Card" 按钮（将知识点转为独立知识卡片）
2. 创建 `src/components/documents/AnalysisResult.tsx`：
   - Props：`keyPoints[]`, `documentId`, `status`
   - status === 'processing' 时：显示骨架屏 + "Analyzing document..."
   - status === 'completed' 时：显示 KeyPointCard 列表
   - status === 'failed' 时：显示错误信息 + "Retry" 按钮
   - 列表顶部显示 "Found N key points"
3. 修改 Documents 页面：
   - 上传成功后自动调用 analyze API
   - 使用轮询（每 2 秒）或直接等待 API 响应来更新状态
   - 分析完成后渲染 AnalysisResult

**创建的文件**：
- `src/components/documents/KeyPointCard.tsx`
- `src/components/documents/AnalysisResult.tsx`
- 修改 `src/app/(protected)/documents/page.tsx`

**验证清单**：
- [ ] 上传文件后，页面显示 "Analyzing document..." + 骨架屏
- [ ] 分析完成后显示知识点卡片列表
- [ ] 每张卡片有编号、标题和摘要
- [ ] "Save as Card" 按钮可见（功能在任务 34 实现）
- [ ] 分析失败时显示错误信息和 Retry 按钮

---

### 任务 34：知识点一键保存为知识卡片

**目标**：用户可以将文档分析出的知识点一键保存为独立的知识卡片。

**操作步骤**：
1. 修改 `KeyPointCard.tsx` 的 "Save as Card" 按钮：
   - 点击后调用 `/api/cards/generate`（传入 `topic: keyPoint.title`，设 `source: 'document_analysis'`）
   - 或更轻量方案：直接调用 Supabase 插入 `cards` 表（使用 keyPoint 的 title 和 summary 作为卡片内容，不调用 GPT）
   - 保存成功后按钮变为 "Saved ✓"（禁用态，绿色）
2. 在 AnalysisResult 顶部添加 "Save All as Cards" 批量按钮：
   - 点击后逐个保存所有知识点为卡片
   - 显示进度："Saving 3/8..."
   - 完成后显示 "All saved! View in Cards →" 链接
3. 修改 `src/app/api/cards/route.ts`（如未创建则创建）：
   - GET handler：查询用户卡片列表（支持 `categoryId`, `search`, `page`, `limit` 参数）
   - 这个在首页 useCards 中也会用到（替代直接 Supabase 查询）
4. 保存的卡片设置 `source: 'document_analysis'` 和 `source_document_id`

**创建的文件**：
- `src/app/api/cards/route.ts`（GET handler）
- 修改 `src/components/documents/KeyPointCard.tsx`
- 修改 `src/components/documents/AnalysisResult.tsx`

**验证清单**：
- [ ] 点击单个知识点的 "Save as Card"，按钮变为 "Saved ✓"
- [ ] `cards` 表新增一行，`source` 为 'document_analysis'
- [ ] 点击 "Save All as Cards"，逐个保存并显示进度
- [ ] 保存完成后跳转到 `/cards` 页面可以看到新增的卡片
- [ ] 已保存的知识点按钮不可重复点击

---

## 阶段九：全局优化（任务 35-37）

### 任务 35：响应式布局适配

**目标**：确保所有页面在手机（375px）、平板（768px）和桌面（1280px）三个断点下均表现良好。

**操作步骤**：
1. 修改 `src/app/(protected)/layout.tsx`：
   - 桌面端（`lg:`）：Sidebar 常驻显示在左侧（不需要遮罩层），主内容区右侧
   - 平板/手机：Sidebar 保持抽屉模式
   - 主内容区：`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8`
2. 修改 CardGrid：
   - `columns-1 sm:columns-2 lg:columns-3`（已有，验证即可）
3. 修改 TopBar：
   - 手机端：搜索框缩小，"+" 按钮尺寸调整
   - 桌面端：搜索框加宽
4. 修改 Explain 页面：
   - 消息气泡最大宽度：`max-w-[85%] sm:max-w-[70%]`
5. 修改 Quiz 页面：
   - QuestionCard 选项：手机端全宽堆叠，桌面端 2×2 网格
6. 修改 Document 页面：
   - FileUploader 区域手机端缩小 padding
7. 逐页检查所有文字不溢出、按钮可触达、间距合理

**修改的文件**：
- `src/app/(protected)/layout.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/cards/CardGrid.tsx`
- `src/components/explain/ExplainChat.tsx`
- `src/components/quiz/QuestionCard.tsx`
- `src/components/documents/FileUploader.tsx`

**验证清单**：
- [ ] Chrome DevTools 切换到 iPhone SE（375px）：所有页面无横向滚动条
- [ ] 平板尺寸（768px）：卡片变为 2 列
- [ ] 桌面尺寸（1280px）：Sidebar 常驻左侧，卡片 3 列
- [ ] Explain 页面消息气泡在手机端不超出屏幕
- [ ] Quiz 选项按钮在手机端可正常点击（无重叠）

---

### 任务 36：全局 Loading 态和骨架屏

**目标**：为所有异步操作添加一致的加载反馈，提升用户体验。

**操作步骤**：
1. 为每个功能模块添加 loading 态：
   - 首页卡片加载：6 个 Skeleton 卡片（不同高度模拟瀑布流）
   - Explain 等待 AI 回复：消息列表末尾显示 "AI is thinking..." 动画（三个弹跳圆点）
   - Quiz 生成中：全屏骨架（3-4 个 QuestionCard 形状的 Skeleton）
   - Card 生成中：Modal 内显示旋转 loader + "Generating card..."
   - Document 分析中：已有（任务 33），确认正常工作
2. 创建 `src/components/ui/LoadingDots.tsx`：
   - 三个圆点依次弹跳动画
   - 橙色圆点（`bg-accent`），大小 8px
3. 修改 Skeleton 组件以支持不同形状：
   - `variant`: 'card' | 'text' | 'circle' | 'button'
   - card variant 模拟 KnowledgeCard 形状
4. 全局页面切换 loading（可选）：
   - 在 `(protected)/layout.tsx` 中使用 `next/navigation` 的 `usePathname` 检测路由变化
   - 切换时在顶部显示橙色进度条（`h-1 bg-accent` 从左到右动画）

**创建的文件**：
- `src/components/ui/LoadingDots.tsx`
- 修改 `src/components/ui/Skeleton.tsx`
- 修改各页面组件添加 loading 状态

**验证清单**：
- [ ] 首页首次加载时显示 Skeleton 卡片，数据到达后替换为真实卡片
- [ ] Explain 发送消息后显示 "AI is thinking..." 弹跳圆点
- [ ] Quiz 生成过程中显示骨架屏
- [ ] Card 生成 Modal 中显示 loading 动画
- [ ] 所有 loading 动画使用统一的橙色主题色

---

### 任务 37：全局错误处理 + Error Boundary

**目标**：为 API 调用失败、网络错误、未知异常添加统一的错误处理和用户友好的反馈。

**操作步骤**：
1. 创建 `src/app/(protected)/error.tsx`（Next.js Error Boundary）：
   - 显示友好的错误页面
   - 手绘风的错误插图（如一只困惑的猫头鹰）
   - 错误信息（`error.message`）
   - "Try Again" 按钮（调用 `reset()`）
   - "Go Home" 按钮（`router.push('/')`）
   - 暖色调样式保持一致
2. 创建 `src/app/(protected)/not-found.tsx`：
   - 404 页面，手绘风迷路图标
   - "Page not found" + "Go back home" 按钮
3. 封装统一的 API 错误处理工具 `src/lib/utils/apiError.ts`：
   - `class ApiError extends Error { status: number }`
   - `handleApiError(error): Response` → 格式化错误响应
   - 在所有 API Route 的 catch 中使用
4. 修改 Toast 组件使其支持全局调用：
   - 创建 `src/stores/toastStore.ts`：`showToast({ message, type })`
   - Toast 组件从 store 读取状态，渲染在 `(protected)/layout.tsx` 中
5. 在所有 Hook 的 fetch catch 中统一调用 `showToast({ message: '...', type: 'error' })`

**创建的文件**：
- `src/app/(protected)/error.tsx`
- `src/app/(protected)/not-found.tsx`
- `src/lib/utils/apiError.ts`
- `src/stores/toastStore.ts`
- 修改 `src/components/ui/Toast.tsx`
- 修改所有 Hooks（useCards, useQuiz, useExplain）添加错误 Toast

**验证清单**：
- [ ] 访问不存在的路由显示友好 404 页面
- [ ] API 返回 500 时页面显示 Error Boundary
- [ ] 网络错误时（断网）显示底部 Toast "Network error, please try again"
- [ ] Toast 3 秒后自动消失
- [ ] Error Boundary 的 "Try Again" 按钮可恢复页面
- [ ] 所有错误反馈保持暖色调视觉一致性

---

## 构建完成检查清单

完成全部 37 个任务后，进行以下端到端检查：

- [ ] **注册 → 登录 → 首页**：新用户注册，确认邮件后登录，看到空白首页 + 默认分类
- [ ] **创建卡片**：从首页 "+" 或 Cards 页面生成卡片，插图正常，出现在瀑布流中
- [ ] **搜索与筛选**：搜索关键词过滤卡片，点击分类标签筛选卡片
- [ ] **Explain 对话**：提问 → 流式回答 → 追问，切换风格后回答明显不同
- [ ] **Quiz 答题**：生成 → 作答 → 提交 → 查看结果 → 错题重练
- [ ] **文档分析**：上传 PDF → 等待分析 → 查看知识点 → 一键保存为卡片
- [ ] **收藏功能**：Heart / Star 切换后刷新保持
- [ ] **登出**：点击 Sidebar 的 Log Out，跳转到登录页，无法直接访问受保护页面
- [ ] **响应式**：手机端所有功能可正常使用
- [ ] **错误处理**：断网、API 失败时有友好提示
