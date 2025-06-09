document.addEventListener('alpine:init', () => {
    Alpine.data('listingHandler', () => ({
        highestId: 0,
        lastCheckTime: Date.now(),
        page: 1,
        loading: false,
        allLoaded: false,
        
        init() {
            // Initialize from global config
            if (typeof RT_CONFIG !== 'undefined') {
                this.highestId = RT_CONFIG.highest_id || 0;
                
                // Start polling
                this.startPolling();
                
            }
        },
        
        startPolling() {
            // Check for boosted listings every 20 seconds
            setInterval(() => {
                this.checkForBoostedListings();
            }, 20000);
            
            // Check for new listings every 20 seconds
            setInterval(() => {
                this.checkForNewListings();
            }, 20000);
            
            // Initial check after 10 seconds
            setTimeout(() => {
                this.checkForBoostedListings();
                this.checkForNewListings();
            }, 10000 );
        },
        
        checkForBoostedListings() {
            
            // Build URL with parameters
            let params = new URLSearchParams({
                check_type: 'boosted',
                since: this.lastCheckTime,
                _: Date.now() // Cache busting
            });
            
            // Add other parameters from config if available
            if (typeof RT_CONFIG !== 'undefined') {
                if (RT_CONFIG.category_id) params.append('category_id', RT_CONFIG.category_id);
                if (RT_CONFIG.category_slug) params.append('category_slug', RT_CONFIG.category_slug);
                if (RT_CONFIG.listing_type_filter) params.append('type', RT_CONFIG.listing_type_filter);
                if (RT_CONFIG.search) params.append('search', RT_CONFIG.search);
            }
            
            // Make request
            fetch(`${window.location.origin}/api/get-new-listings.php?${params.toString()}`)
                .then(response => response.json())
                .then(data => {
                    
                    if (data.success && data.boosted_ids && data.boosted_ids.length > 0) {
                        this.processBoostedIds(data.boosted_ids);
                    }
                    
                    // Update last check time
                    this.lastCheckTime = Date.now();
                })
                .catch(error => {
                    console.error('Error fetching boosted listings:', error);
                });
        },
        
        processBoostedIds(boostedIds) {
            
            if (!boostedIds || !boostedIds.length) return;
            
            const tbody = document.getElementById('listings-tbody') || 
                          document.getElementById('listings-table-body');
            
            if (!tbody) {
                console.error('Table body element not found');
                return;
            }
            
            // First, mark all rows as boosted
            boostedIds.forEach(id => {
                const row = document.querySelector(`tr[data-id="${id}"]`);
                if (row) {
                    // Add boosted class
                    row.classList.add('bg-yellow-50');
                    row.setAttribute('data-boosted', '1');
                    
                    // Make sure there's a star icon
                    const firstCell = row.querySelector('td:first-child div');
                    if (firstCell && !firstCell.querySelector('.fa-star')) {
                        const starIcon = document.createElement('span');
                        starIcon.className = 'inline-flex items-center px-2 py-0.5 text-xs font-medium';
                        starIcon.innerHTML = '<i class="fas fa-star text-yellow-500 mr-1"></i>';
                        firstCell.prepend(starIcon);
                    }
                    
                    // Temporary highlight effect
                    row.style.transition = 'background-color 1s ease';
                    const originalBg = row.style.backgroundColor;
                    row.style.backgroundColor = '#fef3c7';
                    setTimeout(() => {
                        row.style.backgroundColor = originalBg;
                    }, 2000);
                }
            });
            
            // Then handle moving everything at once to avoid DOM thrashing
            this.moveAllBoostedToTop(tbody);
        },
        
        moveAllBoostedToTop(tbody) {
            // Get all rows
            const allRows = Array.from(tbody.querySelectorAll('tr'));
            if (!allRows.length) return;
            
            // Separate boosted and normal rows
            const boostedRows = [];
            const normalRows = [];
            
            allRows.forEach(row => {
                if (row.classList.contains('bg-yellow-50') || row.getAttribute('data-boosted') === '1') {
                    boostedRows.push(row);
                    row.remove(); // Remove from DOM temporarily
                } else {
                    normalRows.push(row);
                    row.remove(); // Remove from DOM temporarily
                }
            });
            
            
            // Re-append in correct order: boosted first, then normal
            boostedRows.forEach(row => {
                tbody.appendChild(row);
            });
            
            normalRows.forEach(row => {
                tbody.appendChild(row);
            });
        },
        
        loadMore() {
            if (this.loading || this.allLoaded) return;
            
            this.loading = true;
            this.page++;
            
            // Build URL with parameters
            let params = new URLSearchParams({
                page: this.page,
                ajax: 1,
                last_loaded_id: this.getLastLoadedId() // Add this to prevent duplications
            });
            
            // Add other parameters from config
            if (typeof RT_CONFIG !== 'undefined') {
                if (RT_CONFIG.category_id) params.append('category_id', RT_CONFIG.category_id);
                if (RT_CONFIG.category_slug) params.append('category_slug', RT_CONFIG.category_slug);
                if (RT_CONFIG.listing_type_filter) params.append('type', RT_CONFIG.listing_type_filter);
                if (RT_CONFIG.search) params.append('search', RT_CONFIG.search);
            }
            
            fetch(`${window.location.origin}/api/get-more-listings.php?${params.toString()}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const tbody = document.getElementById('listings-tbody');
                        
                        // Append new rows to table
                        if (data.html) {
                            // Add the HTML to the table
                            tbody.insertAdjacentHTML('beforeend', data.html);
                            
                            // Update highest ID if needed
                            if (data.highest_id > this.highestId) {
                                this.highestId = data.highest_id;
                                if (typeof RT_CONFIG !== 'undefined') {
                                    RT_CONFIG.highest_id = data.highest_id;
                                }
                            }
                        }
                        
                        // Check if we've reached the end
                        if (data.is_last_page) {
                            this.allLoaded = true;
                        }
                    } else {
                        console.error('Error loading more listings:', data.message);
                    }
                    
                    this.loading = false;
                })
                .catch(error => {
                    console.error('Error fetching more listings:', error);
                    this.loading = false;
                });
        },
        
        getLastLoadedId() {
            const tbody = document.getElementById('listings-tbody');
            const rows = tbody.querySelectorAll('tr[data-id]');
            let lastId = 0;
            
            if (rows.length > 0) {
                const lastRow = rows[rows.length-1];
                lastId = parseInt(lastRow.getAttribute('data-id') || 0);
            }
            
            return lastId;
        },
        
        checkForNewListings() {
            
            // Build URL with parameters
            let params = new URLSearchParams({
                check_type: 'new',
                latest_id: this.highestId,
                _: Date.now() // Cache busting
            });
            
            // Add other parameters from config if available
            if (typeof RT_CONFIG !== 'undefined') {
                if (RT_CONFIG.category_id) params.append('category_id', RT_CONFIG.category_id);
                if (RT_CONFIG.category_slug) params.append('category_slug', RT_CONFIG.category_slug);
                if (RT_CONFIG.listing_type_filter) params.append('type', RT_CONFIG.listing_type_filter);
                if (RT_CONFIG.search) params.append('search', RT_CONFIG.search);
            }
            
            // Make request
            fetch(`${window.location.origin}/api/get-new-listings.php?${params.toString()}`)
                .then(response => response.json())
                .then(data => {
                    
                    
                    if (data.success && data.count > 0) {
                        // Instead of showing notification, directly add new listings to the table
                        this.addNewListingsToTable(data.listings);
                        
                        // Update highest ID
                        if (data.highest_id > this.highestId) {
                            this.highestId = data.highest_id;
                            if (typeof RT_CONFIG !== 'undefined') {
                                RT_CONFIG.highest_id = data.highest_id;
                            }
                        }
                    }
                })
                .catch(error => {
                    console.error('Error checking for new listings:', error);
                });
        },
        
        // New function to add listings directly to table
        addNewListingsToTable(listings) {
            if (!listings || !listings.length) return;
            
            const tbody = document.getElementById('listings-tbody') || 
                         document.getElementById('listings-table-body');
                         
            if (!tbody) {
                console.error('Table body element not found');
                return;
            }
            
            // Check if "No listings found" message exists and remove it
            const noListingsRow = tbody.querySelector('tr td[colspan="6"]');
            if (noListingsRow && noListingsRow.textContent.trim().includes('No listings found')) {
                noListingsRow.parentElement.remove();
            }
            
            // Create HTML for new rows
            const newRowsHTML = listings.map(listing => {
                const isBoosted = listing.is_boosted || false;
                
                return `
                <tr data-id="${listing.id}" ${isBoosted ? 'class="bg-yellow-50"' : ''} data-boosted="${isBoosted ? '1' : '0'}" style="background-color: #e6fffa; transition: background-color 2s ease;">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            ${isBoosted ? '<span class="inline-flex items-center px-1 py-0 text-xs font-medium"><i class="fas fa-star text-yellow-500"></i></span>' : ''}
                            <a href="${window.location.origin}/${listing.full_url_path}" class="text-blue-600 hover:text-blue-800 font-medium">
                                ${listing.title}
                            </a>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <a href="${window.location.origin}/${listing.category_path}" class="text-gray-600 hover:text-gray-800">
                            ${listing.category_name}
                        </a>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${listing.incoterm}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${listing.quantity}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${listing.location}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${listing.created_at}
                    </td>
                </tr>
                `;
            }).join('');
            
            // Add new rows to the beginning of the table
            tbody.insertAdjacentHTML('afterbegin', newRowsHTML);
            
            // After 2 seconds, remove the highlight color
            setTimeout(() => {
                listings.forEach(listing => {
                    const row = tbody.querySelector(`tr[data-id="${listing.id}"]`);
                    if (row) {
                        row.style.backgroundColor = '';
                    }
                });
            }, 2000);
            
            // If some listings are boosted, re-sort the table
            if (listings.some(listing => listing.is_boosted)) {
                this.moveAllBoostedToTop(tbody);
            }
        }
    }));
});
