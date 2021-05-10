function createElement(nodeName, props, ...children) {
    return {
        nodeName,
        props: props || {},
        children
    }
}

export {createElement}
