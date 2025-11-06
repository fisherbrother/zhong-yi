import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { toast } from 'sonner'

export function Formulas() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSyndrome, setSelectedSyndrome] = useState('')
  const [selectedDiseaseType, setSelectedDiseaseType] = useState('')
  const { formulas, formulasLoading: loading, categories, fetchCategories } = useDataStore()
  
  useEffect(() => {
    fetchCategories()
  }, [])
  
  // 使用动态分类数据
  const formulaCategories = categories.formulaCategories
  const formulaSyndromes = categories.formulaSyndromes
  const formulaDiseaseTypes = categories.formulaDiseaseTypes

  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = searchTerm === '' || 
      formula.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || formula.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCompare = (formulaIds: string[]) => {
    if (formulaIds.length < 2) {
      toast.error('请至少选择两个方剂进行对比')
      return
    }
    if (formulaIds.length > 5) {
      toast.error('最多可以选择5个方剂进行对比')
      return
    }
    // 导航到对比页面
    window.location.href = `/formulas/compare?ids=${formulaIds.join(',')}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">方剂数据库</h1>
        <p className="text-gray-600">收录经典方剂，支持搜索、对比和学习</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜索方剂
            </label>
            <input
              type="text"
              placeholder="输入方剂名称或拼音..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类筛选
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {formulaCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                证型筛选
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {formulaSyndromes.map(syndrome => (
                  <button
                    key={syndrome}
                    onClick={() => setSelectedSyndrome(selectedSyndrome === syndrome ? '' : syndrome)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedSyndrome === syndrome
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {syndrome}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                病型筛选
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {formulaDiseaseTypes.map(diseaseType => (
                  <button
                    key={diseaseType}
                    onClick={() => setSelectedDiseaseType(selectedDiseaseType === diseaseType ? '' : diseaseType)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedDiseaseType === diseaseType
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diseaseType}
                  </button>
                ))}
              </div>
            </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          共找到 {filteredFormulas.length} 个方剂
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleCompare([])}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            方剂对比
          </button>
          <Link
            to="/import"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            导入数据
          </Link>
        </div>
      </div>

      {/* 方剂列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFormulas.map((formula) => (
            <div key={formula.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  <Link to={`/formulas/${formula.id}`} className="hover:text-green-600">
                    {formula.name}
                  </Link>
                </h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {formula.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">
                {formula.composition.slice(0, 100)}...
              </p>
              
              <div className="text-sm text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>功效：</span>
                  <span>{formula.efficacy}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>主治：</span>
                  <span>{formula.indications}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Link
                  to={`/formulas/${formula.id}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  查看详情
                </Link>
                <button
                  onClick={() => {/* 添加到收藏 */}}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredFormulas.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">没有找到符合条件的方剂</p>
        </div>
      )}
    </div>
  )
}