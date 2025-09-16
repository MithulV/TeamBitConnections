// components/IndianGlobalGeocoder.js
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

class IndianGlobalGeocodingService {
  constructor() {
    this.cache = new Map();
    this.failedCache = new Set();
    this.API_KEY = '55ae200e594f4215be5ffcb5140c6aa5';
    this.BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';
    this.lastRequestTime = 0;
    this.totalCallsUsed = 0;
    this.MAX_CALLS = 2500;
  }

  async waitForRateLimit() {
    const now = Date.now();
    const diff = now - this.lastRequestTime;
    if (diff < 250) {
      await new Promise(r => setTimeout(r, 250 - diff));
    }
    this.lastRequestTime = Date.now();
  }

  hasValidAddressFields(contact) {
    const { street, city, state, country, zipcode, postal_code, pincode } = contact;
    const addressFields = [street, city, state, country, zipcode, postal_code, pincode];
    return addressFields.some(field => field && field.toString().trim().length > 0);
  }

  // UPDATED: Global strategies (removed India-specific defaults)
  generateGlobalStrategies(contact) {
    const { 
      street = '', 
      city = '', 
      state = '', 
      country = contact.country || '', // No default to India
      zipcode = '',
      postal_code = '',
      pincode = ''
    } = contact;
    
    const postalCode = zipcode || postal_code || pincode || '';
    const cleanStreet = street.trim();
    const strategies = [];
    
    // Full address with postal code
    if (cleanStreet && postalCode && country) {
      strategies.push({
        address: `${cleanStreet}, ${city}, ${state}, ${postalCode}, ${country}`,
        type: 'full_address',
        priority: 10
      });
    }
    
    // Street + city + country
    if (cleanStreet && city && country) {
      strategies.push({
        address: `${cleanStreet}, ${city}, ${country}`,
        type: 'street_city_country',
        priority: 8
      });
    }
    
    // City + country (crucial for international addresses)
    if (city && country) {
      strategies.push({
        address: `${city}, ${country}`,
        type: 'city_country',
        priority: 6
      });
    }
    
    // Postal code + country
    if (postalCode && country) {
      strategies.push({
        address: `${postalCode}, ${country}`,
        type: 'postal_country',
        priority: 7
      });
    }

    // Handle Indian-specific strategies if country is India
    if (country.toLowerCase().includes('india')) {
      if (cleanStreet && postalCode) {
        strategies.push({
          address: `${cleanStreet}, ${city}, ${postalCode}`,
          type: 'street_pin',
          priority: 9
        });
      }
      
      if (postalCode) {
        strategies.push({
          address: `${postalCode}, ${city}, ${state}`,
          type: 'pin_city',
          priority: 8
        });
      }
      
      // Handle "near" landmarks common in Indian addresses
      if (cleanStreet && cleanStreet.toLowerCase().includes('near')) {
        const landmark = cleanStreet.replace(/.*near\s+/i, '').split(',')[0];
        strategies.push({
          address: `${landmark}, ${city}, ${state}`,
          type: 'landmark',
          priority: 5
        });
      }
    }
    
    return strategies
      .filter(s => s.address && s.address.length >= 3)
      .sort((a, b) => b.priority - a.priority);
  }

  async geocodeWithOpenCage(address) {
    if (this.totalCallsUsed >= this.MAX_CALLS) {
      console.warn(`⚠️ API limit reached (${this.MAX_CALLS} calls). Skipping: ${address}`);
      return null;
    }

    const cacheKey = address.toLowerCase();
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
    if (this.failedCache.has(cacheKey)) return null;

    await this.waitForRateLimit();
    
    try {
      // ✅ FIXED: Removed countrycode=in restriction for global support
      const url = `${this.BASE_URL}?q=${encodeURIComponent(address)}&key=${this.API_KEY}&limit=1&language=en`;
      
      this.totalCallsUsed++;
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'GlobalGeocoder/1.0' }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        this.failedCache.add(cacheKey);
        return null;
      }
      
      const result = data.results[0];
      const geocoded = {
        lat: result.geometry.lat,
        lng: result.geometry.lng,
        label: result.formatted,
        confidence: result.confidence / 10,
        precision: result.components._type || 'unknown',
        components: result.components
      };
      
      this.cache.set(cacheKey, geocoded);
      return geocoded;
      
    } catch (error) {
      console.warn(`❌ OpenCage error for "${address}":`, error.message);
      this.failedCache.add(cacheKey);
      return null;
    }
  }

  async geocodeContactSmart(contact) {
    const strategies = this.generateGlobalStrategies(contact);
    
    console.log(`🌍 Processing: ${contact.name} in ${contact.country || 'Unknown Country'} (${strategies.length} strategies)`);
    
    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      console.log(`   ${i + 1}. Trying ${strategy.type}: "${strategy.address}"`);
      
      const result = await this.geocodeWithOpenCage(strategy.address);
      
      if (result) {
        if (strategy.priority >= 6 && result.confidence < 0.4) {
          console.log(`   ⚠️ Low confidence (${result.confidence}) for street address`);
          continue;
        }
        
        console.log(`   ✅ SUCCESS: ${strategy.type} (confidence: ${result.confidence})`);
        
        return {
          id: contact.contact_id,
          position: { lat: result.lat, lng: result.lng },
          label: result.label,
          name: contact.name,
          email: contact.email_address || contact.email,
          category: contact.category || 'default', // ✅ Include category
          originalAddress: this.getOriginalAddress(contact),
          foundWith: strategy.address,
          strategyUsed: i + 1,
          strategyType: strategy.type,
          confidence: result.confidence,
          precision: result.precision,
          components: result.components,
          apiUsed: 'OpenCage',
          addressDetails: {
            street: contact.street || '',
            city: contact.city || '',
            state: contact.state || '',
            country: contact.country || '',
            zipcode: contact.zipcode || contact.postal_code || contact.pincode || ''
          }
        };
      }
    }
    
    console.log(`   ❌ All strategies failed for: ${contact.name}`);
    return null;
  }

  getOriginalAddress(contact) {
    const parts = [];
    if (contact.street) parts.push(contact.street);
    if (contact.city) parts.push(contact.city);
    if (contact.state) parts.push(contact.state);
    if (contact.country) parts.push(contact.country);
    const postal = contact.zipcode || contact.postal_code || contact.pincode;
    if (postal) parts.push(postal);
    return parts.join(', ');
  }

  async batchGeocodeGlobal(contacts, onProgress) {
    const results = [];
    
    const validContacts = contacts.filter(c => 
      c.city && 
      c.contact_id && 
      this.hasValidAddressFields(c)
    );
    
    if (validContacts.length === 0) {
      console.warn('⚠️ No contacts with valid address fields found');
      return results;
    }

    const remainingCalls = this.MAX_CALLS - this.totalCallsUsed;
    const contactsToProcess = validContacts.slice(0, Math.min(remainingCalls, validContacts.length));
    
    if (contactsToProcess.length < validContacts.length) {
      console.warn(`⚠️ Limited to ${contactsToProcess.length} contacts due to API limit (${remainingCalls} calls remaining)`);
    }
    
    console.log(`🌍 Global geocoding: ${contactsToProcess.length} contacts (${this.totalCallsUsed}/${this.MAX_CALLS} calls used)`);
    
    const CHUNK_SIZE = 3;
    const chunks = [];
    
    for (let i = 0; i < contactsToProcess.length; i += CHUNK_SIZE) {
      chunks.push(contactsToProcess.slice(i, i + CHUNK_SIZE));
    }
    
    let processed = 0;
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(contact => this.geocodeContactSmart(contact));
      const chunkResults = await Promise.all(chunkPromises);
      
      chunkResults.forEach(result => {
        if (result) results.push(result);
      });
      
      processed += chunk.length;
      
      if (onProgress) {
        const progress = (processed / contactsToProcess.length) * 100;
        onProgress(`Processed ${processed}/${contactsToProcess.length} (${progress.toFixed(0)}%)`);
      }
    }
    
    results.sort((a, b) => {
      const scoreA = a.confidence + (a.strategyType.includes('pin') ? 0.2 : 0);
      const scoreB = b.confidence + (b.strategyType.includes('pin') ? 0.2 : 0);
      return scoreB - scoreA;
    });
    
    console.log(`🎉 Global geocoding complete: ${results.length}/${contactsToProcess.length} (${((results.length/contactsToProcess.length)*100).toFixed(1)}%)`);
    return results;
  }
}

// ✅ UPDATED: Component with enhanced colored circular markers
const Geocoder = ({
  contacts = [],
  className = "h-96",
  showProgress = true,
  onGeocodingComplete
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Ready for Global addresses');
  const [contactsHash, setContactsHash] = useState('');
  const [renderedContactIds, setRenderedContactIds] = useState(new Set());
  
  const geocodingService = useRef(new IndianGlobalGeocodingService());

  // ✅ ENHANCED: Category color mapping with more vibrant colors
  const getCategoryColor = (category) => {
    const colors = {
      'customer': '#E53E3E',      // Vibrant Red
      'vendor': '#00B5D8',        // Vibrant Teal
      'partner': '#3182CE',       // Vibrant Blue
      'supplier': '#FF8C00',      // Vibrant Orange
      'employee': '#38A169',      // Vibrant Green
      'prospect': '#D69E2E',      // Vibrant Yellow-Gold
      'investor': '#805AD5',      // Vibrant Purple
      'consultant': '#0987A0',    // Vibrant Cyan
      'lead': '#E53E3E',          // Red variant
      'client': '#2F855A',        // Green variant
      'contractor': '#744210',    // Brown
      'distributor': '#553C9A',   // Purple variant
      'reseller': '#2D3748',      // Dark Gray
      'default': '#718096'        // Medium Gray
    };
    return colors[category?.toLowerCase()] || colors.default;
  };

  // ✅ ENHANCED: Create custom colored circle marker with better styling
  const createCategoryMarker = (markerData) => {
    const color = getCategoryColor(markerData.category);
    const categoryInitial = (markerData.category || 'D').charAt(0).toUpperCase();
    
    return L.divIcon({
      html: `
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 0 0 2px ${color}44;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Arial Black', Arial, sans-serif;
          font-weight: 900;
          font-size: 16px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        "
        onmouseover="this.style.transform='scale(1.15)'; this.style.zIndex='1000';"
        onmouseout="this.style.transform='scale(1)'; this.style.zIndex='auto';"
        >${categoryInitial}</div>
      `,
      className: 'custom-category-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // ✅ UPDATED: Center on world view for global addresses
    const map = L.map(mapRef.current).setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    mapInstanceRef.current = map;
    console.log('✅ Map initialized for global addresses');
  }, []);

  // Process contacts
  useEffect(() => {
    if (!contacts?.length || !mapInstanceRef.current) return;

    const newContacts = contacts.filter(contact => 
      !renderedContactIds.has(contact.contact_id) &&
      geocodingService.current.hasValidAddressFields(contact)
    );

    if (newContacts.length === 0) {
      console.log('ℹ️ No new contacts with valid addresses to process');
      return;
    }

    const newHash = newContacts.map(c => 
      `${c.contact_id}-${c.city}-${c.street || ''}-${c.country || ''}`
    ).join('|').substring(0, 100);
    
    if (newHash === contactsHash || isProcessing) return;

    setContactsHash(newHash);
    setIsProcessing(true);
    setProgress(0);
    setStatus('Starting global geocoding...');

    const processContacts = async () => {
      try {
        const results = await geocodingService.current.batchGeocodeGlobal(
          newContacts,
          (progressStatus) => {
            setStatus(progressStatus);
            const match = progressStatus.match(/\((\d+)%\)/);
            if (match) setProgress(parseInt(match[1]));
          }
        );

        const newRenderedIds = new Set([
          ...renderedContactIds,
          ...results.map(r => r.id)
        ]);
        setRenderedContactIds(newRenderedIds);

        setMarkers(prevMarkers => {
          const existingIds = new Set(prevMarkers.map(m => m.id));
          const uniqueResults = results.filter(r => !existingIds.has(r.id));
          return [...prevMarkers, ...uniqueResults];
        });

        setProgress(100);
        setStatus('Complete');
        
        if (onGeocodingComplete) {
          onGeocodingComplete(results, {
            successRate: (results.length / newContacts.length) * 100,
            totalMapped: results.length,
            apiCallsUsed: geocodingService.current.totalCallsUsed,
            apiCallsRemaining: geocodingService.current.MAX_CALLS - geocodingService.current.totalCallsUsed
          });
        }
      } catch (error) {
        console.error('❌ Geocoding error:', error);
        setStatus(`Error: ${error.message}`);
      } finally {
        setIsProcessing(false);
      }
    };

    processContacts();
  }, [contacts, mapInstanceRef.current, contactsHash, isProcessing, onGeocodingComplete, renderedContactIds]);

  // ✅ UPDATED: Add enhanced colored circular category markers
  useEffect(() => {
    if (!markers.length || !mapInstanceRef.current) return;

    console.log(`📍 Adding ${markers.length} enhanced category markers to map`);

    try {
      // Clear existing markers
      mapInstanceRef.current.eachLayer(layer => {
        if (layer.options && layer.options.isCustomMarker) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      const markerGroup = L.featureGroup();
      
      markers.forEach((markerData) => {
        try {
          // ✅ Create enhanced circular category marker
          const customIcon = createCategoryMarker(markerData);
          const marker = L.marker([markerData.position.lat, markerData.position.lng], { 
            icon: customIcon,
            isCustomMarker: true 
          });
          
          // ✅ ENHANCED: Improved popup with better styling and category color
          const { addressDetails } = markerData;
          const categoryColor = getCategoryColor(markerData.category);
          const addressHTML = Object.entries(addressDetails || {})
            .filter(([key, value]) => value && value.toString().trim())
            .map(([key, value]) => `<div><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</div>`)
            .join('');
          
          marker.bindPopup(`
            <div style="padding: 16px; max-width: 340px; font-family: Arial, sans-serif; border-radius: 8px;">
              <h4 style="margin: 0 0 12px 0; color: #333; border-bottom: 3px solid ${categoryColor}; padding-bottom: 8px; font-size: 16px;">
                📍 ${markerData.name}
              </h4>
              <div style="font-size: 14px; color: #555;">
                <div style="margin-bottom: 10px;">
                  <span style="
                    background: linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%); 
                    color: white; 
                    padding: 4px 12px; 
                    border-radius: 16px; 
                    font-size: 12px; 
                    font-weight: bold;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  ">
                    ${markerData.category?.toUpperCase() || 'DEFAULT'}
                  </span>
                </div>
                
                <div style="margin-bottom: 6px;"><strong>📧 Email:</strong> ${markerData.email}</div>
                
                <div style="margin: 12px 0; padding: 10px; border-radius: 6px; background: #f8f9fa; border-left: 4px solid ${categoryColor};">
                  <strong>📍 Address:</strong>
                  ${addressHTML || '<div style="color: #999;">Address details not available</div>'}
                </div>
                
                <div style="margin-bottom: 4px;"><strong>✅ Found:</strong> ${markerData.label}</div>
                <div style="margin-bottom: 4px;"><strong>🎯 Method:</strong> ${markerData.strategyType}</div>
                <div style="margin-bottom: 8px;"><strong>🎯 Confidence:</strong> 
                  <span style="color: ${markerData.confidence > 0.7 ? '#38A169' : markerData.confidence > 0.4 ? '#D69E2E' : '#E53E3E'}; font-weight: bold;">
                    ${(markerData.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div style="font-size: 11px; color: #888; margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                  📊 ${markerData.position.lat.toFixed(6)}, ${markerData.position.lng.toFixed(6)}
                </div>
              </div>
            </div>
          `);
          
          marker.addTo(mapInstanceRef.current);
          markerGroup.addLayer(marker);
          
        } catch (error) {
          console.error(`Failed to add marker for ${markerData.name}:`, error);
        }
      });

      // Fit map to show all markers
      if (markers.length > 0) {
        try {
          const bounds = markerGroup.getBounds();
          mapInstanceRef.current.fitBounds(bounds, { 
            padding: [20, 20],
            maxZoom: 12
          });
        } catch (error) {
          mapInstanceRef.current.setView([markers[0].position.lat, markers[0].position.lng], 10);
        }
      }
      
      console.log(`✅ Added ${markers.length} enhanced category markers to map`);
    } catch (error) {
      console.error('❌ Error adding markers:', error);
    }
  }, [markers]);

  return (
    <div className={`relative ${className}`}> 
      {/* Map container */}
      <div 
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        className="rounded-lg"
      />

      {/* show marker count */}
      {!isProcessing && markers.length > 0 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
          📍 {markers.length} locations
        </div>
      )}
    </div>
  );
};

export default Geocoder;
