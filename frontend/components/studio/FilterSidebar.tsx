'use client';

import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSidebarProps {
  // Sort options
  sortBy: string;
  onSortChange: (value: string) => void;
  
  // Tier filter
  tier: string | null;
  onTierChange: (value: string | null) => void;
  
  // Provider filter
  provider: string | null;
  onProviderChange: (value: string | null) => void;
  
  // Clear all filters
  onClearAll: () => void;
  
  // Show/hide state
  isOpen?: boolean;
  onToggle?: () => void;
}

const SORT_OPTIONS: FilterOption[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Trending', value: 'trending' },
  { label: 'Most Remixed', value: 'most_remixed' },
];

const TIER_OPTIONS: FilterOption[] = [
  { label: 'Standard', value: 'standard' },
  { label: 'Premium', value: 'premium' },
  { label: 'Premium 4K', value: 'premium4' },
];

const PROVIDER_OPTIONS: FilterOption[] = [
  { label: 'Mock', value: 'mock' },
  { label: 'Hugging Face', value: 'huggingface' },
  { label: 'OpenAI DALL-E', value: 'openai_dalle' },
  { label: 'Gemini Nano Banana', value: 'gemini_nano_banana' },
];

export default function FilterSidebar({
  sortBy,
  onSortChange,
  tier,
  onTierChange,
  provider,
  onProviderChange,
  onClearAll,
  isOpen = true,
  onToggle,
}: FilterSidebarProps) {
  const hasActiveFilters = tier !== null || provider !== null || sortBy !== 'newest';

  return (
    <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
      <Card className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Filters</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <div className="space-y-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  sortBy === option.value
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Tier */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quality Tier
          </label>
          <div className="space-y-1">
            <button
              onClick={() => onTierChange(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                tier === null
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              All Tiers
            </button>
            {TIER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onTierChange(option.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  tier === option.value
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Provider */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Provider
          </label>
          <div className="space-y-1">
            <button
              onClick={() => onProviderChange(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                provider === null
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              All Providers
            </button>
            {PROVIDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onProviderChange(option.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  provider === option.value
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {sortBy !== 'newest' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                  <button onClick={() => onSortChange('newest')} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {tier && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                  {TIER_OPTIONS.find(o => o.value === tier)?.label}
                  <button onClick={() => onTierChange(null)} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {provider && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                  {PROVIDER_OPTIONS.find(o => o.value === provider)?.label}
                  <button onClick={() => onProviderChange(null)} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

