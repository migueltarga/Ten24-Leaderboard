const { PULL_REQUEST_REVIEW_COMMENT_EVENT }    = require('constants'),
        points = require('../../config.example.json');

/**
 * If activity is of type PULL_REQUEST_REVIEW_COMMENT_EVENT we give points.PR_REVIEW_COMMENT otherwise zero
 * @param activity
 * @returns {{evaluate: function():number}}
 */
export default function (activity){
    return {
        evaluate: activiy.type === PULL_REQUEST_REVIEW_COMMENT_EVENT? ()=> points.PR_REVIEW_COMMENT : ()=> 0
    }
}