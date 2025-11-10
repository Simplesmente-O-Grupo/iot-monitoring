import React, { useState, useEffect } from 'react';
 
const API_URL = 'http://localhost:8000'; 


function App() {
   
  const [stations, setStations] = useState([]); // Guarda a lista de estações
  const [loading, setLoading] = useState(true); // Indica se está carregando
  const [error, setError] = useState(null);     // Guarda qualquer erro

 
  useEffect(() => {
     
    fetch(`${API_URL}/stations`) // Busca no endpoint /stations
      .then(response => {
        if (!response.ok) { // Se a resposta não for 200 (OK)
          throw new Error('Falha ao buscar dados da API');
        }
        return response.json(); // Transforma a resposta em JSON
      })
      .then(data => {  
        setStations(data.stations); 
        setLoading(false);  
      })
      .catch(err => { 
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);  
 
  if (loading) {
    return <div className="p-4 text-white">Carregando dados...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Erro: {error}</div>;
  }
 
  return ( 
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold mb-6">Dashboard da Estação</h1>

        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Estações</h2>
 
          <ul className="space-y-3">
            {stations.map(station => (
              <li 
                key={station.id} 
                className="p-4 bg-black/20 rounded-lg shadow"
              >
                <span className="font-bold">{station.name}</span>
                <span className="text-sm opacity-70"> (ID: {station.id})</span>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </div>
  );
}

export default App;