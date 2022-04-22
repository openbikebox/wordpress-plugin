import React from 'react';
import PropTypes from 'prop-types';
import {photoPropTypes} from '../models/photo';
import {pricegroupPropTypes} from '../models/pricegroup';
import {resourcePropTypes} from '../models/recource';
import PriceDisplay from '../components/PriceDisplay';

const ImageContainer = props => {
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
    fee_ten_years: '10 Jahre',
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

const ResourceListItem = (props) => {
    const {resource} = props;
    return <article className="resource">
        <h3 className="resource-header">{resource.identifier}</h3>
        {!!resource.photo &&
        <div className="resource-photo">
            <img src={resource.photo.url} alt={'Foto von ' + resource.identifier}/>
        </div>}
        <p className={resource.photo ? 'resource-description' : 'resource-description fullwidth'}>{resource.description}</p>
        <div className="resource-foot">
            <PricingContainer pricegroup={resource.pricegroup}/>
            <span className="booking-link"><a className="button is-success" href={'/resource/' + resource.slug}>Jetzt Buchen</a></span>
        </div>
    </article>;
};

ResourceListItem.propTypes = {
    resource: PropTypes.shape(resourcePropTypes),
};

export default ResourceListItem;
