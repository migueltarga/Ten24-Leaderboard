'use strict'

const mongoose = require('mongoose'),
	{ Model } = mongoose,
	factory = require('schemaFactory'),
	{ User } = require('user'),
	{ Repository } = require('repository');

export class Activity extends Model {

	static get schema () {
        return factory({
            activity_id: String,
            type: String,
            description: String,
            points: Number,
            creator: { type: Schema.Types.ObjectId, ref: User.name },
            repository: { type: Schema.Types.ObjectId, ref: Repository.name }
        });
	}
}

export default mongoose.model( Activity, Activity.schema );