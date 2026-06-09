import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: "cool18",
                namespace: "https://www.cool18.com/",
                description: 'prettify and download novel on cool18',
                icon: 'https://www.google.com/s2/favicons?sz=64&domain=cool18s.club',
                match: ['https://www.cool18.com/*', "https://wap.cool18.com/*"],
                connect: ['https://www.cool18.com/*', "https://wap.cool18.com/*"],
                // updateURL: 'https://atcra.top:50000/web-script/cool18.user.js',
                // downloadURL: 'https://atcra.top:50000/web-script/cool18.user.js'
                updateURL: 'https://raw.githubusercontent.com/csmtc/web-scripts/main/cool18/dist/cool18.user.js',
                downloadURL: 'https://raw.githubusercontent.com/csmtc/web-scripts/main/cool18/dist/cool18.user.js'
            },
            // server: { mountGmApi: true },
        }),
    ],
});
