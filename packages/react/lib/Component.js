import {render} from "../../react-dom/lib/render";

class Component {
    static isReactComponent=true
    constructor(props ) {
        this.state = {};
        this.props = props;
    }

    setState(newState) {
        this.state = {...this.state, ...newState}
        render.renderComponent(this)
    }
}

export {Component}