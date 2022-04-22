import PropTypes from "prop-types";

export const userLocalPropTypes = {
    type: PropTypes.oneOf(['customer', 'anonymous', 'admin']),
    locations: PropTypes.arrayOf(PropTypes.number),
}