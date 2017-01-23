const mongoose = require('mongoose');
const { Model, Schema } = mongoose;

export default function create(config){
    return new Schema(config,{
        timestamps: true
    });
}