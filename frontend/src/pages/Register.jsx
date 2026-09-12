import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); // ADDED: State for phone number
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // ADDED: Passing the phone variable in the API request payload
            await api.post('/auth/register', { name, email, phone, password, role });
            setSuccess('Account created successfully! Redirecting...');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
        }
    };

    // --- APPLE DESIGN STYLES ---
    const inputStyle = {
        width: '100%',
        padding: '16px',
        background: '#F2F2F7',
        border: '1px solid transparent',
        borderRadius: '14px',
        fontSize: '16px',
        marginBottom: '16px',
        boxSizing: 'border-box',
        outline: 'none',
        color: '#1C1C1E',
        fontFamily: 'inherit'
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#F2F2F7',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, sans-serif'
        }}>
            <div style={{
                background: '#ffffff',
                padding: '48px 40px',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', color: '#1C1C1E', letterSpacing: '-0.5px' }}>
                        Create Account
                    </h1>
                    <p style={{ margin: 0, color: '#8E8E93', fontSize: '15px' }}>Join the offline payment revolution</p>
                </div>

                {error && <div style={{ background: '#FFECEB', color: '#FF3B30', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', wordBreak: 'break-word' }}>{error}</div>}
                {success && <div style={{ background: '#E8F5E9', color: '#34C759', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>{success}</div>}

                <form onSubmit={handleRegister} style={{ textAlign: 'left' }}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email ID"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                    />

                    {/* ADDED: The missing phone number input field */}
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={inputStyle}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{...inputStyle, cursor: 'pointer'}}
                    >
                        <option value="USER">Standard User</option>
                        <option value="MERCHANT">Merchant Account</option>
                    </select>

                    <button type="submit" style={{
                        width: '100%',
                        padding: '16px',
                        background: '#34C759',
                        color: 'white',
                        border: 'none',
                        borderRadius: '14px',
                        fontSize: '17px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '8px',
                        boxShadow: '0 4px 12px rgba(52, 199, 89, 0.2)'
                    }}>
                        Sign Up
                    </button>
                </form>

                <p style={{ marginTop: '32px', color: '#8E8E93', fontSize: '14px' }}>
                    Already have an account?{' '}
                    <span
                        onClick={() => navigate('/')}
                        style={{ color: '#007AFF', cursor: 'pointer', fontWeight: '500' }}
                    >
                        Sign in
                    </span>
                </p>
            </div>
        </div>
    );
}