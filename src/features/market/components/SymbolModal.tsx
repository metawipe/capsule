import { FilterListModal } from './FilterListModal'

interface SymbolModalProps {
  isOpen: boolean
  onClose: () => void
  selectedSymbols: string[]
  onSymbolsChange: (symbols: string[]) => void
}

export function SymbolModal(props: SymbolModalProps) {
  return <FilterListModal isOpen={props.isOpen} onClose={props.onClose} title="Symbol" source="/symbols_list.json" selected={props.selectedSymbols} onChange={props.onSymbolsChange} />
}
