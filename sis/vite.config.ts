import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                icon: 'https://www.google.com/s2/favicons?sz=64&domain=sis001.com',
                namespace: 'private',
                match: ['https://*sis001.com/*', 'https://*sisurl.com/*'],
                connect: ['https://*sis001.com/*', 'https://*sisurl.com/*'],
                updateURL: 'https://atcra.top:50000/web-script/sis.user.js',
                downloadURL: 'https://atcra.top:50000/web-script/sis.user.js'
            },
        }),
    ],
});
