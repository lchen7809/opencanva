require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// AI content generation endpoint
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    });

    res.json({ text: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error from Groq API:', error.response ? error.response.data : error.message);
    res.status(500).send(error.message || 'Internal Server Error');
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
