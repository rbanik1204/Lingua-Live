import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyBxbaPJFR6qdTb6mcXycWAhSggant1jc_U';
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro'
];

async function testModel(modelName) {
  console.log(`\nTesting model: ${modelName}...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hello, say "working" if you can hear me.');
    const response = await result.response;
    console.log(`✅ SUCCESS: ${modelName} responded: "${response.text().trim()}"`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${modelName}`);
    console.log(`   Error: ${error.message.split('\n')[0]}`); // Print first line of error
    return false;
  }
}

async function listModels() {
  console.log('\nListing available models...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      console.error('Error listing models:', data.error);
    } else {
      console.log('Available models:');
      if (data.models) {
        data.models.forEach(m => {
          if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
             console.log(`- ${m.name} (Supports generateContent)`);
          } else {
             console.log(`- ${m.name}`);
          }
        });
      } else {
        console.log('No models found in response.');
      }
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

async function runTests() {
  // await listModels();
  await testModel('gemini-2.5-flash');
}

runTests();


runTests();
