// --------------------------------------------
// This is an example of the Chemistry styling
// --------------------------------------------

// START: Framework

enum SLICE_ENUM {
    SLICE,
    AUTO,
    DEFAULT
}
enum UNIT {
    REM = 'rem'
}
type Length = [number, UNIT] // e.g. [2, 'rem']
const colorMap = {
    fontBodyColor: '#000',
    everydayLifeColor: '#ff0',
    portraitColor: '#0f0',
}
const typography = { titleFont: 'Comic Sans' }
function columnVSpacing(i: number) { return '' }
const allStyles: [string, Shape<any,any>][] = []
const styles = {
    add: function (selector: string, instance: Shape<any, any>) { 
        allStyles.push([selector, instance])
    },
    toCSS: function () {
        return allStyles.map(s => s[1].toCss(s[0])).join('\n')
    }
}

function assertArray<T>(o: any): Array<T> {
    if (Array.isArray(o)) {
        return o
    } else {
        throw new Error('BUG: Expected an Array')
    }
}



// END: Framework






// START: Design file


// For unit tests we could use screenshots OR... create snapshot files that can be diffed (JSON HTML with the style baked in)
// expect(dom).toMatchSnapshot()
//
// <p style="border-color: #ffffff; border-top: 1px;">
//

// Think about css coverage 
// Think about unit tests: What to test? screenshot comparison... 
// Think if hot reloading is easy to add


abstract class Component<T> {
    public readonly props: Readonly<T>

    constructor(public readonly sel: string, def: Partial<T>, p: T) {
        this.props = { ...def, ...p }
    }

    toCss(prefixSel: string) {
        return `${prefixSel} ${this.sel} ${JSON.stringify(this.props)}\n`
    }
}


abstract class Shape<T, C> {
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




// START: Design




// ------------------------------
//   Definition of a Title
// ------------------------------

// Component Selector
const titleSubselector = '[data-type="title"]'
// Default Fields
const titleDefaults = {}
type TitleParams =
    {
        // Required Fields
        fontFamily: string
        color: string
        // Optional Fields
        fontWeight?: string
    }
    & Partial<typeof titleDefaults>
// Boilerplate
export class Title extends Component<TitleParams> {
    constructor(p: TitleParams) {
        super(titleSubselector, titleDefaults, p)
    }
}


// ------------------------------
//   Definition of a BoxedNote
// ------------------------------

// Default Fields
const boxedNoteDefaults = { fontName: 'Arial' }
type BoxedNoteParams =
    {
        // Required Fields
        borderColor: string
        groupBorderColor: string
        // Optional Fields
        groupBorderStyle?: SLICE_ENUM,
        groupBorderWidth?: Length,
        groupBoxDecorationBreak?: SLICE_ENUM,
    }
    & Partial<typeof boxedNoteDefaults>
type BoxedNoteComponents = [Title]
// Boilerplate
export class BoxedNote extends Shape<BoxedNoteParams, BoxedNoteComponents> {
    constructor(p: BoxedNoteParams, ...comps: BoxedNoteComponents) {
        super(boxedNoteDefaults, p, comps)
    }
}


// ------------------------------
//   Definition of a Container
// ------------------------------

// Component Selector
const containerSubselector = '[data-type="os-container"]'
// Default Fields
const containerDefaults = {}
type ContainerParams =
    {
        // Required Fields
        columnCount: number,
        columnGap: Length,
        columnWidth: string,
    }
    & Partial<typeof containerDefaults>
// Boilerplate
export class Container extends Component<ContainerParams> {
    constructor(p: ContainerParams) {
        super(containerSubselector, containerDefaults, p)
    }
}


// ------------------------------
//   Definition of a ProblemNumber
// ------------------------------

// Component Selector
const problemNumberSubselector = '[data-type="os-problem-number"]'
// Default Fields
const problemNumberDefaults = {}
type ProblemNumberParams =
    {
        // Required Fields
        color: string,
    }
    & Partial<typeof problemNumberDefaults>
// Boilerplate
export class ProblemNumber extends Component<ProblemNumberParams> {
    constructor(p: ProblemNumberParams) {
        super(problemNumberSubselector, problemNumberDefaults, p)
    }
}


// ------------------------------
//   Definition of a SectionMarginBottom
// ------------------------------

// Component Selector
const sectionMarginBottomSubselector = '[data-type="os-problem-number"]'
// Default Fields
const sectionMarginBottomDefaults = {}
type SectionMarginBottomParams =
    {
        // Required Fields
        marginBottom: string,
    }
    & Partial<typeof sectionMarginBottomDefaults>
// Boilerplate
export class SectionMarginBottom extends Component<SectionMarginBottomParams> {
    constructor(p: SectionMarginBottomParams) {
        super(sectionMarginBottomSubselector, sectionMarginBottomDefaults, p)
    }
}


// ------------------------------
//   Definition of a EOCAssesments
// ------------------------------

type EOCAssessmentsParams = {}
type EOCAssessmentsComponents = [Container, ProblemNumber, SectionMarginBottom]
// Boilerplate
export class EOCAssessments extends Shape<EOCAssessmentsParams, EOCAssessmentsComponents> {
    constructor(p: EOCAssessmentsParams, ...comps: EOCAssessmentsComponents) {
        super({}, p, comps)
    }
}



// END: Design

// START: Book code








// Chemist Portrait
const cp = new BoxedNote({
    borderColor: 'blue',
    groupBorderColor: 'green'
}, new Title({
    fontFamily: typography.titleFont, 
    color: 'yellow'
}))
styles.add('.chemist-portrait', cp)

// Everyday Life
const el = new BoxedNote({
    borderColor: 'blue',
    groupBorderColor: 'green'
}, new Title({
    fontFamily: typography.titleFont, 
    color: 'yellow'
}))
styles.add('.everyday-life', el)



const Exercises = new EOCAssessments({},
    new Container({
        columnCount: 2,
        columnGap: [2.4, UNIT.REM],
        columnWidth: 'auto',
    }),
    new ProblemNumber({
        color: colorMap.fontBodyColor
    }),
    new SectionMarginBottom({
        marginBottom: columnVSpacing(1)
    })
);
styles.add("[data-type = 'chapter'] > .os-exercises-container", Exercises)


// A more concise way to write this (maybe autogen?)
//
// { 
//    class: 'NoteTitle'
//    defaults: { fontName: 'Arial' }                 // These are values
//    requiredFields: { borderColor: 'string' }       // These are Types
//    optionalFields: { borderStyle: 'BORDER_STYLE' } // These are also Types
//    components: [ 'Title', 'ProblemNumber' ]        // These are also Types
// }


// Now, try finishing this line in VSCode by uncommenting it and pressing "(":
// const x = new BoxedNote


console.log(styles.toCSS())