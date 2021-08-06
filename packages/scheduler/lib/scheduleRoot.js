import {ELEMENT_TEXT, PLACEMENT, TAG_HOST, TAG_ROOT, TAG_TEXT} from "../../react-reconciler/lib/constants";
import {setProps} from "./setProps";

let nextUnitOfWork = null;
let workInProgressRoot = null;

export function scheduleRoot(rootFiber) {
    nextUnitOfWork = rootFiber;
    workInProgressRoot = rootFiber;
}

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = perFormUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }
    if (nextUnitOfWork) {
        // window.requestIdleCallback(workLoop, {timeout: 500})
    } else {
        console.log('所有执行完毕，render完成')
        if(workInProgressRoot){
            commitRoot()
        }
    }
    window.requestIdleCallback(workLoop, {timeout: 500})
}

function perFormUnitOfWork(currentFiber) {
    beginWork(currentFiber)
    if (currentFiber.child) {
        return currentFiber.child
    }
    while (currentFiber) {
        completeUnitOfWork(currentFiber)
        if (currentFiber.sibling) {
            return currentFiber.sibling
        }
        currentFiber = currentFiber.return
    }
}

function beginWork(currentFiber) {
    if (currentFiber.tag === TAG_ROOT) {
        updateHostRoot(currentFiber)
    } else if (currentFiber.tag === TAG_TEXT) {
        updateHostText(currentFiber)
    } else if (currentFiber.tag === TAG_HOST) {
        updateHost(currentFiber)
    }
}

function updateHostRoot(currentFiber) {
    const newChildren = currentFiber.props.children
    reconcileChildren(currentFiber, newChildren)
}

function updateHostText(currentFiber) {
    if (!currentFiber.stateNode) {
        currentFiber.stateNode = createDom(currentFiber)
    }
}

function updateHost(currentFiber) {
    if (!currentFiber.stateNode) {
        currentFiber.stateNode = createDom(currentFiber)
    }
    const newChildren = currentFiber.props.children;
    reconcileChildren(currentFiber, newChildren)
}

function createDom(currentFiber) {
    if (currentFiber.tag === TAG_TEXT) {
        return document.createTextNode(currentFiber.props.text)
    } else if (currentFiber.tag === TAG_HOST) {
        let stateNode = document.createElement(currentFiber.type)
        updateDom(stateNode, {}, currentFiber.props)
        return stateNode
    }
}

function updateDom(stateNode, oldProps, newProps) {
    setProps(stateNode, oldProps, newProps)
}

function reconcileChildren(currentFiber, newChildren) {
    let newChildIndex = 0;
    let prevSibling;
    while (newChildIndex < newChildren.length) {
        let tag;
        let newChild = newChildren[newChildIndex]
        if (newChild.type === ELEMENT_TEXT) {
            tag = TAG_TEXT;
        } else if (typeof newChild.type === 'string') {
            tag = TAG_HOST
        }
        let newFiber = {
            tag,
            type: newChild.type,
            props: newChild.props,
            stateNode: null,
            return: currentFiber,
            effectTag: PLACEMENT,
            nextEffect: null
        }
        if (newFiber) {
            if (newChildIndex === 0) {
                currentFiber.child = newFiber
            } else {
                prevSibling.sibling = newFiber
            }
            prevSibling = newFiber
        }
        newChildIndex++
    }
}

function completeUnitOfWork(currentFiber) {
    let returnFiber = currentFiber.return
    if (returnFiber) {
        if (!returnFiber.firstEffect) {
            returnFiber.firstEffect = currentFiber.firstEffect
        }
        if (currentFiber.lastEffect) {
            if (returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect = currentFiber.firstEffect
            }
            returnFiber.lastEffect = currentFiber.lastEffect
        }
        const effectTag = currentFiber.effectTag;
        if (effectTag) {
            if (returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect = currentFiber
            } else {
                returnFiber.firstEffect = currentFiber
            }
            returnFiber.lastEffect = currentFiber
        }
    }
}

window.requestIdleCallback(workLoop, {timeout: 500})

function commitRoot() {
    let currentFiber = workInProgressRoot.firstEffect
    while (currentFiber) {
        commitWork(currentFiber);
        currentFiber = currentFiber.nextEffect
    }
    workInProgressRoot = null;
}

function commitWork(currentFiber) {
    if (currentFiber) {
        let returnFiber = currentFiber.return
        let returnDom = returnFiber.stateNode
        if (currentFiber.effectTag === PLACEMENT) {
            console.log(currentFiber.stateNode)
            returnDom.appendChild(currentFiber.stateNode)
        }
        currentFiber.effectTag = null
    }
}
