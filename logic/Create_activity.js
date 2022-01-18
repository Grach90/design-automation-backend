const dav3 = require("autodesk.forge.designautomation");
const { Utils } = require("../routes/utils");

const createActivity = async (oauth_token, Zipname, Engine) => {
  // standard name for this sample
  const appBundleName = Zipname + "AppBundle";
  const activityName = Zipname + "Activity";

  // get defined activities
  const api = await Utils.dav3API(oauth_token);
  let activities = null;
  try {
    activities = await api.getActivities();
  } catch (ex) {
    console.error(ex);
    return {
      diagnostic: "Failed to get activity list",
    };
  }
  const qualifiedActivityId = `${Utils.NickName}.${activityName}+${Utils.Alias}`;
  if (!activities.data.includes(qualifiedActivityId)) {
    // define the activity
    // ToDo: parametrize for different engines...
    const engineAttributes = Utils.EngineAttributes(Engine);
    const commandLine = engineAttributes.commandLine.replace(
      "{0}",
      appBundleName
    );
    const activitySpec = {
      id: activityName,
      appbundles: [`${Utils.NickName}.${appBundleName}+${Utils.Alias}`],
      commandLine: [commandLine],
      engine: Engine,
      parameters: {
        inputFile: {
          description: "input file",
          localName: "$(inputFile)",
          ondemand: false,
          required: true,
          verb: dav3.Verb.get,
          zip: false,
        },
        inputJson: {
          description: "input json",
          localName: "params.json",
          ondemand: false,
          required: false,
          verb: dav3.Verb.get,
          zip: false,
        },
        outputFile: {
          description: "output file",
          localName: "outputFile." + engineAttributes.extension,
          ondemand: false,
          required: true,
          verb: dav3.Verb.put,
          zip: false,
        },
      },
      settings: {
        script: {
          value: engineAttributes.script,
        },
      },
    };
    try {
      const newActivity = await api.createActivity(activitySpec);
    } catch (ex) {
      console.error(ex);
      return {
        diagnostic: "Failed to create new activity",
      };
    }
    // specify the alias for this Activity
    const aliasSpec = {
      id: Utils.Alias,
      version: 1,
    };
    try {
      const newAlias = await api.createActivityAlias(activityName, aliasSpec);
    } catch (ex) {
      console.error(ex);
      return {
        diagnostic: "Failed to create new alias for activity",
      };
    }
    return {
      activity: qualifiedActivityId,
    };
  }

  return {
    activity: "Activity already defined",
  };
};

module.exports = { createActivity };
