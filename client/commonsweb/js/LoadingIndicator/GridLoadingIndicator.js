import React from 'react';

class GridLoadingIndicator extends React.Component {
    render() {
        const loadingPanel = (
            <div className="k-loading-mask">
                <span className="k-loading-text">Loading</span>
                <div className="k-loading-image"></div>
                <div className="k-loading-color"></div>
            </div>
        );

        return this.props.actionCompleted ? null : loadingPanel;
    }
}

export default GridLoadingIndicator;