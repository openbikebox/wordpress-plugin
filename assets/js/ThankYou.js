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
    const [requestStatus, setRequestStatus] = useState();

    const openResource = () => {
        if (requestStatus !== RequestStatus.idle)
            return;
        setRequestStatus(RequestStatus.requestOpenRunning)
        requestJsonPost(props.url + '/api/v1/action/open', {session: props.session, request_uid: props.request_uid, uid: props.uid})
            .then(data => {
                setRequestStatus((data.status === 0) ? RequestStatus.requestOpenSuccess : RequestStatus.requestOpenFailed);
                setTimeout(() => setRequestStatus(RequestStatus.idle), 3000);
            })
    }

    const closeResource = () => {
        if (requestStatus !== RequestStatus.idle)
            return;
        setRequestStatus(RequestStatus.requestCloseRunning)
        requestJsonPost(props.url + '/api/v1/action/close', {session: props.session, request_uid: props.request_uid, uid: props.uid})
            .then(data => {
                setRequestStatus((data.status === 0) ? RequestStatus.requestCloseSuccess : RequestStatus.requestCloseFailed);
                setTimeout(() => setRequestStatus(RequestStatus.idle), 3000);
            })
    }

    return <div className="columns control">
        <div className="column is-6">
            <button
                onClick={closeResource}
                className={`button is-fullwidth is-success`}
            >
                schliessen{' '}
                {requestStatus === RequestStatus.requestCloseRunning && <i className="fa fa-spinner fa-spin fa-fw"></i>}
                {requestStatus === RequestStatus.requestCloseSuccess && <i className="fa fa-check-circle" aria-hidden="true"></i>}
                {requestStatus === RequestStatus.requestCloseFailed && <i className="fa fa-exclamation-circle" aria-hidden="true"></i>}
            </button>
        </div>
        <div className="column is-6">
            <button
                onClick={openResource}
                className={`button is-fullwidth is-success`}
            >
                öffnen{' '}
                {requestStatus === RequestStatus.requestOpenRunning && <i className="fa fa-spinner fa-spin fa-fw"></i>}
                {requestStatus === RequestStatus.requestOpenSuccess && <i className="fa fa-check-circle" aria-hidden="true"></i>}
                {requestStatus === RequestStatus.requestOpenFailed && <i className="fa fa-exclamation-circle" aria-hidden="true"></i>}
            </button>
        </div>
    </div>
}

ThankYou.propTypes = {
    url: PropTypes.string,
    session: PropTypes.string,
    request_uid: PropTypes.string,
    uid: PropTypes.string
}

export default ThankYou;