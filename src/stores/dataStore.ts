import { create } from 'zustand'
import { supabase, Formula, Herb, Meridian, Acupoint } from '../lib/supabase'

interface DataState {
  // 方剂数据
  formulas: Formula[]
  formulasLoading: boolean
  formulasError: string | null
  
  // 中药数据
  herbs: Herb[]
  herbsLoading: boolean
  herbsError: string | null
  
  // 经络数据
  meridians: Meridian[]
  meridiansLoading: boolean
  meridiansError: string | null
  
  // 穴位数据
  acupoints: Acupoint[]
  acupointsLoading: boolean
  acupointsError: string | null
  
  // 收藏数据
  favorites: any[]
  favoritesLoading: boolean
  favoritesError: string | null
  
  // 分类统计数据
  categories: {
    herbCategories: string[]
    herbProperties: string[]
    herbMeridians: string[]
    formulaCategories: string[]
    formulaSyndromes: string[]
    formulaDiseaseTypes: string[]
  }
  
  // Actions
  fetchFormulas: (filters?: {
    category?: string
    syndrome?: string
    disease_type?: string
    search?: string
  }) => Promise<void>
  fetchHerbs: (filters?: {
    category?: string
    property?: string
    meridian_tropism?: string
    search?: string
  }) => Promise<void>
  fetchMeridians: () => Promise<void>
  fetchAcupoints: (meridianId?: string) => Promise<void>
  fetchFavorites: () => Promise<void>
  addToFavorites: (itemType: 'formula' | 'herb' | 'acupoint' | 'meridian', itemId: string) => Promise<void>
  removeFromFavorites: (itemType: 'formula' | 'herb' | 'acupoint' | 'meridian', itemId: string) => Promise<void>
  fetchCategories: () => Promise<void>
}

export const useDataStore = create<DataState>((set, get) => ({
  // 初始状态
  formulas: [],
  formulasLoading: false,
  formulasError: null,
  
  herbs: [],
  herbsLoading: false,
  herbsError: null,
  
  meridians: [],
  meridiansLoading: false,
  meridiansError: null,
  
  acupoints: [],
  acupointsLoading: false,
  acupointsError: null,
  
  favorites: [],
  favoritesLoading: false,
  favoritesError: null,
  
  // 分类统计初始状态
  categories: {
    herbCategories: [],
    herbProperties: [],
    herbMeridians: [],
    formulaCategories: [],
    formulaSyndromes: [],
    formulaDiseaseTypes: []
  },

  // 获取方剂数据
  fetchFormulas: async (filters = {}) => {
    set({ formulasLoading: true, formulasError: null })
    try {
      let query = supabase
        .from('formulas')
        .select('*')
        .order('name', { ascending: true })

      // 应用过滤器
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.syndrome) {
        query = query.eq('syndrome', filters.syndrome)
      }
      if (filters.disease_type) {
        query = query.eq('disease_type', filters.disease_type)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,composition.ilike.%${filters.search}%,efficacy.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      
      if (error) throw error
      
      set({ formulas: data || [], formulasLoading: false })
    } catch (error) {
      set({ 
        formulasError: error instanceof Error ? error.message : '获取方剂数据失败',
        formulasLoading: false 
      })
    }
  },

  // 获取中药数据
  fetchHerbs: async (filters = {}) => {
    set({ herbsLoading: true, herbsError: null })
    try {
      let query = supabase
        .from('herbs')
        .select('*')
        .order('name', { ascending: true })

      // 应用过滤器
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.property) {
        query = query.eq('property', filters.property)
      }
      if (filters.meridian_tropism) {
        query = query.eq('meridian_tropism', filters.meridian_tropism)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,efficacy.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      
      if (error) throw error
      
      set({ herbs: data || [], herbsLoading: false })
    } catch (error) {
      set({ 
        herbsError: error instanceof Error ? error.message : '获取中药数据失败',
        herbsLoading: false 
      })
    }
  },

  // 获取经络数据
  fetchMeridians: async () => {
    set({ meridiansLoading: true, meridiansError: null })
    try {
      const { data, error } = await supabase
        .from('meridians')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      
      set({ meridians: data || [], meridiansLoading: false })
    } catch (error) {
      set({ 
        meridiansError: error instanceof Error ? error.message : '获取经络数据失败',
        meridiansLoading: false 
      })
    }
  },

  // 获取穴位数据
  fetchAcupoints: async (meridianId?: string) => {
    set({ acupointsLoading: true, acupointsError: null })
    try {
      let query = supabase
        .from('acupoints')
        .select(`
          *,
          meridians!inner(name)
        `)
        .order('name', { ascending: true })

      if (meridianId) {
        query = query.eq('meridian_id', meridianId)
      }

      const { data, error } = await query
      
      if (error) throw error
      
      set({ acupoints: data || [], acupointsLoading: false })
    } catch (error) {
      set({ 
        acupointsError: error instanceof Error ? error.message : '获取穴位数据失败',
        acupointsLoading: false 
      })
    }
  },

  // 获取收藏数据
  fetchFavorites: async () => {
    set({ favoritesLoading: true, favoritesError: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
      
      if (error) throw error
      
      set({ favorites: data || [], favoritesLoading: false })
    } catch (error) {
      set({ 
        favoritesError: error instanceof Error ? error.message : '获取收藏数据失败',
        favoritesLoading: false 
      })
    }
  },

  // 添加到收藏
  addToFavorites: async (itemType: 'formula' | 'herb' | 'acupoint', itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')

      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId
        })
      
      if (error) throw error
      
      // 重新获取收藏数据
      await get().fetchFavorites()
    } catch (error) {
      throw error instanceof Error ? error : new Error('添加收藏失败')
    }
  },

  // 从收藏中移除
  removeFromFavorites: async (itemType: 'formula' | 'herb' | 'acupoint', itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
      
      if (error) throw error
      
      // 重新获取收藏数据
      await get().fetchFavorites()
    } catch (error) {
      throw error instanceof Error ? error : new Error('移除收藏失败')
    }
  },

  // 获取分类统计数据
  fetchCategories: async () => {
    try {
      // 获取中药分类
      const { data: herbCategories } = await supabase
        .from('herbs')
        .select('category')
        .not('category', 'is', null)
      const uniqueHerbCategories = [...new Set(herbCategories?.map(h => h.category).filter(Boolean))]

      // 获取中药性味
      const { data: herbProperties } = await supabase
        .from('herbs')
        .select('property')
        .not('property', 'is', null)
      const uniqueHerbProperties = [...new Set(herbProperties?.map(h => h.property).filter(Boolean))]

      // 获取中药归经
      const { data: herbMeridians } = await supabase
        .from('herbs')
        .select('meridian_tropism')
        .not('meridian_tropism', 'is', null)
      const uniqueHerbMeridians = [...new Set(herbMeridians?.map(h => h.meridian_tropism).filter(Boolean))]

      // 获取方剂分类
      const { data: formulaCategories } = await supabase
        .from('formulas')
        .select('category')
        .not('category', 'is', null)
      const uniqueFormulaCategories = [...new Set(formulaCategories?.map(f => f.category).filter(Boolean))]

      // 获取方剂证型
      const { data: formulaSyndromes } = await supabase
        .from('formulas')
        .select('syndrome')
        .not('syndrome', 'is', null)
      const uniqueFormulaSyndromes = [...new Set(formulaSyndromes?.map(f => f.syndrome).filter(Boolean))]

      // 获取方剂病型
      const { data: formulaDiseaseTypes } = await supabase
        .from('formulas')
        .select('disease_type')
        .not('disease_type', 'is', null)
      const uniqueFormulaDiseaseTypes = [...new Set(formulaDiseaseTypes?.map(f => f.disease_type).filter(Boolean))]

      set({
        categories: {
          herbCategories: uniqueHerbCategories,
          herbProperties: uniqueHerbProperties,
          herbMeridians: uniqueHerbMeridians,
          formulaCategories: uniqueFormulaCategories,
          formulaSyndromes: uniqueFormulaSyndromes,
          formulaDiseaseTypes: uniqueFormulaDiseaseTypes
        }
      })
    } catch (error) {
      console.error('获取分类数据失败:', error)
    }
  },
}))