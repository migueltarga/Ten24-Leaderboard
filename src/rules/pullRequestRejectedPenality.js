const { PULL_REQUEST_EVENT, OPENED }    = require('constants'),
        points                = require('../../config.example.json');

/**
 * Given an activity of type PULL_REQUEST_EVENT if it was open but rejected
 * subtract PR_CLOSED_REJECTED points otherwise zero
 * @param activity
 * @returns {{evaluate: (function())}}
 */
export default function (activity){
    return {
        evaluate: activity.type === PULL_REQUEST_EVENT? ()=> {
                //dementors law is being ignored here
                if( activity.payload.action === OPENED) {
                    return points.PR_CLOSED_REJECTED
                }
                else {
                    return 0;
                }

            }: ()=> 0
    }
}