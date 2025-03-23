document.addEventListener('DOMContentLoaded', function() {
    // Initialize the website
    initSidebar();
    initThemeToggle();
    initSearch();
    updateCopyright();
    initStaticPages();
    initUrlHandler();
    
    // Initialize home page with tool cards
    handleInitialUrl();
});

// Handle URL changes and navigation
function initUrlHandler() {
    // Listen for URL changes (back/forward buttons)
    window.addEventListener('popstate', function(event) {
        // Get current hash from the URL
        const currentHash = window.location.hash;
        handleUrl(currentHash);
    });
    
    // Handle clicks on all internal links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            e.preventDefault();
            const url = link.getAttribute('href');
            history.pushState(null, '', url);
            handleUrl(url);
        }
    });
}

// Handle initial URL on page load
function handleInitialUrl() {
    const hash = window.location.hash;
    
    // If there's a hash in the URL, handle that route
    if (hash) {
        handleUrl(hash);
    } else {
        // If no hash, mark the home link as active and load home page
        const homeItem = document.querySelector('#tools-menu li a[data-route="home"]')?.parentElement;
        if (homeItem) {
            homeItem.classList.add('active');
            // Set icon color explicitly
            const icon = homeItem.querySelector('i');
            if (icon) {
                icon.style.color = 'var(--primary-color)';
            }
        }
        initHomePage();
    }
}

// Handle URL routing
async function handleUrl(hash) {
    const mainContent = document.getElementById('main-content');
    const route = hash.replace('#', '');
    
    // Update active menu item
    const menuItems = document.querySelectorAll('#tools-menu li');
    menuItems.forEach(item => {
        item.classList.remove('active');
        // Reset icon color
        const icon = item.querySelector('i');
        if (icon) {
            icon.style.color = '';
        }
    });
    
    // Find and activate the current menu item
    if (!route || route === 'home') {
        // Activate home item
        const homeItem = document.querySelector('#tools-menu li a[data-route="home"]')?.parentElement;
        if (homeItem) {
            homeItem.classList.add('active');
            // Set icon color explicitly
            const icon = homeItem.querySelector('i');
            if (icon) {
                icon.style.color = 'var(--primary-color)';
            }
        }
    } else {
        // Activate tool item
        const toolItem = document.querySelector(`#tools-menu li a[data-tool="${route}"]`)?.parentElement;
        if (toolItem) {
            toolItem.classList.add('active');
            // Set icon color explicitly
            const icon = toolItem.querySelector('i');
            if (icon) {
                icon.style.color = 'var(--primary-color)';
            }
        }
    }
    
    // Check if it's a search result URL
    if (route.startsWith('search?')) {
        // Extract search query parameter
        const queryParam = route.split('?q=')[1];
        if (queryParam) {
            const query = decodeURIComponent(queryParam);
            
            // Update search input field with the query
            const searchInput = document.getElementById('search-input');
            searchInput.value = query;
            
            // Perform the search
            performSearch(query);
            return;
        }
    }
    
    // Handle different routes
    if (!route || route === 'home') {
        initHomePage();
        return;
    }
    
    // Handle static pages first
    const staticPages = ['about', 'contact', 'privacy', 'guide'];
    if (staticPages.includes(route)) {
        const pageTitle = route.charAt(0).toUpperCase() + route.slice(1);
        mainContent.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading ${pageTitle} Page...</p>
                <div class="loading-details">Please wait while we prepare the content</div>
            </div>
        `;
        await loadStaticPage(route);
        return;
    }
    
    // Handle tool routes (any route not matching static pages)
    const toolName = route.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    mainContent.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading ${toolName}...</p>
            <div class="loading-details">Preparing your tool interface</div>
        </div>
    `;
    await loadToolContent(route);
}

// Load tool content
async function loadToolContent(toolFilename) {
    const mainContent = document.getElementById('main-content');
    const toolTitle = toolFilename.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    try {
        const response = await fetch(`tools/${toolFilename}.html`);
        if (!response.ok) throw new Error(`Failed to load ${toolTitle}`);
        const content = await response.text();
        
        mainContent.innerHTML = content;
        
        // Update breadcrumb
        const breadcrumb = document.getElementById('breadcrumb');
        breadcrumb.innerHTML = `
            <a href="#" onclick="initHomePage(); return false;">Home</a>
            <span class="separator">&gt;</span>
            <span class="current-page">${toolTitle}</span>
        `;
        
        // Initialize tool-specific JavaScript if needed
        if (window[`init${toolFilename.replace(/-/g, '')}`]) {
            window[`init${toolFilename.replace(/-/g, '')}`]();
        }
    } catch (error) {
        mainContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load ${toolTitle}</p>
                <div class="error-details">${error.message}</div>
                <button class="retry-button" onclick="loadToolContent('${toolFilename}')">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Load static page content
async function loadStaticPage(pageName) {
    const mainContent = document.getElementById('main-content');
    const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    
    try {
        const response = await fetch(`pages/${pageName}.html`);
        if (!response.ok) throw new Error(`Failed to load ${pageTitle} page`);
        const content = await response.text();
        
        mainContent.innerHTML = content;
        
        // Update breadcrumb
        const breadcrumb = document.getElementById('breadcrumb');
        breadcrumb.innerHTML = `
            <a href="#" onclick="initHomePage(); return false;">Home</a>
            <span class="separator">&gt;</span>
            <span class="current-page">${pageTitle}</span>
        `;
    } catch (error) {
        mainContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load ${pageTitle} page</p>
                <div class="error-details">${error.message}</div>
                <button class="retry-button" onclick="loadStaticPage('${pageName}')">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Initialize home page
function initHomePage() {
    const mainContent = document.getElementById('main-content');
    const breadcrumb = document.getElementById('breadcrumb');
    
    // Update breadcrumb to show only Home
    breadcrumb.innerHTML = `
        <span class="current-page">Home</span>
    `;
    
    // Set up page content with website overview and tools grid
    mainContent.innerHTML = `
        <div class="website-overview">
            <h2>Welcome to Advanced Tools</h2>
            <p class="overview-text">
                Discover our comprehensive collection of powerful web-based tools designed to simplify complex tasks and boost your productivity. 
                From data conversion to calculations, text manipulation to color utilities, we offer a wide range of tools that are easy to use and free.
            </p>
            <p class="overview-text">
                Simply browse through our gallery below, select a tool that fits your needs, and start using it right away. No downloads, no installations, just instant access to powerful utilities.
            </p>
            <div class="overview-features">
                <div class="feature">
                    <i class="fas fa-bolt"></i>
                    <h3>Fast & Efficient</h3>
                    <p>All tools are optimized for speed and performance</p>
                </div>
                <div class="feature">
                    <i class="fas fa-lock"></i>
                    <h3>Secure</h3>
                    <p>Your data never leaves your browser</p>
                </div>
                <div class="feature">
                    <i class="fas fa-tablet-alt"></i>
                    <h3>Responsive</h3>
                    <p>Works on all devices and screen sizes</p>
                </div>
            </div>
        </div>
        <h2>Tools Gallery</h2>
        <div class="tools-grid" id="tools-grid">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading Tools Gallery...</p>
                <div class="loading-details">Discovering available tools</div>
            </div>
        </div>
    `;
    
    // Load tool cards
    loadToolCards();
}

// Sidebar Toggle Functionality
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const breadcrumb = document.getElementById('breadcrumb');
    
    // Create overlay element for mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    // Add mobile class to body when in mobile view
    function checkMobileView() {
        if (window.innerWidth <= 992) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }
    
    // Initial check
    checkMobileView();
    
    sidebarToggle.addEventListener('click', function() {
        if (window.innerWidth <= 992) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Prevent body scrolling when sidebar is open on mobile
            if (sidebar.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        } else {
            sidebar.classList.toggle('collapsed');
        }
    });
    
    // Close sidebar when clicking overlay on mobile
    overlay.addEventListener('click', function() {
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close sidebar when clicking on sidebar links in mobile view
    sidebar.addEventListener('click', function(event) {
        if (window.innerWidth <= 992) {
            // Check if the clicked element is a link or inside a link
            const linkElement = event.target.closest('a');
            if (linkElement && sidebar.contains(linkElement)) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 992 && 
            !sidebar.contains(event.target) && 
            !sidebarToggle.contains(event.target) &&
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle resize events to ensure proper sidebar state
    window.addEventListener('resize', function() {
        checkMobileView();
        if (window.innerWidth > 992) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Theme Toggle Functionality
function initThemeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'default';
    const darkMode = localStorage.getItem('darkMode') === 'true';
    
    // Apply saved theme
    document.body.className = `theme-${savedTheme}`;
    if (darkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    
    // Dark mode toggle
    darkModeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', this.checked);
    });
    
    // Theme buttons
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            document.body.className = `theme-${theme}`;
            if (darkModeToggle.checked) {
                document.body.classList.add('dark-mode');
            }
            localStorage.setItem('theme', theme);
        });
    });
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    // Add search event listeners
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        } else {
            clearSearch();
        }
    });
    
    // Handle Enter key press
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query) {
                performSearch(query);
            } else {
                clearSearch();
            }
        }
    });

    // Handle all input changes (typing, pasting, selecting from history)
    searchInput.addEventListener('input', function(e) {
        const query = this.value.trim();
        if (query === '') {
            clearSearch();
        } else {
            // Add a small delay to avoid too frequent searches
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300); // 300ms delay
        }
    });
}

// Display search results
function displaySearchResults(searchResults, query) {
    const mainContent = document.getElementById('main-content');
    
    // Create search results container
    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.className = 'search-results-container';
    
    // Add search results message
    const resultsMessage = document.createElement('div');
    resultsMessage.className = 'results-message fade-in';
    
    if (searchResults.length === 0) {
        resultsMessage.innerHTML = `
            <p>No results found for "<strong>${query}</strong>"</p>
            <p class="search-tip">Try using different keywords or check your spelling.</p>
        `;
    } else {
        const resultCount = searchResults.length;
        resultsMessage.innerHTML = `
            <p>Found <strong>${resultCount}</strong> ${resultCount === 1 ? 'result' : 'results'} for "<strong>${query}</strong>"</p>
            <p class="search-tip">Showing exact word matches first. Searching tool names, filenames, and descriptions.</p>
        `;
    }
    
    searchResultsContainer.appendChild(resultsMessage);
    
    // Create tools grid for results
    const toolsGrid = document.createElement('div');
    toolsGrid.className = 'tools-grid';
    toolsGrid.id = 'tools-grid';
    
    if (searchResults.length === 0) {
        toolsGrid.innerHTML = `
            <div class="message fade-in">
                <i class="fas fa-search"></i>
                <p>No tools found matching "${query}"</p>
                <button onclick="clearSearch()" class="clear-search-button">
                    <i class="fas fa-times"></i> Clear Search
                </button>
            </div>
        `;
    } else {
        // Add tool cards for search results
        searchResults.forEach((tool, index) => {
            const card = document.createElement('div');
            card.className = 'tool-card';
            
            // Use the icon from the tool object, which was set during loadTools()
            const icon = tool.icon || getDefaultIcon(tool.filename);
            
            // Split the query into words for exact word highlighting
            const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
            
            let highlightedName = tool.name;
            let highlightedDescription = tool.description || `A powerful tool to help with your tasks.`;
            
            // First check for exact word matches and highlight them with a stronger highlight
            searchTerms.forEach(term => {
                if (term.length > 1) { // Only highlight terms with more than 1 character
                    // Create pattern for word boundaries
                    const wordPattern = new RegExp(`\\b(${term})\\b`, 'gi');
                    highlightedName = highlightedName.replace(wordPattern, '<span class="highlight-exact">$1</span>');
                    highlightedDescription = highlightedDescription.replace(wordPattern, '<span class="highlight-exact">$1</span>');
                }
            });
            
            // Then check for partial matches with standard highlighting
            searchTerms.forEach(term => {
                if (term.length > 2) { // Only highlight terms with more than 2 characters
                    // Avoid re-highlighting already highlighted exact matches
                    const safePattern = new RegExp(`(?<!<span class="highlight-exact">)(${term})(?!</span>)`, 'gi');
                    highlightedName = highlightedName.replace(safePattern, '<span class="highlight-term">$1</span>');
                    highlightedDescription = highlightedDescription.replace(safePattern, '<span class="highlight-term">$1</span>');
                }
            });
            
            // Determine what type of matches were found (exact or partial)
            const hasExactNameMatch = searchTerms.some(term => {
                const wordPattern = new RegExp(`\\b${term}\\b`, 'i');
                return wordPattern.test(tool.name.toLowerCase());
            });
            
            const hasExactFilenameMatch = searchTerms.some(term => {
                const wordPattern = new RegExp(`\\b${term}\\b`, 'i');
                return wordPattern.test(tool.filename.toLowerCase());
            });
            
            const hasExactDescriptionMatch = searchTerms.some(term => {
                const wordPattern = new RegExp(`\\b${term}\\b`, 'i');
                return wordPattern.test((tool.description || '').toLowerCase());
            });
            
            card.innerHTML = `
                <i class="${icon}"></i>
                <h3>${highlightedName}</h3>
                <p class="tool-card-description">${highlightedDescription}</p>
                <div class="match-info">
                    <span class="match-label">Matches:</span>
                    ${hasExactNameMatch ? '<span class="match-badge exact">Name (exact)</span>' : 
                      tool.name.toLowerCase().includes(query.toLowerCase()) ? '<span class="match-badge">Name</span>' : ''}
                    ${hasExactFilenameMatch ? '<span class="match-badge exact">Filename (exact)</span>' : 
                      tool.filename.toLowerCase().includes(query.toLowerCase()) ? '<span class="match-badge">Filename</span>' : ''}
                    ${hasExactDescriptionMatch ? '<span class="match-badge exact">Description (exact)</span>' : 
                      (tool.description || '').toLowerCase().includes(query.toLowerCase()) ? '<span class="match-badge">Description</span>' : ''}
                </div>
                <a href="#${tool.filename}" data-tool="${tool.filename}" class="tool-card-link">Open Tool</a>
            `;
            
            toolsGrid.appendChild(card);
            
            // Add fade-in animation with delay
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
    }
    
    // Add the tools grid to the search results container
    searchResultsContainer.appendChild(toolsGrid);
    
    // Replace the main content with the search results container
    mainContent.innerHTML = '';
    mainContent.appendChild(searchResultsContainer);
    
    // Add click handlers for search result cards
    document.querySelectorAll('.tool-card-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const toolName = link.getAttribute('data-tool');
            const url = `#${toolName}`;
            history.pushState(null, '', url);
            handleUrl(url);
        });
    });
}

// Clear search and return to home view
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';
    
    // Return to home page - use replaceState instead of pushState to avoid
    // creating extra history entries when clearing search
    history.replaceState(null, '', '#home');
    initHomePage();
}

// Update copyright year
function updateCopyright() {
    const currentYear = new Date().getFullYear();
    document.getElementById('current-year').textContent = currentYear;
}

// Load tools dynamically from the tools directory
async function loadTools() {
    try {
        // Fetch the list of files from the tools directory
        const response = await fetch('/tools/');
        const text = await response.text();
        
        // Create a temporary element to parse the HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // Get all links that end with .html
        const toolFiles = Array.from(doc.querySelectorAll('a'))
            .filter(a => a.href.endsWith('.html'))
            .map(a => {
                // Get the filename without .html
                const filename = a.href.split('/').pop().replace('.html', '');
                // Convert filename to proper name (e.g., "text-analyzer" -> "Text Analyzer")
                const name = filename
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                return { filename, name, icon: null }; // Add icon property, initially null
            });

        // Fetch icon information for each tool
        await Promise.all(toolFiles.map(async tool => {
            try {
                const metadata = await getToolIcon(tool.filename);
                tool.icon = metadata.icon; // Store the icon class
                tool.description = metadata.description; // Store the description
            } catch (error) {
                console.error(`Error fetching metadata for ${tool.filename}:`, error);
                // Use default icon if fetch fails
                tool.icon = getDefaultIcon(tool.filename);
                tool.description = `A powerful ${tool.filename.replace(/-/g, ' ')} tool.`;
            }
        }));

        // Populate sidebar menu
        const toolsMenu = document.getElementById('tools-menu');
        toolsMenu.innerHTML = '';
        
        // Add home link
        const homeLi = document.createElement('li');
        const homeLink = document.createElement('a');
        homeLink.href = '#home';
        homeLink.innerHTML = '<i class="fas fa-home"></i><span>Home</span>';
        homeLink.setAttribute('data-route', 'home');
        homeLi.appendChild(homeLink);
        toolsMenu.appendChild(homeLi);

        // Add tools links
        toolFiles.forEach(tool => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${tool.filename}`;
            a.innerHTML = `<i class="${tool.icon}"></i><span>${tool.name}</span>`;
            a.setAttribute('data-tool', tool.filename);
            li.appendChild(a);
            toolsMenu.appendChild(li);
        });

        // Return the tool files array for search functionality
        return toolFiles;

    } catch (error) {
        console.error('Error loading tools:', error);
        // Add error message to sidebar
        const toolsMenu = document.getElementById('tools-menu');
        toolsMenu.innerHTML = '<li class="error">Error loading tools</li>';
        // Return empty array in case of error
        return [];
    }
}

// Get the icon for a tool by fetching its HTML file and looking for metadata
async function getToolIcon(filename) {
    try {
        const response = await fetch(`tools/${filename}.html`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch tool HTML for ${filename}`);
        }
        
        const html = await response.text();
        
        // Try to find a meta tag or data attribute with icon information
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Method 1: Check for a meta tag with icon information
        const metaIcon = doc.querySelector('meta[name="tool-icon"]');
        const iconValue = metaIcon && metaIcon.getAttribute('content') 
            ? metaIcon.getAttribute('content') 
            : null;
            
        // Check for tool description meta tag
        const metaDescription = doc.querySelector('meta[name="description"]');
        const descriptionValue = metaDescription && metaDescription.getAttribute('content')
            ? metaDescription.getAttribute('content')
            : null;
        
        // Method 2: Check for data attribute on the main container
        const container = doc.querySelector('[data-tool-icon]');
        const containerIcon = container && container.getAttribute('data-tool-icon')
            ? container.getAttribute('data-tool-icon')
            : null;
            
        // Method 2: Check for description data attribute
        const descriptionContainer = doc.querySelector('[data-tool-description]');
        const containerDescription = descriptionContainer && descriptionContainer.getAttribute('data-tool-description')
            ? descriptionContainer.getAttribute('data-tool-description')
            : null;
        
        // Return an object with both icon and description
        return {
            icon: iconValue || containerIcon || getDefaultIcon(filename),
            description: descriptionValue || containerDescription || `A powerful ${filename.replace(/-/g, ' ')} tool.`
        };
        
    } catch (error) {
        console.error(`Error fetching tool metadata for ${filename}:`, error);
        return {
            icon: getDefaultIcon(filename),
            description: `A powerful ${filename.replace(/-/g, ' ')} tool.`
        };
    }
}

// Fallback function to get default icon based on filename
function getDefaultIcon(filename) {
    // Default icon mapping logic
    let icon = 'fas fa-tools';
    if (filename.includes('calculator')) icon = 'fas fa-calculator';
    if (filename.includes('password')) icon = 'fas fa-key';
    if (filename.includes('text')) icon = 'fas fa-font';
    if (filename.includes('color')) icon = 'fas fa-palette';
    if (filename.includes('age')) icon = 'fas fa-calendar-alt';
    return icon;
}

// Initialize tool navigation
function initToolNavigation() {
    // No need for click handlers here anymore
    // URL handler will take care of navigation
}

// Load tool cards for home page
async function loadToolCards() {
    const toolsGrid = document.getElementById('tools-grid');
    if (!toolsGrid) return;
    
    try {
        // Define tool data manually instead of calling loadTools()
        const toolFiles = [
            { filename: 'text-analyzer', name: 'Text Analyzer', icon: 'fas fa-font', description: 'Analyze text for word count, character count, and more.' },
            { filename: 'password-generator', name: 'Password Generator', icon: 'fas fa-key', description: 'Generate secure passwords with customizable options.' },
            { filename: 'image-resizer', name: 'Image Resizer', icon: 'fas fa-image', description: 'Resize your images to different dimensions.' },
            { filename: 'qr-code-generator', name: 'QR Code Generator', icon: 'fas fa-qrcode', description: 'Create QR codes for URLs, text, and more.' },
            { filename: 'text-to-speech', name: 'Text to Speech', icon: 'fas fa-volume-up', description: 'Convert text to spoken words.' },
            { filename: 'mp4-to-mp3', name: 'MP4 to MP3', icon: 'fas fa-file-audio', description: 'Convert MP4 videos to MP3 audio files.' },
            { filename: 'online-calculator', name: 'Online Calculator', icon: 'fas fa-calculator', description: 'Perform mathematical calculations online.' },
            { filename: 'yt-thumb-downloader', name: 'YT Thumb Downloader', icon: 'fab fa-youtube', description: 'Download thumbnails from YouTube videos.' },
            { filename: 'yt-video-downloader', name: 'YT Video Downloader', icon: 'fab fa-youtube', description: 'Download videos from YouTube.' },
            { filename: 'pdf-merger', name: 'PDF Merger', icon: 'fas fa-file-pdf', description: 'Merge multiple PDF files into a single document.' },
            { filename: 'grammar-checker', name: 'Grammar Checker', icon: 'fas fa-spell-check', description: 'Check your text for grammar and spelling errors.' },
            { filename: 'background-remover', name: 'Background Remover', icon: 'fas fa-cut', description: 'Remove backgrounds from your images.' },
            { filename: 'pdf-editor', name: 'PDF Editor', icon: 'fas fa-edit', description: 'Edit PDF files online.' },
            { filename: 'code-generator', name: 'Code Generator', icon: 'fas fa-code', description: 'Generate code snippets for various programming languages.' },
            { filename: 'age-calculator', name: 'Age Calculator', icon: 'fas fa-birthday-cake', description: 'Calculate age based on birthdate.' },
            { filename: 'emi-calculator', name: 'EMI Calculator', icon: 'fas fa-money-bill', description: 'Calculate EMI for loans and mortgages.' },
            { filename: 'color-converter', name: 'Color Converter', icon: 'fas fa-palette', description: 'Convert between different color formats.' }
        ];
        
        toolsGrid.innerHTML = '';
            
        // Create tool cards
        toolFiles.forEach((tool, index) => {
            const card = document.createElement('div');
            card.className = 'tool-card';
            
            card.innerHTML = `
                <i class="${tool.icon}"></i>
                <h3>${tool.name}</h3>
                <p class="tool-card-description">${tool.description || `A powerful tool to help with your tasks.`}</p>
                <a href="#${tool.filename}" data-tool="${tool.filename}" class="tool-card-link">Open Tool</a>
            `;
            
            toolsGrid.appendChild(card);
            
            // Add fade-in animation with delay based on index
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100); // 100ms delay between each card
        });
        
        // Update the card click handler to use URL navigation
        document.querySelectorAll('.tool-card-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const toolName = link.getAttribute('data-tool');
                const url = `#${toolName}`;
                history.pushState(null, '', url);
                handleUrl(url);
            });
        });
        
    } catch (error) {
        console.error('Error loading tool cards:', error);
        toolsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load tools. Please try again later.</p>
                <button onclick="loadToolCards()" class="retry-button">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Initialize static page navigation
function initStaticPages() {
    // Remove the old initStaticPages function as it's now handled by URL handler
}

// Function to perform search
async function performSearch(query) {
    if (!query) return;
    
    const mainContent = document.getElementById('main-content');
    
    // Show loading indicator
    mainContent.innerHTML = `
        <div class="loading search-loading">
            <i class="fas fa-search"></i>
            <p>Searching for "${query}"...</p>
            <div class="loading-details">Searching through all tools and content</div>
        </div>
    `;
    
    try {
        // Define tool data manually instead of calling loadTools()
        const toolFiles = [
            { filename: 'text-analyzer', name: 'Text Analyzer', icon: 'fas fa-font', description: 'Analyze text for word count, character count, and more.' },
            { filename: 'password-generator', name: 'Password Generator', icon: 'fas fa-key', description: 'Generate secure passwords with customizable options.' },
            { filename: 'image-resizer', name: 'Image Resizer', icon: 'fas fa-image', description: 'Resize your images to different dimensions.' },
            { filename: 'qr-code-generator', name: 'QR Code Generator', icon: 'fas fa-qrcode', description: 'Create QR codes for URLs, text, and more.' },
            { filename: 'text-to-speech', name: 'Text to Speech', icon: 'fas fa-volume-up', description: 'Convert text to spoken words.' },
            { filename: 'mp4-to-mp3', name: 'MP4 to MP3', icon: 'fas fa-file-audio', description: 'Convert MP4 videos to MP3 audio files.' },
            { filename: 'online-calculator', name: 'Online Calculator', icon: 'fas fa-calculator', description: 'Perform mathematical calculations online.' },
            { filename: 'yt-thumb-downloader', name: 'YT Thumb Downloader', icon: 'fab fa-youtube', description: 'Download thumbnails from YouTube videos.' },
            { filename: 'yt-video-downloader', name: 'YT Video Downloader', icon: 'fab fa-youtube', description: 'Download videos from YouTube.' },
            { filename: 'pdf-merger', name: 'PDF Merger', icon: 'fas fa-file-pdf', description: 'Merge multiple PDF files into a single document.' },
            { filename: 'grammar-checker', name: 'Grammar Checker', icon: 'fas fa-spell-check', description: 'Check your text for grammar and spelling errors.' },
            { filename: 'background-remover', name: 'Background Remover', icon: 'fas fa-cut', description: 'Remove backgrounds from your images.' },
            { filename: 'pdf-editor', name: 'PDF Editor', icon: 'fas fa-edit', description: 'Edit PDF files online.' },
            { filename: 'code-generator', name: 'Code Generator', icon: 'fas fa-code', description: 'Generate code snippets for various programming languages.' },
            { filename: 'age-calculator', name: 'Age Calculator', icon: 'fas fa-birthday-cake', description: 'Calculate age based on birthdate.' },
            { filename: 'emi-calculator', name: 'EMI Calculator', icon: 'fas fa-money-bill', description: 'Calculate EMI for loans and mortgages.' },
            { filename: 'color-converter', name: 'Color Converter', icon: 'fas fa-palette', description: 'Convert between different color formats.' }
        ];
        
        // Function to check if a string contains the search query
        const matchesSearch = (str, query) => {
            return str.toLowerCase().includes(query.toLowerCase());
        };
        
        // Search tools by name and description
        const searchResults = toolFiles.filter(tool => 
            matchesSearch(tool.name, query) || 
            matchesSearch(tool.description, query) || 
            matchesSearch(tool.filename, query)
        );
        
        // Update the browser URL and title
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('q', query);
        history.pushState(null, `Search: ${query}`, `#search?q=${encodeURIComponent(query)}`);
        
        // Update breadcrumb
        const breadcrumb = document.getElementById('breadcrumb');
        breadcrumb.innerHTML = `
            <a href="#home" data-route="home">Home</a>
            <span class="separator">&gt;</span>
            <span class="current-page">Search Results: "${query}"</span>
        `;

        // Display search results
        displaySearchResults(searchResults, query);
        
    } catch (error) {
        console.error('Error performing search:', error);
        mainContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Search failed</p>
                <div class="error-details">${error.message}</div>
                <button class="retry-button" onclick="performSearch('${query}')">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
} 