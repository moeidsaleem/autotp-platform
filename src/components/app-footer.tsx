import React from 'react'
import { ExternalLink, Github, Twitter } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-8 text-neutral-400">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-medium mb-3">AutoTP</h3>
            <p className="text-sm">
              The first automated take profit solution for Solana. Set it and forget it - we&apos;ll handle your exits.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-3">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com/YourOrg/autotp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Github size={14} />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/AutoTP" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Twitter size={14} />
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://docs.example.com/autotp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Documentation</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-3">Connect</h3>
            <p className="text-sm mb-2">Have questions or feedback?</p>
            <a 
              href="mailto:team@example.com"
              className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Contact Us
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/5 text-xs text-neutral-500 text-center">
          © {new Date().getFullYear()} AutoTP. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
