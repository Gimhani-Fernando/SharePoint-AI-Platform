#!/usr/bin/env node
// Quick script to replace all Grid item usage with Box components

const fs = require('fs');
const path = require('path');

const componentsDir = '/Users/ransika/Documents/sharepoint-ai/frontend/src/components';

// Files to process
const files = ['DashboardHome.tsx', 'DocumentManager.tsx', 'SharePointSync.tsx', 'Settings.tsx'];

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove Grid import if it's unused after our changes
    content = content.replace(/import.*Grid.*from '@mui\/material';?\n?/g, '');
    content = content.replace(/,\s*Grid\s*,/g, ',');
    content = content.replace(/{\s*Grid\s*}/g, '{}');
    
    // Replace simple Grid container patterns
    content = content.replace(/<Grid container spacing=\{(\d+)\}>/g, '<Box sx={{ display: "grid", gap: $1 }}>');
    content = content.replace(/<Grid container spacing=\{(\d+)\} sx=\{([^}]+)\}>/g, '<Box sx={{ display: "grid", gap: $1, $2 }}>');
    content = content.replace(/<\/Grid>/g, '</Box>');
    
    // Replace Grid items with basic Box
    content = content.replace(/<Grid item[^>]*>/g, '<Box>');
    
    console.log(`Fixed ${file}`);
    fs.writeFileSync(filePath, content);
  }
});

console.log('Grid fixes completed!');