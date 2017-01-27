const { PULL_REQUEST_REVIEW_COMMENT_EVENT }    = require('constants'),
        { activity_factory } = require( './util' ),
    { PR_REVIEW_COMMENT } = require('../../config.example.json');

/**
 * If activity is of type PULL_REQUEST_REVIEW_COMMENT_EVENT we give points.PR_REVIEW_COMMENT otherwise zero
 * @param activity_id
 * @param type
 */
export default function ({activity_id, type}){
    return {
        evaluate: type === PULL_REQUEST_REVIEW_COMMENT_EVENT?
            ()=> activity_factory(activity_id, PR_REVIEW_COMMENT) :
            ()=> activity_factory(activity_id)
    }
}