const { require_rules } = require( './util' ) ;
    flatten = require('lodash.flatten');

export default function activities_processor(activities){
    return flatten(
        activities.map(
            activity =>  require_rules().map(
                (rule)=> rule(activity)
            )
        )
    ).reduce(
        (previousValue, currentValue)=> {
            let activity = currentValue.execute(),
                id = activity.activity_id;

            if(! previousValue.hasOwnProperty(activity.activity_id)  ){
                previousValue[id] = activity;
            } else {
                previousValue[id].points+= activity.points;
            }
            return previousValue
        },
        {}
    );
}

/*

Processor{

    constructor(orchestrator, {org, username, password}){
        this._orchestraotr  = orchestrator;
        //why? Just because using destructors help auto-complete and it doesn't hurt performance
        this._configuration = {org,username,password};
    }


}
*/