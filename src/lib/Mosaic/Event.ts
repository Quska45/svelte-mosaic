export const SplitEvent = {
    mousedown: function( e ){
        console.log( 'split mouse down' );
        console.log( (e.clientX / document.body.offsetWidth * 100).toFixed() );
        e.preventDefault();
        return;
    }
};

export const WindowEvent = {
    mousedown: function( event, callback ){
        callback( event );
        event.preventDefault();
        return;
    },
    /**
     * MosaicPieceManager의 mosaicWindows에 요소를 추가해주면 자동으로 렌더링
    */
    split: function( event ){
        
    }
}