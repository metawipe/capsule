import { FilterListModal } from './FilterListModal'

interface CollectionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedGifts: string[]
  onGiftsChange: (gifts: string[]) => void
}

export function CollectionModal(props: CollectionModalProps) {
  return <FilterListModal isOpen={props.isOpen} onClose={props.onClose} title="Collection" source="/collections_list.json" selected={props.selectedGifts} onChange={props.onGiftsChange} />
}
