const fs = require('fs');
const path = require('path');
const ncp = require("ncp");
const { spawn } = require("child_process");
const axios = require("axios");

exports.onCreateDevServer = ({ app, reporter }, pluginOptions) => {
  const revisionsPath = path.join(process.cwd(), 'revisions');
  const publicPath = path.join(process.cwd(), 'public');

  const notifyEventListener = (data) => {

    if (!pluginOptions.eventsAddressBroadcast) {
      return;
    }

    axios.post(pluginOptions.eventsAddressBroadcast, data).then((response) => {
      reporter.success('The event has been arrived to the listener');
    }, (error) => {
      reporter.error(error);
    });
  };

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
    const revisionTimeStamp = Date.now();

    const ls = spawn('npm', ['run', 'build']);

    ls.stderr.on('data', (data) => {
      reporter.error(`An error during creating the revision: ${data}`);

      notifyEventListener({
        event: 'revision_creation',
        status: 'failed',
        revisionId: revisionTimeStamp,
        data: data,
      });
    });

    ls.on('close', (code) => {
      reporter.success(`The build process for the revision ${revisionTimeStamp} completed.`);

      if (!fs.existsSync(revisionsPath)) {
        // The revision folder does not exists.
        reporter.success(`The revision folder was created since it was not.`);
        fs.mkdirSync(revisionsPath);
      }

      // No limit, because why not?
      ncp.limit = 0;

      const futureRevisionFolder = `${revisionsPath}/${revisionTimeStamp}`;
      ncp(publicPath, futureRevisionFolder);

      reporter.success(`The complied site has been copied to ${revisionTimeStamp}.`);

      notifyEventListener({
        event: 'revision_creation',
        status: 'succeeded',
        revisionId: revisionTimeStamp,
      });
    });

    reporter.success(`A revision will be created with the id ${revisionTimeStamp}`);

    res.send({message: 'Revision will be created', revisionId: revisionTimeStamp})
  })
}
