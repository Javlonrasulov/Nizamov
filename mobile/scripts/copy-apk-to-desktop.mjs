import fs from 'node:fs';
import path from 'node:path';

const variant = (process.argv[2] || 'prod').toLowerCase();
const allowedVariants = new Set(['prod', 'dev']);

if (!allowedVariants.has(variant)) {
  console.error(`Noto'g'ri variant: ${variant}. Variant 'prod' yoki 'dev' bo'lishi kerak.`);
  process.exit(1);
}

const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version || 'unknown';
const desktopDir = path.join(process.env.USERPROFILE || process.env.HOME || rootDir, 'Desktop');

const apkRelativePath = variant === 'dev'
  ? path.join('android', 'app', 'build', 'outputs', 'apk', 'dev', 'debug', 'app-dev-debug.apk')
  : path.join('android', 'app', 'build', 'outputs', 'apk', 'prod', 'debug', 'app-prod-debug.apk');

const apkSource = path.join(rootDir, apkRelativePath);

if (!fs.existsSync(apkSource)) {
  console.error(`APK topilmadi: ${apkSource}`);
  console.error(`Avval npm run apk:${variant} buyrug'ini ishga tushiring.`);
  process.exit(1);
}

const now = new Date();
const pad = (value) => String(value).padStart(2, '0');
const timestamp = [
  now.getFullYear(),
  pad(now.getMonth() + 1),
  pad(now.getDate()),
].join('-') + '_' + [
  pad(now.getHours()),
  pad(now.getMinutes()),
  pad(now.getSeconds()),
].join('-');

const variantLabel = variant === 'dev' ? 'DEV' : 'PROD';
const destination = path.join(
  desktopDir,
  `Sainur-CRM-${variantLabel}-${version}-${timestamp}.apk`,
);

fs.copyFileSync(apkSource, destination);
console.log(`APK Desktop ga nusxalandi: ${destination}`);
