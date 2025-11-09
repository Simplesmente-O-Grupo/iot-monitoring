function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Tailwind CSS está funcionando! 🎉
        </p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200">
          Botão de Teste
        </button>
      </div>
    </div>
  )
}

export default App