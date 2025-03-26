document.addEventListener('DOMContentLoaded', function() {
    // Initialize static functionality only
    initSidebar();
    initThemeToggle();
    updateCopyright();
});

// Initialize sidebar functionality
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        // Toggle sidebar when clicking the toggle button
    sidebarToggle.addEventListener('click', function() {
            // Toggle between three states: expanded, collapsed (icons only), and hidden
            if (sidebar.classList.contains('active') && !sidebar.classList.contains('collapsed')) {
                // If sidebar is active but not collapsed, collapse it (icons only)
                sidebar.classList.add('collapsed');
            } else if (sidebar.classList.contains('collapsed')) {
                // If sidebar is collapsed (icons only), hide it
                sidebar.classList.remove('active');
                sidebar.classList.remove('collapsed');
            } else {
                // If sidebar is hidden, show it expanded
                sidebar.classList.add('active');
                sidebar.classList.remove('collapsed');
            }
            
            // For small screens, also toggle body class to prevent scrolling
            if (window.innerWidth <= 768) {
                document.body.classList.toggle('sidebar-open');
            }
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                !e.target.closest('#sidebar') && 
                !e.target.closest('#sidebar-toggle') && 
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                sidebar.classList.remove('collapsed');
                document.body.classList.remove('sidebar-open');
            }
        });
        
        // Set initial state based on screen size
        setInitialSidebarState();
        
        // Update sidebar state on window resize
        window.addEventListener('resize', setInitialSidebarState);
    }
    
    function setInitialSidebarState() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            sidebar.classList.remove('collapsed');
            document.body.classList.remove('sidebar-open');
        } else {
            sidebar.classList.add('active');
            sidebar.classList.remove('collapsed');
        }
    }
}

// Initialize theme toggle functionality
function initThemeToggle() {
    // Theme selection
    const themeButtons = document.querySelectorAll('.theme-btn');
    if (themeButtons) {
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
                document.body.className = '';
                document.body.classList.add(`theme-${theme}`);
            localStorage.setItem('theme', theme);
        });
    });
}

    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        // Check if dark mode was previously enabled
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }
    
    // Load saved theme if any
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = '';
        document.body.classList.add(`theme-${savedTheme}`);
    }
}

// Update copyright year
function updateCopyright() {
    const copyrightYearElement = document.getElementById('current-year');
    if (copyrightYearElement) {
        copyrightYearElement.textContent = new Date().getFullYear();
    }
}

// Simple tool-specific functions
document.addEventListener('click', function(e) {
    // Copy button functionality for tools
    if (e.target.closest('#copy-btn')) {
        const outputElement = document.getElementById('password-output');
        if (outputElement) {
            outputElement.select();
            document.execCommand('copy');
            alert('Password copied to clipboard!');
        }
    }
    
    // Password generator functionality
    if (e.target.closest('#generate-btn')) {
        const passwordOutput = document.getElementById('password-output');
        const lengthInput = document.getElementById('password-length');
        const includeUppercase = document.getElementById('include-uppercase');
        const includeLowercase = document.getElementById('include-lowercase');
        const includeNumbers = document.getElementById('include-numbers');
        const includeSymbols = document.getElementById('include-symbols');
        
        if (passwordOutput && lengthInput) {
            const length = parseInt(lengthInput.value);
            const uppercase = includeUppercase && includeUppercase.checked;
            const lowercase = includeLowercase && includeLowercase.checked;
            const numbers = includeNumbers && includeNumbers.checked;
            const symbols = includeSymbols && includeSymbols.checked;
            
            let charset = '';
            if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
            if (numbers) charset += '0123456789';
            if (symbols) charset += '!@#$%^&*()_+[]{}|;:,.<>?';
            
            if (charset === '') {
                passwordOutput.value = 'Select at least one character type';
                return;
            }
            
            let password = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                password += charset.charAt(randomIndex);
            }
            
            passwordOutput.value = password;
            
            // Update strength indicator
            const strengthIndicator = document.getElementById('strength-indicator');
            const strengthText = document.getElementById('strength-text');
            
            if (strengthIndicator && strengthText) {
                let strength = 0;
                
                // Check password length
                if (length >= 8) strength += 1;
                if (length >= 12) strength += 1;
                
                // Check character variety
                if (uppercase) strength += 1;
                if (lowercase) strength += 1;
                if (numbers) strength += 1;
                if (symbols) strength += 1;
                
                // Set strength indicator width and color
                let strengthPercentage = (strength / 6) * 100;
                strengthIndicator.style.width = `${strengthPercentage}%`;
                
                if (strength <= 2) {
                    strengthIndicator.style.backgroundColor = 'var(--error-color)';
                    strengthText.textContent = 'Weak';
                } else if (strength <= 4) {
                    strengthIndicator.style.backgroundColor = 'var(--warning-color)';
                    strengthText.textContent = 'Medium';
                } else {
                    strengthIndicator.style.backgroundColor = 'var(--success-color)';
                    strengthText.textContent = 'Strong';
                }
            }
        }
    }
});