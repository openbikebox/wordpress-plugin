import React from 'react';
import PropTypes from 'prop-types';
import {photoPropTypes, pricegroupPropTypes, resourcePropTypes} from './Models';
import PriceDisplay from './PriceDisplay';

const ImageContainer = (props) => {
    const {photo} = props;
    return <div>
        <img src={photo.url} alt={props.alt}/>
    </div>;
};

ImageContainer.propTypes = {
    photo: PropTypes.shape(photoPropTypes).isRequired,
    alt: PropTypes.string.isRequired,
};

const feeTimeMapping = {
    fee_hour: 'Stunde',
    fee_day: 'Tag',
    fee_moth: 'Monat',
    fee_year: 'Jahr',
};

const PricingContainer = (props) => {
    const {pricegroup} = props;
    return <table>
        <tbody>
        {Object.entries(feeTimeMapping).map(([index, name]) => {
                if (pricegroup[index])
                    return <tr key={index}>
                        <th scope="col">Preis pro {name}</th>
                        <td><PriceDisplay amount={pricegroup[index]}/></td>
                    </tr>;
            },
        )}
        </tbody>
    </table>;
};

PricingContainer.propTypes = {
    pricegroup: PropTypes.shape(pricegroupPropTypes).isRequired,
};

const Resource = (props) => {
    const {resource} = props;
    return <article className="resource">
        <h3 className="resourceHeader">{resource.identifier}</h3>
        {!!resource.photo &&
        <div className="resourcePhoto">
            <img src={resource.photo.url} alt={'Foto von ' + resource.identifier}/>
        </div>}
        <p className={resource.photo ? 'resourceDescription' : 'resourceDescription fullwidth'}>{resource.description}</p>
        <div className="resourceFoot">
            <PricingContainer pricegroup={resource.pricegroup}/>
            <span className="bookingLink"><a className="button is-success" href="#">Jetzt Buchen</a></span>
        </div>
    </article>;
};

Resource.propTypes = {
    resource: PropTypes.shape(resourcePropTypes),
};

export default Resource;
