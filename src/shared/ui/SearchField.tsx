import './search-field.css'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Quick find',
  className,
}: SearchFieldProps) {
  return (
    <div className={className ? `ph__searchContainer ${className}` : 'ph__searchContainer'}>
      <div className="ph__searchIcon">
        <SearchIcon />
      </div>
      <input
        type="text"
        className="ph__searchInput"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
