import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';

const pkg = require('./package.json');

export default {
    input: 'src/index.ts',
    output: [
        { file: pkg.module, 'format': 'es' },
        { file: pkg.main, 'format': 'umd', name: 'Auth' }
    ],
    plugins: [
        svelte(),
        typescript(),
        resolve()
    ],
};