import React from 'react';
import { Menu } from '@progress/kendo-react-layout';
import { withRouter } from 'react-router-dom';

/*Represents the menu to be included in <TopBanner> component 

 - Pass in Kendo <MenuItem> components within <TopBannerMenu> component tags in order to have props.children render Menu Item components
*/

const TopBannerMenu = (props) => {

    const onSelect = (event) => {
        props.history.push(event.item.data.route);
    }

    return (
        <div id="topBannerMenuRow">
            <Menu onSelect={onSelect}>
                {props.children}
            </Menu>
        </div>
    );
}

export default withRouter(TopBannerMenu);