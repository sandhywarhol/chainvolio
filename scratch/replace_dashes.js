const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        getFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allFiles = getFiles('.');
let count = 0;

allFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('—')) {
      content = content.replace(/—/g, '-');
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated: ${file}`);
      count++;
    }
  } catch (e) {
    console.error(`Error processing ${file}: ${e.message}`);
  }
});

console.log(`Finished. Total files updated: ${count}`);
