$(document).ready(function () {
  $("#startWorkitem").click(startWorkitem);
  startConnection();
});

function startWorkitem() {
  startConnection(function () {
    var formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        width: $("#width").val(),
        height: $("#height").val(),
        browerConnectionId: connectionId,
      })
    );
    writeLog("Uploading file to forge server...");
    $.ajax({
      url: "api/forge/designautomation/workitems/revit_sample_file.rvt",
      data: formData,
      processData: false,
      contentType: false,
      type: "POST",
      success: function (res) {
        writeLog("Workitem started: " + res.workItemId);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        writeLog(
          " -> " +
            (xhr.responseJSON && xhr.responseJSON.diagnostic
              ? xhr.responseJSON.diagnostic
              : thrownError)
        );
      },
    });
  });
}

function writeLog(text) {
  $("#outputlog").append(
    '<div style="border-top: 1px dashed #C0C0C0">' + text + "</div>"
  );
  var elem = document.getElementById("outputlog");
  elem.scrollTop = elem.scrollHeight;
}

var connection;
var connectionId;

function startConnection(onReady) {
  if (connection && connection.connected) {
    if (onReady) onReady();
    return;
  }
  connection = io();
  connection.on("connect", function () {
    connectionId = connection.id;
    if (onReady) onReady();
  });

  connection.on("downloadReport", function (url) {
    writeLog('<a href="' + url + '">Download report file here</a>');
  });

  connection.on("onComplete", function (message) {
    if (typeof message === "object") message = JSON.stringify(message, null, 2);
    writeLog(message);
  });
}
