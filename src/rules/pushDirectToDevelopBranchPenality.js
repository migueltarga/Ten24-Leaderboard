const DEVELOP_BRANCH = 'refs/heads/develop',
    { PUSHEVENT } = require('event'),
    points = require('../../config.example.json');


/**
 * Given an activity of type PUSHEVENT, if it was on DEVELOP_BRANCH subtract points.PUSH_DIRECT_TO_DEVELOP points
 * otherwise zero
 * @param activity
 * @returns {{evaluate: (function())}}
 */
export default function (activity){
    return {
        evaluate: activity.payload.ref === DEVELOP_BRANCH? ()=>{
            if(activity.type === PUSHEVENT ){
                //maybe it is not necessary anymore
                return points.PUSH_DIRECT_TO_DEVELOP;
            } else {
                return 0;
            }
        }: ()=> 0
    }
}
