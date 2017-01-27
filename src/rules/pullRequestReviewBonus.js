const { PULL_REQUEST_REVIEW_EVENT }    = require('constants'),
    { activity_factory } = require( './util' ),
    { PR_REVIEW_COMMENT } = require('../../config.example.json');


/**
 * Given an activity if it was of type PULL_REQUEST_REVIEW_EVENT give PR_REVIEW_COMMENT points otherwise zero
 * @param activity
 * @returns {{evaluate: *}}
 */
export default function ({activity_id, type}){
    return {
        evaluate: type === PULL_REQUEST_REVIEW_EVENT? ()=> activity_factory(activity_id, PR_REVIEW_COMMENT)
            : ()=> activity_factory(activity_id)
    }
}