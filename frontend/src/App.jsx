import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard.jsx';
import Login from './pages/login.jsx';

//função que baseado na rota mostra um dos layouts
function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para a página de Login */}
        <Route path="/" element={<Login />} />

        {/* Rota para a Home (Página Principal) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/*  adicionar outras rotas aqui conforme sao criados ficheiros nas pages */}
      </Routes>
    </Router>
  );
}


// Isto serve de quando for importado em algum outro sitio, automaticamente assume este nome
export default App
