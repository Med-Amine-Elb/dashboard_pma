export default function Loading() {
  return (
    <div className="flex-1 ml-64 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Skeleton for Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 mb-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-10 w-64 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Skeleton for Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 bg-white/60 rounded-xl border border-white/40 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Skeleton for Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-white/60 rounded-xl border border-white/40 shadow-sm p-6 space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse mt-4" />
        </div>
        <div className="h-[400px] bg-white/60 rounded-xl border border-white/40 shadow-sm p-6 space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-4 mt-8">
            <div className="h-16 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-16 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-16 w-full bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
