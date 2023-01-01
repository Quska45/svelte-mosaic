import { SectionListEnum, type Section, type SectionList, type TargetSection } from "./TargetSection";

export class Shadow {
  targetSection: TargetSection;

  getShadowSectionByPostionSection( sectionList: SectionList, section: Section ){
    let sectionListType = sectionList.type;
    let sectionType = section.type;
    if( sectionListType == SectionListEnum.top ){
      
    } else if( sectionListType == SectionListEnum.center ){

    } else {

    };
  };
};