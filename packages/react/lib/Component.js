import {render} from "../../react-dom/lib/render";
import {enqueueSetState, Update, UpdateQueue} from "./enqueueSetState";
import {scheduleRoot} from "../../scheduler/lib/scheduleRoot";

class Component {
    static isReactComponent = true

    constructor(props) {
        this.state = {};
        this.props = props;
    }

    setState(newState) {
        let update = new Update(newState)
        this.internalFiber.updateQueue.enqueueUpdate(update)
        // this.state = {...this.state, ...newState}
        // Object.assign(this.state,newState)
        // enqueueSetState(newState, this)
        scheduleRoot()
    }
}

export {Component}
