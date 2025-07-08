import { useState } from "react"
import { useNavigate } from "react-router-dom"

function SearchBar() {
    const [query, setQuery] = useState("")
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        if(query) navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-spacing-lg">
        <input 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for courses..."
        className="w-full p-spacing-sm border border-secondary-light rounded"
        />
    </form>
  )
}

export default SearchBar