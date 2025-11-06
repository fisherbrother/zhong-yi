import { useState, useEffect } from 'react'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import { Link } from 'react-router-dom'
import { Heart, BookOpen, Users, Eye, Star } from 'lucide-react'

export function Home() {
  const { formulas, herbs, meridians, acupoints, fetchFormulas, fetchHerbs, fetchMeridians, fetchAcupoints } = useDataStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchFormulas()
    fetchHerbs()
    fetchMeridians()
    fetchAcupoints()
  }, [])

  const stats = [
    { name: '方剂数量', value: formulas.length, icon: BookOpen, color: 'text-blue-600' },
    { name: '中药数量', value: herbs.length, icon: Heart, color: 'text-red-600' },
    { name: '经络数量', value: meridians.length, icon: Users, color: 'text-green-600' },
    { name: '穴位数量', value: acupoints.length, icon: Eye, color: 'text-purple-600' },
  ]

  const features = [
    {
      name: '方剂数据库',
      description: '收录经典方剂，支持搜索、对比和学习',
      icon: BookOpen,
      href: '/formulas',
      color: 'bg-blue-500'
    },
    {
      name: '中药数据库',
      description: '详细介绍中药性味归经、功效主治',
      icon: Heart,
      href: '/herbs',
      color: 'bg-red-500'
    },
    {
      name: '经络穴位',
      description: '3D可视化展示经络走向和穴位定位',
      icon: Users,
      href: '/meridians',
      color: 'bg-green-500'
    },
    {
      name: '个人收藏',
      description: '收藏重要内容，记录学习笔记',
      icon: Star,
      href: user ? '/favorites' : '/login',
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20Medicine%20herbs%20and%20acupuncture%20needles%20arranged%20in%20a%20zen%20composition%20with%20soft%20lighting%2C%20minimalist%20style%2C%20calm%20and%20professional%20medical%20setting&image_size=landscape_16_9" 
              alt="中医药学习平台" 
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl mb-8 opacity-90"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            探索中医药的
            <span className="text-green-600">智慧宝库</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            专业的中医药学习平台，汇聚经典方剂、中药知识、经络穴位，助您深入理解中医精髓
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/formulas"
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              浏览方剂库
            </Link>
            <Link
              to="/herbs"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              探索中药库
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="text-center">
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              全面而专业的学习体验
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              从经典方剂到现代研究，从中药知识到经络穴位，为您提供全方位的中医药学习资源
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">方剂库</h3>
              <p className="text-gray-600 mb-6 text-center">
                收录经典方剂，详细解析组成、功效与应用
              </p>
              <Link
                to="/formulas"
                className="block text-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                立即探索 →
              </Link>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">中药库</h3>
              <p className="text-gray-600 mb-6 text-center">
                全面的中药知识库，包含性味归经与现代研究
              </p>
              <Link
                to="/herbs"
                className="block text-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                开始浏览 →
              </Link>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">经络穴位</h3>
              <p className="text-gray-600 mb-6 text-center">
                3D可视化经络穴位，直观理解经络系统
              </p>
              <Link
                to="/meridians"
                className="block text-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                查看详情 →
              </Link>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">个性化学习</h3>
              <p className="text-gray-600 mb-6 text-center">
                收藏重点内容，记录学习笔记，定制个人学习路径
              </p>
              {user ? (
                <Link
                  to="/favorites"
                  className="block text-center bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  开始学习 →
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="block text-center bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  立即登录 →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20Medicine%20student%20studying%20with%20ancient%20books%20and%20modern%20tablet%20in%20harmony%2C%20warm%20lighting%2C%20inspiring%20learning%20environment%2C%20professional%20educational%20setting&image_size=landscape_16_9" 
              alt="开始学习中医药" 
              className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl mb-8 opacity-80"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            开始您的中医药学习之旅
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            注册账户，享受个性化学习体验，收藏重要内容，记录学习笔记
          </p>
          {user ? (
            <Link
              to="/favorites"
              className="inline-block px-8 py-4 bg-white text-green-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              查看我的收藏
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-green-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              立即注册
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}