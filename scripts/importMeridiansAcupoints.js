#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import { fileURLToPath } from 'url'

const supabaseUrl = process.env.SUPABASE_URL || 'https://udhvygsrsgjwgumgioui.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.resolve(__dirname, '..', 'data')

function log(msg) {
  console.log(`[import] ${msg}`)
}

async function importMeridians() {
  const file = path.join(dataDir, 'meridians_data.json')
  log(`读取文件: ${file}`)
  if (!fs.existsSync(file)) throw new Error('meridians_data.json 不存在')
  const list = JSON.parse(fs.readFileSync(file, 'utf8'))
  log(`导入经络 ${list.length} 条`)

  let success = 0, failed = 0
  for (const m of list) {
    try {
      const typeMap = { 'regular': 'regular', 'extraordinary': 'extraordinary', '十二正经': 'regular', '奇经八脉': 'extraordinary' }
      const row = {
        name: (m.name || '').trim(),
        type: typeMap[m.type] || 'regular',
        pathway: m.pathway || null,
        main_functions: m.main_functions || null,
        associated_organs: m.associated_organs || null,
        flow_points: m.flow_points || null
      }
      const { error } = await supabase.from('meridians').upsert(row, { onConflict: 'name' })
      if (error) throw error
      success++
      if (success % 10 === 0) await new Promise(r => setTimeout(r, 50))
    } catch (e) {
      failed++
      log(`经络导入失败: ${m.name} - ${e.message}`)
    }
  }
  log(`经络导入完成 成功 ${success} 失败 ${failed}`)
}

async function importAcupoints() {
  const file = path.join(dataDir, 'acupoints_data.json')
  log(`读取文件: ${file}`)
  if (!fs.existsSync(file)) throw new Error('acupoints_data.json 不存在')
  const list = JSON.parse(fs.readFileSync(file, 'utf8'))
  log(`导入穴位 ${list.length} 条`)

  let success = 0, failed = 0
  for (const ap of list) {
    try {
      if (!ap.name) throw new Error('缺少 name')
      if (!ap.meridian_name) throw new Error('缺少 meridian_name')
      const { data: m, error: mErr } = await supabase.from('meridians').select('id').eq('name', ap.meridian_name).limit(1)
      if (mErr) throw mErr
      if (!m || m.length === 0) throw new Error(`未找到经络: ${ap.meridian_name}`)
      const meridian_id = m[0].id
      const row = {
        name: ap.name,
        meridian_id,
        location: ap.location || '',
        location_method: ap.location_method || null,
        indications: ap.indications || null,
        needle_depth: ap.needle_depth || null,
        manipulation: ap.manipulation || null,
        coordinates_3d: ap.coordinates_3d || null,
        anatomical_landmarks: ap.anatomical_landmarks || null
      }
      const { error } = await supabase.from('acupoints').upsert(row, { onConflict: ['name','meridian_id'] })
      if (error) throw error
      success++
      if (success % 10 === 0) await new Promise(r => setTimeout(r, 50))
    } catch (e) {
      failed++
      log(`穴位导入失败: ${ap.name} - ${e.message}`)
    }
  }
  log(`穴位导入完成 成功 ${success} 失败 ${failed}`)
}

async function main() {
  log('开始导入经络与穴位...')
  const { error } = await supabase.from('herbs').select('id').limit(1)
  if (error) throw new Error('Supabase 连接失败: ' + error.message)
  await importMeridians()
  await importAcupoints()
  log('导入任务完成！')
}

main().catch(e => { console.error(e); process.exit(1) })