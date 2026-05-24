import { useRoutes, Navigate, Outlet } from 'react-router-dom';

// Import Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';

// Import Pages (Admin)
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';

// Import Pages (Public)
import HomePage from '../pages/public/HomePage';
import SessionsPage from '../pages/admin/SessionsPage';
import RevenuePage from '../pages/admin/RevenuePage';
import { useAuth } from '../features/auth/AuthContext';

// --- 🛡️ GUARDS ---

// 1. Component bảo vệ: Bắt buộc PHẢI ĐĂNG NHẬP mới được vào (Dùng cho Dashboard)
const AdminProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  
  // Nếu CHƯA đăng nhập -> Đá về Login
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  
  // Nếu ĐÃ đăng nhập -> Mở cửa cho đi tiếp
  return <Outlet />; 
};

// 2. Component từ chối: Nếu ĐÃ ĐĂNG NHẬP rồi thì cấm vào (Dùng cho trang Login)
const AdminRejectedRoute = () => {
  const { isAuthenticated } = useAuth();
  
  // Nếu ĐÃ đăng nhập -> Đá thẳng vào Dashboard (không cho nhìn thấy form login nữa)
  if (isAuthenticated) return <Navigate to="/admin/slot" />;
  
  // Nếu CHƯA đăng nhập -> Mở cửa cho vào form login
  return <Outlet />; 
};
// --- 🗺️ ROUTES CONFIG ---

export default function useRouteElements() {
  const routeElements = useRoutes([
    // ==========================================
    // VÙNG 1: PUBLIC (Trang xem sơ đồ bãi xe cho khách)
    // ==========================================
    {
      path: '/',
      element: <PublicLayout />,
      children: [
        {
          index: true, // index: true thay cho path: '' 
          element: <HomePage />
        }
      ]
    },

    // ==========================================
    // VÙNG 2: ADMIN AUTH (Chưa đăng nhập)
    // ==========================================
    {
      path: '/admin/login',
      element: <AdminRejectedRoute />,
      children: [
        {
          index: true,
          element: <LoginPage />
        }
      ]
    },

    // ==========================================
    // VÙNG 3: ADMIN PRIVATE (Đã đăng nhập)
    // ==========================================
    {
      path: '/admin',
      element: <AdminProtectedRoute />,
      children: [
        {
          path: '',
          element: <AdminLayout />, // Layout chứa Sidebar và Header quản trị
          children: [
            {
              index: true,
              element: <Navigate to="slot" replace /> // Tự động đá vào trang quản lý slot
            },
            {
              path: 'slot',
              element: <DashboardPage />
            },
            {
              path: 'parking-session',
              element: <SessionsPage />
            },
            {
              path: 'revenue',
              element: <RevenuePage />
            }
          ]
        }
      ]
    },

    // ==========================================
    // VÙNG 4: 404 CATCH ALL
    // ==========================================
    { 
      path: '*', 
      element: <div className="flex justify-center items-center h-screen text-2xl font-bold">404 Not Found</div> 
    }
  ]);

  return routeElements;
}