const {require_rules} = require('./util'),
    flatten = require('lodash.flatten'),
    uniq = require('lodash.uniq'),
    difference = require('lodash.difference'),
    Activity = require('./src/models/activity'),
    User = require('./src/models/user'),
    Repository = require('./src/models/Repository');

export default function processor(activities) {
    return flatten(
        activities.map(
            activity => require_rules().map(
                (rule) => rule(activity)
            )
        )
    ).reduce(
        (previousValue, currentValue) => {
            let activity = currentValue.execute(),
                id = activity.activity_id;

            if (!previousValue.hasOwnProperty(activity.activity_id)) {
                previousValue[id] = activity;
            } else {
                previousValue[id].points += activity.points;
            }
            return previousValue
        },
        {}
    );
}

/**
 * Return just new users based on giving activities
 * It compares given users with db and return new instances of User Model from those that was not found
 * @param activities
 * @returns {Promise.<User[]>}
 */
export async function db_insert_users(activities){
    let keys = uniq(activities.map(
            activity => (activity.type ==  'PullRequestEvent'? activity.payload.pull_request.user.id : activity.actor.id)+''
        )
    );

    let db_users = (await User.find({user_id: {$in: keys}}))
        .map(
            user =>  user.user_id+''
        );

    return difference(keys, db_users)
        .map(repository => new Repository(repository));
}

/**
 * Return just new repositories based on giving activities
 * It compares given repositories with db and return new instances of Repository Model from those that was not found
 * @param activities
 * @returns {Promise.<Repository[]>}
 */
export async function db_insert_repositories(activities) {
    let keys = uniq(activities.map(
        activity => {
            return {
                repository_id: repo.id + '',
                name: activity.repo.name
            }
        }
    ));

    let db_repositories = (await Repository.find({repository_id: {$in: keys}}))
        .map(
            repository => {
                return {
                    repository_id: repository.repository_id,
                    name: repository.name
                }
            }
        );

    return difference(keys, db_repositories)
        .map(repository => new Repository(repository));
}

/**
 * Return just new activities base on giving activities
 * It compares given activities with db and return new instances of Activity Model from those that was not found
 * @param activities
 * @returns {Promise.<Activity[]>}
 */
export async function db_insert_activities(activities) {
    let keys = flatten(
        activities.map(
            activity => activity.payload.commits && activity.payload.commits.length ?
                activity.payload.commits.map(commit => commit.sha) : activity.id + ''
        )
    );

    let db_activities = (await Activity.find({activity_id: {$in: keys}}))
        .map(
            activity => activity.activity_id
        );

    return difference(keys, db_activities)
        .map(activity_id => new Activity({
            activity_id
        }));

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