// server.js (very small proxy)
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const app = express();
const PORT = 3000;

// CORS for local testing (adjust in production)
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  next();
});

// Proxy endpoint: /weather?url=<encoded openweather url>
app.get('/weather', async (req,res) => {
  const target = req.query.url;
  if(!target) return res.status(400).json({error:'missing url param'});
  try{
    const r = await fetch(target);
    const body = await r.text();
    res.status(r.status).send(body);
  }catch(e){ res.status(500).json({error:'proxy error', details:e.message}); }
});

app.listen(PORT, ()=> console.log(`Proxy running at http://localhost:${PORT}`));
