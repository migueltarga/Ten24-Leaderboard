const {PULL_REQUEST_EVENT}    = require('constants'),
    points = require('../../config.example.json');


/**
 * If the activity is of type PULL_REQUEST_EVENT and we have commits we give points based in current character count
 * @param activity
 * @returns {{evaluate: (function():number)}}
 */
export default function (activity) {
    return {
        evaluate: activity.type === PULL_REQUEST_EVENT ? () => {
                //Have We commits?
                if (activity.payload.commits && activity.payload.commits.length) {
                    //for commits with less than 10 character we give a different weight
                    return activity.payload.commits.map( commit => (commit.message.length < 10) ? points.COMMIT_SHORT_DESCRIPTION : points.COMMITED )
                        .reduce( (last, actual)=> last+actual , 0 );
                }
                else {
                    return 0;
                }

            } : () => 0
    }
}
