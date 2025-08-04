import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/ui';
import { useMultipleRealtime, useRealtimeStatus } from '@/hooks/useRealtime';

// Pages
import ManualInputPage from './pages/ManualInputPage';
import StatisticsPage from './pages/StatisticsPage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout
import Layout from './components/Layout';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AppContent() {
  // 실시간 기능 활성화
  const realtimeConnections = useMultipleRealtime();
  const realtimeStatus = useRealtimeStatus();

  // 개발 환경에서 실시간 연결 상태 로깅
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Realtime connections:', realtimeConnections.isAllConnected);
      console.log('Network status:', realtimeStatus.isOnline);
    }
  }, [realtimeConnections.isAllConnected, realtimeStatus.isOnline]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* App routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<StatisticsPage />} />
            <Route path="input" element={<ManualInputPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
          
          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App