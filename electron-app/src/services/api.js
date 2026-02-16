import axios from 'axios';

const API_URL = 'http://127.0.0.1:9000';

export const api = {
    getStatus: async () => {
        try {
            const response = await axios.get(`${API_URL}/`);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            return null;
        }
    },
    getStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            return null;
        }
    }
};
