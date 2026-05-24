import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Home from '@/pages/Home';
import Records from '@/pages/Records';
import Settings from '@/pages/Settings';
import { useCheckinStore } from '@/store/useCheckinStore';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: '便捷打卡', subtitle: '坚持每一天，养成好习惯' },
  '/records': { title: '打卡记录', subtitle: '查看你的打卡历程' },
  '/settings': { title: '设置', subtitle: '管理你的打卡类型' },
};

const AppContent = () => {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: '便捷打卡' };
  const loadData = useCheckinStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
      <main className="pb-24 px-4 pt-4 max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/records" element={<Records />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
