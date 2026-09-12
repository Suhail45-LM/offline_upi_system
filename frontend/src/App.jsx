import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment.jsx';
import Passbook from './pages/Passbook';
import Scan from './pages/Scan';
import Sync from './pages/Sync';
import History from './pages/History';
import Mpin from './pages/Mpin';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/sync" element={<Sync />} />
                <Route path="/history" element={<History />} />
                <Route path="/scan" element={<Scan />} />
                <Route path="/mpin" element={<Mpin />} />
                <Route path="/passbook" element={<Passbook />} /> {/* <-- ADD ROUTE */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;