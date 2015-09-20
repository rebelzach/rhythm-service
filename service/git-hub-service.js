var nconf = require('nconf');
nconf.env()
.file({ file: 'config.json', search: true });
var githubToken = nconf.get("GITHUB_TOKEN");
var moment = require('moment-timezone');

var GitHubApi = require("github");

var github = new GitHubApi({
  version: "3.0.0",
  debug: true,
  protocol: "https",
  timeout: 5000,
  headers: {
    "user-agent": "Rhythms App"
  }
});

module.exports = GitHubJournaler;

function GitHubJournaler() {

};

GitHubJournaler.prototype = {
  addEventEntry: function (eventMessage, callback) {
    github.authenticate({ type: "oauth", token: githubToken });

    var date = moment.tz(new Date(), "America/Denver");
    var formattedDay = date.format("YYYY-MM-DD");
    var filename = formattedDay + ".md";

    github.repos.getContent(
      {
        user: "rebelzach",
        repo: "Zach-Starkebaum",
        path: "journal/" + filename
      },
      function(error, res) {
        var shouldCreateFile = false;
        if (error) {
          if (error.code === 404) {
            console.log("got 404");
            shouldCreateFile = true;
          } else {
            callback (error);
            return;
          }
        }
        var content = "";
        if (!shouldCreateFile) {
          content = new Buffer(res.content, 'base64').toString("ascii");;
          content += "\n";
        }
        var formattedTime = date.format("h:mm a");
        content += "Event: " + formattedTime + " - " + eventMessage + "\n";
        console.log(content);
        var content64 = new Buffer(content).toString('base64');
        if (shouldCreateFile) {
          github.repos.createFile(
            {
              user: "rebelzach",
              repo: "Zach-Starkebaum",
              path: "journal/" + filename,
              message: "Journal Event",
              content: content64,
            },
            function(error, createRes) {callback(error);}
          );
        } else {
          github.repos.updateFile(
            {
              user: "rebelzach",
              repo: "Zach-Starkebaum",
              path: "journal/" + filename,
              message: "Journal Event",
              content: content64,
              sha: res.sha,
            },
            function(error, updateRes) {callback(error);}
          );
        }
      }
    );
  }
}
