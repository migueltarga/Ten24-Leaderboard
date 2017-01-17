'use strict'

const mongoose = require('mongoose')
const async = require('async')
const request = require('request')

const User = require('./model/user')
const Activity = require('./model/activity')
const Repository = require('./model/Repository')


const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

mongoose.connect('mongodb://localhost/leaderboard')
mongoose.Promise = global.Promise


const points = {
	PR_CLOSED_REJECTED: -3,
	COMMIT_SHORT_DESCRIPTION: -2,
	PUSH_DIRECT_TO_DEVELOP: -1,
	COMMITED : 1,
	PR_REVIEW_COMMENT: 1,
	PR_CREATED : 2,
	PR_MERGED: 5
}

class Worker {

	constructor(username, password) {
		console.log('Worker Created, username:', username);
		this.username = username
		this.token = new Buffer(username+':'+password).toString('base64')


		server.listen(2000)

		app.get('*', function (req, res) {
		  res.sendFile(__dirname + '/dashboard.html')
		})


		io.on('connection', (socket) =>{
			console.log('New Dashboard Connection');	
			this.buildOutput().then((data)=>{
				socket.emit('data', data)
			}).catch((err)=>{
				console.log('err', err)
			})
		})
		setInterval(()=> {
			this.buildOutput().then((data)=>{
				io.sockets.emit('data', data);
			})
		},30000)
		
		setInterval(function() {
			console.log("Checking Activities...")
			test.execute()
		}, 30000)

	}

	execute() {
		console.log('Getting Activities');
		this.getActivities()
		.then((activities)=>{
			console.log('Found '+ activities.length+' activities');
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
				console.log(error, body)
				if (!error && response.statusCode == 200) {
					console.log(body)
					resolve(body)
				}else{
					console.log(error)
					reject()
				}
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
		console.log('Processing activities');
		return new Promise( (resolve, reject) =>{
			async.eachSeries(activities,  (activity, callback) =>{
				var activityPoints = 0
				var currentActivity = new Activity({ activity_id : activity.id, type: activity.type })
				var currentUser;
				Activity.findOne({activity_id: activity.id})
				.then((obj)=>{
					console.log(((obj) ? 'Found' : 'Not Found!'), activity.type );
					return (obj) ? Promise.reject() : Promise.resolve()
				}).then(()=>{
					return Repository.findOneAndUpdate({ repository_id: activity.repo.id }, {$set: {name: activity.repo.name}}, {upsert:true, new:true})
				}).then((repo)=>{
					console.log('Found Repo', repo.name)
					currentActivity.repository = repo
					console.log('Find User', activity.actor);

					var authorID = activity.actor.id
					if(activity.type ==  'PullRequestEvent'){
						authorID = activity.payload.pull_request.user.id
					}
					return User.findOne({user_id: authorID})
				}).then((user)=>{
					if(!user){
						Promise.reject()
						return
					}
					currentUser = user
					console.log('Found USer', user.username);
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
						case 'PullRequestReviewCommentEvent':
							activityPoints = points.PR_REVIEW_COMMENT
						break
						case 'PullRequestReviewEvent':
							activityPoints = points.PR_REVIEW_COMMENT
						break
					}

					console.log(activity.type, activityPoints)
					currentActivity.creator = currentUser
					currentActivity.points = activityPoints
					return currentActivity.save()
				},()=>Promise.reject()).then((savedActivity)=>{
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

	buildOutput(){
		console.log('Generating & Sending current stats...')
		return new Promise( (resolve, reject) =>{
			console.log('1 - leaderboard')
			var output = {}
			User.find({},'username name avatar points').sort('-points')
			.then((leaderboard)=>{
				console.log('2 - Activity', leaderboard.length)
				output.leaderboard = leaderboard
				return Activity.find({}).populate('creator').populate('repository').sort('-createdAt').limit(5)
			}).then((activities)=>{
				output.activities = activities
				var start = new Date()
				start.setHours(0,0,0,0)
				var end = new Date()
				end.setHours(23,59,59,999)
				console.log('3 - Stats', activities.length)
				return Activity.aggregate([ 
					{ $match: { createdAt: {$gte: start, $lt: end } } },
					{ $group: { _id: "$type", total: {$sum: 1} } }
				])
			}).then((aggregate)=>{
				console.log('4 - proccess Stats')
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
					callback();
				},()=>{
					output.stats = stats
					resolve(output)
				})
				
			})
		})
	}

}

var test = new Worker('migueltarga','passowrd')



