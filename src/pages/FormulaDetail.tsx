import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import { Heart, BookOpen, ArrowLeft } from 'lucide-react'

export function FormulaDetail() {
  const { id } = useParams<{ id: string }>()
  const { formulas, favorites, addToFavorites, removeFromFavorites } = useDataStore()
  const { user } = useAuthStore()
  const [formula, setFormula] = useState<any>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const foundFormula = formulas.find(f => f.id === id)
      if (foundFormula) {
        setFormula(foundFormula)
        // 检查是否已收藏
        setIsFavorited(favorites.some(fav => fav.item_id === id && fav.item_type === 'formula'))
      }
      setLoading(false)
    }
  }, [id, formulas, user])

  const handleFavorite = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      if (isFavorited) {
        await removeFromFavorites('formula', id!)
        setIsFavorited(false)
        toast.success('已取消收藏')
      } else {
        await addToFavorites('formula', id!)
        setIsFavorited(true)
        toast.success('已添加到收藏')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      </div>
    )
  }

  if (!formula) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">方剂未找到</h1>
          <Link to="/formulas" className="text-green-600 hover:text-green-700">
            返回方剂列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 头部 */}
      <div className="mb-8">
        <Link
          to="/formulas"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回方剂列表
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{formula.name}</h1>
            <p className="text-gray-600">{formula.pinyin}</p>
          </div>
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorited 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-green-600" />
              基本信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">分类：</span>
                <span className="text-gray-600">{formula.category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">来源：</span>
                <span className="text-gray-600">{formula.source}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">功效：</span>
                <span className="text-gray-600">{formula.effects}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">主治：</span>
                <span className="text-gray-600">{formula.indications}</span>
              </div>
            </div>
          </div>

          {/* 组成 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">药物组成</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{formula.composition}</p>
            </div>
          </div>

          {/* 用法用量 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">用法用量</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{formula.dosage}</p>
            </div>
          </div>

          {/* 方解 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">方解</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{formula.explanation}</p>
            </div>
          </div>

          {/* 临床应用 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">临床应用</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{formula.clinical_application}</p>
            </div>
          </div>

          {/* 现代研究 */}
          {formula.modern_research && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">现代研究</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{formula.modern_research}</p>
              </div>
            </div>
          )}

          {/* 注意事项 */}
          {formula.precautions && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-orange-600">注意事项</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{formula.precautions}</p>
              </div>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 相关方剂 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">相关方剂</h3>
            <div className="space-y-3">
              {/* 这里可以显示相关方剂 */}
              <p className="text-gray-600 text-sm">暂无相关方剂</p>
            </div>
          </div>

          {/* 学习笔记 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">学习笔记</h3>
            {user ? (
              <div className="space-y-3">
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="记录您的学习心得..."
                />
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  保存笔记
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-3">登录后可以添加学习笔记</p>
                <Link
                  to="/login"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  登录
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}