Parse.Cloud.beforeSave("CareRecipientMeasurement", function (request, response) {
    var countClass = require('../../ruleFunctions/countFn');
    countClass.countFunction(request.params.start, request.params.end, request.params.username, request.params.type).then(
        function success(data) {
            res.success("Success counting " + JSON.stringify(data));
        },
        function error(err) {
            res.error("Error: " + JSON.stringify(err));
        });
});
