import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();


    const [merchantId, setMerchantId] = useState(location.state?.scannedMerchantId || '');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    // Triggers the GPay success animation
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePayment = (e) => {
        e.preventDefault();
        setError('');

        const paymentAmount = Number(amount);

        if (!merchantId || !amount || paymentAmount <= 0) {
            setError("Please enter a valid amount and merchant ID.");
            return;
        }

        try {
            // 1. Fetch user's actual limit and current offline queue
            // (Make sure your Dashboard is saving the real balance to 'offlineLimit' when online)
            const offlineLimit = Number(localStorage.getItem('offlineLimit')) || 0;
            const pending = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');

            // 2. Calculate safe-to-spend limit
            const usedOffline = pending.reduce((sum, txn) => sum + Number(txn.amount), 0);
            const safeToSpend = offlineLimit - usedOffline;

            // 3. THE STRICT GUARDRAIL: Block zero-balance overdrafts
            if (paymentAmount > safeToSpend) {
                setError(`Transaction failed: You only have ₹${safeToSpend.toFixed(2)} safe to spend offline.`);
                return; // Stops the function immediately. No debt is created!
            }

            // 4. Generate a secure offline transaction payload
            const transaction = {
                transactionId: 'TXN-OFF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                merchantId: Number(merchantId),
                amount: paymentAmount,
                timestamp: new Date().toISOString()
            };

            // 5. Save it locally (Zero Network Required)
            pending.push(transaction);
            localStorage.setItem('pendingTransactions', JSON.stringify(pending));

            // 6. TRIGGER GPAY SUCCESS SEQUENCE
            setIsSuccess(true);

            // Play a standard success chime
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
            audio.play().catch(e => console.log("Audio autoplay blocked by browser"));

            // Wait 2.5 seconds for the user to see the checkmark, then redirect back to dashboard
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch (err) {
            setError("Failed to process offline payment.");
        }
    };

    // --- GPAY SUCCESS SCREEN ---
    if (isSuccess) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#34C759',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}>
                <div style={{ fontSize: '120px', marginBottom: '24px', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>✅</div>
                <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800', letterSpacing: '-1px' }}>₹{Number(amount).toFixed(2)}</h1>
                <p style={{ fontSize: '18px', opacity: 0.9, marginTop: '8px', fontWeight: '500' }}>Paid Offline Securely</p>
                <style>{`@keyframes popIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }`}</style>
            </div>
        );
    }

    // --- PREMIUM APPLE STYLES ---
    const inputStyle = {
        width: '100%',
        padding: '18px',
        background: '#F2F2F7',
        border: 'none',
        borderRadius: '16px',
        fontSize: '17px',
        marginBottom: '20px',
        boxSizing: 'border-box',
        outline: 'none',
        color: '#1D1D1F',
        fontFamily: 'inherit',
        fontWeight: '500'
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#F5F7FA',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}>

            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Header Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ background: 'transparent', color: '#007AFF', border: 'none', fontSize: '17px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                    >
                        ← Back
                    </button>
                </div>

                {/* Premium Payment Card */}
                <div style={{
                    background: '#ffffff',
                    padding: '40px 32px',
                    borderRadius: '32px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #E5E5EA'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>💸</div>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', color: '#1D1D1F', letterSpacing: '-0.5px' }}>
                            Make Payment
                        </h1>
                        <p style={{ margin: 0, color: '#86868B', fontSize: '15px' }}>Secure offline transaction</p>
                    </div>

                    {error && <div style={{ background: '#FFECEB', color: '#D70015', padding: '16px', borderRadius: '16px', marginBottom: '24px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handlePayment}>

                        <label style={{ display: 'block', marginLeft: '8px', marginBottom: '8px', fontSize: '13px', color: '#86868B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Merchant ID
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                placeholder="e.g. 1"
                                value={merchantId}
                                onChange={(e) => setMerchantId(e.target.value)}
                                style={inputStyle}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => navigate('/scan')}
                                style={{ position: 'absolute', right: '12px', top: '12px', background: '#E8EAED', color: '#1D1D1F', border: 'none', borderRadius: '10px', padding: '6px 12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                📷 Scan
                            </button>
                        </div>

                        <label style={{ display: 'block', marginLeft: '8px', marginBottom: '8px', fontSize: '13px', color: '#86868B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Amount (₹)
                        </label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{
                                ...inputStyle,
                                fontSize: '40px',
                                fontWeight: '800',
                                textAlign: 'center',
                                padding: '24px 16px',
                                letterSpacing: '-1px'
                            }}
                            required
                        />

                        <button type="submit" style={{
                            width: '100%',
                            padding: '18px',
                            background: 'linear-gradient(135deg, #007AFF 0%, #0056B3 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '18px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            marginTop: '16px',
                            boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)'
                        }}>
                            Pay Offline
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '32px', color: '#86868B', fontSize: '13px', fontWeight: '500' }}>
                    🔒 Zero network connection required.<br/>Transactions sync automatically when online.
                </p>
            </div>
        </div>
    );
}