require('dotenv').config();

module.exports = {
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    accessToken: process.env.TWITCH_ACCESS_TOKEN,
    refreshToken: process.env.TWITCH_REFRESH_TOKEN,
  },
  bot: {
    username: process.env.BOT_USERNAME,
    channelName: process.env.CHANNEL_NAME,
  },
  server: {
    port: process.env.PORT || 17563,
    authCallbackUrl: `http://localhost:${process.env.PORT || 17563}/callback`,
  },
};
