const config = require('./config');
const { init, close } = require('./db');
const app = require('./app');

async function main() {
  await init();
  console.log(
    `Base de données : ${config.DB_DRIVER === 'postgres' ? 'PostgreSQL' : 'SQLite (' + config.DB_PATH + ')'}`
  );
  app.listen(config.PORT, () => {
    console.log(`SmartCampus API démarrée sur http://localhost:${config.PORT}`);
  });
}

// Arrêt propre sous Docker (SIGTERM) : ferme la base avant de sortir
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, async () => {
    await close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Échec du démarrage :', err);
  process.exit(1);
});
