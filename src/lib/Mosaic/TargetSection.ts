export class Section {
    x1: number = 0;
    y1: number = 0;
    x2: number = 0;
    y2: number = 0;

    constructor( x1: number, y1: number, x2: number, y2: number ){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    };
}

export class SectionList extends Section {
    left: Section;
    middle: Section;
    right: Section;

    constructor( x1: number, y1: number, x2: number, y2: number ){
        super( x1, y1, x2, y2 )
    };

    setSections(){
        let divideWidth = parseFloat(( this.x2 / 3 ).toFixed(3));
        let divideHeight = parseFloat(( this.y2 / 3 ).toFixed(3));

        this.left = new Section( this.x1, this.y1, divideWidth, this.y2 );
        this.middle = new Section( divideWidth, this.y1, divideWidth * 2, this.y2 );
        this.right = new Section( divideWidth * 2, this.y1, this.x2, this.y2 );
    };    
}    

export class TargetSection extends Section {
    top: SectionList;
    center: SectionList;
    bottom: SectionList;

    constructor( x1: number, y1: number, x2: number, y2: number ){
        super( x1, y1, x2, y2 );
    };

    setSectionList(){
        let divideWidth = parseFloat(( this.x2 / 3 ).toFixed(3));
        let divideHeight = parseFloat(( this.y2 / 3 ).toFixed(3));

        this.top = new SectionList( this.x1, this.y1, this.x2, divideHeight );
        this.center = new SectionList( this.x1, divideHeight * 2, this.x2, divideHeight );
        this.bottom = new SectionList( this.x1, divideHeight , this.x2, this.y2 );

        this.top.setSections();
        this.center.setSections();
        this.bottom.setSections();
    };
}