import React from 'react';

/* Used to dynamically display inline error messages. 
    If a non null or empty error message is passed in as a prop, it will render error in UI.
    Otherwise, null will be returned and nothing will be rendered
*/

const InlineError = (props) => {
    if(props.errorMessage){
        return(        
           <div className="errorInline">{props.errorMessage}</div>
        );
    }
    else{
        return null;
    }
    
  }

  export default InlineError;