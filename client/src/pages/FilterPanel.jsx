// FilterPanel.jsx
import React, { useState, useEffect } from 'react';
import './FilterPanel.css'

const FilterPanel = ({ onFilterChange, onClearFilters }) => {
    const [filterOptions, setFilterOptions] = useState({
        genders: [],
        categories: [],
        nationalities: [],
        marital_statuses: [],
        countries: [],
        states: [],
        cities: [],
        companies: [],
        job_titles: [],
        pg_courses: [],
        ug_courses: [],
        skills: []
    });

    const [selectedFilters, setSelectedFilters] = useState({
        gender: [],
        category: [],
        nationality: [],
        marital_status: [],
        address_country: [],
        address_state: [],
        address_city: [],
        company: [],
        job_title: [],
        pg_course_name: [],
        ug_course_name: [],
        skills: []
    });

    const [expandedSections, setExpandedSections] = useState({
        personal: true,
        location: false,
        education: false,
        experience: false,
        skills: false
    });

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const fetchFilterOptions = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/get-filter-options');
            const data = await response.json();
            setFilterOptions(data);
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    const handleCheckboxChange = (filterType, value) => {
        const updated = { ...selectedFilters };
        
        if (updated[filterType].includes(value)) {
            updated[filterType] = updated[filterType].filter(item => item !== value);
        } else {
            updated[filterType].push(value);
        }
        
        setSelectedFilters(updated);
        onFilterChange(updated);
    };

    const clearAllFilters = () => {
        const clearedFilters = Object.keys(selectedFilters).reduce((acc, key) => {
            acc[key] = [];
            return acc;
        }, {});
        
        setSelectedFilters(clearedFilters);
        onClearFilters();
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const FilterSection = ({ title, sectionKey, children }) => (
        <div className="filter-section">
            <div 
                className="section-header"
                onClick={() => toggleSection(sectionKey)}
            >
                <h4>{title}</h4>
                <span>{expandedSections[sectionKey] ? '−' : '+'}</span>
            </div>
            {expandedSections[sectionKey] && (
                <div className="section-content">
                    {children}
                </div>
            )}
        </div>
    );

    const CheckboxGroup = ({ label, filterKey, options }) => {
        const [showAll, setShowAll] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');

        const filteredOptions = options.filter(option => 
            option.value?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const displayOptions = showAll ? filteredOptions : filteredOptions.slice(0, 8);

        return (
            <div className="checkbox-group">
                <label className="group-label">{label}</label>
                
                {options.length > 8 && (
                    <input
                        type="text"
                        placeholder={`Search ${label.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="filter-search"
                    />
                )}

                <div className="checkbox-list">
                    {displayOptions.map((option, index) => (
                        <label key={index} className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={selectedFilters[filterKey]?.includes(option.value) || false}
                                onChange={() => handleCheckboxChange(filterKey, option.value)}
                            />
                            <span className="checkbox-label">
                                {option.value} <span className="count">({option.count})</span>
                            </span>
                        </label>
                    ))}
                </div>

                {filteredOptions.length > 8 && (
                    <button 
                        className="show-more-btn"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Show Less' : `Show ${filteredOptions.length - 8} More`}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="filter-panel">
            <div className="filter-header">
                <h3>Filters</h3>
                <button onClick={clearAllFilters} className="clear-btn">
                    Clear All
                </button>
            </div>

            <FilterSection title="Personal Information" sectionKey="personal">
                <CheckboxGroup 
                    label="Gender" 
                    filterKey="gender" 
                    options={filterOptions.genders || []} 
                />
                <CheckboxGroup 
                    label="Category" 
                    filterKey="category" 
                    options={filterOptions.categories || []} 
                />
                <CheckboxGroup 
                    label="Nationality" 
                    filterKey="nationality" 
                    options={filterOptions.nationalities || []} 
                />
                <CheckboxGroup 
                    label="Marital Status" 
                    filterKey="marital_status" 
                    options={filterOptions.marital_statuses || []} 
                />
            </FilterSection>

            <FilterSection title="Location" sectionKey="location">
                <CheckboxGroup 
                    label="Country" 
                    filterKey="address_country" 
                    options={filterOptions.countries || []} 
                />
                <CheckboxGroup 
                    label="State" 
                    filterKey="address_state" 
                    options={filterOptions.states || []} 
                />
                <CheckboxGroup 
                    label="City" 
                    filterKey="address_city" 
                    options={filterOptions.cities || []} 
                />
            </FilterSection>

            <FilterSection title="Education" sectionKey="education">
                <CheckboxGroup 
                    label="Post Graduate Course" 
                    filterKey="pg_course_name" 
                    options={filterOptions.pg_courses || []} 
                />
                <CheckboxGroup 
                    label="Under Graduate Course" 
                    filterKey="ug_course_name" 
                    options={filterOptions.ug_courses || []} 
                />
            </FilterSection>

            <FilterSection title="Experience" sectionKey="experience">
                <CheckboxGroup 
                    label="Company" 
                    filterKey="company" 
                    options={filterOptions.companies || []} 
                />
                <CheckboxGroup 
                    label="Job Title" 
                    filterKey="job_title" 
                    options={filterOptions.job_titles || []} 
                />
            </FilterSection>

            <FilterSection title="Skills" sectionKey="skills">
                <CheckboxGroup 
                    label="Skills" 
                    filterKey="skills" 
                    options={filterOptions.skills || []} 
                />
            </FilterSection>
        </div>
    );
};

export default FilterPanel;
