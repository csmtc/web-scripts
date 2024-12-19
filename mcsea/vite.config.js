import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        namespace: "https://mcseas.club/",
        description: 'prettify and download novel on mcsea',
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=mcseas.club',
        match: ['https://mcseas.club/*'],
        connect: ['https://mcseas.club/*'],
        updateURL: 'https://raw.githubusercontent.com/csmtc/web-scripts/main/mcsea/dist/mcsea.user.js',
        downloadURL: 'https://raw.githubusercontent.com/csmtc/web-scripts/main/mcsea/dist/mcsea.user.js'
      },
      // server: { mountGmApi: true },
    }),
  ],
});
