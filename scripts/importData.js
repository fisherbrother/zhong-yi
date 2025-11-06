#!/usr/bin/env node

import 'dotenv/config'
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url'

// Supabase配置（优先使用服务密钥以便写入）
const supabaseUrl = process.env.SUPABASE_URL || 'https://udhvygsrsgjwgumgioui.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaHZ5Z3Nyc2dqd2d1bWdpb3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTI0MjksImV4cCI6MjA3NzkyODQyOX0.gVoJ5WOWMr2ezINNZ5iM3T85sklQyIegei0o5KKYWrY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 数据文件路径（兼容 Windows 路径）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.resolve(__dirname, '..', 'data');

// 导入进度统计
let importStats = {
  herbs: { total: 0, success: 0, failed: 0, errors: [] },
  formulas: { total: 0, success: 0, failed: 0, errors: [] },
  contraindications: { total: 0, success: 0, failed: 0, errors: [] }
};

// 工具函数
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  
  const color = colors[type] || colors.info;
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 验证数据格式
function validateHerbData(herb) {
  const required = ['name'];
  for (const field of required) {
    if (!herb[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // 数据清洗和标准化
  return {
    name: herb.name.trim(),
    pinyin: herb.pinyin?.trim() || null,
    latin_name: herb.latin_name?.trim() || null,
    nature_flavor: herb.nature_flavor?.trim() || null,
    meridian_tropism: herb.meridian_tropism?.trim() || null,
    efficacy: herb.efficacy?.trim() || null,
    usage_dosage: herb.usage_dosage?.trim() || null,
    contraindications: herb.contraindications?.trim() || null,
    category: herb.category?.trim() || null,
    property: herb.property?.trim() || null,
    toxicity_level: herb.toxicity_level || 'none',
    processing_method: herb.processing_method?.trim() || null,
    origin: herb.origin?.trim() || null,
    quality_identification: herb.quality_identification?.trim() || null,
    storage_method: herb.storage_method?.trim() || null,
    image_url: herb.image_url?.trim() || null,
    tags: herb.tags || []
  };
}

function validateFormulaData(formula) {
  const required = ['name', 'composition'];
  for (const field of required) {
    if (!formula[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  return {
    name: formula.name.trim(),
    pinyin: formula.pinyin?.trim() || null,
    composition: formula.composition.trim(),
    dosage: formula.dosage?.trim() || null,
    decoction_method: formula.decoction_method?.trim() || null,
    efficacy: formula.efficacy?.trim() || null,
    indications: formula.indications?.trim() || null,
    usage: formula.usage?.trim() || null,
    contraindications: formula.contraindications?.trim() || null,
    source: formula.source?.trim() || null,
    category: formula.category?.trim() || null,
    syndrome: formula.syndrome?.trim() || null,
    disease_type: formula.disease_type?.trim() || null,
    therapeutic_principle: formula.therapeutic_principle?.trim() || null,
    clinical_application: formula.clinical_application?.trim() || null,
    modern_research: formula.modern_research?.trim() || null,
    tags: formula.tags || []
  };
}

function validateContraindicationData(contraindication) {
  const required = ['name', 'type', 'herb_a', 'herb_b'];
  for (const field of required) {
    if (!contraindication[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  return {
    name: contraindication.name.trim(),
    type: contraindication.type.trim(),
    herb_a: contraindication.herb_a.trim(),
    herb_b: contraindication.herb_b.trim(),
    description: contraindication.description?.trim() || null,
    severity: contraindication.severity || 'high',
    mechanism: contraindication.mechanism?.trim() || null,
    clinical_manifestation: contraindication.clinical_manifestation?.trim() || null,
    management: contraindication.management?.trim() || null,
    references_text: contraindication.references_text?.trim() || null
  };
}

// 导入中药数据
async function importHerbs() {
  log('开始导入中药数据...', 'info');
  
  try {
    const herbsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'herbs_data.json'), 'utf8'));
    importStats.herbs.total = herbsData.length;
    
    log(`找到 ${herbsData.length} 条中药数据`, 'info');
    
    for (let i = 0; i < herbsData.length; i++) {
      const herb = herbsData[i];
      
      try {
        const validatedData = validateHerbData(herb);
        
        const { data, error } = await supabase
          .from('herbs')
          .upsert(validatedData, { onConflict: 'name' })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        importStats.herbs.success++;
        log(`✓ 导入成功: ${herb.name}`, 'success');
        
        // 避免API限制，添加小延迟
        if (i % 10 === 0) {
          await delay(100);
        }
        
      } catch (error) {
        importStats.herbs.failed++;
        importStats.herbs.errors.push({
          name: herb.name,
          error: error.message
        });
        log(`✗ 导入失败: ${herb.name} - ${error.message}`, 'error');
      }
    }
    
    log(`中药数据导入完成: 成功 ${importStats.herbs.success}, 失败 ${importStats.herbs.failed}`, 'info');
    
  } catch (error) {
    log(`导入中药数据时发生错误: ${error.message}`, 'error');
    throw error;
  }
}

// 导入方剂数据
async function importFormulas() {
  log('开始导入方剂数据...', 'info');
  
  try {
    const formulasData = JSON.parse(fs.readFileSync(path.join(dataDir, 'formulas_data.json'), 'utf8'));
    importStats.formulas.total = formulasData.length;
    
    log(`找到 ${formulasData.length} 条方剂数据`, 'info');
    
    for (let i = 0; i < formulasData.length; i++) {
      const formula = formulasData[i];
      
      try {
        const validatedData = validateFormulaData(formula);
        
        const { data, error } = await supabase
          .from('formulas')
          .upsert(validatedData, { onConflict: 'name' })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        importStats.formulas.success++;
        log(`✓ 导入成功: ${formula.name}`, 'success');
        
        // 避免API限制，添加小延迟
        if (i % 10 === 0) {
          await delay(100);
        }
        
      } catch (error) {
        importStats.formulas.failed++;
        importStats.formulas.errors.push({
          name: formula.name,
          error: error.message
        });
        log(`✗ 导入失败: ${formula.name} - ${error.message}`, 'error');
      }
    }
    
    log(`方剂数据导入完成: 成功 ${importStats.formulas.success}, 失败 ${importStats.formulas.failed}`, 'info');
    
  } catch (error) {
    log(`导入方剂数据时发生错误: ${error.message}`, 'error');
    throw error;
  }
}

// 导入配伍禁忌数据
async function importContraindications() {
  log('开始导入配伍禁忌数据...', 'info');
  
  try {
    const contraindicationsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'herb_contraindications.json'), 'utf8'));
    importStats.contraindications.total = contraindicationsData.length;
    
    log(`找到 ${contraindicationsData.length} 条配伍禁忌数据`, 'info');
    
    for (let i = 0; i < contraindicationsData.length; i++) {
      const contraindication = contraindicationsData[i];
      
      try {
        const validatedData = validateContraindicationData(contraindication);
        
        const { data, error } = await supabase
          .from('herb_contraindications')
          .insert(validatedData)
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        importStats.contraindications.success++;
        log(`✓ 导入成功: ${contraindication.name}`, 'success');
        
        // 避免API限制，添加小延迟
        if (i % 10 === 0) {
          await delay(100);
        }
        
      } catch (error) {
        importStats.contraindications.failed++;
        importStats.contraindications.errors.push({
          name: contraindication.name,
          error: error.message
        });
        log(`✗ 导入失败: ${contraindication.name} - ${error.message}`, 'error');
      }
    }
    
    log(`配伍禁忌数据导入完成: 成功 ${importStats.contraindications.success}, 失败 ${importStats.contraindications.failed}`, 'info');
    
  } catch (error) {
    log(`导入配伍禁忌数据时发生错误: ${error.message}`, 'error');
    throw error;
  }
}

// 生成导入报告
function generateReport() {
  const report = `
========== 中医药数据导入报告 ==========
导入时间: ${new Date().toISOString()}

中药数据:
- 总数: ${importStats.herbs.total}
- 成功: ${importStats.herbs.success}
- 失败: ${importStats.herbs.failed}
${importStats.herbs.errors.length > 0 ? `- 错误详情:\n${importStats.herbs.errors.map(e => `  * ${e.name}: ${e.error}`).join('\n')}` : ''}

方剂数据:
- 总数: ${importStats.formulas.total}
- 成功: ${importStats.formulas.success}
- 失败: ${importStats.formulas.failed}
${importStats.formulas.errors.length > 0 ? `- 错误详情:\n${importStats.formulas.errors.map(e => `  * ${e.name}: ${e.error}`).join('\n')}` : ''}

配伍禁忌数据:
- 总数: ${importStats.contraindications.total}
- 成功: ${importStats.contraindications.success}
- 失败: ${importStats.contraindications.failed}
${importStats.contraindications.errors.length > 0 ? `- 错误详情:\n${importStats.contraindications.errors.map(e => `  * ${e.name}: ${e.error}`).join('\n')}` : ''}

总计:
- 总记录数: ${importStats.herbs.total + importStats.formulas.total + importStats.contraindications.total}
- 成功导入: ${importStats.herbs.success + importStats.formulas.success + importStats.contraindications.success}
- 失败导入: ${importStats.herbs.failed + importStats.formulas.failed + importStats.contraindications.failed}

========================================
  `;
  
  log(report, 'info');
  
  // 保存报告到文件
  const reportPath = path.join(__dirname, '..', 'data', 'import_report.txt');
  fs.writeFileSync(reportPath, report);
  log(`导入报告已保存到: ${reportPath}`, 'info');
}

// 主函数
async function main() {
  log('开始中医药数据导入任务...', 'info');
  
  try {
    // 检查数据文件是否存在
    const requiredFiles = ['herbs_data.json', 'formulas_data.json', 'herb_contraindications.json'];
    for (const file of requiredFiles) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`数据文件不存在: ${filePath}`);
      }
    }
    
    // 按顺序导入数据
    await importHerbs();
    await importFormulas();
    await importContraindications();
    
    // 生成报告
    generateReport();
    
    log('中医药数据导入任务完成！', 'success');
    
  } catch (error) {
    log(`数据导入任务失败: ${error.message}`, 'error');
    process.exit(1);
  }
}

// 运行主函数（无条件调用，避免 Windows 路径比较问题）
console.log('开始导入中医药数据...')
main().then(() => {
  console.log('数据导入完成！')
}).catch(error => {
  log(`未捕获的错误: ${error.message}`, 'error')
  process.exit(1)
})

export {
  importHerbs,
  importFormulas,
  importContraindications,
  main as importAllData
};