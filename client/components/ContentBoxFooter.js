import React from 'react';

/*Included in ContentBox component
    - Optional: Can receive action buttons as a prop to display in footer
*/

const ContentBoxFooter = (props) => {
    return(
        <div className="contentBoxFooter">
            {props.footerButtons}
        </div>
    );
}

export default ContentBoxFooter;