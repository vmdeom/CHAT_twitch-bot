const TwitchBot = require('./chat');
const { startAuthServer } = require('./auth');
const config = require('./config');

async function main() {
  // Verifica se falta configuração
  if (!config.twitch.accessToken) {
    console.log('Token de acesso nao encontrado!');
    console.log('Execute: npm run auth');
    console.log('Isso abrira uma janela de autorizacao com o Twitch.');
    return;
  }

  try {
    const bot = new TwitchBot();

    // Registre comandos adicionais personalizados aqui
    bot.registerCommand('status', (context) => {
      return `Status: Tudo funcionando perfeitamente!`;
    });

    bot.registerCommand('clip', (context, client, args) => {
      if (args.length === 0) {
        return 'Uso: !clip [descricao]';
      }
      return `Clipe salvo: ${args.join(' ')}`;
    });

    // Inicializa o bot
    await bot.initialize();

    // Trata encerramento gracioso
    process.on('SIGINT', async () => {
      console.log('\nEncerrando bot...');
      await bot.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Erro ao iniciar bot:', error);
    process.exit(1);
  }
}

main();
