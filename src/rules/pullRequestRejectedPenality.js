const { PULL_REQUEST_EVENT, OPENED }    = require('constants'),
    { activity_factory } = require( './util' ),
    {PR_CLOSED_REJECTED}                = require('../../config.example.json');

/**
 * Given an activity of type PULL_REQUEST_EVENT if it was open but rejected
 * subtract PR_CLOSED_REJECTED points otherwise zero
 * @param type
 * @param action
 * @returns {{evaluate: (function())}}
 */
export default function ({activity_id, type, payload: action}){
    return {
        evaluate: type === PULL_REQUEST_EVENT? ()=> {
                let points =  action === OPENED? PR_CLOSED_REJECTED: 0;
                return activity_factory(activity_id, points);
            }: ()=> activity_factory(activity_id)
    }
}