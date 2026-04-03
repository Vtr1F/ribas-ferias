import MainLayout from '../layouts/main-layout';
import './login.css'
import './dashboard.css'

function Dashboard() {
    

    return (
    <MainLayout>
      <main className="dashboard-content">
        <div class="login-container">
            <h2>Criar Novo Utilizador</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" 
                        value= {email} onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email" required />
                    <button type="submit">Enviar Email</button>
                </form>
            </div>
        </main>
        </MainLayout>
    );
}

export default Dashboard;