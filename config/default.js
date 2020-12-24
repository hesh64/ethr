module.exports = {
  Http: {
    port: 9991,
  },
  Rabbit: {
    url: 'amqp://localhost:5672',
    queue: 'accts',
  },
  Web3: {
    url: 'https://mainnet.infura.io/v3/f3c095656381439aa1acb1722d9c62f2',
  },
  Redis: {
    port: 6379,
  },
};
