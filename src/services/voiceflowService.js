import axios from 'axios';

const VOICEFLOW_API_URL = 'https://general-runtime.voiceflow.com';
const VOICEFLOW_API_KEY = process.env.REACT_APP_VOICEFLOW_API_KEY;

class VoiceflowService {
  constructor() {
    this.axios = axios.create({
      baseURL: VOICEFLOW_API_URL,
      headers: {
        'Authorization': VOICEFLOW_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }

  async interact(userID, request) {
    try {
      const response = await this.axios.post(`/state/user/${userID}/interact`, request);
      return response.data;
    } catch (error) {
      console.error('Error interacting with Voiceflow:', error);
      throw error;
    }
  }

  async launchConversation(userID) {
    try {
      const response = await this.axios.post(`/state/user/${userID}/interact`, { type: 'launch' });
      return response.data;
    } catch (error) {
      console.error('Error launching Voiceflow conversation:', error);
      throw error;
    }
  }
}

export const voiceflowService = new VoiceflowService();