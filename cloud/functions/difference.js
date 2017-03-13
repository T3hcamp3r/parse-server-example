Parse.Cloud.beforeSave("CareRecipientMeasurement", function (request, response) {
    var differenceClass = require('../../ruleFunctions/differenceFn');
    differenceClass.differenceFunction(request.params.start, request.params.end, request.params.username, request.params.type).then(
        function success(data) {
            res.success("Success difference " + JSON.stringify(data));
        },
        function error(err) {
            res.error("Error: " + JSON.stringify(err));
        });
});
