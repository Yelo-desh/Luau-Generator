// واجهة بسيطة تتواصل مع خادم Node
const generateBtn = document.getElementById('generate');
const promptEl = document.getElementById('prompt');
const outputEl = document.getElementById('output');
const tempRange = document.getElementById('temperature');
const tempVal = document.getElementById('tempVal');

const API_BASE = 'https://luau-generator.onrender.com';

tempRange.addEventListener('input', () => { tempVal.textContent = tempRange.value; });

generateBtn.addEventListener('click', async () => {
  const prompt = promptEl.value.trim();
  if (!prompt) return alert('اكتب وصفا ما أولاً');

  outputEl.textContent = 'جارٍ إنشاء الكود...';
  try {
    const resp = await fetch(API_BASE + '/api/generate-luau', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPrompt: prompt, temperature: parseFloat(tempRange.value) })
    });

    const data = await resp.json();
    if (resp.ok) {
      // عرض النتيجة كما هي (قد تكون داخل ```lua ... ```)
      outputEl.textContent = data.code || JSON.stringify(data, null, 2);
    } else {
      outputEl.textContent = 'خطأ من الخادم: ' + (data.error || JSON.stringify(data));
    }
  } catch (err) {
    outputEl.textContent = 'خطأ شبكي: ' + err.message;
  }
});
