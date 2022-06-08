import { Component, Shape } from "./framework"

// Some constants. These would likely be in a book-specific file rather than in here
export enum SLICE_ENUM {
    SLICE,
    AUTO,
    DEFAULT
}
export enum UNIT {
    REM = 'rem'
}
export type Length = [number, UNIT] // e.g. [2, 'rem']
export const colorMap = {
    fontBodyColor: '#000',
    everydayLifeColor: '#ff0',
    portraitColor: '#0f0',
}
export const typography = { titleFont: 'Comic Sans' }


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
