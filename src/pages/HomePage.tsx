import { Link } from 'react-router-dom'
import { ArrowRight, Camera, BarChart3, Users, Trophy } from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: Camera,
      title: 'OCR 점수 인식',
      description: '볼링 화이트보드 사진을 업로드하면 자동으로 점수를 인식합니다.',
      color: 'bg-blue-500',
    },
    {
      icon: BarChart3,
      title: '통계 분석',
      description: '개인별, 그룹별 상세한 통계와 성과 분석을 제공합니다.',
      color: 'bg-green-500',
    },
    {
      icon: Users,
      title: '회원 관리',
      description: '동호회 회원들의 기록과 참여 이력을 체계적으로 관리합니다.',
      color: 'bg-purple-500',
    },
    {
      icon: Trophy,
      title: '업적 시스템',
      description: '다양한 업적과 배지로 재미있는 경쟁과 동기부여를 제공합니다.',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-4xl">🎳</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bling-Bling
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              동호회 볼링 점수 관리 및 통계 분석 시스템
            </p>
            
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              볼링 화이트보드 사진을 OCR로 자동 인식하여 점수를 관리하고, 
              재미있는 통계와 분석을 통해 동호회 활동을 더욱 즐겁게 만들어보세요.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/app"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                시작하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link
                to="/app/upload"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-lg"
              >
                점수 업로드
                <Camera className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              주요 기능
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              최신 기술과 직관적인 인터페이스로 볼링 관리를 더욱 쉽고 재미있게
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              동호회 통계 한눈에
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">99%</div>
              <div className="text-gray-600">OCR 인식 정확도</div>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="text-4xl font-bold text-green-600 mb-2">30초</div>
              <div className="text-gray-600">평균 처리 시간</div>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">언제든지 이용 가능</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            복잡한 점수 관리는 이제 그만! 사진 한 장으로 모든 것이 해결됩니다.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg"
          >
            무료로 시작하기
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <span className="text-2xl">🎳</span>
              <span className="text-xl font-bold">Bling-Bling</span>
            </div>
            <p className="text-gray-400">
              © 2024 Bling-Bling. 볼링을 더욱 재미있게.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage