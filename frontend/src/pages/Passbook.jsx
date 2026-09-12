// src/pages/Passbook.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Passbook() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {

                const response = await api.get('/transactions/history');
                setTransactions(response.data);
            } catch (err) {
                setError('Failed to load transaction history.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>My Passbook</h2>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Back
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {loading ? (
                <p>Loading transactions...</p>
            ) : transactions.length === 0 ? (
                <div style={{ background: '#f8f9fa', padding: '20px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <p>No transactions found. Start making payments!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    {transactions.map((txn) => (
                        <div key={txn.transactionId} style={{
                            background: '#fff', padding: '15px', borderRadius: '8px',
                            border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>Paid to: {txn.merchantName || 'Merchant'}</h4>
                                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>ID: {txn.transactionId}</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
                                    {new Date(txn.timestamp).toLocaleString()} • {txn.paymentMode}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h3 style={{ margin: '0', color: '#dc3545' }}>- ₹{txn.amount.toFixed(2)}</h3>
                                <span style={{
                                    fontSize: '11px', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold',
                                    background: txn.status === 'SUCCESS' ? '#d4edda' : '#f8d7da',
                                    color: txn.status === 'SUCCESS' ? '#155724' : '#721c24'
                                }}>
                                    {txn.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}