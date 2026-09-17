import { memo, useState, useEffect } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import InputAdornment from '@mui/material/InputAdornment'
import { useDebounce } from '@/hooks'
import './CustomAutocompleteSearchBox.css'

/**
 * CustomAutocompleteSearchBox - A simplified autocomplete search box
 * @param {Array} options - Options to display (provided by parent)
 * @param {Function} onQueryChange - Callback when search query changes. If provided, parent controls search (external). If not provided, local filtering is used.
 * @param {boolean} loading - Loading state (only used when onQueryChange is provided)
 * @param {Function} onSelect - Callback when an option is selected
 * @param {string} placeholder - Placeholder text (default: 'Search...')
 * @param {number} debounceDelay - Debounce delay in ms (default: 500)
 * @param {Function} getOptionLabel - Function to extract label from option (default: option => option.label)
 * @param {Function} renderOption - Custom render function for each option item in dropdown. Signature: (props, option) => ReactNode
 * @param {Object} sx - MUI sx prop for styling the Autocomplete component (e.g., width, margin, etc.)
 *
 * Example renderOption:
 * ```jsx
 * renderOption={(props, option) => (
 *   <li {...props} key={option.id}>
 *     <div>
 *       <strong>{option.name}</strong>
 *       <div style={{ fontSize: '0.85em', color: '#666' }}>{option.description}</div>
 *     </div>
 *   </li>
 * )}
 * ```
 */
function CustomAutocompleteSearchBox({
  options = [],
  onQueryChange,
  loading = false,
  onSelect,
  placeholder = 'Search...',
  debounceDelay = 500,
  getOptionLabel = (option) => option?.label || '',
  renderOption,
  sx,
  ...props
}) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // Debounce the input value
  const debouncedInputValue = useDebounce(inputValue, debounceDelay)

  // Determine if using external (parent-controlled) search
  const isExternalSearch = !!onQueryChange

  // Notify parent of query changes when using external search
  useEffect(() => {
    if (isExternalSearch) {
      onQueryChange(debouncedInputValue)
    }
  }, [debouncedInputValue])

  // For local search, filter options based on input
  const filteredOptions = isExternalSearch
    ? options
    : options.filter((option) => {
        const label = getOptionLabel(option)
        return label.toLowerCase().includes(inputValue.toLowerCase())
      })

  const handleSelect = (event, value) => {
    if (value && onSelect) {
      onSelect(value)
    }
  }

  const handleClear = () => {
    setInputValue('')
  }

  return (
    <Autocomplete
      className="custom-autocomplete-search-box"
      sx={sx}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={filteredOptions}
      loading={isExternalSearch && loading}
      getOptionLabel={getOptionLabel}
      clearOnBlur={false}
      freeSolo
      inputValue={inputValue}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === 'clear') {
          handleClear()
        } else {
          setInputValue(newInputValue)
        }
      }}
      onChange={handleSelect}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            marginTop: '4px'
          }
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          className="custom-autocomplete-input"
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {isExternalSearch && loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={renderOption}
      noOptionsText={
        isExternalSearch
          ? inputValue
            ? 'No results found'
            : 'Type to search'
          : 'No results found'
      }
      {...props}
    />
  )
}

export default memo(CustomAutocompleteSearchBox)
