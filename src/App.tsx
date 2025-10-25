import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import FiscalProfileLoader from './pages/FiscalProfileLoader.jsx';
import FiscalProfileA from './pages/FiscalProfileA.jsx';
import FiscalProfileB from './pages/FiscalProfileB.jsx';
import FiscalProfileC from './pages/FiscalProfileC.jsx';
import PerfilFiscalCompletado from './pages/PerfilFiscalCompletado.jsx';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const { isValidatingProfile } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {isValidatingProfile && <FiscalProfileLoader />}
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil-fiscal/A" element={<FiscalProfileA />} />
          <Route path="/perfil-fiscal/B" element={<FiscalProfileB />} />
          <Route path="/perfil-fiscal/C" element={<FiscalProfileC />} />
          <Route path="/perfil-fiscal/completado" element={<PerfilFiscalCompletado />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
