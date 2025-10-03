'use client';

import { Button } from '@/components/ui/Button';
import { SparklesIcon } from '@/components/icons/SparklesIcon';

interface AIAnalysisButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  hasAnalyzed: boolean;
}

export function AIAnalysisButton({
  onClick,
  isLoading,
  disabled,
  hasAnalyzed,
}: AIAnalysisButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full"
    >
      <SparklesIcon className="w-4 h-4 mr-2" />
      {isLoading ? (
        <span>Analyzing nutrition...</span>
      ) : hasAnalyzed ? (
        <span>Re-analyze with AI</span>
      ) : (
        <span>Get AI Nutrition Estimate</span>
      )}
    </Button>
  );
}
