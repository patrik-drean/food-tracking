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
    <div className="flex justify-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={disabled || isLoading}
      >
        <SparklesIcon className="w-4 h-4 mr-2" />
        {isLoading ? (
          <span>Analyzing...</span>
        ) : hasAnalyzed ? (
          <span>Re-analyze with AI</span>
        ) : (
          <span>Get AI Nutrition Estimate</span>
        )}
      </Button>
    </div>
  );
}
