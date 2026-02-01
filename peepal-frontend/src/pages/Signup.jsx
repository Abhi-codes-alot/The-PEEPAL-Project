import React, { useState } from 'react';
import axios from 'axios';

const SignupForm = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    uid: '', name: '', gender: 'Male', age: '', residence: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // The actual bridge to your FastAPI backend
      const response = await axios.post('http://localhost:8000/auth/signup', {
        ...formData,
        age: parseInt(formData.age) // Ensure age is an integer for the backend
      });
      
      if (response.status === 201) {
        alert("Success! Profile created in Neo4j.");
        onSignupSuccess(formData.uid); // Pass UID to next step (Verification)
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Join the Tree</h2>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-row gap-4 flex flex-col">
        <input 
          placeholder="Unique ID (e.g. abhi_01)" 
          className="border p-3 rounded-lg"
          onChange={(e) => setFormData({...formData, uid: e.target.value})}
          required
        />
        <input 
          placeholder="Full Name" 
          className="border p-3 rounded-lg"
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <select 
          className="border p-3 rounded-lg bg-white"
          onChange={(e) => setFormData({...formData, gender: e.target.value})}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input 
          type="number" placeholder="Age" 
          className="border p-3 rounded-lg"
          onChange={(e) => setFormData({...formData, age: e.target.value})}
          required
        />
        <input 
          placeholder="Residence (City)" 
          className="border p-3 rounded-lg"
          onChange={(e) => setFormData({...formData, residence: e.target.value})}
          required
        />
        <input 
          placeholder="Phone Number" 
          className="border p-3 rounded-lg"
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
        <button 
          disabled={loading}
          className="bg-emerald-600 text-white p-3 rounded-lg font-bold hover:bg-emerald-700 disabled:bg-slate-300"
        >
          {loading ? "Creating Node..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;