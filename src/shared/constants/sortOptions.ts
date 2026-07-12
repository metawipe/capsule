export type SortOption = 'latest' | 'price-low' | 'price-high' | 'id-asc' | 'id-desc' | 'rarity-asc' | 'rarity-desc'

export const sortOptions: ReadonlyArray<{ value: SortOption; label: string }> = [
  { value: 'latest', label: 'Latest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'id-asc', label: 'Gift ID: Ascending' },
  { value: 'id-desc', label: 'Gift ID: Descending' },
  { value: 'rarity-asc', label: 'Model rarity: Ascending' },
  { value: 'rarity-desc', label: 'Model rarity: Descending' },
]
