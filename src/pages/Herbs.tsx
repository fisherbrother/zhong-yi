import { useState, useEffect } from 'react'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import { Link } from 'react-router-dom'
import { Heart, Filter, Search } from 'lucide-react'
import { toast } from 'sonner'

export function Herbs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedNature, setSelectedNature] = useState('')
  const [selectedFlavor, setSelectedFlavor] = useState('')
  const [selectedToxicity, setSelectedToxicity] = useState('')
  const { herbs, herbsLoading: loading, categories, fetchCategories, fetchHerbs } = useDataStore()
  const { user } = useAuthStore()

  // 获取分类数据并加载中药列表
  useEffect(() => {
    fetchCategories()
    fetchHerbs()
  }, [])

  const natures = categories?.herbProperties || ['寒', '热', '温', '凉', '平']
  const flavors = ['辛', '甘', '酸', '苦', '咸', '淡', '涩']
  const toxicities = ['无毒', '小毒', '有毒', '大毒']
  const meridians = ['肺经', '大肠经', '胃经', '脾经', '心经', '小肠经', '膀胱经', '肾经', '心包经', '三焦经', '胆经', '肝经']

  const filteredHerbs = herbs.filter(herb => {
      const matchesSearch = searchTerm === '' || 
        herb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (herb as any).pinyin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herb.efficacy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herb.meridian_tropism?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !selectedCategory || herb.category === selectedCategory
      const matchesProperty = !selectedNature || herb.property === selectedNature
      const matchesNatureFlavor = !selectedFlavor || herb.nature_flavor?.includes(selectedFlavor)
      
      return matchesSearch && matchesCategory && matchesProperty && matchesNatureFlavor
    })

  const checkIncompatibility = (herb: any) => {
    // 十八反十九畏检查
    const incompatibilityWarnings = []
    
    // 十八反
    const eighteenContradictions = {
      '甘草': ['海藻', '大戟', '芫花', '甘遂'],
      '乌头': ['贝母', '瓜蒌', '半夏', '白蔹', '白及'],
      '藜芦': ['人参', '丹参', '玄参', '沙参', '细辛', '芍药']
    }
    
    // 十九畏
    const nineteenIncompatibilities = {
      '硫磺': ['朴硝'],
      '水银': ['砒霜'],
      '狼毒': ['密陀僧'],
      '巴豆': ['牵牛'],
      '丁香': ['郁金'],
      '牙硝': ['三棱'],
      '川乌': ['犀角'],
      '人参': ['五灵脂'],
      '官桂': ['赤石脂']
    }
    
    // 检查十八反
    for (const [key, values] of Object.entries(eighteenContradictions)) {
      if (herb.name.includes(key)) {
        incompatibilityWarnings.push(`注意：${key}与${values.join('、')}相反`)
      }
    }
    
    // 检查十九畏
    for (const [key, values] of Object.entries(nineteenIncompatibilities)) {
      if (herb.name.includes(key)) {
        incompatibilityWarnings.push(`注意：${key}畏${values.join('、')}`)
      }
    }
    
    return incompatibilityWarnings
  }

  const handleHerbClick = (herb: any) => {
    const warnings = checkIncompatibility(herb)
    if (warnings.length > 0) {
      warnings.forEach(warning => toast.warning(warning))
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">中药数据库</h1>
        <p className="text-gray-600">详细介绍中药性味归经、功效主治，智能提醒配伍禁忌</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索中药名称、拼音、功效或归经..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              分类筛选
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {categories.herbCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm border ${selectedCategory === category ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-700 border-gray-300'} hover:bg-green-50`}
                  >
                    {category}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              性味 (Nature & Flavor)
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {natures.map(nature => (
                <button
                  key={nature}
                  onClick={() => setSelectedNature(nature)}
                  className={`px-3 py-1 rounded-full text-sm border ${selectedNature === nature ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-700 border-gray-300'} hover:bg-green-50`}
                >
                  {nature}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              味 (Flavor)
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {flavors.map(flavor => (
                <button
                  key={flavor}
                  onClick={() => setSelectedFlavor(flavor)}
                  className={`px-3 py-1 rounded-full text-sm border ${selectedFlavor === flavor ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-700 border-gray-300'} hover:bg-green-50`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              毒性 (Toxicity)
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {toxicities.map(toxicity => (
                <button
                  key={toxicity}
                  onClick={() => setSelectedToxicity(toxicity)}
                  className={`px-3 py-1 rounded-full text-sm border ${selectedToxicity === toxicity ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-700 border-gray-300'} hover:bg-green-50`}
                >
                  {toxicity}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {searchTerm && (
              <span className="ml-2">
                搜索结果：<span className="font-semibold">"{searchTerm}"</span>
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setSelectedNature('')
                setSelectedFlavor('')
                setSelectedToxicity('')
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              重置筛选
            </button>
            <Link
              to="/import-data"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              导入数据
            </Link>
          </div>
        </div>
      </div>

      {/* 中药列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHerbs.map((herb) => (
            <div 
              key={herb.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleHerbClick(herb)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {herb.name}
                </h3>
                {(herb as any).pinyin && (
                  <span className="text-sm text-gray-500 ml-2">{(herb as any).pinyin}</span>
                )}
              </div>
              <p className="text-gray-700 mb-2">{herb.efficacy || '暂无功效描述'}</p>
              <div className="text-sm text-gray-500 mb-4">
                <span className="mr-3">性味：{herb.nature_flavor || '未知'}</span>
                <span>归经：{herb.meridian_tropism || '未知'}</span>
              </div>
              <div className="flex justify-between items-center">
                <Link
                  to={`/herbs/${herb.id}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  查看详情
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    /* 添加到收藏 */
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredHerbs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">没有找到符合条件的中药</p>
          <p className="text-gray-500 text-sm mt-2">请尝试调整筛选条件</p>
        </div>
      )}
    </div>
  )
}