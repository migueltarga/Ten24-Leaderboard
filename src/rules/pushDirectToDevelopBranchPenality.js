const DEVELOP_BRANCH = 'refs/heads/develop',
    { PUSH_EVENT } = require('constants'),
    { activity_factory } = require( './util' ),
    { PUSH_DIRECT_TO_DEVELOP } = require('../../config.example.json');


/**
 * Given an activity of type PUSHEVENT, if it was on DEVELOP_BRANCH subtract points.PUSH_DIRECT_TO_DEVELOP points
 * otherwise zero
 * @param activity
 */
export default function ({payload:ref, type, activity_id}){
    return {
        evaluate: ref === DEVELOP_BRANCH? ()=>{

            let points = type === PUSH_EVENT? PUSH_DIRECT_TO_DEVELOP: 0;
            return activity_factory(activity_id, points);

        }: ()=> activity_factory(activity_id)
    }
}
