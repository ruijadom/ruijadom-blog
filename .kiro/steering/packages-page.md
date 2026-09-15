# Packages Page

## Overview
The packages page (`/packages`) displays all npm packages published by the author (ruijadom). It fetches package data directly from the npm registry API.

## Implementation Details

### Location
- **Route**: `/packages`
- **File**: `src/app/packages/page.tsx`

### Features
- Fetches packages from npm registry API using author search
- Displays package cards with:
  - Package name and version
  - Description
  - Last publish date
  - Links to npm, repository, and homepage
- Responsive grid layout (1 column on mobile, 2 columns on desktop)
- Hover effects on package cards
- Revalidates data every hour (ISR - Incremental Static Regeneration)

### API Integration
The page uses the npm registry search API:
```
https://registry.npmjs.org/-/v1/search?text=author:ruijadom&size=250
```

### Data Revalidation
- Uses Next.js ISR with `revalidate: 3600` (1 hour)
- This means the page is statically generated but updates every hour
- Provides fast page loads while keeping data relatively fresh

### Navigation
The packages link has been added to:
- Header navigation (desktop)
- Sidebar navigation (mobile)
- Located between "Blog" and "About" in the navigation

## Styling
- Uses existing design system components and utilities
- Consistent with the blog's dark theme
- Primary color accents for interactive elements
- Card-based layout with hover states

## Future Enhancements
Potential improvements:
- Add download statistics (requires additional API call to npm)
- Add search/filter functionality
- Add sorting options (by date, name, downloads)
- Add package categories or tags
- Show package dependencies
- Display GitHub stars if repository is available
