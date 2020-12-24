module.exports = {
  Http: {
    port: 9991,
  },
  Rabbit: {
    url: 'amqps://ixxhltoz:2vqOkxPOtIusnLFEgUiOBOVqWLcWlIza@gull.rmq.cloudamqp.com/ixxhltoz',
    queue: process.pid.toString(),
  },
  Web3: {
    url: 'https://mainnet.infura.io/v3/f3c095656381439aa1acb1722d9c62f2',
  },
  Redis: {
    port: 6379,
  },
};
