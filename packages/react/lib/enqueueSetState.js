import {render} from "../../react-dom/lib/render";

const queue = [];
const renderQueue = [];

function defer(fn) {
    return Promise.resolve().then(fn);
}

export function enqueueSetState(newState, component) {
    if (queue.length === 0) {
        defer(flush).then();
    }
    queue.push({newState, component});
    if (!renderQueue.some(item => item === component)) {
        renderQueue.push(component)
    }
}

export function flush() {
    let item, component;
    while (item = queue.shift()) {
        const {newState: stateChange, component} = item;

        // 如果没有prevState，则将当前的state作为初始的prevState
        if (!component.prevState) {
            component.prevState = Object.assign({}, component.state);
        }

        // 如果stateChange是一个方法，也就是setState的第二种形式
        if (typeof stateChange === 'function') {
            Object.assign(component.state, stateChange(component.prevState, component.props));
        } else {
            // 如果stateChange是一个对象，则直接合并到setState中
            Object.assign(component.state, stateChange);
        }

        component.prevState = component.state;
    }
    while (component = renderQueue.shift()) {
        render.renderComponent(component)
    }
}

export class Update {
    constructor(payload) {
        this.payload = payload;
    }
}

export class UpdateQueue {
    constructor() {
        this.firstUpdate = null;
        this.lastUpdate = null;
    }

    enqueueUpdate(update) {
        if (this.lastUpdate === null) {
            this.firstUpdate = this.lastUpdate = update
        } else {
            this.lastUpdate.nextUpdate = update
            this.lastUpdate = update
        }
    }

    forceUpdate(update) {
        let currentUpdate = this.firstUpdate;
        while (currentUpdate) {
            let nextState = typeof currentUpdate.payload === 'function' ? currentUpdate.payload(update) : currentUpdate.payload
            update = {...update, ...nextState}
            currentUpdate = currentUpdate.nextUpdate
        }
        this.firstUpdate = this.lastUpdate = null
        return update
    }
}
