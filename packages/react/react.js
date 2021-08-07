var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// ../react-reconciler/lib/constants.js
var ELEMENT_TEXT = Symbol.for("ELEMENT_TEXT");
var TAG_ROOT = Symbol.for("TAG_ROOT");
var TAG_HOST = Symbol.for("TAG_HOST");
var TAG_CLASS = Symbol.for("TAG_CLASS");
var TAG_FUNCTION = Symbol.for("TAG_FUNCTION");
var TAG_TEXT = Symbol.for("TAG_TEXT");
var PLACEMENT = Symbol.for("PLACEMENT");
var UPDATE = Symbol.for("UPDATE");
var DELETION = Symbol.for("DELETION");

// lib/createElement.js
function createElement(type, config, ...children) {
  return {
    type,
    props: {
      ...config,
      children: children.map((child) => {
        return typeof child === "object" ? child : { type: ELEMENT_TEXT, props: { text: child, children: [] } };
      })
    }
  };
}

// ../scheduler/lib/setProps.js
function setProps(dom, oldProps, newProps) {
  for (const key in oldProps) {
    if (key !== "children") {
      if (newProps.hasOwnProperty(key)) {
        setProp(dom, key, newProps[key]);
      } else {
        dom.removeAttribute(key);
      }
    }
  }
  for (const key in newProps) {
    if (key !== "children") {
      if (oldProps.hasOwnProperty(key)) {
      } else {
        setProp(dom, key, newProps[key]);
      }
      setProp(dom, key, newProps[key]);
    }
  }
}
function setProp(dom, key, value) {
  if (/^on/.test(key)) {
    dom[key.toLowerCase()] = value;
  } else if (key === "style") {
    if (value) {
      for (let styleName in value) {
        dom.style[styleName] = value[styleName];
      }
    } else {
    }
  } else {
    dom.setAttribute(key, value);
  }
}

// lib/enqueueSetState.js
var Update = class {
  constructor(payload) {
    this.payload = payload;
  }
};
var UpdateQueue = class {
  constructor() {
    this.firstUpdate = null;
    this.lastUpdate = null;
  }
  enqueueUpdate(update) {
    if (this.lastUpdate === null) {
      this.firstUpdate = this.lastUpdate = update;
    } else {
      this.lastUpdate.nextUpdate = update;
      this.lastUpdate = update;
    }
  }
  forceUpdate(update) {
    let currentUpdate = this.firstUpdate;
    while (currentUpdate) {
      let nextState = typeof currentUpdate.payload === "function" ? currentUpdate.payload(update) : currentUpdate.payload;
      update = { ...update, ...nextState };
      currentUpdate = currentUpdate.nextUpdate;
    }
    this.firstUpdate = this.lastUpdate = null;
    return update;
  }
};

// ../scheduler/lib/scheduleRoot.js
var nextUnitOfWork = null;
var workInProgressRoot = null;
var currentRoot = null;
var deletions = [];
var workInProgressFiber = null;
var homeIndex = 0;
function scheduleRoot(rootFiber) {
  if (currentRoot && currentRoot.alternate) {
    workInProgressRoot = currentRoot.alternate;
    workInProgressRoot.alternate = currentRoot;
    if (rootFiber) {
      workInProgressRoot.props = rootFiber.props;
    }
  } else if (currentRoot) {
    if (rootFiber) {
      rootFiber.alternate = currentRoot;
      workInProgressRoot = rootFiber;
    } else {
      workInProgressRoot = {
        ...currentRoot,
        alternate: currentRoot
      };
    }
  } else {
    workInProgressRoot = rootFiber;
  }
  workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = workInProgressRoot.nextEffect = null;
  nextUnitOfWork = workInProgressRoot;
}
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = perFormUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (nextUnitOfWork) {
  } else {
    if (workInProgressRoot) {
      commitRoot();
    }
  }
  window.requestIdleCallback(workLoop, { timeout: 500 });
}
function perFormUnitOfWork(currentFiber) {
  beginWork(currentFiber);
  if (currentFiber.child) {
    return currentFiber.child;
  }
  while (currentFiber) {
    completeUnitOfWork(currentFiber);
    if (currentFiber.sibling) {
      return currentFiber.sibling;
    }
    currentFiber = currentFiber.return;
  }
}
function beginWork(currentFiber) {
  if (currentFiber.tag === TAG_ROOT) {
    updateHostRoot(currentFiber);
  } else if (currentFiber.tag === TAG_TEXT) {
    updateHostText(currentFiber);
  } else if (currentFiber.tag === TAG_HOST) {
    updateHost(currentFiber);
  } else if (currentFiber.tag === TAG_CLASS) {
    updateClassComponent(currentFiber);
  } else if (currentFiber.tag === TAG_FUNCTION) {
    updateFunction(currentFiber);
  }
}
function updateFunction(currentFiber) {
  workInProgressFiber = currentFiber;
  homeIndex = 0;
  workInProgressFiber.hooks = [];
  const newChildren = [currentFiber.type(currentFiber.props)];
  reconcileChildren(currentFiber, newChildren);
}
function updateClassComponent(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = new currentFiber.type(currentFiber.props);
    currentFiber.stateNode.internalFiber = currentFiber;
    currentFiber.updateQueue = new UpdateQueue();
  }
  currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(currentFiber.stateNode.state);
  let newElement = currentFiber.stateNode.render();
  const newChildren = [newElement];
  reconcileChildren(currentFiber, newChildren);
}
function updateHostRoot(currentFiber) {
  const newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren);
}
function updateHostText(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDom(currentFiber);
  }
}
function updateHost(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDom(currentFiber);
  }
  const newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren);
}
function createDom(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text);
  } else if (currentFiber.tag === TAG_HOST) {
    let stateNode = document.createElement(currentFiber.type);
    updateDom(stateNode, {}, currentFiber.props);
    return stateNode;
  }
}
function updateDom(stateNode, oldProps, newProps) {
  if (stateNode instanceof HTMLElement) {
    setProps(stateNode, oldProps, newProps);
  }
}
function reconcileChildren(currentFiber, newChildren) {
  let newChildIndex = 0;
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
  if (oldFiber) {
    oldFiber.firstEffect = oldFiber.lastEffect = oldFiber.nextEffect = null;
  }
  let prevSibling;
  while (newChildIndex < newChildren.length || oldFiber) {
    let tag;
    let newChild = newChildren[newChildIndex];
    let newFiber;
    const sameFiber = oldFiber && newChild && oldFiber.type === newChild.type;
    if (newChild && typeof newChild.type === "function" && newChild.type.isReactComponent) {
      tag = TAG_CLASS;
    } else if (newChild && typeof newChild.type === "function") {
      tag = TAG_FUNCTION;
    } else if (newChild && newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT;
    } else if (typeof newChild.type === "string") {
      tag = TAG_HOST;
    }
    if (sameFiber) {
      if (oldFiber.alternate) {
        newFiber = oldFiber.alternate;
        newFiber.props = newChild.props;
        newFiber.alternate = oldFiber;
        newFiber.effectTag = UPDATE;
        newFiber.updateQueue = oldFiber.updateQueue || new UpdateQueue();
        newFiber.nextEffect = null;
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
        };
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
        };
      }
      if (oldFiber) {
        oldFiber.effectTag = DELETION;
        deletions.push(oldFiber);
      }
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (newFiber) {
      if (newChildIndex === 0) {
        currentFiber.child = newFiber;
      } else {
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber;
    }
    newChildIndex++;
  }
}
function completeUnitOfWork(currentFiber) {
  let returnFiber = currentFiber.return;
  if (returnFiber) {
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect;
    }
    if (currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
      }
      returnFiber.lastEffect = currentFiber.lastEffect;
    }
    const effectTag = currentFiber.effectTag;
    if (effectTag) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber;
      } else {
        returnFiber.firstEffect = currentFiber;
      }
      returnFiber.lastEffect = currentFiber;
    }
  }
}
window.requestIdleCallback(workLoop, { timeout: 500 });
function commitRoot() {
  deletions.forEach(commitWork);
  let currentFiber = workInProgressRoot.firstEffect;
  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }
  deletions.length = 0;
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
}
function commitWork(currentFiber) {
  if (currentFiber) {
    let returnFiber = currentFiber.return;
    while (returnFiber.tag !== TAG_HOST && returnFiber.tag !== TAG_ROOT && returnFiber.tag !== TAG_TEXT) {
      returnFiber = returnFiber.return;
    }
    let domReturn = returnFiber.stateNode;
    if (currentFiber.effectTag === PLACEMENT) {
      let nextFiber = currentFiber;
      if (nextFiber.tag === TAG_CLASS) {
        return;
      }
      while (nextFiber.tag !== TAG_HOST && nextFiber.tag !== TAG_TEXT) {
        nextFiber = currentFiber.child;
      }
      domReturn.appendChild(nextFiber.stateNode);
    } else if (currentFiber.effectTag === DELETION) {
      return commitDeletion(currentFiber, domReturn);
    } else if (currentFiber.effectTag === UPDATE) {
      if (currentFiber.type === ELEMENT_TEXT) {
        currentFiber.stateNode.textContent = currentFiber.props.text;
      } else {
        updateDom(currentFiber.stateNode, currentFiber.alternate.props, currentFiber.props);
      }
    }
    currentFiber.effectTag = null;
  }
}
function commitDeletion(currentFiber, domReturn) {
  if (currentFiber.tag === TAG_HOST || currentFiber.tag === TAG_TEXT) {
    domReturn.removeChild(currentFiber.stateNode);
  } else {
    commitDeletion(currentFiber, domReturn);
  }
}

// ../react-dom/lib/render.js
function render(element, container) {
  let rootFiber = {
    tag: TAG_ROOT,
    stateNode: container,
    props: { children: [element] }
  };
  scheduleRoot(rootFiber);
}
function createDom2(element) {
  if ([null, void 0].includes(element)) {
    return;
  }
  if (["number", "string"].includes(typeof element)) {
    return document.createTextNode(element);
  }
  if (element.type === void 0) {
    const fragment = document.createDocumentFragment();
    if (!Array.isArray(element)) {
      element.props.children.forEach((i) => {
        fragment.appendChild(createDom2(i));
      });
      return fragment;
    }
  }
  if (typeof element.type === "function") {
    if (element.type.isReactComponent) {
      const base = new element.type(element.props);
      return renderComponent(base);
    } else {
      return createDom2(element.type(element.props));
    }
  }
  if (typeof element.type === "string") {
    const dom = document.createElement(element.type);
    Object.entries(element.props).forEach(([k, v]) => {
      if (k !== "children") {
        if (typeof v === "function") {
          dom[k.toLowerCase()] = v;
        }
        dom[k.toLowerCase()] = v;
      }
    });
    element.props.children.forEach((child) => {
      dom.appendChild(createDom2(child));
    });
    return dom;
  }
  if (Array.isArray(element)) {
    const fragment = document.createDocumentFragment();
    element.forEach((i) => {
      fragment.appendChild(createDom2(i));
    });
    return fragment;
  }
}
function renderComponent(component) {
  let base;
  const vNode = component.render();
  base = createDom2(vNode);
  if (component.base && component.base.parentNode) {
    component.base.parentNode.replaceChild(base, component.base);
  }
  component.base = base;
  return base;
}
render.renderComponent = renderComponent;

// lib/Component.js
var Component = class {
  constructor(props) {
    this.state = {};
    this.props = props;
  }
  setState(newState) {
    let update = new Update(newState);
    this.internalFiber.updateQueue.enqueueUpdate(update);
    scheduleRoot();
  }
};
__publicField(Component, "isReactComponent", true);

// lib/react.js
var react_default = {
  createElement,
  Component,
  reducer: void 0
};
export {
  react_default as default
};
