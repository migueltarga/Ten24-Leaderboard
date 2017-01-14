'use strict'

const mongoose = require('mongoose')
const { Model, Schema } = mongoose

class User extends Model {

	static schema () {
	    return new Schema({
			username: { type: String },
			user_id: { type: Number, unique: true },
			name: String,
			avatar: String,
			email: { type: String },
			activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
		  	points: { type: Number, default: 0 }
		},{
			timestamps: true
		})
	}
	
}

module.exports = mongoose.model(User, User.schema())
