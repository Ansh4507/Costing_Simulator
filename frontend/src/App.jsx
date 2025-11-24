import React, { useState } from "react";
import { motion } from "framer-motion";
import { postJson } from "./api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

function PrettyCard({ children, title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6 hover:shadow-cyan-300/20 transition-all duration-300"
    >
      <h3 className="text-lg font-semibold text-white/90 mb-3 tracking-wide border-b border-white/10 pb-2">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

// Helper component for dynamic input lists
function DynamicInputList({ items, onChange, title }) {
  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2 text-cyan-300 text-sm uppercase tracking-wider">
        {title}
      </h4>
      {items.map((m, idx) => (
        <div key={idx} className="flex gap-2 items-center mb-2 text-sm">
          <input
            className="flex-1 p-2 bg-slate-900/50 border border-slate-700 rounded-md text-white focus:border-cyan-500 outline-none transition-colors"
            placeholder="Item Name"
            value={m.name}
            onChange={(e) => {
              const newItems = [...items];
              newItems[idx].name = e.target.value;
              onChange(newItems);
            }}
          />
          <input
            type="number"
            className="w-32 p-2 bg-slate-900/50 border border-slate-700 rounded-md text-white focus:border-cyan-500 outline-none transition-colors"
            placeholder="Amount"
            value={m.amount}
            onChange={(e) => {
              const newItems = [...items];
              newItems[idx].amount = Number(e.target.value);
              onChange(newItems);
            }}
          />
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { name: "", amount: 0 }])}
        className="text-xs text-slate-400 hover:text-cyan-300 underline"
      >
        + Add Item
      </button>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("contract");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 1. Updated Contract Inputs to match new Server Logic
  const [contractInputs, setContractInputs] = useState({
    contractPrice: 25000000,
    workCertified: 18000000,
    cashReceived: 15000000,
    retentionPercent: 10,
    escalationPercent: 5,
    materialsIncreasePercent: 5,
    materials: [
      { name: "Cement", amount: 5500000 },
      { name: "Steel", amount: 1500000 },
    ],
    wages: [{ name: "Masons", amount: 2500000 }],
    expenses: [{ name: "Machinery Hire", amount: 1000000 }],
    factoryOverheads: [{ name: "Site Power", amount: 200000 }],
    adminOverheads: [{ name: "Office Staff", amount: 150000 }],
    sellingOverheads: [{ name: "Marketing", amount: 50000 }],
  });

  // Job input defaults
  const [jobInputs, setJobInputs] = useState({
    modules: [
      {
        name: "Attendance",
        materials: [{ name: "License", amount: 45000 }],
        labour: [{ name: "Dev Team", amount: 300000 }],
        expenses: [{ name: "Hosting", amount: 50000 }],
        factoryOverheadPercent: 10,
        adminOverheadPercent: 5,
        profitPercent: 20,
      },
      {
        name: "FeeMgmt",
        materials: [{ name: "License", amount: 55000 }],
        labour: [{ name: "Dev Team", amount: 350000 }],
        expenses: [{ name: "APIs", amount: 60000 }],
        factoryOverheadPercent: 10,
        adminOverheadPercent: 5,
        profitPercent: 20,
      },
    ],
  });

  async function runSim() {
    setLoading(true);
    try {
      const url =
        mode === "contract"
          ? "http://localhost:4000/api/simulate/contract"
          : "http://localhost:4000/api/simulate/job";

      const data = mode === "contract" ? contractInputs : jobInputs;
      const res = await postJson(url, data);
      setResult(res.result);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  // --- FIXED CHART DATA LOGIC ---
  const chartData = result
    ? [
        {
          name: "Prime Cost",
          value:
            mode === "contract"
              ? result.breakdown?.primeCost || 0
              : result.breakdown?.reduce((s, b) => s + b.primeCost, 0) || 0,
        },
        {
          name: "Works Cost",
          value:
            mode === "contract"
              ? result.breakdown?.worksCost || 0
              : result.breakdown?.reduce((s, b) => s + b.worksCost, 0) || 0,
        },
        {
          name: "Prod. Cost",
          value:
            mode === "contract"
              ? result.breakdown?.costOfProduction || 0
              : result.breakdown?.reduce((s, b) => s + b.costOfProduction, 0) || 0,
        },
        {
          name: "Total Cost",
          value:
            mode === "contract"
              ? result.breakdown?.costOfSales || 0
              : result.grandTotal || 0,
        },
        {
          name: "Profit",
          value:
            mode === "contract"
              ? result.contractMetrics?.recognisedProfit || 0
              : (result.grandPrice - result.grandTotal) || 0,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-800"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Cost Sheet Simulator
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Standard Cost Accounting (Prime → Works → Production → Sales)
            </p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0 bg-slate-900 p-1 rounded-full border border-slate-800">
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "contract"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => {
                setMode("contract");
                setResult(null);
              }}
            >
              Contract
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "job"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => {
                setMode("job");
                setResult(null);
              }}
            >
              Job (IT)
            </button>
          </div>
        </motion.header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* INPUT PANEL (Left - 4 cols) */}
          <div className="lg:col-span-4 space-y-6 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            <PrettyCard
              title={mode === "contract" ? "Contract Data" : "Job Modules"}
            >
              {mode === "contract" ? (
                <div className="space-y-4">
                  {/* Basic Contract Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400">Contract Price</label>
                      <input
                        type="number"
                        value={contractInputs.contractPrice}
                        onChange={(e) =>
                          setContractInputs({ ...contractInputs, contractPrice: Number(e.target.value) })
                        }
                        className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Work Certified</label>
                      <input
                        type="number"
                        value={contractInputs.workCertified}
                        onChange={(e) =>
                          setContractInputs({ ...contractInputs, workCertified: Number(e.target.value) })
                        }
                        className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Cash Received</label>
                      <input
                        type="number"
                        value={contractInputs.cashReceived}
                        onChange={(e) =>
                          setContractInputs({ ...contractInputs, cashReceived: Number(e.target.value) })
                        }
                        className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Escalation %</label>
                      <input
                        type="number"
                        value={contractInputs.materialsIncreasePercent}
                        onChange={(e) =>
                          setContractInputs({ ...contractInputs, materialsIncreasePercent: Number(e.target.value) })
                        }
                        className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Dynamic Cost Lists */}
                  <DynamicInputList
                    title="Direct Materials"
                    items={contractInputs.materials}
                    onChange={(items) => setContractInputs({ ...contractInputs, materials: items })}
                  />
                  <DynamicInputList
                    title="Direct Wages"
                    items={contractInputs.wages}
                    onChange={(items) => setContractInputs({ ...contractInputs, wages: items })}
                  />
                  <DynamicInputList
                    title="Direct Expenses"
                    items={contractInputs.expenses}
                    onChange={(items) => setContractInputs({ ...contractInputs, expenses: items })}
                  />
                  
                  {/* NEW INPUTS FOR COST SHEET HIERARCHY */}
                  <div className="pt-4 border-t border-slate-700">
                    <DynamicInputList
                      title="Factory Overheads"
                      items={contractInputs.factoryOverheads}
                      onChange={(items) => setContractInputs({ ...contractInputs, factoryOverheads: items })}
                    />
                    <DynamicInputList
                      title="Admin Overheads"
                      items={contractInputs.adminOverheads}
                      onChange={(items) => setContractInputs({ ...contractInputs, adminOverheads: items })}
                    />
                    <DynamicInputList
                      title="Selling Overheads"
                      items={contractInputs.sellingOverheads}
                      onChange={(items) => setContractInputs({ ...contractInputs, sellingOverheads: items })}
                    />
                  </div>
                </div>
              ) : (
                /* JOB MODE INPUTS */
                <div>
                  {jobInputs.modules.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-slate-700 rounded-xl mb-4 bg-slate-900/40 relative group"
                    >
                      <h4 className="font-semibold text-cyan-300 mb-2 border-b border-slate-700 pb-1">
                        {m.name}
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                         {/* Simplify input for demo - usually you'd want full lists here too */}
                         <div>
                            <label>Labour Cost</label>
                            <input
                              type="number"
                              value={m.labour[0]?.amount}
                              onChange={(e) => {
                                const arr = [...jobInputs.modules];
                                arr[idx].labour[0].amount = Number(e.target.value);
                                setJobInputs({ modules: arr });
                              }}
                              className="w-full p-1 bg-slate-800 rounded border border-slate-700"
                            />
                         </div>
                         <div>
                            <label>Material Cost</label>
                            <input
                              type="number"
                              value={m.materials[0]?.amount}
                              onChange={(e) => {
                                const arr = [...jobInputs.modules];
                                arr[idx].materials[0].amount = Number(e.target.value);
                                setJobInputs({ modules: arr });
                              }}
                              className="w-full p-1 bg-slate-800 rounded border border-slate-700"
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Factory OH %</span>
                          <input 
                            type="number" 
                            className="w-12 bg-slate-800 text-center rounded"
                            value={m.factoryOverheadPercent}
                            onChange={(e)=>{
                                const arr = [...jobInputs.modules];
                                arr[idx].factoryOverheadPercent = Number(e.target.value);
                                setJobInputs({ modules: arr });
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Admin OH %</span>
                          <input 
                            type="number" 
                            className="w-12 bg-slate-800 text-center rounded"
                            value={m.adminOverheadPercent}
                            onChange={(e)=>{
                                const arr = [...jobInputs.modules];
                                arr[idx].adminOverheadPercent = Number(e.target.value);
                                setJobInputs({ modules: arr });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-700 sticky bottom-0 bg-[#0f172a] pb-2">
                <button
                  onClick={runSim}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-bold shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? "Calculating..." : "Calculate Cost Sheet"}
                </button>
              </div>
            </PrettyCard>
          </div>

          {/* RESULTS PANEL (Right - 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <PrettyCard title="Cost Analysis">
              {result ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(val)=> `₹${val/100000}L`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                        cursor={{fill: '#334155', opacity: 0.4}}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Amount (₹)" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-slate-500 italic border-2 border-dashed border-slate-800 rounded-xl">
                  Run a simulation to see the Cost Sheet visualization
                </div>
              )}
            </PrettyCard>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PrettyCard title="Key Figures">
                 {result ? (
                    <div className="space-y-3">
                        {mode === "contract" ? (
                            <>
                                <div className="flex justify-between p-2 bg-slate-800 rounded">
                                    <span className="text-slate-400">Prime Cost</span>
                                    <span className="font-mono text-cyan-300">₹{result.breakdown.primeCost?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-800 rounded">
                                    <span className="text-slate-400">Works Cost</span>
                                    <span className="font-mono text-cyan-300">₹{result.breakdown.worksCost?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-800 rounded">
                                    <span className="text-slate-400">Notional Profit</span>
                                    <span className="font-mono text-green-400">₹{result.contractMetrics.notionalProfit?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-800 rounded border border-green-500/30">
                                    <span className="text-white font-semibold">Recognised Profit</span>
                                    <span className="font-mono text-green-400 font-bold">₹{result.contractMetrics.recognisedProfit?.toLocaleString()}</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-4">
                                <p className="text-slate-400">Total Project Cost</p>
                                <p className="text-3xl text-cyan-400 font-bold mt-2">₹{result.grandTotal?.toLocaleString()}</p>
                                <p className="text-sm text-green-400 mt-1">Selling Price: ₹{result.grandPrice?.toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                 ) : (
                    <p className="text-slate-500 text-sm">Waiting for data...</p>
                 )}
              </PrettyCard>

              <PrettyCard title="Export / Actions">
                <div className="space-y-3">
                   <p className="text-xs text-slate-400 leading-relaxed">
                      This simulation uses the standard Cost Sheet format. Ensure you have input all indirect expenses in their respective overhead categories for accurate Cost of Production calculation.
                   </p>
                   <button
                    onClick={() => {
                        const blob = new Blob([JSON.stringify({mode, inputs: mode==="contract"?contractInputs:jobInputs, result}, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `cost-sheet-${mode}-${Date.now()}.json`;
                        a.click();
                    }}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors"
                   >
                     Download JSON Report
                   </button>
                </div>
              </PrettyCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}