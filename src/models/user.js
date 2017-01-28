const mongoose = require('mongoose'),
    { Model } = mongoose,
    factory = require('schema_factory'),
	{ Activity } = require('activity');

export class User extends Model {

    static get schema () {
        return factory({
            username: { type: String },
            user_id: { type: Number, unique: true },
            name: String,
            avatar: String,
            email: { type: String },
            activities: [{ type: Schema.Types.ObjectId, ref: Activity.name }],
            points: { type: Number, default: 0 }
        });
    }
}

export default mongoose.model( User, User.schema );