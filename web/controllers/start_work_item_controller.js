const { ExistingInForge } = require("../../logic/Existing_in_forge");
const { createActivity } = require("../../logic/Create_activity");
const { createAppBundle } = require("../../logic/Create_app_bundle");
const { StartWorkItem } = require("../../logic/Start_work_item");

const startWorkitem = async (req, res) => {
  const workItemData = JSON.parse(req.body.data);
  // \/Socket.io connection id \/
  const browerConnectionId = workItemData.browerConnectionId;

  if (req.params.filename === "revit_sample_file.rvt") {
    const widthParam = parseFloat(workItemData.width);
    const heightParam = parseFloat(workItemData.height);
    const ParamsFileName = `height_${heightParam},width_${widthParam}`;
    var ObjectInfo = {
      BundleName: "UpdateRVTParam",
      EngineName: "Autodesk.Revit+2019",
      FileName: "revit_sample_file.rvt",
      ParamsFileName: ParamsFileName,
    };
    var IndividualParams = { width: widthParam, height: heightParam };
  }

  if (req.params.filename === "inventor_sample_file.ipt") {
    const widthParam = parseFloat(workItemData.width);
    const heightParam = parseFloat(workItemData.height);
    const ParamsFileName = `height_${heightParam},width_${widthParam}`;
    var ObjectInfo = {
      BundleName: "UpdateIPTParam",
      EngineName: "Autodesk.Inventor+2019",
      FileName: "inventor_sample_file.ipt",
      ParamsFileName: ParamsFileName,
    };
    var IndividualParams = { width: widthParam, height: heightParam };
  }

  // Step: 1 checking object with params for existence
  const Check_in_Forge = await ExistingInForge(req.oauth_token, ObjectInfo);
  if (Check_in_Forge !== "Object with params not found in forge") {
    return res.json(Check_in_Forge);
  }

  // TODO: checker for createAppbundle function ( example: Check_in_Forge )
  // Step: 2 create appBundle in forge server
  await createAppBundle(
    req.oauth_token,
    ObjectInfo.BundleName,
    ObjectInfo.EngineName
  );

  // TODO: checker for createActivity function ( example: Check_in_Forge )
  // Step: 3 create activity in forge server
  await createActivity(
    req.oauth_token,
    ObjectInfo.BundleName,
    ObjectInfo.EngineName
  );

  // TODO: checker for workItemStatus function ( example: Check_in_Forge )
  // Step: 4 request forge server for design automation
  const workItemStatus = await StartWorkItem(
    req.oauth_client,
    req.oauth_token,
    ObjectInfo,
    IndividualParams,
    browerConnectionId
  );

  res.status(200).json({
    workItemId: workItemStatus.id,
  });
};

module.exports = { startWorkitem };
