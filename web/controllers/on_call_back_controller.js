const {
  DerivativesApi,
  JobPayload,
  JobPayloadInput,
  JobPayloadOutput,
  ObjectsApi,
  JobSvfOutputPayload,
} = require("forge-apis");

const {
  OnCallBack,
  save_information_in_base,
} = require("../../logic/On_callback");

const onCallback = async (req, res) => {
  res.status(200).end();

  const check_on_callBack = await OnCallBack(
    req.oauth_client,
    req.oauth_token,
    req.body,
    req.query
  );

  if (check_on_callBack === "OnCallBack success") {
    const info_file_name = `height_${req.query.height},width_${req.query.width}.txt`;

    const check_save_file = await save_information_in_base(
      req.query.inputFileName,
      info_file_name,
      req.query.outputFileName
    );
    if (check_save_file !== "Information file created") {
      // TODO: handle error
      console.log(check_save_file);
    }
  }
};

module.exports = { onCallback };
