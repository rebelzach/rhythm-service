var nconf = require('nconf');
nconf.env()
.file({ file: 'config.json', search: true });
var githubToken = nconf.get("GITHUB_TOKEN");

var GitHubApi = require("github");

var github = new GitHubApi({
  // required
  version: "3.0.0",
  // optional
  debug: true,
  protocol: "https",
  // host: "rhythms.azurewebsites.com",
  // pathPrefix: "/api/v3",
  timeout: 5000,
  headers: {
    "user-agent": "Rhythms App" // GitHub is happy with a unique user agent
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
        console.log(content);
      }
    );
  }


}
