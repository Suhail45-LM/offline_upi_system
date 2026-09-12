import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function History() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/transaction/my-transactions')
            .then(res => {
                setTransactions(Array.isArray(res.data) ? res.data : []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#F5F7FA', padding: '40px 20px', fontFamily: '-apple-system, sans-serif' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: '#007AFF', border: 'none', fontSize: '17px', fontWeight: '500', cursor: 'pointer', padding: 0, marginBottom: '32px' }}>
                    ← Back to Wallet
                </button>

                <h1 style={{ margin: '0 0 24px 0', fontSize: '32px', fontWeight: '800' }}>Transaction History</h1>

                {loading ? (
                    <p style={{ fontWeight: '600', color: '#86868B' }}>Loading records...</p>
                ) : transactions.length === 0 ? (
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', color: '#86868B' }}>
                        No transactions found.
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '32px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {transactions.map((txn, index) => (
                                <li key={txn.id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: index === transactions.length - 1 ? 'none' : '1px solid #F2F2F7' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontWeight: '700', fontSize: '16px' }}>
                                            {txn.type || 'OFFLINE_PAYMENT'}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#86868B' }}>
                                            {new Date(txn.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <span style={{ fontWeight: '700', fontSize: '18px', color: txn.type === 'DEPOSIT' ? '#34C759' : '#1D1D1F' }}>
                                        {txn.type === 'DEPOSIT' ? '+' : '-'}₹{Number(txn.amount || 0).toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}