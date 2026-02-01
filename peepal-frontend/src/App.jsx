import React, { useState } from 'react';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';


function App() {
  // view: 'landing' | 'signup' | 'verify' | 'dashboard'
  const [view, setView] = useState('landing');
  
  // Stores the UID from Signup to use in Verify and Dashboard
  const [userUid, setUserUid] = useState('');

  // 1. Move from Landing to Signup
  const handleStart = () => {
    setView('signup');
  };

  // 2. Move from Signup to Verify
  const handleSignupSuccess = (uid) => {
    setUserUid(uid);
    setView('verify');
  };

  // 3. Move from Verify to Dashboard
  const handleVerifySuccess = () => {
    setView('dashboard');
  };
  const handleLoginSuccess = (uid) => {
    setUserUid(uid);
    setView('dashboard');
  };
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* LANDING PAGE */}
      {view === 'landing' && (
        <Landing 
          onGetStarted={() => setView('signup')} 
          onLoginClick={() => setView('login')} 
        />
      )}

      {/* SIGNUP FORM */}
      {view === 'signup' && (
        <div className="py-12">
          <Signup onSignupSuccess={handleSignupSuccess} />
          <div className="text-center mt-8">
            <button 
              onClick={() => setView('landing')}
              className="text-slate-400 hover:text-emerald-600 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      )}
      {/* LOGIN FORM */}
      {view === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onBackToLanding={() => setView('landing')} 
        />
      )}
      {/* VERIFICATION GATE */}
      {view === 'verify' && (
        <Verify 
          uid={userUid} 
          onVerificationSuccess={handleVerifySuccess} 
        />
      )}

      {/* DASHBOARD (We will build this file next!) */}
      {view === 'dashboard' && (
        <Dashboard uid={userUid} />
      )}

    </div>
  );
}

export default App;