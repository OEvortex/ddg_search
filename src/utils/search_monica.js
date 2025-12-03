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

    // Axios instance
    this.client = axios.create({
      headers: this.headers,
      timeout: this.timeout,
      withCredentials: true
    });
  }

  formatResponse(text) {
    // Clean up markdown formatting
    let cleanedText = text.replace(/\*\*/g, '');
    
    // Remove any empty lines
    cleanedText = cleanedText.replace(/\n\s*\n/g, '\n\n');
    
    // Remove any trailing whitespace
    return cleanedText.trim();
  }

  async search(prompt) {
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
      const response = await this.client.post(this.apiEndpoint, payload, {
        headers: {
          ...this.headers,
          'Cookie': cookieString
        },
        responseType: 'stream'
      });

      let fullText = '';
      
      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
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
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        });

        response.data.on('end', () => {
          resolve(this.formatResponse(fullText));
        });

        response.data.on('error', (err) => {
          reject(err);
        });
      });

    } catch (error) {
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
  const client = new MonicaClient();
  return await client.search(query);
}
