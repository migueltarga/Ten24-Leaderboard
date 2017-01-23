const request = require('request');

//TODO: create a default interface to permit others implemenations
export default function apiRequest(resource){
    return new Promise( (resolve, reject) =>{
        request({
            url: `https://api.github.com/${ resource}`,
            json: true,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Basic ${this.token}`,
                'User-Agent': 'Ten24-Leaderboard'
            }
        }, (error, response, body)=>{
            if (!error && response.statusCode == 200) {
                resolve(body)
            }else{
                reject({response, error})
            }
        })
    });
}
