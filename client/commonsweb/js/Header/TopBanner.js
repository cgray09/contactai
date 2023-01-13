import React from 'react';
import { FormattedMessage } from 'react-intl';

/*Represents the Noble Systems banner at the top of the page 
  
  *Note* - Make sure banner.title is set within the resource file used for this project
  props.children will display any menu items included in top banner. These should be <TopBannerMenuItem> components
*/

const TopBanner = (props) => {
  return (
    <div className="topBanner">
      <div className="topBannerTitleBar">
        <label className="topBannerLabel">
          <FormattedMessage id="banner.title" />
        </label>
      </div>
      <div className="topBannerLogo"></div>
      <div className="topBannerMenuContainer">
        <div className="topBannerMenu k-widget k-reset k-header k-menu k-menu-horizontal" style={{display: "block"}}>
            {props.children}
        </div>
      </div>
    </div>
  );
}

export default TopBanner;