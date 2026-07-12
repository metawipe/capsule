import { useState } from 'react'
import { BackgroundModal } from './BackgroundModal'
import { CollectionModal } from './CollectionModal'
import { FiltersModal } from './FiltersModal'
import { SymbolModal } from './SymbolModal'
import { useMarketContext } from '@/features/market/model/MarketContext'

export type FilterModalType = 'filters' | 'collection' | 'backdrop' | 'symbol'

export function useFilterModalOrchestration() {
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [collectionModalOpen, setCollectionModalOpen] = useState(false)
  const [backgroundModalOpen, setBackgroundModalOpen] = useState(false)
  const [symbolModalOpen, setSymbolModalOpen] = useState(false)

  const openModal = (type: FilterModalType) => {
    if (type === 'filters') setFiltersModalOpen(true)
    else if (type === 'collection') setCollectionModalOpen(true)
    else if (type === 'backdrop') setBackgroundModalOpen(true)
    else setSymbolModalOpen(true)
  }

  return {
    filtersModalOpen,
    setFiltersModalOpen,
    collectionModalOpen,
    setCollectionModalOpen,
    backgroundModalOpen,
    setBackgroundModalOpen,
    symbolModalOpen,
    setSymbolModalOpen,
    openModal,
  }
}

type FilterModalOrchestratorProps = ReturnType<typeof useFilterModalOrchestration>

export function FilterModalOrchestrator({
  filtersModalOpen,
  setFiltersModalOpen,
  collectionModalOpen,
  setCollectionModalOpen,
  backgroundModalOpen,
  setBackgroundModalOpen,
  symbolModalOpen,
  setSymbolModalOpen,
}: FilterModalOrchestratorProps) {
  const {
    sort,
    setSort,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedCollections,
    setSelectedCollections,
    selectedBackdrops,
    setSelectedBackdrops,
    selectedSymbols,
    setSelectedSymbols,
  } = useMarketContext()

  return (
    <>
      <FiltersModal
        isOpen={filtersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        onOpenCollection={() => {
          setFiltersModalOpen(false)
          setCollectionModalOpen(true)
        }}
        onOpenBackground={() => {
          setFiltersModalOpen(false)
          setBackgroundModalOpen(true)
        }}
        onOpenSymbol={() => {
          setFiltersModalOpen(false)
          setSymbolModalOpen(true)
        }}
        selectedSort={sort}
        onSortChange={setSort}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={(min, max) => {
          setMinPrice(min)
          setMaxPrice(max)
        }}
      />
      <CollectionModal
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        selectedGifts={selectedCollections}
        onGiftsChange={setSelectedCollections}
      />
      <BackgroundModal
        isOpen={backgroundModalOpen}
        onClose={() => setBackgroundModalOpen(false)}
        selectedBackgrounds={selectedBackdrops}
        onBackgroundsChange={setSelectedBackdrops}
      />
      <SymbolModal
        isOpen={symbolModalOpen}
        onClose={() => setSymbolModalOpen(false)}
        selectedSymbols={selectedSymbols}
        onSymbolsChange={setSelectedSymbols}
      />
    </>
  )
}
