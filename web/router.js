const _path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const { getClient } = require("../routes/common/oauth");
const { Utils } = require("../routes/utils");
const config = require("../config");

router.use(bodyParser.json());

router.use(async (req, res, next) => {
  req.oauth_client = await getClient(config.scopes.internal);
  req.oauth_token = req.oauth_client.getCredentials();
  next();
});

router.get("/appbundles", async (req, res) => {
  let bundles = await Utils.findFiles(Utils.LocalBundlesFolder, ".zip");
  bundles = bundles.map((fn) => _path.basename(fn, ".zip"));
  res.json(bundles);
});

{
  // Designe autmation
  const { onCallback } = require("./controllers/on_call_back_controller");
  const { startWorkitem } = require("./controllers/start_work_item_controller");
  const {
    fileInitialize,
    deleteBucket,
    // createBucket,
  } = require("./controllers/file_ilitialize_controller");

  router.get("/forge/fileinitialize/:filename", fileInitialize);

  router.get("/forge/deletebucket", deleteBucket);

  // router.get("/forge/createbucket", createBucket);

  router.post("/forge/designautomation/workitems/:filename", startWorkitem);

  router.post("/forge/callback/designautomation", onCallback);
}

module.exports = router;
