require('esbuild').build({
    entryPoints: ['lib/react.js'],
    bundle: true,
    outfile: 'react.js',
}).then(r=>{
    console.log(r)
}).catch(() => process.exit(1))
