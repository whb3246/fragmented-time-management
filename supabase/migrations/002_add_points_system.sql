-- 添加积分系统相关字段和表结构
-- 为task_records表添加积分字段

-- 为task_records表添加积分字段
ALTER TABLE task_records 
ADD COLUMN points_earned INTEGER DEFAULT 0 NOT NULL;

-- 添加积分字段的注释
COMMENT ON COLUMN task_records.points_earned IS '任务完成获得的积分，基于实际完成时间计算（每分钟1积分）';

-- 创建用户积分统计表
CREATE TABLE user_points_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0 NOT NULL,
    points_this_week INTEGER DEFAULT 0 NOT NULL,
    points_this_month INTEGER DEFAULT 0 NOT NULL,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保每个用户只有一条记录
    UNIQUE(user_id)
);

-- 添加表注释
COMMENT ON TABLE user_points_stats IS '用户积分统计表，存储用户的积分汇总信息';
COMMENT ON COLUMN user_points_stats.total_points IS '用户总积分';
COMMENT ON COLUMN user_points_stats.points_this_week IS '本周获得的积分';
COMMENT ON COLUMN user_points_stats.points_this_month IS '本月获得的积分';

-- 为user_points_stats表启用RLS
ALTER TABLE user_points_stats ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能查看和修改自己的积分统计
CREATE POLICY "Users can view their own points stats" ON user_points_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points stats" ON user_points_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points stats" ON user_points_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- 创建函数：计算任务记录的积分
CREATE OR REPLACE FUNCTION calculate_task_points(actual_duration_minutes INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- 每分钟1积分，向下取整
    RETURN COALESCE(actual_duration_minutes, 0);
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION calculate_task_points(INTEGER) IS '计算任务积分：每分钟1积分';

-- 创建触发器函数：自动计算和更新积分
CREATE OR REPLACE FUNCTION update_task_points()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- 只有当任务状态为completed时才计算积分
    IF NEW.status = 'completed' AND NEW.actual_duration IS NOT NULL THEN
        NEW.points_earned = calculate_task_points(NEW.actual_duration);
    ELSE
        NEW.points_earned = 0;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 创建触发器：在插入或更新task_records时自动计算积分
CREATE TRIGGER trigger_update_task_points
    BEFORE INSERT OR UPDATE ON task_records
    FOR EACH ROW
    EXECUTE FUNCTION update_task_points();

-- 创建函数：更新用户积分统计
CREATE OR REPLACE FUNCTION update_user_points_stats(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    total_points_count INTEGER;
    week_points_count INTEGER;
    month_points_count INTEGER;
BEGIN
    -- 计算总积分
    SELECT COALESCE(SUM(points_earned), 0)
    INTO total_points_count
    FROM task_records
    WHERE user_id = user_uuid AND status = 'completed';
    
    -- 计算本周积分
    SELECT COALESCE(SUM(points_earned), 0)
    INTO week_points_count
    FROM task_records
    WHERE user_id = user_uuid 
        AND status = 'completed'
        AND completed_at >= date_trunc('week', NOW());
    
    -- 计算本月积分
    SELECT COALESCE(SUM(points_earned), 0)
    INTO month_points_count
    FROM task_records
    WHERE user_id = user_uuid 
        AND status = 'completed'
        AND completed_at >= date_trunc('month', NOW());
    
    -- 插入或更新用户积分统计
    INSERT INTO user_points_stats (user_id, total_points, points_this_week, points_this_month, last_updated_at)
    VALUES (user_uuid, total_points_count, week_points_count, month_points_count, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_points = EXCLUDED.total_points,
        points_this_week = EXCLUDED.points_this_week,
        points_this_month = EXCLUDED.points_this_month,
        last_updated_at = NOW();
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION update_user_points_stats(UUID) IS '更新用户积分统计信息';

-- 创建触发器函数：当任务记录变化时更新用户积分统计
CREATE OR REPLACE FUNCTION trigger_update_user_points_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- 如果是插入或更新操作
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_user_points_stats(NEW.user_id);
        RETURN NEW;
    END IF;
    
    -- 如果是删除操作
    IF TG_OP = 'DELETE' THEN
        PERFORM update_user_points_stats(OLD.user_id);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;

-- 创建触发器：当task_records变化时自动更新用户积分统计
CREATE TRIGGER trigger_update_user_points_stats
    AFTER INSERT OR UPDATE OR DELETE ON task_records
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_user_points_stats();

-- 为现有的已完成任务记录计算积分
UPDATE task_records 
SET points_earned = calculate_task_points(actual_duration)
WHERE status = 'completed' AND actual_duration IS NOT NULL;

-- 为所有用户初始化积分统计
INSERT INTO user_points_stats (user_id, total_points, points_this_week, points_this_month)
SELECT 
    user_id,
    COALESCE(SUM(points_earned), 0) as total_points,
    COALESCE(SUM(CASE WHEN completed_at >= date_trunc('week', NOW()) THEN points_earned ELSE 0 END), 0) as week_points,
    COALESCE(SUM(CASE WHEN completed_at >= date_trunc('month', NOW()) THEN points_earned ELSE 0 END), 0) as month_points
FROM task_records
WHERE status = 'completed'
GROUP BY user_id
ON CONFLICT (user_id) DO NOTHING;

-- 为user_points_stats表授予权限
GRANT SELECT, INSERT, UPDATE ON user_points_stats TO authenticated;
GRANT SELECT ON user_points_stats TO anon;