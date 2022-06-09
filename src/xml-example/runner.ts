import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { DOMParser } from 'xmldom'
import { useNamespaces } from 'xpath-ts'
import { SourceMapGenerator } from 'source-map'

class ParseError extends Error { }

function assertValue<T>(v: T | null | undefined) {
    if (v) return v
    throw new Error('BUG: Expected a value but did not get anything')
}

function cssPropsToString(props: any) {
    const lines: string[] = []
    lines.push('{')
    for (const [key, value] of Object.entries(props)) {
        let v = value as string
        if (Array.isArray(value)) {
            v = value[1]
        }
        lines.push(`${key}: ${v};`)
    }
    lines.push('}')
    return lines
}

function parseXML(fileContent: string) {
    const locator = { lineNumber: 0, columnNumber: 0 }
    const cb = (msg: string) => {
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

export const select = useNamespaces({ })
export const selectOne = (sel: string, doc: Node): Element => {
  const ret = select(sel, doc) as Node[]
  return ret[0] as Element
}

function attrsToPairs(el: Element, exception?: string) {
    const pairs = new Map<string, [Pos, string]>()
    for (const attr of Array.from(el.attributes)) {
        if (attr.name === exception) continue
        pairs.set(attr.name, [attr as unknown as Pos, attr.value])
    }
    return pairs
}



function camelToDash(str: string){
    return str.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();})
}

function hackTemplate(str: string) {
    if (str.startsWith('{')) return `"${str}"`
    return str
}





const bookStr = readFileSync(join(__dirname, 'chemistry.xml'), 'utf-8')
const bookDOM = parseXML(bookStr)
const designDOM = parseXML(readFileSync(join(__dirname, 'design.xml'), 'utf-8'))

const componentDOMClasses = select('//component', designDOM) as Element[]

type Pos = {
    lineNumber: number,
    columnNumber: number
}
type ComponentInfo = {
    subselector: string
    pos: Pos
}

const componentClasses = new Map<string, ComponentInfo>()

for (const el of componentDOMClasses) {
    componentClasses.set(assertValue(el.getAttribute('name')), {
        subselector: assertValue(el.getAttribute('subselector')),
        pos: el as unknown as Pos
    })
}

const instances = select('/book-root/*', bookDOM) as Element[]

type CSSRule = {
    pos: Pos
    selector: string
    pairs: Map<string, [Pos, string]>
}

const cssRules: CSSRule[] = []

for (const el of instances) {
    const attrs = Array.from(el.attributes)
    const selector = assertValue(el.getAttribute('selector'))

    if (attrs.length > 1) {
        cssRules.push({ pos: el as unknown as Pos, selector, pairs: attrsToPairs(el, 'selector') })
    }
    for (const child of select('*', el) as Element[]) {
        const componentName = child.tagName
        const componentClass = assertValue(componentClasses.get(componentName))
        cssRules.push({
            pos: child as unknown as Pos,
            selector: `${selector} ${componentClass.subselector}`,
            pairs: attrsToPairs(child)
        })
    }
}

// Print the CSS out
const g = new SourceMapGenerator()
g.setSourceContent('chemistry.xml', bookStr)

const theCSSFileLines: string[] = []

for (const r of cssRules) {
    const pairs: any = {}
    for (const [key, value] of Array.from(r.pairs.entries())) {
        pairs[key] = value[1]
        // position = { col: value[0].columnNumber, line: value[0].lineNumber }
    }

    // Add a sourcemap entry for the CSS Selector
    theCSSFileLines.push(`${r.selector} {`)
    g.addMapping({
        source: 'chemistry.xml',
        original: { line: r.pos.lineNumber, column: r.pos.columnNumber },
        generated: { line: theCSSFileLines.length, column: 1 }
    })

    for (const [key, value] of Array.from(r.pairs.entries())) {
        theCSSFileLines.push(`${camelToDash(key)}: ${hackTemplate(value[1])};`)
        g.addMapping({
            source: 'chemistry.xml',
            original: { line: value[0].lineNumber, column: value[0].columnNumber },
            generated: { line: theCSSFileLines.length, column: 1 }
        })
    }

    theCSSFileLines.push(`}`)
    g.addMapping({
        source: 'chemistry.xml',
        original: { line: r.pos.lineNumber, column: r.pos.columnNumber },
        generated: { line: theCSSFileLines.length, column: 1 }
    })
}

theCSSFileLines.push('/*# sourceMappingURL=xml-example.css.map*/')

writeFileSync('xml-example.css', theCSSFileLines.join('\n'))
writeFileSync('xml-example.css.map', g.toString())