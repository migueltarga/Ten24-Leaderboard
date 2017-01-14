'use strict'

const mongoose = require('mongoose')
const { Model, Schema } = mongoose

class Repository extends Model {

	static schema () {
	    return new Schema({
			repository_id: { type: Number, required: true, unique: true },
			name: String,
			activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }]
		},{
			timestamps: true
		})
	}
	
}

module.exports = mongoose.model(Repository, Repository.schema())