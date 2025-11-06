import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import { Heart, ArrowLeft, BookOpen, Users, MapPin } from 'lucide-react'
import { Meridian3D } from '../components/Meridian3D'

export function MeridianDetail() {
  const { id } = useParams<{ id: string }>()
  const { meridians, acupoints, addToFavorites, removeFromFavorites, favorites } = useDataStore()
  const { user } = useAuthStore()
  const [meridian, setMeridian] = useState<any>(null)
  const [meridianAcupoints, setMeridianAcupoints] = useState<any[]>([])
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const foundMeridian = meridians.find(m => m.id === id)
      if (foundMeridian) {
        setMeridian(foundMeridian)
        // 获取该经络的穴位
        const relatedAcupoints = acupoints.filter(a => a.meridian_id === id)
        setMeridianAcupoints(relatedAcupoints)
        setIsFavorited(favorites.some(fav => fav.item_id === id && fav.item_type === 'formula') || false)
      }
      setLoading(false)
    }
  }, [id, meridians, acupoints, user])

  const handleFavorite = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      if (isFavorited) {
        await removeFromFavorites('meridian', id!)
        setIsFavorited(false)
        toast.success('已取消收藏')
      } else {
        await addToFavorites('meridian', id!)
        setIsFavorited(true)
        toast.success('已添加到收藏')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      </div>
    )
  }

  if (!meridian) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">经络未找到</h1>
          <Link to="/meridians" className="text-green-600 hover:text-green-700">
            返回经络列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 头部 */}
      <div className="mb-8">
        <Link
          to="/meridians"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回经络列表
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{meridian.name}</h1>
            <p className="text-gray-600">{meridian.pinyin}</p>
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
                <span className="font-medium text-gray-700">类型：</span>
                <span className="text-gray-600">{meridian.type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">穴位数量：</span>
                <span className="text-gray-600">{meridian.acupoint_count}个</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">关联脏腑：</span>
                <span className="text-gray-600">{meridian.associated_organs || '暂无信息'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">循行时间：</span>
                <span className="text-gray-600">{meridian.circulation_time}</span>
              </div>
            </div>
          </div>

          {/* 循行路线 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">循行路线</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{meridian.pathway}</p>
            </div>
          </div>

          {/* 主治病症 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">主治病症</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{meridian.main_functions || '暂无信息'}</p>
            </div>
          </div>

          {/* 穴位列表 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              穴位列表 ({meridianAcupoints.length}个)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meridianAcupoints.map((acupoint) => (
                <div key={acupoint.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">
                      <Link to={`/acupoints/${acupoint.id}`} className="hover:text-green-600">
                        {acupoint.name}
                      </Link>
                    </h3>
                    <span className="text-sm text-gray-500">{acupoint.code}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{acupoint.location}</p>
                  <p className="text-sm text-gray-500">{acupoint.indications?.slice(0, 50) || '暂无主治信息'}...</p>
                </div>
              ))}
            </div>
            {meridianAcupoints.length === 0 && (
              <p className="text-gray-600 text-center py-8">暂无穴位数据</p>
            )}
          </div>

          {/* 现代研究 */}
          {meridian.modern_research && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">现代研究</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{meridian.modern_research}</p>
              </div>
            </div>
          )}

          {/* 用户笔记 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">学习笔记</h2>
            {user ? (
              <div className="space-y-3">
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="记录您的学习心得..."
                />
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  保存笔记
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-3">登录后可以添加学习笔记</p>
                <button
                  onClick={() => {/* 打开登录模态框 */}}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  登录
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 经络图 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">经络走向图</h3>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-sm">3D经络图</span>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              查看3D模型
            </button>
          </div>

          {/* 相关经络 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">相关经络</h3>
            <div className="space-y-3">
              {/* 这里可以显示相关经络 */}
              <p className="text-gray-600 text-sm">暂无相关经络</p>
            </div>
          </div>

          {/* 3D可视化 */}
          <Meridian3D meridianId={meridian.id} />


        </div>
      </div>
    </div>
  )
}