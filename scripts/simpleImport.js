#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = 'https://udhvygsrsgjwgumgioui.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaHZ5Z3Nyc2dqd2d1bWdpb3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTI0MjksImV4cCI6MjA3NzkyODQyOX0.gVoJ5WOWMr2ezINNZ5iM3T85sklQyIegei0o5KKYWrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('测试Supabase连接...');
    const { data, error } = await supabase.from('herbs').select('id').limit(1);
    
    if (error) {
      console.error('连接失败:', error.message);
      return false;
    }
    
    console.log('连接成功！');
    return true;
  } catch (error) {
    console.error('连接错误:', error.message);
    return false;
  }
}

async function importHerbs() {
  try {
    console.log('开始导入中药数据...');
    const herbsData = JSON.parse(fs.readFileSync('./data/herbs_data.json', 'utf8'));
    
    console.log(`找到 ${herbsData.length} 条中药数据`);
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < herbsData.length; i++) {
      const herb = herbsData[i];
      
      try {
        const { data, error } = await supabase
          .from('herbs')
          .upsert({
            name: herb.中药名,
            pinyin: herb.拼音 || '',
            english_name: herb.英文名 || '',
            category: herb.分类 || '',
            nature: herb.性味 || '',
            meridian: herb.归经 || '',
            effects: herb.功效 || '',
            indications: herb.主治 || '',
            dosage: herb.用法用量 || '',
            contraindications: herb.禁忌 || '',
            description: herb.描述 || '',
            source: herb.来源 || '',
            tags: herb.标签 || []
          }, { onConflict: 'name' })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        success++;
        console.log(`✓ 导入成功: ${herb.中药名}`);
        
        // 避免API限制
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        failed++;
        console.error(`✗ 导入失败: ${herb.中药名} - ${error.message}`);
      }
    }
    
    console.log(`中药数据导入完成: 成功 ${success}, 失败 ${failed}`);
    
  } catch (error) {
    console.error('导入中药数据时发生错误:', error.message);
  }
}

async function importFormulas() {
  try {
    console.log('\n开始导入方剂数据...');
    const formulasData = JSON.parse(fs.readFileSync('./data/formulas_data.json', 'utf8'));
    
    console.log(`找到 ${formulasData.length} 条方剂数据`);
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < formulasData.length; i++) {
      const formula = formulasData[i];
      
      try {
        // 先检查是否已存在
        const { data: existing } = await supabase
          .from('formulas')
          .select('id')
          .eq('name', formula.name)
          .single();
        
        const formulaData = {
          name: formula.name,
          pinyin: formula.pinyin || '',
          composition: formula.composition || '',
          dosage: formula.dosage || '',
          decoction_method: formula.preparation || formula.decoction_method || '',
          efficacy: formula.efficacy || '',
          indications: formula.indications || '',
          usage: formula.usage || '',
          contraindications: formula.contraindications || '',
          source: formula.source || '',
          category: formula.category || '',
          syndrome: formula.syndrome || '',
          therapeutic_principle: formula.therapeutic_principle || '',
          clinical_application: formula.clinical_application || '',
          modern_research: formula.modern_research || '',
          tags: formula.tags || []
        };

        let error;
        if (existing) {
          // 如果存在，更新记录
          const { error: updateError } = await supabase
            .from('formulas')
            .update(formulaData)
            .eq('id', existing.id);
          error = updateError;
        } else {
          // 如果不存在，插入新记录
          const { error: insertError } = await supabase
            .from('formulas')
            .insert(formulaData);
          error = insertError;
        }
        
        if (error) {
          throw error;
        }
        
        success++;
        console.log(`✓ 导入成功: ${formula.name}`);
        
        // 避免API限制
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        failed++;
        console.error(`✗ 导入失败: ${formula.name} - ${error.message}`);
      }
    }
    
    console.log(`方剂数据导入完成: 成功 ${success}, 失败 ${failed}`);
    
  } catch (error) {
    console.error('导入方剂数据时发生错误:', error.message);
  }
}

async function importContraindications() {
  try {
    console.log('\n开始导入配伍禁忌数据...');
    const contraindicationsData = JSON.parse(fs.readFileSync('./data/herb_contraindications.json', 'utf8'));
    
    console.log(`找到 ${contraindicationsData.length} 条配伍禁忌数据`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // 处理配伍禁忌数据
    for (let i = 0; i < contraindicationsData.length; i++) {
      const group = contraindicationsData[i];
      console.log(`处理第 ${i + 1} 组配伍禁忌，类型: ${group.type}`);
      
      if (!group.rules || !Array.isArray(group.rules)) {
        console.error('配伍禁忌数据格式错误，跳过该组:', group);
        continue;
      }
      
      for (let j = 0; j < group.rules.length; j++) {
        const rule = group.rules[j];
        
        try {
          // 确保名称不为空
          const name = `${rule.herb1} - ${rule.herb2}`;
          if (!rule.herb1 || !rule.herb2 || name === ' - ') {
            console.error('配伍禁忌药材名称不完整，跳过:', rule);
            errorCount++;
            continue;
          }
          
          // 转换数据格式以匹配数据库结构
          const contraindicationData = {
            name: name,
            type: group.type,
            herb_a: rule.herb1 || '',
            herb_b: rule.herb2 || '',
            description: rule.description || '',
            severity: rule.severity || 'high',
            mechanism: rule.mechanism || '',
            clinical_manifestation: rule.clinical_manifestation || '',
            management: rule.management || '',
            references_text: rule.references_text || ''
          };
          
          // 先检查是否已存在
          const { data: existing } = await supabase
            .from('herb_contraindications')
            .select('id')
            .eq('name', name);
          
          let error;
          if (existing && existing.length > 0) {
            // 如果存在，更新记录
            const { error: updateError } = await supabase
              .from('herb_contraindications')
              .update(contraindicationData)
              .eq('id', existing[0].id);
            error = updateError;
          } else {
            // 如果不存在，插入新记录
            const { error: insertError } = await supabase
              .from('herb_contraindications')
              .insert(contraindicationData);
            error = insertError;
          }
          
          if (error) {
            console.error(`导入配伍禁忌 ${contraindicationData.name} 失败:`, error.message);
            errorCount++;
          } else {
            successCount++;
            console.log(`成功导入配伍禁忌: ${contraindicationData.name}`);
          }
          
          // 避免API限制
          if ((successCount + errorCount) % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (err) {
          console.error(`处理配伍禁忌时出错 (组${i + 1}, 规则${j + 1}):`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`配伍禁忌数据导入完成: 成功 ${successCount}, 失败 ${errorCount}`);
    
  } catch (error) {
    console.error('导入配伍禁忌数据时发生错误:', error.message);
  }
}

async function main() {
  console.log('=== 中医药数据导入工具 ===\n');
  
  try {
    // 测试连接
    const connected = await testConnection();
    if (!connected) {
      console.log('无法连接到Supabase数据库');
      return;
    }
    
    // 导入数据
    await importHerbs();
    await importFormulas();
    await importContraindications();
    
    console.log('\n=== 数据导入完成！ ===');
    
  } catch (error) {
    console.error('导入过程中发生错误:', error.message);
  }
}

// 运行主函数
main();