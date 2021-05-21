function sleep(delay) {
    let current=Date.now()
    while (Date.now()-current<delay){}
    // for(;Date.now()-current<delay;){}
}
const walklist=[
    ()=>{
        console.log('1-start');
        sleep(20);
        console.log('1-end')
    },
    ()=>{
        console.log('2-start');
        sleep(30);
        console.log('2-end')
    },
    ()=>{
        console.log('3-start');
        sleep(30);
        console.log('3-end')
    }
]
function walk(deadline) {
    console.log(`剩余${deadline}`)
    console.log(deadline.didTimeout)
    while (deadline.timeRemaining()){
    }
    if(walklist.length){
        requestAnimationFrame(walk)
    }
}
function getTask(){
    walklist.shift()()
}
requestAnimationFrame(walk)
