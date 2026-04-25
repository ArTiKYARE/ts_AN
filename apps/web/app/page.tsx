export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">AnimeStream</h1>
        <p className="text-xl text-gray-300">Добро пожаловать в сервис для просмотра аниме</p>
        
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="aspect-[2/3] bg-gray-700 animate-pulse" />
              <div className="p-3">
                <div className="h-4 bg-gray-700 rounded mb-2 animate-pulse" />
                <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
