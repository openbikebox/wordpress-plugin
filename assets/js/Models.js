import PropTypes from 'prop-types';

export const pricegroupPropTypes = {
    id: PropTypes.number,
    created: PropTypes.string,
    fee_hour: PropTypes.string,
    fee_day: PropTypes.string,
    fee_week: PropTypes.string,
    fee_month: PropTypes.string,
    fee_quarter: PropTypes.string,
    fee_year: PropTypes.string,
    fee_ten_years: PropTypes.string,
    modified: PropTypes.string,
};

export const photoPropTypes = {
    id: PropTypes.number,
    id_url: PropTypes.string,
    created: PropTypes.string,
    mimetype: PropTypes.string,
    url: PropTypes.string,
};

export const resourcePropTypes = {
    id: PropTypes.number,
    identifier: PropTypes.string,
    id_url: PropTypes.string,
    created: PropTypes.string,
    installed_at: PropTypes.string,
    modified: PropTypes.string,
    pricegroup: PropTypes.shape(pricegroupPropTypes),
    slug: PropTypes.string,
    status: PropTypes.oneOf(['free', 'reserved', 'taken', 'inactive']),
    unavailable_until: PropTypes.string,
    photo: PropTypes.shape(photoPropTypes),
    description: PropTypes.string,
};

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
