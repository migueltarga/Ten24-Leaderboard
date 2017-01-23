const { Schema } = require('mongoose');

export default function createSchema(config){
    return new Schema(config,{
        timestamps: true
    });
}