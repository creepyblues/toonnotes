'use client';

import { EarlyAccessHero } from '@/components/early-access/Hero';
import { PainCards } from '@/components/early-access/PainCards';
import { Promise } from '@/components/early-access/Promise';
import { HowItWorks } from '@/components/early-access/HowItWorks';
import { DesignShowcase } from '@/components/early-access/DesignShowcase';
import { SignupForm } from '@/components/early-access/SignupForm';
import { useState } from 'react';

export default function EarlyAccessPage() {
  const [selectedPains, setSelectedPains] = useState<string[]>([]);

  return (
    <>
      <EarlyAccessHero />
      <PainCards
        selectedPains={selectedPains}
        onSelectPain={(pain) => {
          setSelectedPains(prev =>
            prev.includes(pain)
              ? prev.filter(p => p !== pain)
              : [...prev, pain]
          );
        }}
      />
      <Promise />
      <HowItWorks />
      <DesignShowcase />
      <SignupForm selectedPains={selectedPains} />
    </>
  );
}
