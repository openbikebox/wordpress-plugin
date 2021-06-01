import React from 'react';
import PropTypes from 'prop-types';
import Resource from './Resource';
import {locationPropTypes} from './Models';

const ResourceList = (props) => {
    const {location} = props;
    return <div className="resourceList">
        {location.resource.map((resource, index) => <Resource key={'resource' + index} resource={resource}/>)}
    </div>;
};

ResourceList.propTypes = {
    location: PropTypes.shape(locationPropTypes).isRequired,
};

export default ResourceList;
