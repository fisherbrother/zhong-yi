-- 中医药数据库表结构创建
-- 创建中药表
CREATE TABLE IF NOT EXISTS herbs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    pinyin VARCHAR(100),
    latin_name VARCHAR(200),
    nature_flavor VARCHAR(100),
    meridian_tropism VARCHAR(200),
    efficacy TEXT,
    usage_dosage VARCHAR(200),
    contraindications TEXT,
    category VARCHAR(50),
    property VARCHAR(50),
    toxicity_level VARCHAR(20) DEFAULT 'none',
    processing_method VARCHAR(200),
    origin VARCHAR(100),
    quality_identification TEXT,
    storage_method VARCHAR(200),
    image_url TEXT,
    tags TEXT[], -- PostgreSQL数组类型
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建方剂表
CREATE TABLE IF NOT EXISTS formulas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pinyin VARCHAR(100),
    composition TEXT NOT NULL, -- 组成药物及剂量
    dosage VARCHAR(200),
    decoction_method TEXT,
    efficacy TEXT,
    indications TEXT,
    usage TEXT,
    contraindications TEXT,
    source VARCHAR(200),
    category VARCHAR(50),
    syndrome VARCHAR(100),
    disease_type VARCHAR(100),
    therapeutic_principle VARCHAR(200),
    clinical_application TEXT,
    modern_research TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建配伍禁忌表
CREATE TABLE IF NOT EXISTS herb_contraindications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'eighteen_incompatible', 'nineteen_antagonistic', 'pregnancy', 'other'
    herb_a VARCHAR(100) NOT NULL,
    herb_b VARCHAR(100) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'high',
    mechanism TEXT,
    clinical_manifestation TEXT,
    management TEXT,
    references_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建经络表
CREATE TABLE IF NOT EXISTS meridians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    pinyin VARCHAR(100),
    type VARCHAR(20) NOT NULL CHECK (type IN ('regular', 'extraordinary')), -- 正经或奇经
    pathway TEXT,
    main_functions TEXT,
    associated_organs VARCHAR(200),
    flow_points JSONB, -- 经络循行穴位
    clinical_significance TEXT,
    related_diseases TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建穴位表
CREATE TABLE IF NOT EXISTS acupoints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pinyin VARCHAR(100),
    code VARCHAR(20) UNIQUE, -- 穴位代码，如LI4
    meridian_id UUID REFERENCES meridians(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    location_method TEXT,
    indications TEXT,
    needle_depth VARCHAR(100),
    manipulation TEXT,
    coordinates_3d JSONB, -- 3D坐标
    anatomical_landmarks TEXT,
    clinical_notes TEXT,
    precautions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建用户收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('formula', 'herb', 'acupoint')),
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, item_type, item_id)
);

-- 创建用户笔记表
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    item_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建方剂-中药关联表（用于解析方剂组成）
CREATE TABLE IF NOT EXISTS formula_herbs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    formula_id UUID REFERENCES formulas(id) ON DELETE CASCADE,
    herb_id UUID REFERENCES herbs(id) ON DELETE CASCADE,
    dosage VARCHAR(100), -- 该药物在方剂中的剂量
    preparation_method VARCHAR(200), -- 炮制方法
    special_instructions TEXT, -- 特殊用法说明
    order_index INTEGER DEFAULT 0, -- 药物在方剂中的顺序
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(formula_id, herb_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_herbs_name ON herbs(name);
CREATE INDEX IF NOT EXISTS idx_herbs_category ON herbs(category);
CREATE INDEX IF NOT EXISTS idx_herbs_tags ON herbs USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_formulas_name ON formulas(name);
CREATE INDEX IF NOT EXISTS idx_formulas_category ON formulas(category);
CREATE INDEX IF NOT EXISTS idx_formulas_tags ON formulas USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_herb_contraindications_type ON herb_contraindications(type);
CREATE INDEX IF NOT EXISTS idx_herb_contraindications_herbs ON herb_contraindications(herb_a, herb_b);

CREATE INDEX IF NOT EXISTS idx_acupoints_meridian ON acupoints(meridian_id);
CREATE INDEX IF NOT EXISTS idx_acupoints_code ON acupoints(code);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_type, item_id);

CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_item ON notes(item_type, item_id);

CREATE INDEX IF NOT EXISTS idx_formula_herbs_formula ON formula_herbs(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_herbs_herb ON formula_herbs(herb_id);

-- 创建全文搜索索引（使用默认英文配置，中文搜索将通过其他方式实现）
CREATE INDEX IF NOT EXISTS idx_herbs_search ON herbs USING GIN(to_tsvector('english', name || ' ' || COALESCE(efficacy, '') || ' ' || COALESCE(contraindications, '')));
CREATE INDEX IF NOT EXISTS idx_formulas_search ON formulas USING GIN(to_tsvector('english', name || ' ' || COALESCE(efficacy, '') || ' ' || COALESCE(indications, '')));

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间触发器
CREATE TRIGGER update_herbs_updated_at BEFORE UPDATE ON herbs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formulas_updated_at BEFORE UPDATE ON formulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meridians_updated_at BEFORE UPDATE ON meridians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acupoints_updated_at BEFORE UPDATE ON acupoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();