import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let hasErrors = false;

function checkComponent(srcDirName, manifestPath, outputPath) {
  console.log(`Checking ${srcDirName}...`);
  
  if (!fs.existsSync(manifestPath)) {
    console.error(`Error: Manifest not found at ${manifestPath}`);
    hasErrors = true;
    return;
  }
  
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  let files;
  try {
    files = JSON.parse(manifestContent);
  } catch (err) {
    console.error(`Error: Failed to parse manifest ${manifestPath}:`, err.message);
    hasErrors = true;
    return;
  }
  
  const srcDir = path.join(rootDir, 'src', srcDirName);
  if (!fs.existsSync(srcDir)) {
    console.error(`Error: Source directory not found: ${srcDir}`);
    hasErrors = true;
    return;
  }
  
  // 1. Check that all listed files exist
  const manifestFilesSet = new Set(files);
  for (const file of files) {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File listed in manifest does not exist: ${filePath}`);
      hasErrors = true;
    }
  }
  
  // 2. Check for unlisted files in the directory
  const allFilesInDir = fs.readdirSync(srcDir);
  for (const file of allFilesInDir) {
    if (file === 'MANIFEST.json') continue;
    if (fs.statSync(path.join(srcDir, file)).isDirectory()) continue;
    
    if (!manifestFilesSet.has(file)) {
      console.error(`Error: File in ${srcDirName} is not listed in manifest: ${file}`);
      hasErrors = true;
    }
  }
  
  // 3. Verify output matches built content
  if (!fs.existsSync(outputPath)) {
    console.error(`Error: Built output file not found: ${outputPath}`);
    hasErrors = true;
  } else {
    let concatenated = '';
    for (const file of files) {
      const filePath = path.join(srcDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        concatenated += content;
        if (!content.endsWith('\n')) {
          concatenated += '\n';
        }
      }
    }
    const actualContent = fs.readFileSync(outputPath, 'utf-8');
    if (actualContent !== concatenated) {
      console.error(`Error: Built file ${outputPath} is out of sync with source files. Run 'npm run build' to update.`);
      hasErrors = true;
    }
  }
}

try {
  checkComponent('html', path.join(rootDir, 'src', 'html', 'MANIFEST.json'), path.join(rootDir, 'index.html'));
  checkComponent('css', path.join(rootDir, 'src', 'css', 'MANIFEST.json'), path.join(rootDir, 'styles.css'));
  checkComponent('js', path.join(rootDir, 'src', 'js', 'MANIFEST.json'), path.join(rootDir, 'app.js'));
  
  if (hasErrors) {
    console.error('Check failed with errors.');
    process.exit(1);
  } else {
    console.log('All checks passed successfully.');
  }
} catch (error) {
  console.error('Check script failed:', error);
  process.exit(1);
}
