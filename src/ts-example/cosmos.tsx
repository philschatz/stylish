// This technique fails because there does not seem to be a way to restrict the types of child elements.
// Maybe there actually is a way and ReactBootstrap or something uses it?


import React from 'preact'

export class BoxedNoteWithSubtitleShape {

}

export type Phil1Props = {
    foobar: boolean
    num: number
    title?: string
    children?: React.JSX.Element | React.JSX.Element[] // Allow 0, 1, or many children. Can be more specific
}

export function Phil1(props: Phil1Props) { return <div data-name={Phil1.name} data-props={props} /> }
export const PhilChildren = (props: Phil1Props) => { return <div data-props={props} /> }

class Component<T> extends React.Component<T> {
    constructor(public subSelector?: string, public defined = {}, public childTypes?: Function[]) {
        super()
    }
    toCSS(parentSelector: string) {
        // Runtime validation of children because we cannot validate statically
        const children = this.props.children
        if (children && this.childTypes) {
            if (!Array.isArray(children)) throw new Error(`ERROR: This component requires ${this.childTypes.length} children but only found one`)
            for (let i = 0; i < this.childTypes.length; i++) {
                const child: React.ComponentChild = children[i]
                if (typeof child === 'object' && child !== null) {
                    if (this.childTypes[i] !== (child as any).type) {
                        throw new Error(`ERROR: Child types mismatch`)
                    }
                }
                if (!child) throw new Error(`ERROR: This component requires ${this.childTypes.length} children but only found one`)
            }
        } else if (this.childTypes) {
            throw new Error(`ERROR: This component requires ${this.childTypes.length} children of a specific type (see Documentation) but 0 children were provided`)
        }
        return `${parentSelector}${this.subSelector} ${JSON.stringify(this.props)}`
    }
    render(): null { throw new Error('BUG: Do not actually render') }
}

class Phil3 extends Component<{jammy: boolean}> { subSelector = 'foo > bar'; defined = { color: 'blue' } }

/**
 * Requires exactly 2 children: Phil3 and Phil3
 */
class Phil4 extends Component<{}> { subSelector = 'figure > caption'; childTypes = [Phil3, Phil3] }







type Color = 'red' | 'green' | 'blue' | 'black' | 'white'

class Title extends Component<{fontFamily: string, color: Color, fontWeight?: number}> { subSelector = '[data-type="title"]' }

class ProblemNumber extends Component<{color: Color}> { subselector = '[data-type="os-problem-number"]'; childTypes = [] }

/**
 * Requires exactly 2 children: Title and ProblemNumber.
 */
class Problem extends Component<{backgroundColor: Color}> { subdelector = '[data-type="problem"'; childTypes = [Title, ProblemNumber]}


const a = (<Problem backgroundColor='blue'><ProblemNumber color='white'></ProblemNumber></Problem>)



























export const bar = (<Phil1 foobar={true} num={123} />)
export const baz = (<Phil3 jammy={true} />)
export const foo = (<PhilChildren foobar={true} num={123} />)
export const foo2 = (<PhilChildren foobar={true} num={123}>{bar}{baz}</PhilChildren>)
// The next one breaks because the definition of Phil4 tries to require a Phil3 child but the type of <Phil3> is erased and becomes React.JSX.Element
export const foo3 = (<Phil4><Phil3 jammy={false}/><Phil3 jammy={false}/></Phil4>)

function toCSS(el: React.JSX.Element) {
    console.log('el.props', el.props) // { jammy: true }
    console.log('el.type.name', (el.type as Function).name) // Phil3
    const t = el.type as unknown as typeof Component
    const o = new t()
    console.log('o instanceof Base', o instanceof Component)
    console.log('o instanceof Phil3', o instanceof Phil3)
    console.log('o.subSelector', o.subSelector) // instance of Phil3 (with a .selector)
    console.log('o.props', o.props)
    console.log('o.props = el.props')
    o.props = el.props
    if (o instanceof Component) {
        console.log('o.toCSS()', o.toCSS('[[[parentSelector]]]'))
    }
    // this better be a <div> with data-props on it.
}

toCSS(baz)
toCSS(foo2)
toCSS(foo3)