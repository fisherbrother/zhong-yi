import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import { Heart, ArrowLeft } from 'lucide-react'

export function AcupointDetail() {
  const { id } = useParams<{ id: string }>()
  const { acupoints, meridians, addToFavorites, removeFromFavorites, favorites } = useDataStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)

  const acupoint = acupoints.find(a => a.id === id)
  const meridian = acupoint ? meridians.find(m => m.id === acupoint.meridian_id) : null
  const [isFavorited, setIsFavorited] = useState(user ? favorites.some(f => f.item_id === id && f.item_type === 'acupoint') : false)

  useEffect(() => {
    if (acupoint) {
      setLoading(false)
    }
  }, [acupoint])

  const handleFavorite = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }
    
    try {
      if (isFavorited) {
        await removeFromFavorites('acupoint', id!)
        setIsFavorited(false)
        toast.success('已取消收藏')
      } else {
        await addToFavorites('acupoint', id!)
        setIsFavorited(true)
        toast.success('已添加到收藏')
      }
      toast.success(isFavorited ? '已取消收藏' : '收藏成功')
    } catch (error) {
      toast.error('操作失败')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!acupoint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">穴位不存在</h1>
        <p className="text-gray-600 mb-6">您访问的穴位可能已被删除或不存在</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 头部信息 */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => window.history.back()}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {acupoint.name}
          </h1>

        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {acupoint.location_method || '标准穴位'}
          </span>
          {meridian && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {meridian.name}
            </span>
          )}
        </div>

        <button
          onClick={handleFavorite}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            isFavorited
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
          {isFavorited ? '已收藏' : '收藏'}
        </button>
      </div>

      <div className="grid gap-8">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">定位</h3>
              <p className="text-gray-900">{acupoint.location}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">取穴方法</h3>
              <p className="text-gray-900">{acupoint.location_method || '暂无信息'}</p>
            </div>
          </div>
        </div>

        {/* 主治功效 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">主治功效</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">主治病症</h3>
              <p className="text-gray-900">{acupoint.indications}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">操作方法</h3>
              <p className="text-gray-900">{acupoint.manipulation || '暂无信息'}</p>
            </div>
          </div>
        </div>

        {/* 操作规范 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">操作规范</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">针刺深度</h3>
              <p className="text-gray-900">{acupoint.needle_depth || '暂无信息'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">艾灸时间</h3>
              <p className="text-gray-900">{acupoint.manipulation || '暂无信息'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">按摩手法</h3>
              <p className="text-gray-900">{acupoint.manipulation || '暂无信息'}</p>
            </div>
          </div>
        </div>



        {/* 用户笔记 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">学习笔记</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={4}
            placeholder="记录您的学习心得和临床应用经验..."
          />
          <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            保存笔记
          </button>
        </div>
      </div>
    </div>
  )
}