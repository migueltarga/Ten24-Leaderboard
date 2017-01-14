'use strict'

const mongoose = require('mongoose')
const { Model, Schema } = mongoose

class Activity extends Model {

	static schema () {
	    return new Schema({
			activity_id: String,
			type: String,
			description: String,
			points: Number,
			creator: { type: Schema.Types.ObjectId, ref: 'User' },
			repository: { type: Schema.Types.ObjectId, ref: 'Repository' }
		},{
			timestamps: true
		})
	}
	
}

module.exports = mongoose.model(Activity, Activity.schema())