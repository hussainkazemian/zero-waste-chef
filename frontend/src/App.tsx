import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddRecipe from './pages/AddRecipe';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';

const queryClient = new QueryClient();

function AppContent() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [showFooter, setShowFooter] = useState(false);

  // Fetch user role to conditionally show admin link
  const [userRole, setUserRole] = useState<string | null>(null);
  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch user');
          return res.json();
        })
        .then((data) => setUserRole(data.role))
        .catch(() => setUserRole(null));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Debounced scroll handler to prevent rapid toggling
  const handleScroll = useCallback(() => {
    const scrollTop = window.innerHeight + window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const threshold = scrollHeight - 100; // Increased threshold for stability
    setShowFooter(scrollTop >= threshold);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100); // 100ms debounce
    };
    window.addEventListener('scroll', debouncedScroll);
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="nav-container">
        <div className="logo-container">
          <img src="/src/img/logo.jpg" alt="Logo" className="logo-image" />
          <span className="logo-text">Zero-Waste-Chef</span>
        </div>
        <ul className="flex space-x-4">
          <li><Link to="/" className="nav-link">Home</Link></li>
          {token ? (
            <>
              <li><Link to="/add-recipe" className="nav-link">Add Recipe</Link></li>
              <li><Link to="/inventory" className="nav-link">Inventory</Link></li>
              <li><Link to="/profile" className="nav-link">Profile</Link></li>
              {userRole === 'admin' && (
                <li><Link to="/admin" className="nav-link">Admin Dashboard</Link></li>
              )}
              <li>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="nav-link">Login</Link></li>
              <li><Link to="/register" className="nav-link">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
      <main className="flex-grow p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showFooter && (
        <footer className="footer">
          © {new Date().getFullYear()} Zero Waste Chef. All rights reserved.
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App