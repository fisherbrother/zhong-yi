import { useEffect } from 'react'
import { useDataStore } from '../stores/dataStore'
import { Link } from 'react-router-dom'
import { Users, Eye } from 'lucide-react'

export function Meridians() {
  const { meridians, meridiansLoading: loading, fetchMeridians } = useDataStore()

  useEffect(() => {
    fetchMeridians()
  }, [])

  const meridianTypes = {
    '十二正经': meridians.filter(m => m.type === 'regular'),
    '奇经八脉': meridians.filter(m => m.type === 'extraordinary')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">经络系统</h1>
        <p className="text-gray-600">详细介绍十二正经和奇经八脉的循行路线、主治病症</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(meridianTypes).map(([type, meridianList]) => (
            <div key={type}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{type}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meridianList.map((meridian) => (
                  <div key={meridian.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                      meridian.type === 'regular' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        <Link to={`/meridians/${meridian.id}`} className="hover:text-green-600">
                          {meridian.name}
                        </Link>
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {meridian.main_functions?.slice(0, 100) || '暂无描述'}...
                    </p>
                    
                    <div className="text-sm text-gray-500 mb-4">
                      <div className="flex justify-between">
                        <span>循行：</span>
                        <span>{meridian.pathway || '暂无信息'}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>关联脏腑：</span>
                        <span>{meridian.associated_organs || '暂无信息'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/meridians/${meridian.id}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        查看详情
                      </Link>
                      <div className="flex items-center text-gray-400">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-xs">穴位</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}