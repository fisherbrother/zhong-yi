import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, FileText, Download, Database, AlertCircle, CheckCircle, Map, Pin } from 'lucide-react'
import { dataImporter, ImportResult } from '@/utils/dataImporter'

export function DataImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [currentItem, setCurrentItem] = useState('')
  const [importResults, setImportResults] = useState<{
    herbs?: ImportResult
    formulas?: ImportResult
    contraindications?: ImportResult
    meridians?: ImportResult
    acupoints?: ImportResult
  }>({})
  const [activeTab, setActiveTab] = useState<'file' | 'preset'>('preset')
  const [bulkImportMode, setBulkImportMode] = useState(false)
  const [importStats, setImportStats] = useState({
    totalHerbs: 0,
    totalFormulas: 0,
    totalContraindications: 0
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validTypes = [
        'application/json' // 只支持JSON格式
      ]
      
      if (validTypes.includes(file.type) || file.name.endsWith('.json')) {
        setSelectedFile(file)
        toast.success(`已选择文件: ${file.name}`)
      } else {
        toast.error('请选择 JSON 文件')
      }
    }
  }

  const handleFileImport = async () => {
    if (!selectedFile) {
      toast.error('请先选择文件')
      return
    }

    setImporting(true)
    setImportProgress(0)
    setCurrentItem('')
    setImportResults({})

    try {
      // 读取文件内容
      const fileContent = await selectedFile.text()
      const data = JSON.parse(fileContent)
      
      let result: ImportResult
      
      // 根据数据结构判断导入类型
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]
        
        if (firstItem.nature_flavor || firstItem.meridian_tropism) {
          // 中药数据
          result = await dataImporter.importHerbs(data, {
            onProgress: (progress, item) => {
              setImportProgress(progress)
              setCurrentItem(item)
            },
            onError: (error, item) => {
              toast.error(`导入失败: ${item} - ${error}`)
            }
          })
          setImportResults(prev => ({ ...prev, herbs: result }))
          
        } else if (firstItem.composition && firstItem.efficacy) {
          // 方剂数据
          result = await dataImporter.importFormulas(data, {
            onProgress: (progress, item) => {
              setImportProgress(progress)
              setCurrentItem(item)
            },
            onError: (error, item) => {
              toast.error(`导入失败: ${item} - ${error}`)
            }
          })
          setImportResults(prev => ({ ...prev, formulas: result }))
          
        } else if (firstItem.herb_a && firstItem.herb_b) {
          // 配伍禁忌数据
          result = await dataImporter.importContraindications(data, {
            onProgress: (progress, item) => {
              setImportProgress(progress)
              setCurrentItem(item)
            },
            onError: (error, item) => {
              toast.error(`导入失败: ${item} - ${error}`)
            }
          })
          setImportResults(prev => ({ ...prev, contraindications: result }))
          
        } else if ((firstItem.type && (typeof firstItem.type === 'string')) || firstItem.pathway || firstItem.main_functions) {
          // 经络数据
          result = await dataImporter.importMeridians(data, {
            onProgress: (progress, item) => {
              setImportProgress(progress)
              setCurrentItem(item)
            },
            onError: (error, item) => {
              toast.error(`导入失败: ${item} - ${error}`)
            }
          })
          setImportResults(prev => ({ ...prev, meridians: result }))
          
        } else if (firstItem.meridian_name && firstItem.location) {
          // 穴位数据
          result = await dataImporter.importAcupoints(data, {
            onProgress: (progress, item) => {
              setImportProgress(progress)
              setCurrentItem(item)
            },
            onError: (error, item) => {
              toast.error(`导入失败: ${item} - ${error}`)
            }
          })
          setImportResults(prev => ({ ...prev, acupoints: result }))
          
        } else {
          throw new Error('无法识别的数据格式')
        }
      } else {
        throw new Error('数据格式不正确或为空')
      }
      
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSelectedFile(null)
      
    } catch (error) {
      toast.error(`数据导入失败: ${error.message}`)
    } finally {
      setImporting(false)
      setImportProgress(0)
      setCurrentItem('')
    }
  }

  const handlePresetImport = async (type: 'herbs' | 'formulas' | 'contraindications' | 'meridians' | 'acupoints' | 'all') => {
    setImporting(true)
    setImportProgress(0)
    setCurrentItem('')
    setImportResults({})

    try {
      // 动态导入数据文件
      let data: any[] = []
      let result: ImportResult

      if (type === 'all') {
        // 批量导入所有数据
        setBulkImportMode(true)
        let totalProgress = 0
        
        // 1. 导入中药数据
        setCurrentItem('正在导入中药数据...')
        const herbsModule = await import('../../data/herbs_data.json')
        data = herbsModule.default
        const herbsResult = await dataImporter.importHerbs(data, {
          onProgress: (progress) => {
            totalProgress = Math.round(progress * 0.25)
            setImportProgress(totalProgress)
          }
        })
        setImportResults(prev => ({ ...prev, herbs: herbsResult }))
        
        // 2. 导入方剂数据
        setCurrentItem('正在导入方剂数据...')
        const formulasModule = await import('../../data/formulas_data.json')
        data = formulasModule.default
        const formulasResult = await dataImporter.importFormulas(data, {
          onProgress: (progress) => {
            totalProgress = Math.round(25 + progress * 0.25)
            setImportProgress(totalProgress)
          }
        })
        setImportResults(prev => ({ ...prev, formulas: formulasResult }))
        
        // 3. 导入配伍禁忌数据
        setCurrentItem('正在导入配伍禁忌数据...')
        const contraindicationsModule = await import('../../data/herb_contraindications.json')
        data = contraindicationsModule.default
        const contraindicationsResult = await dataImporter.importContraindications(data, {
          onProgress: (progress) => {
            totalProgress = Math.round(50 + progress * 0.25)
            setImportProgress(totalProgress)
          }
        })
        setImportResults(prev => ({ ...prev, contraindications: contraindicationsResult }))

        // 4. 导入经络数据
        setCurrentItem('正在导入经络数据...')
        const meridiansModule = await import('../../data/meridians_data.json')
        data = meridiansModule.default
        const meridiansResult = await dataImporter.importMeridians(data, {
          onProgress: (progress) => {
            totalProgress = Math.round(75 + progress * 0.15)
            setImportProgress(totalProgress)
          }
        })
        setImportResults(prev => ({ ...prev, meridians: meridiansResult as any }))

        // 5. 导入穴位数据
        setCurrentItem('正在导入穴位数据...')
        const acupointsModule = await import('../../data/acupoints_data.json')
        data = acupointsModule.default
        const acupointsResult = await dataImporter.importAcupoints(data, {
          onProgress: (progress) => {
            totalProgress = Math.min(100, Math.round(90 + progress * 0.1))
            setImportProgress(totalProgress)
          }
        })
        setImportResults(prev => ({ ...prev, acupoints: acupointsResult as any }))
        
        setImportProgress(100)
        toast.success('所有数据导入完成！')
        setBulkImportMode(false)
      } else {
        // 单个类型导入
        switch (type) {
          case 'herbs':
            const herbsModule = await import('../../data/herbs_data.json')
            data = herbsModule.default
            result = await dataImporter.importHerbs(data, {
              onProgress: (progress, item) => {
                setImportProgress(progress)
                setCurrentItem(item)
              }
            })
            setImportResults(prev => ({ ...prev, herbs: result }))
            break

          case 'formulas':
            const formulasModule = await import('../../data/formulas_data.json')
            data = formulasModule.default
            result = await dataImporter.importFormulas(data, {
              onProgress: (progress, item) => {
                setImportProgress(progress)
                setCurrentItem(item)
              }
            })
            setImportResults(prev => ({ ...prev, formulas: result }))
            break

          case 'contraindications':
            const contraindicationsModule = await import('../../data/herb_contraindications.json')
            data = contraindicationsModule.default
            result = await dataImporter.importContraindications(data, {
              onProgress: (progress, item) => {
                setImportProgress(progress)
                setCurrentItem(item)
              }
            })
            setImportResults(prev => ({ ...prev, contraindications: result }))
            break

          case 'meridians':
            const meridiansModule2 = await import('../../data/meridians_data.json')
            data = meridiansModule2.default
            result = await dataImporter.importMeridians(data, {
              onProgress: (progress, item) => {
                setImportProgress(progress)
                setCurrentItem(item)
              }
            })
            setImportResults(prev => ({ ...prev, meridians: result as any }))
            break

          case 'acupoints':
            const acupointsModule2 = await import('../../data/acupoints_data.json')
            data = acupointsModule2.default
            result = await dataImporter.importAcupoints(data, {
              onProgress: (progress, item) => {
                setImportProgress(progress)
                setCurrentItem(item)
              }
            })
            setImportResults(prev => ({ ...prev, acupoints: result as any }))
            break
        }
      }

    } catch (error: any) {
      toast.error(`预设数据导入失败: ${error.message}`)
    } finally {
      setImporting(false)
      setImportProgress(0)
      setCurrentItem('')
    }
  }

  const downloadTemplate = (type: string) => {
    let templateData: any = {}
    
    switch (type) {
      case '中药':
        templateData = [{
          name: '人参',
          pinyin: 'ren shen',
          nature_flavor: '甘、微苦，微温',
          meridian_tropism: '脾、肺、心经',
          efficacy: '大补元气，复脉固脱，补脾益肺，生津养血，安神益智',
          usage_dosage: '3-9g，另煎兑入',
          contraindications: '不宜与藜芦同用',
          category: '补气药',
          property: '温性'
        }]
        break
      case '方剂':
        templateData = [{
          name: '四君子汤',
          pinyin: 'si jun zi tang',
          composition: '人参9g，白术9g，茯苓9g，炙甘草6g',
          efficacy: '益气健脾',
          indications: '脾胃气虚证。面色萎白，语声低微，气短乏力，食少便溏，舌淡苔白，脉虚弱',
          category: '补气剂',
          source: '《太平惠民和剂局方》'
        }]
        break
      case '配伍禁忌':
        templateData = [{
          name: '甘草反甘遂',
          type: 'eighteen_incompatible',
          herb_a: '甘草',
          herb_b: '甘遂',
          description: '甘草与甘遂同用可能产生毒副作用',
          severity: 'high'
        }]
        break
    }
    
    // 创建并下载JSON文件
    const dataStr = JSON.stringify(templateData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${type}模板.json`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success(`${type}模板下载成功`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">数据导入</h1>
        <p className="text-gray-600">批量导入中医药数据，包括中药、方剂、配伍禁忌等</p>
      </div>

      {/* 标签页导航 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('preset')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preset'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              预设数据导入
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'file'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              文件导入
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'preset' && (
        <div className="space-y-6">
          {/* 预设数据导入 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">内置数据导入</h2>
            <p className="text-gray-600 mb-6">导入系统内置的中医药数据，包括经典中药、方剂、配伍禁忌、经络与穴位</p>
            
            {/* 批量导入按钮 */}
          <div className="mb-6">
            <button
              onClick={() => handlePresetImport('all')}
              disabled={importing}
              className="w-full flex items-center justify-center p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database className="w-8 h-8 mr-3" />
              <div className="text-left">
                <h3 className="font-bold text-lg">一键导入所有数据</h3>
                <p className="text-sm opacity-90">中药 + 方剂 + 配伍禁忌（243条完整数据）</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 中药 */}
              <button
                onClick={() => handlePresetImport('herbs')}
                disabled={importing}
                className="flex flex-col items-center p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                <Database className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">中药数据</h3>
                <p className="text-sm text-gray-600 text-center">导入126味经典中药数据</p>
              </button>
              {/* 方剂 */}
              <button
                onClick={() => handlePresetImport('formulas')}
                disabled={importing}
                className="flex flex-col items-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <Database className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">方剂数据</h3>
                <p className="text-sm text-gray-600 text-center">导入75个经典方剂数据</p>
              </button>
              {/* 配伍禁忌 */}
              <button
                onClick={() => handlePresetImport('contraindications')}
                disabled={importing}
                className="flex flex-col items-center p-6 border-2 border-dashed border-red-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Database className="w-8 h-8 text-red-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">配伍禁忌</h3>
                <p className="text-sm text-gray-600 text-center">导入十八反十九畏等禁忌数据</p>
              </button>
            </div>
            {/* 新增：经络与穴位 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <button
                onClick={() => handlePresetImport('meridians')}
                disabled={importing}
                className="flex flex-col items-center p-6 border-2 border-dashed border-yellow-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors disabled:opacity-50"
              >
                <Map className="w-8 h-8 text-yellow-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">经络数据</h3>
                <p className="text-sm text-gray-600 text-center">导入十二正经与奇经八脉</p>
              </button>
              <button
                onClick={() => handlePresetImport('acupoints')}
                disabled={importing}
                className="flex flex-col items-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                <Pin className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">穴位数据</h3>
                <p className="text-sm text-gray-600 text-center">导入常用代表性穴位</p>
              </button>
            </div>
          </div>

          {/* 导入结果统计 */}
          {(importResults.herbs || importResults.formulas || importResults.contraindications || importResults.meridians || importResults.acupoints) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">导入结果</h2>
              <div className="space-y-4">
                {importResults.herbs && (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">中药数据</p>
                        <p className="text-sm text-gray-600">
                          成功: {importResults.herbs.imported} / {importResults.herbs.total} 
                          {importResults.herbs.failed > 0 && `, 失败: ${importResults.herbs.failed}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      {Math.round((importResults.herbs.imported / importResults.herbs.total) * 100)}%
                    </span>
                  </div>
                )}
                {importResults.formulas && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">方剂数据</p>
                        <p className="text-sm text-gray-600">
                          成功: {importResults.formulas.imported} / {importResults.formulas.total}
                          {importResults.formulas.failed > 0 && `, 失败: ${importResults.formulas.failed}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">
                      {Math.round((importResults.formulas.imported / importResults.formulas.total) * 100)}%
                    </span>
                  </div>
                )}
                {importResults.contraindications && (
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">配伍禁忌</p>
                        <p className="text-sm text-gray-600">
                          成功: {importResults.contraindications.imported} / {importResults.contraindications.total}
                          {importResults.contraindications.failed > 0 && `, 失败: ${importResults.contraindications.failed}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-red-600 font-medium">
                      {Math.round((importResults.contraindications.imported / importResults.contraindications.total) * 100)}%
                    </span>
                  </div>
                )}
                {importResults.meridians && (
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">经络数据</p>
                        <p className="text-sm text-gray-600">
                          成功: {importResults.meridians.imported} / {importResults.meridians.total}
                          {importResults.meridians.failed > 0 && `, 失败: ${importResults.meridians.failed}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">
                      {Math.round((importResults.meridians.imported / importResults.meridians.total) * 100)}%
                    </span>
                  </div>
                )}
                {importResults.acupoints && (
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">穴位数据</p>
                        <p className="text-sm text-gray-600">
                          成功: {importResults.acupoints.imported} / {importResults.acupoints.total}
                          {importResults.acupoints.failed > 0 && `, 失败: ${importResults.acupoints.failed}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-purple-600 font-medium">
                      {Math.round((importResults.acupoints.imported / importResults.acupoints.total) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'file' && (
        <div className="space-y-6">
          {/* 文件上传区域 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">选择文件</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">拖拽文件到此处或点击选择</p>
              <input
                ref={fileInputRef}
                id="file-input"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
              >
                选择文件
              </label>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-700">{selectedFile.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 导入进度 */}
            {importing && (
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                  <span>{bulkImportMode ? '批量导入进度' : '导入进度'}</span>
                  <span>{importProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      bulkImportMode 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
                {currentItem && (
                  <p className="mt-2 text-sm text-gray-600">正在导入: {currentItem}</p>
                )}
                {bulkImportMode && (
                  <div className="mt-3 flex items-center text-sm text-purple-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    批量导入模式中，请耐心等待...
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleFileImport}
                disabled={!selectedFile || importing}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {importing ? '导入中...' : '开始导入'}
              </button>
            </div>
          </div>

          {/* 模板下载 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">下载模板</h2>
            <p className="text-gray-600 mb-4">使用标准模板格式确保数据正确导入</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => downloadTemplate('中药')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5 text-gray-600 mr-2" />
                <span>中药模板</span>
              </button>
              
              <button
                onClick={() => downloadTemplate('方剂')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5 text-gray-600 mr-2" />
                <span>方剂模板</span>
              </button>
              
              <button
                onClick={() => downloadTemplate('配伍禁忌')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5 text-gray-600 mr-2" />
                <span>配伍禁忌模板</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 导入说明 */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">导入说明</h3>
        <ul className="text-blue-800 space-y-2 text-sm">
          <li>• 支持 JSON 格式数据文件</li>
          <li>• 系统会自动识别数据类型（中药、方剂、配伍禁忌）</li>
          <li>• 导入前请备份现有数据</li>
          <li>• 大量数据导入可能需要一些时间，请耐心等待</li>
          <li>• 导入过程中请勿关闭页面或刷新浏览器</li>
          <li>• 重复导入会根据名称字段进行更新</li>
        </ul>
      </div>
    </div>
  )
}