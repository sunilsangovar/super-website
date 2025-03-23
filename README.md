# Advanced Tools Website

A dynamic website featuring a collection of useful tools with content and settings management capabilities.

## Features

- **Dynamic Tools**: Collection of useful web-based tools
- **Admin Panel**: Manage tools, content, and site settings
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Theme Support**: Multiple themes with dark mode toggle
- **Content Management**: Add, edit, and delete pages
- **Tool Management**: Add, edit, and delete tools

## Tools Included

1. **Text Analyzer**: Analyze text for word count, character count, and more
2. **Color Converter**: Convert between different color formats (HEX, RGB, HSL)
3. **Password Generator**: Generate secure random passwords with custom options

## Project Structure

```
/
├── index.html              # Main homepage
├── tool.html               # Tool display page
├── css/
│   ├── style.css           # Main styles
│   ├── themes.css          # Theme styles
│   └── tool.css            # Tool-specific styles
├── js/
│   ├── main.js             # Main JavaScript
│   ├── themes.js           # Theme functionality
│   └── config.js           # Site configuration
├── admin/
│   ├── index.html          # Admin dashboard
│   ├── tools.html          # Tool management
│   ├── content.html        # Content management
│   ├── settings.html       # Site settings
│   ├── css/
│   │   └── admin.css       # Admin styles
│   └── js/
│       └── admin.js        # Admin functionality
├── images/                 # Image assets
├── .htaccess               # Server configuration
└── .gitignore              # Git ignore file
```

## Getting Started

1. Clone the repository
2. Upload to a web server with PHP support
3. Access the website through your browser
4. Access the admin panel at `/admin` (default credentials: admin/admin123)

## Customization

### Adding a New Tool

1. Log in to the admin panel
2. Go to "Manage Tools"
3. Click "Add New Tool"
4. Fill in the tool details and content
5. Save the tool

### Modifying Site Settings

1. Log in to the admin panel
2. Go to "Site Settings"
3. Update the settings as needed
4. Save the changes

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome Icons
- Local Storage for data persistence

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Font Awesome for the icons
- Various open-source projects for inspiration 