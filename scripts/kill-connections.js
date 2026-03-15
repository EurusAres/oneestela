const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({host:'127.0.0.1',user:'root',password:'',database:'one_estela_place'});
  
  // Show current connections
  const [procs] = await conn.execute("SHOW PROCESSLIST");
  console.log('Current connections:', procs.length);
  procs.forEach(p => {
    if (p.db === 'one_estela_place' && p.Command !== 'Sleep') {
      console.log('Active:', p.Id, p.User, p.Command, p.Time, p.Info);
    }
  });
  
  // Kill sleeping connections to one_estela_place
  const [sleeping] = await conn.execute("SELECT ID FROM information_schema.PROCESSLIST WHERE DB='one_estela_place' AND Command='Sleep' AND Time > 10");
  console.log('\nKilling', sleeping.length, 'sleeping connections...');
  for (const proc of sleeping) {
    try {
      await conn.execute(`KILL ${proc.ID}`);
      console.log('Killed connection', proc.ID);
    } catch (e) {
      // Ignore errors
    }
  }
  
  await conn.end();
  console.log('\nDone. Restart your dev server now.');
}
run().catch(console.error);
