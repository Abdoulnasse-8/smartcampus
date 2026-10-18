const config = require('./config');
const { init } = require('./db');
const app = require('./app');

init();

app.listen(config.PORT, () => {
  console.log(`SmartCampus API démarrée sur http://localhost:${config.PORT}`);
});
