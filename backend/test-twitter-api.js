// Test script for the new Twitter API integration
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testTwitterAPI() {
  try {
    console.log('🚀 Testing Twitter API integration...\n');

    // Test 1: Your specific query - #India lang:en
    console.log('Test 1: Fetching tweets with query "#India lang:en"');
    const response1 = await axios.post(`${API_BASE_URL}/fetch-tweets-query`, {
      query: '#India lang:en',
      maxResults: 5,
      saveToDb: true
    });

    console.log('✅ Response received:');
    console.log(`- Tweets found: ${response1.data.meta.result_count}`);
    console.log(`- Query: ${response1.data.meta.query}`);
    console.log(`- Session ID: ${response1.data.session?.sessionId || 'Not saved'}`);
    
    if (response1.data.data.length > 0) {
      console.log('\n📝 Sample tweet:');
      const sampleTweet = response1.data.data[0];
      console.log(`- Text: ${sampleTweet.text.substring(0, 100)}...`);
      console.log(`- Author: @${sampleTweet.author.username}`);
      console.log(`- Sentiment: ${sampleTweet.analysis.sentiment[0]?.label}`);
      console.log(`- Abuse Risk: ${sampleTweet.analysis.abuse[0]?.label}`);
      console.log(`- Risk Level: ${sampleTweet.analysis.risk_level}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Alternative query format
    console.log('Test 2: Fetching tweets with query "India lang:en"');
    const response2 = await axios.post(`${API_BASE_URL}/fetch-tweets-query`, {
      query: 'India lang:en',
      maxResults: 3,
      saveToDb: false
    });

    console.log('✅ Response received:');
    console.log(`- Tweets found: ${response2.data.meta.result_count}`);
    console.log(`- Query: ${response2.data.meta.query}`);

  } catch (error) {
    console.error('❌ Error testing Twitter API:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${error.response.data.error || error.response.data.message}`);
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testTwitterAPI();
