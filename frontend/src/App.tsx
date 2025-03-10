import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddRecipe from './pages/AddRecipe';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';

const queryClient = new QueryClient();

function AppContent() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [showFooter, setShowFooter] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleScroll = () => {
    const scrollTop = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 2; // Adjust threshold as needed
    setShowFooter(scrollTop > threshold);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirect unmatched routes to "/" */}
        </Routes>
      </main>
      {showFooter && <footer className="footer">
        &copy; {new Date().getFullYear()} Zero Waste Chef. All rights reserved.
      </footer>}
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

export default App;
