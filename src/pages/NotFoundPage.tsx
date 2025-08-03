import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🎳</div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">페이지를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            <br />
            볼링공이 거터로 빠진 것 같네요! 🎳
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/" className="block">
            <Button className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              홈으로 돌아가기
            </Button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full"
          >
            <Button variant="outline" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              이전 페이지로
            </Button>
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">빠른 이동:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/app" className="text-primary-600 hover:text-primary-700 hover:underline">
              대시보드
            </Link>
            <Link to="/app/upload" className="text-primary-600 hover:text-primary-700 hover:underline">
              점수 업로드
            </Link>
            <Link to="/app/statistics" className="text-primary-600 hover:text-primary-700 hover:underline">
              통계 분석
            </Link>
            <Link to="/app/members" className="text-primary-600 hover:text-primary-700 hover:underline">
              회원 관리
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage