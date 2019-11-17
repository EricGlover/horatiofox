// game objects and containers work together
// is something that can contain game objects


/**
 * Our base component class
 * All components appear on their parents on the same prop name
 * for a given kind of component (ex : all phasers are on .phasers)
 * all components can access their parent
 */
export class Component {
    constructor(_class, parent) {
        if (!_class.propName || typeof _class.propName === 'function') {
            debugger;
            throw new Error("To inherit component you need to define a static propName");
        }
        this.parent = parent;
        this.parent[_class.propName] = this;
        this.parent.hasComponent = Component.hasComponent.bind(this.parent);
    }

    static hasComponent(_class) {
        return this[_class.propName];
    }
}

