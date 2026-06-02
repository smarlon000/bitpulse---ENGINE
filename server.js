const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// POST /gate — Processa porta lógica
// Entradas: { gate: "AND"|"OR"|"NOT"|"XOR", a: 0|1, b: 0|1 }
// ─────────────────────────────────────────────
app.post('/gate', (req, res) => {
  const { gate, a, b } = req.body;

  const validGates = ['AND', 'OR', 'NOT', 'XOR'];

  if (!gate || !validGates.includes(gate.toUpperCase())) {
    return res.status(400).json({
      status: 'erro',
      mensagem: 'Porta lógica inválida',
      codigoErro: 'GATE_INVALIDA',
      timestamp: new Date().toISOString()
    });
  }

  const validBits = [0, 1];

  if (!validBits.includes(a)) {
    return res.status(400).json({
      status: 'erro',
      mensagem: 'Entrada A inválida. Use 0 ou 1.',
      codigoErro: 'ENTRADA_A_INVALIDA',
      timestamp: new Date().toISOString()
    });
  }

  if (gate.toUpperCase() !== 'NOT' && !validBits.includes(b)) {
    return res.status(400).json({
      status: 'erro',
      mensagem: 'Entrada B inválida. Use 0 ou 1.',
      codigoErro: 'ENTRADA_B_INVALIDA',
      timestamp: new Date().toISOString()
    });
  }

  let saida;

  switch (gate.toUpperCase()) {
    case 'AND':
      saida = a & b;
      break;

    case 'OR':
      saida = a | b;
      break;

    case 'NOT':
      saida = a === 1 ? 0 : 1;
      break;

    case 'XOR':
      saida = a ^ b;
      break;
  }

  return res.status(200).json({
    status: 'sucesso',
    gate: gate.toUpperCase(),
    entradas: gate.toUpperCase() === 'NOT'
      ? { a }
      : { a, b },
    saida,
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────
// POST /ieee754 — Converte decimal para IEEE 754
// ─────────────────────────────────────────────
app.post('/ieee754', (req, res) => {
  const { valor } = req.body;

  if (valor === undefined || valor === null || valor === '') {
    return res.status(400).json({
      status: 'erro',
      mensagem: 'Campo valor é obrigatório',
      codigoErro: 'VALOR_AUSENTE',
      timestamp: new Date().toISOString()
    });
  }

  if (typeof valor !== 'number' || isNaN(valor)) {
    return res.status(400).json({
      status: 'erro',
      mensagem: 'Valor inválido. Informe um número decimal.',
      codigoErro: 'VALOR_INVALIDO',
      timestamp: new Date().toISOString()
    });
  }

  const buffer = Buffer.allocUnsafe(4);
  buffer.writeFloatBE(valor, 0);

  const bits = buffer.readUInt32BE(0)
    .toString(2)
    .padStart(32, '0');

  const sinal = bits[0];
  const expoente = bits.slice(1, 9);
  const mantissa = bits.slice(9);
  const binario32 = bits;

  return res.status(200).json({
    status: 'sucesso',
    valor,
    ieee754: {
      sinal,
      expoente,
      mantissa,
      binario32
    },
    timestamp: new Date().toISOString()
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`BitPulse Engine rodando em http://localhost:${PORT}`);
});