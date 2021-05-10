import {_render} from "./_render";

function render(vNode, container) {
    return container.appendChild(_render( vNode ));    // 将渲染结果挂载到真正的DOM上
}

export {render}
