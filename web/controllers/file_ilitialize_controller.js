const fetch = require("node-fetch");
const {
  get_object_from_forge,
  create_bucket_in_forge,
  upload_object_to_forge,
  get_object_after_upload,
  get_bucket_details,
} = require("../../logic/File_initializing");

const fileInitialize = async (req, res) => {
  try {
    const filename = req.params.filename;

    const check_on_existing = await get_object_from_forge(
      req.oauth_token,
      filename
    );

    if (!!check_on_existing?.urn) {
      return res.json({ urn: check_on_existing.urn });
    }

    if (check_on_existing === "Bucket not found") {
      // TODO: handle create_buket and upload_object
      const create_bucket = await create_bucket_in_forge(
        req.oauth_token.access_token
      );

      // const check_bucket_create = await get_bucket_details(
      //   req.oauth_client,
      //   req.oauth_token
      // );

      if (create_bucket === "Bucket created") {
        const upload_object = await upload_object_to_forge(
          req.oauth_client,
          req.oauth_token,
          filename
        );
      }
    }

    if (check_on_existing === "Object not found") {
      // TODO: handle upload_object
      const upload_object = await upload_object_to_forge(
        req.oauth_client,
        req.oauth_token,
        filename
      );
    }

    const object = await get_object_after_upload(
      req.oauth_client,
      req.oauth_token,
      filename
    );

    return res.json({ urn: object.urn });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteBucket = async (req, res) => {
  const response = await fetch(
    `https://developer.api.autodesk.com/oss/v2/buckets/staticobjects`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${req.oauth_token.access_token}`,
      },
    }
  );
  console.log("delete-=-=-", response);
};

// const createBucket = async (req, res) => {
//   const response = await fetch(
//     `https://developer.api.autodesk.com/oss/v2/buckets`,
//     {
//       method: "POST",
//       headers: {
//         "Content-type": "application/json",
//         Authorization: `Bearer ${req.oauth_token.access_token}`,
//       },
//       body: JSON.stringify({
//         bucketKey: "staticobjects",
//         policyKey: "transient",
//       }),
//     }
//   );
//   console.log(response);
// };

module.exports = { fileInitialize, deleteBucket };
