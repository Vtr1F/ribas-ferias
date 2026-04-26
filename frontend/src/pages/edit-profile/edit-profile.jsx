import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import { useNavigate } from 'react-router-dom';
import './edit-profile.css'
import { LoginRoute } from '../../api/loginRoute';
import { UserRoutes } from '../../api/userRoutes';

function EditProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [edited, setEdited] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [error, setError] = useState('')
    const [nome, setNome] = useState('');
    const [telemovel, setTelemovel] = useState('');
    const [localidade, setLocalidade] = useState('');
    const [pass, setPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [comfirmPass, setComfirmPass] = useState('');
    const fileInputRef = useRef(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    useEffect(() => {
        if (user?.sub) {
            UserRoutes.getUserImage(user.sub)
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    setAvatarUrl(url);
                })
                .catch(() => {});
        }
    }, [user]);
    
    const handleButton = () => {
        setClicked(true);
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);
        try {
            const result = await UserRoutes.uploadUserImage(file);
            if (!result.err) {
                const newAvatarUrl = URL.createObjectURL(file);
                setAvatarUrl(newAvatarUrl);
            }
        } catch (err) {
            console.error('Erro ao carregar imagem:', err);
            setError('Erro ao carregar imagem');
        } finally {
            setUploading(false);
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        setError('');
        const rawUser = await UserRoutes.fetchUser(user.sub);
        try {
        const data = {
            nome: (nome ?  nome.trim() : rawUser.nome),
            email: rawUser.email,
            dias_ferias_disponiveis: rawUser.dias_ferias_disponiveis,
            role_id: rawUser.role_id,
            superior_id: rawUser.superior_id,
            team_id: rawUser.team_id,
            birthday: rawUser.birthday,
            phone_number: (telemovel ?  telemovel.trim() : rawUser.phone_number),
            headquarter: (localidade ?  localidade.trim() : rawUser.headquarter),
            avatar_url: rawUser.avatar_url,
        };
            const response = await UserRoutes.alterUser(user.sub, data);
            
            if (!response.err) {
                setEdited(true);
                await sleep(3000);
                navigate('/users');
        }


        } catch (err) {
            console.error(err);
            setError('Erro ao criar utilizador');
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError();
        const rawUser = await UserRoutes.fetchUser(user.sub);

        if (/\s/.test(new_password)) {
            return setError("Password não pode conter espaços")
        }

        if (newPass != comfirmPass){
            setError('Passwords não Coincidem');
            return;
        }
        const data = {
            email: rawUser.email,
            password: pass
        }
        try {
            const log = await LoginRoute.loginPost(data)
            if (!log.err) {
                const data = {
                    id: user.sub,
                    email: rawUser.email,
                    password_hash: newPass
                }
                const resp = await UserRoutes.updatePassword(user.sub, data);
                console.log(resp);
            }
        } catch (err) {
            console.log(err);
            setError("Password não Autorizada");
        }
    }

    return (
    <div className="create-user-page">
            <div className="create-user-card">
                <h2>Editar Perfil</h2>
                
                <div className="avatar-upload-section">
                    <div className="avatar-preview" onClick={handleAvatarClick}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" />
                        ) : (
                            <div className="avatar-placeholder">?</div>
                        )}
                        <div className="avatar-overlay">
                            <span className="pen-icon">&#9998;</span>
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                    />
                    <p className="avatar-hint">Clique na foto para alterar</p>
                    {uploading && <p className="uploading-text">A carregar...</p>}
                </div>

                <form onSubmit={handleEditUser}>
                    <label>
                        Nome
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
                    </label>

                    <label>
                        Telemovel
                        <input type="text" value={telemovel} onChange={(e) => setTelemovel(e.target.value)} />
                    </label>
                    
                    <label className="full-width">
                        Localidade
                        <input type="text" value={localidade} onChange={(e) => setLocalidade(e.target.value)} />
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
                            <form onSubmit={handlePasswordChange}>
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
                                {error && <p className="error">{error}</p>}
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
