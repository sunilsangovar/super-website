document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin panel
    initAdminSidebar();
    updateStats();
    initAdminForms();
    
    // Refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            updateStats();
            showNotification('Data refreshed successfully!');
        });
    }
});

// Admin Sidebar Toggle
function initAdminSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // For mobile
            if (window.innerWidth <= 992) {
                sidebar.classList.toggle('active');
            }
        });
    }
}

// Update Dashboard Stats
function updateStats() {
    // In a real application, these would be fetched from a server
    // For demo purposes, we're using the config data
    
    const totalTools = document.getElementById('total-tools');
    const totalPages = document.getElementById('total-pages');
    const totalUsers = document.getElementById('total-users');
    const totalViews = document.getElementById('total-views');
    
    if (totalTools) {
        totalTools.textContent = window.siteConfig.tools.length;
    }
    
    if (totalPages) {
        // Count pages (about, contact, privacy, guide)
        totalPages.textContent = 4;
    }
    
    if (totalUsers) {
        // Just the admin user for now
        totalUsers.textContent = 1;
    }
    
    if (totalViews) {
        // Demo value
        const views = localStorage.getItem('totalViews') || 0;
        totalViews.textContent = views;
    }
}

// Initialize Admin Forms
function initAdminForms() {
    // Handle tool management forms
    initToolForms();
    
    // Handle content management forms
    initContentForms();
    
    // Handle settings forms
    initSettingsForms();
}

// Tool Management
function initToolForms() {
    const toolForm = document.getElementById('tool-form');
    const toolsList = document.getElementById('tools-list');
    
    if (toolForm) {
        toolForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const toolId = document.getElementById('tool-id').value;
            const toolName = document.getElementById('tool-name').value;
            const toolIcon = document.getElementById('tool-icon').value;
            const toolDescription = document.getElementById('tool-description').value;
            const toolContent = document.getElementById('tool-content').value;
            
            // Validate form
            if (!toolName || !toolIcon || !toolDescription) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Check if editing or adding
            const isEditing = toolId !== '';
            
            if (isEditing) {
                // Update existing tool
                updateTool(toolId, toolName, toolIcon, toolDescription, toolContent);
                showNotification('Tool updated successfully!');
            } else {
                // Add new tool
                addTool(toolName, toolIcon, toolDescription, toolContent);
                showNotification('Tool added successfully!');
            }
            
            // Reset form
            toolForm.reset();
            
            // Refresh tools list
            loadToolsList();
        });
    }
    
    // Load tools list if on tools page
    if (toolsList) {
        loadToolsList();
    }
}

// Load tools into table
function loadToolsList() {
    const toolsList = document.getElementById('tools-list');
    
    if (!toolsList) return;
    
    const tools = window.siteConfig.tools;
    
    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Icon</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    tools.forEach(tool => {
        html += `
            <tr>
                <td>${tool.id}</td>
                <td>${tool.name}</td>
                <td><i class="${tool.icon}"></i></td>
                <td>${tool.description.substring(0, 50)}${tool.description.length > 50 ? '...' : ''}</td>
                <td class="table-actions">
                    <button class="action-btn edit" data-id="${tool.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${tool.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    toolsList.innerHTML = html;
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const toolId = this.getAttribute('data-id');
            editTool(toolId);
        });
    });
    
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const toolId = this.getAttribute('data-id');
            deleteTool(toolId);
        });
    });
}

// Add new tool
function addTool(name, icon, description, content) {
    const newId = 'tool' + (window.siteConfig.tools.length + 1);
    
    const newTool = {
        id: newId,
        name: name,
        icon: icon,
        description: description,
        content: content
    };
    
    window.siteConfig.tools.push(newTool);
    
    // In a real application, this would be saved to a server
    // For demo purposes, we're just updating the in-memory config
    
    // Add to activity log
    addActivity('Added new tool: ' + name);
}

// Update existing tool
function updateTool(id, name, icon, description, content) {
    const toolIndex = window.siteConfig.tools.findIndex(t => t.id === id);
    
    if (toolIndex !== -1) {
        window.siteConfig.tools[toolIndex] = {
            id: id,
            name: name,
            icon: icon,
            description: description,
            content: content
        };
        
        // Add to activity log
        addActivity('Updated tool: ' + name);
    }
}

// Edit tool (load data into form)
function editTool(id) {
    const tool = window.siteConfig.tools.find(t => t.id === id);
    
    if (tool) {
        document.getElementById('tool-id').value = tool.id;
        document.getElementById('tool-name').value = tool.name;
        document.getElementById('tool-icon').value = tool.icon;
        document.getElementById('tool-description').value = tool.description;
        document.getElementById('tool-content').value = tool.content || '';
        
        // Update form title
        document.querySelector('.admin-header-bar h2').textContent = 'Edit Tool';
        
        // Scroll to form
        document.getElementById('tool-form').scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete tool
function deleteTool(id) {
    if (confirm('Are you sure you want to delete this tool?')) {
        const toolIndex = window.siteConfig.tools.findIndex(t => t.id === id);
        
        if (toolIndex !== -1) {
            const toolName = window.siteConfig.tools[toolIndex].name;
            window.siteConfig.tools.splice(toolIndex, 1);
            
            // Refresh tools list
            loadToolsList();
            
            // Add to activity log
            addActivity('Deleted tool: ' + toolName);
            
            showNotification('Tool deleted successfully!');
        }
    }
}

// Content Management
function initContentForms() {
    const contentForm = document.getElementById('content-form');
    const contentList = document.getElementById('content-list');
    
    if (contentForm) {
        contentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Handle content form submission
            showNotification('Content saved successfully!');
            
            // Add to activity log
            addActivity('Updated content page');
        });
    }
    
    // Load content list if on content page
    if (contentList) {
        // In a real application, this would load content pages from a server
    }
}

// Settings Management
function initSettingsForms() {
    const settingsForm = document.getElementById('settings-form');
    
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Handle settings form submission
            const siteTitle = document.getElementById('site-title').value;
            const siteDescription = document.getElementById('site-description').value;
            const siteLogo = document.getElementById('site-logo').value;
            const footerText = document.getElementById('footer-text').value;
            
            // Update site config
            window.siteConfig.site.title = siteTitle;
            window.siteConfig.site.description = siteDescription;
            window.siteConfig.site.logo = siteLogo;
            window.siteConfig.site.footerText = footerText;
            
            // In a real application, this would be saved to a server
            
            showNotification('Settings saved successfully!');
            
            // Add to activity log
            addActivity('Updated site settings');
        });
        
        // Load current settings
        if (window.siteConfig && window.siteConfig.site) {
            document.getElementById('site-title').value = window.siteConfig.site.title;
            document.getElementById('site-description').value = window.siteConfig.site.description;
            document.getElementById('site-logo').value = window.siteConfig.site.logo;
            document.getElementById('footer-text').value = window.siteConfig.site.footerText;
        }
    }
}

// Add activity to log
function addActivity(text) {
    const activityList = document.querySelector('.activity-list');
    
    if (activityList) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-edit"></i>
            </div>
            <div class="activity-details">
                <p class="activity-text">${text}</p>
                <p class="activity-time">${timeString}</p>
            </div>
        `;
        
        // Add to beginning of list
        activityList.insertBefore(activityItem, activityList.firstChild);
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Add close button event
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
} 