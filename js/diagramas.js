// Desenho do braço da guitarra e das tablaturas.

/* ---------- DIAGRAMAS ---------- */
const CORDAS = [['e',4],['B',11],['G',7],['D',2],['A',9],['E',4]]; // de cima (aguda) para baixo (grave)
const PENTA = { 9:'A', 0:'C', 2:'D', 4:'E', 7:'G' };
const MARCAS = [3,5,7,9,12,15,17];

function braco(lo, hi) {
  const n = hi - lo + 1, w = n <= 6 ? 52 : 42, h = 30, x0 = 26, y0 = 8;
  const W = x0 + n*w + 8, H = y0 + 6*h + 26;
  let s = `<svg class="fb" ${n <= 6 ? 'style="width:100%;height:auto"' : `width="${W}" height="${H}"`} viewBox="0 0 ${W} ${H}" role="img" aria-label="Braço da guitarra, casas ${lo} a ${hi}, com as notas da pentatônica de Lá menor">`;
  for (let k = 0; k <= n; k++) s += `<line class="fret" x1="${x0+k*w}" y1="${y0+h/2}" x2="${x0+k*w}" y2="${y0+5.5*h}"/>`;
  CORDAS.forEach(([nome], i) => {
    const y = y0 + i*h + h/2;
    s += `<line class="str" x1="${x0}" y1="${y}" x2="${x0+n*w}" y2="${y}"/><text class="lbl" x="6" y="${y+4}">${nome}</text>`;
  });
  for (let k = 0; k < n; k++) {
    const f = lo + k, cx = x0 + k*w + w/2, m = MARCAS.includes(f);
    s += `<text class="num${m?' in':''}" x="${cx}" y="${H-6}" text-anchor="middle">${f}</text>`;
    if (m) s += `<circle class="inlay" cx="${cx}" cy="${H-22}" r="2.5"/>`;
    CORDAS.forEach(([, solta], i) => {
      const pc = (solta + f) % 12;
      if (!(pc in PENTA)) return;
      const cy = y0 + i*h + h/2, r = pc === 9 ? ' root' : '';
      s += `<circle class="note${r}" cx="${cx}" cy="${cy}" r="11"/><text class="nt${r}" x="${cx}" y="${cy+4}" text-anchor="middle">${PENTA[pc]}</text>`;
    });
  }
  return s + '</svg><div class="legend"><span><i class="r"></i>Tônica</span></div>';
}

function tab(seg) {
  const vazio = '-'.repeat(seg.length);
  // a corda grave (E) toca primeiro; na tablatura ela fica na linha de baixo
  const linhas = CORDAS.map(([nome], i) => {
    let l = nome + '|-';
    for (let p = 0; p < 6; p++) l += (5 - i === p) ? seg : vazio;
    return l + '|';
  });
  return `<pre aria-label="Tablatura do exercício">${linhas.join('\n')}</pre>`;
}
