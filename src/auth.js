const express = require('express');
const axios = require('axios');
const config = require('./config');

function startAuthServer(port) {
  const app = express();
  const scopes = [
    'chat:read',
    'chat:edit',
    'moderator:manage:banned_users',
  ];

  const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${config.twitch.clientId}&redirect_uri=${encodeURIComponent(config.server.authCallbackUrl)}&response_type=code&scope=${scopes.join('+')}`;

  console.log('Link para autorizar o bot:');
  console.log(authUrl);
  console.log(`\nAguardando callback em http://localhost:${port}/callback\n`);

  app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const error = req.query.error;

    if (error) {
      res.send(`Erro: ${error}`);
      return;
    }

    if (!code) {
      res.send('Nenhum codigo de autorizacao recebido');
      return;
    }

    try {
      const response = await axios.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: config.twitch.clientId,
            client_secret: config.twitch.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: config.server.authCallbackUrl,
          },
        }
      );

      const { access_token, refresh_token } = response.data;

      console.log('\nAutenticacao bem-sucedida!');
      console.log('\nAdicione ao seu arquivo .env:');
      console.log(`TWITCH_ACCESS_TOKEN=${access_token}`);
      console.log(`TWITCH_REFRESH_TOKEN=${refresh_token}`);

      res.send(`
        <h1>Autenticacao Bem-Sucedida!</h1>
        <p>Copie os tokens abaixo e adicione ao seu arquivo <strong>.env</strong>:</p>
        <pre>
TWITCH_ACCESS_TOKEN=${access_token}
TWITCH_REFRESH_TOKEN=${refresh_token}
        </pre>
        <p>Voce pode fechar esta janela.</p>
      `);

      process.exit(0);
    } catch (error) {
      console.error('Erro ao trocar codigo por token:', error.response?.data || error.message);
      res.send(`Erro: ${error.message}`);
    }
  });

  app.listen(port, () => {
    console.log(`Servidor de autenticacao rodando em http://localhost:${port}`);
  });
}

module.exports = { startAuthServer };
