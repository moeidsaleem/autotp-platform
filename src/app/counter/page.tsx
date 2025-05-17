import CounterFeature from '@/components/counter/counter-feature'

// This is required because the counter uses Solana anchor libraries that aren't compatible with static rendering
export const dynamic = 'force-dynamic'

export default function Page() {
  return <CounterFeature />
}
