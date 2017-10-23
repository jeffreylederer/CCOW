///////////////////////////////////////////////////////////////////////////////
//
//  Description:    WebSDKConnect Sample Application js
//
//  Product Name:   Web SDK
//
//  Version:        6.3.0.0
//
//  Filename:       WebSDKConnect.js
//
//  Language:       English (United States)
//
//  Company Name:   Caradigm
//
//  Copyright:      Copyright 2016 Caradigm. All rights reserved.
//
//  Notice:         This sample application that is being made available to the recipient 
//                  is Caradigm's intellectual property and is being provided on an 
//                  "as-is" basis without any representations or warranties, express 
//                  or implied, and recipient's use of or reliance on this code is 
//                  at its own risk.
//
//
///////////////////////////////////////////////////////////////////////////////

/* ////////////////////////////////////////////////////////////////////////////

    Purpose of this module
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    
    WebSPApp1 is a sample application that responds to user and patient context 
    changes. This module demonstrates how to connect context events with an 
    application.

    Your application will

    1) Include IContextor.js

    2) Include this or a similar module to listen to context change events


    Layout of functions within this module

    - All functions in this module are defined to be in their own namespace. This 
      prevents collisions with functions in other modules.

    - The namespace declared for this module is WebSDKApp. It is declared below as 
      var WebSDKApp = {}

    - All functions in this module are further subdivided by purpose. 
      
      WebSDKApp.Application
      WebSDKApp.ButtonHandlers
      WebSDKApp.AppDisplay
      WebSDKApp.Context
      WebSDKApp.Patient
      WebSDKApp.Url

    To listen for Contextor events an application must join context and listens
    on Caradigm.IAM.IContextParticipant. Four methods are defined:

    Caradigm.IAM.IContextParticipant.OnContextChangePending
    Caradigm.IAM.IContextParticipant.OnContextChangeAccepted
    Caradigm.IAM.IContextParticipant.OnContextChangeCanceled
    Caradigm.IAM.IContextParticipant.OnContextTerminated 

    (see documentation for additional information)


    This module starts at WebSDKApp.initialize
        this function will initialize the display, preload patient keys,
        and join context.

    All context changes are received at Caradigm.IAM.IContextParticipant.OnContextChangeAccepted

        This function detects user and/or patient changes
        On a patient change, the function calls WebSDKApp.Application.PatientContextChange
        On a user change, the function calls WebSDKApp.Application.Logoff


//////////////////////////////////////////////////////////////////////////// */


// application namespace
var WebSDKApp = {};


/* ////////////////////////////////////////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////

    Application Configuration
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    
    The loading page must define WebSampleAppConfig



//////////////////////////////////////////////////////////////////////////// */
WebSDKApp.Config = {

    ApplicationName: WebSampleAppConfig.ApplicationName || "",
    ApplicationPath: WebSampleAppConfig.ApplicationPath || "",
    ApplicationKey: WebSampleAppConfig.ApplicationKey || "user.logon.id.windows",
    PatientContextKey: WebSampleAppConfig.PatientContextKey || "patient.id.mpi",
    LoginRedirect: WebSampleAppConfig.LoginRedirect,

    // surveyable true to receive survey prior to context change 
    Surveyable: WebSampleAppConfig.Surveyable || true
};

/* ////////////////////////////////////////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////
   
   Application Logic


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Application = {};
WebSDKApp.Application.CurrentUser = "";
WebSDKApp.Application.CurrentPatientMPI = "";

WebSDKApp.Application.keyDictionary =
    {
        id: 'Id',
        firstName: 'First Name',
        lastName: 'Last Name',
        birthday: 'Dob',
        sex: 'Gender',
        notes: 'Notes',
        phone: 'Tel',
        mail: 'Mail',
        address: 'Address'
    };

/* ////////////////////////////////////////////////////////////////////////////

   Application Initialize
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   Hook Logoff button to initialize Logoff function



   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Application.InitApplication = function () {

    // initialize display
    WebSDKApp.AppDisplay.InitDisplay();

    // validate customization requirements
    if (typeof Caradigm == "undefined") {
        alert("Change <script> tag to load IContextor.js from the vault. See documentation for details.");
    }

    // sync context and set patient in combo box
    WebSDKApp.Context.InitContext(function (success, contextDict) {

        // initiate async patient data query
        WebSDKApp.Patient.initPatientLookup(function () {

            // when completed, show current patient
            WebSDKApp.Application.PatientContextChange(contextDict[WebSDKApp.Config.PatientContextKey]);

        });
    });

}

/* ////////////////////////////////////////////////////////////////////////////

   Patient Change
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   Patient selection changes are initiated from either the UI or contextor.

   PatientSelected is called when a patient is selected by the UI

        1) display patient information (WebSDKApp.AppDisplay.ShowPatient)
        2) set patient in context if set context checkbox is set


   PatientContextChange is called on context change 

        1) display patient information (WebSDKApp.AppDisplay.ShowPatient)
        2) synchronize combo box



   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Application.PatientSelected = function (patient_id)
{
    if (!patient_id || patient_id == WebSDKApp.Application.CurrentPatientMPI)
        return;

    // set selected patient
    WebSDKApp.Application.CurrentPatientMPI = patient_id;

    // query patient data
    WebSDKApp.Patient.GetPatientDataAsync( patient_id, function( patientdata ) {

        // display 
        WebSDKApp.AppDisplay.ShowPatient(WebSDKApp.Application.keyDictionary, patientdata);

        // set context
        var contextdata = WebSDKApp.Patient.mapDataToContext(patientdata, WebSDKApp.contextMapKeys);
        WebSDKApp.Context.SetPatientContextAsync(contextdata);

    });

}

///////////////////////////////////////////////////////////////////////////////
WebSDKApp.Application.PatientContextChange = function (patient_id)
{
    if (patient_id == WebSDKApp.Application.CurrentPatientMPI)
        return;

    // set selected patient
    WebSDKApp.Application.CurrentPatientMPI = patient_id;

    // query and display patient data
    WebSDKApp.Patient.GetPatientDataAsync(patient_id, function (patientdata) {

        // display 
        WebSDKApp.AppDisplay.SetPatient(patient_id);
        WebSDKApp.AppDisplay.ShowPatient(WebSDKApp.Application.keyDictionary, patientdata);

    });

}

/* ////////////////////////////////////////////////////////////////////////////

   User Change and Logoff
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   A user context change is initiated by either a user context change or by 
   clicking Logoff.

   OnLogoff is called when the Log off button is clicked. It will set context 
   to a blank user.

   Logoff is called to log the application off, and to reset the Shibboleth 
   state.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Application.OnLogoff = function () {

    // set user context to blank, then continue with application logoff
    console.log("Application Logout started", WebSDKApp.Config.ApplicationKey, "=''");

    Caradigm.IAM.IContextor.LogoutAsync(WebSDKApp.Config.ApplicationKey, true,
        function ( token, status, noContinue, resonseList ) {

            console.log("Application Logout completed", status);
            WebSDKApp.Application.Logoff();

        });

    // return false to stop event propagation
    return false;
}

///////////////////////////////////////////////////////////////////////////////
WebSDKApp.Application.Logoff = function ()
{
    // Application logoff
    console.log("clear application accessToken");
    sessionStorage.removeItem('accessToken');

    function ShibbolethLogout()
    {
        // reset Shibboleth cookie
        console.log("ApplicationLogoff /Shibboleth.sso/Logout");
        WebSDKApp.Url.HttpRequest("GET", "/Shibboleth.sso/Logout", {}, function (status, response) {

            setTimeout(function () {

                var location = WebSDKApp.Url.BuildUrl(WebSampleAppConfig.LoginRedirect);
                window.location = location;

            }, 0);
        });

    }

    // Log In
    /*
    var loginLink = $('#loginLink');
    if (loginLink && loginLink.length)
        return ShibbolethLogout();
    */

    // Log Out
    var logoutForm = $('#logoutForm');
    if (logoutForm && logoutForm.length)
    {
        console.log("ApplicationLogoff $('#logoutForm').submit()");
        WebSDKApp.Url.PostForm('logoutForm');
    }

    ShibbolethLogout();
}

/* ////////////////////////////////////////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////
   
   App Button Handlers


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.ButtonHandlers = {};

/* ////////////////////////////////////////////////////////////////////////////

   Suspend Context
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   Suspends receiving context changes


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.ButtonHandlers.SuspendContext = function ()
{
    try {

        var Token = Caradigm.IAM.IContextor.SuspendAsync(
            // SuspendAsync callback
            function(token, status) {
                console.log("inside SuspendAsync callback Token =", token, "status=", status);

                if (status == Caradigm.IAM.Success) {
                    WebSDKApp.AppDisplay.ShowStatusMessage("Suspended",status);
                    WebSDKApp.AppDisplay.setUIElemEnabledState(WebSDKApp.AppDisplay.Buttons.Suspend, false);

                } else {
                    WebSDKApp.AppDisplay.ShowStatusMessage("Could not suspend context",status);
                    if (status == Caradigm.IAM.CCOWException.UnknownParticipantException) {
                        // reset the buttons since removed from context due to exception
                        WebSDKApp.AppDisplay.ShowStatusMessage("Unknown Participant Exception", status );
                        WebSDKApp.AppDisplay.ShowLeaveState();
                    }
                }
               
            });
    } catch (e) {
        console.log(e.message);
        WebSDKApp.AppDisplay.ShowStatusMessage( "Exception", e );
    }

}

/* ////////////////////////////////////////////////////////////////////////////

   Resume Context
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   Resume receiving context changes


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.ButtonHandlers.ResumeContext = function() {
    try {

        var Token = Caradigm.IAM.IContextor.ResumeAsync(
            // ResumeAsync callback
            function(token, status) {
                console.log("inside ResumeAsync callback token=", token, "status=", status);

                if (status == Caradigm.IAM.Success) {
                    WebSDKApp.AppDisplay.ShowStatusMessage("Resumed", status);
                    WebSDKApp.AppDisplay.setUIElemEnabledState(WebSDKApp.AppDisplay.ButtonList, true );

                } else {
                    WebSDKApp.AppDisplay.ShowStatusMessage("Could not resume context", status);
                    if (status == Caradigm.IAM.CCOWException.UnknownParticipantException) {
                        // reset the buttons since removed from context due to exception
                        WebSDKApp.AppDisplay.ShowLeaveState();
                        WebSDKApp.AppDisplay.ShowStatusMessage("Unknown Participant Exception", status);
                    }
                }

            });
    }catch(e){
        console.log(e.message);
        WebSDKApp.AppDisplay.ShowStatusMessage( "Exception", e );
    }

}

/* ////////////////////////////////////////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////

   UI, Display Functions


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.AppDisplay = {};
WebSDKApp.AppDisplay.Buttons = {};
WebSDKApp.AppDisplay.Buttons.Suspend = "suspend";
WebSDKApp.AppDisplay.Buttons.Resume = "resume";
WebSDKApp.AppDisplay.ButtonList = [WebSDKApp.AppDisplay.Buttons.Suspend, WebSDKApp.AppDisplay.Buttons.Resume ];

///////////////////////////////////////////////////////////////////////////////
WebSDKApp.AppDisplay.InitDisplay = function () {

    // will reset all display state
    WebSDKApp.AppDisplay.ShowLeaveState();

    // patient select (add event listener for combo box)
    var select_patient = document.getElementById("select_patient");
    if (select_patient) {
        select_patient.addEventListener("change", function () {

            var selected_index = select_patient.selectedIndex;
            if (-1 != selected_index) {
                var patient_id = select_patient.options[selected_index].value;
                console.log("seleted patient: ", patient_id);

                setTimeout(function () { WebSDKApp.Application.PatientSelected(patient_id); }, 0);
            }
        });
    }

    // hook logoff (add event listener for logoff button)
    var logoff = document.getElementById('logoff');
    if (!logoff) {
        console.warn("could not locate logoff button");
    }

    else {
        logoff.href = "javascript:function(){return false;}";
        logoff.addEventListener("click", function (event) {

            var value = logoff.innerText || logoff.textContent;
            if (value.toLowerCase() != "log off")
                return;

            event.stopPropagation();

            // perform Logoff asynchronously
            setTimeout(WebSDKApp.Application.OnLogoff, 0);
            return false;
        });
    }

}

/* ////////////////////////////////////////////////////////////////////////////

   Show Joined State
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   Enable Suspend, Resume buttons


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.AppDisplay.ShowJoinState = function (isjoined, status) {
    // show status msg
    var msg = (isjoined)
            ? "Joined"
            : "Could not join context";

    WebSDKApp.AppDisplay.ShowStatusMessage(msg, status);

    // set button accessibility
    WebSDKApp.AppDisplay.setUIElemEnabledState(WebSDKApp.AppDisplay.ButtonList, isjoined);
}

/* ////////////////////////////////////////////////////////////////////////////

   Show Leave State
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   Disable Suspend, Resume buttons
   Disable patient display


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.AppDisplay.ShowLeaveState = function () {

    // set button accessibility (false is disable)
    WebSDKApp.AppDisplay.setUIElemEnabledState(WebSDKApp.AppDisplay.ButtonList, false);

    var commitedData = document.getElementById("commitedData");
    if (commitedData)
        commitedData.innerHTML = "";

}

/* ////////////////////////////////////////////////////////////////////////////

   Show Patient
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   display keys and corresponding values.



   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.AppDisplay.ShowPatient = function (keydictionary, patientdata) {
    // clear table data
    var tablediv = document.getElementById("commitedData");
    if (!tablediv)
        return;

    // create table dynamically
    var displayTable = document.createElement('TABLE');

    // loop the context Dictionary and set the key/value pairs in the UI
    for (var key in keydictionary ) {

        var label = keydictionary[key];
        var value = patientdata[key] || "";

        // create the rows for the table
        var tr = document.createElement('TR');
        displayTable.appendChild(tr);

        var tdk = document.createElement('TD');
        tdk.className = "datatable-key";

        var tdv = document.createElement('TD');
        tdv.className = "datatable-value";

        tr.appendChild(tdk);
        tr.appendChild(tdv);

        // add the context data to rows
        tdk.appendChild(document.createTextNode(label));
        tdv.appendChild(document.createTextNode(value));
    }

    tablediv.innerHTML = "";
    tablediv.appendChild(displayTable);
}

/* ////////////////////////////////////////////////////////////////////////////

   Set Patient
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   On patient change, add patient to select box.



   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.AppDisplay.SetPatient = function (patient_id) {
    var select_patient = document.getElementById("select_patient");
    if (!select_patient)
        return false;

    for (var item = 0; item < select_patient.options.length; item++) {
        if (select_patient.options[item].value == patient_id) {
            select_patient.selectedIndex = item;
            return true;
        }
    }

    return false;
}

/* ////////////////////////////////////////////////////////////////////////////

   setUIElemEnabledState
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   Enable/disable web element (button, links)



   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.AppDisplay.setUIElemEnabledState = function (arr_button, enable) {

    var classname = (enable) ? "enabled" : "disabled";

    if (typeof arr_button == "string")
        arr_button = [arr_button];

    for (var item in arr_button) {
        var btn = document.getElementById(arr_button[item]);
        if (btn) {
            btn.disabled = (!enable);
            btn.className = classname;
        }
    }
}

/* ////////////////////////////////////////////////////////////////////////////

   ShowStatusMessage
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

   Show status message



   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.AppDisplay.ShowStatusMessage = function (message, status) {

    if (status)
        message += ":", status.message + "\t" + " (status code:" + status + ")";

    var element = document.getElementById("message");
    if (element)
        element.innerHTML = message;
}

/* ////////////////////////////////////////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////
   
   Context Functions


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Context = {};
WebSDKApp.Context.CurrentContextDict = {};

/* ////////////////////////////////////////////////////////////////////////////

    InitContext 
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    InitContext is called when a page initially loads. It determines if the 
    application is loading into a valid context. This can happen if the 
    browser navigated away from the application page and then returned.

    If there is no valid context, or if the context has expired, the 
    application joins context.

   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Context.InitContext = function ( callback ) {
    try {

        // fix config parameters
        WebSDKApp.Config.Surveyable = (true === WebSDKApp.Config.Surveyable || "true" === WebSDKApp.Config.Surveyable) ? true : false;

        // join, refresh context
        WebSDKApp.Context.SyncCurrentContext(function (status, contextDict) {

            var success = (status == Caradigm.IAM.Success || status == Caradigm.IAM.CCOWException.AlreadyJoinedException);
            if (!success)
                WebSDKApp.AppDisplay.ShowStatusMessage("fail to join context:", status);

            else
                WebSDKApp.AppDisplay.ShowJoinState(success, status);

            if (callback)
                setTimeout(function () { callback(success, contextDict); }, 0);

        });
    } catch (e) {

        // oops, exception. report it.
        WebSDKApp.AppDisplay.ShowStatusMessage("exception:", e.description);
    };

}

/* ////////////////////////////////////////////////////////////////////////////

    SyncCurrentContext
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Synchronize current is intended to be called when a page is initially 
    loaded. It determines if there is a current context participant coupon 
    and if so if it is valid. 

    This function will join context with the existing participant coupon or 
    join to a new context and retrieve the current context.

    

   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Context.SyncCurrentContext = function (callback) {

    function notifycaller(status, contextDict) {
        if (callback)
            callback(status, contextDict);

    }

    function joinAndRefresh() {
        WebSDKApp.Context.CurrentContextDict = {};
        WebSDKApp.Context.JoinAsync(function (status, joined) {

            // if joined, refresh current context
            if (joined) {

                WebSDKApp.Context.GetCurrentContextAsync(function (status, contextDict) {

                    WebSDKApp.Context.CurrentContextDict = contextDict;
                    return notifycaller(status, contextDict);
                });
            }

            else
                return notifycaller(status, {});

        });
    }

    // determine if participant coupon is still valid
    var participantCoupon = Caradigm.IAM.IContextor.GetParticipantCoupon();
    if (participantCoupon) {

        // try to get context
        WebSDKApp.Context.GetCurrentContextAsync(function (status, contextDict) {

            // if success, then state was valid
            if (status == Caradigm.IAM.Success)
                return notifycaller(status, contextDict);

                // else attempt to re-join
            else {
                // attempt rejoin, refresh
                joinAndRefresh();
            }
        });
    }

        // if no participant coupon, then attempt join
    else {

        joinAndRefresh();

    }

    // function is async, so return and wait for callback

}

/* ////////////////////////////////////////////////////////////////////////////

    JoinAsync
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Joins context.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Context.JoinAsync = function (callback) {

    try {

        var surveyable = ("true" === WebSDKApp.Config.Surveyable);
        var Token = Caradigm.IAM.IContextor.JoinAsync(WebSDKApp.Config.ApplicationName, surveyable,

            // joinAsync callback
            function (token, status) {

                console.log("inside JoinAsync callback token=", token, "status=", status);

                // handle response in callback
                var joined = (status == Caradigm.IAM.Success || status == Caradigm.IAM.CCOWException.AlreadyJoinedException);
                if (callback)
                    callback(status, joined);

            });
    } catch (e) {
        console.log(e.message);
    }

}

/* ////////////////////////////////////////////////////////////////////////////

    GetCurrentContextAsync
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Retrieves current context and calls an optional callback when completed.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Context.GetCurrentContextAsync = function( callback ) {

    var Token = Caradigm.IAM.IContextor.GetContextAsync(false,

        // getContextAsync callback
        function(token, status, contextDict) {

            // normalize Dict (keys lower case)
            contextDict = WebSDKApp.Context.NormalizeDict(contextDict);
            console.log("inside GetCurrentContextAsync token=", token, "status=", status);

            // retain last context retrieved
            if (status == Caradigm.IAM.Success)
                WebSDKApp.Context.CurrentContextDict = contextDict;

            if (callback)
                callback(status, contextDict);

        });

    return Token;
}

/* ////////////////////////////////////////////////////////////////////////////

    SetPatientContextAsync
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Sets patient into context and calls an optional callback function when
    completed.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Context.SetPatientContextAsync = function (patientdata, callback)
{
    try {
        Caradigm.IAM.IContextor.SetContextAsync(patientdata, true, function (token, status) {

            if (callback)
                setTimeout(function () { callback(status); }, 0);
        });

    }
    catch (e) {
        if (callback)
            callback(e.number);
    }
}

/* ////////////////////////////////////////////////////////////////////////////

    SetUserContextAsync
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Sets user into context and calls an optional callback function when
    completed.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Context.SetUserContextAsync = function (key, value, callback) {

    try {
        var contextDict = {};
        contextDict[key] = value;

        Caradigm.IAM.IContextor.SetContextAsync(contextDict, true, function ( token, status ) {

            if (callback)
                setTimeout(function () { callback(status); }, 0);
        });

    }
    catch (e) {
        if (callback)
            callback(e.number);
    }

}

/* ////////////////////////////////////////////////////////////////////////////

    NormalizeDict
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Creates a dictionary where context keys all have the same case for use
    by javascript.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Context.NormalizeDict = function (sourceDict) {
    var targetDict = {};
    for (var key in sourceDict) {
        var value = sourceDict[key];
        targetDict[key.toLowerCase()] = value;
    }

    return targetDict;
}

/* ////////////////////////////////////////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////

   Url, Web Get/Post Functions


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Url = {};
WebSDKApp.Url.BuildUrl = function () {

    arguments.join = [].join;
    var requested = arguments.join("/");
    var url = [WebSDKApp.Config.ApplicationPath, requested].join("/").replace( /\/\//g, "/");
    return [window.location.origin, url].join("/");
}

/* ////////////////////////////////////////////////////////////////////////////

    PostForm
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Emulates form submit


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Url.PostForm = function (formid, callback)
{
    var form = document.getElementById(formid);
    if (!form)
        return false;

    var submitDict = {};
    var all_elements = form.getElementsByTagName('input');
    for ( var k = 0; k < all_elements.length; ++k )
    {
        var elem = all_elements[k];
        submitDict[elem.name] = elem.value;
    }

    WebSDKApp.Url.HttpRequest(form.method || "POST", form.action, submitDict,
        function ( response ) {

            if ( callback )
                setTimeout(function () { callback(response.status, response); }, 0);

        });

    return true;
}

/* ////////////////////////////////////////////////////////////////////////////

    Makes Http request (Get, Post )
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Url.HttpRequest = function (method, url, values, callback) {
    try {
        var req = new XMLHttpRequest();
        if (!req) return;

        var aSync = true;
        var payload = "";
        if ( values )
        {
            var args = [];
            for (var key in values)
                args.push(key + "=" + encodeURIComponent(values[key]));

            payload = args.join("&");
        }
        
        // if method = GET
        method = method.toUpperCase();
        var is_get = ( "GET" == method ) ? true : false;
        console.log("!!", method, url, is_get, payload.length, payload );

        // GET append payload to url
        if (is_get && payload )
        {
            url = url + "?" + payload;
            payload = "";
        }

        req.open( method, url, aSync );
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.setRequestHeader("Access-Control-Allow-Origin", "mikep81shib.andoverlab.com");
        req.send( payload );

        req.onreadystatechange = function(event) {
            if (req.readyState != 4 ) return;

            if ( callback )
                callback( req, event );

        }
    } catch (e) {
        e.Message = "Misformed URL";
        throw e;
    }
}

/* ////////////////////////////////////////////////////////////////////////////

    InitUrlMechanism
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Determines supported mechanism for url requests.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Url.InitUrlMechanism = function () {

    var xmlhttp = null;
    for (var i = 0; i < WebSDKApp.Url.XMLHttpFactories.length; ++i ) {
        try {
            xmlhttp = WebSDKApp.Url.XMLHttpFactories[i]();
            break;
        }
        catch (e) {
            continue;
        }
    }

    WebSDKApp.Url.XMLHTTP = xmlhttp;
    return xmlhttp;
}

WebSDKApp.Url.XMLHttpFactories =
[
  function () { return new XMLHttpRequest() },
  function () { return new ActiveXObject("Msxml2.XMLHTTP") },
  function () { return new ActiveXObject("Msxml3.XMLHTTP") },
  function () { return new ActiveXObject("Microsoft.XMLHTTP") }
];

/* ////////////////////////////////////////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////
   
   General, Common Functions


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Common = {};
WebSDKApp.Common.FlatDictionary = function( values )
{
    var body = {};

    function merge( map )
    {
        for (var key in map)
        {
            var value = map[key];
            if ( ('' + value) == "[object Object]" )
                merge(value);

            else
                body[key] = ('' + value);

        }
    }

    merge(values);
    return body;
}

/* ////////////////////////////////////////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////

   Patient Functions


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Patient = {};
WebSDKApp.Patient.PatientIdKeys = {};

/* ////////////////////////////////////////////////////////////////////////////

    initPatientLookup
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Load initial patient id/ patient name table.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Patient.initPatientLookup = function (callback) {

    var select_patient = document.getElementById("select_patient");
    if (!select_patient)
        return false;

    // initialize patient data
    var api_patient_url = WebSDKApp.Url.BuildUrl("/api/patient");
    WebSDKApp.Url.HttpRequest("GET", api_patient_url, null, function (response) {

        if (response.status == 200) {
            // expect array containing patient id, patient name (last, first middle)
            var patientData = JSON.parse(response.response);

            for (var k = 0; k < patientData.length; ++k) {
                var patient = patientData[k];
                WebSDKApp.Patient.Add(patient.id, patient.name);

                var option = document.createElement("option");
                option.value = patient.id;
                option.text = patient.name;

                select_patient.add(option);
            }
        }

        if (callback)
            setTimeout(function () { callback(response.status, response); }, 0);

    });

    // if query request made
    return true;
}

/* ////////////////////////////////////////////////////////////////////////////

    Patient Find
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Given a patient id, locate in patient key table.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Patient.Find = function (id) {
    var key = ("_" + id);
    return WebSDKApp.Patient.PatientIdKeys[key];
}

/* ////////////////////////////////////////////////////////////////////////////

    Patient Add
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Add patient key, names.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Patient.Add = function (id, values) {
    if (typeof values == "string")
        values = { name: values };

    var dict = values;
    dict['id'] = id;

    var key = ("_" + id);
    WebSDKApp.Patient.PatientIdKeys[key] = dict;
}

/* ////////////////////////////////////////////////////////////////////////////

    GetPatientDataAsync
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Given a patient key, request patient data. Call optional callback when 
    completed.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Patient.GetPatientDataAsync = function (id, callback) {

    var api_patientdata_url = WebSDKApp.Url.BuildUrl( "/api/patient", id );
    WebSDKApp.Url.HttpRequest("GET", api_patientdata_url, null, function(response) {

        if (response.status != 200)
            return;

        // expect array containing patient id, patient name (last, first middle)
        var patientdata = JSON.parse(response.response);

        if ( callback )
            setTimeout(function() { callback(patientdata); }, 0);

    });

}

/* ////////////////////////////////////////////////////////////////////////////

    mapDataToContext
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    Given a keysDictionary, map patient fields (lastName, sex, ...) to 
    context key value pairs.


   ///////////////////////////////////////////////////////////////////////// */
WebSDKApp.Patient.mapDataToContext = function (items, keysDict) {

    var mappedValues = {};
    for ( var key in keysDict )
    {
        var value;
        var action = keysDict[ key ];
        if (typeof action == "string")
            value = items[ action ];

        else
            value = action( items, key );

        if ( !(undefined === value || null === value || "" === value ))
            mappedValues[ key ] = value;

    }

    return mappedValues;
}

///////////////////////////////////////////////////////////////////////////////
WebSDKApp.contextMapKeys = {

    "patient.id.mpi" : "id",
    "patient.co.datetimeofbirth" : "birthday",
    "patient.co.mail" : "mail",
    "patient.co.phone" : "phone",
    "patient.co.address" : "address",
    "patient.co.notes" : "notes",

    "patient.co.sex": function( items, key )
    {
        var gender = items['sex'];
        return (gender) ? gender.toUpperCase() : "";
    },

    "patient.co.patientname" : function( items, key )
    {
        var fullname = [items['lastName'], items['firstName'], "   "].join(" ");
        return fullname.replace( / /g, "^");
    }
    
};

/* ////////////////////////////////////////////////////////////////////////////
   ////////////////////////////////////////////////////////////////////////////

    IContextParticipant functions


   ///////////////////////////////////////////////////////////////////////// */
Caradigm.IAM.IContextParticipant.OnContextChangePending = function(proposedCoupon) {

    var response = "";
    var checkboxAcceptConditionally = document.getElementById("checkboxAcceptConditionally");
    var checkboxDoNotRespond = document.getElementById("checkboxDoNotRespond");
    if (checkboxAcceptConditionally.checked == true) {
        response = "Work will be lost";
    } else {
        response = "";
    }
    if (checkboxDoNotRespond.checked == true) {
        alert(
            "The application will not respond to survey until OK button hit. Use to mimic non-responding application.");
    }
    return response;
}

///////////////////////////////////////////////////////////////////////////////
Caradigm.IAM.IContextParticipant.OnContextChangeAccepted = function(proposedCoupon) {

    // save current context
    var savedContext = WebSDKApp.Context.CurrentContextDict;

    // refresh context
    WebSDKApp.Context.GetCurrentContextAsync(function(status, currentContext) {

        // determine if user changed
        var previousUserIdentity = (savedContext[WebSDKApp.Config.ApplicationKey] || "").toLowerCase();
        var currentUserIdentity = (currentContext[WebSDKApp.Config.ApplicationKey] || "").toLowerCase();
        if (previousUserIdentity != currentUserIdentity)
        {
            setTimeout(function () { WebSDKApp.Application.Logoff(); }, 0);
            return;
        }

        // if not user change, always call patient change to match current context to display patient
        var currentPatientMPI = currentContext[WebSDKApp.Config.PatientContextKey] || "";
        setTimeout(function () { WebSDKApp.Application.PatientContextChange(currentPatientMPI); }, 0);

    });
}

///////////////////////////////////////////////////////////////////////////////
Caradigm.IAM.IContextParticipant.OnContextChangeCanceled = function (proposedCoupon) {
    
}

///////////////////////////////////////////////////////////////////////////////
Caradigm.IAM.IContextParticipant.OnContextTerminated = function(proposedCoupon) {
    
}

///////////////////////////////////////////////////////////////////////////////
// initialize
WebSDKApp.Application.InitApplication();
