import React from 'react';
import ContentBox from '../Content/ContentBox';

/*  - This component is basically the exact same thing as the Modal.js component. Only difference is that instead of having its
        display visibility managed by CSS, the user will simply provide an "isOpen" boolean as a prop
    - The isOpen field should be managed by state or react hooks in the parent component, and will dynamically update the display
        in the modal
    - The reason for this this separate state managed modal is that it helps prevent bugs and other issues that can be caused by opening and closing the modal the previous way
    - The hope is to eventually integrate all of the current modals to use this new process
    

*/
const ModalStateDisplay = (props) => {
    return (
        props.isOpen && <div id={props.divId} className="modalStateManaged">
            <div className="noble-modal-content">
                <div className="MainContent Outer" style={{ minHeight: '503px' }}>
                    <div className="MainContent Inner">
                        <ContentBox
                            titleId={props.titleId}
                            titleString={props.titleString}
                            divId=""
                            headerButtons={props.headerButtons}
                            footerButtons={props.footerButtons}
                        >
                            {props.children}
                        </ContentBox>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalStateDisplay;

