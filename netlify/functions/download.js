const { Client } = require('pg');

exports.handler = async (event, context) => {
  // Initialize the database client using an environment variable
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for most hosted Postgres databases (like Supabase, Heroku, etc.)
  });

  try {
    await client.connect();

    // Query the latest version based on the primary key (id)
    // You could also order by 'created_at' or 'build_number'
    const query = `
      SELECT download_url 
      FROM public.app_versions 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    const result = await client.query(query);
    await client.end();

    if (result.rows.length > 0) {
      const latestUrl = result.rows[0].download_url;
      
      return {
        statusCode: 302,
        headers: {
          Location: latestUrl,
          "Cache-Control": "no-cache" // Ensure users always get the latest link
        },
      };
    } else {
      return {
        statusCode: 404,
        body: "No download URL found in database.",
      };
    }

  } catch (error) {
    console.error("Database error:", error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};