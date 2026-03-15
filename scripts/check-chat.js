const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({host:'127.0.0.1',user:'root',password:'',database:'one_estela_place'});
  
  // Test the query that admin chat page uses: senderId=13&receiverId=13
  const userId = 13;
  const query = `
    SELECT cm.*, u.full_name as sender_name, u.email as sender_email
    FROM chat_messages cm
    LEFT JOIN users u ON cm.sender_id = u.id
    WHERE 1=1 AND (cm.sender_id = ? OR cm.receiver_id = ?)
    ORDER BY cm.created_at ASC
  `;
  
  console.log('Testing query for userId=13 (customer messages + admin replies):');
  const [msgs] = await conn.execute(query, [userId, userId]);
  console.log('Found', msgs.length, 'messages');
  msgs.forEach(m => console.log(JSON.stringify({
    id: m.id,
    sender_id: m.sender_id,
    receiver_id: m.receiver_id,
    message: m.message.substring(0, 50),
    sender_name: m.sender_name
  })));
  
  await conn.end();
}
run().catch(console.error);
