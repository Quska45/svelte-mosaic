import {
    MosaicBaseProps,
    MosaicControlledProps,
    MosaicUncontrolledProps
} from '../src/lib/Mosaic/Mosaic';
import type {
    IMosaicBaseProps,
    IMosaicControlledProps,
    IMosaicUncontrolledProps
} from '../src/lib/Mosaic/Mosaic';
import {
    MosaicWithoutDragDropContext,
    DefaultProps
} from '../src/lib/MosaicWithoutDragDropContext/MosaicWithoutDragDropContext'

export {}

interface IMosaicBasePropsNotImpl{ isUnControlled(): boolean; }
class MosaicBasePropsNotImpl{}
class ImplMosaicBasePropsNotImpl implements IMosaicBasePropsNotImpl{ isUnControlled(): boolean {return true;} }

// 인터페이스를 타입으로 하는 변수에 클래스 인스턴스 넣어보기
let interfaceTest = () => {
    // 1. 처음엔 인터페이스의 구현체만 넣을 수 있는 줄 알았다.
    let mosaicBaseProps: IMosaicBaseProps = new MosaicBaseProps();
    /*
        2. 필드와 메서드가 완전히 동일하다면 아무거나 그냥 넣을 수 있는 줄 알았다.
        안된다는 것을 알 수 있다.
        이상한건 됐었는데 갑자기 안된다는 것이다.
        vscode의 버그 떄문에 일시적으로 감지가 안될걸까 싶기는 하다.
    */    
    // let mosaicBasePropsNotImpl: IMosaicBaseProps = new MosaicBasePropsNotImpl();
    // 3. 타입을 클래스로 지정해도 상관없다.
    let mosaicBasePropsClassInstance: MosaicBaseProps = new MosaicBaseProps();
}
interfaceTest();

// 상속을 통해 상위 클래스의 메서드가 정상적으로 상속되는지 확인
let classExtendsTest = () => {
    let mosaicBaseProps = new MosaicBaseProps();
    let controlledProps = new MosaicControlledProps();
    let unControlledProps = new MosaicUncontrolledProps();

    // 상위 클래스의 메서드를 정상적으로 가지고 있는 것을 확인 할 수 있다.
    mosaicBaseProps.isUnControlled();
    controlledProps.isUnControlled();
    unControlledProps.isUnControlled();
}

// 생성자 없이 필드를 만드는 경우에 대한 테스트
let feildWithoutConstructor = () => {
    // 1.필드만 적어줬다면 생성자 없어도 상관없다.
    // 참고로 필드를 정의만 했다면 undefined만 찍히게 된다.
    let defaultProps: DefaultProps = new DefaultProps();
    defaultProps.className;

    // 2. static으로 선언된 필드도 정상적으로 접근이 가능하다.
    MosaicWithoutDragDropContext.defaultProps.blueprintNamespace;
}