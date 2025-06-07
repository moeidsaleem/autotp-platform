import React from 'react';
import { GridBackground, DotBackground } from './ui/backgrounds';

export function AceternityBackgroundDemo() {
  return (
    <div className="space-y-8">
      {/* Hero Section with Grid Background */}
      <GridBackground className="min-h-screen">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
            Welcome to AutoTP
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">
            Experience automated take profit trading with beautiful grid backgrounds
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started
            </button>
            <button className="border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </GridBackground>

      {/* Feature Section with Small Grid */}
      <GridBackground size="small" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto"></div>
              <h3 className="text-xl font-semibold text-white">Automated Trading</h3>
              <p className="text-neutral-400">Set your parameters and let the bot handle your take profit orders</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto"></div>
              <h3 className="text-xl font-semibold text-white">Real-time Analytics</h3>
              <p className="text-neutral-400">Monitor your trades with comprehensive charts and data</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto"></div>
              <h3 className="text-xl font-semibold text-white">Secure & Reliable</h3>
              <p className="text-neutral-400">Built on Solana with enterprise-grade security</p>
            </div>
          </div>
        </div>
      </GridBackground>

      {/* Stats Section with Dot Background */}
      <DotBackground className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
              Platform Statistics
            </h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400">$2.5M+</div>
                <div className="text-neutral-400 mt-2">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-400">10,000+</div>
                <div className="text-neutral-400 mt-2">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400">99.9%</div>
                <div className="text-neutral-400 mt-2">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-400">24/7</div>
                <div className="text-neutral-400 mt-2">Support</div>
              </div>
            </div>
          </div>
        </div>
      </DotBackground>

      {/* Card Section with No Background (to show contrast) */}
      <div className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Choose Your Plan
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan Card with Grid Background */}
            <GridBackground size="small" className="p-8 rounded-2xl border border-white/10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Basic</h3>
                  <div className="text-3xl font-bold text-white mt-2">$29<span className="text-lg text-neutral-400">/mo</span></div>
                </div>
                <ul className="space-y-3 text-neutral-300">
                  <li>• Up to 5 active orders</li>
                  <li>• Basic analytics</li>
                  <li>• Email support</li>
                </ul>
                <button className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Get Started
                </button>
              </div>
            </GridBackground>

            {/* Pro Plan Card with Dot Background */}
            <DotBackground className="p-8 rounded-2xl border border-blue-500/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Most Popular</span>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Pro</h3>
                  <div className="text-3xl font-bold text-white mt-2">$99<span className="text-lg text-neutral-400">/mo</span></div>
                </div>
                <ul className="space-y-3 text-neutral-300">
                  <li>• Unlimited orders</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                  <li>• API access</li>
                </ul>
                <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  Get Started
                </button>
              </div>
            </DotBackground>

            {/* Enterprise Plan Card with Grid Background */}
            <GridBackground className="p-8 rounded-2xl border border-white/10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Enterprise</h3>
                  <div className="text-3xl font-bold text-white mt-2">Custom</div>
                </div>
                <ul className="space-y-3 text-neutral-300">
                  <li>• Custom solutions</li>
                  <li>• Dedicated support</li>
                  <li>• SLA guarantees</li>
                  <li>• Custom integrations</li>
                </ul>
                <button className="w-full border border-white/20 text-white py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Contact Sales
                </button>
              </div>
            </GridBackground>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AceternityBackgroundDemo; 