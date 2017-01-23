const { PULL_REQUEST_REVIEW_EVENT }    = require('event'),
    points = require('../../config.example.json');


/**
 * Given an activity if it was of type PULL_REQUEST_REVIEW_EVENT give PR_REVIEW_COMMENT points otherwise zero
 * @param activity
 * @returns {{evaluate: *}}
 */
export default function (activity){
    return {
        evaluate: activity.type === PULL_REQUEST_REVIEW_EVENT? ()=> points.PR_REVIEW_COMMENT : ()=> 0
    }
}