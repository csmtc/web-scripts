import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'convert-chinese-chars': 'convert-chinese-chars/build/convert-chinese-chars.min.js', // 指向正确的文件
    },
  },
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        namespace: "https://mcseas.club/",
        description: 'prettify and download novel on mcsea',
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=mcseas.club',
        match: ['https://mcseas.club/*'],
        connect: ['https://mcseas.club/*'],
        updateURL: 'https://raw.githubusercontent.com/csmtc/web-scripts/main/mcsea/dist/mcseas.user.js',
        downloadURL: 'https://raw.githubusercontent.com/csmtc/web-scripts/main/mcsea/dist/mcseas.user.js'
      },
      // server: { mountGmApi: true },
    }),
  ],
});
