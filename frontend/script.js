document.addEventListener("DOMContentLoaded", () => {
    // --- Configurações Globais ---
    const updateInterval = 2000; // 2 segundos
    let intervalId = null;
    let isPaused = false;
    const maxDataPoints = 15; // 15 pontos * 2s = 30s de dados

    // --- Elementos do DOM ---
    const toggleUpdatesBtn = document.getElementById('toggleUpdatesBtn');
    const statusText = document.getElementById('statusText');
    
    // Widgets da Sidebar
    const currentTempSpan = document.getElementById('currentTemp');
    const currentHumiditySpan = document.getElementById('currentHumidity');
    const currentWindSpan = document.getElementById('currentWind');
    const currentPressureSpan = document.getElementById('currentPressure');
    
    // Texto dos Medidores
    const umidadeText = document.getElementById('umidadeText');
    const uvText = document.getElementById('uvText');

    // --- Configurações Globais do Chart.js para o Tema Dark ---
    Chart.defaults.color = '#aaaaaa'; // Cor da fonte (eixos, legendas)
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)'; // Cor das linhas do grid

    // --- Helper para Gradiente ---
    function createChartGradient(ctx, color) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        
        // Pega a cor das variáveis CSS. Ex: 'var(--temp-color)'
        let colorHex = getComputedStyle(document.documentElement).getPropertyValue(color.match(/\((.*?)\)/)[1]).trim();

        // Converte hex para rgba
        const r = parseInt(colorHex.slice(1, 3), 16);
        const g = parseInt(colorHex.slice(3, 5), 16);
        const b = parseInt(colorHex.slice(5, 7), 16);
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.05)`);
        return gradient;
    }

    // --- PARTE 1: SIMULAÇÃO DA API ---
    // QUANDO FOR USAR A API REAL, VOCÊ VAI APAGAR ESTA FUNÇÃO
    function simularApiDaEstacao() {
        const temperatura = (Math.random() * 10 + 15).toFixed(1); // 15.0 - 25.0
        const umidade = (Math.random() * 30 + 50).toFixed(0);     // 50 - 80
        const vento = (Math.random() * 15 + 5).toFixed(1);         // 5.0 - 20.0
        const pressao = (Math.random() * 20 + 1000).toFixed(0);    // 1000 - 1020
        const uv = Math.floor(Math.random() * 11);                 // 0 - 10
        const visibilidade = (Math.random() * 15 + 5).toFixed(1);  // 5.0 - 20.0

        return {
            timestamp: new Date(),
            temperatura: parseFloat(temperatura),
            umidade: parseInt(umidade),
            vento: parseFloat(vento),
            pressao: parseInt(pressao),
            uv: parseInt(uv),
            visibilidade: parseFloat(visibilidade)
        };
    }
    
    // API REAL
    /*
    async function fetchApiReal() {
        const url = 'http://URL_DA_SUA_API_PYTHON/dados';
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Adiciona o timestamp, já que a API pode não mandar
            data.timestamp = new Date(); 
            return data;

        } catch (error) {
            console.error("Falha ao buscar dados da API", error);
            // Retorna nulo para não quebrar o dashboard
            return null; 
        }
    }
    */


    // --- PARTE 2: INICIALIZAÇÃO DOS GRÁFICOS ---
    
//     // 1. Gráfico de Linha (Temperatura & Pressão) - 2 eixos Y
//     const ctxTempPressao = document.getElementById('graficoTempPressao').getContext('2d');
//     const graficoTempPressao = new Chart(ctxTempPressao, {
//         type: 'line',
//         data: {
//             labels: [],
//             datasets: [
//                 {
//                     label: 'Temperatura',
//                     data: [],
//                     borderColor: 'var(--temp-color)',
//                     backgroundColor: createChartGradient(ctxTempPressao, 'var(--temp-color)'),
//                     fill: true,
//                     tension: 0.4,
//                     yAxisID: 'yTemp' // Associa ao eixo Y da temperatura
//                 },
//                 {
//                     label: 'Pressão',
//                     data: [],
//                     borderColor: 'var(--pressure-color)',
//                     backgroundColor: createChartGradient(ctxTempPressao, 'var(--pressure-color)'),
//                     fill: true,
//                     tension: 0.4,
//                     yAxisID: 'yPressure' // Associa ao eixo Y da pressão
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             interaction: { mode: 'index', intersect: false },
//             scales: {
//                 x: {
//                     type: 'time',
//                     time: { unit: 'second', displayFormats: { second: 'HH:mm:ss' } },
//                     ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }
//                 },
//                 yTemp: { // Eixo Y da Esquerda (Temperatura)
//                     type: 'linear',
//                     position: 'left',
//                     grid: { drawOnChartArea: false }, // Remove grid deste eixo
//                     ticks: { callback: value => `${value} °C` }
//                 },
//                 yPressure: { // Eixo Y da Direita (Pressão)
//                     type: 'linear',
//                     position: 'right',
//                     ticks: { callback: value => `${value} hPa` }
//                 }
//             },
//             plugins: {
//                 legend: { position: 'top' },
//                 tooltip: { 
//                     backgroundColor: '#000',
//                     titleFont: { weight: 'bold' },
//                     bodySpacing: 4,
//                     padding: 10,
//                     borderColor: 'var(--border-color)',
//                     borderWidth: 1
//                 }
//             }
//         }
//     });

//     // 2. Medidor de Umidade (Doughnut)
//     const graficoUmidade = new Chart(document.getElementById('graficoUmidade').getContext('2d'), {
//         type: 'doughnut',
//         data: {
//             datasets: [{
//                 data: [0, 100], // Valor, Restante
//                 backgroundColor: ['var(--humidity-color)', '#2f2f2f'], // Cor da umidade, Cor do fundo
//                 borderWidth: 0,
//                 borderRadius: 5
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             circumference: 270, // Arco de 270 graus
//             rotation: 225, // Começa no canto inferior esquerdo
//             cutout: '80%',
//             plugins: { legend: { display: false }, tooltip: { enabled: false } }
//         }
//     });
    
//     // 3. Medidor de UV (Doughnut)
//     const graficoUv = new Chart(document.getElementById('graficoUv').getContext('2d'), {
//         type: 'doughnut',
//         data: {
//             datasets: [{
//                 data: [0, 12], // Valor, Max (escala UV vai ~12)
//                 backgroundColor: ['var(--uv-color)', '#2f2f2f'], // Cor UV, Cor do fundo
//                 borderWidth: 0,
//                 borderRadius: 5
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             circumference: 270,
//             rotation: 225,
//             cutout: '80%',
//             plugins: { legend: { display: false }, tooltip: { enabled: false } }
//         }
//     });

//     // 4. Gráfico de Vento (Barra Vertical)
//     const graficoVento = new Chart(document.getElementById('graficoVento').getContext('2d'), {
//         type: 'bar',
//         data: {
//             labels: ['Vento'],
//             datasets: [{
//                 label: 'km/h',
//                 data: [0],
//                 backgroundColor: 'var(--accent-color)', // Cor de destaque
//                 borderRadius: 4
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 x: { display: false },
//                 y: { beginAtZero: true, max: 30 }
//             },
//             plugins: { legend: { display: false } }
//         }
//     });

//     // 5. Gráfico de Visibilidade (Barra Horizontal)
//     const graficoVisibilidade = new Chart(document.getElementById('graficoVisibilidade').getContext('2d'), {
//         type: 'bar',
//         data: {
//             labels: ['Visibilidade'],
//             datasets: [{
//                 label: 'km',
//                 data: [0],
//                 backgroundColor: '#9c27b0', // Roxo
//                 borderRadius: 4
//             }]
//         },
//         options: {
//             indexAxis: 'y', // Barra horizontal
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 y: { display: false },
//                 x: { beginAtZero: true, max: 25 }
//             },
//             plugins: { legend: { display: false } }
//         }
//     });


//     // --- PARTE 3: FUNÇÃO DE ATUALIZAÇÃO ---

//     // Esta função será chamada a cada X segundos
//     async function atualizarDashboard() {
        
//         // Mude aqui para usar a API real
//         // const dados = await fetchApiReal();
//         const dados = simularApiDaEstacao(); // Usando simulação por enquanto

//         // Se a API falhar, 'dados' será nulo. Pulamos a atualização.
//         if (!dados) {
//             return; 
//         }

//         // Atualiza Widgets da Sidebar
//         currentTempSpan.textContent = `${dados.temperatura.toFixed(1)} °C`;
//         currentHumiditySpan.textContent = `${dados.umidade} %`;
//         currentWindSpan.textContent = `${dados.vento.toFixed(1)} km/h`;
//         currentPressureSpan.textContent = `${dados.pressao} hPa`;

//         // Atualiza Gráfico de Linha (Temp & Pressão)
//         const labels = graficoTempPressao.data.labels;
//         const tempAtivos = graficoTempPressao.data.datasets[0].data;
//         const pressAtivos = graficoTempPressao.data.datasets[1].data;

//         labels.push(dados.timestamp);
//         tempAtivos.push(dados.temperatura);
//         pressAtivos.push(dados.pressao);

//         if (labels.length > maxDataPoints) {
//             labels.shift();
//             tempAtivos.shift();
//             pressAtivos.shift();
//         }
//         graficoTempPressao.update();

//         // Atualiza Medidor de Umidade
//         umidadeText.textContent = `${dados.umidade}%`;
//         graficoUmidade.data.datasets[0].data = [dados.umidade, 100 - dados.umidade];
//         graficoUmidade.update();

//         // Atualiza Medidor de UV (com cor dinâmica)
//         let uvColor;
//         if (dados.uv <= 2) { uvColor = '#4caf50'; } // Verde
//         else if (dados.uv <= 5) { uvColor = '#fdd835'; } // Amarelo
//         else if (dados.uv <= 7) { uvColor = '#ff9800'; } // Laranja
//         else { uvColor = '#f44336'; } // Vermelho
        
//         uvText.textContent = dados.uv;
//         graficoUv.data.datasets[0].data = [dados.uv, 12 - dados.uv];
//         graficoUv.data.datasets[0].backgroundColor[0] = uvColor;
//         graficoUv.update();

//         // Atualiza Gráfico de Vento
//         graficoVento.data.datasets[0].data = [dados.vento];
//         graficoVento.update();
        
//         // Atualiza Gráfico de Visibilidade
//         graficoVisibilidade.data.datasets[0].data = [dados.visibilidade];
//         graficoVisibilidade.update();
//     }

//     // --- PARTE 4: CONTROLE DE ATUALIZAÇÃO ---
    
//     toggleUpdatesBtn.addEventListener('click', () => {
//         isPaused = !isPaused;
//         if (isPaused) {
//             clearInterval(intervalId);
//             intervalId = null;
//             toggleUpdatesBtn.innerHTML = '<i class="fas fa-play"></i> <span>Retomar</span>';
//             statusText.textContent = 'Pausado';
//             statusText.style.color = '#ff9800';
//         } else {
//             startUpdates();
//             toggleUpdatesBtn.innerHTML = '<i class="fas fa-pause"></i> <span>Pausar</span>';
//             statusText.textContent = 'Monitorando...';
//             statusText.style.color = 'var(--accent-color)';
//         }
//     });

//     function startUpdates() {
//         if (intervalId === null) {
//             atualizarDashboard(); // Roda uma vez imediatamente
//             intervalId = setInterval(atualizarDashboard, updateInterval);
//         }
//     }

//     startUpdates(); // Inicia ao carregar
// });