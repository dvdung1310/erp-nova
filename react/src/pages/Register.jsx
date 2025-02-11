import React, { useState } from "react";
import '../assets/css/login.css';

function Register() {
    return (
        <div className="login-container register-container">
            <form action="">
                <h2>Register</h2>
                <div className="input-group">
                    <label htmlFor="">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="login-button">Register</button>
            </form>
        </div>
    )
}

export default Register;