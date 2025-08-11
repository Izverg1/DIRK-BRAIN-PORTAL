/**
 * Gemini Worker Process
 * Handles Google Gemini API interactions
 */

const axios = require('axios');

// Parse runtime configuration
const runtime = JSON.parse(process.argv[2]);

class GeminiWorker {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY;
    this.model = config.model || 'gemini-1.5-pro';
    this.systemPrompt = config.systemPrompt;
    this.capabilities = config.capabilities || ['text', 'multimodal'];
  }

  async processTask(task) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
      
      const response = await axios.post(
        `${endpoint}?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: this.formatTaskContent(task)
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [
              {
                text: this.systemPrompt
              }
            ]
          },
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      
      return {
        content,
        model: this.model,
        finishReason: response.data.candidates[0].finishReason
      };
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw error;
    }
  }

  formatTaskContent(task) {
    if (typeof task === 'string') {
      return task;
    }
    
    // For business analysis tasks, add specific formatting
    if (task.type === 'business_analysis') {
      return `
Business Analysis Request:
${task.description}

Please analyze the following aspects:
1. Business requirements and objectives
2. Stakeholder impact
3. Success criteria
4. Risk assessment
5. Recommendations

${task.data ? `Data to analyze: ${JSON.stringify(task.data, null, 2)}` : ''}
      `;
    }
    
    // For verification tasks
    if (task.type === 'verification') {
      return `
Verification Request:
${task.description}

Original Output to Verify:
${task.originalOutput}

Verification Criteria:
${JSON.stringify(task.criteria, null, 2)}

Please verify the output meets all criteria and provide a detailed assessment.
      `;
    }
    
    // Default formatting
    return `
Task: ${task.description || 'Process the following'}
${task.requirements ? `Requirements: ${JSON.stringify(task.requirements, null, 2)}` : ''}
${task.context ? `Context: ${task.context}` : ''}
${task.data ? `Data: ${JSON.stringify(task.data, null, 2)}` : ''}
    `;
  }

  /**
   * Special method for multi-modal processing
   */
  async processMultiModal(task) {
    if (!task.images && !task.videos) {
      return this.processTask(task);
    }
    
    const parts = [
      {
        text: this.formatTaskContent(task)
      }
    ];
    
    // Add image parts
    if (task.images) {
      task.images.forEach(image => {
        parts.push({
          inlineData: {
            mimeType: image.mimeType || 'image/jpeg',
            data: image.base64Data
          }
        });
      });
    }
    
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
      
      const response = await axios.post(
        `${endpoint}?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        }
      );
      
      return {
        content: response.data.candidates[0].content.parts[0].text,
        model: this.model,
        mode: 'multimodal'
      };
    } catch (error) {
      console.error('Gemini multimodal error:', error);
      throw error;
    }
  }
}

// Initialize worker
const worker = new GeminiWorker(runtime);

// Handle messages from parent process
process.on('message', async (message) => {
  const { id, task } = message;
  
  try {
    let result;
    
    // Check if multi-modal processing is needed
    if (task.images || task.videos) {
      result = await worker.processMultiModal(task);
    } else {
      result = await worker.processTask(task);
    }
    
    process.send({ id, result });
  } catch (error) {
    process.send({ id, error: error.message });
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Gemini worker shutting down');
  process.exit(0);
});

console.log(`Gemini worker initialized with model: ${worker.model}`);