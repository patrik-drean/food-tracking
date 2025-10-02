import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Food Tracker
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track your daily nutrition with AI-powered food analysis.
          Simply describe what you eat and get instant nutrition insights.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Add Food Entry
          </h2>
          <p className="text-gray-600 mb-6">
            Log what you eat and let AI analyze the nutrition content automatically.
          </p>
          <Link
            href={'/add-food' as any}
            className="btn-primary px-6 py-3"
          >
            Add Food Now
          </Link>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Today&apos;s Summary
          </h2>
          <p className="text-gray-600 mb-6">
            View your daily nutrition totals and food log.
          </p>
          <Link
            href={'/today' as any}
            className="btn-secondary px-6 py-3"
          >
            View Today
          </Link>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-primary-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Features
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 text-xl">🍎</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Food Logging</h3>
            <p className="text-gray-600 text-sm">
              Describe your food in natural language and get nutrition analysis
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 text-xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Nutrition Tracking</h3>
            <p className="text-gray-600 text-sm">
              Track calories, protein, carbs, and fat with visual progress bars
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 text-xl">🤖</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-gray-600 text-sm">
              Powered by OpenAI for accurate food recognition and nutrition data
            </p>
          </div>
        </div>
      </div>

      {/* Development Status */}
      <div className="text-center py-8 border-t">
        <p className="text-sm text-gray-500">
          🚧 This is a development version. Backend GraphQL server coming soon!
        </p>
      </div>
    </div>
  )
}