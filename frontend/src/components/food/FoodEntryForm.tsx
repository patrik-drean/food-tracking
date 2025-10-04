'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NutritionInputs } from './NutritionInputs';
import { AIAnalysisButton } from './AIAnalysisButton';
import { LoadingNutritionState } from './LoadingNutritionState';
import { FoodSuggestionDropdown } from './FoodSuggestionDropdown';
import { useFoodSuggestions } from './hooks/useFoodSuggestions';
import { FoodEntrySchema, type FoodEntryFormData } from './FoodFormSchema';
import { useMutation } from 'urql';

// GraphQL mutation for adding food
const ADD_FOOD_MUTATION = `
  mutation AddFood($input: AddFoodInput!) {
    addFood(input: $input) {
      id
      description
      calories
      protein
      carbs
      fat
      createdAt
    }
  }
`;

// GraphQL mutation for AI nutrition analysis
const ANALYZE_FOOD_NUTRITION_MUTATION = `
  mutation AnalyzeFoodNutrition($description: String!) {
    analyzeFoodNutrition(description: $description) {
      calories
      fat
      carbs
      protein
      source
      confidence
    }
  }
`;

interface FoodEntryFormProps {
  onSuccess?: () => void;
}

/**
 * Main food entry form component with AI nutrition analysis and food suggestions
 * Implements AI-powered nutrition estimation with manual override option
 * Includes smart typeahead suggestions from food history
 */
export function FoodEntryForm({ onSuccess }: FoodEntryFormProps) {
  const [showNutritionInputs, setShowNutritionInputs] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [aiSource, setAiSource] = useState<'AI_GENERATED' | 'CACHED' | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [addFoodResult, addFoodMutation] = useMutation(ADD_FOOD_MUTATION);
  const [analyzeResult, analyzeMutation] = useMutation(ANALYZE_FOOD_NUTRITION_MUTATION);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FoodEntryFormData>({
    resolver: zodResolver(FoodEntrySchema),
    defaultValues: {
      description: '',
      nutrition: {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
      },
    },
  });

  const description = watch('description');

  // Get food suggestions based on input
  const { suggestions, isLoading: suggestionsLoading } = useFoodSuggestions(
    description || '',
    {
      minLength: 2,
      debounceMs: 300,
      maxResults: 10,
    }
  );

  /**
   * Handle selecting a food from suggestions
   */
  const handleSelectSuggestion = (food: any) => {
    // Set description
    setValue('description', food.description);

    // Pre-fill nutrition if available
    if (food.calories || food.protein || food.carbs || food.fat) {
      setValue('nutrition.calories', food.calories || 0);
      setValue('nutrition.fat', food.fat || 0);
      setValue('nutrition.carbohydrates', food.carbs || 0);
      setValue('nutrition.protein', food.protein || 0);

      setShowNutritionInputs(true);
      setHasAnalyzed(true);
      setAiSource('CACHED'); // Indicate it's from history
    }

    setShowSuggestions(false);
  };

  /**
   * Handle AI analysis of food description
   */
  const handleAIAnalysis = async () => {
    const trimmedDescription = description?.trim();

    if (!trimmedDescription) {
      return;
    }

    setIsAnalyzing(true);
    setShowNutritionInputs(true);

    try {
      const result = await analyzeMutation({
        description: trimmedDescription,
      });

      if (result.data?.analyzeFoodNutrition) {
        const nutrition = result.data.analyzeFoodNutrition;

        // Pre-fill nutrition inputs with AI results
        setValue('nutrition.calories', nutrition.calories);
        setValue('nutrition.fat', nutrition.fat);
        setValue('nutrition.carbohydrates', nutrition.carbs);
        setValue('nutrition.protein', nutrition.protein);

        setHasAnalyzed(true);
        setAiSource(nutrition.source as 'AI_GENERATED' | 'CACHED');
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Show error notification to user
      alert('Failed to analyze nutrition. Please enter values manually or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: FoodEntryFormData) => {
    try {
      const nutritionData = data.nutrition;
      const hasNutrition = nutritionData &&
        Object.values(nutritionData).some((v) => v !== undefined && v !== null && !isNaN(v as number));

      const result = await addFoodMutation({
        input: {
          description: data.description,
          nutrition: hasNutrition ? {
            calories: nutritionData?.calories ?? null,
            protein: nutritionData?.protein ?? null,
            carbs: nutritionData?.carbohydrates ?? null,
            fat: nutritionData?.fat ?? null,
          } : null,
        },
      });

      if (result.data?.addFood) {
        reset();
        setShowNutritionInputs(false);
        setHasAnalyzed(false);
        setAiSource(null);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to add food:', error);
    }
  };

  const canAnalyze = description && description.trim().length > 0 && !isAnalyzing;

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add Food Entry
          </h3>
        </div>

        {/* Food description input with typeahead */}
        <div className="relative">
          <Input
            {...register('description', {
              onChange: () => {
                setShowSuggestions(true);
              },
            })}
            label="Food Description"
            placeholder="2 slices whole wheat toast"
            error={errors.description?.message}
            onFocus={() => setShowSuggestions(true)}
            rightIcon={suggestionsLoading ? <LoadingSpinner size="sm" /> : undefined}
          />

          {/* Suggestion dropdown */}
          <FoodSuggestionDropdown
            suggestions={suggestions}
            isLoading={suggestionsLoading}
            onSelect={handleSelectSuggestion}
            onClose={() => setShowSuggestions(false)}
            isOpen={showSuggestions && suggestions.length > 0}
          />
        </div>

        {/* AI Analysis Button */}
        <AIAnalysisButton
          onClick={handleAIAnalysis}
          isLoading={isAnalyzing}
          disabled={!canAnalyze}
          hasAnalyzed={hasAnalyzed}
        />

        {/* Show loading state while analyzing */}
        {isAnalyzing && <LoadingNutritionState />}

        {/* Show nutrition inputs when analysis is done or user wants manual entry */}
        {!isAnalyzing && showNutritionInputs && (
          <div className="space-y-3">
            <NutritionInputs
              register={register}
              errors={errors.nutrition}
              setValue={setValue}
              watch={watch}
              aiSource={aiSource}
            />
          </div>
        )}

        {/* Manual entry toggle (only show if not analyzing and inputs not shown) */}
        {!isAnalyzing && !showNutritionInputs && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowNutritionInputs(true)}
            className="w-full"
          >
            Or enter nutrition manually
          </Button>
        )}

        {(addFoodResult.error || analyzeResult.error) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {addFoodResult.error
                ? 'Failed to save food entry. Please try again.'
                : 'Failed to analyze nutrition. Please enter values manually.'}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="flex-1"
            isLoading={isSubmitting}
            disabled={isSubmitting || isAnalyzing}
          >
            {isSubmitting ? 'Saving...' : 'Add Food'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setShowNutritionInputs(false);
              setHasAnalyzed(false);
              setAiSource(null);
            }}
            disabled={isSubmitting || isAnalyzing}
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
}
