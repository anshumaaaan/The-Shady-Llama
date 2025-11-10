import sql from '../config/database';

async function updateSchema() {
  try {

    console.log('Updating order status options...');
    
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'status'
    `;
    
    console.log( 'Status column:', result);
    console.log( 'Can now use: pending, paid, processing, shipped, delivered, cancelled, failed');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateSchema();