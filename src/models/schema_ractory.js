const { Schema } = require('mongoose');

export default function schema_factory(config){
    return new Schema(config,{
        timestamps: true
    });
}