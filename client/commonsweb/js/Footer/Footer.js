import React from 'react';
import { FormattedMessage } from 'react-intl';

/* Footer component is used to display copyright and version information
    Requires the following as props
      - width: We'll likely have the footer below the ContentBox component, so want the passed in width
                to match up with that
      - version: The version number for the application
*/

const Footer = (props) => {
    return (
      <div className="LoginVersionLabel" style={{width: props.width}}>
        <span>
          &copy; {new Date().getFullYear()} <FormattedMessage id="footer.copyright"
            defaultMessage="Noble Systems Corporation" />
        </span>
        <span className="version">
        <FormattedMessage id="footer.version" defaultMessage='Version'/> {props.version}
        </span>
      </div>
    );
  }

  export default Footer;