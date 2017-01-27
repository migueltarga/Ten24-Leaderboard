const mongoose 		= require('mongoose'),
    factory 		= require('schemaFactory'),
    { Model } 		= mongoose,
	{ Activity }	= require('activity');

export class Repository extends Model {
    static get schema () {
        return factory({
            repository_id: { type: Number, required: true, unique: true },
            name: String,
            activities: [{ type: Schema.Types.ObjectId, ref: Activity.name }]
        });
    }
}

export default mongoose.model( Repository, Repository.schema );