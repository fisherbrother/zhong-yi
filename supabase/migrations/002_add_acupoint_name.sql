-- 添加穴位名称列，保持兼容性
ALTER TABLE acupoints ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- 若已有数据，尝试用现有代码填充名称，避免空值
UPDATE acupoints SET name = COALESCE(name, code) WHERE name IS NULL;

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_acupoints_name ON acupoints(name);