import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, type ReactNode } from 'react'
import type { GiftPreview } from '@/shared/api/types'
import type { SortOption } from '@/shared/constants/sortOptions'

// Тип данных из парсера fragment_parser.py
interface ParsedGift {
  name: string
  collection: string
  id: string
  url: string
  model: string | null
  backdrop: string | null
  symbol: string | null
  issued: string | null
  price_ton: number | null
  price_ton_discounted: number | null
  lottie_url: string | null
}

function normalizeFilterValue(value: string) {
  return value
    .toLowerCase()
    .replace(/\s*\d+\.?\d*\s*%/g, '')
    .replace(/\s*\d+/g, '')
    .replace(/[\s\-_]/g, '')
    .trim()
}

interface MarketContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: GiftPreview[]
  isSearching: boolean
  searchError: string | null
  activeTab: 'unlisted' | 'listed'
  setActiveTab: (tab: 'unlisted' | 'listed') => void
  gifts: GiftPreview[]
  isLoadingGifts: boolean
  isRefreshingGifts: boolean
  giftsError: string | null
  refreshGifts: () => Promise<void>
  loadMoreGifts: () => void
  hasMoreGifts: boolean
  hasActiveFilters: boolean // Добавляем флаг
  
  // Фильтры
  sort: SortOption | null
  setSort: (sort: SortOption | null) => void
  minPrice: string
  setMinPrice: (price: string) => void
  maxPrice: string
  setMaxPrice: (price: string) => void
  selectedCollections: string[]
  setSelectedCollections: (collections: string[]) => void
  selectedBackdrops: string[]
  setSelectedBackdrops: (backdrops: string[]) => void
  selectedSymbols: string[]
  setSelectedSymbols: (symbols: string[]) => void
  marketViewMode: 'grid' | 'list'
  setMarketViewMode: (mode: 'grid' | 'list') => void
}

const MarketContext = createContext<MarketContextType | undefined>(undefined)

// Преобразование данных из парсера в формат GiftPreview
function transformParsedGiftToGiftPreview(parsed: ParsedGift, index: number): GiftPreview {
  // Создаем уникальный ID используя collection-id или collection-id-index для гарантии уникальности
  const giftId = parsed.collection && parsed.id 
    ? `${parsed.id}` 
    : parsed.id || `${index}`
  
  // Убираем "#xxxx" из названия, оставляем только название коллекции
  // Например: "Ice Cream #91641" -> "Ice Cream"
  let giftName = parsed.name
  // Убираем все после "#" или " #"
  const hashIndex = giftName.indexOf('#')
  if (hashIndex !== -1) {
    giftName = giftName.substring(0, hashIndex).trim()
  }
  
  // Формируем теги из доступных атрибутов
  const tags: string[] = []
  if (parsed.model) tags.push(parsed.model)
  if (parsed.backdrop) tags.push(parsed.backdrop)
  if (parsed.symbol) tags.push(parsed.symbol)
  if (parsed.collection) tags.push(parsed.collection)

  return {
    id: giftId,
    name: giftName,
    price: parsed.price_ton_discounted || 0,
    preview: parsed.lottie_url || undefined,
    models_count: parsed.model ? 1 : 0,
    in_stock: parsed.price_ton !== null && parsed.price_ton > 0,
    rating: 0,
    tags: tags,
    collection: parsed.collection || undefined,
    model: parsed.model || undefined,
    backdrop: parsed.backdrop || undefined,
    symbol: parsed.symbol || undefined
  }
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'unlisted' | 'listed'>('unlisted')
  const [searchResults, _setSearchResults] = useState<GiftPreview[]>([])
  const [isSearching, _setIsSearching] = useState(false)
  const [searchError, _setSearchError] = useState<string | null>(null)
  const [gifts, setGifts] = useState<GiftPreview[]>([])
  const [isLoadingGifts, setIsLoadingGifts] = useState(true)
  const [isRefreshingGifts, setIsRefreshingGifts] = useState(false)
  const [giftsError, setGiftsError] = useState<string | null>(null)
  
  // Состояние фильтров
  const [sort, setSort] = useState<SortOption | null>(null)
  const [minPrice, setMinPrice] = useState('0')
  const [maxPrice, setMaxPrice] = useState('100000')
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedBackdrops, setSelectedBackdrops] = useState<string[]>([])
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([])
  const [marketViewMode, setMarketViewMode] = useState<'grid' | 'list'>('grid')

  const hasActiveFilters = useMemo(() => {
    return sort !== null || minPrice !== '0' || maxPrice !== '100000' || 
           selectedCollections.length > 0 || selectedBackdrops.length > 0 || selectedSymbols.length > 0
  }, [sort, minPrice, maxPrice, selectedCollections, selectedBackdrops, selectedSymbols])
  
  // Храним все загруженные данные в ref, чтобы не вызывать лишние ререндеры
  const allParsedGiftsRef = useRef<ParsedGift[]>([])
  // Храним отфильтрованные данные
  const filteredGiftsRef = useRef<GiftPreview[]>([])
  // Флаг загрузки данных для триггера обновления фильтров
  const [dataLoaded, setDataLoaded] = useState(false)
  const [giftsRevision, setGiftsRevision] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentIndexRef = useRef(0)
  const isLoadingMoreRef = useRef(false)
  const ITEMS_PER_LOAD = 15

  // Мемоизированная фильтрация всех данных (не только загруженных)
  const filteredAllGiftsMemo = useMemo(() => {
    // Получаем все данные из ref и преобразуем их в GiftPreview
    const allGifts = allParsedGiftsRef.current.map((parsed, index) => 
      transformParsedGiftToGiftPreview(parsed, index)
    )
    
    let result = allGifts

    // 1. Поиск
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase()
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0)
      
      result = result.filter(gift => {
        const nameLower = gift.name.toLowerCase()
        const idLower = gift.id.toLowerCase()
        
        const matchesName = queryWords.every(word => nameLower.includes(word))
        const matchesId = idLower.includes(queryLower)
        const matchesTags = gift.tags.some(tag => 
          queryWords.some(word => tag.toLowerCase().includes(word))
        )
        
        return matchesName || matchesId || matchesTags
      })
    }

    // 2. Фильтрация по коллекциям, фонам и символам
    if (selectedCollections.length > 0) {
      result = result.filter(gift => {
        if (!gift.collection) return false
        // В gifts.json collection хранится как slug (например, "bdaycandle", "stellarrocket")
        // В selectedCollections теперь хранятся slug из collections_list.json (например, "bdaycandle")
        // Просто сравниваем напрямую, так как оба в формате slug
        const giftCollection = gift.collection.toLowerCase().trim()
        return selectedCollections.some(selected => {
          const selectedSlug = selected.toLowerCase().trim()
          return selectedSlug === giftCollection
        })
      })
    }
    if (selectedBackdrops.length > 0) {
      result = result.filter(gift => {
        if (!gift.backdrop) return false
        // Нормализуем названия: убираем проценты, числа, пробелы, дефисы, приводим к нижнему регистру
        // Например: "Grape 1.5%" -> "grape", "Cobalt Blue 1.5%" -> "cobaltblue"
        const giftBackdrop = normalizeFilterValue(gift.backdrop)
        const matches = selectedBackdrops.some(selected => {
          const normalizedSelected = normalizeFilterValue(selected)
          return normalizedSelected === giftBackdrop
        })
        return matches
      })
    }
    if (selectedSymbols.length > 0) {
      result = result.filter(gift => {
        if (!gift.symbol) return false
        // Нормализуем названия: убираем проценты, числа, пробелы, дефисы, приводим к нижнему регистру
        const giftSymbol = normalizeFilterValue(gift.symbol)
        const matches = selectedSymbols.some(selected => {
          const normalizedSelected = normalizeFilterValue(selected)
          return normalizedSelected === giftSymbol
        })
        return matches
      })
    }

    // 3. Фильтрация по цене
    const min = Number(minPrice)
    const max = Number(maxPrice)
    if (!isNaN(min) && !isNaN(max)) {
      result = result.filter(gift => {
        const price = gift.price
        return price >= min && price <= max
      })
    }

    // 4. Сортировка
    if (sort) {
      result = [...result].sort((a, b) => {
        switch (sort) {
          case 'price-low':
            return a.price - b.price
          case 'price-high':
            return b.price - a.price
          case 'id-asc':
            return Number(a.id.replace(/\D/g, '')) - Number(b.id.replace(/\D/g, ''))
          case 'id-desc':
            return Number(b.id.replace(/\D/g, '')) - Number(a.id.replace(/\D/g, ''))
          case 'latest':
          default:
            return 0 // TODO: Добавить дату если есть
        }
      })
    }

    return result
  }, [searchQuery, sort, minPrice, maxPrice, selectedCollections, selectedBackdrops, selectedSymbols, dataLoaded, giftsRevision])

  // Функция для загрузки следующей порции из отфильтрованных данных
  const loadNextBatch = useCallback((startIndex: number) => {
    const data = filteredGiftsRef.current
    if (startIndex >= data.length) return

    const endIndex = Math.min(startIndex + ITEMS_PER_LOAD, data.length)
    const batch = data.slice(startIndex, endIndex)
    
    // Добавляем к существующим (функциональное обновление стейта)
    setGifts(prev => [...prev, ...batch])
    currentIndexRef.current = endIndex
    setCurrentIndex(endIndex)
  }, [])

  // Загрузка гифтов из gifts.json
  const applyGiftsData = useCallback((data: ParsedGift[]) => {
    const uniqueMap = new Map<string, ParsedGift>()
    data.forEach((parsed) => {
      const uniqueKey = `${parsed.collection}-${parsed.id}`
      if (!uniqueMap.has(uniqueKey)) {
        uniqueMap.set(uniqueKey, parsed)
      }
    })

    const shuffled = Array.from(uniqueMap.values()).sort(() => Math.random() - 0.5)
    allParsedGiftsRef.current = shuffled
    setDataLoaded(true)
    setGiftsRevision(prev => prev + 1)
  }, [])

  const fetchGiftsFromServer = useCallback(async () => {
    const response = await fetch(`/gifts.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    if (!Array.isArray(data)) throw new Error('Format error')

    return data as ParsedGift[]
  }, [])

  const loadGifts = useCallback(async () => {
    try {
      setIsLoadingGifts(true)
      setGiftsError(null)

      const data = await fetchGiftsFromServer()
      applyGiftsData(data)
    } catch (error) {
      console.error('Error:', error)
      setGiftsError('Failed to load gifts')
      setGifts([])
    } finally {
      setIsLoadingGifts(false)
    }
  }, [applyGiftsData, fetchGiftsFromServer])

  const refreshGifts = useCallback(async () => {
    try {
      setIsRefreshingGifts(true)
      setGiftsError(null)

      const data = await fetchGiftsFromServer()
      applyGiftsData(data)
    } catch (error) {
      console.error('Refresh error:', error)
      setGiftsError('Failed to refresh gifts')
    } finally {
      setIsRefreshingGifts(false)
    }
  }, [applyGiftsData, fetchGiftsFromServer])

  useEffect(() => {
    void loadGifts()
  }, [loadGifts])

  // Обновляем отфильтрованные данные когда меняются фильтры или загружаются данные
  useEffect(() => {
    // Проверяем, что данные загружены
    if (allParsedGiftsRef.current.length === 0) return
    
    filteredGiftsRef.current = filteredAllGiftsMemo
    // Сбрасываем индекс и загружаем первую порцию отфильтрованных данных
    currentIndexRef.current = 0
    setCurrentIndex(0)
    setGifts([])
    if (filteredAllGiftsMemo.length > 0) {
      const endIndex = Math.min(ITEMS_PER_LOAD, filteredAllGiftsMemo.length)
      const batch = filteredAllGiftsMemo.slice(0, endIndex)
      setGifts(batch)
      currentIndexRef.current = endIndex
      setCurrentIndex(endIndex)
    } else {
      // Если после фильтрации ничего не осталось, показываем пустой список
      setGifts([])
    }
  }, [filteredAllGiftsMemo])

  // Вызывается при скролле
  const handleLoadMoreGifts = useCallback(() => {
    if (isLoadingMoreRef.current || currentIndexRef.current >= filteredGiftsRef.current.length) return
    isLoadingMoreRef.current = true
    requestAnimationFrame(() => {
      loadNextBatch(currentIndexRef.current)
      isLoadingMoreRef.current = false
    })
  }, [loadNextBatch])

  const hasMoreGifts = currentIndex < filteredGiftsRef.current.length

  // Мемоизированный поиск и фильтрация (для обратной совместимости)
  const searchResultsMemo = useMemo(() => {
    return filteredAllGiftsMemo
  }, [filteredAllGiftsMemo])

  // Debounced обновление результатов
  useEffect(() => {
    // Включаем поиск/фильтрацию если есть запрос ИЛИ активны фильтры
    if (searchQuery.trim() || hasActiveFilters) {
      _setIsSearching(true)
      const timer = setTimeout(() => {
        _setSearchResults(searchResultsMemo)
        _setIsSearching(false)
        _setSearchError(null)
      }, 150)
      
      return () => clearTimeout(timer)
    } else {
      _setSearchResults([])
      _setIsSearching(false)
      _setSearchError(null)
    }
  }, [searchQuery, searchResultsMemo, hasActiveFilters])

  // Оптимизированный обработчик поиска
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <MarketContext.Provider
      value={{
        searchQuery,
        setSearchQuery: handleSetSearchQuery,
        searchResults,
        isSearching,
        searchError,
        activeTab,
        setActiveTab,
        gifts,
        isLoadingGifts,
        isRefreshingGifts,
        giftsError,
        refreshGifts,
        loadMoreGifts: handleLoadMoreGifts,
        hasMoreGifts,
        hasActiveFilters,
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
        marketViewMode,
        setMarketViewMode,
      }}
    >
      {children}
    </MarketContext.Provider>
  )
}

export function useMarketContext() {
  const context = useContext(MarketContext)
  if (!context) {
    throw new Error('useMarketContext must be used within MarketProvider')
  }
  return context
}

