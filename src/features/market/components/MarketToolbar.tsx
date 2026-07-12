import { useEffect, useMemo, useState } from 'react'
import type { BottomTab } from '@/features/navigation/BottomNav'
import { hapticLight } from '@/integrations/telegram/twa'
import { useMarketContext } from '@/features/market/model/MarketContext'
import { SearchField } from '@/shared/ui/SearchField'
import type { FilterModalType } from '@/features/market/components/FilterModalOrchestrator'

interface MarketToolbarProps {
  activeTab: BottomTab
  onOpenModal: (type: FilterModalType) => void
  sticky?: boolean
}

function ListViewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M0 3.61912C0 2.56715 1.02335 1.71436 2.28571 1.71436H13.7143C14.9767 1.71436 16 2.56715 16 3.61912V5.52388C16 6.57585 14.9767 7.42864 13.7143 7.42864H2.28571C1.02335 7.42864 0 6.57585 0 5.52388V3.61912Z" fill="currentColor" fillOpacity="0.4" />
      <path d="M0 10.4763C0 9.42429 1.02335 8.5715 2.28571 8.5715H13.7143C14.9767 8.5715 16 9.42429 16 10.4763V12.381C16 13.433 14.9767 14.2858 13.7143 14.2858H2.28571C1.02335 14.2858 0 13.433 0 12.381V10.4763Z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

function GridViewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M0 2.28571C0 1.02335 1.02335 0 2.28571 0H4.57143C5.83379 0 6.85714 1.02335 6.85714 2.28571V4.57143C6.85714 5.83379 5.83379 6.85714 4.57143 6.85714H2.28571C1.02335 6.85714 0 5.83379 0 4.57143V2.28571Z" fill="currentColor" fillOpacity="0.4" />
      <path d="M9.14286 2.28571C9.14286 1.02335 10.1662 0 11.4286 0H13.7143C14.9767 0 16 1.02335 16 2.28571V4.57143C16 5.83379 14.9767 6.85714 13.7143 6.85714H11.4286C10.1662 6.85714 9.14286 5.83379 9.14286 4.57143V2.28571Z" fill="currentColor" fillOpacity="0.4" />
      <path d="M0 9.14286C0 7.8805 1.02335 6.85714 2.28571 6.85714H4.57143C5.83379 6.85714 6.85714 7.8805 6.85714 9.14286V11.4286C6.85714 12.6909 5.83379 13.7143 4.57143 13.7143H2.28571C1.02335 13.7143 0 12.6909 0 11.4286V9.14286Z" fill="currentColor" fillOpacity="0.4" />
      <path d="M9.14286 9.14286C9.14286 7.8805 10.1662 6.85714 11.4286 6.85714H13.7143C14.9767 6.85714 16 7.8805 16 9.14286V11.4286C16 12.6909 14.9767 13.7143 13.7143 13.7143H11.4286C10.1662 13.7143 9.14286 12.6909 9.14286 11.4286V9.14286Z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

function SortChevron() {
  return (
    <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true" className="ph__filterSortChevron">
      <path d="M3.99993 2.23324L1.43326 4.7999C1.29993 4.93324 1.14437 4.99712 0.966593 4.99157C0.788815 4.98601 0.63326 4.92212 0.499926 4.7999C0.366593 4.66657 0.297149 4.50824 0.291593 4.3249C0.286038 4.14157 0.349926 3.98324 0.48326 3.8499L3.04993 1.28324C3.30548 1.02768 3.62215 0.899902 3.99993 0.899902C4.3777 0.899902 4.69437 1.02768 4.94993 1.28324L7.51659 3.8499C7.64993 3.98324 7.71382 4.14157 7.70826 4.3249C7.7027 4.50824 7.63326 4.66657 7.49993 4.7999C7.36659 4.92212 7.21104 4.98601 7.03326 4.99157C6.85548 4.99712 6.69993 4.93324 6.56659 4.7999L3.99993 2.23324Z" fill="currentColor" />
    </svg>
  )
}

export function MarketToolbar({ activeTab, onOpenModal, sticky = false }: MarketToolbarProps) {
  const [activeFilter, setActiveFilter] = useState<'collection' | 'backdrop' | 'symbol'>('collection')
  const [showLeftBlur, setShowLeftBlur] = useState(false)
  const [showRightBlur, setShowRightBlur] = useState(false)
  const {
    searchQuery,
    setSearchQuery,
    sort,
    minPrice,
    maxPrice,
    selectedCollections,
    selectedBackdrops,
    selectedSymbols,
    marketViewMode,
    setMarketViewMode,
  } = useMarketContext()

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (sort && sort !== 'latest') count++
    if (minPrice !== '0' || maxPrice !== '100000') count++
    if (selectedCollections.length > 0) count++
    if (selectedBackdrops.length > 0) count++
    if (selectedSymbols.length > 0) count++
    return count
  }, [sort, minPrice, maxPrice, selectedCollections, selectedBackdrops, selectedSymbols])

  const modelEnabled = selectedCollections.length > 0

  useEffect(() => {
    if (activeTab !== 'market' && activeTab !== 'my-gifts') {
      setShowLeftBlur(false)
      setShowRightBlur(false)
      return
    }

    const updateBlur = () => {
      const filterButtons = document.querySelector('.ph__filterButtons') as HTMLElement | null
      if (!filterButtons) return
      const maxScroll = filterButtons.scrollWidth - filterButtons.clientWidth
      setShowLeftBlur(filterButtons.scrollLeft > 5)
      setShowRightBlur(filterButtons.scrollLeft < maxScroll - 5)
    }

    const timer = setTimeout(updateBlur, 100)
    const filterButtons = document.querySelector('.ph__filterButtons') as HTMLElement | null
    filterButtons?.addEventListener('scroll', updateBlur)
    window.addEventListener('resize', updateBlur)

    return () => {
      clearTimeout(timer)
      filterButtons?.removeEventListener('scroll', updateBlur)
      window.removeEventListener('resize', updateBlur)
    }
  }, [activeTab, selectedCollections.length])

  if (activeTab !== 'market' && activeTab !== 'my-gifts') return null

  const openFilter = (type: FilterModalType) => {
    hapticLight()
    onOpenModal(type)
  }

  const toggleViewMode = () => {
    hapticLight()
    setMarketViewMode(marketViewMode === 'grid' ? 'list' : 'grid')
  }

  const filterButton = (
    type: 'collection' | 'backdrop' | 'symbol',
    label: string,
    selection: string[],
  ) => (
    <button
      key={type}
      className={`ph__filterBtn ph__filterBtn--large ${activeFilter === type ? 'ph__filterBtn--active' : ''} ${selection.length > 0 ? 'ph__filterBtn--hasSelection' : ''}`}
      onClick={() => {
        hapticLight()
        setActiveFilter(type)
        openFilter(type)
      }}
    >
      <span className="ph__filterBtnText">
        {label}
        {selection.length > 0 && <span className="ph__filterBtnCount"> ({selection.length})</span>}
      </span>
      <span className="mdi mdi-unfold-more-horizontal" />
    </button>
  )

  return (
    <div className={`ph__marketControls${sticky ? ' ph__marketControls--sticky' : ''}${activeTab === 'my-gifts' ? ' ph__marketControls--my-gifts' : ''}`}>
      <div className="ph__searchRow">
        <SearchField value={searchQuery} onChange={setSearchQuery} className="ph__searchRow-field" />
        {activeTab === 'market' && (
          <button
            type="button"
            className={`ph__filterBtn ph__filterBtn--icon ph__filterBtn--view ${marketViewMode === 'list' ? 'ph__filterBtn--active' : ''}`}
            onClick={toggleViewMode}
            aria-label={marketViewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {marketViewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
          </button>
        )}
      </div>

      <div className="ph__filterButtonsContainer">
        <button className="ph__filterBtn ph__filterBtn--icon ph__filterBtn--left" onClick={() => openFilter('filters')}>
          <span className="mdi mdi-tune" />
          {activeFiltersCount > 0 && <span className="ph__filterBadge">{activeFiltersCount}</span>}
        </button>
        <div className={`ph__filterButtonsWrapper ${showLeftBlur ? 'ph__filterButtonsWrapper--showLeft' : ''} ${showRightBlur ? 'ph__filterButtonsWrapper--showRight' : ''}`}>
          <div className="ph__filterButtons">
            {filterButton('collection', 'Collection', selectedCollections)}
            <button
              type="button"
              className={`ph__filterBtn ph__filterBtn--large ph__filterBtn--model ${modelEnabled ? '' : 'ph__filterBtn--inactive'}`}
              disabled={!modelEnabled}
            >
              <span className="ph__filterBtnText">Model</span>
              <span className="ph__filterSortChevrons"><SortChevron /></span>
            </button>
            {filterButton('backdrop', 'Backdrop', selectedBackdrops)}
            {filterButton('symbol', 'Symbol', selectedSymbols)}
          </div>
        </div>
      </div>
    </div>
  )
}
