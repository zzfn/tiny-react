/**
 * @param {T|string} vnode
 * @param {HTMLElement} container
 */
function render(vnode, container) {
    console.log(vnode)
    if (typeof vnode === 'string') {
        const textNode = document.createTextNode(vnode);
        return container.appendChild(textNode);
    }

    const dom = document.createElement(vnode.nodeName);

    if (vnode.props) {
        Object.keys(vnode.props).forEach(key => {
            const value = vnode.props[key];
            dom.setAttribute(key, value);    // 设置属性
        });
    }
    vnode.children.forEach(child => render(child, dom));    // 递归渲染子节点

    return container.appendChild(dom);    // 将渲染结果挂载到真正的DOM上
}

export {render}
