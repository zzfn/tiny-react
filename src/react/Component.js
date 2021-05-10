import {renderComponent} from "./renderComponent";

class Component {
    constructor( props = {} ) {
        this.state = {};
        this.props = props;
    }
    setState( stateChange ) {
        this.state={...this.state,...stateChange}
        renderComponent( this );
    }
}
export {Component}