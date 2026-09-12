import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Mpin() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);


    const [mode, setMode] = useState('VERIFY');


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [recoveredPin, setRecoveredPin] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        // Check if an MPIN is already saved on this device
        const savedPin = localStorage.getItem('deviceMpin');
        if (!savedPin) {
            setMode('SETUP');
        }
    }, []);

    const handlePress = (num) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);

            if (newPin.length === 4) {
                if (mode === 'SETUP') {
                    // Save the user's custom MPIN to the device
                    localStorage.setItem('deviceMpin', newPin);
                    setTimeout(() => {
                        setPin('');
                        setMode('VERIFY');
                        alert('MPIN securely saved to device! Please enter it to unlock.');
                    }, 300);
                } else if (mode === 'VERIFY') {
                    // Check against the saved MPIN
                    const savedPin = localStorage.getItem('deviceMpin');
                    if (newPin === savedPin) {
                        setTimeout(() => navigate('/dashboard'), 300);
                    } else {
                        setError(true);
                        setTimeout(() => {
                            setPin('');
                            setError(false);
                        }, 500); // Shake animation reset
                    }
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const handleRecover = async (e) => {
        e.preventDefault();
        setForgotError('');
        try {
            // Securely verify credentials against your Spring Boot backend
            await api.post('/auth/login', { email, password });

            const savedPin = localStorage.getItem('deviceMpin');
            if (savedPin) {
                setRecoveredPin(savedPin);
                setMode('REVEAL');
            } else {
                setForgotError("No MPIN found on this device.");
            }
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Invalid email or password.');
        }
    };


    const inputStyle = {
        width: '100%', padding: '16px', background: '#F2F2F7', border: 'none',
        borderRadius: '14px', fontSize: '16px', marginBottom: '16px',
        boxSizing: 'border-box', outline: 'none', color: '#1C1C1E', fontWeight: '500'
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#ffffff', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
            padding: '60px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
        }}>

            {/* 1. SETUP & VERIFY MODE (The Number Pad) */}
            {(mode === 'SETUP' || mode === 'VERIFY') && (
                <>
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#1D1D1F', letterSpacing: '-0.5px' }}>
                            {mode === 'SETUP' ? 'Create Your MPIN' : 'Enter MPIN'}
                        </h2>
                        <p style={{ color: '#86868B', fontSize: '15px' }}>
                            {mode === 'SETUP' ? 'Set a 4-digit security code' : 'Unlock your secure wallet'}
                        </p>

                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '40px',
                            transform: error ? 'translateX(10px)' : 'none', transition: 'transform 0.1s'
                        }}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    background: i < pin.length ? (error ? '#D70015' : '#1D1D1F') : '#E5E5EA',
                                    transition: 'background 0.2s ease'
                                }} />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: '100%', maxWidth: '320px', marginBottom: '20px' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button key={num} onClick={() => handlePress(num.toString())} style={{ padding: '24px', fontSize: '28px', background: 'transparent', border: 'none', borderRadius: '50%', cursor: 'pointer', fontWeight: '500', color: '#1D1D1F' }}>
                                {num}
                            </button>
                        ))}
                        <div />
                        <button onClick={() => handlePress('0')} style={{ padding: '24px', fontSize: '28px', background: 'transparent', border: 'none', borderRadius: '50%', cursor: 'pointer', fontWeight: '500', color: '#1D1D1F' }}>0</button>
                        <button onClick={handleDelete} style={{ padding: '24px', fontSize: '28px', background: 'transparent', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#1D1D1F' }}>⌫</button>
                    </div>

                    {mode === 'VERIFY' && (
                        <button onClick={() => setMode('FORGOT')} style={{ background: 'transparent', border: 'none', color: '#007AFF', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}>
                            Forgot MPIN?
                        </button>
                    )}
                </>
            )}

            {/* 2. FORGOT MPIN MODE (Email & Password Verification) */}
            {mode === 'FORGOT' && (
                <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center', marginTop: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#1D1D1F' }}>Verify Identity</h2>
                    <p style={{ color: '#86868B', fontSize: '15px', marginBottom: '32px' }}>Enter your account credentials to view your MPIN.</p>

                    {forgotError && <div style={{ background: '#FFECEB', color: '#D70015', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>{forgotError}</div>}

                    <form onSubmit={handleRecover} style={{ textAlign: 'left' }}>
                        <input type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />

                        <button type="submit" style={{ width: '100%', padding: '16px', background: '#007AFF', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
                            Show My MPIN
                        </button>
                    </form>

                    <button onClick={() => setMode('VERIFY')} style={{ background: 'transparent', border: 'none', color: '#86868B', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '32px' }}>
                        Cancel
                    </button>
                </div>
            )}

            {/* 3. REVEAL MODE (Displays the recovered MPIN) */}
            {mode === 'REVEAL' && (
                <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center', marginTop: '80px' }}>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700', color: '#86868B', textTransform: 'uppercase', letterSpacing: '1px' }}>Your MPIN is</h2>

                    <div style={{ background: '#F5F7FA', padding: '32px', borderRadius: '24px', fontSize: '64px', fontWeight: '800', color: '#1D1D1F', letterSpacing: '8px', marginBottom: '40px' }}>
                        {recoveredPin}
                    </div>

                    <button onClick={() => { setMode('VERIFY'); setPin(''); setEmail(''); setPassword(''); }} style={{ width: '100%', padding: '16px', background: '#1D1D1F', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: '600', cursor: 'pointer' }}>
                        Return to Login
                    </button>
                </div>
            )}
        </div>
    );
}