import React from "@zzf/react"
import ReactDOM from "@zzf/react-dom"

function App({s='33'}) {
    return <div>
        <h2>Hello{s}</h2>
        <hr/>
    </div>
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
