import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        onCloseMobileMenu={closeMobileMenu}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleMobileMenu={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout