// File: test-db.js

// Load environment variables FIRST
require('dotenv').config();

const { prisma } = require('./src/config/db');

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test query to verify tables exist
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const commentCount = await prisma.comment.count();
    
    console.log('📊 Database Status:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Posts: ${postCount}`);
    console.log(`   Comments: ${commentCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
