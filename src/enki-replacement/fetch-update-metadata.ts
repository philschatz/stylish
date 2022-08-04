import { useNamespaces } from 'xpath-ts'
import { readXmlWithSourcemap, writeXmlWithSourcemap, XmlFormat } from './utils'

async function fn() {

    const select = useNamespaces({ })


    const inputFile = process.argv[2]
    const outputFile = process.argv[3]

    console.log('converting from', inputFile, 'to', outputFile)

    const root = await readXmlWithSourcemap(inputFile)

    writeXmlWithSourcemap(outputFile, root, XmlFormat.XHTML5)

}

fn().then(null, err => {throw err})