import {render} from "../../react-dom/lib/render";
import {enqueueSetState} from "./enqueueSetState";

class Component {
    static isReactComponent=true
    constructor(props ) {
        this.state = {};
        this.props = props;
    }

    setState(newState) {
        // this.state = {...this.state, ...newState}
        // Object.assign(this.state,newState)
        enqueueSetState(newState,this)
    }
}

export {Component}