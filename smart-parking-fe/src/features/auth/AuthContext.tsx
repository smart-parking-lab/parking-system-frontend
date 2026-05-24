import React, { createContext, useContext, useEffect, useState } from 'react';

// Định nghĩa kiểu dữ liệu cho Context mới
interface AuthContextType {
  isAuthenticated: boolean;
}

// Khởi tạo Context mặc định là chưa đăng nhập
const AuthContext = createContext<AuthContextType>({ isAuthenticated: false });

// Provider để bọc ứng dụng
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem có đang bật chế độ giả lập không
    const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

    // === LUỒNG MOCK DATA (GIẢ LẬP) ===
    if (isMockMode) {
      const mockSession = localStorage.getItem('mock_session');
      setIsAuthenticated(!!mockSession);
      setLoading(false);
      return;
    }

    // === LUỒNG GỌI API THẬT ===
    // Kiểm tra xem có token (do Backend trả về lúc login) trong máy không
    const token = localStorage.getItem('access_token');
    
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  }, []);

  // Trong lúc đang check token thì hiện màn hình loading
  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để các component khác lấy dữ liệu
export const useAuth = () => useContext(AuthContext);