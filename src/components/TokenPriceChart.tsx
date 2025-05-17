import React, { useState, useEffect } from 'react';
import { ChartContainer } from "./ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

interface TokenPriceChartProps {
  selectedToken: {
    symbol: string;
    name: string;
    price?: number;
  };
}

// Mock generator for each timeframe. Each returns a plausible array of {time, price} pairs.
const mockPriceHistory = {
  "24h": (latest: number) => {
    const data = [];
    let price = latest;
    for (let i = 23; i >= 0; i--) {
      const drift = Math.sin(i / 4) * 0.006; // Simulated gentle trend
      price += drift + (Math.random() - 0.5) * (latest * 0.007);
      price = Math.max(0.2, price);
      data.unshift({
        label: `${i}h`,
        price: Number(price.toFixed(2))
      });
    }
    return data;
  },
  "7d": (latest: number) => {
    const data = [];
    let price = latest;
    for (let i = 6; i >= 0; i--) {
      // Simulate slightly bigger day-to-day movement
      const drift = Math.cos(i / 2) * 0.04;
      price += drift + (Math.random() - 0.5) * (latest * 0.02);
      price = Math.max(0.2, price);
      data.unshift({
        label: `${i + 1}d`,
        price: Number(price.toFixed(2))
      });
    }
    // Fill with a few intra-day points for smoothness between days
    const smooth = [];
    for (let i = 0; i < data.length - 1; i++) {
      const a = data[i], b = data[i + 1];
      smooth.push(a);
      // Interpolate mid-point
      smooth.push({
        label: `${Number(a.label.replace("d", "")) + 0.5}d`,
        price: ((a.price + b.price) / 2) + ((Math.random() - 0.5) * 0.01)
      });
    }
    smooth.push(data[data.length - 1]);
    return smooth;
  },
  "1m": (latest: number) => {
    // 30 days, show 1/day plus some weekly modulation
    const data = [];
    let price = latest;
    for (let i = 29; i >= 0; i--) {
      const drift = Math.sin(i / 7) * 0.12;
      price += drift + (Math.random() - 0.5) * (latest * 0.025);
      price = Math.max(0.2, price);
      data.unshift({
        label: `${i + 1}`,
        price: Number(price.toFixed(2))
      });
    }
    return data;
  },
  "max": (_: number) => {
    // "max" = 2 years, show every 2 weeks (52 points)
    const data = [];
    let price = 1.5;
    for (let i = 51; i >= 0; i--) {
      const drift = Math.sin(i / 8) * 0.20 + Math.cos(i / 4) * 0.07;
      price += drift + (Math.random() - 0.5) * 0.08;
      price = Math.max(0.2, price);
      data.unshift({
        label: `${52 - i}w`,
        price: Number(price.toFixed(2))
      });
    }
    // Shift last point to current/latest if provided, for realistic ending
    if (data.length && _ !== undefined) {
      data[data.length - 1].price = Number(_.toFixed(2));
    }
    return data;
  }
};

const TIMEFRAMES = [
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "1m", value: "1m" },
  { label: "Max", value: "max" },
] as const;
type Timeframe = typeof TIMEFRAMES[number]["value"];

export const TokenPriceChart: React.FC<TokenPriceChartProps> = ({ selectedToken }) => {
  const defaultPrice = selectedToken?.price ?? 2.15;
  const [timeframe, setTimeframe] = useState<Timeframe>("24h");
  const [priceHistory, setPriceHistory] = useState<{ label: string, price: number }[]>([]);
  const [animate, setAnimate] = useState(true);
  const [livePrice, setLivePrice] = useState(defaultPrice);

  // Format price with commas for thousands
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // On selectedToken or timeframe change: generate mock history, run animation ONCE.
  useEffect(() => {
    setAnimate(true);
    // Generate new mock data for this timeframe and token
    const generator = mockPriceHistory[timeframe];
    const data = generator(defaultPrice);
    setPriceHistory(data);
    setLivePrice(data[data.length - 1].price);
    // Stop further animation after short period
    const timeout = setTimeout(() => setAnimate(false), 800);
    return () => clearTimeout(timeout);
  }, [selectedToken, timeframe, defaultPrice]);

  return (
    <div className="w-full h-full token-price-chart">
      <div className="flex items-center justify-between mb-3">
        <div className="text-base font-medium">{selectedToken.symbol}</div>
        <div className="text-xl font-bold">{formatPrice(livePrice)}</div>
      </div>
      
      {/* Chart itself */}
      <div className="h-36 w-full rounded-lg overflow-hidden">
        <ChartContainer config={{
          price: {
            label: "Price",
            color: "#4ade80"
          }
        }}>
          <LineChart data={priceHistory}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#8884d8", opacity: 0.65 }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              domain={["auto", "auto"]}
              width={24}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#777", opacity: 0.65 }}
            />
            <Tooltip
              contentStyle={{
                background: "#222",
                borderRadius: "8px",
                border: "none",
                color: "#fff"
              }}
              labelFormatter={v => v}
              formatter={(v) => [`$${v}`, "Price"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#4ade80"
              dot={false}
              strokeWidth={2}
              isAnimationActive={animate}
              animationDuration={600}
            />
          </LineChart>
        </ChartContainer>
      </div>
      
      {/* Time period selector */}
      <div className="flex justify-center mt-4 space-x-2">
        {TIMEFRAMES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTimeframe(value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              timeframe === value 
                ? 'bg-neutral-700 text-white' 
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

