import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { DOMParser } from 'xmldom'
import { useNamespaces } from 'xpath-ts'
import { SourceMapGenerator } from 'source-map'

type Pos = {
    lineNumber: number,
    columnNumber: number
}
type ComponentInfo = {
    subselector: string
    pos: Pos
}
type CSSRule = {
    selector: string
    props: Map<string, [Pos, string]> // e.g. "color" -> "blue"
    componentName: string
    pos: Pos
}

class ParseError extends Error { }

function assertValue<T>(v: T | null | undefined) {
    if (v) return v
    throw new Error('BUG: Expected a value but did not get anything')
}

function parseXML(fileContent: string) {
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
    return p.parseFromString(fileContent)
}

const select = useNamespaces({ })

function attrsToProps(el: Element, exception?: string) {
    const pairs = new Map<string, [Pos, string]>()
    for (const attr of Array.from(el.attributes)) {
        if (attr.name === exception) continue
        pairs.set(attr.name, [attr as unknown as Pos, attr.value])
    }
    return pairs
}


// HACK: The actual style framework has one more level of indirection but this is a prototype
function camelToDash(str: string){
    return str.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();})
}
// HACK: Instead of actually evaluating the template, wrap these templated strings in quotes so CSS does not complain
function hackTemplate(str: string) {
    if (str.startsWith('{')) return `"${str}"`
    return str
}





const designDOM = parseXML(readFileSync(join(__dirname, 'design.xml'), 'utf-8'))
const bookStr = readFileSync(join(__dirname, 'chemistry.xml'), 'utf-8')
const bookDOM = parseXML(bookStr)

const instances = select('/book-root/*', bookDOM) as Element[]

const componentDOMClasses = select('//component', designDOM) as Element[]
const componentClasses = new Map<string, ComponentInfo>()
for (const el of componentDOMClasses) {
    componentClasses.set(assertValue(el.getAttribute('name')), {
        subselector: assertValue(el.getAttribute('subselector')),
        pos: el as unknown as Pos
    })
}



const cssRules: CSSRule[] = []
for (const el of instances) {
    const attrs = Array.from(el.attributes)
    const selector = assertValue(el.getAttribute('selector'))

    if (attrs.length > 1) {
        const sel = assertValue(attrs.find(a => a.name === 'selector'))
        cssRules.push({ componentName: el.tagName, pos: sel as unknown as Pos, selector, props: attrsToProps(el, 'selector') })
    }
    for (const child of select('*', el) as Element[]) {
        const componentName = child.tagName
        const componentClass = assertValue(componentClasses.get(componentName))
        cssRules.push({
            componentName,
            pos: child as unknown as Pos,
            selector: `${selector} ${componentClass.subselector}`,
            props: attrsToProps(child)
        })
    }
}

// Print the CSS out
const g = new SourceMapGenerator()
g.setSourceContent('chemistry.xml', bookStr)
const theCSSFileLines: string[] = []

function addLine(pos: Pos, text: string) {
    g.addMapping({
        source: 'chemistry.xml',
        original: { line: pos.lineNumber, column: pos.columnNumber },
        generated: { line: theCSSFileLines.length + 1, column: 1 }
    })
    for (const line of text.split('\n')) {
        theCSSFileLines.push(line)
    }
}

for (const r of cssRules) {
    // Add a sourcemap entry for the CSS Selector
    addLine(r.pos, `${r.selector} { hack: "${r.componentName}"; }`)
    for (const [key, value] of Array.from(r.props.entries())) {
        addLine(value[0], `${r.selector} { ${camelToDash(key)}: ${hackTemplate(value[1])}; }`)
    }
}

theCSSFileLines.push('/*# sourceMappingURL=xml-example.css.map*/')

writeFileSync('xml-example.css', theCSSFileLines.join('\n'))
writeFileSync('xml-example.css.map', g.toString())