import { createPool, PoolConnection } from 'mysql2/promise';

/**
 * Database connection configuration and query utility for MySQL
 */

interface QueryParams {
  query: string;
  values?: (string | number | bigint | boolean | File | Buffer<ArrayBufferLike> | null)[];
}

// Parse the connection string from environment variable
const connectionString = process.env.NEXT_PUBLIC_DATABASE_CONNECTION;

// Create a connection pool with optimized settings
const pool = createPool({
  uri: connectionString,      // Use the connection string
  connectionLimit: 20,        // Maximum concurrent connections
  waitForConnections: true,  
  queueLimit: 0,  
  multipleStatements: true,   // Allows executing multiple SQL queries
  namedPlaceholders: true,    // Enables named placeholders
});

export async function Query({ query, values = [] }: QueryParams): Promise<unknown> {
  let connection: PoolConnection | null = null;
  
  try {
    connection = await pool.getConnection();

    // Execute query with a timeout for safety
    const [rows] = await connection.query({
        sql: query,
        values,
        timeout: 10000 // 10-second timeout
    });

    return rows;
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Database query error: ${error.message}`);
    }
    throw new Error('An unknown database error occurred');
    
  } finally {
    if (connection) {
      connection.release(); // Return the connection to the pool
    }
  }
}

export async function closeDbConnection() {
  await pool.end();
}