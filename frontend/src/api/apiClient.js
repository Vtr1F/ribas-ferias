const BASE_URL = "http://localhost:3000"; 

export const apiClient = {
  
  // Body é um json
  request: async (endpoint, method = 'GET', body = null) => {
    const savedToken = localStorage.getItem('token');
    
    try {
      const options = {
        method: method.toUpperCase(), 
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (savedToken) {
        options.headers['Authorization'] = `Bearer ${savedToken}`;
      }

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      if (response.status === 204) return true;

      return await response.json();
    } catch (err) {
      console.error("Falha na ligação:", err);
      throw err;
    }
  }
};