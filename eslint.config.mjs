import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // More permissive - allow unused variables
      '@typescript-eslint/no-explicit-any': 'off', // Allow any type
      'react-hooks/exhaustive-deps': 'off', // Don't enforce dependency arrays
      'no-console': 'off', // Allow console logs
      'no-debugger': 'off', // Allow debugger statements
      'no-alert': 'off', // Allow alerts
      'no-restricted-globals': 'off', // Allow global variables
      'prefer-const': 'off', // Don't enforce const usage
      'no-var': 'off', // Allow var declarations
      'eqeqeq': 'off' // Allow == instead of ===
    }
  }
]

export default eslintConfig
