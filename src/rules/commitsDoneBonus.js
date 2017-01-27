const {PULL_REQUEST_EVENT}    = require('constants'),
    { activity_factory } = require( './util' ),
    {COMMIT_SHORT_DESCRIPTION, COMMITED} = require('../../config.example.json');


/**
 * If the activity is of type PULL_REQUEST_EVENT and we have commits we give points based in current character count
 * @param activity_id
 * @param type
 * @param commits
 * @returns {{evaluate: (function())}}
 */
export default function ({ activity_id, type, payload:{ commits } }) {
    return {
        evaluate: type === PULL_REQUEST_EVENT ? () => {
            let points = 0;
                //Have We commits?
                if (commits && commits.length) {
                    //for commits with less than 10 character we give a different weight
                    points =  commits.map(commit => (commit.message.length < 10) ? COMMIT_SHORT_DESCRIPTION : COMMITED)
                        .reduce((last, actual) => last + actual, 0);
                }

                return activity_factory(activity_id, points);

            } : () => activity_factory(activity_id)
    }
}
