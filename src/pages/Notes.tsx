import { useAuthStore } from '../stores/authStore'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export function Notes() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
        <p className="text-gray-600 mb-6">登录后可以查看和管理您的学习笔记</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          立即登录
        </Link>
      </div>
    )
  }

  // 这里应该从用户笔记中获取数据
  const notes = [] // 暂时为空

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">学习笔记</h1>
        <p className="text-gray-600">管理您的学习笔记和心得体会</p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无笔记</h3>
          <p className="text-gray-600 mb-6">开始学习并记录您的笔记吧</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/formulas"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              浏览方剂
            </Link>
            <Link
              to="/herbs"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              浏览中药
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 笔记列表 */}
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                <span className="text-sm text-gray-500">{note.created_at}</span>
              </div>
              <p className="text-gray-700 mb-4">{note.content}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">相关：{note.related_item}</span>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">编辑</button>
                  <button className="text-red-600 hover:text-red-700 text-sm">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}