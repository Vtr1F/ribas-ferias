const BASE_URL = "http://localhost:3000"; 

export const apiClient = {
  
  // Body é um json
  request: async (endpoint, method = 'GET', body = null) => {
    
    try {
      const options = {
        method: method.toUpperCase(), 
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      };

      if (body) { 
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return true;
    } catch (err) {
      console.error("Falha na ligação:", err);
      throw err;
    }
  }
};