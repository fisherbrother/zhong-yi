import { useAuthStore } from '../stores/authStore'
import { Link } from 'react-router-dom'
import { Heart, BookOpen, Users, Eye } from 'lucide-react'

export function Favorites() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
        <p className="text-gray-600 mb-6">登录后可以查看您的收藏内容</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          立即登录
        </Link>
      </div>
    )
  }

  // 这里应该从用户收藏中获取数据
  const favoriteItems = [] // 暂时为空

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">我的收藏</h1>
        <p className="text-gray-600">管理您收藏的方剂、中药、经络和穴位</p>
      </div>

      {favoriteItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无收藏</h3>
          <p className="text-gray-600 mb-6">开始收藏您感兴趣的内容吧</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/formulas"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              浏览方剂
            </Link>
            <Link
              to="/herbs"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              浏览中药
            </Link>
            <Link
              to="/meridians"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              浏览经络
            </Link>
            <Link
              to="/acupoints"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              浏览穴位
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 收藏项目列表 */}
          {favoriteItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* 收藏项目内容 */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <button className="text-red-500 hover:text-red-600">
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <Link
                to={item.url}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                查看详情
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}