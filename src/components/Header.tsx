import { useState } from 'react'
import { Bell, Settings, User, Search } from 'lucide-react'

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search bar */}
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="회원, 세션, 기록 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Quick stats */}
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-gray-900">-</div>
              <div>평균점수</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">-</div>
              <div>이번달 게임</div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-gray-200"></div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900">관리자</div>
              <div className="text-xs text-gray-500">동호회 운영진</div>
            </div>
            <button className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header