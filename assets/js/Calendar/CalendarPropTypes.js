import PropTypes from 'prop-types';

export const rawBookingPropTypes = {
    begin: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
}

export const convertedBookingPropTypes = {
    begin: PropTypes.object.isRequired,
    end: PropTypes.object.isRequired,
};
