import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { AuthProvider } from './lib/AuthContext';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import Demo from './pages/Demo';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppDashboard from './pages/AppDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages with navbar/footer */}
          <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
          <Route path="/docs" element={<PublicLayout><Docs /></PublicLayout>} />
          <Route path="/demo" element={<PublicLayout><Demo /></PublicLayout>} />

          {/* Auth pages (no navbar/footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* App dashboard (own layout) */}
          <Route path="/app" element={<AppDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
