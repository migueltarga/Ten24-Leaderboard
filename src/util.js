const fs = require('fs');

module.export = {
    require_rules : function(){
        fs.readdirSync('./rules')
            .filter(function (filename) {
                return filename.match(/[Bonus|Penality]\.js$/i);
            })
            .map(function (filename) {
                return require('./rules/' + filename);
            });
    },
    activity_factory(activity_id, points = 0){
        return {
            activity_id,
            points
        }
    }
};