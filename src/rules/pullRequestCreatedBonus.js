const { PULLREQUESTEVENT }    = require('event'),
    { CLOSED }              = require('action'),
    points = require('../../config.example.json');

/**
 * If the activity is of type PULL_REQUEST_EVENT and action is CLOSED and it was merged
 * we give points.PR_MERGED, otherwise zero
 * @param activiy
 * @returns {{evaluate: (function())}}
 */
export default function (activity){
    return {
        evaluate: activiy.type === PULL_REQUEST_EVENT? ()=> {

                if( activity.payload.action === CLOSED && activity.payload.pull_request.merged == true) {
                    return points.PR_MERGED
                }
                else {
                    return 0;
                }

            }: ()=> 0
    }
}