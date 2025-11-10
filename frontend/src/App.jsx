import React, { useState, useEffect } from 'react';
// 1. Importamos os componentes do Recharts que vamos usar
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// 2. Defina a URL da sua API (use a porta que você achou no Docker)
const API_URL = 'http://localhost:8000'; 

function App() {
  // 3. Criamos um novo estado para guardar as leituras (readings)
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 4. Este useEffect busca os dados UMA VEZ quando a página carrega
  useEffect(() => {
    // Usamos o 'fetch' para buscar as leituras da nossa API
    fetch(`${API_URL}/readings`) // <-- MUDAMOS O ENDPOINT PARA /readings
      .then(response => {
        if (!response.ok) {
          throw new Error('Falha ao buscar dados da API');
        }
        return response.json();
      })
      .then(data => {
        // 5. Sucesso! Processamos e guardamos os dados
        
        // Filtramos para pegar SÓ a Temperatura (measure_id === 1)
        const temperatureData = data.readings
          .filter(r => r.measure_id === 1)
          .map(r => ({
            // Formatamos a hora para ficar legível no gráfico
            time: new Date(r.time).toLocaleTimeString('pt-BR'), 
            Temperatura: r.value, // O nome 'Temperatura' será usado na legenda
          }));

        setReadings(temperatureData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []); // O '[]' vazio faz o useEffect rodar só uma vez

  // 6. Funções para mostrar o status na tela
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        Carregando dados do gráfico...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Erro: {error}</div>;
  }

  // 7. RENDERIZAÇÃO: O que aparece na tela
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-4xl font-bold mb-6">Dashboard da Estação</h1>
        
        {/* Este é o nosso card de gráfico */}
        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Temperatura (Últimas Leituras)
          </h2>
          
          {/* 8. O Gráfico do Recharts! */}
          {/* ResponsiveContainer faz o gráfico ocupar o espaço do card */}
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={readings} // 9. Aqui entram os dados que buscamos da API
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="time" stroke="#FFFFFF" /> {/* Mostra a 'hora' no eixo X */}
              <YAxis stroke="#FFFFFF" /> {/* Mostra os valores no eixo Y */}
              <Tooltip 
                contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                labelStyle={{ color: '#FFF' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Temperatura" // 10. O dado que queremos plotar
                stroke="#8884d8" // Cor da linha
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
      </div>
    </div>
  );
}

export default App;