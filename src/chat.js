const tmi = require('tmi.js');
const config = require('./config');

class TwitchBot {
  constructor() {
    this.client = null;
    this.commands = new Map();
    this.setupDefaultCommands();
  }

  setupDefaultCommands() {
    // Comando: !ping
    this.registerCommand('ping', () => {
      return 'Pong!';
    });

    // Comando: !hello
    this.registerCommand('hello', (context) => {
      return `Ola @${context.userstate['display-name']}! Bem-vindo!`;
    });

    // Comando: !help
    this.registerCommand('help', () => {
      const commands = Array.from(this.commands.keys()).join(', ');
      return `Comandos disponiveis: ${commands}`;
    });

    // Comando: !uptime
    this.registerCommand('uptime', async (context, client) => {
      try {
        // Aqui você pode adicionar lógica para verificar uptime real via API Twitch
        return 'Bot esta online!';
      } catch (error) {
        return 'Erro ao verificar uptime';
      }
    });

    // Comando: !dice (rolar um dado)
    this.registerCommand('dice', () => {
      const result = Math.floor(Math.random() * 6) + 1;
      return `Resultado do dado: ${result}`;
    });

    // Comando: !8ball (bola mágica)
    this.registerCommand('8ball', () => {
      const respostas = [
        'Sim!',
        'Nao',
        'Talvez',
        'Pergunte novamente',
        'Definitivamente!',
      ];
      return respostas[Math.floor(Math.random() * respostas.length)];
    });

    // Comando: !socials
    this.registerCommand('socials', () => {
      return 'Siga-me nas redes: Twitter, Instagram, Discord!';
    });

    // Comando: !so (shout out)
    this.registerCommand('so', (context, client, args) => {
      const user = args[0];
      if (!user) return 'Uso: !so @usuario';
      return `Deixa um follow para @${user}!`;
    });
  }

  registerCommand(name, handler) {
    this.commands.set(name.toLowerCase(), handler);
    console.log(`Comando registrado: !${name}`);
  }

  async initialize() {
    this.client = new tmi.Client({
      options: { debug: true },
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: config.bot.username,
        password: `oauth:${config.twitch.accessToken}`,
      },
      channels: [config.bot.channelName],
    });

    this.client.on('message', (channel, userstate, message, self) => {
      this.handleMessage(channel, userstate, message, self);
    });

    this.client.on('connected', (addr, port) => {
      console.log(`Bot conectado em ${addr}:${port}`);
      this.client.say(config.bot.channelName, `Bot online e pronto! Digite !help para ver os comandos.`);
    });

    this.client.on('disconnected', (reason) => {
      console.log(`Bot desconectado: ${reason}`);
    });

    try {
      await this.client.connect();
      console.log(`Bot conectado ao canal: ${config.bot.channelName}`);
    } catch (error) {
      console.error('Erro ao conectar ao Twitch:', error);
      throw error;
    }
  }

  async handleMessage(channel, userstate, message, self) {
    // Ignore mensagens do próprio bot
    if (self) return;

    // Verifica se a mensagem começa com o prefixo de comando
    if (!message.startsWith('!')) return;

    const args = message.slice(1).split(' ');
    const commandName = args.shift().toLowerCase();

    if (!this.commands.has(commandName)) {
      console.log(`Comando desconhecido: !${commandName}`);
      return;
    }

    try {
      const command = this.commands.get(commandName);
      const response = await command(
        { userstate, message, channel },
        this.client,
        args
      );

      if (response) {
        this.client.say(channel, response);
      }
    } catch (error) {
      console.error(`Erro ao executar comando !${commandName}:`, error);
      this.client.say(
        channel,
        `Erro ao executar !${commandName}. Contate o administrador.`
      );
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      console.log('Bot desconectado');
    }
  }
}

module.exports = TwitchBot;
