//import svelte from 'rollup-plugin-svelte';
import nodeResolve  from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import pkg from './package.json';
import svelte from 'rollup-plugin-svelte';

export default {
    input: 'src/index.ts',
    output: [
        { file: pkg.module, 'format': 'es' },
        { file: pkg.main, 'format': 'umd', name: 'Auth' }
    ],
    external: ['svelte/store', 'svelte/internal'],
    plugins: [
        svelte(),
        nodeResolve(),
        typescript(),
        commonjs({ignore: ['crypto']}),
    ]
};