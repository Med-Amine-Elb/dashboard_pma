export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 animate-pulse">
          <div className="p-4">
            <div className="h-8 bg-white/20 rounded mb-4"></div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 ml-64">
          {/* Header Skeleton */}
          <div className="bg-white/80 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Messages Content Skeleton */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Conversations List Skeleton */}
              <div className="bg-white/90 rounded-lg shadow-xl p-6">
                <div className="h-6 bg-gray-300 rounded w-32 mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area Skeleton */}
              <div className="lg:col-span-2 bg-white/90 rounded-lg shadow-xl">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                        <div className="h-12 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
