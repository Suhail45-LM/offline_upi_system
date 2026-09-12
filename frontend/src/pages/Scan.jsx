import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

export default function Scan() {
    const navigate = useNavigate();

    const handleScan = (data) => {
        if (!data) return;

        let scannedId = '';

        // Safely extract the ID no matter what version of the library you have installed
        if (typeof data === 'string') {
            scannedId = data;
        } else if (Array.isArray(data) && data.length > 0) {
            scannedId = data[0].rawValue || data[0].text; // Handles v2.0+
        } else if (data.rawValue || data.text) {
            scannedId = data.rawValue || data.text; // Handles v1.0 objects
        }

        if (scannedId) {
            navigate('/payment', { state: { scannedMerchantId: scannedId } });
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000000',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}>
            {/* Header */}
            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: '#007AFF', border: 'none', fontSize: '17px', cursor: 'pointer' }}>Cancel</button>
                <span style={{ fontSize: '17px', fontWeight: '600' }}>Scan to Pay</span>
                <div style={{ width: '55px' }}></div> {/* Spacer for centering */}
            </div>

            {/* Camera Viewfinder */}
            <div style={{
                width: '100%',
                maxWidth: '400px',
                borderRadius: '32px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
                <Scanner
                    onScan={(result) => handleScan(result)}
                    onResult={(text) => handleScan(text)}
                    onError={(error) => console.log(error?.message)}
                />
            </div>

            <p style={{ marginTop: '40px', color: '#86868B', textAlign: 'center', fontSize: '15px' }}>
                Align the merchant's QR code within the frame.<br/>It will scan automatically.
            </p>
        </div>
    );
}