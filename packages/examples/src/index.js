import React from "@zzf/react"
import ReactDOM from "@zzf/react-dom"
import {useReducer, useState} from "../../scheduler/lib/scheduleRoot";

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
                    // this.setState({counter: this.state.counter + 1})
                    console.log(this.state.counter)
                    this.setState(state => ({counter: state.counter + 1}))
                }
            }
            }>+1
            </button>
            <div>{this.state.counter}</div>
        </div>
    }
}

function reducer(state, action) {
    switch (action.type) {
        case 'ADD':
            return {counter: state.counter + 1}
        default:
            return state
    }
}
function App() {
    const [numState, dispatch] = useState({num:1})
    // const [numState1, dispatch1] = useState(100)
    return <div id={'A1'}>
        {numState.num}
        <button onClick={() => dispatch({num:numState.num+1})}>hhh</button>
        {/*{numState1}*/}
        {/*<button onClick={() => dispatch1(numState1+1)}>hhh</button>*/}
    </div>
}

ReactDOM.render(<App/>, document.querySelector('#root'))
