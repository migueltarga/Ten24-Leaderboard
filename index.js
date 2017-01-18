'use strict'

const {points, github} = require('./config.json') 
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


class Worker {

	constructor(options) {
		console.log('Worker Created, username:', options.username);
		this.username = options.username
		this.token = new Buffer(options.username+':'+options.password).toString('base64');
		this.org = options.org;

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
		this.apiRequest('https://api.github.com/users/'+this.username+'/events/orgs/'+this.org)
		.then((activities)=>{
			console.log('Found '+ activities.length+' activities');
			return this.processActivities(activities)
		}).then((msg)=>{
			console.log(msg)
		}).catch((err)=>{
			console.log('Ops!', err)
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
			},()=>Promise.reject()).then((act)=>{
				currentUser.activities.push(act)
				currentUser.points += act.points
				return currentUser.save()
			}).then(()=>{
				callback()
			}).then(undefined, function(err){
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
					console.log(((obj) ? 'Activity Already Exists!' : 'New Activity: '), activity.type );
					return (obj) ? Promise.reject() : Promise.resolve()
				}).then(()=>{
					return Repository.findOneAndUpdate({ repository_id: activity.repo.id }, {$set: {name: activity.repo.name}}, {upsert:true, new:true})
				}).then((repo)=>{
					console.log('Found Repository', repo.name)
					currentActivity.repository = repo
					console.log('User Lookup', activity.actor.name);

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
					console.log('Found User: ', user.username);
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
					callback()
				}).then(undefined, function(err){
					callback()
				}).catch(()=>{
					callback()
				})
			}, (err)=> {
				return (err) ? reject(err) : resolve('Done!')
			})
		})
	}

	buildOutput(){
		console.log('Generating & Sending current stats...')
		return new Promise( (resolve, reject) =>{
			console.log('1 - Getting Leaderboard...')
			var output = {}
			User.find({},'username name avatar points').sort('-points')
			.then((leaderboard)=>{
				output.leaderboard = leaderboard
				return Activity.find({}).populate('creator').populate('repository').sort('-createdAt').limit(5)
			}).then((activities)=>{
				console.log('2 - Getting Activity...')
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
				console.log('3 - Getting Stats...')
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
					console.log('4 - Done!')
					output.stats = stats
					resolve(output)
				})
				
			})
		})
	}

	apiRequest(url){
		return new Promise( (resolve, reject) =>{
			request({
				url: url,
				json: true,
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'Authorization': 'Basic ' + this.token,
					'User-Agent': 'Ten24-Leaderboard'
				}
			}, (error, response, body)=>{
				if (!error && response.statusCode == 200) {
					resolve(body)
				}else{
					reject()
				}
			})
		});
	}

	syncUsers(){
		this.apiRequest('https://api.github.com/orgs/'+this.org+'/members')
		.then((members)=>{
			async.each(members, (member, callback) => {
				console.log('Member: ', member.login)
				User.findOne({user_id: member.id})
				.then((obj)=>{
					console.log(((obj) ? 'Member Already Exists!' : 'New Member!'));
					return (obj) ? Promise.reject() : Promise.resolve()
				}).then(()=>{
					return this.apiRequest('https://api.github.com/users/'+member.login)
				}).then((user)=>{
					console.log('Details Found', user.name)
					var newUser = new User({
						username: user.login,
						user_id: user.id,
						name: user.name,
						avatar: user.avatar_url,
						email: user.email,
						points: 0
					})
					return newUser.save()
				}).then(()=>{
					callback()
				}).catch(()=>{
					callback()
				})
			})
		})
	}
}

var test = new Worker(github)



