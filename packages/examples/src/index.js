import React from "@zzf/react"

function App() {
    return <div>
        <input onChange={event => console.log(event)} value={value}/>
        <h2>Hello {value}</h2>
        <hr/>
    </div>
}

function Children() {
    return <div>2222</div>
}

React.render(<App source={1}><Children/>
    <div>1</div>
</App>, document.querySelector('#root'))
