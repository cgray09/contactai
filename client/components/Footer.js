import React from 'react';
import { FormattedMessage } from 'react-intl';

//this is the content under the content box. This will include copyright and version

const Footer = (props) => {
    const versionMsg = 'Version ' + props.version;
    const copyright = new Date().getFullYear() + 'Noble Systems Corporation';
    return (
      <div className="LoginVersionLabel" style={{width: props.width}}>
        <span>
          &copy; <FormattedMessage id="footer.copyright" 
                    defaultMessage= {copyright}/>
        </span>
        <span className="version">
            <FormattedMessage id="footer.version" 
              defaultMessage= {versionMsg}/>
        </span>
      </div>
    );
  }

  export default Footer;