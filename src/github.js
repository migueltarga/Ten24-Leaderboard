const request = require('request');

//TODO: create a default interface to permit others implemenations
export default function githubFetch(resource, {username, password}){

    const token = new Buffer(`${username}:${password}`).toString('base64');

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
            if (!error && response.statusCode === 200) {
                resolve(body)
            }else{
                reject({response, error})
            }
        })
    });
}
