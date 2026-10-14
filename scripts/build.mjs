import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function buildComponent(srcDirName, manifestPath, outputPath) {
  console.log(`Building ${outputPath} from ${srcDirName}...`);
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const files = JSON.parse(manifestContent);
  
  let concatenated = '';
  for (const file of files) {
    const filePath = path.join(rootDir, 'src', srcDirName, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    concatenated += content;
    if (!content.endsWith('\n')) {
      concatenated += '\n';
    }
  }
  
  fs.writeFileSync(outputPath, concatenated, 'utf-8');
  console.log(`Successfully built ${outputPath}`);
}

try {
  buildComponent('html', path.join(rootDir, 'src', 'html', 'MANIFEST.json'), path.join(rootDir, 'index.html'));
  buildComponent('css', path.join(rootDir, 'src', 'css', 'MANIFEST.json'), path.join(rootDir, 'styles.css'));
  buildComponent('js', path.join(rootDir, 'src', 'js', 'MANIFEST.json'), path.join(rootDir, 'app.js'));
  console.log('Build completed successfully.');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
