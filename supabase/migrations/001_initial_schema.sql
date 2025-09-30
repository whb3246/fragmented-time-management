-- 碎片时间管理器 - 初始数据库架构
-- 创建时间：2024-01-20

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用户资料扩展表
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的资料
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. 任务分类表
CREATE TABLE task_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'clock',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 允许所有用户查看任务分类
GRANT SELECT ON task_categories TO anon;
GRANT ALL PRIVILEGES ON task_categories TO authenticated;

-- 3. 任务表
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category_id UUID REFERENCES task_categories(id) ON DELETE SET NULL,
    steps JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tasks_duration ON tasks(min_duration, max_duration);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_difficulty ON tasks(difficulty);

-- 权限设置
GRANT SELECT ON tasks TO anon;
GRANT ALL PRIVILEGES ON tasks TO authenticated;

-- 4. 任务记录表
CREATE TABLE task_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    planned_duration INTEGER NOT NULL,
    actual_duration INTEGER,
    status VARCHAR(20) DEFAULT 'started' CHECK (status IN ('started', 'paused', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_task_records_user_id ON task_records(user_id);
CREATE INDEX idx_task_records_created_at ON task_records(created_at DESC);
CREATE INDEX idx_task_records_status ON task_records(status);

-- 启用行级安全策略
ALTER TABLE task_records ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的任务记录
CREATE POLICY "Users can manage own task records" ON task_records
    FOR ALL USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON task_records TO authenticated;

-- 5. 用户偏好表
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    preferred_categories JSONB DEFAULT '[]',
    difficulty_preference VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_preference IN ('easy', 'medium', 'hard')),
    notifications_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的偏好设置
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间戳触发器
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();