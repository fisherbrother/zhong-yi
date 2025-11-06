import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface ImportResult {
  success: boolean
  total: number
  imported: number
  failed: number
  errors: Array<{ item: string; error: string }>
  duration: number
}

export interface ImportOptions {
  batchSize?: number
  delayBetweenBatches?: number
  onProgress?: (progress: number, currentItem: string) => void
  onError?: (error: string, item: string) => void
}

export class DataImporter {
  private static instance: DataImporter
  
  private constructor() {}
  
  static getInstance(): DataImporter {
    if (!DataImporter.instance) {
      DataImporter.instance = new DataImporter()
    }
    return DataImporter.instance
  }

  /**
   * 导入中药数据
   */
  async importHerbs(herbsData: any[], options: ImportOptions = {}): Promise<ImportResult> {
    const startTime = Date.now()
    const result: ImportResult = {
      success: true,
      total: herbsData.length,
      imported: 0,
      failed: 0,
      errors: [],
      duration: 0
    }

    const batchSize = options.batchSize || 10
    const delayBetweenBatches = options.delayBetweenBatches || 100

    try {
      toast.info(`开始导入 ${herbsData.length} 条中药数据...`)

      for (let i = 0; i < herbsData.length; i += batchSize) {
        const batch = herbsData.slice(i, i + batchSize)
        const batchNumber = Math.floor(i / batchSize) + 1
        const totalBatches = Math.ceil(herbsData.length / batchSize)

        // 报告进度
        const progress = Math.round((i / herbsData.length) * 100)
        if (options.onProgress) {
          options.onProgress(progress, batch[0]?.name || '批量处理中...')
        }

        // 处理当前批次
        for (const herb of batch) {
          try {
            const validatedData = this.validateHerbData(herb)
            
            const { error } = await supabase
              .from('herbs')
              .upsert(validatedData, { onConflict: 'name' })

            if (error) {
              throw error
            }

            result.imported++
          } catch (error) {
            result.failed++
            const errorMsg = (error as any).message || '未知错误'
            result.errors.push({ item: herb.name || '未知中药', error: errorMsg })
            
            if (options.onError) {
              options.onError(errorMsg, herb.name || '未知中药')
            }
          }
        }

        // 批次间延迟
        if (i + batchSize < herbsData.length) {
          await this.delay(delayBetweenBatches)
        }
      }

      result.duration = Date.now() - startTime
      
      if (result.failed === 0) {
        toast.success(`中药数据导入完成！成功导入 ${result.imported} 条数据`)
      } else {
        toast.warning(`中药数据导入完成！成功 ${result.imported} 条，失败 ${result.failed} 条`)
      }

    } catch (error) {
      result.success = false
      result.duration = Date.now() - startTime
      toast.error(`中药数据导入失败: ${(error as any).message}`)
    }

    return result
  }

  /**
   * 导入方剂数据
   */
  async importFormulas(formulasData: any[], options: ImportOptions = {}): Promise<ImportResult> {
    const startTime = Date.now()
    const result: ImportResult = {
      success: true,
      total: formulasData.length,
      imported: 0,
      failed: 0,
      errors: [],
      duration: 0
    }

    const batchSize = options.batchSize || 5 // 方剂数据较复杂，使用较小的批次
    const delayBetweenBatches = options.delayBetweenBatches || 150

    try {
      toast.info(`开始导入 ${formulasData.length} 条方剂数据...`)

      for (let i = 0; i < formulasData.length; i += batchSize) {
        const batch = formulasData.slice(i, i + batchSize)
        const progress = Math.round((i / formulasData.length) * 100)
        
        if (options.onProgress) {
          options.onProgress(progress, batch[0]?.name || '批量处理中...')
        }

        // 处理当前批次
        for (const formula of batch) {
          try {
            const validatedData = this.validateFormulaData(formula)
            
            const { error } = await supabase
              .from('formulas')
              .upsert(validatedData, { onConflict: 'name' })

            if (error) {
              throw error
            }

            result.imported++
          } catch (error) {
            result.failed++
            const errorMsg = (error as any).message || '未知错误'
            result.errors.push({ item: formula.name || '未知方剂', error: errorMsg })
            
            if (options.onError) {
              options.onError(errorMsg, formula.name || '未知方剂')
            }
          }
        }

        // 批次间延迟
        if (i + batchSize < formulasData.length) {
          await this.delay(delayBetweenBatches)
        }
      }

      result.duration = Date.now() - startTime
      
      if (result.failed === 0) {
        toast.success(`方剂数据导入完成！成功导入 ${result.imported} 条数据`)
      } else {
        toast.warning(`方剂数据导入完成！成功 ${result.imported} 条，失败 ${result.failed} 条`)
      }

    } catch (error) {
      result.success = false
      result.duration = Date.now() - startTime
      toast.error(`方剂数据导入失败: ${(error as any).message}`)
    }

    return result
  }

  /**
   * 导入配伍禁忌数据
   */
  async importContraindications(contraindicationsData: any[], options: ImportOptions = {}): Promise<ImportResult> {
    const startTime = Date.now()
    const result: ImportResult = {
      success: true,
      total: contraindicationsData.length,
      imported: 0,
      failed: 0,
      errors: [],
      duration: 0
    }

    const batchSize = options.batchSize || 20
    const delayBetweenBatches = options.delayBetweenBatches || 50

    try {
      toast.info(`开始导入 ${contraindicationsData.length} 条配伍禁忌数据...`)

      for (let i = 0; i < contraindicationsData.length; i += batchSize) {
        const batch = contraindicationsData.slice(i, i + batchSize)
        const progress = Math.round((i / contraindicationsData.length) * 100)
        
        if (options.onProgress) {
          options.onProgress(progress, batch[0]?.name || '批量处理中...')
        }

        // 处理当前批次
        for (const contraindication of batch) {
          try {
            const validatedData = this.validateContraindicationData(contraindication)
            
            const { error } = await supabase
              .from('herb_contraindications')
              .insert(validatedData)

            if (error) {
              throw error
            }

            result.imported++
          } catch (error) {
            result.failed++
            const errorMsg = (error as any).message || '未知错误'
            result.errors.push({ item: contraindication.name || '未知禁忌', error: errorMsg })
            
            if (options.onError) {
              options.onError(errorMsg, contraindication.name || '未知禁忌')
            }
          }
        }

        // 批次间延迟
        if (i + batchSize < contraindicationsData.length) {
          await this.delay(delayBetweenBatches)
        }
      }

      result.duration = Date.now() - startTime
      
      if (result.failed === 0) {
        toast.success(`配伍禁忌数据导入完成！成功导入 ${result.imported} 条数据`)
      } else {
        toast.warning(`配伍禁忌数据导入完成！成功 ${result.imported} 条，失败 ${result.failed} 条`)
      }

    } catch (error) {
      result.success = false
      result.duration = Date.now() - startTime
      toast.error(`配伍禁忌数据导入失败: ${(error as any).message}`)
    }

    return result
  }

  /** 新增：导入经络数据 */
  async importMeridians(meridiansData: any[], options: ImportOptions = {}): Promise<ImportResult> {
    const startTime = Date.now()
    const result: ImportResult = {
      success: true,
      total: meridiansData.length,
      imported: 0,
      failed: 0,
      errors: [],
      duration: 0
    }

    const batchSize = options.batchSize || 10
    const delayBetweenBatches = options.delayBetweenBatches || 100

    try {
      toast.info(`开始导入 ${meridiansData.length} 条经络数据...`)

      for (let i = 0; i < meridiansData.length; i += batchSize) {
        const batch = meridiansData.slice(i, i + batchSize)
        const progress = Math.round((i / meridiansData.length) * 100)
        if (options.onProgress) options.onProgress(progress, batch[0]?.name || '批量处理中...')

        for (const m of batch) {
          try {
            const validated = this.validateMeridianData(m)
            // 先按名称查找是否存在
            const { data: existing, error: selErr } = await supabase
              .from('meridians')
              .select('id')
              .eq('name', validated.name)
              .limit(1)

            if (selErr) throw selErr

            let error
            if (existing && (existing as any[]).length > 0) {
              const id = (existing as any[])[0].id
              const { error: updateErr } = await supabase
                .from('meridians')
                .update(validated)
                .eq('id', id)
              error = updateErr
            } else {
              const { error: insertErr } = await supabase
                .from('meridians')
                .insert(validated)
              error = insertErr
            }

            if (error) throw error
            result.imported++
          } catch (e) {
            result.failed++
            const msg = (e as any).message || '未知错误'
            result.errors.push({ item: m.name || '未知经络', error: msg })
            if (options.onError) options.onError(msg, m.name || '未知经络')
          }
        }

        if (i + batchSize < meridiansData.length) await this.delay(delayBetweenBatches)
      }

      result.duration = Date.now() - startTime
      if (result.failed === 0) toast.success(`经络数据导入完成！成功 ${result.imported} 条`)
      else toast.warning(`经络数据导入完成！成功 ${result.imported} 条，失败 ${result.failed} 条`)
    } catch (e) {
      result.success = false
      result.duration = Date.now() - startTime
      toast.error(`经络数据导入失败: ${(e as any).message}`)
    }

    return result
  }

  /** 新增：导入穴位数据（支持 meridian_name 解析） */
  async importAcupoints(apData: any[], options: ImportOptions = {}): Promise<ImportResult> {
    const startTime = Date.now()
    const result: ImportResult = {
      success: true,
      total: apData.length,
      imported: 0,
      failed: 0,
      errors: [],
      duration: 0
    }

    const batchSize = options.batchSize || 20
    const delayBetweenBatches = options.delayBetweenBatches || 80

    try {
      toast.info(`开始导入 ${apData.length} 条穴位数据...`)
      for (let i = 0; i < apData.length; i += batchSize) {
        const batch = apData.slice(i, i + batchSize)
        const progress = Math.round((i / apData.length) * 100)
        if (options.onProgress) options.onProgress(progress, batch[0]?.name || '批量处理中...')

        for (const ap of batch) {
          try {
            const validated = this.validateAcupointData(ap)
            const meridianName = ap.meridian_name
            if (!meridianName) throw new Error('缺少 meridian_name 字段')

            const { data: mRow, error: mErr } = await supabase
              .from('meridians')
              .select('id')
              .eq('name', meridianName)
              .limit(1)
            if (mErr) throw mErr
            if (!mRow || (mRow as any[]).length === 0) throw new Error(`未找到经络: ${meridianName}`)
            const meridian_id = (mRow as any[])[0].id

            // 检查是否已存在
            const { data: existing, error: selErr } = await supabase
              .from('acupoints')
              .select('id')
              .eq('name', validated.name)
              .eq('meridian_id', meridian_id)
              .limit(1)
            if (selErr) throw selErr

            let error
            const payload = { ...validated, meridian_id }
            if (existing && (existing as any[]).length > 0) {
              const id = (existing as any[])[0].id
              const { error: updateErr } = await supabase
                .from('acupoints')
                .update(payload)
                .eq('id', id)
              error = updateErr
            } else {
              const { error: insertErr } = await supabase
                .from('acupoints')
                .insert(payload)
              error = insertErr
            }

            if (error) throw error
            result.imported++
          } catch (e) {
            result.failed++
            const msg = (e as any).message || '未知错误'
            result.errors.push({ item: ap.name || '未知穴位', error: msg })
            if (options.onError) options.onError(msg, ap.name || '未知穴位')
          }
        }

        if (i + batchSize < apData.length) await this.delay(delayBetweenBatches)
      }

      result.duration = Date.now() - startTime
      if (result.failed === 0) toast.success(`穴位数据导入完成！成功 ${result.imported} 条`)
      else toast.warning(`穴位数据导入完成！成功 ${result.imported} 条，失败 ${result.failed} 条`)
    } catch (e) {
      result.success = false
      result.duration = Date.now() - startTime
      toast.error(`穴位数据导入失败: ${(e as any).message}`)
    }

    return result
  }

  /**
   * 验证中药数据
   */
  private validateHerbData(herb: any) {
    if (!herb.name) {
      throw new Error('中药名称不能为空')
    }

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
      tags: Array.isArray(herb.tags) ? herb.tags : []
    }
  }

  /**
   * 验证方剂数据
   */
  private validateFormulaData(formula: any) {
    if (!formula.name) {
      throw new Error('方剂名称不能为空')
    }
    if (!formula.composition) {
      throw new Error('方剂组成不能为空')
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
      tags: Array.isArray(formula.tags) ? formula.tags : []
    }
  }

  /**
   * 验证配伍禁忌数据
   */
  private validateContraindicationData(contraindication: any) {
    if (!contraindication.name) {
      throw new Error('禁忌名称不能为空')
    }
    if (!contraindication.type) {
      throw new Error('禁忌类型不能为空')
    }
    if (!contraindication.herb_a || !contraindication.herb_b) {
      throw new Error('禁忌药物不能为空')
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
    }
  }

  /** 新增：验证经络数据 */
  private validateMeridianData(m: any) {
    if (!m.name) throw new Error('经络名称不能为空')
    // 支持中文类型映射
    const typeMap: Record<string, 'regular' | 'extraordinary'> = {
      'regular': 'regular',
      'extraordinary': 'extraordinary',
      '十二正经': 'regular',
      '奇经八脉': 'extraordinary'
    }
    const type = typeMap[m.type] || 'regular'
    return {
      name: m.name.trim(),
      type,
      pathway: m.pathway?.trim() || null,
      main_functions: m.main_functions?.trim() || null,
      associated_organs: m.associated_organs?.trim() || null,
      flow_points: m.flow_points || null
    }
  }

  /** 新增：验证穴位数据 */
  private validateAcupointData(ap: any) {
    if (!ap.name) throw new Error('穴位名称不能为空')
    if (!ap.location) throw new Error('穴位定位不能为空')
    return {
      name: ap.name.trim(),
      location: ap.location.trim(),
      location_method: ap.location_method?.trim() || null,
      indications: ap.indications?.trim() || null,
      needle_depth: ap.needle_depth?.trim() || null,
      manipulation: ap.manipulation?.trim() || null,
      coordinates_3d: ap.coordinates_3d || null,
      anatomical_landmarks: ap.anatomical_landmarks?.trim() || null
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 检查数据库连接
   */
  async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('herbs').select('id').limit(1)
      return !error
    } catch {
      return false
    }
  }

  /**
   * 获取导入统计信息
   */
  async getImportStats(): Promise<{
    herbs: number
    formulas: number
    contraindications: number
    lastImport?: string
  }> {
    try {
      const [herbsCount, formulasCount, contraindicationsCount] = await Promise.all([
        supabase.from('herbs').select('id', { count: 'exact', head: true }),
        supabase.from('formulas').select('id', { count: 'exact', head: true }),
        supabase.from('herb_contraindications').select('id', { count: 'exact', head: true })
      ])

      return {
        herbs: herbsCount.count || 0,
        formulas: formulasCount.count || 0,
        contraindications: contraindicationsCount.count || 0
      }
    } catch (error) {
      console.error('获取导入统计失败:', error)
      return { herbs: 0, formulas: 0, contraindications: 0 }
    }
  }
}

// 导出单例实例
export const dataImporter = DataImporter.getInstance()