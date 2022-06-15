# stylish

## Install & Run

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/from-referrer/)

Or run locally:

```sh
npm install
npm run ts    # for the TypeScript example
npm run xml   # for the XML example
```

### TypeScript

With this method, a design defines classes whose values will be filled in when they are instantiated in the books file. The book file instantiates classes with values and then calls toCSS() to convert the code to CSS.

By using TypeScript the editor can autocomplete when devs are writing the `chemistry.ts` file.

Files:

- [chemistry.ts](./src/ts-example/chemistry.ts) contains all the Book styling.
- [design.ts](./src/ts-example/design.ts) defines all the classes that will be instantiated with values.
- [framework.ts](./src/ts-example/framework.ts) defines all the base classes as well as a `styles.toCSS()` that converts all the instantiated classes (Objects) to CSS.

**Note:** the whole file is pretty much just instantiations of classes, no conditionals or loops which one would expect in a programming language.

<details>
<summary>Click to see the generated CSS output from the TypeScript files</summary>

```css
.chemist-portrait {"fontName":"Arial","borderColor":"blue","groupBorderColor":"green"} .chemist-portrait [data-type="title"] {"fontFamily":"Comic Sans","color":"yellow"}

.everyday-life {"fontName":"Arial","borderColor":"blue","groupBorderColor":"green"} .everyday-life [data-type="title"] {"fontFamily":"Comic Sans","color":"yellow"}

[data-type = 'chapter'] > .os-exercises-container {} [data-type = 'chapter'] > .os-exercises-container [data-type="os-container"] {"columnCount":2,"columnGap":[2.4,"rem"],"columnWidth":"auto"}

[data-type = 'chapter'] > .os-exercises-container [data-type="os-problem-number"] {"color":"#000"}

[data-type = 'chapter'] > .os-exercises-container [data-type="os-problem-number"] {"marginBottom":""}
```

</details>

### Autocompletion

A major feature of this method over SASS is that developers have type hints so folks don't have to remember all of the arguments to style a component:

![screencast of autocompletion](./ts-example.gif)


### Notes

A Turing-Complete language like TypeScript is probably overkill for something that generates CSS since styling a book does not need to perform conditionals & loops. The features that do seem useful are:

- creating instances of objects
- defining and using variables to deduplicate code
- type-checking and autocompletion


## XML

This option uses XML data files to store the styling information, XSD files to autocomplete in the editor, and eventually sourcemaps to link devs back to the source information when viewing the CSS in a browser.

Files:

- [sociology.xml](./src/xml-example/sociology.xml)
- [design.xml](./src/xml-example/design.xml)
- [framework.xsd](./src/xml-example/schemas/framework.xsd)
- [generate-design.xsl](./src/xml-example/schemas/generate-design.xsl): Generates a schema from the design file that is used for validating the book XML file.

### Install prerequisites

This demo requires `xsltproc` and `xmllint` (for validating)

### XML Screencap

This shows autocompletion of the `chemistry.xml` file and sourcemapping in the browser

![Screencap of Autocomplete and Sourcemapping](https://user-images.githubusercontent.com/253202/172738119-0c9fde62-2535-4bac-8b29-84d368879ece.mp4)