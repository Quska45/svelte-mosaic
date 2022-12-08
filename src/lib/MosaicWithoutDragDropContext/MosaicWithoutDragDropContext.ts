/*
    react-mosaic에서 이 컴포넌트는 리액트 컴포넌트를 사용해 처리하고 있다.
    dnd를 위한 컴포넌트의 최초 세팅도 여기서 하고 있는데, 나도 여기서 처리할 수 있도록 하려고 한다.
*/
export class DefaultProps {
    zeroStateView: null = null;
    className: string = 'mosaic-blueprint-theme';
    blueprintNamespace: string = 'bp3';

    onChange = () => {};
}

export class MosaicWithoutDragDropContext {
    static defaultProps: DefaultProps = new DefaultProps();
}