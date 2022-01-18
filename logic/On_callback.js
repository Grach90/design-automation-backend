// const http = require("https");
const fetch = require("node-fetch");
const {
  DerivativesApi,
  JobPayload,
  JobPayloadInput,
  JobPayloadOutput,
  ObjectsApi,
  JobSvfOutputPayload,
} = require("forge-apis");
const { Utils } = require("../routes/utils");
const fs_prom = require("fs/promises");
const OnCallBackError = require("../routes/errors/onCallBack_error");

const OnCallBack = async (oauth_client, oauth_token, bodyJson, query) => {
  const socketIO = require("../start").io;

  // const bodyJson = req.body;

  // http.get(bodyJson.reportUrl, (response) => {
  //   response.setEncoding("utf8");
  //   let rawData = "";
  //   response.on("data", (chunk) => {
  //     rawData += chunk;
  //   });
  //   response.on("end", () => {});
  // });

  const bucketKey = Utils.NickName.toLowerCase() + "-designautomation";

  if (bodyJson.status === "success") {
    try {
      // const signedUrl = await ObjectsApi.createSignedResource(
      //   bucketKey,
      //   query.outputFileName,
      //   {
      //     minutesExpiration: 10,
      //     singleUse: false,
      //   },
      //   {
      //     access: "read",
      //   },
      //   oauth_client,
      //   oauth_token
      // );

      try {
        const response = await fetch(
          `	https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${query.outputFileName}/details`,
          {
            headers: {
              Authorization: `Bearer ${oauth_token.access_token}`,
            },
          }
        );
        const outputFileUrn = await response.json();

        if (outputFileUrn == undefined) {
          return OnCallBackError.NotFound();
        }

        const Job = async () => {
          let job = new JobPayload();
          job.input = new JobPayloadInput();
          job.input.urn = Buffer.from(outputFileUrn.objectId).toString(
            "base64"
          );
          // if (req.body.rootFileName != undefined) {
          //   job.input.rootFilename = req.body.rootFileName;
          //   job.input.compressedUrn = true;
          // }

          job.output = new JobPayloadOutput([new JobSvfOutputPayload()]);
          job.output.formats[0].type = "svf";
          job.output.formats[0].views = ["2d", "3d"];

          try {
            const response = await new DerivativesApi().translate(
              job,
              {},
              oauth_client,
              oauth_token
            );

            socketIO
              .to(query.id)
              .emit("onComplete", { urn: response.body.urn });

            return "ok";
          } catch (err) {
            console.log(err);
            return err;
          }
        };

        await Job();

        return "OnCallBack success";
      } catch (error) {
        console.log("-=-=-=-", error);
        return "OnCallBack error";
      }
    } catch (ex) {
      console.log("Error-=-=-", ex);
      socketIO
        .to(query.id)
        .emit(
          "onComplete",
          "Failed to create presigned URL for outputFile.\nYour outputFile is available in your OSS bucket."
        );
    }
  }
};

const save_information_in_base = async (
  inputFileName,
  info_file_name,
  outputFileName
) => {
  if (
    (await fs_prom
      .stat(`./static_models/models_information/${inputFileName}`)
      .catch((err) => "error")) === "error"
  ) {
    await fs_prom.mkdir(`./static_models/models_information/${inputFileName}`);
  }

  await fs_prom.writeFile(
    `./static_models/models_information/${inputFileName}/${info_file_name}`,
    outputFileName
  );
  return "Information file created";
};

module.exports = { OnCallBack, save_information_in_base };
