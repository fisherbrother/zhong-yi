import { useEffect, useMemo, useState } from 'react'
import { useDataStore } from '../stores/dataStore'
import { Link } from 'react-router-dom'

export function Acupoints() {
  const { acupoints, meridians, acupointsLoading, meridiansLoading, fetchAcupoints, fetchMeridians } = useDataStore()
  const [search, setSearch] = useState('')
  const [selectedMeridian, setSelectedMeridian] = useState<string>('')

  useEffect(() => {
    fetchMeridians()
    fetchAcupoints()
  }, [])

  const filteredAcupoints = useMemo(() => {
    return acupoints.filter(ap => {
      const name = ap.name || ''
      const matchSearch = name.includes(search) || (ap as any).pinyin?.includes(search) || (ap as any).aliases?.some((a: string) => a.includes(search)) || false
      const matchMeridian = selectedMeridian ? ap.meridian_id === selectedMeridian : true
      return matchSearch && matchMeridian
    })
  }, [acupoints, search, selectedMeridian])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">穴位库</h1>
        <p className="text-gray-600">支持按经络筛选与检索穴位</p>
      </div>

      {(acupointsLoading || meridiansLoading) ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索穴位</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="输入穴位名/拼音"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">按经络筛选</label>
              <select
                value={selectedMeridian}
                onChange={(e) => setSelectedMeridian(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">全部经络</option>
                {meridians.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </aside>

          <main className="lg:col-span-3">
            {filteredAcupoints.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">暂无数据，您可以先在“数据导入”页面导入穴位与经络。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAcupoints.map((ap) => (
                  <div key={ap.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        <Link to={`/acupoints/${ap.id}`} className="hover:text-green-600">{ap.name || '未命名穴位'}</Link>
                      </h3>
                      <span className="text-sm text-gray-500">{meridians.find(m => m.id === ap.meridian_id)?.name || '未知经络'}</span>
                    </div>
                    <p className="text-gray-600 text-sm">位置：{ap.location || '暂无'}</p>
                    <p className="text-gray-600 text-sm">主治：{(ap.indications || '').slice(0, 60) || '暂无'}...</p>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}