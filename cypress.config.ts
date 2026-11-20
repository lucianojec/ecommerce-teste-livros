import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://ecommerce-teste-livros.vercel.app',
    viewportWidth: 1280,
    viewportHeight: 800,
  },
});