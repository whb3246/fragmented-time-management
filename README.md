# 碎片时间管理器 ⏰

一款智能时间管理应用，帮助用户充分利用120分钟以内的碎片时间。通过精确的时间匹配系统，为用户推荐最适合的定时任务，提升时间利用效率和个人成长。

## ✨ 功能特性

### 🎯 核心功能
- **智能时间匹配**：根据可用时间长度（1-120分钟）精确推荐对应时长的任务
- **任务分类管理**：学习、运动、创作、整理、冥想等多种任务类型
- **精准倒计时**：使用任务预设时长进行倒计时，支持暂停/继续操作
- **历史记录统计**：完整的任务完成记录和时间利用统计
- **个性化设置**：任务类型偏好、难度偏好、通知设置等

### 📱 页面功能
- **首页**：时间选择器、任务推荐展示、快速开始
- **任务详情页**：任务详细信息、开始倒计时按钮、任务说明
- **倒计时页**：倒计时显示、暂停/继续控制、完成确认
- **历史记录页**：已完成任务记录、时间统计、成就展示
- **用户设置页**：个人偏好设置、任务类型偏好、通知设置

## 🛠️ 技术栈

### 前端技术
- **框架**：Vue 3 (组合式 API)
- **路由**：Vue Router 4
- **状态管理**：Pinia
- **样式**：SCSS + CSS Modules (BEM 命名规范)
- **构建工具**：Vite
- **类型检查**：TypeScript
- **图标库**：Lucide Vue Next

### 后端服务
- **数据库**：Supabase (PostgreSQL)
- **身份验证**：Supabase Auth
- **实时功能**：Supabase Realtime
- **API**：Supabase SDK

### 开发工具
- **代码规范**：ESLint + TypeScript ESLint
- **包管理**：pnpm
- **部署**：Vercel / Netlify

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 7.0.0

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd Fragment-Time-Manager

# 安装依赖
pnpm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 配置 Supabase 环境变量：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 运行项目
```bash
# 开发模式
pnpm dev

# 构建项目
pnpm build

# 预览构建结果
pnpm preview

# 类型检查
pnpm check

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix
```

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   ├── Empty.vue       # 空状态组件
│   └── UserNav.vue     # 用户导航组件
├── composables/        # 组合式函数
│   ├── useNotification.ts  # 通知功能
│   ├── useTheme.ts         # 主题管理
│   └── useTimer.ts         # 计时器功能
├── lib/                # 工具库
│   ├── supabase.ts     # Supabase 客户端
│   └── utils.ts        # 工具函数
├── pages/              # 页面组件
│   ├── HomePage.vue        # 首页
│   ├── TaskDetailPage.vue  # 任务详情页
│   ├── TimerPage.vue       # 倒计时页
│   ├── HistoryPage.vue     # 历史记录页
│   ├── SettingsPage.vue    # 设置页
│   ├── LoginPage.vue       # 登录页
│   ├── RegisterPage.vue    # 注册页
│   └── ResetPasswordPage.vue # 重置密码页
├── router/             # 路由配置
│   └── index.ts
├── services/           # 业务服务
│   ├── dataService.ts      # 数据服务
│   ├── taskService.ts      # 任务服务
│   ├── userService.ts      # 用户服务
│   ├── localStorageService.ts # 本地存储服务
│   └── migrationService.ts    # 数据迁移服务
├── stores/             # 状态管理
│   └── auth.ts         # 认证状态
├── styles/             # 样式文件
│   ├── base/           # 基础样式
│   ├── components/     # 组件样式
│   ├── layout/         # 布局样式
│   ├── utils/          # 工具样式
│   └── main.scss       # 主样式文件
├── types/              # 类型定义
│   └── database.ts     # 数据库类型
└── App.vue             # 根组件
```

## 🎨 设计系统

### 色彩方案
- **主色调**：深蓝色 (#2563EB) 和浅蓝色 (#3B82F6)
- **辅助色**：
  - 绿色 (#10B981) - 表示完成
  - 橙色 (#F59E0B) - 表示进行中
  - 灰色 (#6B7280) - 表示中性状态

### 设计风格
- **布局**：卡片式设计，移动优先的响应式布局
- **按钮**：圆角矩形按钮，轻微阴影效果，点击动画
- **字体**：主标题 24px 粗体，正文 16px 常规，倒计时 48px 数字字体
- **图标**：线性图标风格，简洁现代

## 🗄️ 数据库设计

### 核心数据表
- **users** - 用户信息（由 Supabase Auth 管理）
- **tasks** - 任务信息（标题、描述、时长、难度、分类等）
- **task_categories** - 任务分类（学习、运动、创作等）
- **task_records** - 任务完成记录（用户、任务、时长、状态等）
- **user_preferences** - 用户偏好设置（分类偏好、难度偏好等）

### 数据关系
- 用户与任务记录：一对多关系
- 任务与任务分类：多对一关系
- 用户与偏好设置：一对一关系

## 🔧 开发指南

### 代码规范
- 使用 Vue 3 组合式 API
- 遵循 BEM CSS 命名规范
- TypeScript 严格模式
- ESLint 代码检查

### 组件开发
- 优先使用组合式函数（Composables）
- 组件职责单一，可复用性强
- 使用 CSS Modules 避免样式冲突

### 状态管理
- 使用 Pinia 进行状态管理
- 按功能模块划分 Store
- 支持 TypeScript 类型推导

## 📄 许可证

MIT License

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

---

**让每一分钟都变得有价值！** ⏰✨
