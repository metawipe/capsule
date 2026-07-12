import { motion, AnimatePresence } from 'framer-motion'
import { hapticLight } from '@/integrations/telegram/twa'
import { Modal } from '@/shared/ui/Modal'
import { sortOptions, type SortOption } from '@/shared/constants/sortOptions'
import './filters-modal.css'
import { useState, useEffect } from 'react'

interface FiltersModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenCollection: () => void
  onOpenBackground: () => void
  onOpenSymbol: () => void
  selectedSort: SortOption | null
  onSortChange: (sort: SortOption | null) => void
  minPrice: string
  maxPrice: string
  onPriceChange: (min: string, max: string) => void
}

type ExpandedSection = 'sort' | 'price' | null

function RowChevron({ open = false }: { open?: boolean }) {
  return (
    <svg
      width="8"
      height="5"
      viewBox="0 0 8 5"
      fill="none"
      aria-hidden="true"
      className={`filters-modal__rowChevron ${open ? 'filters-modal__rowChevron--open' : ''}`}
    >
      <path
        d="M3.99993 2.23324L1.43326 4.7999C1.29993 4.93324 1.14437 4.99712 0.966593 4.99157C0.788815 4.98601 0.63326 4.92212 0.499926 4.7999C0.366593 4.66657 0.297149 4.50824 0.291593 4.3249C0.286038 4.14157 0.349926 3.98324 0.48326 3.8499L3.04993 1.28324C3.30548 1.02768 3.62215 0.899902 3.99993 0.899902C4.3777 0.899902 4.69437 1.02768 4.94993 1.28324L7.51659 3.8499C7.64993 3.98324 7.71382 4.14157 7.70826 4.3249C7.7027 4.50824 7.63326 4.66657 7.49993 4.7999C7.36659 4.92212 7.21104 4.98601 7.03326 4.99157C6.85548 4.99712 6.69993 4.93324 6.56659 4.7999L3.99993 2.23324Z"
        fill="currentColor"
      />
    </svg>
  )
}

function FilterIcon({ children }: { children: string }) {
  return (
    <span className="filters-modal__iconWrap" aria-hidden="true">
      <span className="material-symbols-outlined filters-modal__icon">{children}</span>
    </span>
  )
}

export function FiltersModal({
  isOpen,
  onClose,
  onOpenCollection,
  onOpenBackground,
  onOpenSymbol,
  selectedSort,
  onSortChange,
  minPrice,
  maxPrice,
  onPriceChange,
}: FiltersModalProps) {
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null)
  const [localPrice, setLocalPrice] = useState({ min: minPrice, max: maxPrice })
  const [localSort, setLocalSort] = useState<SortOption | null>(selectedSort)

  useEffect(() => {
    if (!isOpen) return
    setExpandedSection(null)
    setLocalPrice({ min: minPrice, max: maxPrice })
    setLocalSort(selectedSort)
  }, [isOpen, minPrice, maxPrice, selectedSort])

  const rangeMin = 0
  const rangeMax = 100000

  const toggleSection = (section: ExpandedSection) => {
    hapticLight()
    setExpandedSection((current) => (current === section ? null : section))
  }

  const handleNavigate = (target: 'collection' | 'background' | 'symbol') => {
    hapticLight()
    if (target === 'collection') onOpenCollection()
    if (target === 'background') onOpenBackground()
    if (target === 'symbol') onOpenSymbol()
  }

  const handleSortSelect = (sort: SortOption) => {
    hapticLight()
    setLocalSort(sort)
    setExpandedSection(null)
  }

  const handleReset = () => {
    hapticLight()
    setLocalSort(null)
    setLocalPrice({ min: '0', max: '100000' })
  }

  const handleApply = () => {
    hapticLight()
    onSortChange(localSort)
    onPriceChange(localPrice.min, localPrice.max)
    onClose()
  }

  const clampToRange = (value: number) => Math.min(Math.max(value, rangeMin), rangeMax)

  const applyMin = (value: number) => {
    setLocalPrice((prev) => ({ ...prev, min: String(clampToRange(value)) }))
  }

  const applyMax = (value: number) => {
    setLocalPrice((prev) => ({ ...prev, max: String(clampToRange(value)) }))
  }

  const handleMinBlur = () => {
    if (localPrice.min === '') return applyMin(rangeMin)
    const numeric = Number(localPrice.min)
    applyMin(Number.isNaN(numeric) ? rangeMin : numeric)
  }

  const handleMaxBlur = () => {
    if (localPrice.max === '') return applyMax(rangeMax)
    const numeric = Number(localPrice.max)
    applyMax(Number.isNaN(numeric) ? rangeMax : numeric)
  }

  const selectedSortLabel = sortOptions.find((option) => option.value === localSort)?.label

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      className="filters-modal__sheet"
      bodyClassName="filters-modal__body"
    >
      <div className="filters-modal">
        <div className="filters-modal__list">
          <section className="filters-modal__section">
            <button type="button" className="filters-modal__row" onClick={() => toggleSection('sort')}>
              <FilterIcon>swap_vert</FilterIcon>
              <span className="filters-modal__rowInfo">
                <span className="filters-modal__rowLabel">Sort by</span>
                {selectedSortLabel && (
                  <span className="filters-modal__rowMeta">{selectedSortLabel}</span>
                )}
              </span>
              <RowChevron open={expandedSection === 'sort'} />
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'sort' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="filters-modal__panel"
                >
                  {sortOptions.map((option) => {
                    const isSelected = localSort === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`filters-modal__option ${isSelected ? 'filters-modal__option--selected' : ''}`}
                        onClick={() => handleSortSelect(option.value)}
                      >
                        <span className={`filters-modal__check ${isSelected ? 'filters-modal__check--selected' : ''}`} aria-hidden="true">
                          {isSelected && <span className="material-icons-round">check</span>}
                        </span>
                        <span className="filters-modal__optionLabel">{option.label}</span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="filters-modal__section">
            <button type="button" className="filters-modal__row" onClick={() => toggleSection('price')}>
              <FilterIcon>sell</FilterIcon>
              <span className="filters-modal__rowInfo">
                <span className="filters-modal__rowLabel">Price</span>
                {(localPrice.min !== '0' || localPrice.max !== '100000') && (
                  <span className="filters-modal__rowMeta">
                    {localPrice.min} – {localPrice.max} TON
                  </span>
                )}
              </span>
              <RowChevron open={expandedSection === 'price'} />
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'price' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="filters-modal__panel filters-modal__panel--price"
                >
                  <div className="filters-modal__priceInputs">
                    <input
                      type="number"
                      min={rangeMin}
                      max={rangeMax}
                      value={localPrice.min}
                      onChange={(event) => setLocalPrice((prev) => ({ ...prev, min: event.target.value }))}
                      onBlur={handleMinBlur}
                      className="filters-modal__priceInput"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min={rangeMin}
                      max={rangeMax}
                      value={localPrice.max}
                      onChange={(event) => setLocalPrice((prev) => ({ ...prev, max: event.target.value }))}
                      onBlur={handleMaxBlur}
                      className="filters-modal__priceInput"
                      placeholder="Max"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <button type="button" className="filters-modal__row" onClick={() => handleNavigate('collection')}>
            <FilterIcon>auto_awesome_mosaic</FilterIcon>
            <span className="filters-modal__rowInfo">
              <span className="filters-modal__rowLabel">Collection</span>
            </span>
            <RowChevron />
          </button>

          <button type="button" className="filters-modal__row filters-modal__row--disabled" disabled>
            <FilterIcon>trail_length_short</FilterIcon>
            <span className="filters-modal__rowInfo">
              <span className="filters-modal__rowLabel">Model</span>
            </span>
            <RowChevron />
          </button>

          <button type="button" className="filters-modal__row" onClick={() => handleNavigate('background')}>
            <FilterIcon>palette</FilterIcon>
            <span className="filters-modal__rowInfo">
              <span className="filters-modal__rowLabel">Background</span>
            </span>
            <RowChevron />
          </button>

          <button type="button" className="filters-modal__row" onClick={() => handleNavigate('symbol')}>
            <FilterIcon>add_reaction</FilterIcon>
            <span className="filters-modal__rowInfo">
              <span className="filters-modal__rowLabel">Symbol</span>
            </span>
            <RowChevron />
          </button>
        </div>

        <div className="filters-modal__footer">
          <button type="button" className="filters-modal__btn filters-modal__btn--secondary" onClick={handleReset}>
            Reset
          </button>
          <button type="button" className="filters-modal__btn filters-modal__btn--primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </Modal>
  )
}
