const fetch = require("node-fetch");
const {
  BucketsApi,
  ObjectsApi,
  DerivativesApi,
  JobPayload,
  JobPayloadInput,
  JobPayloadOutput,
  JobSvfOutputPayload,
} = require("forge-apis");
const fs_prom = require("fs/promises");
const sleep = (t) => new Promise((r) => setTimeout(r, t));
const bucketKey = "staticobjects";

const get_object_from_forge = async (oauth_token, filename) => {
  // const file_exist_check = await fs_prom
  //   .access(`./static_models/${filename}`, fs.F_OK)
  //   .catch((error) => error);
  // if (file_exist_check instanceof Error) {
  //   return "local fond is undefned";
  // }

  const response = await fetch(
    `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${filename}/details`,
    {
      method: "get",
      headers: {
        Authorization: `Bearer ${oauth_token.access_token}`,
      },
    }
  );
  if (response.status === 200) {
    const data = await response.json();
    return { urn: Buffer.from(data.objectId).toString("base64") };
  } else if (response.status >= 400) {
    const response_data = await response.json();
    if (response_data.reason === "Bucket not found") {
      return "Bucket not found";
    }
    if (response_data.reason === "Object not found") {
      return "Object not found";
    }
  }
};

const create_bucket_in_forge = async (access_token) => {
  try {
    const response = await fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          bucketKey,
          policyKey: "transient",
        }),
      }
    );
    if (response.status === 200) {
      return "Bucket created";
    }
    const data = await response.json();
    console.log(data);
    return "Can not create the bucket";
  } catch (error) {
    console.log(error);
  }
};

const upload_object_to_forge = async (oauth_client, oauth_token, filename) => {
  const data = await fs_prom.readFile(`./static_models/${filename}`);
  const uploadObject = await new ObjectsApi().uploadObject(
    bucketKey,
    filename,
    data.length,
    data,
    {},
    oauth_client,
    oauth_token
  );
  if ("objectId" in uploadObject) {
    return "Object uploaded";
  }
};

// TODO: ObjectsApi().getObjectDetails may throw error because you have to wrrap this function in try/catch
const get_object_after_upload = async (oauth_client, oauth_token, filename) => {
  const check = async (count = 0) => {
    if (count >= 30) {
      return "Timeout";
    }
    const object = await new ObjectsApi().getObjectDetails(
      bucketKey,
      filename,
      {},
      oauth_client,
      oauth_token
    );
    if (object === undefined) {
      await sleep(5000);
      return check(count + 1);
    }

    return object.body;
  };

  const outputFile = await check();

  const Job = async () => {
    let job = new JobPayload();
    job.input = new JobPayloadInput();
    job.input.urn = Buffer.from(outputFile.objectId).toString("base64");
    // When compresed file rootFileName = main file name
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
      return response;
    } catch (err) {
      return res.status(400).json(FileInitializeError.TranslationError());
    }
  };
  const finish_Job = await Job();
  return { urn: finish_Job.body.urn };
};

const get_bucket_details = async (oauth_client, oauth_token) => {
  const respones = await fetch(
    `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/details`,
    {
      method: "get",
      headers: {
        Authorization: `Bearer ${oauth_token.access_token}`,
      },
    }
  );

  if (respones.status === 200) {
    const data = await respones.json();
    return data;
  }
  if (respones.status >= 400) {
    const data = await respones.json();
    return data;
  }

  //   const bucket = await new BucketsApi().getBucketDetails(
  //     "staticobjects",
  //     {},
  //     oauth_client,
  //     oauth_token
  //   );
  //   console.log(bucket);
  //   return bucket;
};

module.exports = {
  get_object_from_forge,
  create_bucket_in_forge,
  upload_object_to_forge,
  get_object_after_upload,
  get_bucket_details,
};
