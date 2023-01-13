import React from 'react';
import ContentBox from '../Content/ContentBox';

/*Modal component is essentially a wrapper around the ContentBox component. This turns the ContentBox into a pop-up or modal form
   It will require the same props as the ContentBox component in order to pass them to the ContentBox child component
   
   Props to provide Modal component
        - titleId: content box's header title. Should pass in an id representing a string value in a resource file and its localized string value will be displayed.
                    If the id doesn't exist the id value itself will be displayed
        - titleString: if you don't have an id to pass for localization, use the titleString instead to pass in a static string title
        - divId: Identifier for the Modal
        - headerButtons: *Optional* any buttons to include in ContentBox header
        - footerButtons: *Optional* any buttons to include in ContentBox footer
        - props.children will render any tags or components put within the <Modal></Modal> tag
*/
const Modal = (props) => {
    return (
        <div id={props.divId} className="modal">
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

export default Modal;

