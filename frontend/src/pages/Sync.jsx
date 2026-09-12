import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Sync() {
    const navigate = useNavigate();
    const [pending, setPending] = useState([]);
    const [status, setStatus] = useState('');
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');
        setPending(saved);
    }, []);

    const handleSync = async () => {
        const pendingTxns = JSON.parse(localStorage.getItem('pendingTransactions')) || [];

        if (pendingTxns.length === 0) {
            alert("No pending transactions to sync.");
            return;
        }

        setSyncing(true);

        try {
            const response = await api.post('/sync', pendingTxns);

            const {
                successfulTransactions = [],
                failedTransactions = [],
                alreadySyncedTransactions = []
            } = response.data;

            // Safe to clear now — the backend has already accounted for every item
            // (successful, failed, or already-synced) on its side.
            localStorage.removeItem('pendingTransactions');

            if (failedTransactions.length > 0) {
                setStatus(`❌ ${failedTransactions.length} transaction(s) failed.`);
                alert(
                    `⚠️ ${failedTransactions.length} transaction(s) failed to sync:\n\n` +
                    failedTransactions.join('\n') +
                    `\n\nCheck the "Action Required" section on your dashboard — a penalty may have been applied.`
                );
            } else if (successfulTransactions.length > 0) {
                setStatus(`✅ ${successfulTransactions.length} transaction(s) synced successfully.`);
            }

            if (alreadySyncedTransactions.length > 0) {
                console.log('Already synced previously:', alreadySyncedTransactions);
            }

            // Give the user a moment to actually read the status before leaving the page
            setTimeout(() => navigate('/dashboard'), failedTransactions.length > 0 ? 2200 : 800);

        } catch (err) {
            console.error("Full Sync Error:", err);
            const serverMessage = err.response?.data?.message || err.response?.data?.error || err.message;
            alert(`❌ Sync failed: ${serverMessage}`);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F5F7FA', padding: '40px 20px', fontFamily: '-apple-system, sans-serif' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: '#007AFF', border: 'none', fontSize: '17px', fontWeight: '500', cursor: 'pointer', padding: 0, marginBottom: '32px' }}>
                    ← Back to Wallet
                </button>

                <div style={{ background: '#ffffff', padding: '40px 32px', borderRadius: '32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800' }}>Sync Payments</h1>
                    <p style={{ color: '#86868B', marginBottom: '32px' }}>Upload your offline transactions to the blockchain.</p>

                    {status && (
                        <div style={{ padding: '16px', background: status.includes('✅') ? '#E8F5E9' : '#FDEDEC', color: status.includes('❌') ? '#D70015' : '#1D1D1F', borderRadius: '16px', marginBottom: '24px', fontWeight: '600', textAlign: 'center' }}>
                            {status}
                        </div>
                    )}

                    <div style={{ background: '#F5F7FA', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#86868B', textTransform: 'uppercase' }}>Pending Uploads</h3>
                        {pending.length === 0 ? (
                            <p style={{ margin: 0, fontWeight: '600' }}>No pending transactions.</p>
                        ) : (
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {pending.map((txn, i) => (
                                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '16px', borderRadius: '12px' }}>
                                        <span style={{ fontWeight: '600' }}>Merchant {txn.merchantId}</span>
                                        <span style={{ fontWeight: '700', color: '#D70015' }}>-₹{txn.amount.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={pending.length === 0 || syncing}
                        style={{ width: '100%', padding: '18px', background: (pending.length > 0 && !syncing) ? '#1D1D1F' : '#E8EAED', color: (pending.length > 0 && !syncing) ? 'white' : '#A1A1A6', border: 'none', borderRadius: '20px', fontSize: '18px', fontWeight: '700', cursor: (pending.length > 0 && !syncing) ? 'pointer' : 'not-allowed' }}
                    >
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}