const BASE_URL = "http://localhost:3000/api"; 

export const apiClient = {
  
  // Body é um json
  request: async (endpoint, method = 'GET', body = null) => {
    try {
      const options = {
        method: method.toUpperCase(), 
        headers: {
          'Content-Type': 'application/json',
        },
      };


      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      // if backend retorna 204, nao da pasrse a nada (economy 100)
      if (response.status === 204) return null;

      return await response.json();
    } catch (err) {
      console.error("Falha na ligação:", err);
      throw err;
    }
  }
};