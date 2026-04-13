const config = require('./src/config/env');
const app = require('./src/app');


app.listen(config.port, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});
