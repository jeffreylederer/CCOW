var cmv;
var url = $("#RedirectTo").val();

// call back for join
function JoinCallBack(token, statuscode) {
    if (statuscode == Caradigm.IAM.Success) {
        window.location.href = url;
    } else if (status == Caradigm.IAM.CCOWException.AlreadyJoinedException) {
        window.location.href = url;
    } else {
        cmv.status.text('not joined: ' + statuscode.message);
    }
}




// knockout model
var ContextViewModel = function () {
    var self = this;
    // an arrary of context keys and values
    self.status = ko.observable();  // for displaying current status
}


  
 $(document).ready(function () {
        Caradigm.LogLevels = Caradigm.IAM.LogLevels.Finest;  // log everythibng
        cmv = new ContextViewModel();
        ko.applyBindings(cmv);  // bind model
        Caradigm.IAM.IContextor.JoinAsync("PrintOnDemand#", true, JoinCallBack);
});
