import axios from 'axios';
import { randomUUID } from 'crypto';
import { getRandomUserAgent } from './user_agents.js';

class MonicaClient {
  constructor(timeout = 60000) {
    this.apiEndpoint = "https://monica.so/api/search_v1/search";
    this.timeout = timeout;
    this.clientId = randomUUID();
    this.sessionId = "";
    
    this.headers = {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      "dnt": "1",
      "origin": "https://monica.so",
      "referer": "https://monica.so/answers",
      "sec-ch-ua": '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "user-agent": getRandomUserAgent(),
      "x-client-id": this.clientId,
      "x-client-locale": "en",
      "x-client-type": "web",
      "x-client-version": "5.4.3",
      "x-from-channel": "NA",
      "x-product-name": "Monica-Search",
      "x-time-zone": "Asia/Calcutta;-330"
    };

    // Axios instance with improved configuration
    this.client = axios.create({
      headers: this.headers,
      timeout: this.timeout,
      withCredentials: true,
      validateStatus: (status) => status >= 200 && status < 500 // Accept non-error status codes
    });
  }

  formatResponse(text) {
    try {
      // Clean up markdown formatting
      let cleanedText = text.replace(/\*\*/g, '');
      
      // Remove any empty lines
      cleanedText = cleanedText.replace(/\n\s*\n/g, '\n\n');
      
      // Remove any trailing whitespace
      return cleanedText.trim();
    } catch (error) {
      console.error('Error formatting Monica response:', error.message);
      return text.trim(); // Return original if formatting fails
    }
  }

  async search(prompt) {
    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: must be a non-empty string');
    }

    if (prompt.length > 5000) {
      throw new Error('Invalid prompt: too long (maximum 5000 characters)');
    }

    const taskId = randomUUID();
    const payload = {
      "pro": false,
      "query": prompt,
      "round": 1,
      "session_id": this.sessionId,
      "language": "auto",
      "task_id": taskId
    };

    const cookies = {
      "monica_home_theme": "auto"
    };
    
    // Convert cookies object to string
    const cookieString = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');

    try {
      console.log(`Monica API request starting: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
      
      const response = await this.client.post(this.apiEndpoint, payload, {
        headers: {
          ...this.headers,
          'Cookie': cookieString
        },
        responseType: 'stream',
        validateStatus: function (status) {
          return status < 500; // Accept non-error responses
        }
      });

      let fullText = '';
      let receivedData = false;
      
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Monica stream timeout: no response data received'));
        }, this.timeout);

        response.data.on('data', (chunk) => {
          receivedData = true;
          const lines = chunk.toString().split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.substring(6);
                const data = JSON.parse(jsonStr);

                if (data.session_id) {
                  this.sessionId = data.session_id;
                }

                if (data.text) {
                  fullText += data.text;
                }
                
                console.log('Monica data chunk received:', data.text?.substring(0, 50) + '...');
              } catch (e) {
                // Ignore parse errors for non-JSON lines
                console.debug('Ignoring non-JSON line:', line.substring(0, 50));
              }
            }
          }
        });

        response.data.on('end', () => {
          clearTimeout(timeoutId);
          
          if (!receivedData) {
            reject(new Error('Monica no data received: empty response'));
            return;
          }
          
          console.log('Monica stream completed, total length:', fullText.length);
          
          const formatted = this.formatResponse(fullText);
          
          if (!formatted || formatted.trim() === '') {
            reject(new Error('Monica no valid content: received empty or invalid response'));
            return;
          }
          
          resolve(formatted);
        });

        response.data.on('error', (err) => {
          clearTimeout(timeoutId);
          console.error('Monica stream error:', err.message);
          
          if (err.code === 'ENOTFOUND') {
            reject(new Error('Monica network error: unable to resolve host'));
          } else if (err.code === 'ECONNREFUSED') {
            reject(new Error('Monica network error: connection refused'));
          } else {
            reject(new Error(`Monica stream error: ${err.message}`));
          }
        });
      });

    } catch (error) {
      console.error('Monica API request failed:', error.message);
      
      if (error.response) {
        // HTTP error response
        const status = error.response.status;
        if (status === 429) {
          throw new Error('Monica rate limit: too many requests');
        } else if (status >= 500) {
          throw new Error(`Monica server error: HTTP ${status}`);
        } else if (status >= 400) {
          throw new Error(`Monica client error: HTTP ${status}`);
        }
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Monica request timeout: took too long');
      }
      
      throw new Error(`Monica API request failed: ${error.message}`);
    }
  }
}

/**
 * Search using Monica AI
 * @param {string} query - The search query
 * @returns {Promise<string>} The search results
 */
export async function searchMonica(query) {
  // Input validation
  if (!query || typeof query !== 'string') {
    throw new Error('Invalid query: query must be a non-empty string');
  }

  console.log(`Monica AI search starting: "${query}"`);

  try {
    const client = new MonicaClient();
    const result = await client.search(query);
    
    if (result && result.trim()) {
      console.log(`Monica AI search completed: ${result.length} characters received`);
    } else {
      console.log('Monica AI search completed but returned empty result');
    }
    
    return result;
  } catch (error) {
    console.error('Error in Monica AI search:', error.message);
    
    // Enhanced error handling
    if (error.code === 'ENOTFOUND') {
      throw new Error('Monica network error: unable to resolve host');
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Monica network error: connection refused');
    }
    
    if (error.message.includes('timeout')) {
      throw new Error('Monica timeout: request took too long');
    }
    
    if (error.message.includes('network')) {
      throw new Error('Monica network error: service may be unavailable');
    }
    
    throw new Error(`Monica search failed for "${query}": ${error.message}`);
  }
}
