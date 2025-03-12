import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
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
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user role for admin link
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
    } else {
      setUserRole(null); // Ensure role is null when not logged in
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Debounced scroll handler for footer visibility
  const handleScroll = useCallback(() => {
    const scrollTop = window.innerHeight + window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const threshold = scrollHeight - 100;
    setShowFooter(scrollTop >= threshold);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
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
          <img src="img/logo.jpg" alt="Logo" className="logo-image" />
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
          <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/forgot-password" element={token ? <Navigate to="/" replace /> : <ForgotPassword />} />
          <Route
            path="/add-recipe"
            element={token ? <AddRecipe /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/inventory"
            element={token ? <Inventory /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={token ? <Profile /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin"
            element={
              token && userRole === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to={token ? "/" : "/login"} replace />
              )
            }
          />
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
      <Router basename={import.meta.env.BASE_URL}>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;