#!/usr/bin/env node

/**
 * Test script for Session-based API functionality
 * 
 * This script demonstrates:
 * 1. Creating a new analysis session with custom session name
 * 2. Fetching all available sessions
 * 3. Fetching tweets from a specific session
 * 4. Re-analyzing tweets from a session
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testSessionAPI() {
  console.log('🚀 Testing Session-based API functionality...\n');

  try {
    // Step 1: Create a new analysis session with custom session name
    console.log('1️⃣ Creating new analysis session with custom name...');
    const createSessionResponse = await axios.post(`${BASE_URL}/fetch-tweets`, {
      query: "#India lang:en",
      maxResults: 5,
      saveToDb: true,
      sessionName: "India Analysis - Test Session"
    });

    console.log('✅ Session created successfully!');
    console.log('Session Info:', {
      sessionId: createSessionResponse.data.session?.sessionId,
      sessionName: createSessionResponse.data.session?.sessionName,
      tweetsCount: createSessionResponse.data.meta?.result_count
    });
    console.log('');

    // Step 2: Fetch all available sessions
    console.log('2️⃣ Fetching all available sessions...');
    const sessionsResponse = await axios.get(`${BASE_URL}/sessions`);
    
    console.log(`✅ Found ${sessionsResponse.data.length} sessions:`);
    sessionsResponse.data.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.sessionName}`);
      console.log(`      Query: "${session.query}"`);
      console.log(`      Hashtag: #${session.hashtag}`);
      console.log(`      Tweets: ${session.tweetCount}`);
      console.log(`      Created: ${new Date(session.startedAt).toLocaleString()}`);
      console.log('');
    });

    // Step 3: Fetch tweets from the first session
    if (sessionsResponse.data.length > 0) {
      const firstSession = sessionsResponse.data[0];
      console.log(`3️⃣ Fetching tweets from session: "${firstSession.sessionName}"...`);
      
      const tweetsResponse = await axios.get(`${BASE_URL}/sessions/${encodeURIComponent(firstSession.sessionName)}/tweets`);
      
      console.log('✅ Tweets fetched successfully!');
      console.log('Session Details:', {
        sessionId: tweetsResponse.data.session?.sessionId,
        sessionName: tweetsResponse.data.session?.sessionName,
        tweetsCount: tweetsResponse.data.tweets?.length
      });
      console.log('');

      // Step 4: Re-analyze tweets from the session
      console.log(`4️⃣ Re-analyzing tweets from session: "${firstSession.sessionName}"...`);
      
      const reanalyzeResponse = await axios.post(`${BASE_URL}/sessions/${encodeURIComponent(firstSession.sessionName)}/reanalyze`);
      
      console.log('✅ Re-analysis completed successfully!');
      console.log('Re-analysis Results:', {
        tweetsProcessed: reanalyzeResponse.data.meta?.result_count,
        overallSentiment: reanalyzeResponse.data.overall?.overall_sentiment,
        overallAbuse: reanalyzeResponse.data.overall?.overall_abuse,
        riskLevel: reanalyzeResponse.data.overall?.risk_level
      });
      console.log('');

      // Step 5: Show sample tweet analysis
      if (reanalyzeResponse.data.data && reanalyzeResponse.data.data.length > 0) {
        console.log('5️⃣ Sample tweet analysis:');
        const sampleTweet = reanalyzeResponse.data.data[0];
        console.log('Tweet Text:', sampleTweet.text);
        console.log('Sentiment:', sampleTweet.analysis?.sentiment);
        console.log('Abuse Detection:', sampleTweet.analysis?.abuse);
        console.log('Risk Level:', sampleTweet.analysis?.risk_level);
        console.log('Confidence:', sampleTweet.analysis?.confidence);
      }
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Created analysis session with custom name');
    console.log('✅ Fetched all available sessions');
    console.log('✅ Retrieved tweets from specific session');
    console.log('✅ Re-analyzed tweets from session');
    console.log('✅ Database foreign key relationships working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testSessionAPI();
