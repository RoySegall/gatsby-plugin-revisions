const fs = require('fs');
const path = require('path');
const ncp = require("ncp");
const { spawn } = require("child_process");

exports.onCreateDevServer = ({ app, reporter, options }, pluginOptions) => {
  console.log(options)
  const revisionsPath = path.join(process.cwd(), 'revisions');
  const publicPath = path.join(process.cwd(), 'public');

  reporter.success('Gatsby revision plugin is ready');

  app.get('/revisions', function(req, res) {
    // Return the list of directories, i.e: revisions.
    const directories = fs.readdirSync(revisionsPath);
    res.send(directories);
  })

  app.post('/revision-revert/:revision', function(req, res) {
    const revision = req.params.revision;
    ncp(path.join(revisionsPath, revision), publicPath);

    res.status(200).send({message: `The revision ${revision} has been reverted.`});
  })

  app.post('/revision', function (req, res) {
    console.log(pluginOptions.eventsAddressBroadcast);

    const revisionTimeStamp = Date.now();

    const ls = spawn('npm', ['run', 'build']);

    ls.stderr.on('data', (data) => {
      // Send here a failure event.
    });

    ls.on('close', (code) => {
      if (!fs.existsSync(revisionsPath)) {
        // The revision folder does not exists.
        fs.mkdirSync(revisionsPath);
      }

      // No limit, because why not?
      ncp.limit = 0;

      const futureRevisionFolder = `${revisionsPath}/${revisionTimeStamp}`;
      ncp(publicPath, futureRevisionFolder);

      // Send the success.
    });

    res.send({message: 'Revision will be created', revisionId: revisionTimeStamp})
  })
}
