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
} from "recharts";

function PrettyCard({ children, title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6 hover:shadow-cyan-300/20 hover:scale-[1.01] transition-all duration-300"
    >
      <h3 className="text-lg font-semibold text-white/90 mb-3 tracking-wide">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

export default function App() {
  const [mode, setMode] = useState("contract");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Contract input defaults
  const [contractInputs, setContractInputs] = useState({
    materials: [
      { name: "Cement", amount: 5500000 },
      { name: "Steel", amount: 1500000 },
    ],
    wages: [{ name: "Masons", amount: 2500000 }],
    expenses: [{ name: "Machinery Hire", amount: 1000000 }],
    overheads: [{ name: "Site Overheads", amount: 700000 }],
    contractPrice: 25000000,
    workCertified: 18000000,
    cashReceived: 15000000,
    retentionPercent: 10,
    escalationPercent: 5,
    materialsIncreasePercent: 5,
  });

  // Job input defaults
  const [jobInputs, setJobInputs] = useState({
    modules: [
      {
        name: "Attendance",
        materials: [{ name: "License", amount: 45000 }],
        labour: [{ name: "Dev", amount: 300000 }],
        expenses: [{ name: "Hosting", amount: 50000 }],
        factoryOverheadPercent: 10,
        adminOverheadPercent: 5,
        profitPercent: 20,
      },
      {
        name: "FeeMgmt",
        materials: [{ name: "License", amount: 55000 }],
        labour: [{ name: "Dev", amount: 350000 }],
        expenses: [{ name: "APIs", amount: 60000 }],
        factoryOverheadPercent: 10,
        adminOverheadPercent: 5,
        profitPercent: 20,
      },
    ],
  });

  // Simulation function
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

  const chartData = result
    ? [
        {
          name: "PrimeCost",
          value:
            result.primeCost ||
            result.breakdown?.reduce((s, b) => s + b.totalCost, 0) ||
            0,
        },
        { name: "WorksCost", value: result.worksCost || 0 },
        { name: "Escalation", value: result.materialEscalation || 0 },
        { name: "NotionalProfit", value: result.notionalProfit || 0 },
        { name: "RecognisedProfit", value: result.recognisedProfit || 0 },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Costing Simulator
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Compare Contract vs Job Costing — visualize, simulate & analyze
              profitability
            </p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === "contract"
                  ? "bg-cyan-500 text-white shadow-md"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
              onClick={() => setMode("contract")}
            >
              Contract
            </button>
            <button
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === "job"
                  ? "bg-cyan-500 text-white shadow-md"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
              onClick={() => setMode("job")}
            >
              Job (IT)
            </button>
          </div>
        </motion.header>

        {/* Main grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <PrettyCard
              title={mode === "contract" ? "Contract Inputs" : "Job Inputs"}
            >
              {mode === "contract" ? (
                <div className="space-y-3">
                  <label className="block text-sm">Contract Price</label>
                  <input
                    type="number"
                    value={contractInputs.contractPrice}
                    onChange={(e) =>
                      setContractInputs({
                        ...contractInputs,
                        contractPrice: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 rounded-md bg-slate-900/50 border border-slate-700 text-white"
                  />

                  <label className="block text-sm mt-2">Work Certified</label>
                  <input
                    type="number"
                    value={contractInputs.workCertified}
                    onChange={(e) =>
                      setContractInputs({
                        ...contractInputs,
                        workCertified: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 rounded-md bg-slate-900/50 border border-slate-700 text-white"
                  />

                  <label className="block text-sm mt-2">Cash Received</label>
                  <input
                    type="number"
                    value={contractInputs.cashReceived}
                    onChange={(e) =>
                      setContractInputs({
                        ...contractInputs,
                        cashReceived: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 rounded-md bg-slate-900/50 border border-slate-700 text-white"
                  />

                  <div className="mt-4">
                    <h4 className="font-medium mb-1 text-cyan-300">
                      Materials (Sample)
                    </h4>
                    {contractInputs.materials.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2 items-center mt-2 text-sm"
                      >
                        <input
                          className="flex-1 p-2 bg-slate-900/50 border border-slate-700 rounded-md text-white"
                          value={m.name}
                          onChange={(e) => {
                            const arr = [...contractInputs.materials];
                            arr[idx].name = e.target.value;
                            setContractInputs({
                              ...contractInputs,
                              materials: arr,
                            });
                          }}
                        />
                        <input
                          type="number"
                          className="w-40 p-2 bg-slate-900/50 border border-slate-700 rounded-md text-white"
                          value={m.amount}
                          onChange={(e) => {
                            const arr = [...contractInputs.materials];
                            arr[idx].amount = Number(e.target.value);
                            setContractInputs({
                              ...contractInputs,
                              materials: arr,
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {jobInputs.modules.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-slate-700 rounded-xl mb-3 bg-slate-900/40"
                    >
                      <h4 className="font-semibold text-cyan-300 mb-1">
                        Module: {m.name}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <label>Labour (₹)</label>
                        <input
                          type="number"
                          value={m.labour[0].amount}
                          onChange={(e) => {
                            const arr = [...jobInputs.modules];
                            arr[idx].labour[0].amount = Number(e.target.value);
                            setJobInputs({ modules: arr });
                          }}
                          className="p-2 bg-slate-900/50 border border-slate-700 rounded-md text-white"
                        />
                        <label>Materials (₹)</label>
                        <input
                          type="number"
                          value={m.materials[0].amount}
                          onChange={(e) => {
                            const arr = [...jobInputs.modules];
                            arr[idx].materials[0].amount = Number(
                              e.target.value
                            );
                            setJobInputs({ modules: arr });
                          }}
                          className="p-2 bg-slate-900/50 border border-slate-700 rounded-md text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  onClick={runSim}
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md text-white font-medium hover:scale-105 transition-transform"
                >
                  {loading ? "Running..." : "Run Simulation"}
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(
                        {
                          mode,
                          inputs:
                            mode === "contract" ? contractInputs : jobInputs,
                          result,
                        },
                        null,
                        2
                      )
                    );
                    alert("Copied JSON to clipboard");
                  }}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-md font-medium text-slate-100"
                >
                  Copy JSON
                </button>
              </div>
            </PrettyCard>

            {/* Results */}
            <PrettyCard title="Result Visualization">
              {result ? (
                <>
                  <pre className="text-xs max-h-64 overflow-auto bg-slate-900/50 border border-slate-700 p-3 rounded-lg text-cyan-200">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                  <div className="h-72 mt-5">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#06b6d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 text-sm">
                  No results yet — run a simulation.
                </p>
              )}
            </PrettyCard>
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            <PrettyCard title="Notes & Quick Actions">
              <ul className="text-sm text-slate-300 space-y-2 leading-relaxed">
                <li>• Backend runs at http://localhost:4000</li>
                <li>• Edit inputs to match your project values</li>
                <li>• Copy JSON to include results in your report</li>
                <li>• Download results for documentation</li>
              </ul>
            </PrettyCard>

            <PrettyCard title="Export Options">
              <button
                onClick={() => {
                  const blob = new Blob(
                    [
                      JSON.stringify(
                        {
                          mode,
                          inputs:
                            mode === "contract" ? contractInputs : jobInputs,
                          result,
                        },
                        null,
                        2
                      ),
                    ],
                    { type: "application/json" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "costing-report.json";
                  a.click();
                }}
                className="w-full py-2 rounded-md bg-gradient-to-r from-emerald-500 to-green-500 font-semibold text-white hover:scale-105 transition-transform"
              >
                Download JSON
              </button>
            </PrettyCard>
          </div>
        </div>

        <footer className="mt-8 text-xs text-slate-500 text-center">
          Built with ❤️ for PBL Cost Accounting • Developed by Ansh Mishra &
          Team
        </footer>
      </div>
    </div>
  );
}
