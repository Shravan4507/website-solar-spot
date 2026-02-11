import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Orb from './components/background/orb';
import Home from './pages/Home';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Verifier from './pages/Verifier';
import SafetyGuide from './pages/SafetyGuide';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import VenueMap from './pages/VenueMap';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import PageTransition from './components/effects/PageTransition';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollToTop from './components/utils/ScrollToTop';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const Intro = () => {
  const navigate = useNavigate();
  return (
    <PageTransition>
      <div className="hero-section">
        <div className="content-wrapper">
          <div className="logo-container">
            <img
              src="/Logo_without_background.png"
              alt="Solar Spot Logo"
              className="center-logo"
            />
          </div>
          <button className="get-started" onClick={() => navigate('/home')}>
            GET STARTED
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

const LoginWrapper = () => {
  const { isLoggedIn, isAdmin, isRegistered, loading } = useAuth();

  if (loading) return null;
  if (isLoggedIn) {
    if (isAdmin) return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to={isRegistered ? "/dashboard" : "/register"} replace />;
  }

  return (
    <PageTransition>
      <Login />
    </PageTransition>
  );
};

const MainApp = () => {
  const location = useLocation();

  // Hide navbar on Intro (/), Login (/login), Admin Login (/admin-login), Admin Dashboard (/admin-dashboard), and Verifier (/verify)
  const showNavbar = !['/', '/login', '/admin-login', '/admin-dashboard', '/verify'].includes(location.pathname);

  return (
    <div className="app-container">
      <ScrollToTop />
      {/* Persistent Background */}
      <div className="background-wrapper">
        <Orb
          hoverIntensity={0}
          rotateOnHover
          hue={0}
          forceHoverState={false}
          backgroundColor="#000000"
        />
      </div>

      {showNavbar && <Navbar />}
      {showNavbar && <MobileNav />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Intro />} />
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/admin-login" element={
            <AdminLogin />
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <PageTransition>
              <Home />
            </PageTransition>
          } />
          <Route path="/register" element={
            <ProtectedRoute>
              <PageTransition>
                <Register />
              </PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/verify" element={
            <ProtectedRoute adminOnly={true}>
              <Verifier />
            </ProtectedRoute>
          } />
          <Route path="/safety" element={
            <SafetyGuide />
          } />
          <Route path="/privacy" element={
            <PrivacyPolicy />
          } />
          <Route path="/terms" element={
            <TermsOfService />
          } />
          <Route path="/venue" element={
            <VenueMap />
          } />
          <Route path="/contact" element={
            <Contact />
          } />
          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {showNavbar && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
}

export default App;
