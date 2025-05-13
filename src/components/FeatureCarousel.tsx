
import React from 'react';
import { Check } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

const FeaturePoint = ({ title, children }: { title: string, children: React.ReactNode }) => {
  return (
    <AccordionItem value={title} className="border-white/10">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-[#44e1af]/10 flex items-center justify-center">
            <Check size={14} className="text-[#44e1af]" />
          </div>
          <span className="text-white font-medium">{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="text-neutral-400 text-sm pl-8">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export const FeatureCarousel = () => {
  const features = [
    {
      title: 'Trustless by Design',
      description: 'Armed, monitored, and executed fully on-chain — no backend required.'
    },
    {
      title: 'Set. Forget. Sleep Easy.',
      description: 'Targets set in 15 seconds. Auto-executed while you focus on life.'
    },
    {
      title: 'Lifetime Earnings',
      description: 'Lock referrers forever. Earn on every trade — forever.'
    }
  ];

  return (
    <div className={cn(
      "w-full flex flex-col items-start", // Changed from items-center to items-start
      "max-w-[380px]" // Removed mx-auto to keep left alignment
    )}>
      <h4 className="text-sm font-medium text-neutral-400 mb-6">
        Why AutoTP is Different
      </h4>
      
      <Accordion type="multiple" className="w-full">
        {features.map((feature, index) => (
          <FeaturePoint key={index} title={feature.title}>
            {feature.description}
          </FeaturePoint>
        ))}
      </Accordion>
    </div>
  );
};
