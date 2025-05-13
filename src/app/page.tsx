import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">AutoTP: Automated Take Profit for Solana</h1>
        
        <p className="text-lg mb-6">
          Welcome to AutoTP, a Solana program that helps you automate your take-profit orders.
          Set your target price, and let the program execute the trade when market conditions meet your criteria.
        </p>
        
        <div className="grid gap-8 md:grid-cols-2 mb-10">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">How It Works</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Connect your Solana wallet</li>
              <li>Create a new take profit order</li>
              <li>Specify your token and target price</li>
              <li>Fund your vault</li>
              <li>The order executes automatically when the price reaches your target</li>
            </ol>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Features</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Fully decentralized execution</li>
              <li>Low fees (only 1% of the trade value)</li>
              <li>Optional referral system</li>
              <li>Cancel your order anytime</li>
              <li>Compatible with all SPL tokens</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/autotp" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center text-lg"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  )
}
