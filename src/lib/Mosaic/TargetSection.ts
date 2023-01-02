import { compute_rest_props } from "svelte/internal";
import type { MosaicNode } from "../MosaicNode/MosaicNode";

export enum SectionDirection {
    TopHalf = 'TopHalf',
    RightHalf = 'RightHalf',
    BottomHalf = 'BottomHalf',
    LeftHalf = 'LeftHalf'
};

export enum SectionEnum {
    left = 'left',
    middle = 'middle',
    right = 'right'
};

export enum SectionListEnum {
    top = 'top',
    center = 'center',
    bottom = 'bottom'
};

export type TSection = SectionEnum | SectionListEnum | string | SectionDirection;

export class Section {
    x1: number = 0;
    y1: number = 0;
    x2: number = 0;
    y2: number = 0;
    width: number;
    height: number;
    type: TSection;

    constructor( x1: number, y1: number, x2: number, y2: number, type: TSection ){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.type = type;
        this.width = (x2 - x1);
        this.height = (y2 - y1);
    };
}

export class SectionList extends Section {
    left: Section;
    middle: Section;
    right: Section;

    constructor( x1: number, y1: number, x2: number, y2: number, type: TSection ){
        super( x1, y1, x2, y2, type );
    };

    setSections(){
        let substractWidth = this.x2 - this.x1;
        let divideWidth = parseFloat(( substractWidth / 3 ).toFixed(3));

        this.left = new Section( this.x1, this.y1, this.x1 + divideWidth, this.y2, SectionEnum.left );
        this.middle = new Section( this.x1 + divideWidth, this.y1, this.x1 + (divideWidth * 2), this.y2, SectionEnum.middle );
        this.right = new Section( this.x1 + (divideWidth * 2), this.y1, this.x2, this.y2, SectionEnum.right );
    };

    getSectionByXY( x: number, y: number ){
        let substractWidth = this.x2 - this.x1;
        let divideWidth = parseFloat(( substractWidth / 3 ).toFixed(3));

        if( this.x1 < x && ( this.x1 + divideWidth ) > x ){
            // console.log( 'left' );
            return this.left;
        } else if( ( this.x1 + divideWidth ) < x && ( this.x1 + (divideWidth*2) ) > x ){
            // console.log( 'middle' );
            return this.middle;
        } else {
            // console.log( 'right' );
            return this.right;
        }
    };
}    

export class TargetSection extends Section {
    top: SectionList;
    center: SectionList;
    bottom: SectionList;

    constructor( x1: number, y1: number, x2: number, y2: number, type: TSection ){
        super( x1, y1, x2, y2, type );
    };

    setSectionList(){
        let substractHeight = this.y2 - this.y1;
        let divideHeight = parseFloat(( substractHeight / 3 ).toFixed(3));

        this.top = new SectionList( this.x1, this.y1, this.x2, this.y1 + divideHeight, SectionListEnum.top );
        this.center = new SectionList( this.x1, this.y1 + divideHeight , this.x2, this.y1 + (divideHeight * 2), SectionListEnum.center );
        this.bottom = new SectionList( this.x1, this.y1 + (divideHeight * 2) , this.x2, this.y2, SectionListEnum.bottom );

        this.top.setSections();
        this.center.setSections();
        this.bottom.setSections();
    };

    getSectionListByXY( x: number, y: number ){
        let substractHeight = this.y2 - this.y1;
        let divideHeight = parseFloat(( substractHeight / 3 ).toFixed(3));

        if( this.y1 < y && this.y1 + divideHeight > y ){
            // console.log( 'top' );
            return this.top;
        } else if( this.y1 + divideHeight < y && this.y1 + (divideHeight * 2) > y ){
            // console.log( 'center' );
            return  this.center;
        } else {
            // console.log( 'bottom' );
            return this.bottom;
        };
    };

    getShadowSectionByXY( x: number, y: number ){
        let sectionList = this.getSectionListByXY( x, y );
        let section = sectionList.getSectionByXY( x, y );

        if( section.type == SectionEnum.left ){
            if( 
                sectionList.type == SectionListEnum.top
                || sectionList.type == SectionListEnum.center
                || sectionList.type == SectionListEnum.bottom
            ){
                return new Section( this.x1, this.y1, this.x1 + (this.width / 2), this.y2, 'LeftHalf' );
            };
        } else if( section.type == SectionEnum.middle ){
            if( sectionList.type == SectionListEnum.top ){
                return new Section( this.x1, this.y1, this.x2, this.y1 + (this.height / 2), 'TopHalf' );
            } else if( sectionList.type == SectionListEnum.bottom ){
                return new Section( this.x1, this.y1 + (this.height / 2), this.x2, this.y2, 'BottomHalf' );
            } else {
                return new Section( 0,100,100,0,'empty' );
            };
        } else {
            if(
                sectionList.type == SectionListEnum.top
                || sectionList.type == SectionListEnum.center
                || sectionList.type == SectionListEnum.bottom
            ){
                return new Section( this.x1 + (this.width / 2), this.y1, this.x2, this.y2, 'RightHalf' );
            }
        };
    };

    getShawdowSecionTypeByShadowSection( shadowSection: Section, currentDom,  ){
        let shadow = document.getElementById( 'drop-target-container' );
        let insetArr = shadow.style.inset.split('%');
        insetArr.pop();

        let headerHeight = document.body.getElementsByClassName( 'svelte-mosaic-header' )[0].clientHeight;
        let documnetWidth = document.body.clientWidth;
        let documnetHeight = document.body.clientHeight;

        console.log( 'insetArr', insetArr );
        console.log( 'shadowSection', shadowSection );

        let inset = {top:null, right: null, bottom: null, left: null};
        inset.top = ( (shadowSection.y1 - headerHeight) / (documnetHeight - headerHeight) * 100 );
        inset.right = ( 100 - (shadowSection.x2 / documnetWidth * 100) );
        inset.bottom = ( 100 - ((shadowSection.y2 - headerHeight) / (documnetHeight - headerHeight) * 100) );
        inset.left = ( shadowSection.x1 / documnetWidth * 100 );
        console.log(inset);

        // if( shadowSection.type == 'TopHalf' ){
        //     insetArr[ 2 ] 
        //         = (
        //             parseInt(insetArr[ 2 ]) + ((100 - parseInt(insetArr[ 2 ])) / 2)
        //         ).toString();
        // } else if( shadowSection.type == 'RightHalf' ){
        //     insetArr[ 3 ] = (
        //         parseInt(insetArr[ 3 ]) + ((100 - parseInt(insetArr[ 1 ])) / 2)
        //     ).toString();
        // } else if( shadowSection.type == 'BottomHalf' ){
        //     insetArr[ 0 ] = (
        //         parseInt(insetArr[ 0 ]) + ((100 - parseInt(insetArr[ 0 ])) / 2)
        //     ).toString();
        // } else if( shadowSection.type == 'LeftHalf' ){
        //     insetArr[ 1 ] = (
        //         parseInt(insetArr[ 1 ]) + ((100 - parseInt(insetArr[ 3 ])) / 2)
        //     ).toString();
        // } else {
        //     insetArr[ 0 ] = '0';
        //     insetArr[ 1 ] = '100';
        //     insetArr[ 2 ] = '100';
        //     insetArr[ 3 ] = '0';
        // }


        if( shadowSection.type == 'TopHalf' ){
            insetArr[ 0 ] = inset.top;
            insetArr[ 1 ] = inset.right;
            insetArr[ 2 ] = inset.bottom;
            insetArr[ 3 ] = inset.left;
        } else if( shadowSection.type == 'RightHalf' ){
            insetArr[ 0 ] = inset.top;
            insetArr[ 1 ] = inset.right;
            insetArr[ 2 ] = inset.bottom;
            insetArr[ 3 ] = inset.left;
        } else if( shadowSection.type == 'BottomHalf' ){
            insetArr[ 0 ] = inset.top;
            insetArr[ 1 ] = inset.right;
            insetArr[ 2 ] = inset.bottom;
            insetArr[ 3 ] = inset.left;
        } else if( shadowSection.type == 'LeftHalf' ){
            insetArr[ 0 ] = inset.top;
            insetArr[ 1 ] = inset.right;
            insetArr[ 2 ] = inset.bottom;
            insetArr[ 3 ] = inset.left;
        } else {
            insetArr[ 0 ] = '0';
            insetArr[ 1 ] = '100';
            insetArr[ 2 ] = '100';
            insetArr[ 3 ] = '0';
        }

        return insetArr;
    };
}