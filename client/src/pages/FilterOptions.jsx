// ContactsPage.jsx
import React, { useState, useEffect } from 'react';
import FilterPanel from './FilterPanel';

const ContactsPage = () => {
    const [contacts, setContacts] = useState([]);
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const fetchContacts = async (currentFilters = {}, page = 1) => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            
            // Add filters to query params
            Object.entries(currentFilters).forEach(([key, values]) => {
                if (values && Array.isArray(values) && values.length > 0) {
                    values.forEach(value => {
                        queryParams.append(key, value);
                    });
                }
            });
            
            queryParams.append('page', page);
            queryParams.append('limit', '20');

            const response = await fetch(`http://localhost:8000/api/contacts/filter?${queryParams}`);
            const data = await response.json();
            
            if (data.data) {
                setContacts(data.data.contacts || []);
                setPagination(data.data.pagination || {});
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        fetchContacts(newFilters, 1);
    };

    const handleClearFilters = () => {
        setFilters({});
        fetchContacts({}, 1);
    };

    const handlePageChange = (page) => {
        fetchContacts(filters, page);
    };

    return (
        <div className="contacts-page">
            <div className="page-header">
                <h1>Contacts ({pagination.total_contacts || 0})</h1>
            </div>
            
            <div className="page-content">
                <aside className="filters-sidebar">
                    <FilterPanel
                        onFilterChange={handleFiltersChange}
                        onClearFilters={handleClearFilters}
                    />
                </aside>
                
                <main className="contacts-main">
                    {isLoading ? (
                        <div className="loading">Loading contacts...</div>
                    ) : (
                        <>
                            <div className="contacts-grid">
                                {contacts.map(contact => (
                                    <div key={contact.contact_id} className="contact-card">
                                        <h3>{contact.name}</h3>
                                        <p><strong>Email:</strong> {contact.email_address}</p>
                                        <p><strong>Phone:</strong> {contact.phone_number}</p>
                                        <p><strong>Gender:</strong> {contact.gender}</p>
                                        <p><strong>Category:</strong> {contact.category}</p>
                                        {contact.nationality && <p><strong>Nationality:</strong> {contact.nationality}</p>}
                                        {contact.country && <p><strong>Country:</strong> {contact.country}</p>}
                                        {contact.skills && <p><strong>Skills:</strong> {contact.skills}</p>}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.total_pages > 1 && (
                                <div className="pagination">
                                    <button 
                                        disabled={!pagination.has_previous}
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {pagination.current_page} of {pagination.total_pages}
                                    </span>
                                    <button 
                                        disabled={!pagination.has_next}
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ContactsPage;
