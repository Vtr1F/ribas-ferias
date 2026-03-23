import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home.jsx';
import Login from './pages/login.jsx';

//função que baseado na rota mostra um dos layouts
function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para a página de Login */}
        <Route path="/" element={<Login />} />

        {/* Rota para a Home (Página Principal) */}
        <Route path="/home" element={<Home />} />
        
        {/*  adicionar outras rotas aqui conforme sao criados ficheiros nas pages */}
      </Routes>
    </Router>
  );
}


// Isto serve de quando for importado em algum outro sitio, automaticamente assume este nome
export default App
