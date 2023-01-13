import React from 'react';
import InlineError from './InlineError';

/* Used to display a group of errors.
 * 	- Pass in an array called errorMessages as a prop. This component will then iterate and
 * 		display each error message populated in the given array
*/

class ErrorGroup extends React.Component {
    render() {
        var errorComponents = [];
        var errorMessages = this.props.errorMessages || [];
        for(var i = 0; i < errorMessages.length; i++){
            errorComponents.push(<InlineError key={i} errorMessage={errorMessages[i]}/>);
        }
        return (
            <div>
                {errorComponents}
            </div>
        );
    }
}

export default ErrorGroup;