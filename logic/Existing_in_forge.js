const fetch = require("node-fetch");
const fs_prom = require("fs/promises");
const { Utils } = require("../routes/utils");

const ExistingInForge = async (oauth_token, ObjectInfo) => {
  const bucketKey = Utils.NickName.toLowerCase() + "-designautomation";

  const file_name = await fs_prom
    .readFile(
      `./static_models/models_information/${ObjectInfo.FileName}/${ObjectInfo.ParamsFileName}.txt`,
      "utf8"
    )
    .catch((error) => "error");
  if (file_name !== "error") {
    const response = await fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${file_name}/details`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${oauth_token.access_token}`,
        },
      }
    );
    if (response.status === 200) {
      const data = await response.json();
      return {
        urn: Buffer.from(data.objectId).toString("base64"),
      };
    }
    if (response.status >= 400) {
      fs_prom.unlink(
        `./static_models/models_information/${ObjectInfo.FileName}/${ObjectInfo.ParamsFileName}.txt`
      );
      // return "Object with params not found in forge";
    }
  }
  return "Object with params not found in forge";
};

module.exports = { ExistingInForge };
