const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Helper: Sum helper for arrays
const sumItems = (arr) => (arr || []).reduce((s, i) => s + (Number(i.amount) || 0), 0);

function contractCosting(payload) {
  const {
    materials, wages, expenses,              // Direct Costs
    factoryOverheads,                        // Factory/Works Overheads
    adminOverheads,                          // Office/Admin Overheads
    sellingOverheads,                        // Selling & Dist. Overheads
    contractPrice, workCertified, cashReceived, 
    retentionPercent, escalationPercent, materialsIncreasePercent
  } = payload;

  // 1. Prime Cost (Direct Material + Direct Labour + Direct Expenses)
  const directMaterials = sumItems(materials);
  const directWages = sumItems(wages);
  const directExpenses = sumItems(expenses);
  const primeCost = directMaterials + directWages + directExpenses;

  // 2. Factory Cost / Works Cost (Prime Cost + Factory Overheads)
  const factoryOverheadTotal = sumItems(factoryOverheads);
  // Note: In a full sheet, you would adjust for Opening/Closing WIP here. 
  // We assume Work Certified covers the output value, but for Costing side:
  const worksCost = primeCost + factoryOverheadTotal;

  // 3. Cost of Production (Works Cost + Admin Overheads)
  const adminOverheadTotal = sumItems(adminOverheads);
  const costOfProduction = worksCost + adminOverheadTotal;

  // 4. Cost of Sales / Total Cost (CoP + Selling Overheads)
  const sellingOverheadTotal = sumItems(sellingOverheads);
  const costOfSales = costOfProduction + sellingOverheadTotal;

  // --- Contract Specific Calculations ---
  
  // Escalation Logic
  const materialEscalation = directMaterials * ((materialsIncreasePercent || 0) / 100);

  // Profit Logic
  // Notional Profit = Value of Work (Work Certified) - Cost Incurred up to date
  // For safety, we usually use Works Cost or Total Cost depending on policy. 
  // Here we use Cost of Production as the basis for cost incurred.
  const notionalProfit = Math.max(0, (workCertified || 0) - costOfProduction);

  // Retention Money
  const retentionMoney = (workCertified * ((retentionPercent || 0) / 100));

  // Recognised Profit (Standard Formula: NP * 2/3 * Cash/Certified)
  const recognisedProfit = Math.round(notionalProfit * (2 / 3) * ((cashReceived || 0) / (workCertified || 1)));

  return {
    breakdown: {
      directMaterials,
      directWages,
      directExpenses,
      primeCost,            // Step 1
      factoryOverheadTotal,
      worksCost,            // Step 2
      adminOverheadTotal,
      costOfProduction,     // Step 3
      sellingOverheadTotal,
      costOfSales           // Step 4 (Total Cost)
    },
    contractMetrics: {
      materialEscalation,
      notionalProfit,
      retentionMoney,
      recognisedProfit
    }
  };
}

function jobCosting(payload) {
  const modules = payload.modules || [];

  const breakdown = modules.map(m => {
    // 1. Prime Cost
    const directMaterial = sumItems(m.materials);
    const directLabour = sumItems(m.labour);
    const directExpenses = sumItems(m.expenses);
    const primeCost = directMaterial + directLabour + directExpenses;

    // 2. Factory Cost
    // If percent is provided, calc based on Prime Cost, else use raw amount if you add that feature later
    const factoryOverhead = m.factoryOverheadPercent 
      ? primeCost * (m.factoryOverheadPercent / 100) 
      : 0;
    const worksCost = primeCost + factoryOverhead;

    // 3. Cost of Production
    const adminOverhead = m.adminOverheadPercent 
      ? worksCost * (m.adminOverheadPercent / 100) 
      : 0;
    const costOfProduction = worksCost + adminOverhead;

    // 4. Total Cost (Cost of Sales)
    // Assuming Selling overhead is 0 for internal IT jobs usually, but adding for consistency
    const sellingOverhead = m.sellingOverheadPercent 
      ? costOfProduction * (m.sellingOverheadPercent / 100) 
      : 0;
    const totalCost = costOfProduction + sellingOverhead;

    // Profit & Price
    const profit = m.profitPercent ? totalCost * (m.profitPercent / 100) : 0;
    const sellingPrice = totalCost + profit;

    return {
      name: m.name,
      directMaterial,
      directLabour,
      directExpenses,
      primeCost,
      factoryOverhead,
      worksCost,
      adminOverhead,
      costOfProduction,
      sellingOverhead,
      totalCost,
      profit,
      sellingPrice
    };
  });

  const grandTotal = breakdown.reduce((s, b) => s + b.totalCost, 0);
  const grandPrice = breakdown.reduce((s, b) => s + b.sellingPrice, 0);

  return { breakdown, grandTotal, grandPrice };
}

// --- API Endpoints ---

app.post('/api/simulate/contract', (req, res) => {
  try {
    const result = contractCosting(req.body);
    res.json({ ok: true, result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/simulate/job', (req, res) => {
  try {
    const result = jobCosting(req.body);
    res.json({ ok: true, result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Costing simulator backend running on ${PORT}`));