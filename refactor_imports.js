const fs = require('fs');
const path = require('path');

const mappings = {
  UserManagementApi: 'apis/user-management-api',
  AuthenticationApi: 'apis/authentication-api',
  AttributionManagementApi: 'apis/attribution-management-api',
  PhoneManagementApi: 'apis/phone-management-api',
  SIMCardManagementApi: 'apis/simcard-management-api',
  NotificationsApi: 'apis/notifications-api',
  DashboardReportingApi: 'apis/dashboard-reporting-api',
  CalendarEventControllerApi: 'apis/calendar-event-controller-api',
  UserDtoRoleEnum: 'models/user-dto',
  UserDtoStatusEnum: 'models/user-dto',
  AttributionDtoStatusEnum: 'models/attribution-dto'
};

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'api') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('.');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('@/api/generated')) {
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']@\/api\/generated["'];?/g;
    
    const newContent = content.replace(importRegex, (match, p1) => {
      const imports = p1.split(',').map(s => s.trim()).filter(Boolean);
      return imports.map(imp => {
        if (mappings[imp]) {
          return `import { ${imp} } from "@/api/generated/${mappings[imp]}";`;
        }
        return `// WARNING: UNMAPPED IMPORT\nimport { ${imp} } from "@/api/generated";`;
      }).join('\n');
    });
    
    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
      console.log(`Refactored imports in ${file}`);
    }
  }
});
