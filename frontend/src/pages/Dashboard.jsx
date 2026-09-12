import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Dashboard() {
    const [bankAccount, setBankAccount] = useState(null);
    const [credit, setCredit] = useState(null);
    const [penalties, setPenalties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [bankRes, creditRes, penaltyRes] = await Promise.all([
                api.get('/bank/my-account').catch(() => ({ data: null })),
                api.get('/credit/my-credit').catch(() => ({ data: null })),
                api.get('/penalty/my-penalties').catch(() => ({ data: [] }))
            ]);

            setBankAccount(bankRes.data);
            setCredit(creditRes.data);
            setPenalties(Array.isArray(penaltyRes.data) ? penaltyRes.data : []);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateAccount = async () => {
        try {
            await api.post('/bank/create');
            fetchData();
        } catch (err) {
            alert('Failed to create account');
        }
    };

    const handleDeposit = async () => {
        const amount = prompt("Enter amount to deposit (₹):");
        if (amount && !isNaN(amount) && Number(amount) > 0) {
            try {
                await api.post('/bank/deposit', { amount: Number(amount) });
                fetchData();
            } catch (err) {
                alert('Deposit failed: ' + (err.response?.data?.message || 'Check network'));
            }
        }
    };

    const handleWithdraw = async () => {
        const amount = prompt("Enter amount to withdraw (₹):");
        if (amount && !isNaN(amount) && Number(amount) > 0) {
            try {
                await api.post('/bank/withdraw', { amount: Number(amount) });
                fetchData();
            } catch (err) {
                alert(err.response?.data?.error || err.response?.data?.message || 'Withdrawal failed. Insufficient funds?');
            }
        }
    };

    const handleRefreshCredit = async () => {
        try {
            await api.post('/credit/refresh');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to refresh credit limit');
        }
    };

    const handlePayPenalty = async (penaltyId) => {
        try {
            await api.post(`/penalty/pay/${penaltyId}`);
            alert('Penalty paid successfully!');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data?.error || 'Failed to pay penalty. Check your balance.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };


    const pendingTxns = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');
    const pendingTotal = pendingTxns.reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

    const safeBalance = bankAccount?.balance || 0;
    const safeTotalLimit = credit?.totalLimit || credit?.creditLimit || credit?.limit || 0;
    const backendUsedAmount = credit?.usedAmount || credit?.usedCredit || 0;
    const safeUsedAmount = backendUsedAmount + pendingTotal;

    const maxCreditAvailable = Math.max(0, safeTotalLimit - safeUsedAmount);
    const availableToSpend = Math.max(0, Math.min(safeBalance, maxCreditAvailable));


    useEffect(() => {
        if (!loading) {
            const baseOfflineLimit = Math.max(0, Math.min(safeBalance, safeTotalLimit - backendUsedAmount));
            localStorage.setItem('offlineLimit', baseOfflineLimit);
        }
    }, [safeBalance, safeTotalLimit, backendUsedAmount, loading]);



    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F5F7FA', fontFamily: '-apple-system, sans-serif' }}>
                <div style={{ textAlign: 'center', color: '#86868B', fontWeight: '500' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>💳</div>
                    Securely loading your wallet...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#F5F7FA',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            padding: '40px 20px'
        }}>
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                {/* UPGRADED HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#86868B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {getGreeting()}
                        </p>
                        <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800', letterSpacing: '-1.2px', color: '#1D1D1F' }}>
                            Your Wallet
                        </h1>
                    </div>
                    <button onClick={handleLogout} style={{
                        background: '#E8EAED', color: '#1D1D1F', padding: '10px 20px', border: 'none',
                        borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}>
                        Sign Out
                    </button>
                </div>

                {/* UPGRADED PENALTY BANNER (Glassmorphic Red) */}
                {penalties.filter(p => p.status !== 'PAID').length > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)',
                        color: 'white', padding: '24px', borderRadius: '24px',
                        marginBottom: '32px', boxShadow: '0 12px 24px rgba(255, 59, 48, 0.25)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                            <div style={{ background: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FF3B30', fontSize: '14px' }}>!</div>
                            Action Required ({penalties.filter(p => p.status !== 'PAID').length})
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '0', listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {penalties.filter(p => p.status !== 'PAID').map(p => (
                                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                                    <span style={{ fontSize: '15px' }}>
                                        <strong style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>₹{Number(p.amount || 0).toFixed(2)} Fee</strong>
                                        <span style={{ opacity: 0.9 }}>{p.reason}</span>
                                    </span>
                                    <button
                                        onClick={() => handlePayPenalty(p.id)}
                                        style={{ padding: '10px 24px', background: 'white', color: '#D70015', border: 'none', borderRadius: '20px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    >
                                        Pay Now
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!bankAccount ? (
                    <div style={{ background: '#ffffff', padding: '60px 40px', borderRadius: '32px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', border: '1px solid #F0F0F0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏦</div>
                        <h2 style={{ margin: '0 0 12px 0', fontSize: '28px', color: '#1D1D1F', letterSpacing: '-0.5px' }}>Setup Offline UPI</h2>
                        <p style={{ color: '#86868B', marginBottom: '32px', fontSize: '16px', maxWidth: '400px', margin: '0 auto 32px' }}>Initialize your secure mock bank account to begin testing zero-network transactions.</p>
                        <button onClick={handleCreateAccount} style={{ background: 'linear-gradient(135deg, #007AFF 0%, #0056B3 100%)', color: 'white', padding: '18px 40px', border: 'none', borderRadius: '24px', fontSize: '17px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0, 122, 255, 0.25)' }}>
                            Create Secure Account
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>

                        {/* PREMIUM CENTRAL BANK CARD */}
                        <div style={{
                            background: 'linear-gradient(145deg, #1A1A1C 0%, #000000 100%)',
                            color: 'white', padding: '36px', borderRadius: '32px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden'
                        }}>
                            {/* Metallic Chip Decorative Element */}
                            <div style={{ position: 'absolute', top: '40px', right: '36px', width: '45px', height: '32px', background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', borderRadius: '6px', opacity: 0.8 }}></div>

                            <div style={{ zIndex: 1 }}>
                                <div style={{ marginBottom: '48px' }}>
                                    <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #FFFFFF 0%, #A1A1A6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        Central Bank
                                    </span>
                                </div>
                                <div style={{ marginBottom: '40px' }}>
                                    <span style={{ fontSize: '13px', color: '#A1A1A6', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600' }}>Available Balance</span>
                                    <h2 style={{ margin: '8px 0 0 0', fontSize: '52px', fontWeight: '800', letterSpacing: '-2px' }}>
                                        ₹{Number(safeBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                    </h2>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', zIndex: 1 }}>
                                <button onClick={handleDeposit} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                                    Deposit
                                </button>
                                <button onClick={handleWithdraw} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                                    Withdraw
                                </button>
                            </div>
                        </div>

                        {/* PREMIUM OFFLINE WALLET CARD */}
                        <div style={{
                            background: '#FFFFFF', color: '#1D1D1F', padding: '36px', borderRadius: '32px',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column',
                            border: '1px solid #E5E5EA'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>Offline Wallet</span>
                                <span style={{ background: '#E8F5E9', color: '#34C759', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>Active</span>
                            </div>

                            {credit ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F2F2F7' }}>
                                        <span style={{ color: '#86868B', fontWeight: '500' }}>Total Limit</span>
                                        <span style={{ fontWeight: '700' }}>₹{Number(safeTotalLimit).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                                        <span style={{ color: '#86868B', fontWeight: '500' }}>Used Offline</span>
                                        <span style={{ fontWeight: '700' }}>₹{Number(safeUsedAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                                    </div>

                                    <div style={{ marginBottom: '36px', background: '#F5F7FA', padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#86868B', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Safe to Spend Offline</span>
                                        <h2 style={{ margin: '8px 0 0 0', fontSize: '42px', fontWeight: '800', color: '#007AFF', letterSpacing: '-1.5px' }}>
                                            ₹{availableToSpend.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                        </h2>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                                        <button onClick={() => navigate('/payment')} style={{ background: 'linear-gradient(135deg, #007AFF 0%, #0056B3 100%)', color: 'white', padding: '16px', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 8px 16px rgba(0, 122, 255, 0.2)' }}>
                                            Pay Offline Merchant
                                        </button>
                                        <button onClick={() => navigate('/sync')} style={{ background: '#1D1D1F', color: 'white', padding: '16px', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                                            Sync Pending Payments
                                        </button>
                                        <button onClick={handleRefreshCredit} style={{ background: 'transparent', color: '#007AFF', padding: '16px', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                                            Refresh Limit
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '40px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>✈️</div>
                                    <p style={{ color: '#86868B', marginBottom: '24px', fontSize: '16px' }}>Offline capabilities are currently suspended.</p>
                                    <button onClick={handleRefreshCredit} style={{ background: '#007AFF', color: 'white', padding: '16px 24px', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 8px 16px rgba(0, 122, 255, 0.2)' }}>
                                        Generate Offline Credit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}