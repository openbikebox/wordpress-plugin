import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {requestJsonPost} from './Helpers';

const RequestStatus = {
    idle: 1,
    requestOpenRunning: 2,
    requestOpenSuccess: 3,
    requestOpenFailed: 4,
    requestCloseRunning: 5,
    requestCloseSuccess: 6,
    requestCloseFailed: 7
}

const ThankYou = (props) => {
    const [requestStatus, setRequestStatus] = useState(RequestStatus.idle);

    const openResource = () => {
        if (requestStatus !== RequestStatus.idle)
            return;
        setRequestStatus(RequestStatus.requestOpenRunning);
        setTimeout(() => {
            if (RequestStatus.requestOpenRunning === requestStatus)
                setRequestStatus(RequestStatus.idle)
        }, 2000);
        requestJsonPost(props.url + '/api/v1/action/open', {session: props.session, request_uid: props.requestUid, uid: props.uid})
            .then(data => {
                setRequestStatus((data.status === 0) ? RequestStatus.requestOpenSuccess : RequestStatus.requestOpenFailed);
                setTimeout(() => setRequestStatus(RequestStatus.idle), 3000);
            })
    }

    const closeResource = () => {
        if (requestStatus !== RequestStatus.idle)
            return;
        setRequestStatus(RequestStatus.requestCloseRunning)
        setTimeout(() => {
            if (RequestStatus.requestCloseRunning === requestStatus)
                setRequestStatus(RequestStatus.idle)
        }, 2000);
        requestJsonPost(props.url + '/api/v1/action/close', {session: props.session, request_uid: props.requestUid, uid: props.uid})
            .then(data => {
                setRequestStatus((data.status === 0) ? RequestStatus.requestCloseSuccess : RequestStatus.requestCloseFailed);
                setTimeout(() => setRequestStatus(RequestStatus.idle), 3000);
            })
    }

    const getIcon = classes => <i className={`fa ${classes}`} style={{marginLeft: '20px'}} />;

    const cancelAction = () => {
        requestJsonPost(props.url + '/api/v1/action/cancel', {session: props.session, request_uid: props.requestUid, uid: props.uid, booked: true})
            .then(data => {
                window.location = props.locationUrl
            })
    }

    return <>
        <div className={`columns control resource-id-${props.resourceId} location-id-${props.locationId}`}>
            <div className="column is-6" style={{marginBottom: 30}}>
                <button
                    onClick={closeResource}
                    className={`button is-fullwidth is-danger`}
                >
                    schliessen
                    {requestStatus === RequestStatus.requestCloseRunning && getIcon('fa-spinner fa-spin fa-fw')}
                    {requestStatus === RequestStatus.requestCloseSuccess && getIcon('fa-check-circle')}
                    {requestStatus === RequestStatus.requestCloseFailed && getIcon('fa-exclamation-circle')}
                </button>
            </div>
            <div className="column is-6">
                <button
                    onClick={openResource}
                    className={`button is-fullwidth is-success`}
                >
                    öffnen
                    {requestStatus === RequestStatus.requestOpenRunning && getIcon('fa-spinner fa-spin fa-fw')}
                    {requestStatus === RequestStatus.requestOpenSuccess && getIcon('fa-check-circle')}
                    {requestStatus === RequestStatus.requestOpenFailed && getIcon('fa-exclamation-circle')}
                </button>
            </div>
        </div>
        {props.expositionMode === 'on' && <div className="columns control">
            <div className="column is-6" style={{marginTop: 50, marginBottom: 30}}>
                <button
                    onClick={cancelAction}
                    className={`button is-fullwidth is-success`}
                >Messe-Reset</button>
            </div>
        </div>}
    </>
}

ThankYou.propTypes = {
    url: PropTypes.string,
    session: PropTypes.string,
    requestUid: PropTypes.string,
    uid: PropTypes.string,
    expositionMode: PropTypes.string,
    locationUrl: PropTypes.string,
    resourceId: PropTypes.string,
    locationId: PropTypes.string
}

export default ThankYou;