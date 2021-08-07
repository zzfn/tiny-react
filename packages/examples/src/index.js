import React from "@zzf/react"
import ReactDOM from "@zzf/react-dom"

function App() {
    return <div id={'A1'}>
        A1
        <div id={'B1'}>
            B1
        <div id={'C1'}>C1</div>
        <div id={'C2'}>C2</div>
        </div>
        <button onClick={()=>console.log('s')}>hhh</button>
        <div id={'B2'}>B2</div>
    </div>
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
            <button onClick={() => {
                for ( let i = 0; i < 100; i++ ) {
                    this.setState({counter: this.state.counter + 1})
                    console.log(this.state.counter)
                }
            }
            }>+1</button>
            <div>{this.state.counter}</div>
        </div>
    }
}

ReactDOM.render(<Test/>, document.querySelector('#root'))
