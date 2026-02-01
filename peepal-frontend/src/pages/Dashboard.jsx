import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ uid }) => {
  // Tabs: personal, family_graph, add_rel, find_rel, create_family, memories
  const [activeTab, setActiveTab] = useState('personal'); 
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for "Find Relation" feature
  const [filterRel, setFilterRel] = useState('Fathers');
  const [filteredList, setFilteredList] = useState([]);

  // States for "Add Relation" form
  const [newRel, setNewRel] = useState({ target_uid: '', relation_type: 'FATHER' });

  const fetchPersonalData = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/dashboard/tree/${uid}`);
      setTreeData(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFindRelations = async (type) => {
    setFilterRel(type);
    try {
      const res = await axios.get(`http://localhost:8000/dashboard/relations/${uid}/${type}`);
      setFilteredList(res.data);
    } catch (err) {
      console.error("Error filtering relations:", err);
    }
  };

  const handleAddRelation = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/dashboard/relate', {
        subject_uid: uid,
        target_uid: newRel.target_uid,
        relation_type: newRel.relation_type
      });
      alert("Relation Linked! Reciprocal connection created.");
      fetchPersonalData(); // Refresh
    } catch (err) {
      alert(err.response?.data?.detail || "Error linking relative");
    }
  };

  useEffect(() => {
    fetchPersonalData();
  }, [uid]);

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-emerald-600">Syncing with Neo4j...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col p-6 shadow-2xl">
        <div className="mb-10">
          <h2 className="text-2xl font-black text-emerald-400">Peepal Panel</h2>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-bold">UID: {uid}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <TabButton id="personal" label="Personal Tree" active={activeTab} setActive={setActiveTab} />
          <TabButton id="family_graph" label="Check Family Tree" active={activeTab} setActive={setActiveTab} />
          <TabButton id="add_rel" label="Add Relation" active={activeTab} setActive={setActiveTab} />
          <TabButton id="find_rel" label="Find Relation" active={activeTab} setActive={setActiveTab} />
          <TabButton id="create_family" label="Create Family" active={activeTab} setActive={setActiveTab} />
          <TabButton id="memories" label="Memories" active={activeTab} setActive={setActiveTab} />
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button onClick={() => window.location.reload()} className="text-slate-400 hover:text-white font-medium text-sm">Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black">{activeTab.replace('_', ' ').toUpperCase()}</h1>
          <p className="text-slate-500 mt-2">Logged in as <strong>{treeData?.name}</strong></p>
        </header>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[60vh]">
          
          {/* PERSONAL TREE */}
          {activeTab === 'personal' && (
            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-xs font-bold text-emerald-600 uppercase mb-4">Direct Parents</h3>
                <div className="space-y-3">
                  {treeData?.parents?.map((p, i) => <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold">{p}</div>)}
                  {treeData?.parents?.length === 0 && <p className="text-slate-400 italic">No parents linked yet.</p>}
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold text-teal-600 uppercase mb-4">Direct Children</h3>
                <div className="space-y-3">
                  {treeData?.children?.map((c, i) => <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold">{c}</div>)}
                  {treeData?.children?.length === 0 && <p className="text-slate-400 italic">No children linked yet.</p>}
                </div>
              </section>
            </div>
          )}

          {/* ADD RELATION */}
          {activeTab === 'add_rel' && (
             <div className="max-w-md">
                <form onSubmit={handleAddRelation} className="space-y-4">
                  <input 
                    placeholder="Relative's UID" 
                    className="w-full border-2 p-4 rounded-xl outline-none focus:border-emerald-500"
                    onChange={(e) => setNewRel({...newRel, target_uid: e.target.value})}
                    required
                  />
                  <select 
  className="w-full border-2 p-4 rounded-xl bg-white outline-none focus:border-emerald-500"
  value={newRel.relation_type} // Add this line to bind the value!
  onChange={(e) => setNewRel({...newRel, relation_type: e.target.value})}
>
  <option value="FATHER">FATHER</option>
  <option value="MOTHER">MOTHER</option>
  <option value="SPOUSE">SPOUSE</option>
  <option value="CHILD">CHILD</option>
</select>
                  <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all">Establish Link</button>
                </form>
             </div>
          )}

          {/* FIND RELATION */}
          {activeTab === 'find_rel' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <p className="font-bold text-slate-600">Filter by type:</p>
                <select 
                  className="border-2 p-3 rounded-xl bg-white font-bold text-emerald-600"
                  value={filterRel}
                  onChange={(e) => handleFindRelations(e.target.value)}
                >
                  <option value="Fathers">Father Of</option>
                  <option value="Mothers">Mother Of</option>
                  <option value="Children">Child Of</option>
                  <option value="Spouses">Spouse Of</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredList.map((rel, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-lg font-black">{rel.name}</p>
                    <p className="text-sm text-slate-400 font-mono">{rel.uid}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAMILY TREE GRAPH PORTRAYAL */}
          {activeTab === 'family_graph' && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 text-3xl">🌐</div>
              <h3 className="text-xl font-bold">Interactive Graph View</h3>
              <p className="text-slate-500 max-w-sm mt-2">Ready to implement <strong>NeoVis.js</strong> here.</p>
            </div>
          )}

          {/* CREATE FAMILY */}
          {activeTab === 'create_family' && (
            <div className="space-y-6">
              <input placeholder="Family Name (e.g., The Peepals)" className="w-full border-2 p-4 rounded-xl outline-none" />
              <div className="border rounded-xl p-4 space-y-2 max-h-60 overflow-y-auto">
                <h4 className="font-bold text-sm mb-4">Select Relations:</h4>
                {[...(treeData?.parents || []), ...(treeData?.children || [])].map((name, i) => (
                  <label key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                    <input type="checkbox" className="w-5 h-5 accent-emerald-600" />
                    <span className="font-medium">{name}</span>
                  </label>
                ))}
              </div>
              <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Create Group</button>
            </div>
          )}

          {/* MEMORIES */}
          {activeTab === 'memories' && (
            <div className="grid md:grid-cols-2 h-[50vh] gap-8">
              <div className="border-r pr-8 flex flex-col items-center justify-center">
                <p className="text-slate-400 italic">No media uploaded yet.</p>
                <button className="mt-4 text-emerald-600 font-bold">+ Upload Media</button>
              </div>
              <div className="flex flex-col h-full bg-slate-50 rounded-2xl p-6">
                <div className="flex-1 overflow-y-auto text-slate-400 text-center italic mt-20">Family chat will appear here...</div>
                <input placeholder="Type a message..." className="border p-4 rounded-xl mt-4 bg-white" />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

const TabButton = ({ id, icon, label, active, setActive }) => (
  <button 
    onClick={() => setActive(id)}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
      active === id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800'
    }`}
  >
    <span>{icon}</span> {label}
  </button>
);

export default Dashboard;