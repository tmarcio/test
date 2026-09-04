#!/usr/bin/env node
/**
 * Repõe a base de dados com os dados iniciais (cardápio, municípios, parceiros,
 * atividades e estafetas). A base é criada e populada automaticamente na
 * primeira inicialização do servidor — este script apenas a apaga para recomeçar.
 */
const fs = require('node:fs');
const path = require('node:path');

const dbFile = process.env.DB_FILE || path.join(process.cwd(), 'data', 'aliado-food.db');
let removed = false;
for (const f of [dbFile, `${dbFile}-wal`, `${dbFile}-shm`]) {
  if (fs.existsSync(f)) {
    fs.unlinkSync(f);
    removed = true;
  }
}

if (removed) {
  console.log('✔ Base de dados apagada.');
  console.log('➜ Inicia o servidor (npm run dev ou npm start) para recriar e popular tudo automaticamente.');
} else {
  console.log('Não havia base de dados — será criada no primeiro arranque do servidor.');
}
