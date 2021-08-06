/**
 * React.render方法
 * @param element
 * @param container
 */
function render(element, container) {
    container.innerHTML = ''
    container.appendChild(createDom(element))
}

/**
 * 根据虚拟dom生成真实dom
 * @param element
 */
function createDom(element) {
    if([null,undefined].includes(element)){
        return document.createTextNode('11')
    }
    if (['number', 'string'].includes(typeof element)) {
        return document.createTextNode(element)
    }
    if (typeof element.type === 'function') {
        if (element.type.isReactComponent) {
            const base = new element.type(element.props)
            return renderComponent(base)
        }else {
            return createDom(element.type(element.props))
        }
    }
    if (typeof element.type === 'string') {
        const dom = document.createElement(element.type)
        Object.entries(element.props).forEach(([k, v]) => {
            if (k !== 'children') {
                if (typeof v === 'function') {
                    dom[k.toLowerCase()] = v
                }
            }
        })
        element.props.children.forEach(child => {
            console.log(child)
            dom.appendChild(createDom(child))
        })
        return dom
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