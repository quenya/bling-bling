import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Edit, 
  BarChart3, 
  Users, 
  Calendar, 
  Trophy,
  Target,
  History
} from 'lucide-react'

const navigation = [
  { name: '통계 분석', href: '/', icon: BarChart3, current: true },
  { name: '점수 입력', href: '/input', icon: Edit },
  { name: '게임 히스토리', href: '/history', icon: History },
]

const quickActions = [
  { name: '점수 입력', icon: Target, action: 'manual' },
]

const Sidebar = () => {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎳</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Bling-Bling</h1>
              <p className="text-gray-300 text-xs">볼링 점수 관리</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-5 w-5"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="px-2 py-4 border-t border-gray-700">
            <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              빠른 작업
            </h3>
            <div className="mt-2 space-y-1">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <action.icon
                    className="mr-3 flex-shrink-0 h-5 w-5"
                    aria-hidden="true"
                  />
                  {action.name}
                </button>
              ))}
            </div>
          </div>

          {/* Stats summary */}
          <div className="px-4 py-4 bg-gray-800">
            <div className="text-xs text-gray-400 mb-2">이번 달 현황</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="text-white font-semibold">-</div>
                <div className="text-gray-400">게임</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">-</div>
                <div className="text-gray-400">참여자</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar