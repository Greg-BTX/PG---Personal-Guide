// Supabase de mentira: guarda uma única linha de user_data na memória.
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const criarToken = (email = 'teste@exemplo.com') => 'x.' + b64({ sub: '11111111-1111-1111-1111-111111111111', email }) + '.y';

function criarServidor({ google = false } = {}) {
  const s = { linha: null, chamadas: [], token: criarToken() };
  const res = (status, corpo) => ({ ok: status < 300, status, json: async () => corpo });
  s.fetch = async (url, opt = {}) => {
    const metodo = opt.method || 'GET';
    s.chamadas.push(metodo + ' ' + url.replace(/^https:\/\/[^/]+/, '').split('?')[0]);
    if (url.includes('/auth/v1/otp')) return res(200, {});
    if (url.includes('/auth/v1/settings')) return res(200, { external: { google, email: true } });
    if (url.includes('/auth/v1/logout')) return res(204, null);
    if (url.includes('/rest/v1/user_data')) {
      if ((opt.headers || {}).Authorization !== 'Bearer ' + s.token) return res(401, {});
      if (metodo === 'GET') return res(200, s.linha ? [s.linha] : []);
      s.linha = JSON.parse(opt.body);
      return res(201, null);
    }
    return res(404, {});
  };
  s.gravacoes = () => s.chamadas.filter(c => c.startsWith('POST /rest')).length;
  s.retorno = () => '#access_token=' + s.token + '&refresh_token=r1&expires_in=3600&token_type=bearer';
  return s;
}

module.exports = { criarServidor };
