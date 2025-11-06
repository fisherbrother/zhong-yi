import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Search, User, ChevronDown, Heart, FileText, LogOut, Book, Leaf, MapPin, Dot, BookOpen, PlusCircle, Settings } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

export function Navigation() {
  const { user, signOut } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setIsMenuOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('退出登录成功')
      setIsMenuOpen(false)
      setShowUserMenu(false)
    } catch (error) {
      toast.error('退出登录失败')
    }
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  const navItems = [
    { name: '方剂库', path: '/formulas', icon: BookOpen },
    { name: '中药库', path: '/herbs', icon: PlusCircle },
    { name: '经络穴位', path: '/meridians', icon: Search },
    { name: '我的收藏', path: '/favorites', icon: Heart },
  ]

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl group-hover:from-green-600 group-hover:to-blue-600 transition-all duration-300">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <span className={`text-2xl font-bold transition-colors duration-300 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  中医药学习平台
                </span>
              </Link>
            </div>

          {/* 桌面端导航 */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/formulas"
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-green-600 hover:bg-green-50' 
                  : 'text-gray-100 hover:text-white hover:bg-white/20'
              }`}
            >
              方剂库
            </Link>
            <Link
              to="/herbs"
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-100 hover:text-white hover:bg-white/20'
              }`}
            >
              中药库
            </Link>
            <Link
              to="/meridians"
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-purple-600 hover:bg-purple-50' 
                  : 'text-gray-100 hover:text-white hover:bg-white/20'
              }`}
            >
              经络穴位
            </Link>
            <Link
              to="/acupoints"
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50' 
                  : 'text-gray-100 hover:text-white hover:bg-white/20'
              }`}
            >
              穴位库
            </Link>
          </div>

          {/* 搜索和用户信息 */}
          <div className="flex items-center space-x-4">
            {/* 搜索按钮 */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-full transition-colors ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/20'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* 用户菜单 */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden sm:block font-medium">{user.user_metadata?.username || '用户'}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {/* 下拉菜单 */}
                <div 
                  className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-3 z-50 border border-gray-100 transition-all duration-200 ${
                    showUserMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user.user_metadata?.username || '用户'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    个人资料
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Heart className="w-4 h-4 mr-3" />
                    我的收藏
                  </Link>
                  <Link
                    to="/notes"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <BookOpen className="w-4 h-4 mr-3" />
                    学习笔记
                  </Link>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowUserMenu(false)
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                    isScrolled ? 'text-gray-700 hover:text-green-600 hover:bg-green-50' : 'text-white hover:bg-white/20'
                  }`}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  注册
                </Link>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-md transition-colors ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/20'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        {showSearch && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg py-4 px-4">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索方剂、中药、穴位..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                搜索
              </button>
            </form>
          </div>
        )}

        {/* 移动端菜单 */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-md shadow-2xl border-b border-gray-200">
              <div className="px-6 py-4 space-y-2">
                <Link
                  to="/formulas"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen className="w-5 h-5 mr-3" />
                  方剂库
                </Link>
                <Link
                  to="/herbs"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PlusCircle className="w-5 h-5 mr-3" />
                  中药库
                </Link>
                <Link
                  to="/meridians"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Search className="w-5 h-5 mr-3" />
                  经络穴位
                </Link>
                <Link
                  to="/acupoints"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PlusCircle className="w-5 h-5 mr-3" />
                  穴位库
                </Link>
                {user && (
                  <>
                    <div className="border-t border-gray-200 my-3"></div>
                    <Link
                      to="/favorites"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="w-5 h-5 mr-3" />
                      我的收藏
                    </Link>
                    <Link
                      to="/notes"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-xl transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookOpen className="w-5 h-5 mr-3" />
                      学习笔记
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      退出登录
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
      </div>
    </nav>
      
      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold text-gray-800">中医药学习</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <Link
              to="/formulas"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Book className="w-5 h-5 text-green-600" />
              <span className="text-gray-800">方剂库</span>
            </Link>
            
            <Link
              to="/herbs"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Leaf className="w-5 h-5 text-green-600" />
              <span className="text-gray-800">中药库</span>
            </Link>
            
            <Link
              to="/meridians"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="text-gray-800">经络穴位</span>
            </Link>
            
            <Link
              to="/acupoints"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Dot className="w-5 h-5 text-green-600" />
              <span className="text-gray-800">穴位库</span>
            </Link>
            
            {user && (
              <>
                <div className="border-t pt-4">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-5 h-5 text-green-600" />
                    <span className="text-gray-800">个人资料</span>
                  </Link>
                  
                  <Link
                    to="/favorites"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-green-600" />
                    <span className="text-gray-800">我的收藏</span>
                  </Link>
                  
                  <Link
                    to="/notes"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-gray-800">学习笔记</span>
                  </Link>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>退出登录</span>
                </button>
              </>
            )}
            
            {!user && (
              <div className="space-y-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    setShowAuthModal(true)
                  }}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  登录
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}