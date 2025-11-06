import { useState } from 'react'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'

export function FormulaCompare() {
  const { formulas, formulasLoading: loading } = useDataStore()
  const { user } = useAuthStore()
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>([])
  const [showFormulaSelector, setShowFormulaSelector] = useState(false)

  const addFormula = (formulaId: string) => {
    if (selectedFormulas.includes(formulaId)) {
      toast.error('该方剂已在对比列表中')
      return
    }
    
    if (selectedFormulas.length >= 3) {
      toast.error('最多只能对比3个方剂')
      return
    }
    
    setSelectedFormulas([...selectedFormulas, formulaId])
    setShowFormulaSelector(false)
    toast.success('已添加方剂到对比列表')
  }

  const removeFormula = (formulaId: string) => {
    setSelectedFormulas(selectedFormulas.filter(id => id !== formulaId))
    toast.success('已从对比列表移除')
  }

  const selectedFormulaData = formulas.filter(f => selectedFormulas.includes(f.id))

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
        <p className="text-gray-600 mb-6">登录后可以使用方剂对比功能</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">方剂对比</h1>
        <p className="text-gray-600">对比多个方剂的组成、功效和临床应用</p>
      </div>

      {/* 添加方剂按钮 */}
      <div className="mb-6">
        <button
          onClick={() => setShowFormulaSelector(true)}
          disabled={selectedFormulas.length >= 3}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加方剂 ({selectedFormulas.length}/3)
        </button>
      </div>

      {/* 方剂选择器 */}
      {showFormulaSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">选择方剂</h2>
              <button
                onClick={() => setShowFormulaSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid gap-2">
              {formulas.map((formula) => (
                <div
                  key={formula.id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => addFormula(formula.id)}
                >
                  <div>
                    <h3 className="font-medium">{formula.name}</h3>

                  </div>
                  <span className="text-sm text-gray-500">{formula.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 对比表格 */}
      {selectedFormulaData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    项目
                  </th>
                  {selectedFormulaData.map((formula) => (
                    <th key={formula.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{formula.name}</div>

                        </div>
                        <button
                          onClick={() => removeFormula(formula.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    分类
                  </td>
                  {selectedFormulaData.map((formula) => (
                    <td key={formula.id} className="px-6 py-4 text-sm text-gray-900">
                      {formula.category}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    组成
                  </td>
                  {selectedFormulaData.map((formula) => (
                    <td key={formula.id} className="px-6 py-4 text-sm text-gray-900">
                      {formula.composition.split('、').map((herb, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {herb}
                        </span>
                      ))}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    功效
                  </td>
                  {selectedFormulaData.map((formula) => (
                    <td key={formula.id} className="px-6 py-4 text-sm text-gray-900">
                      {formula.efficacy}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    主治
                  </td>
                  {selectedFormulaData.map((formula) => (
                    <td key={formula.id} className="px-6 py-4 text-sm text-gray-900">
                      {formula.indications}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    用法
                  </td>
                  {selectedFormulaData.map((formula) => (
                    <td key={formula.id} className="px-6 py-4 text-sm text-gray-900">
                      {formula.dosage}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedFormulaData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">还没有选择方剂进行对比</p>
            <p className="text-sm mt-2">点击上方按钮添加方剂开始对比</p>
          </div>
        </div>
      )}
    </div>
  )
}