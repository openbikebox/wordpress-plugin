import PropTypes from "prop-types";
import {photoPropTypes} from "./photo";

export const operatorPropTypes = {
    address: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    created: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    id_url: PropTypes.string.isRequired,
    locality: PropTypes.string.isRequired,
    modified: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    postalcode: PropTypes.string.isRequired,
    logo: PropTypes.shape(photoPropTypes),
};
