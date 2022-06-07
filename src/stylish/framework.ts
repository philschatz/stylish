// This file should not contain any selectors.

export function columnVSpacing(i: number) { return '' }

const allStyles: [string, Shape<any,any>][] = []
export const styles = {
    add: function (selector: string, instance: Shape<any, any>) { 
        allStyles.push([selector, instance])
    },
    toCSS: function () {
        return allStyles.map(s => s[1].toCss(s[0])).join('\n')
    }
}

export function assertArray<T>(o: any): Array<T> {
    if (Array.isArray(o)) {
        return o
    } else {
        throw new Error('BUG: Expected an Array')
    }
}



export abstract class Component<T> {
    public readonly props: Readonly<T>

    constructor(public readonly sel: string, def: Partial<T>, p: T) {
        this.props = { ...def, ...p }
    }

    toCss(prefixSel: string) {
        return `${prefixSel} ${this.sel} ${JSON.stringify(this.props)}\n`
    }
}


export abstract class Shape<T, C> {
    public readonly props: Readonly<T>
    public readonly components: Readonly<C>

    constructor(def: Partial<T>, p: T, c: C) {
        this.props = { ...def, ...p };
        this.components = c
    }

    toCss(sel: string) {
        const components = assertArray<Component<any>>(this.components)
        return `${sel} ${JSON.stringify(this.props)} ${components.map(c => c.toCss(sel)).join('\n')}`
    }
}

