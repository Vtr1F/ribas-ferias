
const BASE_URL = "http://localhost:3000"; 

export const apiClient = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      if (!response.ok) throw new Error(`error status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("connection failed:", err);
      throw err;
    }
  }
};