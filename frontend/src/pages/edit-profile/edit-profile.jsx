import { useState } from 'react';
import { useAuth } from '../../context/auth-context';
import './edit-profile.css'
import { LoginRoute } from '../../api/loginRoute';
import { UserRoutes } from '../../api/userRoutes';

function EditProfile() {
    const { user } = useAuth();
    const [edited, setEdited] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [error, setError] = useState('')
    const [nome, setNome] = useState('');
    const [telemovel, setTelemovel] = useState('');
    const [localidade, setLocalidade] = useState('');
    const [pass, setPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [comfirmPass, setComfirmPass] = useState('');

    console.log(user);
    console.log("Amanha ao meio dia eu vou almocar");
    const handleButton = () => {
        setClicked(true);
    }

    const handleEditUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
        const data = {
            nome,
            //telemovel
            //localidade
        };
            const response = await UserRoutes.alterUser(user.sub, data);
            if (!response.err) {
                navigate('/users');
        }

        setEdited(true);

        } catch (err) {
            console.error(err);
            setError('Erro ao criar utilizador');
        }
    }

    return (
    <div className="create-user-page">
            <div className="create-user-card">
                <h2>Editar Perfil</h2>
                <form onSubmit={handleEditUser}>
                    <label>
                        Nome
                        <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} />
                    </label>

                    <label>
                        Telemovel
                        <input type="text" required value={telemovel} onChange={(e) => setTelemovel(e.target.value)} />
                    </label>
                    
                    <label className="full-width">
                        Localidade
                        <input type="text" required value={localidade} onChange={(e) => setLocalidade(e.target.value)} />
                    </label>
                
                    <div className="actions">
                        <button type="submit" className="primary">Salvar Alterações</button>
                    </div>
                </form>
                    
                {edited && <p className="success-message">Informações Editadas com Sucesso</p>}

                <hr className="section-divider" />

                <div className="password-section">
                    {!clicked ? (
                    <>
                        <h2>Segurança</h2>
                        <div className="actions">
                            <button className="primary" onClick={handleButton}>Alterar Password</button>
                        </div>
                    </>
                    ) : (
                        <>
                            <h3>Alterar Password</h3>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <label>
                                    Password Atual
                                    <input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} />
                                </label>
                                <div className="empty-grid-space"></div> {/* Keeps layout aligned */}
                                <label>
                                    Nova Password
                                    <input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                                </label>
                                <label>
                                    Confirmar Nova Password
                                    <input type="password" required value={comfirmPass} onChange={(e) => setComfirmPass(e.target.value)} />
                                </label>
                                <div className="actions">
                                    <button type="submit" className="primary">Atualizar Password</button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
  );
}

export default EditProfile;
