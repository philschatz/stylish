import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { DOMParser } from 'xmldom'
import { useNamespaces } from 'xpath-ts'
import { SourceMapGenerator } from 'source-map'

type Pos = {
    filename: string
    lineNumber: number
    columnNumber: number
}
type ComponentInfo = {
    subselector: string
    definedProps: Prop[]
    pos: Pos
}
type Prop = {
    name: string
    value: string
    pos: Pos
}
type VarValue = {
    value: string
    pos: Pos
}
type CSSRule = {
    selector: string
    props: Prop[]
    componentName: string
    pos: Pos
}

class ParseError extends Error { }

function assertValue<T>(v: T | null | undefined, message: string = 'Expected a value but did not get anything') {
    if (v !== null && v !== undefined) return v
    debugger
    throw new Error(`BUG: assertValue. Message: ${message}`)
}

// xmldom parser includes the line/column information on the Node (but it's not exposed in the public API)
function getPos(el: Node): Pos {
    return el as unknown as Pos
}

// Add the source filename to every node (not just the line/column)
function recAddFilenameToNodes(n: Node, filename: string) {
    (n as any).filename = filename
    for (const c of Array.from(n.childNodes || [])) {
        recAddFilenameToNodes(c, filename)
    }
    const attrs = (n as any).attributes
    for (const attr of Array.from(attrs || [])) {
        (attr as any).filename = filename
    }
}
function parseXML(fileContent: string, filename: string) {
    const locator = { lineNumber: 0, columnNumber: 0 }
    const cb = () => {
        const pos = {
            line: locator.lineNumber - 1,
            character: locator.columnNumber - 1
        }
        throw new ParseError(`ParseError: ${JSON.stringify(pos)}`)
    }
    const p = new DOMParser({
        locator,
        errorHandler: {
            warning: console.warn,
            error: cb,
            fatalError: cb
        }
    })
    const doc = p.parseFromString(fileContent)
    recAddFilenameToNodes(doc.documentElement, filename)
    return doc
}

const select = useNamespaces({ })

function attrsToProps(el: Element, exception?: string): Prop[] {
    const props: Prop[] = []
    for (const attr of Array.from(el.attributes)) {
        if (attr.name === exception) continue
        props.push({ name: attr.name, value: attr.value, pos: getPos(attr) })
    }
    return props
}


// HACK: The actual style framework has one more level of indirection but this is a prototype
function camelToDash(str: string){
    return str.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();})
}
// HACK: Instead of actually evaluating the template, wrap these templated strings in quotes so CSS does not complain
function hackTemplate(str: string) {
    if (str.startsWith('{')) {
        if (str.endsWith('}')) {
            const varKey = str.substring(1, str.length - 1)
            const v = assertValue(vars.get(varKey), `Expected to find a variable named '${varKey}'`)
            return v.value
        } else throw new Error('Complex template replacement not implemented yet')
    } else return str
}





const designStr = readFileSync(join(__dirname, 'design.xml'), 'utf-8')
const designDOM = parseXML(designStr, 'design.xml')
const bookStr = readFileSync(join(__dirname, 'sociology.xml'), 'utf-8')
const bookDOM = parseXML(bookStr, 'sociology.xml')

const varNodes = select('/book-root/vars/var', bookDOM) as Element[]
const shapeInstances = select('/book-root/shapes/*', bookDOM) as Element[]

const componentDOMClasses = select('/root/component', designDOM) as Element[]
const componentClasses = new Map<string, ComponentInfo>()
for (const el of componentDOMClasses) {
    const definedProps: Prop[] = []
    for (const definedProp of select('prop-defined', el) as Element[]) {
        const name = assertValue(definedProp.getAttribute('name'))
        const value = assertValue(definedProp.getAttribute('value'))
        definedProps.push({ name, value, pos: getPos(definedProp) })
    }
    componentClasses.set(assertValue(el.getAttribute('id')), {
        subselector: assertValue(el.getAttribute('subselector')),
        definedProps,
        pos: getPos(el)
    })
}


const vars = new Map<string, VarValue>()
for (const el of varNodes) {
    const id = assertValue(el.getAttribute('id'))
    const v = assertValue(el.getAttribute('value'))
    if (vars.has(id)) throw new Error('Overriding vars not supported yet')
    vars.set(id, { value: v, pos: getPos(el) })
}


const cssRules: CSSRule[] = []
function handleChildren(el: Element, prefixSel: string) {
    for (const child of select('*', el) as Element[]) {
        const componentName = child.tagName
        const componentClass = assertValue(componentClasses.get(componentName))
        const selector = `${prefixSel}${componentClass.subselector}`
        cssRules.push({
            componentName,
            pos: getPos(child),
            selector,
            props: componentClass.definedProps
        })        
        cssRules.push({
            componentName,
            pos: getPos(child),
            selector,
            props: attrsToProps(child)
        })
        handleChildren(child, selector)
    }
}
for (const el of shapeInstances) {
    const attrs = Array.from(el.attributes)
    const selector = assertValue(el.getAttribute('selector'))

    const sel = assertValue(attrs.find(a => a.name === 'selector'))
    cssRules.push({ componentName: el.tagName, pos: getPos(sel), selector, props: attrsToProps(el, 'selector') })
    handleChildren(el, selector)
}

// Print the CSS out
const g = new SourceMapGenerator()
g.setSourceContent('sociology.xml', bookStr)
g.setSourceContent('design.xml', designStr)
const theCSSFileLines: string[] = []

function addLine(pos: Pos, text: string) {
    g.addMapping({
        source: assertValue(pos.filename),
        original: { line: pos.lineNumber, column: pos.columnNumber },
        generated: { line: theCSSFileLines.length + 1, column: 1 }
    })
    for (const line of text.split('\n')) {
        theCSSFileLines.push(line)
    }
}

for (const r of cssRules) {
    // Add a sourcemap entry for the CSS Selector
    addLine(r.pos, `${r.selector} { -hack: "${r.componentName}"; }`)
    for (const prop of r.props) {
        addLine(prop.pos, `${r.selector} { ${camelToDash(prop.name)}: ${hackTemplate(prop.value)}; }`)
    }
}

theCSSFileLines.push('/*# sourceMappingURL=xml-example.css.map*/')

writeFileSync('xml-example.css', theCSSFileLines.join('\n'))
writeFileSync('xml-example.css.map', g.toString())