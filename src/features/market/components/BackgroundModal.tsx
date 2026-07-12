import { FilterListModal } from './FilterListModal'

interface BackgroundModalProps {
  isOpen: boolean
  onClose: () => void
  selectedBackgrounds: string[]
  onBackgroundsChange: (backgrounds: string[]) => void
}

export function BackgroundModal(props: BackgroundModalProps) {
  return <FilterListModal isOpen={props.isOpen} onClose={props.onClose} title="Background" source="/backdrops_list.json" selected={props.selectedBackgrounds} onChange={props.onBackgroundsChange} />
}
