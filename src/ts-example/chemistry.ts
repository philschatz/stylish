// --------------------------------------------
// This is an example of the Chemistry styling
// --------------------------------------------

import { BoxedNote, colorMap, Container, EOCAssessments, ProblemNumber, SectionMarginBottom, Title, typography, UNIT } from "./design"
import { columnVSpacing, styles } from "./framework"

// The title of all features is styled the same way so make it a variable
const featureTitle = new Title({
    fontFamily: typography.titleFont, 
    color: 'yellow'
})


// Chemist Portrait
const cp = new BoxedNote({
    borderColor: 'blue',
    groupBorderColor: 'green'
}, featureTitle)
styles.add('.chemist-portrait', cp)

// Everyday Life
styles.add('.everyday-life', new BoxedNote({
    borderColor: 'blue',
    groupBorderColor: 'green'
}, featureTitle))



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


// Now, try finishing this line in VSCode by uncommenting it:
// const x = new BoxedNote({ }, featureTitle)















// ====================
// ====================
//  Scratchwork below
// ====================
// ====================



// Hmm: A more concise way to write this (maybe autogen?)
//
// { 
//    class: 'NoteTitle'
//    defaults: { fontName: 'Arial' }                 // These are values
//    requiredFields: { borderColor: 'string' }       // These are Types
//    optionalFields: { borderStyle: 'BORDER_STYLE' } // These are also Types
//    components: [ 'Title', 'ProblemNumber' ]        // These are also Types
// }



// For unit tests we could use screenshots OR... create snapshot files that can be diffed (JSON HTML with the style baked in)
// expect(dom).toMatchSnapshot()
//
// <p style="border-color: #ffffff; border-top: 1px;">
//

// Think about css coverage 
// Think about unit tests: What to test? screenshot comparison... 
// Think if hot reloading is easy to add

console.log(styles.toCSS())