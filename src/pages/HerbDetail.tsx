import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { Heart, BookOpen, ArrowLeft, AlertTriangle } from 'lucide-react'

export function HerbDetail() {
  const { id } = useParams<{ id: string }>()
  const { herbs, favorites, addToFavorites, removeFromFavorites } = useDataStore()
  const { user } = useAuthStore()
  const [herb, setHerb] = useState<any>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const foundHerb = herbs.find(h => h.id === id)
      if (foundHerb) {
        setHerb(foundHerb)
        setIsFavorited(favorites.some(fav => fav.item_id === id && fav.item_type === 'herb'))
      }
      setLoading(false)
    }
  }, [id, herbs, user])

  const handleFavorite = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      if (isFavorited) {
        await removeFromFavorites('herb', id!)
        setIsFavorited(false)
        toast.success('已取消收藏')
      } else {
        await addToFavorites('herb', id!)
        setIsFavorited(true)
        toast.success('已添加到收藏')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  // 检查配伍禁忌
  const checkIncompatibility = (currentHerb: any) => {
    const warnings = []
    
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
      if (currentHerb.name.includes(key)) {
        warnings.push({
          type: 'danger',
          message: `十八反：${key}与${values.join('、')}相反，不可同用`
        })
      }
    }
    
    // 检查十九畏
    for (const [key, values] of Object.entries(nineteenIncompatibilities)) {
      if (currentHerb.name.includes(key)) {
        warnings.push({
          type: 'warning',
          message: `十九畏：${key}畏${values.join('、')}，慎用`
        })
      }
    }
    
    return warnings
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      </div>
    )
  }

  if (!herb) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">中药未找到</h1>
          <Link to="/herbs" className="text-green-600 hover:text-green-700">
            返回中药列表
          </Link>
        </div>
      </div>
    )
  }

  const warnings = checkIncompatibility(herb)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 头部 */}
      <div className="mb-8">
        <Link
          to="/herbs"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回中药列表
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{herb.name}</h1>
            <p className="text-gray-600">{herb.pinyin}</p>
            {herb.latin_name && (
              <p className="text-gray-500 text-sm">{herb.latin_name}</p>
            )}
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

      {/* 配伍禁忌警告 */}
      {warnings.length > 0 && (
        <div className="mb-6">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`p-4 rounded-md mb-2 flex items-start ${
                warning.type === 'danger' 
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}
            >
              <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{warning.message}</p>
                <p className="text-sm mt-1 opacity-75">
                  {warning.type === 'danger' 
                    ? '绝对禁止配伍使用'
                    : '配伍时需谨慎，建议咨询专业医师'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <span className="text-gray-600">{herb.category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">性味：</span>
                <span className="text-gray-600">{herb.nature}{herb.flavor}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">归经：</span>
                <span className="text-gray-600">{herb.meridian}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">毒性：</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  herb.toxicity === '无毒' 
                    ? 'bg-green-100 text-green-800'
                    : herb.toxicity === '小毒'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {herb.toxicity}
                </span>
              </div>
            </div>
          </div>

          {/* 功效主治 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">功效主治</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">功效：</h3>
                <p className="text-gray-700">{herb.effects}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">主治：</h3>
                <p className="text-gray-700">{herb.indications}</p>
              </div>
            </div>
          </div>

          {/* 用法用量 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">用法用量</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{herb.dosage}</p>
            </div>
          </div>

          {/* 使用注意 */}
          {herb.precautions && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-orange-600">使用注意</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{herb.precautions}</p>
              </div>
            </div>
          )}

          {/* 现代研究 */}
          {herb.modern_research && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">现代研究</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{herb.modern_research}</p>
              </div>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 药材图片 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">药材图片</h3>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-sm">暂无图片</span>
            </div>
          </div>

          {/* 相关中药 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">相关中药</h3>
            <div className="space-y-3">
              {/* 这里可以显示相关中药 */}
              <p className="text-gray-600 text-sm">暂无相关中药</p>
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