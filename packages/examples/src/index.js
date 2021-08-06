import React from "@zzf/react"
import ReactDOM from "@zzf/react-dom"

function App({s='33'}) {
    return <>
        <h2>Hello{s}</h2>
        <hr/>
    </>
}

class Test extends React.Component {
    constructor() {
        super();
        this.state = {
            counter: 10
        }
    }
    componentDidMount() {
        console.log('componentDidMount')
    }
    render() {
        return <div>
            {Array.from({length:1000},(_,index)=>index).map(i=><span>{i}</span>)}
            <App s={this.state.counter}/>
            <button onClick={() => {
                this.setState({counter: this.state.counter + 1})
            }
            }>+1</button>
            <div>{this.state.counter}</div>
        </div>
    }
}

ReactDOM.render(<Test/>, document.querySelector('#root'))
