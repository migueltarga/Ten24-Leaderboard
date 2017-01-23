const DEVELOP_BRANCH        = 'refs/heads/develop',
    { PULLREQUESTEVENT }    = require('event'),
    { CLOSED }              = require('action'),
    points = require('../../config.example.json');


/**
 * If the activity is of type PULL_REQUEST_EVENT and payload.action is CLOSED and pull_request was merged
 * we give points.PR_MERGED points otherwise zero
 * @param activity
 * @returns {{evaluate: (function():number)}}
 */
export default function (activity){
    return {
        evaluate: activity.type === PULL_REQUEST_EVENT? ()=> {

            if( activity.payload.action === CLOSED && activity.payload.pull_request.merged == true) {
                return points.PR_MERGED
            }
             else {
                return 0;
            }

        }: ()=> 0
    }
}