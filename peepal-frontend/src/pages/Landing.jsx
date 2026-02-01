import React from 'react';

const LandingPage = ({ onGetStarted, onLoginClick }) => {
  return (
    <div className="bg-white min-h-screen text-slate-900">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="text-2xl font-bold text-emerald-600">Peepal Project</div>
        
        {/* ADD THE onClick HERE */}
        <button 
          onClick={onLoginClick} 
          className="px-5 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-all font-medium">
          Log In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-6xl font-extrabold tracking-tight mb-8">
          The Future of Your <span className="text-emerald-600">Ancestry.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Move beyond lists and static trees. The Peepal Project uses graph database technology 
          to map complex family dynamics, verify legacies, and connect your living roots.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onGetStarted}
            className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-200"
          >
            Start Your Tree
          </button>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { title: "Graph Powered", desc: "Relationships are nodes and links, not rows in a spreadsheet." },
            { title: "Legacy Vouching", desc: "A consensus-based system to honor and verify deceased relatives." },
            { title: "Smart Dashboard", desc: "Manage your residence, verify your identity, and grow your network." }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;