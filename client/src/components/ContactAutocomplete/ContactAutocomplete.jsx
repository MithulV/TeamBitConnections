import React, { useState, useEffect, useRef } from "react";
import { UserCheck, Search } from "lucide-react";
import api from "../../utils/axios";

const ContactAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search contacts...",
  disabled = false,
  initialContactId = null
}) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedContact, setSelectedContact] = useState(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    console.log("ContactAutocomplete props:", { value, initialContactId });

    if (value && initialContactId) {
      console.log("Setting selectedContact with:", { id: initialContactId, name: value });
      setSelectedContact({
        contact_id: initialContactId,
        name: value
      });
    } else if (!value) {
      setSelectedContact(null);
    }
    setQuery(value || "");
  }, [value, initialContactId]);

  const searchContacts = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(
        `/api/search-contact?q=${encodeURIComponent(searchQuery)}`
      );
      
      const contacts = response.data.data || response.data.contacts || response.data || [];
      setSuggestions(contacts);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error searching contacts:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (selectedContact && newQuery !== selectedContact.name) {
      setSelectedContact(null);
      onChange(newQuery, null);
    } else if (!selectedContact) {
      onChange(newQuery, null);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchContacts(newQuery);
    }, 300);
  };

  const handleSelectSuggestion = (contact) => {
    setQuery(contact.name);
    setSelectedContact(contact);
    setShowSuggestions(false);
    
    onChange(contact.name, contact.contact_id);
    onSelect && onSelect(contact);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const handleSuggestionMouseDown = (e) => {
    e.preventDefault();
  };

  return (
    <div className="relative group">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-4 py-3.5 pl-4 pr-12 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm group-hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => query && !selectedContact && searchContacts(query)}
          disabled={disabled}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          ) : selectedContact ? (
            <UserCheck className="h-4 w-4 text-green-500" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((contact, index) => (
            <div
              key={contact.contact_id || index}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
              onMouseDown={handleSuggestionMouseDown}
              onClick={() => handleSelectSuggestion(contact)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {contact.name}
                  </div>
                  {contact.email_address && (
                    <div className="text-xs text-gray-500 truncate">
                      {contact.email_address}
                    </div>
                  )}
                  {contact.phone_number && (
                    <div className="text-xs text-gray-500 truncate">
                      {contact.phone_number}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && query && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No contacts found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactAutocomplete;
