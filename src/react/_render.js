import {render} from "./render";
import {setComponentProps} from "./setComponentProps";
import {createComponent} from "../createComponent";
import {setAttribute} from "./setAttribute";

function _render( vnode ) {
    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

    if ( typeof vnode === 'number' ) vnode = String( vnode );

    if ( typeof vnode === 'string' ) {
        let textNode = document.createTextNode( vnode );
        return textNode;
    }

    if ( typeof vnode.nodeName === 'function' ) {

        const component = createComponent( vnode.nodeName, vnode.props );

        setComponentProps( component, vnode.props );

        return component.base;
    }

    const dom = document.createElement( vnode.nodeName );

    if ( vnode.props ) {
        Object.keys( vnode.props ).forEach( key => {
            const value = vnode.props[ key ];
            setAttribute( dom, key, value );
        } );
    }

    vnode.children.forEach( child => render( child, dom ) );    // 递归渲染子节点

    return dom;
}
export {_render}