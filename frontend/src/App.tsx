import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-500 p-4 text-white">
        <ul className="flex space-x-4">
          <li><Link to="/">Home</Link></li>
          {token ? (
            <>
              <li><Link to="/add-recipe">Add Recipe</Link></li>
              <li><Link to="/inventory">Inventory</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><button onClick={handleLogout} className="bg-red-500 p-1 rounded">Logout</button></li>
            </>
          ) : (
            <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li> 
            </>
          )}
        </ul>
      </nav>
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