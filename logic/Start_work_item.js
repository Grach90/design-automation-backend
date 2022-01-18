const ForgeAPI = require("forge-apis");
const _path = require("path");
const dav3 = require("autodesk.forge.designautomation");
const queryString = require("query-string");
const config = require("../config");
const { Utils } = require("../routes/utils");

const StartWorkItem = async (
  oauth_client,
  oauth_token,
  ObjectInfo,
  IndividualParams,
  browerConnectionId
) => {
  const bucketKey = Utils.NickName.toLowerCase() + "-designautomation";
  // upload file to OSS Bucket
  try {
    let payload = new ForgeAPI.PostBucketsPayload();
    payload.bucketKey = bucketKey;
    payload.policyKey = "transient"; // expires in 24h
    await new ForgeAPI.BucketsApi().createBucket(
      payload,
      {},
      oauth_client,
      oauth_token
    );
  } catch (ex) {
    // in case bucket already exists
  }

  const inputFileArgument = {
    url: `https://developer.api.autodesk.com/oss/v2/buckets/staticobjects/objects/${ObjectInfo.FileName}`,
    headers: {
      Authorization: `Bearer ${oauth_token.access_token}`,
    },
  };

  const inputJsonArgument = {
    url:
      "data:application/json, " +
      JSON.stringify(IndividualParams).replace(/"/g, "'"),
  };

  // Better to use a presigned url to avoid the token to expire
  const outputFileNameOSS = `${new Date()
    .toISOString()
    .replace(/[-T:\.Z]/gm, "")}_${_path.basename(ObjectInfo.FileName)}`; // avoid overriding
  let signedUrl = null;
  try {
    signedUrl = await new ForgeAPI.ObjectsApi().createSignedResource(
      bucketKey,
      outputFileNameOSS,
      {
        minutesExpiration: 60,
        singleUse: true,
      },
      {
        access: "write",
      },
      oauth_client,
      oauth_token
    );
    signedUrl = signedUrl.body.signedUrl;
  } catch (ex) {
    console.error(ex);
    return "Failed to create a signed URL for output file";
  }

  const outputFileArgument = {
    url: signedUrl,
    headers: {
      Authorization: "",
      "Content-type": "application/octet-stream",
    },
    verb: dav3.Verb.put,
  };

  const activityName = `${Utils.NickName}.${ObjectInfo.BundleName}Activity+dev`;

  const callbackUrl = `${await config.credentials
    .webhook_url}/api/forge/callback/designautomation?id=${browerConnectionId}&outputFileName=${outputFileNameOSS}&inputFileName=${
    ObjectInfo.FileName
  }&${queryString.stringify(IndividualParams)}`;
  const workItemSpec = {
    activityId: activityName,
    arguments: {
      inputFile: inputFileArgument,
      inputJson: inputJsonArgument,
      outputFile: outputFileArgument,
      onComplete: {
        verb: dav3.Verb.post,
        url: callbackUrl,
      },
    },
  };

  let workItemStatus = null;
  try {
    const api = await Utils.dav3API(oauth_token);
    workItemStatus = await api.createWorkItem(workItemSpec);
  } catch (ex) {
    console.error(ex);
    return "Failed to create a workitem";
  }

  return {
    id: workItemStatus.id,
  };
};

module.exports = { StartWorkItem };
