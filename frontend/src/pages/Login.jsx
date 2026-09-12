import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Modes: 'LOGIN', 'REQ_OTP' (enter email), 'RESET_PW' (enter otp & new password)
    const [mode, setMode] = useState('LOGIN');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            navigate('/mpin');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('Sending OTP...');
        try {
            await api.post('/auth/request-otp', { email });
            setMessage('OTP sent to your email!');
            setTimeout(() => setMode('RESET_PW'), 1500);
        } catch (err) {
            setMessage('');
            setError(err.response?.data?.message || 'Failed to send OTP.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            setMessage('Password reset successful! You can now log in.');
            setOtp('');
            setNewPassword('');
            setTimeout(() => setMode('LOGIN'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP or reset failed.');
        }
    };


    const inputStyle = {
        width: '100%', padding: '16px', background: '#F2F2F7', border: 'none',
        borderRadius: '14px', fontSize: '16px', marginBottom: '16px', boxSizing: 'border-box',
        outline: 'none', color: '#1C1C1E', fontFamily: 'inherit'
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F2F2F7', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            <div style={{ background: '#ffffff', padding: '48px 40px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)', maxWidth: '400px', width: '90%', textAlign: 'center' }}>

                <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>💳</div>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', color: '#1C1C1E', letterSpacing: '-0.5px' }}>
                        {mode === 'LOGIN' ? 'Offline UPI' : 'Reset Password'}
                    </h1>
                    <p style={{ margin: 0, color: '#8E8E93', fontSize: '15px' }}>
                        {mode === 'LOGIN' ? 'Sign in to manage your wallet' : mode === 'REQ_OTP' ? 'Enter your email to receive an OTP' : 'Enter the OTP sent to your email'}
                    </p>
                </div>

                {error && <div style={{ background: '#FFECEB', color: '#D70015', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>{error}</div>}
                {message && <div style={{ background: '#E8F5E9', color: '#34C759', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>{message}</div>}

                {mode === 'LOGIN' && (
                    <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                        <input type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
                        <button type="submit" style={{ width: '100%', padding: '16px', background: '#007AFF', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>Sign In</button>
                    </form>
                )}

                {mode === 'REQ_OTP' && (
                    <form onSubmit={handleRequestOTP} style={{ textAlign: 'left' }}>
                        <input type="email" placeholder="Registered Email ID" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                        <button type="submit" style={{ width: '100%', padding: '16px', background: '#1C1C1E', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>Send OTP</button>
                    </form>
                )}

                {mode === 'RESET_PW' && (
                    <form onSubmit={handleResetPassword} style={{ textAlign: 'left' }}>
                        <input type="text" placeholder="6-Digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} style={{...inputStyle, letterSpacing: '4px', textAlign: 'center', fontSize: '20px', fontWeight: '700'}} required maxLength="6" />
                        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} required />
                        <button type="submit" style={{ width: '100%', padding: '16px', background: '#34C759', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>Update Password</button>
                    </form>
                )}

                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {mode === 'LOGIN' ? (
                        <>
                            <span onClick={() => { setMode('REQ_OTP'); setError(''); setMessage(''); }} style={{ color: '#007AFF', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Forgot Password?</span>
                            <p style={{ margin: 0, color: '#8E8E93', fontSize: '14px' }}>Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#007AFF', cursor: 'pointer', fontWeight: '500' }}>Create one now</span></p>
                        </>
                    ) : (
                        <span onClick={() => { setMode('LOGIN'); setError(''); setMessage(''); }} style={{ color: '#8E8E93', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>← Back to Login</span>
                    )}
                </div>

            </div>
        </div>
    );
}