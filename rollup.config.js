import babel from 'rollup-plugin-babel'
import serve from "rollup-plugin-serve";
import { terser } from "rollup-plugin-terser";
export default {
    input:"./src/index.js",
    output:[
        {
            file:'dist/react.umd.js',
            name:'React',
            exports: 'default',
            format:'umd',
            sourcemap:process.env.ENV==='development'
        },
        {
            file:'dist/react.cjs.js',
            exports: 'default',
            format:'cjs',
            sourcemap:process.env.ENV==='development'
        },
        {
            file:'dist/react.esm.js',
            exports: 'default',
            format:'esm',
            sourcemap:process.env.ENV==='development'
        }
    ],
    plugin:[
        terser({
            module:true
        }),
        babel({
            exclude:"node_modules/**"
        }),
        process.env.ENV==='development'?serve({
            open:true,
            openPage:'examples/index.html',
            port:3000,
            contentBase:['dist','examples']
        }):null
    ]
}
