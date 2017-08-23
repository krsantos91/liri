
//NODE COMMAND LINE INPUTS
var method = process.argv[2];
var searchQuery = '';
for (i=3; i<process.argv.length; i++ ){
    searchQuery += (process.argv[i] + ' ');
}
searchQuery = searchQuery.trim();
var ignore = false;

//SPOTIFY LIBRARY AND API
var Spotify = require('node-spotify-api');
Spotify = new Spotify({
    id: process.env.SPOTIFY_ID,
    secret: process.env.SPOTIFY_SECRET
});

//OMDB LIBRARY AND API
var req = require('request');
var omdb = {
    key: process.env.OMDB_API_KEY
}

//TWITTER LIBRARY AND API
const Twitter = require('twitter');
const twitterAPI = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// FILE WRITE LIBRARY
var fs = require('fs');

switch(method){
    case "spotify-this-song":
        sptfy();
        break;
    case "movie-this":
        movie();
        break;
    case "my-tweets":
        tweet();
        break;
    case "do-what-it-says":
        actionFromFile();
        break;
    default:
        console.log('Not a valid command: use "spotify-this-song", "movie-this", "my-tweets", or "do-what-it-says"');
        break;
};

// LOG ACTIVITY INTO FILE CALLED LOG.TXT
fs.appendFile('log.txt',(method + ': ' + searchQuery + ', '),function(err){
    if (err){
        console.log(err);
        return;				
    }else{
        console.log('command history appended to log.txt');
    };
});

function sptfy() {
    if (process.argv.length < 4 && ignore === false){
        searchQuery = "The Sign";
    };
    Spotify.search({type:'track', query: searchQuery, limit: 1},function(err,data){
        if (err) {
            return console.log('Error occurred: ' + err);
        }else{
            console.log('Song name: ' + data.tracks.items[0].name);
            console.log('Artist(s): ' + data.tracks.items[0].artists[0].name);
            console.log('Preview this song: ' + data.tracks.items[0].preview_url);
            console.log('Album: ' + data.tracks.items[0].album.name)
        };
    });
}

function movie(){
    if (process.argv.length < 4 && ignore === false){
        searchQuery = "Mr. Nobody";
    };
    req("http://www.omdbapi.com/?t="  + searchQuery + "&y=&plot=short&apikey="+ omdb.key, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            console.log('Title: ' + JSON.parse(body).Title);
            console.log('The release year for '+ searchQuery + ' is: ' + JSON.parse(body).Year);
            console.log('IMDB rating: ' + JSON.parse(body).Ratings[0].Value);
            console.log('Rotten Tomatoes rating: ' + JSON.parse(body).Ratings[1].Value);
            console.log('Language: ' + JSON.parse(body).Language);            
            console.log("Plot: " + JSON.parse(body).Plot)
            console.log("Actors: " + JSON.parse(body).Actors)
          }
        });
}

function tweet(){
    if (process.argv.length < 4 && ignore === false ){
        twitter_params = {screen_name:'ksaaaaantos'};        
    } else{
        twitter_params = {screen_name: searchQuery};
    };
    twitterAPI.get('statuses/user_timeline', twitter_params, function(error, tweets, response) {
        if(!error) {
            for(tweet in tweets) {
                console.log(tweets[tweet].text);
                console.log(tweets[tweet].created_at);
            }
        };
    })
}

function actionFromFile(){
    ignore = true;
    fs.readFile('random.txt','utf8',function(err,data){
        var args = data.split(',');
        method = args[0];
        searchQuery = args[1];
        switch(method){
            case "spotify-this-song":
                sptfy();
                break;
            case "movie-this":
                movie();
                break;
            case "my-tweets":
                tweet();
                break;
            default:
                console.log('Not a valid command: use "spotify-this-song", "movie-this", "my-tweets", or "do-what-it-says"');
                break;
        };
        ignore = false;
    });
}
