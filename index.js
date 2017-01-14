'use strict'

const mongoose = require('mongoose')
const async = require('async')
const request = require('request')

const User = require('./model/user')
const Activity = require('./model/activity')
const Repository = require('./model/Repository')

mongoose.connect('mongodb://localhost/leaderboard')
mongoose.Promise = global.Promise


const points = {
	PR_CLOSED_REJECTED: -3,
	COMMIT_SHORT_DESCRIPTION: -2,
	PUSH_DIRECT_TO_DEVELOP: -1,
  	COMMITED : 1,
  	PR_REVIEW: 1,
  	PR_CREATED : 2,
  	PR_MERGED: 5
}

class Worker {

	constructor(username, password) {
		this.username = username
		this.token = new Buffer(username+':'+password).toString('base64')
	}

	execute() {
		this.getActivities()
		.then((activities)=>{
			return this.processActivities(activities)
		}).then((msg)=>{
			console.log(msg)
		}).catch((err)=>{
			console.log('Ops!', err)
		})
	}

	getActivities() {
		return new Promise( (resolve, reject) =>{
			request({
			  url: 'https://api.github.com/users/'+this.username+'/events/orgs/ten24',
			  json: true,
			  headers: {
			    'Accept': 'application/vnd.github.v3+json',
			    'Authorization': 'Basic '+this.token,
			    'User-Agent': 'Ten24-Leaderboard'
			  }
			}, (error, response, body)=>{
				if (!error && response.statusCode == 200) {
					resolve(body)
				}else{
					console.log(error)
					reject()
				}
			})
		})
	}

	findOrCreateRepo(id, name){
		return new Promise( (resolve, reject) =>{
			Repository.findOne({repository_id: id}).then((obj)=>{
		    	if(obj){
		    		resolve(obj)
		    		return
		    	}
		    	var newRepo = new Repository({
		    		repository_id: id,
		    		name:name
		    	})
		    	newRepo.save((err)=>{
		    		return (err) ? reject(err) : resolve(newRepo)
		    	})
		    })
		})
	}

	proccessCommits(commits, repo){
		async.eachSeries(commits, function (commit, callback) {
			var currentUser
			var commitActivity = new Activity({ 
				activity_id : commit.sha,
				type: 'Commit',
				repository: repo,
				description: commit.message,
				points: (commit.message.length < 10) ? points.COMMIT_SHORT_DESCRIPTION : points.COMMITED
			})

			Activity.findOne({activity_id: commit.sha})
			.then((obj)=>{
				return (obj) ? Promise.reject() : Promise.resolve()
		    }).then(()=>{
				return User.findOne({username: commit.author.name})
			}).then((user)=>{
				currentUser = user
				commitActivity.creator = user
				return commitActivity.save()
			}).then((act)=>{
				currentUser.activities.push(act)
				currentUser.points += act.points
				return currentUser.save()
			}).then(()=>{
				callback()
			}).catch(()=>{
				callback()
			})
		})
	}

	processActivities(activities) {
		return new Promise( (resolve, reject) =>{
			async.eachSeries(activities,  (activity, callback) =>{
				var activityPoints = 0
				var currentActivity = new Activity({ activity_id : activity.id, type: activity.type })
				var currentUser;
				Activity.findOne({activity_id: activity.id})
				.then((obj)=>{
					return (obj) ? Promise.reject() : Promise.resolve()
			    }).then(()=>{
			    	return Repository.findOneAndUpdate({ repository_id: activity.repo.id }, {$set: {name: activity.repo.name}}, {upsert:true, new:true})
				}).then((repo)=>{
					currentActivity.repository = repo
					return User.findOne({user_id: activity.actor.id})
				}).then((user)=>{
					if(!user){
						Promise.reject()
						return
					}
					currentUser = user
					switch(activity.type){
						case 'PushEvent':
							if(activity.payload.ref == 'refs/heads/develop'){
								activityPoints	= points.PUSH_DIRECT_TO_DEVELOP
							}
							if(activity.payload.commits && activity.payload.commits.length){
								this.proccessCommits(activity.payload.commits, currentActivity.repository)
							}
						break
						case 'PullRequestEvent':
							if(activity.payload.action == "closed" && activity.payload.pull_request.merged == true){
								activityPoints	= points.PR_MERGED
							}else if(activity.payload.action == "closed" && activity.payload.pull_request.merged == false){
								activityPoints	= points.PR_CLOSED_REJECTED
							}else if(activity.payload.action == "opened" ){
								activityPoints	= points.PR_CREATED
							}

							currentActivity.description = activity.payload.pull_request.title
						break
						// case 'PullRequestReviewCommentEvent':
						// 	activityPoints = points.PR_REVIEW
						// break
					}

					console.log(activity.type, activityPoints)
					currentActivity.creator = currentUser
					currentActivity.points = activityPoints
					return currentActivity.save()
				}).then((savedActivity)=>{
					currentUser.points += savedActivity.points
					currentUser.activities.push(savedActivity)
					return currentUser.save()
				}).then((suc2)=>{
			    	callback(null)
			    }).catch(()=>{
			    	callback(null)
			    })
			}, (err)=> {
				return (err) ? reject(err) : resolve('Done!')
			})
		})
	}

//I will refactor this...
	// syncUsers(){
	// 	var members = require('./members.json')
	// 	async.each(members, (member, callback) => {
		
	// 		User.findOne({user_id: member.id}).then((obj)=>{
	//     		if(!obj){
	//     			request({
	// 			  		url: 'https://api.github.com/users/'+member.login,
	// 			  		json: true,
	// 			  		headers: {
	// 			    		'Accept': 'application/vnd.github.v3+json',
	// 			    		'Authorization': 'Basic '+this.token,
	// 			    		'User-Agent': 'Ten24-Leaderboard'
	// 			  		}
	// 				}, (error, response, body)=>{
	// 					console.log('Member: ', member.login)
	// 					console.log('dont exists')
	// 					if (!error && response.statusCode == 200) {
	// 						console.log('Found', body.name)
	// 						var newUser = new User({
	// 							username: body.login,
	// 							user_id: body.id,
	// 							name: body.name,
	// 							avatar: body.avatar_url,
	// 							email: body.email,
	// 							points: 0
	// 						})
	// 						newUser.save()
	// 					}else{
	// 						console.log(error, body)
	// 					}
	// 				})
	//     		}
	//     	})
	// 	})
	// }
}

var test = new Worker('migueltarga','mypassword')


var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)

server.listen(2000)

app.get('*', function (req, res) {
  res.sendFile(__dirname + '/dashboard.html')
})


function buildOutput(){
	return new Promise( (resolve, reject) =>{
		var output = {}
		User.find({},'username name avatar points').sort('-points')
		.then((leaderboard)=>{
			output.leaderboard = leaderboard
			return Activity.find({}).populate('creator').populate('repository').sort('-createdAt').limit(5)
		}).then((activities)=>{
			output.activities = activities

			var start = new Date()
			start.setHours(0,0,0,0)

			var end = new Date()
			end.setHours(23,59,59,999)

			return Activity.aggregate([ 
				{ $match: { createdAt: {$gte: start, $lt: end } } },
				{ $group: { _id: "$type", total: {$sum: 1} } }
			])

		}).then((aggregate)=>{
			var stats = {
				activity : 0,
				commit : 0,
				pullrequest: 0,
				review: 0
			}
			async.each(aggregate, (agg, callback) => {
				stats.activity += agg.total
				if(agg._id == 'PullRequestEvent'){
					stats.pullrequest = agg.total
				}else if(agg._id == 'Commit'){
					stats.commit = agg.total
				}
			},()=>{
				output.stats = stats
				resolve(output)
			})
			
		})
	})
}

io.on('connection', function (socket) {

	buildOutput().then((data)=>{
		socket.emit('data', data)
	})

	setInterval(function() {
		buildOutput().then((data)=>{
			socket.emit('data', data)
		})
	},60000)
})

setInterval(function() {
	console.log("Checking Activities...")
	test.execute()
}, 30000)


// setInterval(function() {
//   console.log("Checking Members...")
//   test.syncUsers()
// }, (12 * 60 * 60 * 1000))



