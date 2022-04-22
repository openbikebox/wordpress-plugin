import PropTypes from "prop-types";
import {photoPropTypes} from "./photo";
import {pricegroupPropTypes} from "./pricegroup";

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