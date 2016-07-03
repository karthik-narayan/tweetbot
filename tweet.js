var restclient = require('node-restclient');
var Twit = require('twit');
var app = require('express').createServer();
var id = '';
var data ='';
var debug=true;
var time=480000; //Sleep time between retries

//Array of links to be used in the replies
var tamillinks =["https://www.youtube.com/watch?v=k7mObPkrNiE&t=170s",
"https://www.youtube.com/watch?v=hIrc0rsMmeI&t=157s"
];


// Update with your info
var tweet = new Twit({
consumer_key:         "YOUR DATA", 
consumer_secret:      "YOUR DATA",
access_token:         "YOUR DATA",
access_token_secret:  "YOUR DATA"
});


//generic read from fileName and store result in var id
function readFromFile(fileName){

	fs.readFile(fileName, function (err,data) {
			if (err) {
			return console.log(err);
			}
			id= data;
			});
}

//Generic write to file
function writeToFile(fileName,dataToWrite){

	fs.writeFile(fileName, dataToWrite, function (err) {
			if (err) 
			return console.log(err);
			if (debug){
			console.log('Wrote ' + dataToWrite +' to ' +fileName +' and saved it!');
			}
			});
}


// Function that pulls it all together
function sendTweet(user,query,linklist) {

	//Read from a file named "user". This file contains the id_str value of the last tweet from the user that matches the query. 
	readFromFile(user, function (err) {
			if (err) 
			return console.log(err);        
			});
	if (debug) console.log("File contains:" +id);

	//Search twitter users tweets for query terms, since id read from the file
	tweet.get('search/tweets', { q: query , since_id:id , from: '@'+user , count: 100 }, function(err, data, response) {

			if (data.statuses.length > 0){
			if (id != data.statuses[0].id_str){
			id = data.statuses[0].id_str;
			if (debug) console.log("Found a new tweet by @"+user +": "+ data.statuses[0].text);

			writeToFile(user,data.statuses[0].id_str, function (err) {
				if (err) 
				return console.log(err);  
				});
			var randomno=Math.floor(Math.random() * linklist.length);
			if (debug) console.log(  "@" + user + " --> " +linklist[randomno]+ " in_reply_to_status_id:"+id)
			tweet.post("statuses/update", { status: "@" + user + " --> " +linklist[randomno], in_reply_to_status_id: id},function(err, reply) {
				if(err) console.log("error code: " + err.statusCode + " message was " + err.twitterReply);

				console.log("reply: " + reply);
				});
			}
			else if (debug){
			console.log ("No new tweets found");
			}
			process.stdout.write("*");
			}

	}) 

}

fs = require('fs');
app.get('/', function(req, res){
		res.send('Hello world.');
		});
app.listen(process.env.PORT || 3000);


setInterval(function() 
		{
		try { //sendTweet(user name, search terms, tweet from list);
		sendTweet('anantha', 'votha OR #cityouter OR #cityouterle OR #crie', tamillinks);}
		catch (e) {console.log(e);}
		},time);
