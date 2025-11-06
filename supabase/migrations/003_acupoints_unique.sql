-- 为穴位表添加唯一索引，支持 upsert 冲突键
CREATE UNIQUE INDEX IF NOT EXISTS idx_acupoints_name_meridian_unique ON acupoints(name, meridian_id);