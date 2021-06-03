import React from 'react';
import PropTypes from 'prop-types';
import ResourceListItem from './ResourceListItem';
import {locationPropTypes} from './Models';

const ResourceList = (props) => {
    const {location} = props;
    return <>
        <h2>{location.name} buchen</h2>
        <div className="resource-list">
            {location.resource.map((resource, index) => <ResourceListItem key={'resource' + index} resource={resource}/>)}
        </div>
    </>;
};

ResourceList.propTypes = {
    location: PropTypes.shape(locationPropTypes).isRequired,
};

export default ResourceList;
