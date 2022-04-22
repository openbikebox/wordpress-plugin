import PropTypes from "prop-types";
import {operatorPropTypes} from "./operator";
import {resourcePropTypes} from "./recource";
import {photoPropTypes} from "./photo";


export const locationPropTypes = {
    address: PropTypes.string.isRequired,
    booking_url: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    locality: PropTypes.string.isRequired,
    modified: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    operator: PropTypes.shape(operatorPropTypes).isRequired,
    operator_id: PropTypes.number.isRequired,
    postalcode: PropTypes.string.isRequired,
    resource: PropTypes.arrayOf(PropTypes.shape(resourcePropTypes)),
    slug: PropTypes.string.isRequired,
    twentyfourseven: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['cargobike', 'bikebox']).isRequired,
    photo: PropTypes.shape(photoPropTypes),
    photo_id: PropTypes.number,
    description: PropTypes.string,
};


export const locationMinimalPropTypes = {
    booking_url: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    id_url: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    ressource_count: PropTypes.number.isRequired,
    photo: PropTypes.shape(photoPropTypes),
    slug: PropTypes.string.isRequired,
};

export const locationLocalPropTypes = {
    id: PropTypes.number.isRequired,
    wordpress_id: PropTypes.number.isRequired,
    visibility: PropTypes.oneOf(['public', 'hidden', 'login']),
    payment: PropTypes.arrayOf(PropTypes.oneOf(['paypal', 'coupon'])),
}
