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
var TAG_TEXT = Symbol.for("TAG_TEXT");
var PLACEMENT = Symbol.for("PLACEMENT");
var UPDATE = Symbol.for("UPDATE");
var DELETION = Symbol.for("DELETION");

// lib/createElement.js
function createElement(type, config, ...children) {
  console.log(2);
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
  }
  for (const key in newProps) {
    if (key !== "children") {
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

// ../scheduler/lib/scheduleRoot.js
var nextUnitOfWork = null;
var workInProgressRoot = null;
var currentRoot = null;
var deletions = [];
function scheduleRoot(rootFiber) {
  if (currentRoot) {
    rootFiber.alternate = currentRoot;
  }
  nextUnitOfWork = rootFiber;
  workInProgressRoot = rootFiber;
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
  }
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
  setProps(stateNode, oldProps, newProps);
}
function reconcileChildren(currentFiber, newChildren) {
  let newChildIndex = 0;
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
  let prevSibling;
  while (newChildIndex < newChildren.length) {
    let tag;
    let newChild = newChildren[newChildIndex];
    if (newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT;
    } else if (typeof newChild.type === "string") {
      tag = TAG_HOST;
    }
    let newFiber = {
      tag,
      type: newChild.type,
      props: newChild.props,
      stateNode: null,
      return: currentFiber,
      effectTag: PLACEMENT,
      nextEffect: null
    };
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
    let domReturn = returnFiber.stateNode;
    if (currentFiber.effectTag === PLACEMENT) {
      console.log(currentFiber.stateNode);
      domReturn.appendChild(currentFiber.stateNode);
    } else if (currentFiber.effectTag === DELETION) {
      domReturn.removeChild(currentFiber.stateNode);
    } else if (currentFiber.effectTag === UPDATE) {
      domReturn.replaceChild(currentFiber.stateNode);
      if (currentFiber.type === ELEMENT_TEXT) {
        currentFiber.stateNode.textContent = currentFiber.props.text;
      } else {
        updateDom(currentFiber.stateNode, currentFiber.alternate.props, currentFiber.props);
      }
    }
    currentFiber.effectTag = null;
  }
}

// ../react-dom/lib/render.js
function render(element, container) {
  console.log(element);
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

// lib/enqueueSetState.js
var queue = [];
var renderQueue = [];
function defer(fn) {
  return Promise.resolve().then(fn);
}
function enqueueSetState(newState, component) {
  if (queue.length === 0) {
    defer(flush).then();
  }
  queue.push({ newState, component });
  if (!renderQueue.some((item) => item === component)) {
    renderQueue.push(component);
  }
}
function flush() {
  let item, component;
  while (item = queue.shift()) {
    const { newState: stateChange, component: component2 } = item;
    if (!component2.prevState) {
      component2.prevState = Object.assign({}, component2.state);
    }
    if (typeof stateChange === "function") {
      Object.assign(component2.state, stateChange(component2.prevState, component2.props));
    } else {
      Object.assign(component2.state, stateChange);
    }
    component2.prevState = component2.state;
  }
  while (component = renderQueue.shift()) {
    render.renderComponent(component);
  }
}

// lib/Component.js
var Component = class {
  constructor(props) {
    this.state = {};
    this.props = props;
  }
  setState(newState) {
    enqueueSetState(newState, this);
  }
};
__publicField(Component, "isReactComponent", true);

// lib/react.js
var react_default = {
  createElement,
  Component
};
export {
  react_default as default
};
