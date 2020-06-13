const fs = require('fs');
const path = require('path');
const ncp = require("ncp");
const { execSync } = require("child_process");

exports.onCreateDevServer = ({ app }) => {
  const revisionsPath = path.join(process.cwd(), 'revisions');
  const publicPath = path.join(process.cwd(), 'public');

  app.get('/revisions', function(req, res) {
    const files = fs.readdirSync(revisionsPath);
    res.send(files);
  })

  app.post('/revision-revert/:revision', function(req, res) {
    const revision = req.params.revision;
    ncp(path.join(revisionsPath, revision), publicPath);
    res.send('reverted');
  })

  app.post('/revision', function (req, res) {
    execSync('gatsby build');

    if (!fs.existsSync(publicPath)) {
      // The public path does not exists. Skip.
      return;
    }

    if (!fs.existsSync(revisionsPath)) {
      // The revision folder does not exists.
      fs.mkdirSync(revisionsPath);
    }

    // No limit, because why not?
    ncp.limit = 0;

    const futureRevisionFolder = `${revisionsPath}/${Date.now()}`;
    ncp(publicPath, futureRevisionFolder);

    res.send('hello world')
  })
}
