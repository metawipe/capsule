import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Modal } from '@/shared/ui/Modal'
import { SearchField } from '@/shared/ui/SearchField'
import { hapticLight } from '@/integrations/telegram/twa'
import { Skeleton } from '@/shared/ui/Skeleton'
import './filter-list-modal.css'

export interface FilterListItem {
  name: string
  slug?: string
  icon?: string
  count?: number
  minPrice?: number
  volume24h?: number
  isNew?: boolean
}

const cache = new Map<string, FilterListItem[]>()

type SortPhase = null | 'desc' | 'asc'

function cycleSortPhase(phase: SortPhase): SortPhase {
  if (phase === null) return 'desc'
  if (phase === 'desc') return 'asc'
  return null
}

function SortChevron({ flipped = false, active = false }: { flipped?: boolean; active?: boolean }) {
  return (
    <svg
      width="8"
      height="5"
      viewBox="0 0 8 5"
      fill="none"
      aria-hidden="true"
      className={`filter-list-modal__sortChevron ${flipped ? 'filter-list-modal__sortChevron--flipped' : ''} ${active ? 'filter-list-modal__sortChevron--active' : ''}`}
    >
      <path
        d="M3.99993 2.23324L1.43326 4.7999C1.29993 4.93324 1.14437 4.99712 0.966593 4.99157C0.788815 4.98601 0.63326 4.92212 0.499926 4.7999C0.366593 4.66657 0.297149 4.50824 0.291593 4.3249C0.286038 4.14157 0.349926 3.98324 0.48326 3.8499L3.04993 1.28324C3.30548 1.02768 3.62215 0.899902 3.99993 0.899902C4.3777 0.899902 4.69437 1.02768 4.94993 1.28324L7.51659 3.8499C7.64993 3.98324 7.71382 4.14157 7.70826 4.3249C7.7027 4.50824 7.63326 4.66657 7.49993 4.7999C7.36659 4.92212 7.21104 4.98601 7.03326 4.99157C6.85548 4.99712 6.69993 4.93324 6.56659 4.7999L3.99993 2.23324Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SortChevrons({ phase }: { phase: SortPhase }) {
  return (
    <span className="filter-list-modal__sortChevrons" aria-hidden="true">
      <SortChevron active={phase === 'desc'} />
      <SortChevron flipped active={phase === 'asc'} />
    </span>
  )
}

interface FilterListModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  source: string
  selected: string[]
  onChange: (selected: string[]) => void
}

function formatCompactCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(value)
}

function formatPrice(value: number) {
  const formatted = value >= 100 ? value.toFixed(0) : value.toFixed(2).replace(/\.?0+$/, '')
  return `${formatted} TON`
}

export function FilterListModal({ isOpen, onClose, title, source, selected, onChange }: FilterListModalProps) {
  const [items, setItems] = useState<FilterListItem[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [draftSelected, setDraftSelected] = useState<string[]>(selected)
  const [nameSort, setNameSort] = useState<SortPhase>(null)
  const [priceSort, setPriceSort] = useState<SortPhase>(null)

  useEffect(() => {
    if (!isOpen) return
    setDraftSelected(selected)
    setQuery('')
    setNameSort(null)
    setPriceSort(null)
  }, [isOpen, selected])

  useEffect(() => {
    if (!isOpen) return
    const saved = cache.get(source)
    if (saved) {
      setItems(saved)
      return
    }
    setLoading(true)
    void fetch(source)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`Failed to load ${title}`)))
      .then((data: FilterListItem[]) => {
        cache.set(source, data)
        setItems(data)
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false))
  }, [isOpen, source, title])

  const hasPriceData = useMemo(
    () => items.some((item) => typeof item.minPrice === 'number'),
    [items],
  )

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const filtered = items.filter((item) => {
      if (!normalizedQuery) return true
      return item.name.toLowerCase().includes(normalizedQuery)
    })

    const directionMultiplier = (phase: SortPhase) => (phase === 'asc' ? 1 : -1)

    return [...filtered].sort((a, b) => {
      if (priceSort && hasPriceData) {
        const aPrice = a.minPrice ?? Number.POSITIVE_INFINITY
        const bPrice = b.minPrice ?? Number.POSITIVE_INFINITY
        if (aPrice !== bPrice) return (aPrice - bPrice) * directionMultiplier(priceSort)
      }

      if (nameSort) {
        return a.name.localeCompare(b.name) * directionMultiplier(nameSort)
      }

      const aId = a.slug || a.name
      const bId = b.slug || b.name
      const aSelected = draftSelected.includes(aId)
      const bSelected = draftSelected.includes(bId)
      if (aSelected !== bSelected) return Number(bSelected) - Number(aSelected)

      return a.name.localeCompare(b.name)
    })
  }, [items, query, draftSelected, nameSort, priceSort, hasPriceData])

  const toggle = (item: FilterListItem) => {
    hapticLight()
    const id = item.slug || item.name
    setDraftSelected((current) => (
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    ))
  }

  const handleNameSortClick = () => {
    hapticLight()
    setPriceSort(null)
    setNameSort((current) => cycleSortPhase(current))
  }

  const handlePriceSortClick = () => {
    hapticLight()
    setNameSort(null)
    setPriceSort((current) => cycleSortPhase(current))
  }

  const handleReset = () => {
    hapticLight()
    setDraftSelected([])
    setQuery('')
    setNameSort(null)
    setPriceSort(null)
  }

  const handleApply = () => {
    hapticLight()
    onChange(draftSelected)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="filter-list-modal__sheet"
      bodyClassName="filter-list-modal__body"
    >
      <div className="filter-list-modal">
        <SearchField value={query} onChange={setQuery} />

        <div className="filter-list-modal__sortBar">
          <button
            type="button"
            className="filter-list-modal__sortBtn filter-list-modal__sortBtn--left"
            onClick={handleNameSortClick}
          >
            <span>{title}</span>
            <SortChevrons phase={nameSort} />
          </button>
          <button
            type="button"
            className="filter-list-modal__sortBtn filter-list-modal__sortBtn--right"
            onClick={handlePriceSortClick}
          >
            <span>Min. price</span>
            <SortChevrons phase={priceSort} />
          </button>
        </div>

        {loading ? (
          <div className="filter-list-modal__list" aria-label={`Loading ${title.toLowerCase()}`} aria-busy="true">
            {Array.from({ length: 7 }, (_, index) => (
              <div className="filter-list-modal__item filter-list-modal__item--skeleton" key={index}>
                <Skeleton className="filter-list-modal__skeleton-check" />
                <Skeleton className="filter-list-modal__skeleton-icon" />
                <div className="filter-list-modal__skeleton-info">
                  <Skeleton className="filter-list-modal__skeleton-label" />
                  <Skeleton className="filter-list-modal__skeleton-meta" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="filter-list-modal__list">
            {visibleItems.length === 0 ? (
              <div className="filter-list-modal__empty">No results found</div>
            ) : (
              visibleItems.map((item) => {
                const id = item.slug || item.name
                const isSelected = draftSelected.includes(id)
                const showStats = typeof item.minPrice === 'number' || typeof item.volume24h === 'number'

                return (
                  <motion.button
                    type="button"
                    key={id}
                    className={`filter-list-modal__item ${isSelected ? 'filter-list-modal__item--selected' : ''}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => toggle(item)}
                  >
                    <span className={`filter-list-modal__check ${isSelected ? 'filter-list-modal__check--selected' : ''}`} aria-hidden="true">
                      {isSelected && <span className="material-icons-round">check</span>}
                    </span>

                    <span className="filter-list-modal__thumbCol">
                      {item.icon ? (
                        <span className="filter-list-modal__iconWrap">
                          <img src={item.icon} alt="" loading="lazy" />
                        </span>
                      ) : (
                        <span className="filter-list-modal__iconWrap filter-list-modal__iconWrap--placeholder" aria-hidden="true" />
                      )}
                      {typeof item.count === 'number' && (
                        <span className="filter-list-modal__count">
                          {formatCompactCount(item.count)}
                          <span className="filter-list-modal__countIcon" aria-hidden="true">🎁</span>
                        </span>
                      )}
                    </span>

                    <span className="filter-list-modal__info">
                      <span className="filter-list-modal__nameRow">
                        <span className="filter-list-modal__label">{item.name}</span>
                        {item.isNew && (
                          <span className="filter-list-modal__badge">
                            <span className="filter-list-modal__badgeIcon" aria-hidden="true">🎁</span>
                            NEW
                          </span>
                        )}
                      </span>
                    </span>

                    {showStats && (
                      <span className="filter-list-modal__stats">
                        {typeof item.minPrice === 'number' && (
                          <span className="filter-list-modal__price">{formatPrice(item.minPrice)}</span>
                        )}
                        {typeof item.volume24h === 'number' && (
                          <span className="filter-list-modal__volume">24h vol: {formatCompactCount(item.volume24h)}</span>
                        )}
                      </span>
                    )}
                  </motion.button>
                )
              })
            )}
          </div>
        )}

        <div className="filter-list-modal__footer">
          <button type="button" className="filter-list-modal__btn filter-list-modal__btn--secondary" onClick={handleReset}>
            Reset
          </button>
          <button type="button" className="filter-list-modal__btn filter-list-modal__btn--primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </Modal>
  )
}
