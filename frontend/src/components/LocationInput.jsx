import { useEffect, useState, useRef } from "react";
import axios from "axios";

function LocationInput({ value, onChange }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 2) {
        axios
          .get("https://nominatim.openstreetmap.org/search", {
            params: {
              q: query,
              format: "json",
              addressdetails: 1,
              limit: 5,
            },
          })
          .then((res) => {
            setSuggestions(res.data);
            setHighlightIndex(-1);
          })
          .catch((err) => console.error(err));
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (place) => {
    setQuery(place.display_name);
    onChange(place.display_name);
    setSuggestions([]);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      handleSelect(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (
      highlightIndex >= 0 &&
      suggestionsRef.current &&
      suggestionsRef.current.children[highlightIndex]
    ) {
      suggestionsRef.current.children[highlightIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightIndex]);

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        className="form-control"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Enter your location"
        required
      />
      {suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: " #fff",
            border: "1px solid #ccc",
            borderTop: "none",
            listStyle: "none",
            padding: 0,
            margin: 0,
            maxHeight: "200px",
            overflowY: "auto",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          {suggestions.map((place, index) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              onMouseEnter={() => setHighlightIndex(index)}
              style={{
                padding: "10px",
                cursor: "pointer",
                backgroundColor:
                  index === highlightIndex ? "rgb(234, 240, 248)" : "transparent",
                color: index === highlightIndex ? " black" : "#000",
              }}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationInput;
