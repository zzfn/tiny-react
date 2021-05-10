import babel from 'rollup-plugin-babel'
import serve from "rollup-plugin-serve";
import { terser } from "rollup-plugin-terser";
export default {
    input:"./src/index.js",
    output:{
        file:'dist/react.js',
        name:"React",
        format:process.env.ENV==='development'?'umd':"cjs",
        sourcemap:process.env.ENV==='development'
    },
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
