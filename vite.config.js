import {defineConfig} from 'vite';

// Keep local previews portable; CI explicitly selects the verified repository path.
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Trilha-seletiva/' : './',
});
