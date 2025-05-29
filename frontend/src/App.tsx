import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-off-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-dark-charcoal mb-8">
          Banrimkwae Resort Management System
        </h1>
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-resort-blue mb-4">
              Frontend Setup Complete
            </h2>
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="bg-warm-orange hover:bg-sunset-red text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Count is {count}
            </button>
            <p className="mt-4 text-medium-gray">
              React + TypeScript + Tailwind CSS is working!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
