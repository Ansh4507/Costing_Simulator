const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Utility functions for calculations
function classifyCostsLineItems(items) {
  // items: [{name, amount, typeDirect:boolean, fixed:boolean, controllable:boolean, centre}]
  const summary = {
    direct: 0,
    indirect: 0,
    fixed: 0,
    variable: 0,
    controllable: 0,
    uncontrollable: 0
  };
  items.forEach(it => {
    if (it.typeDirect) summary.direct += it.amount;
    else summary.indirect += it.amount;
    if (it.fixed) summary.fixed += it.amount;
    else summary.variable += it.amount;
    if (it.controllable) summary.controllable += it.amount;
    else summary.uncontrollable += it.amount;
  });
  return summary;
}

function contractCosting(payload) {
  // payload contains: materials, wages, expenses, overheads, contractPrice, workCertified, cashReceived, retentionPercent, escalationPercent
  const {materials, wages, expenses, overheads, contractPrice, workCertified, cashReceived, retentionPercent, escalationPercent, materialsIncreasePercent} = payload;
  const directMaterials = materials.reduce((s,i)=>s + (i.amount||0),0);
  const directWages = wages.reduce((s,i)=>s + (i.amount||0),0);
  const directExpenses = expenses.reduce((s,i)=>s + (i.amount||0),0);
  const indirectOverheads = overheads.reduce((s,i)=>s + (i.amount||0),0);
  const primeCost = directMaterials + directWages + directExpenses;
  const worksCost = primeCost + indirectOverheads;
  const materialEscalation = directMaterials * (materialsIncreasePercent/100);

  // Notional profit = Work Certified + Materials at site (we'll keep simplified: contractPrice - worksCost)
  const notionalProfit = Math.max(0, contractPrice - worksCost);

  const retentionMoney = (workCertified * (retentionPercent/100));
  const recognisedProfit = Math.round(notionalProfit * (2/3) * (cashReceived / workCertified));

  return {
    directMaterials,
    directWages,
    directExpenses,
    indirectOverheads,
    primeCost,
    worksCost,
    materialEscalation,
    notionalProfit,
    retentionMoney,
    recognisedProfit
  };
}

function jobCosting(payload) {
  // payload: array of modules with itemized lists
  const modules = payload.modules || [];
  const breakdown = modules.map(m => {
    const directMaterial = (m.materials||[]).reduce((s,i)=>s + (i.amount||0),0);
    const directLabour = (m.labour||[]).reduce((s,i)=>s + (i.amount||0),0);
    const directExpenses = (m.expenses||[]).reduce((s,i)=>s + (i.amount||0),0);
    const factoryOverhead = m.factoryOverheadPercent? (directMaterial + directLabour + directExpenses) * (m.factoryOverheadPercent/100):0;
    const adminOverhead = m.adminOverheadPercent? (directMaterial + directLabour + directExpenses) * (m.adminOverheadPercent/100):0;
    const totalCost = directMaterial + directLabour + directExpenses + factoryOverhead + adminOverhead;
    const profit = m.profitPercent? totalCost * (m.profitPercent/100):0;
    return {...m, directMaterial, directLabour, directExpenses, factoryOverhead, adminOverhead, totalCost, profit, sellingPrice: totalCost + profit};
  });
  const total = breakdown.reduce((s,b)=>s + b.totalCost + b.profit,0);
  return {breakdown, total};
}

// API endpoints
app.post('/api/simulate/contract', (req, res) => {
  try {
    const result = contractCosting(req.body);
    res.json({ok:true, result});
  } catch(e) {
    res.status(500).json({ok:false, error: e.message});
  }
});

app.post('/api/simulate/job', (req, res) => {
  try {
    const result = jobCosting(req.body);
    res.json({ok:true, result});
  } catch(e) {
    res.status(500).json({ok:false, error: e.message});
  }
});

app.post('/api/classify', (req,res)=>{
  // classify arbitrary line items
  const items = req.body.items || [];
  res.json({ok:true, result: classifyCostsLineItems(items)});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Costing simulator backend running on ${PORT}`));