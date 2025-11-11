import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Paho from 'paho-mqtt';

// --- CONFIGURAÇÃO ---
const API_URL = 'https://api.mattthefreeman.xyz'; 
const MQTT_PORT = 9001;
const MQTT_USER = 'usuario_cliente'; 
const MQTT_PASS = '1234'; // <-- coloquei uma senha padrao, mas ai cada um poe o seu
const MQTT_TOPIC = 'sensor/data'; 
 
const formatXAxis = (timeStr) => {
  return new Date(timeStr).toLocaleTimeString('pt-BR');
}; // formata a hora 

function App() { 
  
  const [tempData, setTempData] = useState([]);
  const [pressureData, setPressureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [luminosityData, setLuminosityData] = useState([]);
  const [windData, setWindData] = useState([])
  const [windDirectionData, setWindDirectionData] = useState([]);
 
  const [currentTemp, setCurrentTemp] = useState('--.-');
  const [currentHumidity, setCurrentHumidity] = useState('--');
  const [currentWind, setCurrentWind] = useState('--.-');
  const [currentPressure, setCurrentPressure] = useState('----');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mqttClientRef = useRef(null);
 
  const fetchData = () => {
    fetch(`${API_URL}/readings`) //
      .then(response => response.json())
      .then(data => { 

        const processReadings = (measureId) => {
          return data.readings
            .filter(r => r.measure_id === measureId)
            .map(r => ({
              time: r.time, // Mantemos o timestamp completo para ordenar
              time_formatted: new Date(r.time).toLocaleTimeString('pt-BR'), 
              value: r.value,
            }));
        };
 
        setTempData(processReadings(5));      // ID 5 = Temperatura
        setHumidityData(processReadings(3));  // ID 3 = Umidade
        setPressureData(processReadings(4));  // ID 4 = Pressão
        setLuminosityData(processReadings(2));  // ID 2 = Luminosidade
        setWindData(processReadings(1));      // ID 1 = Vento
        setWindDirectionData(processReadings(6)); // ID 6 = Direção do vento

        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar dados da API:", err);
        setError(err.message);
        setLoading(false);
      });
  }


  useEffect(() => {
	fetchData();

    const intervalId = setInterval(fetchData, 30000);
	
	return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
	 if (tempData.length > 0) {
		 setCurrentTemp(tempData.at(-1).value.toFixed(1));
	 }
     if (humidityData.length > 0) {
         setCurrentHumidity(humidityData.at(-1).value.toFixed(0));
	 }
	 if (pressureData.length > 0) {
		 setCurrentPressure(pressureData.at(-1).value.toFixed(1));
	 }
	 if (windData.length > 0) {
		 setCurrentWind(windData.at(-1).value.toFixed(1));
	 }
  }, [tempData, humidityData, pressureData, windData]);

  // RENDERIZAÇÃO 
  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      
      {/*********  DADOS ATUAIS) *******/}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col shadow-lg flex-shrink-0">
        <h2 className="text-lg font-semibold text-white mb-2">Current Data</h2>
        <p className="text-sm text-gray-400 mb-6">Weather Station</p>
        
        <div className="space-y-4">
          <StatCard title="Temperature" value={`${currentTemp}°C`} />
          <StatCard title="Humidity" value={`${currentHumidity}%`} />
          <StatCard title="Wild Speed" value={`${currentWind} km/h`} />
          <StatCard title="Pressure" value={`${currentPressure} hPa`} />
        </div>
      </aside>
      
      {/******* GRAFICOS *******/}
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Monitoring Dashboard</h1>
        
        {loading && <div>Loading Graphs...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>} 
        
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/**** Card 1: Temperatura ****/}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Temperature
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tempData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="time_formatted" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#8884d8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="value" name="°C" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/**** Card 2: Umidade ****/}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">Umidade</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={humidityData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="time_formatted" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Line type="monotone" dataKey="value" name="%" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/**** Card 3: Pressão ****/}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">Pressão Atmosférica</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pressureData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="time_formatted" stroke="#9CA3AF" />
                  <YAxis stroke="#82ca9d" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Line type="monotone" dataKey="value" name="hPa" stroke="#82ca9d" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/***** Card 4: Velocidade do Vento *****/}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">Velocidade do Vento</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={windData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="time_formatted" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Line type="monotone" dataKey="value" name="km/h" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/**** Card 5: Luminosidade ****/}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">Luminosidade</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={luminosityData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="time_formatted" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Line type="monotone" dataKey="value" name="lux" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/**** Card 6: Direção do vento ****/}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">Direção do vento</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={windDirectionData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="time_formatted" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Line type="monotone" dataKey="value" name="°" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-gray-700/50 p-4 rounded-lg shadow-inner">
      <div className="text-gray-400 text-sm">{title}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

export default App;
