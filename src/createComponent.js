export function createComponent(component, props) {
    let inst;
    // 如果是类定义组件，则直接返回实例
    if (component.prototype && component.prototype.render) {
        inst = new component(props);
        // 如果是函数定义组件，则将其扩展为类定义组件
    } else {
        inst = new Component(props);
        inst.constructor = component;
        inst.render = function() {
            return this.constructor(props);
        };
    }

    return inst;
}