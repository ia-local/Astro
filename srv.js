/**
 * serveir.js - Noyau de Diffusion "Braquage Fiscal"
 * Orchestration : Groq-SDK (Llama-3.1-8b-instant)
 * Logique : Souveraineté CVNU
 */
const express = require('express');
const fs = require('fs');
const Groq = require('groq-sdk');

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.static('docs'));
app.use(express.json());

app.listen(3000, () => console.log('✅ JURIDICTION BAVENT : SERVEUR ACTIF SUR PORT 3000'));