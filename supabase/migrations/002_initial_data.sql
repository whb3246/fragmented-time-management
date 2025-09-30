-- 碎片时间管理器 - 初始数据填充
-- 创建时间：2024-01-20

-- 插入任务分类数据
INSERT INTO task_categories (name, description, color, icon) VALUES
('学习', '知识学习和技能提升', '#10B981', 'book'),
('运动', '身体锻炼和健康活动', '#F59E0B', 'activity'),
('创作', '写作、绘画等创意活动', '#8B5CF6', 'edit'),
('整理', '环境整理和物品归纳', '#6B7280', 'folder'),
('冥想', '放松和心理调节', '#06B6D4', 'heart'),
('阅读', '书籍和文章阅读', '#EF4444', 'book-open'),
('练习', '技能练习和训练', '#F97316', 'target'),
('思考', '思维整理和规划', '#8B5CF6', 'brain');


-- 学习类超短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('单词速记', '快速记忆3-5个新单词', 2, 'easy', 
 (SELECT id FROM task_categories WHERE name = '学习'), 
 '["选择单词", "快速记忆", "默写检查"]'),

('知识点回顾', '快速回顾一个小知识点', 3, 'easy',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["选择知识点", "快速回顾", "口述要点"]'),

('公式记忆', '记忆一个数学或物理公式', 4, 'medium',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["选择公式", "理解含义", "反复记忆", "应用练习"]'),

('概念理解', '理解一个新概念的基本定义', 5, 'medium',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["阅读定义", "理解含义", "举例说明", "记录要点"]');

-- 运动类超短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('眼部运动', '缓解眼部疲劳的简单运动', 1, 'easy',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["闭眼休息", "眼球转动", "远近调节"]'),

('颈部放松', '简单的颈部拉伸运动', 2, 'easy',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["左右转动", "上下点头", "侧向拉伸"]'),

('手腕运动', '预防鼠标手的手腕运动', 3, 'easy',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["手腕转动", "手指伸展", "握拳放松"]'),

('深呼吸', '通过深呼吸放松身心', 4, 'easy',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["深吸气", "屏住呼吸", "缓慢呼气", "重复循环"]'),

('站立拉伸', '站立状态下的简单拉伸', 5, 'medium',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["站直身体", "手臂上举", "腰部扭转", "腿部拉伸"]');

-- 创作类超短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('灵感记录', '快速记录一个创意灵感', 1, 'easy',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["捕捉灵感", "快速记录"]'),

('简笔画', '画一个简单的图形或物体', 3, 'easy',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["选择对象", "简单勾勒", "添加细节"]'),

('短句创作', '创作一句有意义的话', 4, 'medium',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["确定主题", "构思内容", "润色表达"]'),

('色彩搭配', '练习颜色搭配和组合', 5, 'medium',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["选择主色", "搭配辅色", "调整比例", "记录方案"]');

-- 整理类超短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('桌面清理', '清理桌面上的杂物', 2, 'easy',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["收集杂物", "分类整理"]'),

('文件归档', '整理几个散乱的文件', 3, 'easy',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["收集文件", "分类归档", "删除无用"]'),

('邮件清理', '清理几封邮件', 4, 'medium',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["查看邮件", "分类处理", "删除垃圾邮件"]'),

('书签整理', '整理浏览器书签', 5, 'medium',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["查看书签", "分类整理", "删除无效", "重新命名"]');

-- 冥想类超短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('一分钟冥想', '最简单的一分钟冥想', 1, 'easy',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["闭眼静坐", "专注呼吸"]'),

('感恩练习', '想三件值得感恩的事', 2, 'easy',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["回想经历", "感受感恩"]'),

('正念呼吸', '专注于呼吸的正念练习', 3, 'easy',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["专注呼吸", "觉察当下", "回归专注"]'),

('身心放松', '快速的身心放松练习', 5, 'medium',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["放松肌肉", "平静心情", "深度放松", "慢慢回神"]');

-- 阅读类超短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('标题浏览', '快速浏览新闻标题', 1, 'easy',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["浏览标题", "筛选兴趣"]'),

('短文阅读', '阅读一篇很短的文章', 3, 'easy',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["快速阅读", "理解大意", "记住要点"]'),

('诗词欣赏', '阅读和欣赏一首诗词', 4, 'medium',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["阅读诗词", "理解意境", "感受美感"]'),

('名言学习', '学习一句有意义的名言', 5, 'medium',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["阅读名言", "理解含义", "思考应用", "记录感悟"]');

-- 练习类超短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('打字练习', '练习打字速度和准确性', 2, 'easy',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["选择文本", "快速打字"]'),

('发音练习', '练习几个单词的发音', 3, 'easy',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["选择单词", "模仿发音", "纠正错误"]'),

('心算练习', '进行简单的心算练习', 4, 'medium',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["选择题目", "心算计算", "检查答案"]'),

('记忆练习', '练习记忆一串数字或单词', 5, 'medium',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["记忆内容", "复述检查", "重复练习", "巩固记忆"]');

-- 思考类超短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('今日目标', '思考今天要完成的主要目标', 2, 'easy',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["回顾计划", "确定重点"]'),

('问题分析', '快速分析一个小问题', 3, 'easy',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["明确问题", "分析原因", "思考对策"]'),

('优先级排序', '为几件事情排定优先级', 4, 'medium',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["列出事项", "评估重要性", "排定顺序"]'),

('决策思考', '对一个小决策进行思考', 5, 'medium',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["明确选择", "分析利弊", "做出决定", "制定行动"]');

-- 短任务 (5-15分钟)
-- 学习类短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('语法学习', '学习一个英语语法点', 8, 'easy',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["选择语法点", "理解规则", "看例句", "做练习", "总结要点"]'),

('历史事件', '了解一个历史事件', 10, 'easy',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["选择事件", "了解背景", "学习过程", "分析影响", "记录要点"]'),

('科学原理', '学习一个科学原理', 12, 'medium',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["选择原理", "理解概念", "学习应用", "做实验", "总结规律"]'),

('技术概念', '学习一个技术概念', 15, 'medium',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["选择概念", "查阅资料", "理解原理", "实践应用", "记录笔记"]');

-- 运动类短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('办公室运动', '适合办公室的简单运动', 6, 'easy',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["准备空间", "颈肩运动", "腰背拉伸", "腿部活动", "放松整理"]'),

('瑜伽基础', '练习几个基础瑜伽动作', 10, 'medium',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["准备瑜伽垫", "热身运动", "基础体式", "呼吸配合", "放松休息"]'),

('有氧运动', '进行简单的有氧运动', 12, 'medium',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["热身准备", "有氧动作", "保持节奏", "调整强度", "整理放松"]'),

('力量训练', '进行基础力量训练', 15, 'hard',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["热身运动", "上肢训练", "核心训练", "下肢训练", "拉伸放松"]');

-- 创作类短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('日记写作', '写一篇简短的日记', 8, 'easy',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["回顾今日", "选择主题", "自由写作", "检查修改", "保存记录"]'),

('诗歌创作', '创作一首简短的诗歌', 12, 'medium',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["确定主题", "构思意境", "选择词汇", "组织韵律", "修改完善"]'),

('故事构思', '构思一个小故事的情节', 10, 'medium',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["确定主题", "设计人物", "构思情节", "安排结构", "记录大纲"]'),

('设计草图', '画一个设计草图', 15, 'hard',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["确定设计目标", "构思创意", "绘制草图", "添加细节", "标注说明"]');

-- 整理类短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('照片整理', '整理手机或电脑中的照片', 10, 'easy',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["查看照片", "删除重复", "分类归档", "添加标签", "备份重要"]'),

('通讯录整理', '整理手机通讯录', 8, 'easy',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["查看联系人", "删除无效", "更新信息", "分组管理", "备份数据"]'),

('衣柜整理', '整理衣柜的一个区域', 12, 'medium',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["取出衣物", "分类整理", "清洁衣柜", "重新摆放", "记录需要"]'),

('文档整理', '整理工作或学习文档', 15, 'medium',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["收集文档", "分类归档", "重命名文件", "删除过期", "建立索引"]');

-- 冥想类短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('引导冥想', '跟随引导进行冥想练习', 8, 'easy',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["选择引导", "找到舒适姿势", "跟随指导", "保持专注", "慢慢结束"]'),

('行走冥想', '在行走中进行正念练习', 10, 'medium',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["选择路线", "缓慢行走", "专注步伐", "觉察环境", "保持正念"]'),

('慈悲冥想', '练习慈悲和爱心的冥想', 12, 'medium',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["静心准备", "想象亲人", "发送祝福", "扩展到他人", "感受慈悲"]'),

('观察冥想', '观察思维和情绪的冥想', 15, 'hard',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["静坐准备", "观察思维", "不做判断", "回归呼吸", "保持觉察"]');

-- 阅读类短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('新闻深读', '深入阅读一篇新闻报道', 8, 'easy',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["选择新闻", "仔细阅读", "理解背景", "分析观点", "思考影响"]'),

('技术文章', '阅读一篇技术文章', 12, 'medium',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["选择文章", "理解概念", "学习方法", "思考应用", "记录要点"]'),

('文学作品', '阅读文学作品片段', 10, 'medium',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["选择作品", "细读文本", "体会情感", "分析技巧", "感受美感"]'),

('学术论文', '阅读学术论文摘要', 15, 'hard',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["选择论文", "阅读摘要", "理解方法", "分析结论", "评估价值"]');

-- 练习类短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('口语练习', '练习英语口语表达', 10, 'easy',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["选择话题", "组织语言", "大声练习", "录音回听", "改进发音"]'),

('乐器练习', '练习乐器演奏', 12, 'medium',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["热身练习", "技巧训练", "曲目练习", "节拍控制", "表现力提升"]'),

('绘画技巧', '练习特定的绘画技巧', 15, 'medium',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["选择技巧", "准备材料", "基础练习", "实际应用", "总结改进"]'),

('编程算法', '练习编程算法题', 15, 'hard',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["选择题目", "分析问题", "设计算法", "编写代码", "测试优化"]');

-- 思考类短任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('周计划', '制定下周的工作计划', 10, 'easy',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["回顾本周", "确定目标", "安排任务", "分配时间", "制定计划"]'),

('问题解决', '深入思考解决一个问题', 12, 'medium',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["明确问题", "分析原因", "寻找方案", "评估可行性", "制定行动"]'),

('创意思考', '进行创意思维训练', 8, 'medium',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["设定主题", "发散思维", "联想创意", "筛选想法", "记录灵感"]'),

('人生规划', '思考短期人生规划', 15, 'hard',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["审视现状", "设定目标", "分析资源", "制定策略", "确定行动"]');

-- 中等任务 (15-60分钟)
-- 学习类中等任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('在线课程', '学习一节在线课程', 25, 'easy',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["选择课程", "准备笔记", "专心听讲", "记录要点", "复习总结"]'),

('专业书籍', '阅读专业书籍一章', 35, 'medium',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["选择章节", "预习内容", "仔细阅读", "做笔记", "思考应用", "总结要点"]'),

('技能教程', '学习一个技能教程', 45, 'medium',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["选择教程", "准备工具", "跟随学习", "实践操作", "解决问题", "总结经验"]'),

('研究项目', '进行小型研究项目', 60, 'hard',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["确定主题", "收集资料", "分析数据", "得出结论", "撰写报告", "反思改进"]');

-- 运动类中等任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('健身训练', '进行全身健身训练', 30, 'medium',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["热身运动", "力量训练", "有氧运动", "柔韧性训练", "放松整理"]'),

('跑步锻炼', '进行跑步锻炼', 25, 'medium',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["热身准备", "慢跑开始", "调整节奏", "保持状态", "逐渐减速", "拉伸放松"]'),

('瑜伽课程', '完成一节瑜伽课程', 40, 'medium',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["准备环境", "热身动作", "基础体式", "进阶练习", "冥想放松", "整理收功"]'),

('游泳训练', '进行游泳训练', 50, 'hard',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["热身运动", "技术练习", "耐力训练", "速度训练", "放松游泳", "拉伸恢复"]');

-- 创作类中等任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('短文写作', '写一篇短文或随笔', 20, 'easy',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["确定主题", "构思大纲", "开始写作", "修改润色", "最终定稿"]'),

('绘画作品', '完成一幅绘画作品', 35, 'medium',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["构思创意", "准备材料", "草图设计", "细节绘制", "色彩处理", "完善作品"]'),

('音乐创作', '创作一段音乐或旋律', 40, 'medium',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["确定风格", "构思旋律", "和声编配", "节奏安排", "录制试听", "修改完善"]'),

('视频制作', '制作一个短视频', 55, 'hard',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["策划内容", "准备素材", "拍摄录制", "剪辑制作", "添加特效", "输出成品"]');

-- 整理类中等任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('书房整理', '全面整理书房空间', 30, 'medium',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["清理桌面", "整理书籍", "归纳文具", "清洁卫生", "优化布局"]'),

('数据备份', '整理和备份重要数据', 25, 'medium',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["识别重要数据", "分类整理", "选择备份方式", "执行备份", "验证完整性"]'),

('衣物整理', '全面整理衣物和配饰', 40, 'medium',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["分类衣物", "清洗整理", "季节收纳", "配饰归类", "空间优化"]'),

('家庭整理', '进行家庭大扫除', 60, 'hard',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["制定计划", "分区清理", "深度清洁", "物品归位", "环境优化", "维护保养"]');

-- 冥想类中等任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('正念冥想', '进行正念冥想练习', 20, 'easy',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["准备环境", "调整姿势", "专注呼吸", "觉察当下", "保持正念", "慢慢结束"]'),

('内观冥想', '进行内观冥想练习', 30, 'medium',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["静心准备", "观察身体", "觉察感受", "观察心念", "保持平等心", "回归现实"]'),

('禅修练习', '进行禅修静坐练习', 45, 'medium',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["调整坐姿", "调节呼吸", "静心观照", "保持觉知", "处理杂念", "安详结束"]'),

('深度冥想', '进行深度冥想体验', 60, 'hard',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["环境准备", "身心调节", "进入状态", "深度体验", "保持觉察", "缓慢回归"]');

-- 阅读类中等任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('杂志阅读', '阅读一本杂志', 20, 'easy',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["选择杂志", "浏览目录", "重点阅读", "记录感兴趣内容", "思考启发"]'),

('小说阅读', '阅读小说几个章节', 35, 'medium',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["回顾情节", "继续阅读", "体验情感", "分析人物", "思考主题", "记录感受"]'),

('专业资料', '研读专业资料', 45, 'medium',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["明确目的", "仔细研读", "理解概念", "分析方法", "思考应用", "整理笔记"]'),

('学术文献', '深入研读学术文献', 60, 'hard',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["了解背景", "阅读全文", "分析方法", "评估结论", "思考意义", "撰写总结"]');

-- 练习类中等任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('语言学习', '进行语言综合练习', 25, 'easy',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["词汇练习", "语法练习", "听力训练", "口语练习", "写作练习"]'),

('技能训练', '进行专项技能训练', 35, 'medium',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["基础练习", "技巧训练", "综合应用", "问题解决", "经验总结"]'),

('项目练习', '完成一个小项目', 50, 'medium',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["项目规划", "需求分析", "设计实现", "测试调试", "优化完善", "总结经验"]'),

('综合训练', '进行综合能力训练', 60, 'hard',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["能力评估", "制定计划", "分项训练", "综合练习", "效果检验", "持续改进"]');

-- 思考类中等任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('月度总结', '进行月度工作生活总结', 25, 'easy',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["回顾月度经历", "分析得失", "总结经验", "发现问题", "制定改进计划"]'),

('战略思考', '进行战略性思考', 40, 'medium',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["分析现状", "识别机会", "评估风险", "制定策略", "规划实施", "监控调整"]'),

('创新思维', '进行创新思维训练', 35, 'medium',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["打破常规", "发散思维", "联想创新", "评估可行性", "优化方案", "实施规划"]'),

('哲学思辨', '进行哲学问题思辨', 60, 'hard',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["提出问题", "多角度分析", "逻辑推理", "寻找答案", "反思质疑", "形成观点"]');

-- 长任务 (60-120分钟)
-- 学习类长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('深度学习', '深入学习一个复杂主题', 75, 'medium',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["确定学习目标", "收集学习资料", "制定学习计划", "系统性学习", "实践应用", "总结反思"]'),

('技能掌握', '掌握一项新技能', 90, 'medium',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["了解技能要求", "学习基础知识", "观看教程演示", "动手实践", "解决问题", "熟练应用"]'),

('项目学习', '通过项目学习新知识', 105, 'hard',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["项目需求分析", "知识点梳理", "分步骤学习", "项目实施", "问题解决", "经验总结"]'),

('研究深入', '深入研究某个领域', 120, 'hard',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["文献调研", "理论学习", "实验验证", "数据分析", "结论总结", "成果展示"]');

-- 运动类长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('综合健身', '进行综合健身训练', 70, 'medium',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["全身热身", "力量训练", "有氧运动", "柔韧训练", "核心训练", "放松恢复"]'),

('户外运动', '进行户外运动锻炼', 85, 'medium',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["准备装备", "选择路线", "热身运动", "主要运动", "休息调整", "整理收工"]'),

('专项训练', '进行专项运动训练', 100, 'hard',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["技术分析", "基础训练", "专项练习", "强化训练", "技术改进", "效果评估"]'),

('运动挑战', '完成运动挑战项目', 120, 'hard',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["挑战准备", "体能测试", "技术准备", "挑战执行", "坚持完成", "成果庆祝"]');

-- 创作类长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('文章写作', '写作一篇完整文章', 80, 'medium',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["确定主题", "资料收集", "大纲制作", "正文写作", "修改润色", "最终定稿"]'),

('艺术创作', '完成一件艺术作品', 95, 'medium',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["创意构思", "草图设计", "材料准备", "创作执行", "细节完善", "作品完成"]'),

('多媒体制作', '制作多媒体作品', 110, 'hard',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["项目策划", "素材收集", "制作执行", "效果处理", "整合优化", "成品输出"]'),

('创意项目', '完成大型创意项目', 120, 'hard',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["项目规划", "团队协作", "分工执行", "质量控制", "项目整合", "成果展示"]');

-- 整理类长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('空间改造', '进行空间整理改造', 75, 'medium',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["现状分析", "改造规划", "物品分类", "空间清理", "重新布置", "效果优化"]'),

('系统整理', '进行系统性整理', 90, 'medium',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["制定整理计划", "分类整理", "建立系统", "标识管理", "维护机制", "效果评估"]'),

('数字化整理', '进行数字化整理', 105, 'hard',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["数据收集", "分类整理", "数字化处理", "系统建立", "备份保护", "维护更新"]'),

('全面整理', '进行全面深度整理', 120, 'hard',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["整体规划", "分区整理", "深度清理", "系统建立", "优化改进", "长期维护"]');

-- 冥想类长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('冥想课程', '完成一次冥想课程', 70, 'medium',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["课程准备", "引导学习", "实践练习", "体验分享", "问题解答", "总结收获"]'),

('静修练习', '进行静修练习', 85, 'medium',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["环境准备", "心理调适", "静修开始", "保持专注", "处理干扰", "平和结束"]'),

('深度体验', '进行深度冥想体验', 100, 'hard',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["充分准备", "进入状态", "深度体验", "觉察观照", "智慧洞察", "整合收获"]'),

('禅修营', '参加禅修营活动', 120, 'hard',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["报名准备", "学习规则", "参与活动", "深度练习", "交流分享", "持续实践"]');

-- 阅读类长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('书籍精读', '精读一本书的重要章节', 80, 'medium',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["选择章节", "预习准备", "仔细精读", "做读书笔记", "思考讨论", "总结收获"]'),

('文献研究', '进行文献研究', 95, 'medium',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["确定研究主题", "收集相关文献", "分类阅读", "对比分析", "总结观点", "形成结论"]'),

('专业研读', '深度研读专业资料', 110, 'hard',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["明确研读目标", "系统性阅读", "深度理解", "批判思考", "实践应用", "知识整合"]'),

('学术阅读', '进行学术性阅读', 120, 'hard',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["文献检索", "批判性阅读", "理论分析", "方法评估", "观点整合", "学术写作"]');

-- 练习类长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('技能强化', '进行技能强化训练', 75, 'medium',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["技能评估", "制定训练计划", "基础强化", "进阶练习", "综合应用", "效果检验"]'),

('项目实践', '完成实践项目', 90, 'medium',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["项目分析", "技能准备", "项目执行", "问题解决", "优化改进", "成果展示"]'),

('综合训练', '进行综合能力训练', 105, 'hard',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["能力诊断", "训练规划", "分项练习", "综合应用", "弱项强化", "全面提升"]'),

('专业实践', '进行专业实践', 120, 'hard',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["实践规划", "理论准备", "实际操作", "经验积累", "技能提升", "专业发展"]');

-- 思考类长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('深度反思', '进行深度自我反思', 70, 'medium',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["回顾经历", "分析得失", "发现模式", "思考改进", "制定计划", "持续成长"]'),

('战略规划', '制定战略规划', 85, 'medium',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["现状分析", "目标设定", "策略制定", "资源配置", "风险评估", "实施计划"]'),

('创新设计', '进行创新设计思考', 100, 'hard',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["问题定义", "创意发散", "方案设计", "可行性分析", "原型制作", "迭代优化"]'),

('哲学探索', '进行哲学问题探索', 120, 'hard',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["问题提出", "文献研究", "逻辑分析", "观点辩论", "深度思辨", "智慧总结"]');

-- 超长任务 (120-240分钟)
-- 学习类超长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('专业课程', '完成一门专业课程', 150, 'medium',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["课程规划", "理论学习", "实践操作", "作业完成", "考试准备", "知识巩固"]'),

('技能认证', '准备技能认证考试', 180, 'hard',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["考试大纲研究", "知识点梳理", "重点难点攻克", "模拟练习", "查漏补缺", "考前冲刺"]'),

('研究项目', '完成研究项目', 210, 'hard',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["项目立项", "文献调研", "方案设计", "实验执行", "数据分析", "报告撰写"]'),

('学位论文', '撰写学位论文章节', 240, 'hard',
 (SELECT id FROM task_categories WHERE name = '学习'),
 '["选题确定", "文献综述", "研究设计", "数据收集", "分析讨论", "论文写作"]');

-- 运动类超长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('马拉松训练', '进行马拉松训练', 140, 'hard',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["训练计划", "基础训练", "耐力提升", "速度训练", "恢复调整", "比赛准备"]'),

('登山徒步', '进行登山徒步', 170, 'hard',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["路线规划", "装备准备", "体能训练", "登山执行", "安全保障", "经验总结"]'),

('极限挑战', '完成极限运动挑战', 200, 'hard',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["挑战准备", "技能训练", "心理准备", "挑战执行", "安全保障", "成就庆祝"]'),

('运动竞赛', '参加运动竞赛', 240, 'hard',
 (SELECT id FROM task_categories WHERE name = '运动'),
 '["赛前准备", "技术训练", "战术准备", "比赛参与", "表现分析", "经验积累"]');

-- 创作类超长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('长篇写作', '完成长篇文章写作', 160, 'medium',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["主题确定", "结构设计", "资料收集", "分章写作", "整体修改", "最终完善"]'),

('艺术项目', '完成大型艺术项目', 190, 'hard',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["项目构思", "方案设计", "材料准备", "创作执行", "细节完善", "作品展示"]'),

('影视制作', '完成影视作品制作', 220, 'hard',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["剧本创作", "拍摄准备", "拍摄执行", "后期制作", "音效配乐", "成品输出"]'),

('综合创作', '完成综合性创作项目', 240, 'hard',
 (SELECT id FROM task_categories WHERE name = '创作'),
 '["项目策划", "团队组建", "分工协作", "创作执行", "质量控制", "项目交付"]');

-- 整理类超长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('全屋整理', '进行全屋深度整理', 150, 'medium',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["整体规划", "分区整理", "物品分类", "深度清洁", "重新布置", "系统维护"]'),

('办公整理', '进行办公环境整理', 180, 'hard',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["现状评估", "整理规划", "文件归档", "设备整理", "环境优化", "效率提升"]'),

('数据整理', '进行大数据整理', 210, 'hard',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["数据收集", "清洗处理", "分类归档", "系统建立", "备份保护", "访问优化"]'),

('生活整理', '进行全面生活整理', 240, 'hard',
 (SELECT id FROM task_categories WHERE name = '整理'),
 '["生活评估", "目标设定", "系统整理", "习惯建立", "持续优化", "生活品质提升"]');

-- 冥想类超长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('冥想工作坊', '参加冥想工作坊', 140, 'medium',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["工作坊准备", "理论学习", "实践练习", "经验分享", "问题解答", "持续练习"]'),

('静修营', '参加静修营', 170, 'hard',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["营前准备", "规则学习", "静修实践", "导师指导", "同修交流", "收获整合"]'),

('禅修深入', '进行深入禅修', 200, 'hard',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["心理准备", "环境营造", "深度静坐", "觉察观照", "智慧开发", "生活应用"]'),

('灵性探索', '进行灵性探索', 240, 'hard',
 (SELECT id FROM task_categories WHERE name = '冥想'),
 '["自我探索", "意识觉醒", "内在成长", "智慧开发", "慈悲培养", "生命转化"]');

-- 阅读类超长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('经典研读', '研读经典著作', 160, 'medium',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["背景了解", "全书通读", "重点精读", "笔记整理", "思考讨论", "心得总结"]'),

('专业研究', '进行专业领域研究', 190, 'hard',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["研究规划", "文献收集", "深度阅读", "对比分析", "观点整合", "研究报告"]'),

('学术写作', '完成学术论文写作', 220, 'hard',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["选题确定", "文献综述", "理论分析", "论证写作", "修改完善", "投稿准备"]'),

('知识整合', '进行知识体系整合', 240, 'hard',
 (SELECT id FROM task_categories WHERE name = '阅读'),
 '["知识梳理", "体系构建", "逻辑整合", "实践验证", "持续更新", "知识传播"]');

-- 练习类超长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('技能精通', '达到技能精通水平', 150, 'medium',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["技能评估", "精通规划", "系统训练", "实战应用", "经验积累", "专家水平"]'),

('项目开发', '完成完整项目开发', 180, 'hard',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["需求分析", "系统设计", "开发实现", "测试调试", "部署上线", "维护优化"]'),

('能力提升', '进行全面能力提升', 210, 'hard',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["能力诊断", "提升规划", "分项训练", "综合练习", "实战检验", "持续改进"]'),

('专业发展', '推进专业发展', 240, 'hard',
 (SELECT id FROM task_categories WHERE name = '练习'),
 '["职业规划", "技能发展", "经验积累", "网络建设", "机会把握", "成就实现"]');

-- 思考类超长任务
INSERT INTO tasks (title, description, duration, difficulty, category_id, steps) VALUES
('人生规划', '制定长期人生规划', 140, 'medium',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["现状分析", "价值澄清", "目标设定", "路径规划", "资源配置", "行动计划"]'),

('创业思考', '进行创业项目思考', 170, 'hard',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["市场分析", "商业模式", "竞争分析", "风险评估", "资源需求", "实施策略"]'),

('哲学思辨', '进行深度哲学思辨', 200, 'hard',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["问题提出", "理论研究", "逻辑分析", "观点辩论", "智慧总结", "生活应用"]'),

('系统思考', '进行系统性思考', 240, 'hard',
 (SELECT id FROM task_categories WHERE name = '思考'),
 '["系统分析", "要素识别", "关系梳理", "模式发现", "优化设计", "整体提升"]');