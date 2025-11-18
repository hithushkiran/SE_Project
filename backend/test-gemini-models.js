// Quick test to see what Gemini models are available with your API key
const GEMINI_API_KEY = 'AIzaSyAxB_-R5VjgJyJjoTZDEHW5Ji5Z0SMCfRI';

// Test 1: List available models
async function listModels() {
  console.log('🔍 Fetching available models...\n');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.models) {
      console.log('✅ Available models:');
      data.models.forEach(model => {
        console.log(`  - ${model.name}`);
        console.log(`    Display Name: ${model.displayName}`);
        console.log(`    Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('❌ No models found');
      console.log('Response:', data);
    }
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

// Test 2: Try different model names
async function testModels() {
  const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'models/gemini-pro',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-flash-latest'
  ];
  
  console.log('\n🧪 Testing model names...\n');
  
  for (const model of modelsToTest) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Hello' }]
            }]
          })
        }
      );
      
      if (response.ok) {
        console.log(`✅ ${model} - WORKS!`);
      } else {
        console.log(`❌ ${model} - ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${model} - ${error.message}`);
    }
  }
}

// Run tests
(async () => {
  await listModels();
  await testModels();
})();
