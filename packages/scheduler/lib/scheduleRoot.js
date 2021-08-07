import {
    DELETION,
    ELEMENT_TEXT,
    PLACEMENT, TAG_CLASS, TAG_FUNCTION,
    TAG_HOST,
    TAG_ROOT,
    TAG_TEXT,
    UPDATE
} from "../../react-reconciler/lib/constants";
import {setProps} from "./setProps";
import {Update, UpdateQueue} from "../../react/lib/enqueueSetState";

let nextUnitOfWork = null;//下一个工作单元
let workInProgressRoot = null;//正在渲染的树
let currentRoot = null;//已渲染正使用的树
let deletions = []//记录删除的节点
let workInProgressFiber = null;//工作中的fiber
let homeIndex = 0//hooks索引

export function scheduleRoot(rootFiber) {
    if (currentRoot && currentRoot.alternate) {//第二次及其以后更新
        workInProgressRoot = currentRoot.alternate
        workInProgressRoot.alternate = currentRoot
        if (rootFiber) {
            workInProgressRoot.props = rootFiber.props
        }
    } else if (currentRoot) {//第一次更新
        if (rootFiber) {
            rootFiber.alternate = currentRoot
            workInProgressRoot = rootFiber
        } else {
            workInProgressRoot = {
                ...currentRoot,
                alternate: currentRoot
            }
        }
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
    } else if (currentFiber.tag === TAG_CLASS) {
        updateClassComponent(currentFiber)
    } else if (currentFiber.tag === TAG_FUNCTION) {
        updateFunction(currentFiber)
    }
}

function updateFunction(currentFiber) {
    workInProgressFiber = currentFiber
    homeIndex = 0
    workInProgressFiber.hooks = []
    const newChildren = [currentFiber.type(currentFiber.props)]
    reconcileChildren(currentFiber, newChildren)
}

function updateClassComponent(currentFiber) {
    if (!currentFiber.stateNode) {
        currentFiber.stateNode = new currentFiber.type(currentFiber.props)
        currentFiber.stateNode.internalFiber = currentFiber
        currentFiber.updateQueue = new UpdateQueue()
    }
    currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(currentFiber.stateNode.state)
    let newElement = currentFiber.stateNode.render()
    const newChildren = [newElement]
    reconcileChildren(currentFiber, newChildren)
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
    if (stateNode instanceof HTMLElement) {
        setProps(stateNode, oldProps, newProps)
    }
}

function reconcileChildren(currentFiber, newChildren) {
    let newChildIndex = 0;
    let oldFiber = currentFiber.alternate && currentFiber.alternate.child
    if (oldFiber) {
        oldFiber.firstEffect = oldFiber.lastEffect = oldFiber.nextEffect = null
    }
    let prevSibling;
    while (newChildIndex < newChildren.length || oldFiber) {
        let tag;
        let newChild = newChildren[newChildIndex]
        let newFiber;
        const sameFiber = oldFiber && newChild && oldFiber.type === newChild.type
        if (newChild && typeof newChild.type === 'function' && newChild.type.isReactComponent) {
            tag = TAG_CLASS
        } else if (newChild && typeof newChild.type === 'function') {
            tag = TAG_FUNCTION
        } else if (newChild && newChild.type === ELEMENT_TEXT) {
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
                newFiber.updateQueue = oldFiber.updateQueue || new UpdateQueue()
                newFiber.nextEffect = null
            } else {
                newFiber = {
                    tag: oldFiber.tag,
                    type: oldFiber.type,
                    props: newChild.props,
                    stateNode: oldFiber.stateNode,
                    return: currentFiber,
                    updateQueue: oldFiber.updateQueue || new UpdateQueue(),
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
                    updateQueue: new UpdateQueue(),
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
    deletions.forEach(commitWork)//执行删除
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
        while (returnFiber.tag !== TAG_HOST && returnFiber.tag !== TAG_ROOT && returnFiber.tag !== TAG_TEXT) {
            returnFiber = returnFiber.return
        }
        let domReturn = returnFiber.stateNode
        if (currentFiber.effectTag === PLACEMENT) {
            let nextFiber = currentFiber;
            if (nextFiber.tag === TAG_CLASS) {
                return
            }
            while (nextFiber.tag !== TAG_HOST && nextFiber.tag !== TAG_TEXT) {
                nextFiber = currentFiber.child
            }
            domReturn.appendChild(nextFiber.stateNode)
        } else if (currentFiber.effectTag === DELETION) {
            return commitDeletion(currentFiber, domReturn)
            // domReturn.removeChild(currentFiber.stateNode)
        } else if (currentFiber.effectTag === UPDATE) {
            // domReturn.replaceChild(currentFiber.stateNode,)
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

function commitDeletion(currentFiber, domReturn) {
    if (currentFiber.tag === TAG_HOST || currentFiber.tag === TAG_TEXT) {
        domReturn.removeChild(currentFiber.stateNode)
    } else {
        commitDeletion(currentFiber, domReturn)
    }
}

export function useReducer(reducer, initialState) {
    let newHook = workInProgressFiber.alternate && workInProgressFiber.alternate.hooks && workInProgressFiber.alternate.hooks[homeIndex]
    if (newHook) {
        newHook.state=newHook.updateQueue.forceUpdate(newHook.state)
    } else {
        newHook = {
            state: initialState,
            updateQueue: new UpdateQueue()
        }
    }
    const dispatch = action => {
        const payload = reducer?reducer(newHook.state, action):action
        newHook.updateQueue.enqueueUpdate(new Update(payload))
        scheduleRoot()
    }
    workInProgressFiber.hooks[homeIndex++] = newHook
    return [newHook.state, dispatch]
}

export function useState(initialState) {
    return useReducer(null, initialState)
}
