import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
        <h1 className="text-4xl font-bold mb-4">Job Tracker</h1>
        <p className="text-xl mb-8">Welcome to your job tracking application!</p>
        <div className="p-8">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg border border-transparent hover:border-blue-500 transition-colors cursor-pointer"
          >
            count is {count}
          </button>
          <p className="mt-4">
            Edit <code className="bg-gray-800 text-gray-300 px-1 py-0.5 rounded font-mono text-sm">src/App.jsx</code> and save to test HMR
          </p>
        </div>
      </header>
    </div>
  )
}

export default App 