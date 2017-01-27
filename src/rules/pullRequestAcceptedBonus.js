const { PULL_REQUEST_EVENT, CLOSED }    = require('constants'),
    { activity_factory } = require( './util' ),
    {PR_MERGED} = require('../../config.example.json');

/**
 * If the activity is of type PULL_REQUEST_EVENT and payload.action is CLOSED and pull_request was merged
 * we give points.PR_MERGED points otherwise zero
 * @param activity_id
 * @param type
 * @param action
 * @param merged
 */
export default function ({ activity_id, type, payload:{action, pull_request: merged } }){
    return {
        evaluate: type === PULL_REQUEST_EVENT? ()=> {

            let points = action === CLOSED && merged == true? PR_MERGED : 0;

            return activity_factory(activity_id, points);

        }: ()=> activity_factory(activity_id)
    }
}