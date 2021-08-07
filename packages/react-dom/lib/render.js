/**
 * React.render方法
 * @param element
 * @param container
 */
import {TAG_ROOT} from "../../react-reconciler/lib/constants";
import {scheduleRoot} from "../../scheduler/lib/scheduleRoot";

function render(element, container) {
    console.log(element)
    let rootFiber = {
        tag: TAG_ROOT,
        stateNode: container,
        props:{children:[element]}
    }
    scheduleRoot(rootFiber)
    // container.innerHTML = ''
    // container.appendChild(createDom(element))
}

/**
 * 根据虚拟dom生成真实dom
 * @param element
 */
function createDom(element) {
    if ([null, undefined].includes(element)) {
        return
    }
    if (['number', 'string'].includes(typeof element)) {
        return document.createTextNode(element)
    }
    if (element.type === undefined) {
        const fragment = document.createDocumentFragment();
        if (!Array.isArray(element)) {
            element.props.children.forEach(i => {
                fragment.appendChild(createDom(i))
            })
            return fragment
        }
    }
    if (typeof element.type === 'function') {
        if (element.type.isReactComponent) {
            const base = new element.type(element.props)
            return renderComponent(base)
        } else {
            return createDom(element.type(element.props))
        }
    }
    if (typeof element.type === 'string') {
        const dom = document.createElement(element.type)
        Object.entries(element.props).forEach(([k, v]) => {
            if (k !== 'children') {
                if (typeof v === 'function') {
                    //todo setAttribute
                    dom[k.toLowerCase()] = v
                }
                dom[k.toLowerCase()] = v
            }
        })
        element.props.children.forEach(child => {
            dom.appendChild(createDom(child))
        })
        return dom
    }
    if (Array.isArray(element)) {
        const fragment = document.createDocumentFragment();
        element.forEach(i => {
            fragment.appendChild(createDom(i))
        })
        return fragment
    }
}

function renderComponent(component) {
    //真实dom
    let base;
    const vNode = component.render();
    base = createDom(vNode);
    if (component.base && component.base.parentNode) {
        component.base.parentNode.replaceChild(base, component.base);
    }
    component.base = base;
    return base
}

render.renderComponent = renderComponent
export {render}
