/****************************************************************************************************************
*****   Modification Start
*****************************************************************************************************************/
parent.logger("[Debug] ADFCommon triggered in following window");
parent.logger(window);

//[START] Try to listen for contorl + s and mouse clicks
function init() {
  // quit if this function has already been called
  if (arguments.callee.done) return;

  // flag this function so we don't do the same thing twice
  arguments.callee.done = true;

  // kill the timer
  if (_timer) clearInterval(_timer);
    parent.logger("[Trace] Commmon Init happened.");
    parent.logger(document);
    document.onkeydown = function(event){                           
                            if(event.ctrlKey == true && event.key == 's'){  
                                //Captured save shortcut, call menuSave and stop event propogation  
                                parent.logger("[Trace] Identified saved Shortcut");
                                parent.menuSave();                              
                                event.stopPropagation();
                                event.stopImmediatePropagation();
                                event.preventDefault();             
                                return false;
                            }
                        };
    
	
	//try to capture all the mouse clicks
	document.onmousedown = function(event){	
								//If pressed Yes on popup of dirty form while changing page. Force validate.
								if(event.srcElement.id.indexOf("pchspDlg") !== -1 &&  event.srcElement.id.indexOf("yes") !== -1){
									parent.logger("[TESTING] Mouse click event on yes button (POPUP) captured..");
									event.stopPropagation();
									event.stopImmediatePropagation();
									event.preventDefault();  
									var id = event.srcElement.id.replace("yes", "close");																	
									document.getElementById(id).click();
									parent.menuSave();									
									return false;
								}
								//If pressed Np on popup of dirty form while changing page. clear variables, changes are discarded.
								else if(event.srcElement.id.indexOf("pchspDlg") !== -1 &&  event.srcElement.id.indexOf("no") !== -1){
									parent.c_clearVariables();
								}
								//If changing page, and form is not dirty, clear variables, changes are discarded.
								//FORM_GO_BTN if simple form
								//GLOBAL_BTN if composite form
								else if(event.srcElement.id.indexOf("GLOBAL_BTN") !== -1 || event.srcElement.id.indexOf("FORM_GO_BTN") !== -1){
									if(!isFormDirty()){
										parent.c_clearVariables();
									}
								}
								//if form is dirty and planning tab is closed, check is yes is pressed
								else if(event.srcElement.id.indexOf("com.hyperion.bpm.web.common.DialogButton") !== -1){
									if(event.srcElement.accesskey == "y"){
										parent.logger("[TESTING] Mouse click event on yes button (POPUP) captured..");
										event.stopPropagation();
										event.stopImmediatePropagation();
										event.preventDefault();  										
										parent.menuSave();									
										return false;
									}
								}
							};
};

/* for Mozilla/Opera9 */
if (document.addEventListener) {
  document.addEventListener("DOMContentLoaded", init, false);
}

/* for Internet Explorer */
/*@cc_on @*/
/*@if (@_win32)
  document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
  var script = document.getElementById("__ie_onload");
  script.onreadystatechange = function() {
    if (this.readyState == "complete") {
      init(); // call the onload handler
    }
  };
/*@end @*/

/* for Safari */
if (/WebKit/i.test(navigator.userAgent)) { // sniff
  var _timer = setInterval(function() {
    if (/loaded|complete/.test(document.readyState)) {
      init(); // call the onload handler
    }
  }, 10);
}

/* for other browsers */
window.onload = init;

//[END] Try to listen for control + s and mouse clicks


/****************************************************************************************************************
***** Modification End
*****************************************************************************************************************/
var upkGuide, upkHelTopic ;
var upk_Planning_context="HyperionPlanning"; //constant for now
var upk_version = "11.1.2.2"; //constant for this release
var upk_browser_language = "en-US";
var launchedFormId;

// Fields added to track prompt for save - Starts
var g_mod;
var g_folderId;
var g_formId;
var g_searchFormName;
var g_adhocSessionIdForForm;
var g_chartViewType;

var g_taskListId;
var g_taskId;
var g_taskType;
var g_dpTypeId;
var g_scenarioId;
var g_versionId;
var g_yearId;
var g_tlArtifactType;
var g_tlArtifactId;

var gridPrefix    = "T";
var planningTemplateId  = "p";  //plnTmpl; // Desktop mode only
var planningRegionId    = "r";  //planRgn; // Used in desktop mode and also while loading from form management summary
var fuseHomeTemplateId    = "ft";  

// Fuse
var formContainerInFuseHome          		= "f";  // planRgnFrm
var taskListContainerInFuseHome      		= "t";  // planTLRgn
var formRgnWithinMainRgnTL 			= "tfr"; // taskWizard.jsff which launches 
var formRgnWithinMainRgn 			= "fr"; // formRgn // Desktop and tablet. Used for TL , Preview and Adhoc , Summary
var formRgnWithinTLDesktop 		        = "frd";
var approvalsContainerInFuseHome                = "a";
var valRepRgnInFuseApprovals                    = "vr";
var g_ssoToken;
var g_navigationWindow;

// Fields added to track prompt for save - Ends

var bSlickGrid;
var slickFrame;
var bSlickFastSave;
var slickOperation;
var sGDefaultFormat = true;
var sGUserDefinedFormat = true;

function isFuseDesktopMode(){
    var flag = false;
    var rgn = AdfPage.PAGE.findComponent("fuseDesktopFld");
    if(rgn){
        var ctxValue = rgn.getValue();
        if(ctxValue != null){
            ctxValue = ctxValue.trim();
            flag = (ctxValue == true || ctxValue == "true");
        }
    }
    return flag;
}

function isIpadMode(){
    var flag = false;
    var rgn = AdfPage.PAGE.findComponent("mobileAgentFld");
    if(rgn){
        var ctxValue = rgn.getValue();
        if(ctxValue != null){
            ctxValue = ctxValue.trim();
            flag = (ctxValue == true || ctxValue == "true");
        }
    }
    return flag;
}

/**
 * Gets the Workspace window.
 */
function GetWorkspaceWindow()
{
    var rWorkspaceWindow = null;
    for (var rWindow = window; rWindow != null; rWindow = (rWindow == top ? null : rWindow.parent))
    {
        if (rWindow.application)
        {
            rWorkspaceWindow = rWindow;
        }
    }
    return rWorkspaceWindow;
}
var workspaceWindow = GetWorkspaceWindow();
var isWorkSpace = (workspaceWindow != null && workspaceWindow.gModuleManager != null);
if(workspaceWindow == null)
    workspaceWindow = top;

var currentPageLink = "";

function onloadHander(){
    addUPKMetaTag();
}

function addUPKMetaTag(){
   if(document){  // current document where the this js is included 
        var headNode = document.getElementsByTagName("head")[0];
       // var upkNSTag = document.getElementsByName("upk-namespace");
       //if(headNode  && upkNSTag.length == 0){
        if(headNode){
               if (isIE){
                    var metaTagNode = document.createElement('<meta name="upk-namespace">')
               } 
               else {
                   var metaTagNode = document.createElement("meta");
                   metaTagNode.setAttribute("name", "upk-namespace");
               }
               var upk_content = "hyperion" + ";" + upk_version + ";" + upk_browser_language;
               metaTagNode.setAttribute("content", upk_content);
               headNode.appendChild(metaTagNode);
        } 
    }
}

function setUpkGuide(uGuide){
  upkGuide = uGuide;
}

function setUpkHelpTopic(uHelpTopic){
  upkHelTopic = uHelpTopic;
}

function setUpkLanguage(upkLanguage){
 upk_browser_language = upkLanguage;
}

function UPK_GetContext() {
    var upk_help_topic = getUPKTopic(upkHelTopic);
    var planning_contextId = upk_Planning_context + "/" + upkGuide + "/" + upk_help_topic;
    return encodeURIComponent(planning_contextId);

}

function getUPKTopic(helpTopic) {
    var topic;
    if (workspaceWindow.gModuleManager) {  //indicates this is from the workspace
        if (helpTopic != null)
        {
            var nIdx = helpTopic.indexOf(".");
            if (nIdx != -1) {
            topic = helpTopic.substring(0, nIdx);
            }
            return topic;
        }
    }
}


//Help for popups
function launchHelp(event){
  var markerId = event.getSource().getProperty("helpMarker");
  var markerArr = markerId.split("/");
  var hContext = markerArr[0];
  var hGuide = markerArr[1];
  
  setUpkGuide(hGuide);
  setUpkHelpTopic(hContext);
  
  //var hGuide = event.getSource().getProperty("helpGuide");
  if(workspaceWindow.gModuleManager){
     launchWindowHelpWS(hContext, hGuide);
  }else{    
     launchWindowHelp(hContext);
  }
}

function launchWindowHelpWS(rstHelpUri, rstHelpGuide){
    var rContainer = null;
    var rModule = null;
    //if (isWorkspace) {
        if (window.opener)
        {
            if (window.opener.workspaceWindow.gModuleManager)
            {   //for the case of a popup window  from the mainFrame
                rContainer = window.opener.workspaceWindow.gModuleManager.getModuleById(window.opener.workspaceWindow.gModuleManager.getStartup());
                if (rContainer) rModule = rContainer.getHandler().getActiveModule();
            }
            else if (window.opener.popUpgModuleManager)
            {  //for the case of second popup window from a popup launched from the mainFrame
                rContainer = window.opener.popUpgModuleManager.getModuleById(window.opener.popUpgModuleManager.getStartup());
                if (rContainer) rModule = rContainer.getHandler().getActiveModule();
            }
        }
        else if (workspaceWindow.gModuleManager)
        {  //for the cas Planning reports
            rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup());
            if (rContainer) rModule = rContainer.getHandler().getActiveModule();
        }
        if (rModule)
        {
            rModule.getHandler().launchPageHelp(rModule, rstHelpUri, rstHelpGuide);
        }
    //}
}

// Check if this is used. Need to clean this
function loadModuleInContentPane(ev) {
    var mod = ev.getSource().getProperty("module");
    var artifactType = ev.getSource().getProperty("artifactType");
    if (artifactType){
        if (artifactType == null){
            artifactType = "";
        }
    }
    else{
        artifactType = "";
    }
    
    loadModuleInContentPaneWrkSpace(mod,null,null,null,null,artifactType+"");
}

/*function isIE() {

    return (navigator.userAgent.indexOf("MSIE") >  - 1 ? true : false);
}*/


function getObjectByAbsId(compClientId){
    return AdfPage.PAGE.findComponentByAbsoluteId(compClientId);
}


function isIE() {
    var browserType = "";
    //alert("isWorkSpace"+isWorkSpace)
	if(isFuseDesktopMode() || isIpadMode()){
		browserType = getObjectByAbsId("browserType").getValue().trim();
    }else{
         browserType = getObjectByAbsId(planningTemplateId+":browserType").getValue().trim();
    }
	//alert("browserType"+browserType)
    return (browserType == true || browserType == "true");
}

// Invoked when TASKLIST node in my task list tree is invoked
function loadTaskListStatusWizard(mod, folderId, chartViewType) {
	/****************************************************************************************************************
    ***** Modification Start
    ***************************************************************************************************************/
    parent.c_clearVariables(); //clear and reinitialize the variables once the form is changed.
    parent.c_initialize(); 

    /****************************************************************************************************************
    **** Modification End
    ***************************************************************************************************************/
    g_mod = mod;
    g_folderId = folderId;
    g_chartViewType = chartViewType;
    invocationPattern = "TASKLIST";
    var ret = promptUserOnPageNavigation();
    if(ret == false){
        return;
    }
    
    var src = AdfPage.PAGE.findComponent(planningTemplateId+":loadBtn");
    if (!chartViewType) {
        chartViewType = 0;
    }
    if (folderId) {
        AdfCustomEvent.queue(src, "loadModule", {module : mod, folderId : folderId, chartType : chartViewType},true);
    } else {
        AdfCustomEvent.queue(src, "loadModule", {module : mod},true);
    }
}

// Generic method invoked on loading any menu
function loadModuleInContentPaneWrkSpace(mod, folderId, formId, searchFormName,adhocSessionIdForForm,artifactType, tlArtifactType, tlArtifactId) {
	/****************************************************************************************************************
    ***** Modification Start
    ***************************************************************************************************************/
    parent.c_clearVariables(); //clear and reinitialize the variables once the form is changed.
    parent.c_initialize(); 

    /****************************************************************************************************************
    **** Modification End
    ***************************************************************************************************************/
    g_mod = mod;
    g_folderId = folderId;
    g_formId = formId;
    g_searchFormName = searchFormName;
    g_adhocSessionIdForForm = adhocSessionIdForForm;
    
    invocationPattern = "GEN";
    var ret = promptUserOnPageNavigation();
    if(ret == false){
        return;
    }
    var src = AdfPage.PAGE.findComponent(planningTemplateId+":loadBtn");
    if (folderId){
        if (folderId == null){
            folderId = "";
        }
    }
    else{
        folderId = "";
    }
    if (formId){
        if (formId == null){
            formId = "";
        }
    }
    else{
        formId = "";
    }
    
    if (adhocSessionIdForForm){
        if (adhocSessionIdForForm == null){
            adhocSessionIdForForm = "";
        }
    }
    else{
        adhocSessionIdForForm = "";
    }
     if (artifactType){
        if (artifactType == null){
            artifactType = "";
        }
    }else{
        artifactType = "";
    }
    
            AdfCustomEvent.queue(src, "loadModule", 
            {
                module : mod, folderId : folderId, formId : formId, searchFormName : searchFormName,adhocSessionIdForForm:adhocSessionIdForForm,artifactType:artifactType,tlArtifactType:tlArtifactType,tlArtifactId:tlArtifactId
            },
            true);
}

// Invoked on clickin on TASK node in my tasklist tree
function loadTaskListRunTimeModuleInContentPaneWrkSpace(mod, folderId, taskListId, taskId, taskType, dpTypeId, scenarioId, versionId, yearId, tlArtifactType, tlArtifactId) {
    /****************************************************************************************************************
    ***** Modification Start
    ***************************************************************************************************************/
    parent.c_clearVariables(); //clear and reinitialize the variables once the form is changed.  
    /****************************************************************************************************************
    **** Modification End
    ***************************************************************************************************************/
	
	g_mod = mod;
    g_folderId = folderId;
    g_taskListId = taskListId;
    g_taskId = taskId;
    g_taskType = taskType;
    g_dpTypeId = dpTypeId;
    g_scenarioId = scenarioId;
    g_versionId = versionId;
    g_yearId = yearId;
    g_tlArtifactType = tlArtifactType;
    g_tlArtifactId = tlArtifactId;
    invocationPattern = "TASK";
    var ret = promptUserOnPageNavigation();
	
	
    if(ret == false){
        return;
    }

    
    var src = AdfPage.PAGE.findComponent(planningTemplateId+":loadBtn");
    //alert("in loadTaskListRunTimeModuleInContentPaneWrkSpace "+mod+", dpTypeId="+dpTypeId+" scenarioId "+scenarioId+" versionId "+versionId+" yearId "+yearId);
    if (folderId) {
        // TODO - generalize this
        AdfCustomEvent.queue(src, "loadModule", 
        {
            module : mod, folderId : folderId, taskListId : taskListId, taskId : taskId, taskType : taskType, dpTypeId : dpTypeId, scenarioId : scenarioId, versionId : versionId, yearId : yearId, tlArtifactType : tlArtifactType, tlArtifactId : tlArtifactId        },
true);
    }
    else {
        AdfCustomEvent.queue(src, "loadModule", 
        {
            module : mod, folderId : folderId, taskListId : taskListId, taskId : taskId, taskType : taskType, dpTypeId : dpTypeId, scenarioId : scenarioId, versionId : versionId, yearId : yearId, tlArtifactType : tlArtifactType, tlArtifactId : tlArtifactId
        },
true);
    }
	/****************************************************************************************************************
    ***** Modification Start
    ***************************************************************************************************************/
    parent.c_clearVariables(); //clear and reinitialize the variables once the form is changed.
    parent.c_initialize(); 
    /****************************************************************************************************************
    **** Modification End
    ***************************************************************************************************************/
}

function loadSearchFormInContentPaneWrkSpace(mod, folderId, formId, searchFormName) {
    //alert("in loadSearchFormInContentPaneWrkSpace mod="+mod+",folderId="+folderId+",formId="+formId + ", searchFormName=" + searchFormName);
    var src = AdfPage.PAGE.findComponent(planningTemplateId+":loadBtn");
    AdfCustomEvent.queue(src, "loadModule", 
    {
        module : mod, folderId : folderId, formId : formId, searchFormName : searchFormName
    },
true);
}

function loadFormOnSelection(ev){
    var src = ev.getSource();
    var compForm    = src.getProperty("inCompositeFormTF");
    var formId      = src.getProperty("formId");
    var formName    = src.getProperty("formName");
    if(compForm == true || compForm == "true"){
        ev.cancel();
        return;
    }
    loadForm(formId,formName);
}


function loadForm(formId,formName) {
    loadModuleInContentPaneWrkSpace("enterdata", null, formId,formName);
    /****************************************************************************************************************
    ***** Modification Start
    ***************************************************************************************************************/
    parent.c_clearVariables(); //clear and reinitialize the variables once the form is changed.
    parent.c_initialize(); 

    /****************************************************************************************************************
    **** Modification End
    ***************************************************************************************************************/
    launchedFormId = formId;//Used for invoking designer
}

function logout(){
    var src = null;
    if(isFuseDesktopMode() || isIpadMode()){
        src = AdfPage.PAGE.findComponent("logout");
    }else{
        src = AdfPage.PAGE.findComponent(planningTemplateId+":logout");
    }
    AdfActionEvent.queue(src, false);
}


function fuse_logout(isFuseDesktopMode, isIpadMode){
    var src = null;
    if(isFuseDesktopMode || isIpadMode){
        src = AdfPage.PAGE.findComponent(fuseHomeTemplateId+":logout");
        if(src){
            // Do nothing
        }else{ // When not enclosed wihtin template, templateId will not be prefixed. Clean up once we use template for home page
            src = AdfPage.PAGE.findComponent("logout");
        }
        AdfActionEvent.queue(src, false);
    }
}

function initReloadTFFlag(){
    var btn = AdfPage.PAGE.findComponent(planningTemplateId+":initRF");
    if (btn) {
        AdfActionEvent.queue(btn, true);
    }
}

function loadDecisionPackages(dpType) {
    loadModuleInContentPaneWrkSpace("decisionPackagesTF", dpType);
}

function triggerGridCreationOnLoad() {
    var src = AdfPage.PAGE.findComponent(planningTemplateId+":"+planningRegionId+":1:loadGrid");
    AdfActionEvent.queue(src, false);
}

function invokePopupDialogOpen(actionEvent) {
    // Create custom GlassPane
    var rGlassPane = workspaceWindow.document.createElement("div");
    rGlassPane.id = "Planning_CustomGlassPane";
    // When glasspane appears, it makes ADF dialog buttons unclickable.
    // So need to calculate top of Workspace and make glasspane that high so we don't put over ADF dialog.  ADF will take care of glasspane in content. 
    // Set modal="true" for the popup.
    if (workspaceWindow.gModuleManager) {
        var rModule = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup()).getHandler().getActiveModule();
        if (rModule) {
            rGlassPane.style.height = rModule.getContent().getClientTop() + "px";
        }
    }
    else {
        rGlassPane.style.height = "133px";
    }
    rGlassPane.style.width = "100%";
    rGlassPane.style.left = 0;
    rGlassPane.style.top = 0;
    rGlassPane.unselectable = true;
    rGlassPane.hideFocus = true;
    rGlassPane.style.position = "absolute";
    rGlassPane.style.backgroundImage = "url(/Images/glass_panel.gif)";
    rGlassPane.zIndex = 37;
    // Add the GlassPane to the root document
    workspaceWindow.document.body.appendChild(rGlassPane);
}

/**
 * The function to be called after ADF popup dialog is closed.
 * The function removes the custom GlassPane from the document.
 * Note - You need to invoke this function from clientListener of ADF components
 * @param The adf action event.
 */
function invokePopupDialogClose(actionEvent) {
    // Remove the GlassPane from the root document
    workspaceWindow.document.body.removeChild(workspaceWindow.document.getElementById("Planning_CustomGlassPane"));
}

// Invokes dialog based on popupId passed as client parameter.
// This method is applicable for command components which launch dialog declaratively using showPopupBehavior
function invokeDialogClientEvent(ev) {
    var source = ev.getSource();
    var popupIdVal = source.getProperty("popupIdVal");
    var alignByComponent = source.getProperty("alignFlag");// If passed, align dialog with component. Else place it in center( Default )
    if (alignByComponent) {
        invokeDialog(popupIdVal, source.getId());
    }
    else {
        invokeDialog(popupIdVal);
    }
}

// This method is applicable for scenario where dialog is launched from backing bean
function invokeDialog(popupId, alignId, alignType) {
    var dialog = AdfPage.PAGE.findComponentByAbsoluteId(popupId);//  Common dialog for confirmation messages

    var hints = { 
    };
    if (alignId && alignId != "") {
        hints[AdfRichPopup.HINT_ALIGN_ID] = alignId;// Note: If alignId is not set, dialog is positioned in center of page
        hints[AdfRichPopup.HINT_ALIGN] = (alignType) ? alignType : AdfRichPopup.ALIGN_AFTER_START;
    }
    dialog.show(hints);
}

function setFocusOnField(fieldId) {
    var field = AdfPage.PAGE.findComponentByAbsoluteId(fieldId);
    if (field) {
        field.focus();
    }
}

// Invoked on using ALT+Z key
function onFocusRegionFrame(ev) {
    ev.cancel();
}

function openDPWizard() {    
    var regionContainerName = planningTemplateId+":"+planningRegionId;
    var formRegionName = "formRgn";
    var dpCreateButtonName = "pc1:createDPButton";
    var refreshButton = AdfPage.PAGE.findComponent(regionContainerName).findComponent(dpCreateButtonName);
    if(!refreshButton){
        refreshButton = AdfPage.PAGE.findComponent(regionContainerName).findComponent(formRegionName).findComponent(dpCreateButtonName);
    }    
    
    if (refreshButton) {
        AdfActionEvent.queue(refreshButton, true);
    }
}

function handleSlickGridsave(type,msg,errorInfo){   
    var params = {};
    params['type'] = type;
    params['operation'] = "aftersave";
    if(type=='success'){
        params['aftersavemsg'] = msg;
    }else if(type=='error' && errorInfo){
        if(errorInfo.errorMsg!=null)
            params['errormsg'] = errorInfo.errorMsg;
        if(errorInfo.errrImg!=null)
            params['errrimg'] = errorInfo.errrImg;
        if(errorInfo.detailedMsg!=null)
            params['detailedmsg'] = errorInfo.detailedMsg;
        if(errorInfo.detailedImg!=null)
            params['detailedimg'] = errorInfo.detailedImg;
    }
    AdfCustomEvent.queue(getObjectByIdInRegion("triggerSlickAction"), "triggerSlickAction", params, true);
}

function setSlickGridDirty(dirty){
    var params = {};
    params['operation'] = "setdirty";
    if(slickFrame && slickFrame.Slick) {
        if(dirty!=null)
            params['slickdirty'] = dirty;
        else
            params['slickdirty'] = slickFrame.isSlickGridDirty();
            
        AdfCustomEvent.queue(getObjectByIdInRegion("triggerSlickAction"), "triggerSlickAction", params, true);
    }
}

// Method to perform grid operations
function performGridOperation(ev) {
    var operationsNeedingServerWebGridSync = "filterKeep,filterExclude,filterNone,rbsortA,rbsortD,rbcancelSort,gridSpread,massAllocate,adjustData,invSupDet"; // If needed we can get cancel sort, cancel filter also in this list.
    if(bSlickGrid) {
        var params = {};
        var selRow = null;
        if(slickFrame && slickFrame.Slick) {
            try{
                var range = slickFrame.getSlickSelectionRange();
                if(range){
                    params['slickRowHd'] = slickFrame.getSelectedSlickRow();
                    params['slickColHd'] = slickFrame.getSelectedSlickColumn();
                    params['slickStartRow'] = range.slickStartRow;
                    params['slickStartCol'] = range.slickStartCol;
                    params['slickEndRow'] = range.slickEndRow;
                    params['slickEndCol'] = range.slickEndCol;            
                }
            }catch(e){}
        }    
        slickOperation = ev.getSource().getProperty("operation");  //Needed for refresh purpose
        params['operation'] =  slickOperation
        if(slickOperation=="loadGrid"){ 
            top.afterLoadGrid = true;
            if(slickFrame.getFormatDirtySlickCells()!=""){
                params['operation'] =  "updateExlFormatOnRefresh";
                if(slickFrame.getFormatDirtySlickCells()!="")
                    params['dirtySlickFormatCells'] = slickFrame.getFormatDirtySlickCells();
                AdfCustomEvent.queue(getObjectByIdInRegion("triggerSlickAction"), "triggerSlickAction", params, true);
                ev.cancel();
                return;
            }
        }
        if(ev.getSource().findComponent("triggerSlickAction")) {
            if(slickOperation == "cutBtn") {
                slickFrame.slickActionDoCut();
            } else if(slickOperation == "copyBtn") {
                slickFrame.slickActionDoCopy();            
            } else if(slickOperation == "trigPaste") {
                slickFrame.slickActionDoPaste();
            } else if(slickOperation == "deleteBtn") {
                slickFrame.slickActionDoDelete();
            } else if(slickOperation == "doUndo") { 
                slickFrame.slickActionUndo();
            }
            else {
                if(operationsNeedingServerWebGridSync.indexOf(slickOperation) > -1){
                    slickFrame.commitSlickGridCurrentEdit();
                    params['dirtySlickCells'] = slickFrame.getDirtySlickCells();
                    slickFrame.cacheLastSelected();
                }
                if(slickFrame.getFormatDirtySlickCells()!="")
                    params['dirtySlickFormatCells'] = slickFrame.getFormatDirtySlickCells();
                AdfCustomEvent.queue(ev.getSource().findComponent("triggerSlickAction"), "triggerSlickAction", params, true);
            }
        } else {
            try{ // TODO - throws error for null grid
                if(slickFrame && slickFrame.Slick){
                    slickFrame.cacheLastSelected(); //Bug 20188188
                    //slickFrame.cacheFormatting();
                    slickFrame.commitSlickGridCurrentEdit();
                }
            }catch(e){}
            triggerGridOperations(slickOperation, false);
        }
    } else {
        var oper = ev.getSource().getProperty("operation");
        var adhocView = ev.getSource().findComponent("tmenu:inAdhocView");
        var adhocFlag = false;
        if (adhocView && parseInt(adhocView.getValue()) > 0) {
            adhocFlag = true;
        }
        triggerGridOperations(oper, adhocFlag);
    }
    ev.cancel();
}

function clearDirtyCells(){
    if(slickFrame && slickFrame.Slick) {
        slickFrame.clearDirtyCells();
    }
}

// Based on whethere enter data is current module, take appropriate action
function loadAdhocOptions(ev) {

}

        function launchAdhocAnalyse(appName, adhocSessionId, fomrId, title){
            if (workspaceWindow.gModuleManager){
                var rastParam = new Array();
                rastParam["moduleToLoad"] = "enterdata";//"UserPreferences";
                rastParam["sourceApp"] = appName;
                rastParam["formId"] = fomrId;
                rastParam["adhocSessionIdForForm"] = adhocSessionId;
                rastParam["title"] = title;
                
                openModuleInNewTab(rastParam);
            }else{
               var url = "PlanningCentral?taskFlowName=%2fWEB-INF%2ftaskflows%2fenterdata%2fenterdata.xml%23enterdata&sourceApp"+appName+"&formId="+fomrId+"&adhocSessionIdForForm="+adhocSessionId
                window.open(url);
            }
    }

    function launchNewAdhoc(appName, adhocSessionId, title){
            var rastParam = new Array();

            rastParam["moduleToLoad"] = "enterdata"; //"UserPreferences";
            rastParam["sourceApp"] = appName;
            rastParam["adhocSessionIdForForm"] = adhocSessionId;
            rastParam["title"] = title;
            
            openModuleInNewTab(rastParam);
    }
    
    function launchFormDesigner(appName){
        if (workspaceWindow.gModuleManager){
            var rastParam = new Array();
            rastParam["moduleToLoad"] = "%2fWEB-INF%2ftaskflows%2fformdesigner%2fFormDesignerTF.xml%23FormDesignerTF";
            rastParam["sourceApp"] = appName;
            rastParam["formId"] = launchedFormId;;
            rastParam["folderId"] = -1;
            rastParam["title"] = rastParam["sourceApp"];
            
            openModuleInNewTab(rastParam);
        } else {
            window.open("PlanningCentral?taskFlowName=%2fWEB-INF%2ftaskflows%2fformdesigner%2fFormDesignerTF.xml%23FormDesignerTF&sourceApp"+appName+"&formId="+launchedFormId+"&folderId=-1");
        }
    }
    
    function launchFormDesignerFromComposite(appName, formId) {
        if (workspaceWindow.gModuleManager){
            var rastParam = new Array();
            rastParam["moduleToLoad"] = "%2fWEB-INF%2ftaskflows%2fformdesigner%2fFormDesignerTF.xml%23FormDesignerTF";
            rastParam["sourceApp"] = appName;
            rastParam["formId"] = formId;;
            rastParam["folderId"] = -1;
            rastParam["title"] = rastParam["sourceApp"];
            rastParam["loadedInNewWSTab"] = "Y";
            openModuleInNewTab(rastParam);
        } else {
            window.open("PlanningCentral?taskFlowName=%2fWEB-INF%2ftaskflows%2fformdesigner%2fFormDesignerTF.xml%23FormDesignerTF&sourceApp"+appName+"&formId="+formId+"&folderId=-1");
        }
    }

function openModuleInNewTab(moduleToLoadParams) {
    var rContainer = null;
    if (workspaceWindow.gModuleManager){
            rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup()).getHandler();

            if (rContainer)
            { 
                var rastParam = new Array();
                rastParam["isContained"] = "true";
                rastParam["isWorkspace"] = "true";

                for (i in moduleToLoadParams){
                     rastParam[i] = moduleToLoadParams[i];
                }
                rContainer.loadModuleAsync("HyperionPlanning.planning", rastParam);
            }
    }
}

function setCurrentPageLink(pagelink){
    currentPageLink = pagelink;
    /****************************************************************************************************************
    ***** Modification Start
    ***************************************************************************************************************/
    if(pagelink.indexOf("enterdata") != -1 || pagelink.indexOf("TaskListTaskActionWizardTF") != -1) // When the tabs is changed reinitialize the variables
        parent.c_initialize();
    /****************************************************************************************************************
    ***** Modification End
    ***************************************************************************************************************/
}

function copyCurrentPageLink(){
    copyToClipboard(currentPageLink);
}

function copyToClipboard(stringData){
    window.clipboardData.setData("Text", stringData);
}


function getFieldForOper(oper, adhocFlag){
    var dpTaskRegionForm;
    var regionContainerName = planningTemplateId+":"+planningRegionId;
    if (adhocFlag) {
        // This will be true when grid is invoked while doing Adhoc analyse/New adhoc grid creation
        regionContainerName = "formRgn";
    }
    var field = AdfPage.PAGE.findComponent(regionContainerName).findComponent(oper);
    var fieldForTaskList;
    try {
        // To handle case when grid is invoked within tasklist module, since grid region is embedded wihitn the main planning shell
        var taskRegionForm = AdfPage.PAGE.findComponent(regionContainerName).findComponent("formRgn");
        if(taskRegionForm){
            //When DP is called from tasklist, dpFormRgn is inside formRgn. check for dpTaskRegnFrm in formRgn.
            dpTaskRegionForm = taskRegionForm.findComponent("dpFormRgn");
            if(dpTaskRegionForm){
                //dpFormRgn found. This is DP called from tasklist.
                fieldForTaskList = dpTaskRegionForm.findComponent(oper);
                if(oper == 'saveGrid'){
                    var dpFormRgn = AdfPage.PAGE.findComponent(regionContainerName).findComponent("formRgn");;                    
                    if(dpFormRgn){
                        field = dpFormRgn.findComponent("pc3:saveGrid");
                    }
                }
                if (!field) {
                    field = fieldForTaskList;
                }
            }else{
                //dpFormRgn not found. This is Forms called from tasklist.
                fieldForTaskList = taskRegionForm.findComponent(oper);
                if (!field) {
                    field = fieldForTaskList;
                }                
            }
        }else{
            //No formRgn found. This is DP called from DP Accordion.
            dpTaskRegionForm = AdfPage.PAGE.findComponent(regionContainerName).findComponent("dpFormRgn");
            if(dpTaskRegionForm){
                fieldForTaskList = dpTaskRegionForm.findComponent(oper);
                if(oper == 'saveGrid'){
                    field = AdfPage.PAGE.findComponent(regionContainerName).findComponent("pc3:saveGrid");
                }
                if (!field) {
                    field = fieldForTaskList;
                }           
            }
        }
               
        // Adhoc options and New adhoc grid can be invoked without loading grid. Hence handle them explictily
        if(oper == "adhocOptions" || oper == "newAdhoc"){
            if(field && field != null){
                // Do nothing
            }else{
                field = AdfPage.PAGE.findComponent(regionContainerName).findComponent(oper+"InTmplate");
            }
        }
    }
    catch (e) {}
    return field;
}

function changeSlickGridPage(obj){
    AdfActionEvent.queue(getObjectByIdInRegion("cbs"),true);
}

// This function will be invoked directly from LaunchPlannignCentral.js on getting callbacks from workspace toolbars
function triggerGridOperations(oper, adhocFlag) {
    var field = "";
    var err = false;
    try{
        field = getObjectByIdInRegion(oper);
    }catch(e){
        err = true; // Error fetching Id
    }
    if(err || field == "" || field == null){
        if(isFuseDesktopMode() || isIpadMode()){
            // Do nothing if in fuse mode. Above method shud handle it & fetch the object reference.
        }else{
            field = getFieldForOper(oper, adhocFlag);
        }
    } 
    if(bSlickGrid) {
        if(oper == 'saveGrid' && bSlickFastSave){
            if(slickFrame && slickFrame.Slick) {
                slickFrame.saveGrid();
            }
        } else if(oper == 'saveGrid' && !bSlickFastSave){
            var dirtySlickCells = slickFrame.getDirtySlickCells()
             var params = {};
             params['dirtySlickCells'] = dirtySlickCells;
             if(slickFrame.getFormatDirtySlickCells()!="")
                params['dirtySlickFormatCells'] = slickFrame.getFormatDirtySlickCells();
             field = getObjectByIdInRegion("slickSaveActionBtn");
             AdfCustomEvent.queue(field, "slickSaveActionListener", params, true);
        } else {
            AdfActionEvent.queue(field, true);
        }
    } else {
        if(field){
             AdfActionEvent.queue(field, true);
        }
    }    
}


function triggerGridSaveOnWsClose(rstModuleId){
    var field = getFieldForOper("triggerSaveWsClose");
    AdfCustomEvent.queue(field, "saveGridOnWsClose", {rsModuleIdForCurrentTab:rstModuleId}, true);
    ev.cancel();
}

function handleLaunchMemberFormula(ev) {
    var btn;
    try{
        btn = getObjectByIdInRegion("lmf");
    }catch(e){
        var root = AdfPage.PAGE.findComponent("fr");
        if(root){
            btn = root.findComponent("lmf"); // Preview
        }
    }

    if(bSlickGrid) {
        AdfCustomEvent.queue(btn, "launchMemberFormula1", {}, true);
    } else {
        var gridFormId = ev.getSource().getProperty("gridFormId");
        AdfCustomEvent.queue(btn, "launchMemberFormula1", {gridFormId:gridFormId}, true);
    }
    ev.cancel();
}


function handleLaunchMemberFormulaForSlick(mbrId) {
    var btn;
    try{
        btn = getObjectByIdInRegion("lmf");
    }catch(e){
        var root = AdfPage.PAGE.findComponent("fr");
        if(root){
            btn = root.findComponent("lmf"); // Preview
        }
    }

    if(bSlickGrid) {
        AdfCustomEvent.queue(btn, "launchMemberFormula1", {mbrId:mbrId}, true);
    }
}


function runCalcScript(ev) {
    var src = ev.getSource().findComponent("ruleImage");
    AdfActionEvent.queue(src, true);
    //AdfCustomEvent.queue(ev.getSource(), "runCalcScriptServer", true);
}

function callCalcScriptTF() {
    var callBRTFBTN = AdfPage.PAGE.findComponent(planningTemplateId+":callBRTF");
    if (callBRTFBTN) {
        AdfActionEvent.queue(callBRTFBTN, true);
    }
}

function loadFormOnDblClick(ev) {
    var src = ev.getSource();
    var attrFormId   = src.getProperty("formId");
    var attrFormName = src.getProperty("formName");
    var compForm     = src.getProperty("inCompositeFormTF");
    var isNavContext = src.getProperty("isNavContext");
    if(compForm == true || compForm == "true"){
        ev.cancel();
        return;
    }
    if(isNavContext == true || isNavContext == "true"){
        ev.cancel();
        return;
    }
    
    loadForm(attrFormId,attrFormName);
}

function loadFormsListOnDblClick(ev) {
    AdfCustomEvent.queue(ev.getSource(), "loadFormsListEv", true);
}

function getPlanningModuleHandler() {
    var rContainer = null;
    var rModule = null;
    if (workspaceWindow.gModuleManager) {
        rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup());
        if (rContainer)
            rModule = rContainer.getHandler().getActiveModule();
    }
    if (rModule) {
        return rModule.getHandler();
    }
    else {
        return null;
    }
}

function refreshFormsList() {
    var refreshButton = AdfPage.PAGE.findComponent(planningTemplateId+":refreshFormsList");
    if (refreshButton) {
        AdfActionEvent.queue(refreshButton, true);
    }
}

function defaultFormsListing() {
    var refreshButton = AdfPage.PAGE.findComponent(planningTemplateId+":defaultFormsListing");
    if (refreshButton) {
        AdfActionEvent.queue(refreshButton, true);
    }
}

function refreshFoldersAndFormsList() {
    var refreshButton = AdfPage.PAGE.findComponent(planningTemplateId+":refreshAfterInit");
    if (refreshButton) {
        AdfActionEvent.queue(refreshButton, true);
    }
}

function refreshLHSFormFolderAfterCompositeClose() {
    var refreshButton = AdfPage.PAGE.findComponent(planningTemplateId+":refreshLHSFormFolderAfterCompositeClose");
    if (refreshButton) {
        AdfActionEvent.queue(refreshButton, true);
    }
}

function paintCompositeFormLayout() {
    var plnRegion = AdfPage.PAGE.findComponent(planningTemplateId+":"+planningRegionId);
    var sharedRegion = plnRegion.findComponent("cfRgn");
    if (sharedRegion) {
        var layoutButton = sharedRegion.findComponent("showLayout");
        if (layoutButton) {
            AdfActionEvent.queue(layoutButton, true);
        }
    }
}

function refreshApprovals(){  
  var refreshAllButton = AdfPage.PAGE.findComponent(planningTemplateId+":"+planningRegionId+":1:approvalRgn:0:refreshAll");
  if(refreshAllButton){    
    AdfActionEvent.queue(refreshAllButton);
  }
}

function setValueFromMemberSelectorToField(clientCompId, fieldValue) {

    var clientId = clientCompId;
    if (AdfPage.PAGE.findComponent(clientId))
        AdfPage.PAGE.findComponent(clientId).setValue(fieldValue);

}

function loadMyTaskListOnDblClick(ev) {
    AdfCustomEvent.queue(ev.getSource(), "loadMyTaskListEv", true);
}

function loadTaskListOnDblClick(ev) {
    AdfCustomEvent.queue(ev.getSource(), "loadTaskListEv", true);
}

function loadUserPreferences(ev) {
    loadModuleInContentPaneWrkSpace("UserPreferences");
}

function loadDimensions(ev) {
    loadModuleInContentPaneWrkSpace("dimensions");
}

function triggerAdhocGridOperationsStandAlone(ev){
    triggerAdhocGridOperations("triggerAdhocOperations","false",parseFloat(ev.getSource().getProperty("adhocmenuId")));
}


function triggerAdhocGridOperations(oper, adhocFlag,adhocmenuId) {
    var field = getObjectByIdInRegion(oper);
    try {
        AdfCustomEvent.queue(field,"adhocOper", {adhocmenuId:adhocmenuId}, true);
    }catch (e){}
}

function toggleViewPaneWs(){
    var obj = AdfPage.PAGE.findComponent(planningTemplateId+":ptps2");
    handleSplitterPosition(obj,270);
}
function toggleMastHeadWs(){
    var obj = AdfPage.PAGE.findComponent(planningTemplateId+":ptps1");
    handleSplitterPosition(obj,33);
}

function toggleViewPane(ev){
    toggleViewPaneWs();
    ev.cancel();
}

function handleSplitterPosition(splitter,newSize){
    var posn = splitter.getSplitterPosition();
     if(parseInt(posn,10) > 0){
        splitter.setSplitterPosition(0);
    }else{
        splitter.setSplitterPosition(newSize);
    }
}

function toggleMastHead(ev){
    toggleMastHeadWs();
    ev.cancel();
}

function showLink(event){ 
  var urlLink = event.getSource().getProperty("urlLink");
  if(urlLink != null && urlLink.length>0){
     var linkWin = window.open(urlLink, null);
     linkWin.focus();
  }
}

function pressEnterToDo(event){
    var keyCodePressed = event.getKeyCode();
    var source = event.getSource();
    var componentId = source.getProperty("defaultComponentId");
    var clientComp = source.findComponent(componentId); 
    if(keyCodePressed == AdfKeyStroke.ENTER_KEY){
       AdfActionEvent.queue(clientComp,false);
    }
}

function refreshDecisionPackageList() {
    var plnRegion = AdfPage.PAGE.findComponent(planningTemplateId+":"+planningRegionId);
    if (plnRegion) {
        var goButton = plnRegion.findComponent("dpGoBtn");
        if (goButton) {
            AdfActionEvent.queue(goButton, true);
        }
    }
}


function closeTaskListWindow() {
    var rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup());
    if(rContainer) {
        var rModule = rContainer.getHandler().getActiveModule();
        if(rModule) rModule.getParentHandler().unloadModule(rModule);
    }
}

function handleReportingAction(componentId) {
    var reportBtn = AdfPage.PAGE.findComponent(componentId);
    var actionEvent = new AdfActionEvent(reportBtn);
    actionEvent.noResponseExpected();
    actionEvent.queue();
}

function launchRelatedContentUri(ev){
    var isWorkspace = (workspaceWindow != null && workspaceWindow.gModuleManager != null);
    var UrlLink = ev.getSource().getProperty("uri");
    if(isWorkspace && UrlLink != null && UrlLink.length>0 ) {
        workspaceWindow.gModuleManager.launchRelatedContentUri(UrlLink);
    } else if(!isWorkspace && UrlLink != null && UrlLink.length>0) {
        var linkWin = window.open(UrlLink, null);
        linkWin.focus();
    }
}


function setHeaderTitleInWs(processText){
    try{
        if(workspaceWindow){
            var rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup());
            if (rContainer){ 
                var rModule = rContainer.getHandler().getActiveModule();
                if(rModule){
                    if(rModule.getId().indexOf("HyperionPlanning.planning") > -1){ // 16235114 - Going further rmodule needs to be passed
                        var title = rModule.appName;
                        if (processText != "") {   
                            title += " - " + processText;
                        }
                        rModule.getContent().setTitle(title);
                        rModule.dispatchEvent(new workspaceWindow.BiEvent(workspaceWindow.bpm.common.Constants.EVENT_TITLE_CHANGED));
                    }
                }
            }
        }
    }catch(e){}
}


function loadFormOnRowSelection(ev){
    var tbl = ev.getSource();
    var selectedRowKeys = tbl.getSelectedRowKeys();
    var rowKey;
    var formName = "";
    var formId = "";
    var compForm = "";
    var isNavContext = "";
    for (rowKey in selectedRowKeys) {
        var inputText = tbl.findComponent("selRowObj", rowKey);
        if (inputText) {
            formName    = inputText.getProperty("formName");
            formId      = inputText.getProperty("formId");
            compForm    = inputText.getProperty("inCompositeFormTF");
            isNavContext= inputText.getProperty("isNavContext");
            break;
        }
    }

    if(compForm == true || compForm == "true"){
        ev.cancel();
        return;
    }
    if(isNavContext == true || isNavContext == "true"){
        ev.cancel();
        return;
    }

    loadForm(formId,formName);
}

/* Raises a global message. Note: Can be enhanced for component level msg
 * msg - Message to be displayed
 * type -   valid values include following:
            AdfFacesMessage.TYPE_WARNING
            AdfFacesMessage.TYPE_CONFIRMATION  
            AdfFacesMessage.TYPE_ERROR  
            AdfFacesMessage.TYPE_FATAL  
            AdfFacesMessage.TYPE_INFO  
            AdfFacesMessage.TYPE_WARNING  
 */
function raiseFacesMessageOnClient(msg,type){
    AdfPage.PAGE.clearAllMessages();
    AdfPage.PAGE.addMessage(null, new AdfFacesMessage(type, msg , msg),null); 
    AdfPage.PAGE.showMessages(null); 
}

function navigateToArtifactDefn(ev){
    var src = ev.getSource()
    var artifactType = src.getProperty("artType");
    if(workspaceWindow){
        var rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup());
        if (rContainer) var rModule = rContainer.getHandler().getActiveModule();
        var appName = rModule.appName;
        var rastParam = new Array();
        rastParam["sourceApp"] = appName;
        rastParam["title"] = rastParam["sourceApp"];
        rastParam["artifactIdToLoad"] = src.getProperty("artifactId");
        rastParam["loadedInNewWSTab"] = "P"; //denotes Performance Settings tab to disclose 
        
        if(artifactType == "125"){ // RAM
            rastParam["moduleToLoad"] = "/WEB-INF/taskflows/reportingmapping/ReportingMappingDetailTF.xml#ReportingMappingDetailTF";
            openModuleInNewTab(rastParam);
        }else if(artifactType == "51"){ // PUH
            rastParam["moduleToLoad"] = "/WEB-INF/taskflows/approval/ApprovalsWizardTF.xml#ApprovalsWizardTF";
            openModuleInNewTab(rastParam);
        }else if(artifactType == "11"){ // PlanType
            rastParam["moduleToLoad"] = "/WEB-INF/taskflows/dimensions/dimensions.xml#dimensions";
            openModuleInNewTab(rastParam);
        }else if(artifactType == "7"){ // Form
            launchFormDesignerFromComposite(appName,src.getProperty("artifactId"));
        }else if(artifactType == "115"){ // Rules
            var planType = src.getProperty("planType");
            var ruleName = src.getProperty("artifactName");
            var objectType = "1";// 1 Rule 2 - RuleSet   
            loadRule(appName,planType,ruleName,objectType);
        }else if(artifactType == "2"){ // Dimensions
            rastParam["loadedInNewWSTab"] = "D"; //denotes dimensions tab to disclose
            rastParam["moduleToLoad"] = "/WEB-INF/taskflows/dimensions/dimensions.xml#dimensions";
            openModuleInNewTab(rastParam);
        }
    }
}

function loadURLInWsTabById(ev){
    if(workspaceWindow){
        var rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup());
        if (rContainer) var rModule = rContainer.getHandler().getActiveModule();
        var appName = rModule.appName;
        var rastParam = new Array();
        var title = ev.getSource().getProperty("wsTabTitle");
        var nonAppTabModIndicator   = ev.getSource().getProperty("nonAppTabModIndicator"); // Demo/BP/Tut
        var nonAppTabModContext     = ev.getSource().getProperty("nonAppTabModContext"); // identifier
        rastParam["sourceApp"]      = "";
        rastParam["title"]          = title;
        rastParam["nonAppTabModIndicator"]  = nonAppTabModIndicator;
        rastParam["nonAppTabModContext"]    = nonAppTabModContext;
        openModuleInNewTab(rastParam);
    }
    
}

function loadRule(appName,planType,ruleName,objectType){
    try{
	var calcMgrContext=workspaceWindow.gContextManager.getContext("calcmgr");
	if(!calcMgrContext.isLoaded()){
            calcMgrContext.load();
	}
        var moduleId = "calcmgr.filterview";
        var fvModule = workspaceWindow.gModuleManager.getModuleById(moduleId);
        var params = {
        };
        params[workspaceWindow.bpm.common.ModuleManager.SSO_TOKEN_PARAM] = workspaceWindow.gModuleManager.getToken();
        params.productName = "Planning";
        params.appName = appName;
        params.database = planType;
        params.planType = planType;
        params.objectName = ruleName;
        params.objectType = objectType;
        params[workspaceWindow.bpm.common.Constants.PARAM_SHOW_PROGRESS_DIALOG] = true;
        if (fvModule == null) {
            rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup());
            if (rContainer) {
                rModule = rContainer.getHandler().loadModuleAsync(moduleId, params, null, null);
            }
        }
        else {
            fvModule.getHandler().loadObject(null, params.objectType, true, false, params);
        }
    }catch(e){
        alert("Exception caught" + e);
    }
}function launchLoadOutlineFlow(flow) {
    var src;
    if(flow == 2) {
        src = AdfPage.PAGE.findComponent(planningTemplateId+":loadOutlineFromDBBtn");
    } else if(flow == 3) {
        src = AdfPage.PAGE.findComponent(planningTemplateId+":loadOutlineToFileBtn");
    } else if(flow == 5) {
        src = AdfPage.PAGE.findComponent(planningTemplateId+":loadOutlineDataToFileBtn");
    } else if(flow == 4) {
        src = AdfPage.PAGE.findComponent(planningTemplateId+":loadOutlineToDBBtn");
    } else if(flow == 6) {
        src = AdfPage.PAGE.findComponent(planningTemplateId+":loadOutlineDataFromFileBtn");
    } else {
        src = AdfPage.PAGE.findComponent(planningTemplateId+":loadOutlineMetadataFromFileBtn");
    }
    AdfActionEvent.queue(src, true);
}

function closeCurrentWindow() {
    self.close();
}

function selectDPTypeRow(inputId){
    var src = document.getElementById(inputId);
    if(src){
        src.focus();        
    }
}

function setDirtyFlag(flag) {
    var fld = AdfPage.PAGE.findComponent(planningTemplateId+":dirtyFlag");
    if(fld){
        fld.setValue(flag);
    }
}

function isFormDirty(){
    var fld = AdfPage.PAGE.findComponent(planningTemplateId+":dirtyFlag");
    return fld.getValue();
}

function promptUserOnPageNavigation(isTLRunTime){
    if(isFormDirty() == true || isFormDirty() == "true"){
        invokeDialog(getPromptDialogId(isTLRunTime));
        return false;
    }
    return true;
}

function closePromptConfirmationDialog(popupId){
    var dialog = AdfPage.PAGE.findComponentByAbsoluteId(popupId);//  Common dialog for confirmation messages
    dialog.hide();
}

function getPromptDialogId(isTLRuntimeNav){
    var dlgId = planningTemplateId+":promptDlg";
    if(isTLRuntimeNav && isTLRuntimeNav == "Y"){
        var rgn = AdfPage.PAGE.findComponent(planningTemplateId+":"+planningRegionId);
        if(rgn){
            rgn = rgn.findComponent("taskPromptDlg");
            dlgId = rgn.getClientId();
        }
    }
    return dlgId;
}

function confirmationOnClick(ev){
    var dialogType = ev.getSource().getProperty("type");
    var isTLRuntimeNav = ev.getSource().getProperty("TL_RT");
    var dlgId = getPromptDialogId(isTLRuntimeNav);
    closePromptConfirmationDialog(dlgId);
    ev.cancel();
    if(dialogType == "ok"){
        setDirtyFlag(false); // reset flag so that navigation will proceed.
        if(isTLRuntimeNav && isTLRuntimeNav == "Y"){ // For task list runtime navigation
            triggerActionAfterUserPrompt(); // This is defined in DisplayUserTask.jsff
        }else if(invocationPattern == "GEN"){
            loadModuleInContentPaneWrkSpace(g_mod, g_folderId, g_formId, g_searchFormName,g_adhocSessionIdForForm);
        }else if(invocationPattern == "TASK"){
            loadTaskListRunTimeModuleInContentPaneWrkSpace(g_mod, g_folderId, g_taskListId, g_taskId, g_taskType, g_dpTypeId, g_scenarioId, g_versionId, g_yearId, g_tlArtifactType, g_tlArtifactId);
        }else if(invocationPattern == "TASKLIST"){
            loadTaskListStatusWizard(g_mod, g_folderId, g_chartViewType);
        }
    }
}

// To avoid additonal call to slick frame when popup is closed
function handleSlickGridFrameOnClose(ev){
    var formType = ev.getSource().getProperty("formType");
    if(formType == "S"){
        var formId = ev.getSource().getProperty("gridFormId");
        var slickFrame = getObjectByIdInRegion("slickFrame"+formId);
        if(slickFrame){
            slickFrame.setSource("");
        }
    }
    closeDlg(ev);
}

function closeDlg(ev){
    //Bug 19992951
    if(bSlickGrid) {  
        resetFormatOptions();
    }
    var objId = ev.getSource().getProperty("objId");
    var popupObj = ev.getSource().findComponent(objId);
    if(popupObj){ 
        completeClientId = popupObj.getClientId();    
    }
    // 18686441 - Instead of objId, we could pass completeClientId and eliminate the last condition. 
    // To mimimize the testing areas have included the additonal condition towards end.
    closeDlgById(objId,completeClientId);
}

function closeDlgById(objId,completeClientId){
    // When clientId is available, it should work always. Hence removed other conditions.
    var obj = AdfPage.PAGE.findComponent(completeClientId);
    if(obj){
        obj.hide();
    }
}

// Resizing dialogue - Starts
function resizeStandardMessageDialog(docId, contentWidth, contentHeight,dlgId) {
    // Note this value may change from release to release
    var defMDName = "::"+dlgId;
    //Find the default messages dialog
    msgDialogComponent = AdfPage.PAGE.findComponentByAbsoluteId(docId + defMDName); 
    if(msgDialogComponent){
        if (isValidSizeEntered(contentWidth)){
            msgDialogComponent.setContentWidth(contentWidth);
        }
        if (isValidSizeEntered(contentHeight)){
            msgDialogComponent.setContentHeight(contentHeight);
        }
    }
} 

function isValidSizeEntered(size){
    return (!isNaN(size) && size > 0);
}

 /**
 *  Default sizing applied by the framwork can be overridden using following method
 */
function initializeDefaultMessageDialogSize(loadEvent){
    //get the configuration information
    var documentId    = loadEvent.getSource().getProperty('documentId');
    var width         = loadEvent.getSource().getProperty('defWidth');
    var height        = loadEvent.getSource().getProperty('defHeight');
    var dlgId         = loadEvent.getSource().getProperty('dlgId');
    resizeStandardMessageDialog(documentId, width, height,dlgId);
}
// Resizing dialogs - Ends

function closeCurrentWSWindow(rsModuleId){
    if (workspaceWindow.gModuleManager) {
        var rModule = workspaceWindow.gModuleManager.getModuleById(rsModuleId);
        if (rModule) {
            rModule.setDirty(false);
            rModule.dispatchEvent(new workspaceWindow.BiEvent(workspaceWindow.bpm.common.Constants.EVENT_CLOSE_OK));
        }
    }
}

function launchModuleInWsTab(moduleToLoad,sourceApp,formId,title){
    var rastParam = new Array();
    rastParam["moduleToLoad"] = moduleToLoad;
    rastParam["sourceApp"] = sourceApp;
    rastParam["formId"] = formId;
    rastParam["title"] = title;
    openModuleInNewTab(rastParam);
}

function loadPUHImport() {
    var field = AdfPage.PAGE.findComponent(planningTemplateId+":"+planningRegionId).findComponent("puhImpExp");
    AdfActionEvent.queue(field, true);
}


function loadExtModuleInWs(app){
    try{
        var ctxParam = "cas";
        var moduleId = "cas.containers.tadpole";
        if(app == "calc"){
            ctxParam = "calcmgr";
            moduleId = "calcmgr.filterview";
        }
        var calcMgrContext=workspaceWindow.gContextManager.getContext(ctxParam);
        if(!calcMgrContext.isLoaded()){
            calcMgrContext.load();
        }
        
        var fvModule = workspaceWindow.gModuleManager.getModuleById(moduleId);
        var params = {
        };
        params[workspaceWindow.bpm.common.ModuleManager.SSO_TOKEN_PARAM] = workspaceWindow.gModuleManager.getToken();
        params[workspaceWindow.bpm.common.Constants.PARAM_SHOW_PROGRESS_DIALOG] = true;
        if (fvModule == null) {
            rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup());
            if (rContainer) {
                rModule = rContainer.getHandler().loadModuleAsync(moduleId, params, null, null);
            }
        }
        else {
            fvModule.getHandler().loadObject(null, params.objectType, true, false, params);
        }
    }catch(e){
        alert("Exception caught" + e);
    }
}


function closeCurrentWSTab(){
    if (workspaceWindow.gModuleManager) {
        var rModule = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup()).getHandler().getActiveModule();
        if (rModule) {
            rModule.getParentHandler().unloadModule(rModule);
        }
    }
    
}

function closePlanningAppWSTabs(){
	/****************************************************************************************************************
	*****   Modification Start
	*****************************************************************************************************************/
	if(parent.c_validate()){
		parent.menuSave();
	}
	/****************************************************************************************************************
	*****   Modification End
	*****************************************************************************************************************/
    if(!workspaceWindow.gModuleManager)
      return;
    var rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup()).getHandler();
    if(rContainer) {
        var rContext = workspaceWindow.gContextManager.getContext("HyperionPlanning");
        var raModules = rContext.getModules();
        
        for (var iModule = 0; iModule < raModules.length; iModule++)
        {
            var rModule = raModules[iModule];
            // Figure out if rModule is the one you want to close
            if(rModule.getId().indexOf("HyperionPlanning.planning") != -1) {
                try{
                  rModule.getParentHandler().unloadModule(rModule);
                }catch(ex){}
            }
        }
    }
    
}



function popupClosedListener(event) 
{
     var source = event.getSource();
     var popupId = source.getClientId();
     var params = {};
     params['popupId'] = popupId;
     // Embeding Regions inside PopUp WindowsFunctional
     var type = "serverPopupClosed";
     var immediate = true;
     AdfCustomEvent.queue(source, type, params, immediate);
     try{
        showGridBtns();
     }catch(e){}
}

function msPopupClosedListener(event) {
  var source = event.getSource();
  var popupId = source.getClientId();
  var params = {
  };
  params['popupId'] = popupId;
  // Embeding Regions inside PopUp WindowsFunctional
  var type = "msPopupClosed";
  var immediate = true;
  AdfCustomEvent.queue(source, type, params, immediate);
}

/*
function performRTPLaunch(ev){
    AdfActionEvent.queue(ev.getSource().findComponent("fr").findComponent("butLaunch"),true);
}
*/

function closeRTPDialog(){
    var root = AdfPage.PAGE.findComponent("planRgnBR");
    if(root){
        root = root.findComponent("rtp");
        if(root){
            root.hide();
        }
    }
}

function launchRTPDialog(){
    var rtp = getObjectByIdInRegion("rtp");    
    //alert(rtp.getClientId())
    invokeDialog(rtp.getClientId());
}


 
function triggerNavigationToParentUI(mod){
    var root = null;
    if(mod == "grid"){
        root = AdfPage.PAGE.findComponent("f").findComponent("fr").findComponent("loadParentView");
    }else if(mod == "tlrule"){
        root = AdfPage.PAGE.findComponent("t").findComponent("tfr").findComponent("loadParentView");
    }else if(mod == "tlgrid"){
        root = AdfPage.PAGE.findComponent("t").findComponent("tfr").findComponent("fr").findComponent("loadParentView");
    }else{
        root = AdfPage.PAGE.findComponent("planRgnBR");
        if (root) {
            root = AdfPage.PAGE.findComponent("planRgnBR").findComponent("loadParentView");
        }
        else {
            root = AdfPage.PAGE.findComponent("consoleRgn");
            if (root) {
                root = AdfPage.PAGE.findComponent("consoleRgn").findComponent("jobsListing").findComponent("jobSched").findComponent("sched:r1").findComponent("loadParentView");
            }
        }
    }   
    if(root){
        AdfActionEvent.queue(root,true)
    }
 }
 
function triggerNavigationInRTPUI(){
    // TODO reviist this
    // Case 1 : When invoked from BR page   
    try{
        var field = AdfPage.PAGE.findComponent("planRgnBR").findComponent("fr").findComponent("hiddenbut");
        AdfActionEvent.queue(field,true);
        return;
    }catch(e){}
    
    //Case 2: Rule from TL
    try{
        var field = AdfPage.PAGE.findComponent("t").findComponent("tfr").findComponent("rf").findComponent("hiddenbut");
        AdfActionEvent.queue(field,true);
        return;
    }catch(e){}
    
    // Case 3: Run on save - forms list
    try{
        var field = AdfPage.PAGE.findComponent("f").findComponent("fr").findComponent("rf").findComponent("hiddenbut");
        AdfActionEvent.queue(field,true);
        return;
    }catch(e){}
    
    // Case 4: Run on save - forms from TL 
    try{
        var field = AdfPage.PAGE.findComponent("t").findComponent("tfr").findComponent("fr").findComponent("rf").findComponent("hiddenbut");
        AdfActionEvent.queue(field,true);
        return;
    }catch(e){}
    
}
 

function callServerListener(clickEvent) {
    var eventSource = clickEvent.getSource();
    AdfCustomEvent.queue(eventSource, "showWallPanel", {},false);
}

function launchURLInNewWindow(ev){
    var url         = ev.getSource().getProperty("url");
    var wsurl       = ev.getSource().getProperty("wsurl");
    var ssotoken    = ev.getSource().getProperty("ssotoken");
    if(url.indexOf("module=tools.relatedcontent")>-1){
        url = wsurl+"?"+url.trim();
        launchArtifactInWorkspace(-1, -1, url, ssotoken, "");
    }else{
        window.open(url);    
    }
    ev.cancel();
}

// To update header label on client when we navigate to adhoc form
function updateTitleForParentHeader(newLbl,restoreOrg){
    var container = "";
    var headerFld = "";
    if(AdfPage.PAGE.findComponent("f")){
        container = AdfPage.PAGE.findComponent("f");
    }else if(AdfPage.PAGE.findComponent("t")){
        container = AdfPage.PAGE.findComponent("t").findComponent("tfr");
    }
    if(container){
        headerFld = container.findComponent("headerTitle");
        headerFld.setValue(newLbl);
        if(restoreOrg){
            var orgHeaderFld = container.findComponent("orgHeaderTitle");
            headerFld.setValue(orgHeaderFld.getValue());
        }
        
    }
    
}

function getContainerForGridOperationsButtons(){
    var container = "";
    if(AdfPage.PAGE.findComponent("f")){
        container = AdfPage.PAGE.findComponent("f");
    }else if(AdfPage.PAGE.findComponent("t")){
        container = AdfPage.PAGE.findComponent("t").findComponent("tfr");
    }
    return container;
}

function showGridBtns(){
    var container = getContainerForGridOperationsButtons();
    var save = "";
    var action = "";
    var refresh = "";
    
    if(container){
        save = container.findComponent("cbs");
        action = container.findComponent("ga");
        refresh = container.findComponent("cbr");
        if(save){
            save.setVisible(true);
        }
        if(action){
            action.setVisible(true);
        }
        if(refresh){
            refresh.setVisible(true);
        }
    }
}

function initScreenWidthForFuseDesktop(ev){
    try{
        var fld = ev.getSource().findComponent("fuseDesktopClientWidth");
        if(fld){
            fld.setValue(document.body.offsetWidth);
        }
    }catch(e){}
}

function launchApp(ev){
    var fld = ev.getSource().findComponent("launchApp");
    AdfActionEvent.queue(fld, true);
}
 
function launchNavigatorModule(ev){
    var modId = ev.getSource().getProperty("modId");
    var modType = ev.getSource().getProperty("modType");
    var modUrl = ev.getSource().getProperty("modUrl");
    var ssoToken = ev.getSource().getProperty("ssoToken");
    var reqParams = ev.getSource().getProperty("reqParams");
    if (modId == "time")
        return;
    launchArtifactInWorkspace(modId, modType, modUrl, ssoToken, reqParams);
    AdfCustomEvent.queue(ev.getSource(), "navigationEvent", {}, true);   
}

function launchArtifactInWorkspace(modId, modType,modUrl, ssoToken, reqParams) {
    var url = ""; 
    if (modType == 2) {
        if(modId == "fr"){
            launchFRDesignerInstaller(modUrl, ssoToken);
            return;
        }
        url = modUrl;
    }
    else if (modType == 3) {
        url = modUrl + reqParams;
        if (modId == "feed") {
            g_ssoToken = ssoToken;
            FBT.start();
            return;
        }
    }
    else {
        url = modUrl;
    }
    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", url);
    form.setAttribute("target", "ADMINFORM");
    
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("name", "sso_token");
    hiddenField.setAttribute("value", ssoToken);
    hiddenField.setAttribute("type", "hidden");
    form.appendChild(hiddenField);
    
    document.body.appendChild(form);
    if (g_navigationWindow == null || g_navigationWindow.closed) {
        g_navigationWindow = window.open("", "ADMINFORM", "width=1200,height=700,resizable=yes", true);
    }
    else {
        g_navigationWindow.close();
        g_navigationWindow = window.open("", "ADMINFORM", "width=1200,height=700,resizable=yes", true);
        //return;
    }
    if (g_navigationWindow) {
        form.submit();
    }                    
}

function launchFRDesignerInstaller(modUrl, ssoToken){
    var url = ""; 
    //var workspaceContextUrl = workspaceWindow.gModuleManager.getStartupContextPath();
    //var ssoToken = workspaceWindow.gModuleManager.getToken(); 
    var workspaceContextUrl = modUrl;
    url = workspaceContextUrl.substring(0,workspaceContextUrl.lastIndexOf("/"));
    url = url + "/hr/modules/com/hyperion/reporting/web/common/HRStudioRetrieve.jsp";
    //url = url + "/epmstatic/reporting_analysis/client/FinancialReportingStudio.exe";

    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", url);
    form.setAttribute("target", "FRDESIGNER");
    
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("name", "sso_token");
    hiddenField.setAttribute("value", ssoToken);
    hiddenField.setAttribute("type", "hidden");
    form.appendChild(hiddenField);
    
    document.body.appendChild(form);
    
    map = window.open( "", "FRDESIGNER", "width=600,height=400");
    if (map) {
        form.submit();
    }                         
}

function navigateToTask(ev){
    var taskId = ev.getSource().getProperty("taskId");
    var taskType = ev.getSource().getProperty("taskType");
    var taskUrl = ev.getSource().getProperty("taskUrl");
    var dimensionId = ev.getSource().getProperty("dimensionId");
    var formId = ev.getSource().getProperty("formId");
    var formFolderId = ev.getSource().getProperty("formFolderId");
    
    AdfCustomEvent.queue(ev.getSource(), "navigate", {taskId : taskId,taskType:taskType,taskUrl:taskUrl,dimensionId:dimensionId,formId:formId,formFolderId:formFolderId}, true);   
}

function fireEventForButtonById(objId){
    var obj = AdfPage.PAGE.findComponent(objId);
    if(obj){
        AdfActionEvent.queue(obj,true);
    }
}

function alignPopupForSlickGrid(popupId, alignId, activeCellPosition) {
    var placeHolder = getObjectByIdInRegion(alignId);
    placeHolder.setVisible(true);
    var placeHolderDom = AdfRichUIPeer.getDomElementForComponent(placeHolder);
    placeHolderDom.style.zIndex = 2;
    placeHolderDom.style.position = "fixed";
    placeHolderDom.style.top = activeCellPosition.bottom + 73 + "px";
    placeHolderDom.style.left = activeCellPosition.left + 40 + "px";

    var popup = getObjectByIdInRegion(popupId);
    if(popup.isPopupVisible()) {
        popup.hide();
    }
    var hints = {};
    hints[AdfRichPopup.HINT_LAUNCH_ID] = placeHolder.getClientId();
    hints[AdfRichPopup.HINT_ALIGN_ID] = placeHolder.getClientId();
    hints[AdfRichPopup.HINT_ALIGN] = AdfRichPopup.ALIGN_AFTER_START;
    
    popup.show(hints);

}

function slickPopupClosed() {
    if(bSlickGrid) {
        var placeHolder = page.findComponent("placeHolder");
        if(placeHolder) {
            placeHolder.setVisible(false);
        }
    }
}

function isSmartListPopupOpen(popupId) {
    if(document.getElementById(popupId).parentNode.parentNode.parentNode.parentNode.parentNode.nodeName == 'DIV')
        return true;
    
    return false;
}

function doLockForSlickGrid() {
    if(slickFrame && slickFrame.Slick) {
        slickFrame.DoLock();
    }    
}

function updateSmartListSelection(selCode) {
    if(slickFrame && slickFrame.Slick) {
        slickFrame.updateSmartListSelection(selCode);
    }     
}

function setSlickGrid(bSlick, enableFastSave) {
    bSlickGrid = bSlick;
    if(bSlick) {
        slickFrame = getSlickFrame();
        bSlickFastSave = enableFastSave;
    } else {
        slickFrame = null;
        bSlickFastSave = null;
    }
}

function setSlickSelection() {
    if(bSlickGrid) {
        if(slickFrame && slickFrame.Slick) {
            slickFrame.setSlickSelection();
        }         
    }

}

function doAdjustDataFromGridSpread(row, col, adjustedValue)
{
    if(bSlickGrid) {
        if(slickFrame && slickFrame.Slick) {
            slickFrame.doAdjustDataFromGridSpread(row, col, adjustedValue);
        }        
    }
} 

function doGridSpread(row, col, pattern, spreadValue)
{
    if(bSlickGrid) {
        if(slickFrame && slickFrame.Slick) {
            slickFrame.doGridSpread(row, col, pattern, spreadValue);
        }         
    }
} 

function triggerSlickPostAction(hasCellAttachOrNote)
{
    if(bSlickGrid) { 
        if(slickFrame && slickFrame.Slick) {
            slickFrame.triggerSlickPostAction(slickOperation, hasCellAttachOrNote);
        }         
    }
} 

function formatSlickGridCell(sourceId, newColor, fontSize)
{
    if(bSlickGrid) { 
        if(slickFrame && slickFrame.Slick) {
            slickFrame.formatSlickGridCell(sourceId, newColor, fontSize);
        }         
    }
} 

function saveFormatting(btnId)
{
    if(bSlickGrid) { 
        if(slickFrame && slickFrame.Slick) {
            slickFrame.saveFormatting(btnId);
        }         
    }
}

function updateFormatmapForSlickGrid(btnId) {
     var updateFrMapBtn = AdfPage.PAGE.findComponentByAbsoluteId(btnId);
     AdfActionEvent.queue(updateFrMapBtn, updateFrMapBtn.getPartialSubmit());
}

function clearFormatting(btnId)
{
    if(bSlickGrid) { 
        if(slickFrame && slickFrame.Slick) {
            slickFrame.clearFormatting(btnId);
        }         
    }
}

function clearAllFormatting(){
    if(bSlickGrid) { 
        if(slickFrame && slickFrame.Slick) {
            slickFrame.clearAllFormatting();
            sGUserDefinedFormat = false;
            slickFrame.setUserDefinedFormat(false);
        }         
    }
}

function setDefaultFormat(format)
{
    if(bSlickGrid) { 
        if(slickFrame && slickFrame.Slick) {
            var fmt = false;
            if(format=="true"){
                    fmt = true
            }
            sGDefaultFormat = fmt;
            slickFrame.setDefaultFormat(fmt);
        }         
    }
}

function setUserDefinedFormat(format)
{
    if(bSlickGrid) { 
        if(slickFrame && slickFrame.Slick) {
	    var fmt = false;
            if(format=="true"){
                fmt = true
            }
            sGUserDefinedFormat = fmt;
            slickFrame.setUserDefinedFormat(fmt);
        }         
    }
}

function getSlickFrame() {
    for(var i=0; i<10; i++) {
        if(this[i] && this[i].Slick) {
            return this[i];
        }
    }
}


function showDPAttachementLink(event) {
    var UrlLink = event.getSource().getProperty("UrlLink");
    if(UrlLink != null && UrlLink.length > 0 && workspaceWindow.gModuleManager != null) {
        workspaceWindow.gModuleManager.launchRelatedContentUri(UrlLink);
    } else if(UrlLink != null && UrlLink.length > 0) {
        var linkWin = window.open(UrlLink, null);
        linkWin.focus();
    }
}

function resetFormatOptions(){
	sGDefaultFormat = true;
	sGUserDefinedFormat = true;
        if(top.sGaftersave){
            top.sGaftersave =false;
        }
        if(top.sGActiveCell){
            top.sGActiveCell = null;
        }
        if(top.sGFormatCache){
            top.sGFormatCache =null;
        }
        if(top.sGapplyFormat){
            sGapplyFormat = false;
        }
        if(top.sGActiveRange){
            top.sGActiveRange = null;
        }
        var params = {};
        params['operation'] = "delexlformat";
        AdfCustomEvent.queue(getObjectByIdInRegion("triggerSlickAction"), "triggerSlickAction", params, true);


}

function slickGridOperations(slickOperation){
    if(slickOperation == "cut") {
        slickFrame.slickActionDoCut();
    } else if(slickOperation == "copy") {
        slickFrame.slickActionDoCopy();            
    } else if(slickOperation == "paste") {
        slickFrame.slickActionDoPaste();
    } else if(slickOperation == "delete") {
        slickFrame.slickActionDoDelete();
    }  else if(slickOperation == "cacheLastSelected"){ 
        slickFrame.cacheLastSelected();
    }
}

function launchSimplifiedUI(ev){
    var modUrl   = ev.getSource().getProperty("modUrl");
    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", modUrl);
    form.setAttribute("target", "ADMINFORM");
    
    document.body.appendChild(form);
    var g_fuseWindow = window.open("", "ADMINFORM", "resizable=yes", true);
    if (g_fuseWindow) {
        form.submit();
    }

    closeCurrentWSTab();  
    closePlanningAppWSTabs(); // In case of planner app we need to close the open app also
}

function adjustFrameForRibbon(newSize){
//    if (newSize > slickFrame.$(".slick-header.ui-state-default").width()){
//        var sizeDiff = slickFrame.$("#myGrid").width()-newSize-80;
//            
//        var viewportW = slickFrame.$(".slick-viewport").last().width() - sizeDiff;
//        var headerW = slickFrame.$(".slick-header.ui-state-default").width() - sizeDiff;
//        
//        slickFrame.$(".slick-viewport").last().css('width',viewportW+'px');
//        slickFrame.$(".slick-header.ui-state-default").css('width',headerW+'px');
//    } else {
        var newViewportSize = Math.floor(newSize - slickFrame.$(".slick-viewport").first().width());
        slickFrame.$(".slick-viewport").last().css('width',newViewportSize+'px');
        
        slickFrame.$(".slick-header.ui-state-default").css('width',newViewportSize+'px');
//    }
//     slickFrame.$(".slick-header.ui-state-default");
//    slickFrame.$("#myGrid").css('width','newSize');
    slickFrame.setDefaultFormat(true);
}
