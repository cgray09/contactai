import React from 'react';

/*This is simply a custom grid header cell which can be used when needing to add a tooltip, since this is not available to do directly via kendo
   This comes in handy when having a lot of columns in a grid and column titles start getting truncated */
   class HeaderTooltip extends React.Component {
    render() {
        return (
            <a className="k-link" onClick={this.props.onClick}>
            <span title={this.props.title}>{this.props.title}</span>
                {this.props.children}
            </a>
        );
    }
  }

export default HeaderTooltip;