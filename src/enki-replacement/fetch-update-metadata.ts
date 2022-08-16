import { readFileSync } from 'fs'
import { useNamespaces } from 'xpath-ts'
import mkdirp from 'mkdirp'
import { assertTrue, assertValue, readXmlWithSourcemap, writeXmlWithSourcemap, XmlFormat } from './utils'

import { Bundle } from '../../poet/server/src/model/bundle'
import { join, dirname, relative } from 'path'
import { Fileish } from '../../poet/server/src/model/fileish'
import { PageNode } from '../../poet/server/src/model/page'

// JSON Parser: https://github.com/microsoft/node-jsonc-parser

function ensureLoaded<T extends Fileish>(n: T) {
    n.load(readFileSync(n.absPath, 'utf-8'))
    return n
}

const NAMESPACES = {
    'c': 'http://cnx.rice.edu/cnxml',
    'md': 'http://cnx.rice.edu/mdml',
    'h': 'http://www.w3.org/1999/xhtml',
    'm': 'http://www.w3.org/1998/Math/MathML'
}

const select = useNamespaces(NAMESPACES)

function selectOne<T>(xpath: string, node: Node) {
    const res = select(xpath, node)
    if (Array.isArray(res)) {
        assertTrue(res.length === 1)
        return res[0]
    } else {
        return res
    }
}

async function fn() {

    const inputDir = assertValue(process.argv[2], 'Specify a directory to a book repo (contains a /META-INF/books.xml file)')
    const outputDir = assertValue(process.argv[3], 'Specify an output directory to write to')

    const bundle = new Bundle({
        join: join,
        dirname: dirname,
        canonicalize: (x) => x,
    }, inputDir)

    const books = ensureLoaded(bundle).books.map(b => ensureLoaded(b))
    const pages = books.flatMap(b => b.pages).map(p => ensureLoaded(p))

    const canonicalBookUUIDForPage = new Map<PageNode, string>()
    books.reverse().forEach(b => {
        b.pages.forEach(p => canonicalBookUUIDForPage.set(p, b.uuid))
    })

    // Replace the metadata elements in each CNXML file with a revised and canonical-book-uuid element
    for(const page of pages.toArray()) {
        const inputFile = page.absPath
        const outputFile = join(outputDir, relative(inputDir, inputFile))
        const root = await readXmlWithSourcemap(inputFile)

        const md = selectOne('//c:metadata', root) as Element
        Array.from(md.childNodes).forEach(c => md.removeChild(c)) // remove each child
        const revisedEl = root.createElementNS(NAMESPACES.md, 'revised')
        const canonicalEl = root.createElementNS(NAMESPACES.md, 'canonical-book-uuid')
        canonicalEl.appendChild(root.createTextNode(assertValue(canonicalBookUUIDForPage.get(page))))
        md.appendChild(revisedEl)
        md.appendChild(canonicalEl)

        await mkdirp(dirname(outputFile)) // ensure the output dir exists
        writeXmlWithSourcemap(outputFile, root, XmlFormat.XML)
    }
}

fn().then(null, err => {throw err})
