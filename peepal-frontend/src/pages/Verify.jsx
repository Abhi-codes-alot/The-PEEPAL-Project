import React, { useState } from 'react';
import axios from 'axios';

const VerifyAccount = ({ uid, onVerificationSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      // Calling your FastAPI verify endpoint
      const response = await axios.post(`http://localhost:8000/auth/verify?uid=${uid}&code=${code}`);
      
      if (response.status === 200) {
        onVerificationSuccess(); // Trigger the move to Dashboard
      }
    } catch (err) {
      alert("Verification failed. Make sure the backend is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Ref-Code-Placeholder" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Activate Your Profile</h2>
        <p className="text-slate-500 mb-8">Enter any 4-digit code to verify your account for UID: <strong>{uid}</strong></p>
        
        <input 
          type="text" 
          placeholder="0000"
          className="text-center text-2xl tracking-widest border-2 border-slate-200 p-4 rounded-xl w-full mb-6 focus:border-emerald-500 outline-none"
          onChange={(e) => setCode(e.target.value)}
        />

        <button 
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:bg-slate-300"
        >
          {loading ? "Activating..." : "Verify & Enter Dashboard"}
        </button>
      </div>
    </div>
  );
};

export default VerifyAccount;