// Roda todos os testes: node tests/rodar.js   (ou: npm test)
const fs = require('fs');
const path = require('path');

(async () => {
  let ok = 0, falhas = 0;
  for (const arq of fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort()) {
    console.log('\n' + arq);
    for (const [nome, teste] of Object.entries(require(path.join(__dirname, arq)))) {
      try { await teste(); ok++; console.log('  ok     ' + nome); }
      catch (e) { falhas++; console.log('  FALHOU ' + nome + '\n         ' + e.message); }
    }
  }
  console.log(`\n${ok} passaram, ${falhas} falharam`);
  process.exit(falhas ? 1 : 0);   // o app deixa temporizadores ligados; encerramos à força
})();
