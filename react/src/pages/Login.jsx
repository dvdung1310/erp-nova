import React, { useState } from 'react';
import '../assets/css/login.css';
import { LoginServices } from '../services/LoginServices';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = {
            email: email,
            password: password
        };
        
        const response = await LoginServices(data);
        if (response && response.access_token) {
            localStorage.setItem('token', response.access_token);
            toast.success('Tài khoản đúng'); 
            navigate('/');
        } else {
            toast.error('Tài khoản không đúng'); 
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                
                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="login-button">Login</button>
            </form>
           
        </div>
    );
}

export default Login;
