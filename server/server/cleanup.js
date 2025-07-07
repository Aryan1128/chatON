const cron = require('node-cron');
const db = require('./db');

cron.schedule('0 * * * *', () => {
  console.log('Running cleanup task...');
  db.run(`
    DELETE FROM messages
    WHERE timestamp < DATETIME('now', '-24 hours')
  `);
});

