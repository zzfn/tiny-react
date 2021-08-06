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
            counter: 10,
            value: '你好',
        }
    }
    componentDidMount() {
        console.log('componentDidMount')
    }
    render() {
        return <div>
            {Array.from({length:1000},(_,index)=>index).map(i=><span>{i}</span>)}
            <App s={this.state.counter}/>
            <input onInput={e=>this.setState({value:e.target.value})} type="text" value={22}/>
            {this.state.value}
            <button onClick={() => {
                for ( let i = 0; i < 100; i++ ) {
                    this.setState({counter: this.state.counter + 1})
                    console.log(this.state.counter)
                    // this.setState(state => ({counter: state.counter + 1}))
                }
            }
            }>+1</button>
            <div>{this.state.counter}</div>
        </div>
    }
}

ReactDOM.render(<Test/>, document.querySelector('#root'))
