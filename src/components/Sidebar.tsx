import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Edit, 
  BarChart3, 
  Users, 
  Trophy,
  Target,
  History,
  X
} from 'lucide-react'

const navigation = [
  { name: '대시보드', href: '/app', icon: Home, current: true },
  { name: '점수 입력', href: '/app/input', icon: Edit },
  { name: '통계 분석', href: '/app/statistics', icon: BarChart3 },
  { name: '회원 관리', href: '/app/members', icon: Users },
  { name: '게임 히스토리', href: '/app/history', icon: History },
  { name: '업적 & 배지', href: '/app/achievements', icon: Trophy },
]

const quickActions = [
  { name: '점수 입력', icon: Target, action: 'manual' },
]

interface SidebarProps {
  isMobileMenuOpen?: boolean
  onCloseMobileMenu?: () => void
}

const Sidebar = ({ isMobileMenuOpen = false, onCloseMobileMenu }: SidebarProps) => {
  const handleNavClick = () => {
    // Close mobile menu when navigation item is clicked
    if (onCloseMobileMenu) {
      onCloseMobileMenu()
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
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
                  end={item.href === '/app'}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
            onClick={onCloseMobileMenu}
          />
          
          {/* Mobile menu */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 overflow-y-auto">
            <div className="flex items-center justify-between h-16 px-4 bg-gray-900 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🎳</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Bling-Bling</h1>
                  <p className="text-gray-300 text-xs">볼링 점수 관리</p>
                </div>
              </div>
              <button
                onClick={onCloseMobileMenu}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                aria-label="메뉴 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/app'}
                  onClick={handleNavClick}
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

            {/* Mobile Quick Actions */}
            <div className="px-2 py-4 border-t border-gray-700">
              <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                빠른 작업
              </h3>
              <div className="mt-2 space-y-1">
                {quickActions.map((action) => (
                  <button
                    key={action.name}
                    onClick={handleNavClick}
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

            {/* Mobile Stats summary */}
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
      )}
    </>
  )
}

export default Sidebar