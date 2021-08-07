import {
    DELETION,
    ELEMENT_TEXT,
    PLACEMENT,
    TAG_HOST,
    TAG_ROOT,
    TAG_TEXT,
    UPDATE
} from "../../react-reconciler/lib/constants";
import {setProps} from "./setProps";

let nextUnitOfWork = null;//下一个工作单元
let workInProgressRoot = null;//正在渲染的树
let currentRoot = null;//已渲染正使用的树
let deletions = []//记录删除的节点

export function scheduleRoot(rootFiber) {
    if (currentRoot && currentRoot.alternate) {//第二次及其以后更新
        workInProgressRoot = currentRoot.alternate
        workInProgressRoot.props = rootFiber.props
        workInProgressRoot.alternate = rootFiber
    } else if (currentRoot) {//第一次更新
        rootFiber.alternate = currentRoot
        workInProgressRoot = rootFiber
    } else {//第一次渲染
        workInProgressRoot = rootFiber
    }
    workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = workInProgressRoot.nextEffect = null
    nextUnitOfWork = workInProgressRoot;
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
        if (workInProgressRoot) {
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
    let oldFiber = currentFiber.alternate && currentFiber.alternate.child
    let prevSibling;
    while (newChildIndex < newChildren.length || oldFiber) {
        let tag;
        let newChild = newChildren[newChildIndex]
        let newFiber;
        const sameFiber = oldFiber && newChild && oldFiber.type === newChild.type
        if (newChild && newChild.type === ELEMENT_TEXT) {
            tag = TAG_TEXT;
        } else if (typeof newChild.type === 'string') {
            tag = TAG_HOST
        }
        if (sameFiber) {//可复用
            if (oldFiber.alternate) {//至少已更新一次
                newFiber = oldFiber.alternate
                newFiber.props = newChild.props
                newFiber.alternate = oldFiber
                newFiber.effectTag = UPDATE
                newFiber.nextEffect = null
            } else {
                newFiber = {
                    tag: oldFiber.tag,
                    type: oldFiber.type,
                    props: newChild.props,
                    stateNode: oldFiber.stateNode,
                    return: currentFiber,
                    alternate: oldFiber,
                    effectTag: UPDATE,
                    nextEffect: null
                }
            }
        } else {
            if (newChild) {
                newFiber = {
                    tag,
                    type: newChild.type,
                    props: newChild.props,
                    stateNode: null,
                    return: currentFiber,
                    effectTag: PLACEMENT,
                    nextEffect: null
                }
            }
            if (oldFiber) {
                oldFiber.effectTag = DELETION
                deletions.push(oldFiber)
            }
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
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
    deletions.forEach(commitWork)
    let currentFiber = workInProgressRoot.firstEffect
    while (currentFiber) {
        commitWork(currentFiber);
        currentFiber = currentFiber.nextEffect
    }
    deletions.length = 0
    currentRoot = workInProgressRoot
    workInProgressRoot = null;
}

function commitWork(currentFiber) {
    if (currentFiber) {
        let returnFiber = currentFiber.return
        let domReturn = returnFiber.stateNode
        if (currentFiber.effectTag === PLACEMENT) {
            console.log(currentFiber.stateNode)
            domReturn.appendChild(currentFiber.stateNode)
        } else if (currentFiber.effectTag === DELETION) {
            domReturn.removeChild(currentFiber.stateNode)
        } else if (currentFiber.effectTag === UPDATE) {
            domReturn.replaceChild(currentFiber.stateNode,)
            if (currentFiber.type === ELEMENT_TEXT) {
                currentFiber.stateNode.textContent = currentFiber.props.text
            } else {
                //设置dom属性
                updateDom(currentFiber.stateNode, currentFiber.alternate.props, currentFiber.props)
            }
        }
        currentFiber.effectTag = null
    }
}
