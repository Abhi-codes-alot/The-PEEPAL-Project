import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess, onBackToLanding }) => {
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Attempt to fetch the user's data from the backend
      const response = await axios.get(`http://localhost:8000/dashboard/tree/${uid}`);
      
      console.log("Login Response Data:", response.data); // Helpful for debugging

      // Step 2: If the backend returns a 200 OK, the user exists
      if (response.status === 200) {
        onLoginSuccess(uid);
      }
    } catch (err) {
      // Step 3: Handle specific error codes from FastAPI
      console.error("Login Error Object:", err);

      if (err.response?.status === 404) {
        setError("User ID not found. Did you verify your account?");
      } else if (err.response?.status === 422) {
        setError("Invalid ID format. Please check your UID.");
      } else {
        setError("Network error: Is your FastAPI server running at port 8000?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 font-medium">Log in to view your family graph.</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-sm border border-red-100 font-medium animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
              Your Unique ID
            </label>
            <input 
              type="text" 
              placeholder="e.g. abhi_01" 
              className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all text-lg font-medium"
              onChange={(e) => setUid(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-100 active:scale-95 transition-all disabled:bg-slate-200"
          >
            {loading ? "Checking Roots..." : "Enter Dashboard"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={onBackToLanding}
            className="text-slate-400 font-semibold hover:text-emerald-600 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;