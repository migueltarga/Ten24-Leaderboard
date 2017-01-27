const { PULL_REQUEST_EVENT, CLOSED }    = require('constants'),
    { activity_factory } = require( './util' ),
    { PR_MERGED } = require('../../config.example.json');

/**
 * If the activity is of type PULL_REQUEST_EVENT and action is CLOSED and it was merged
 * we give points.PR_MERGED, otherwise zero
 * @param activity_id
 * @param type
 * @param action
 * @param pull_request
 */
export default function ({ activity_id, type,payload: {action, pull_request}})
{
    return {
        evaluate: type === PULL_REQUEST_EVENT? ()=> {

                let points = ( action === CLOSED && pull_request.merged == true)? PR_MERGED: 0;

                return activity_factory(activity_id, points);

            }: ()=> activity_factory(activity_id)
    }
}