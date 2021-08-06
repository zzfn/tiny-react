import {ELEMENT_TEXT} from "../../react-reconciler/lib/constants";

function createElement(type, config, ...children) {
    return {
        type,
        props: {
            ...config, children:children.map(child => {
                return typeof child==='object'?child:{type:ELEMENT_TEXT,props:{text:child,children:[]}}
            })
        }
    }
}

export {createElement}
