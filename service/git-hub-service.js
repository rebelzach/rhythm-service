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
  addJournalEntry: function () {
    github.authenticate({ type: "oauth", token: githubToken });

    github.repos.getContent(
      {
        user: "rebelzach",
        repo: "Zach-Starkebaum",
        path: "/journal/2015-09-06.md"
      },
      function(err, res) {
        var content = new Buffer(res.content, 'base64').toString("ascii");
        var date = moment.tz(new Date(), "America/Denver").format("YYYY-MM-DD");
        var filename = date + ".md";
        content += "\nEvent:" +  + ":\n";
        console.log(content);
      }
    );
  }


}
