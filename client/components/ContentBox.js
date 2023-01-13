import React from 'react';
import ContentBoxHeader from './ContentBoxHeader';
import ContentBoxFooter from './ContentBoxFooter';

/* The ContentBox is the container that holds the content to display. Ex) a form, a message, etc. 
    It consists of a ContentBoxHeader, its content to render (props.children), and a ContentBoxFooter
  
  Can provide the following props
    - titleId: content box's header title. Should pass in an id representing a string value in a resource file and its localized string value will be displayed.
        If the id doesn't exist the id value itself will be displayed
    - titleString: if you don't have an id to pass for localization, use the titleString instead to pass in a static string title
    - divId: represents the unique div id value of content box instance
    - headerButtons: These represent any buttons that want to be included in the content box header. Not required.
    - footerButtons: These represent any buttons that want to be included in the content box footer. Not required.

    Optional: May pass in an array with navHistory of url's and labels to display in Content Box Header
    Ex) navHistory - [{url: "/", label: "home"},{url: "/teams", label: "Teams"}]
    - This would display in the header as hyper links in the following format
        - Home > Teams

    Purpose of this is so that a user can navigate backwards

    *NOTE* props.children will render any tags or components included within the <ContentBox> tags. This represents the actual content.
*/

const ContentBox = (props) => {
return (
    <div className="contentBox">
        <ContentBoxHeader titleId={props.titleId} titleString={props.titleString} navHistory={props.navHistory} headerButtons={props.headerButtons}/>
            <div id={props.divId} className="contentBoxContent zebrastripe">
                <div className="k-content k-state-active" style={{ opacity: 1, display: 'block' }}>
                    {props.children}
                </div>
            </div>
        <ContentBoxFooter footerButtons={props.footerButtons} />
    </div>
);
}

export default ContentBox;
