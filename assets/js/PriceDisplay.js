import React from 'react';
import PropTypes from 'prop-types';

const PriceDisplay = (props) => {
    let {amount} = props;
    if (typeof amount === 'number') {
        amount = amount.toString();
    }

    let parts = amount.split('.');
    if (parts.length > 1) {
        let decimals = parts[1];
        if (decimals.length > 2) {
            decimals = decimals.substr(0, 2);
        } else if (decimals.length === 1) {
            decimals = decimals + '' + 0;
        }
        amount = parts[0] + ',' + decimals;
    } else {
        amount = amount.replace('.', ',');
    }
    return amount + ' €';
};

PriceDisplay.propTypes = {
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default PriceDisplay;
