/****************************************************************************************************************
 ***** Modification Start
 *****************************************************************************************************************/
logger("Central Triggered in following window: ");
logger(window);


//Set Debugging ON/OFF
var debug = true;

//Reusable variables (May change for a given form)
var data;
var rows;
var columns;
var collapsedRows;
var properties;
//var gridIDs; //Used while Checking collapsed rows, compare rows in same grids

//Global Variables for modified Script (Prefix c_ to avoid duplicates)
var c_dataGrid = []; //Array having member names, tabs and data grabbed from the data form.
var c_pageVariable;
var c_tabs;
var c_tabIDs;
var c_currentTabIndex;
var c_formName;
var c_appName;
var c_dataGridElement;
var c_userVariables;
var c_BR;

//XMLHttpRequest timeout set to 3 seconds for each background request send.
var c_XHRTimeout  = 3000;

//Member Names (Alias) which has Date data type
var DateFormatMembersAlias = new Array("Output Start Date", "Output End Date", "Start Date", "End Date", "Planned Position Start Date", "Planned Position End Date", "Entry on Duty", "Contract End Date", "Position Action Effective Date", "Projected Separation Date", "Appropriation Year Start Date", "Preliminary Year Start Date", "Appropriation Year End Date", "Preliminary Year End Date");

//Character limit for following members
var MembersLength = new Array(
    /*For Alias(Default)*/
    30, 228, 242, 300, 1000, 1000, 1000, 300, 300, 300, 1000, 300, 300, 300, 1000, 1000, 1000, 1000, 300, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 300, 300, 1000, 300, 2000, 2000, 2000, 25, 20, 1000, 1000, 300, 1000, 1000, 2000, 2000, 2000, 1000,

    /*For Alias(Reporting)*/
    30, 228, 242, 300, 1000, 1000, 1000, 300, 300, 300, 1000, 300, 300, 300, 1000, 1000, 1000, 1000, 300, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 300, 300, 1000, 300, 2000, 2000, 2000, 25, 20, 1000, 1000, 300, 1000, 1000, 2000, 2000, 2000, 1000); // Specifiy there corresponding lengths

//Member Names (Alias) which has character limit
var MembersAlias = new Array(
    /*Alias(Default)*/
    "Short Name (30 Characters)", "Long Name (80 Characters)",

    /*Alias(Reporting)*/
    "Short Name", "Long Name");

//Global(For all members) character limit
var MaxLengthAllowed = 2000;

//SmartList with corresponding ids
var c_smartLists = {
    "P_S": ["Abolished", "Retained"],
    "P_F": {
        "Geneva": 5,
        "Guatemala": 10,
    },
    "Grades": {
        "ADG": 1,
        "D1": 2,
        "D2": 3,
        "DDG": 4,
        "DG": 5,
    }
};

//All the validatons of each forms takes place in this function
function c_validate() {
    //skip validate if no form found
    if (!c_formName) {
        logger("[DEBUG] Form Name undefined. Skip validation.");
        return true;
    }

    if (equalsIgnoreCase(c_appName, "App1") || equalsIgnoreCase(c_appName, "App2")) {
		
		// Force check if Grid 0 exists, if not, it will request in background.
		checkGrid(0);
		
        //Global
        //Date
        try {
            //Loop for all grids
            //Bug fix: c_tabs.length is 0 when theres no tab
            var grids = c_tabs.length;
            if (grids == 0)
                grids = 1;
            for (var k = 0; k < grids; k++) {
                if (checkGrid(k)) {
                    for (var gridInd = 0; gridInd < c_dataGrid[k].length; gridInd++) {
                        for (r = 0; r < c_dataGrid[k][gridInd][0].length; r++) {
                            for (c = 0; c < c_dataGrid[k][gridInd][0][r].length; c++) {

                                if (c_dataGrid[k][gridInd][4][r][c] == 1) {

                                    var M = c_getMem(r, c, k, gridInd);
                                    var connne = c_arrayContains(M, DateFormatMembersAlias);
                                    if (connne) {
                                        var value = c_dataGrid[k][gridInd][0][r][c];
                                        if (value != "") {
                                            var checkdateformat = isValidDate(value);
                                            if (!checkdateformat) {
                                                alert("Error: Invalid Date Format . Date Format Should Be YYYY/MM/DD");
                                                //cancelDrag();
                                                c_enterCell(r, c, k, gridInd);
                                                return false;

                                            }
                                        }
                                    }

                                }
                            }
                        }
                    }

                }
            }
            //setCurrentGrid(currentGridIndex);
        } catch (err) {
            logger("[Error] Global Date format check.");
			logger(err);
        }


        //FORM 2
        if ((equalsIgnoreCase(c_formName, "Form_x"))) {
            var Grade_P_min = 14;
            var Grade_P_max = 18;
            var Grade_D_min = 1;
            var Grade_D_max = 5;
            var Grade_G_min = 6;
            var Grade_G_max = 13;

            var Position_State = 0;
            var Position_Title = 3;
            var Standard_Cost_Grade = 4;
            var Standard_Cost_Grade_Bud = 4;
            var Standard_Cost_Grade_Act = 14;
            var Postion_Owing_Organisation = 5;
            var Position_FTE = 6;
            var Postion_Duty_Station = 7;
            var Postion_Duty_Station_Act = 22;
            var Postion_Fund = 8;
            var Nature_of_Position_Bud = 2;
            var Nature_of_Position_Act = 13;
            var Vacant_Since_Date = 24;
            var Planned_Position_Start_Date = 9;
            var Planned_Position_End_Date = 10;
            var Position_Action_Effective_Date = 11;
            var Duty_Station_Change = 26;
            var Position_Reclassified = 28;
            var FTE_Change = 29;
            var Position_Redeployed = 30;
            var Position_Title_Change = 31;
            var Position_Actions_Justification = 32;
            var Acc_Field_1 = 35;
            var Acc_Field_2 = 36;
            var Biennium_Start_Date_1 = 33;
            var Biennium_End_Date_1 = 34;
            var Postion_Fund_Act = 23;
            var Biennium_Start_Date;
            var Biennium_End_Date;

            for (r = 0; r < c_dataGrid[0][0][0].length; r++) {
                /*******Function Check returns 0  if date1 > date2 else returns 1***********/
                try {
                    if ((equalsIgnoreCase(c_formName, "02. HR position planning")) || (equalsIgnoreCase(c_formName, "FormY."))) {
                        Biennium_Start_Date = c_dataGrid[0][0][0][r][Biennium_Start_Date_1]; /*** UNDEFIENeD ***/
                        Biennium_End_Date = c_dataGrid[0][0][0][r][Biennium_End_Date_1]; /*** UNDEFIENeD ***/
                    }
                    var P_P_S_D = c_dataGrid[0][0][0][r][Planned_Position_Start_Date];
                    var P_P_E_D = c_dataGrid[0][0][0][r][Planned_Position_End_Date];
                    var P_A_E_D = c_dataGrid[0][0][0][r][Position_Action_Effective_Date];
                    var D_S_C = c_dataGrid[0][0][0][r][Duty_Station_Change]; /*** UNDEFIENeD ***/
                    var P_Rec = c_dataGrid[0][0][0][r][Position_Reclassified];
                    var F_C = c_dataGrid[0][0][0][r][FTE_Change];
                    var P_Red = c_dataGrid[0][0][0][r][Position_Redeployed];
                    var P_Tit_C = c_dataGrid[0][0][0][r][Position_Title_Change];
                    var P_A_J = c_dataGrid[0][0][0][r][Position_Actions_Justification];
                    var P_A_F_P = c_dataGrid[0][0][0][r][Acc_Field_1]; /*** UNDEFIENeD ***/
                    var P_A_F_O = c_dataGrid[0][0][0][r][Acc_Field_2]; /*** UNDEFIENeD ***/
                    var P_FTE = c_dataGrid[0][0][0][r][Position_FTE];
                    var P_S = c_dataGrid[0][0][0][r][Position_State];
                    var P_T = c_dataGrid[0][0][0][r][Position_Title];
                    var S_C_Grade = c_dataGrid[0][0][0][r][Standard_Cost_Grade]; /*** UNDEFIENeD ***/
                    var P_O_O = c_dataGrid[0][0][0][r][Postion_Owing_Organisation];
                    var P_D_S = c_dataGrid[0][0][0][r][Postion_Duty_Station];
                    var P_D_S_Act = c_dataGrid[0][0][0][r][Postion_Duty_Station_Act];
                    var bud_val = c_dataGrid[0][0][0][r][Standard_Cost_Grade_Bud];
                    var act_val = c_dataGrid[0][0][0][r][Standard_Cost_Grade_Act];
                    var N_O_P_Act = c_dataGrid[0][0][0][r][Nature_of_Position_Act];
                    var N_O_P_Bud = c_dataGrid[0][0][0][r][Nature_of_Position_Bud];
                    var V_S_D = c_dataGrid[0][0][0][r][Vacant_Since_Date];
                    var P_F = c_dataGrid[0][0][0][r][Postion_Fund];
                    var R_A_C = c_dataGrid[0][0][0][r][Postion_Fund_Act];
                } catch (err) {
                    logger("[ERROR] 02. HR position planning");
                    console.log(err);
                }


                var check = checkdate(P_P_S_D, Biennium_Start_Date);
                var check3 = checkdate(Biennium_End_Date, P_P_S_D);
                if (check == 1 || check3 == 1) {
                    alert("Error: Planned Position Start Date should be between Biennium Start & End Date.");
                    //cancelDrag();
                    c_enterCell(r, Planned_Position_Start_Date, 0);
                    return false;
                    exit;
                }

                var check1 = checkdate(P_P_S_D, P_P_E_D);
                if (check1 == 0) {
                    alert("Error: Planned Position End Date should be greater than Planned Position Start Date.");
                    //cancelDrag();
                    c_enterCell(r, Planned_Position_End_Date, 0);
                    return false;
                    exit;
                }

                if (P_A_E_D == "") {
                    alert("Error: Position Action Effective Date cannot be blank.");
                    console.log("PAED");
                    //cancelDrag();
                    c_enterCell(r, Position_Action_Effective_Date, 0);
                    return false;
                    exit;
                }



                var check2 = checkdate(P_A_E_D, Biennium_Start_Date);
                var check3 = checkdate(Biennium_End_Date, P_A_E_D);
                if (check2 == 1 || check3 == 1) {
                    alert("Error: Position Action Effective Date should be within Planned Start & End Date.");
                    //cancelDrag();
                    c_enterCell(r, Position_Action_Effective_Date, 0);
                    return false;
                    exit;
                }


                if (P_S == "") {
                    alert("Error: Position State cannot be Blank.");
                    console.log("PS");
                    //cancelDrag();
                    c_enterCell(r, Position_State, 0);
                    return false;
                    exit;
                }
                if (P_S == "New" || P_S == "New as Redeployment" || P_S == "New for Modification") {
                    if (P_T == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PT");
                        //cancelDrag();
                        c_enterCell(r, Position_Title, 0);
                        return false;
                        exit;
                    }
                    if (S_C_Grade == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("SCGrade");
                        //cancelDrag();
                        c_enterCell(r, Standard_Cost_Grade, 0);
                        return false;
                        exit;
                    }
                    if (P_O_O == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("POO");
                        //cancelDrag();
                        c_enterCell(r, Postion_Owing_Organisation, 0);
                        return false;
                        exit;
                    }
                    if (P_FTE == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PFTE");
                        //cancelDrag();
                        c_enterCell(r, Position_FTE, 0);
                        return false;
                        exit;
                    }
                    if (P_D_S == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PDS");
                        //cancelDrag();
                        c_enterCell(r, Postion_Duty_Station, 0);
                        return false;
                        exit;
                    }
                    if (P_P_S_D == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PPSD");
                        //cancelDrag();
                        c_enterCell(r, Planned_Position_Start_Date, 0);
                        return false;
                        exit;
                    }
                    if (P_P_E_D == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PPED");
                        //cancelDrag();
                        c_enterCell(r, Planned_Position_End_Date, 0);
                        return false;
                        exit;
                    }
                    if (P_A_E_D == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PAED");
                        //cancelDrag();
                        c_enterCell(r, Position_Action_Effective_Date, 0);
                        return false;
                        exit;
                    }
                    if (N_O_P_Bud == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("NOP");
                        //cancelDrag();
                        c_enterCell(r, Nature_of_Position_Bud, 0);
                        return false;
                        exit;
                    }
                    if (P_S == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PS");
                        //cancelDrag();
                        c_enterCell(r, Position_State, 0);
                        return false;
                        exit;
                    }
                    if (P_F == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PF");
                        //cancelDrag();
                        c_enterCell(r, Postion_Fund, 0);
                        return false;
                        exit;
                    }
                    if (P_A_J == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PAJ");
                        //cancelDrag();
                        c_enterCell(r, Position_Actions_Justification, 0);
                        return false;
                        exit;
                    }
                    if (P_A_F_P == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PAFP");
                        //cancelDrag();
                        c_enterCell(r, Acc_Field_1, 0);
                        return false;
                        exit;
                    }
                    if (P_A_F_O == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        console.log("PAFO");
                        //cancelDrag();
                        c_enterCell(r, Acc_Field_2, 0);
                        return false;
                        exit;
                    }

                    if (N_O_P_Bud == "CFE/JPO") {
                        //if(P_F == 1 || P_F == 4 || P_F == 5 || P_F == 6 || P_F == 7 || P_F == 8 || P_F == 9 || P_F == 10 || P_F == 11 || P_F == 12 || P_F == 13 || P_F == 14 )
                        if (P_F == "RBF" || P_F == "NFB" || P_F == "Unfunded" || P_F == "UN Fund" || P_F == "MCIF-UF" || P_F == "MCIF-EB" || P_F == "MCIF-CO" || P_F == "MCIF" || P_F == "TCF" || P_F == "EBT" || P_F == "PCF" || P_F == "PSC") {
                            /*alert("TSPL : 535 Value for Position Number is "+Position_Number+"Value for Duty Station is "+P_D_S+"Value for Duty Station in Actual is "+P_D_S_Act);*/
                            alert("Error: Position Fund for CFE/JPO Position can only be EB");
                            //cancelDrag();
                            c_enterCell(r, Postion_Fund, 0);
                            return false;
                            exit;
                        }
                    }

                }

                if (P_S == "Abolish for Redeployment" || P_S == "Abolish for Modification") {
                    if (c_dataGrid[0][0][r][37] == "" || P_A_E_D == "") {
                        alert("Warning: Please Enter a Redeployment Reference.");
                        //cancelDrag();
                        c_enterCell(r, Position_Action_Effective_Date, 0);
                        return false;
                        exit;
                    }
                }


                if (P_S == "Retained") {
                    /*if(P_T == "" || (S_C_Grade == ""' || P_D_S_Act != "None") || P_O_O == "" || P_O_O == "None" || P_D_S == "" || P_D_S == "None" || P_P_S_D == ""  || P_P_E_D == ""  || P_A_E_D == ""   || N_O_P_Bud == ""  || P_S == "" || P_FTE == "" || P_FTE == "None" || P_F == "")
                    {
                    	alert("Warning: Please enter all valid attributes for the position");
                    	cancelDrag();
                    	EnterCellx(r, Planned_Position_Start_Date, true);
                    	return false;
                    	exit;
                    }*/


                    if (P_T == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Position_Title, 0);
                        return false;
                        exit;
                    }
                    if (S_C_Grade == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Standard_Cost_Grade, 0);
                        return false;
                        exit;
                    }
                    if (P_O_O == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Postion_Owing_Organisation, 0);
                        return false;
                        exit;
                    }
                    if (P_FTE == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Position_FTE, 0);
                        return false;
                        exit;
                    }
                    if (P_D_S == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Postion_Duty_Station, 0);
                        return false;
                        exit;
                    }
                    if (P_P_S_D == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Planned_Position_Start_Date, 0);
                        return false;
                        exit;
                    }
                    if (P_P_E_D == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Planned_Position_End_Date, 0);
                        return false;
                        exit;
                    }
                    if (P_A_E_D == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Position_Action_Effective_Date, 0);
                        return false;
                        exit;
                    }
                    if (N_O_P_Bud == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Nature_of_Position_Bud, 0);
                        return false;
                        exit;
                    }
                    if (P_S == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Position_State, 0);
                        return false;
                        exit;
                    }
                    if (P_F == "") {
                        alert("Warning: Please enter all valid attributes for the position");
                        //cancelDrag();
                        c_enterCell(r, Postion_Fund, 0);
                        return false;
                        exit;
                    }

                    if (P_D_S != P_D_S_Act) {
                        alert("Error: Position Duty Station can be updated only for a new Position.");
                        cancelDrag();
                        c_enterCell(r, Postion_Duty_Station, 0);
                        return false;
                        exit;
                    }
                    if (N_O_P_Act != N_O_P_Bud) {
                        alert("Error: Nature of Position can be updated only for a new Position.");
                        //cancelDrag();
                        c_enterCell(r, Nature_of_Position_Bud, 0);
                        return false;
                        exit;
                    }
                    if (R_A_C == "RBF") {
                        if (P_F != "RBF") {
                            /*alert("TSPL : 535 Value for Position Number is "+Position_Number+"Value for Duty Station is "+P_D_S+"Value for Duty Station in Actual is "+P_D_S_Act);*/
                            alert("Error: Position Fund can't be changed on Retained Position if Fund is RBF");
                            //cancelDrag();
                            c_enterCell(r, Postion_Fund, 0);
                            return false;
                            exit;
                        }
                    }
                    if (R_A_C == "MCIF") {
                        if (P_F != R_A_C) {
                            /*alert("TSPL : 535 Value for Position Number is "+Position_Number+"Value for Duty Station is "+P_D_S+"Value for Duty Station in Actual is "+P_D_S_Act);*/
                            alert("Error: Position Fund can't be changed on Retained Position if Fund is MCIF");
                            //cancelDrag();
                            c_enterCell(r, Postion_Fund, 0);
                            return false;
                            exit;
                        }
                    }
                    if (R_A_C == "PSC") {
                        if (P_F != R_A_C) {
                            /*alert("TSPL : 535 Value for Position Number is "+Position_Number+"Value for Duty Station is "+P_D_S+"Value for Duty Station in Actual is "+P_D_S_Act);*/
                            alert("Error: Position Fund can't be changed on Retained Position if Fund is PSC");
                            //cancelDrag();
                            c_enterCell(r, Postion_Fund, 0);
                            return false;
                            exit;
                        }
                    }


                    if (R_A_C == "EBN" || R_A_C == "NFB" || R_A_C == "Unfunded" || R_A_C == "EBR" || R_A_C == "TCF" || R_A_C == "EBT") {
                        if (P_F == "RBF") {
                            /*alert("TSPL : 535 Value for Position Number is "+Position_Number+"Value for Duty Station is "+P_D_S+"Value for Duty Station in Actual is "+P_D_S_Act);*/
                            alert("Error: Position Fund can't be changed on Retained Position to RBF");
                            //cancelDrag();
                            c_enterCell(r, Postion_Fund, 0);
                            return false;
                            exit;
                        }
                    }
                    //if(R_A_C == 2 || R_A_C == 3 || R_A_C == 4 || R_A_C == 5 || R_A_C == 11 || R_A_C == 12)
                    if (R_A_C == "EBN" || R_A_C == "NFB" || R_A_C == "Unfunded" || R_A_C == "EBR" || R_A_C == "TCF" || R_A_C == "EBT") {
                        if (P_F == "MCIF") {
                            /*alert("TSPL : 535 Value for Position Number is "+Position_Number+"Value for Duty Station is "+P_D_S+"Value for Duty Station in Actual is "+P_D_S_Act);*/
                            alert("Error: Position Fund can't be changed on Retained Position to MCIF");
                            //cancelDrag();
                            c_enterCell(r, Postion_Fund, 0);
                            return false;
                            exit;
                        }
                    }
                    //if(R_A_C == 2 || R_A_C == 3 || R_A_C == 4 || R_A_C == 5 || R_A_C == 11 || R_A_C == 12)
                    if (R_A_C == "EBN" || R_A_C == "NFB" || R_A_C == "Unfunded" || R_A_C == "EBR" || R_A_C == "TCF" || R_A_C == "EBT") {
                        if (P_F == "PSC") {
                            /*alert("TSPL : 535 Value for Position Number is "+Position_Number+"Value for Duty Station is "+P_D_S+"Value for Duty Station in Actual is "+P_D_S_Act);*/
                            alert("Error: Position Fund can't be changed on Retained Position to PSC");
                            //cancelDrag();
                            c_enterCell(r, Postion_Fund, 0);
                            return false;
                            exit;
                        }
                    }

                }

                if (P_S == "Retained" || P_S == "New" || P_S == "Abolished" || P_S == "New as Redeployment" || P_S == "Abolish for Redeployment" || P_S == "New for Modification" || P_S == "Abolish for Modification") {
                    if (P_FTE == "") {
                        alert("Warning: FTE value must be 1 OR 0.5.");
                        //cancelDrag();
                        c_enterCell(r, Position_FTE, 0);
                        return false;
                        exit;
                    }
                }
                if (P_S == "New" || P_S == "New as Redeployment" || P_S == "New for Modification") {
                    var check1 = checkdate(P_P_S_D, Biennium_Start_Date); //Greater than or equal to biennium
                    if (check1 == 0) {
                        var check = comparedate(P_A_E_D, P_P_S_D); /*Equal to*/
                        if (check == 1) {
                            alert("Error: For New Position, planned position start date should be equal to position action effective date");
                            //cancelDrag();
                            c_enterCell(r, Planned_Position_Start_Date, 0);
                            return false;
                            exit;
                        }
                    }
                }

                if (P_S == "Abolished" || P_S == "Abolish for Redeployment" || P_S == "Abolish for Modification") {
                    if (P_P_S_D == "" && P_P_E_D == "") {
                        var check = comparedate(P_A_E_D, Biennium_Start_Date);
                        if (check == 1) {
                            alert("Error: If a position is Abolished and Position Start & End Dates are blank then Position Action Effective Date should be equal to Biennium Start Date");
                            //cancelDrag();
                            c_enterCell(r, Position_Action_Effective_Date, 0);
                            return false;
                            exit;
                        }
                    }
                    var check = comparedate(P_A_E_D, Biennium_Start_Date);
                    if (check == 0) {
                        if (P_P_S_D != "" || P_P_E_D != "") {
                            alert("Error: If a position is Abolished from the beginning of the Biennium then the Position Start & End Dates should be blank.");
                            //cancelDrag();
                            c_enterCell(r, Planned_Position_Start_Date, 0);
                            return false;
                            exit;
                        }
                    } else {
                        var check1 = checkdate(P_P_E_D, Biennium_End_Date);
                        if (check1 == 1) {
                            if (P_P_S_D == "" || P_P_E_D == "") {
                                alert("Error: If a position is Abolished within the Biennium then the Position Start & End Dates cannot be blank.");
                                //cancelDrag();
                                c_enterCell(r, Planned_Position_Start_Date, 0);
                                return false;
                                exit;
                            }
                        }

                        var check = comparedate(P_A_E_D, P_P_E_D);
                        if (check == 1) {
                            alert("Error: If a position is Abolished within the Biennium then the Position Actions Effective Date should be equal to Position End Date.");
                            //cancelDrag();
                            c_enterCell(r, Position_Action_Effective_Date, 0);
                            return false;
                            exit;
                        }

                    }
                    if (P_D_S != P_D_S_Act) {
                        alert("Error: Position Duty Station can be updated only for a New Position.");
                        //cancelDrag();
                        c_enterCell(r, Postion_Duty_Station, 0);
                        return false;
                        exit;
                    }
                    if (N_O_P_Act != N_O_P_Bud) {
                        alert("Error: Nature of Position can be updated only for a New Position.");
                        //cancelDrag();
                        c_enterCell(r, Nature_of_Position_Bud, 0);
                        return false;
                        exit;
                    }
                }
                /*
                if(D_S_C != "" && P_Rec != "" && F_C != "" && P_Red != "" && P_Tit_C != "")
                {
                	if(P_A_J == ""  || P_A_E_D == "" )
                	{
                		alert("Warning: Enter an Action Effective Date and Justification.");
                		//cancelDrag();
                		c_enterCell(r, Position_Action_Effective_Date, 0);
                		return false;
                		exit;
                	}
					
                }
                */
                var check4 = checkdate1(Biennium_End_Date, P_P_E_D);
                if (check4 == 0) {
                    if (P_S == "Retained") {
                        alert("Error: If a position end date is less than biennium end date then Position State should be Abolished.");
                        //cancelDrag();
                        c_enterCell(r, Planned_Position_End_Date, 0);
                        return false;
                        exit;
                    }
                }

                act_val = parseInt(c_smartLists.Grades[act_val]);
                bud_val = parseInt(c_smartLists.Grades[bud_val]);

                if (act_val >= Grade_D_min && act_val <= Grade_D_max) {
                    if (bud_val > Grade_D_max) {
                        alert("Error: Position Grade cannot be reclassified by more than 1 level or from G to P or from P to D");
                        //cancelDrag();
                        c_enterCell(r, Standard_Cost_Grade_Bud, 0);
                        return false;
                    }
                    if (bud_val != act_val) {
                        if (Math.abs(act_val - bud_val) > 1) {
                            alert("Error: Position Grade cannot be reclassified by more than 1 level or from G to P or from P to D");
                            //cancelDrag();
                            c_enterCell(r, Standard_Cost_Grade_Bud, 0);
                            return false;

                        }
                    }
                } else if (act_val >= Grade_G_min && act_val <= Grade_G_max) {
                    if (bud_val > Grade_G_max || bud_val < Grade_G_min) {
                        alert("Error: Position Grade cannot be reclassified by more than 1 level or from G to P or from P to D");
                        //cancelDrag();
                        c_enterCell(r, Standard_Cost_Grade_Bud, 0);
                        return false;
                    }
                    if (bud_val != act_val) {
                        if (Math.abs(act_val - bud_val) > 1) {
                            alert("Error: Position Grade cannot be reclassified by more than 1 level or from G to P or from P to D");
                            //cancelDrag();
                            c_enterCell(r, Standard_Cost_Grade_Bud, 0);
                            return false;

                        }
                    }
                } else if (act_val >= Grade_P_min && act_val <= Grade_P_max) {
                    if (bud_val > Grade_P_max || bud_val < Grade_P_min) {
                        alert("Error: Position Grade cannot be reclassified by more than 1 level or from G to P or from P to D");
                        //cancelDrag();
                        c_enterCell(r, Standard_Cost_Grade_Bud, 0);
                        return false;
                    }
                    if (bud_val != act_val) {
                        if (Math.abs(act_val - bud_val) > 1) {
                            alert("Error: Position Grade cannot be reclassified by more than 1 level or from G to P or from P to D");
                            //cancelDrag();
                            c_enterCell(r, Standard_Cost_Grade_Bud, 0);
                            return false;

                        }
                        if (P_S == "") {
                            alert("Error: Position State cannot be Blank.");
                            //cancelDrag();
                            c_enterCell(r, Position_State, 0);
                            return false;
                            exit;
                        }
                    }
                }

                /*
                var P_N_S=new String(Position_Number);
                if(P_N_S.substring(0,5)=="PID_R")
                {
                	if(M_T_HR == "")
                	{
                		IsPID_R=false;		
                		alert("Error:Position Number starting with 'PID_R' cannot have blank 'Move to HR' field");
                		return IsPID_R;	
                	}
                }
                */

            }
        }

    }
    return true;
}

//Read information from the current page and save to the variables
function c_initialize() {
    try {
        logger("[TRACE] START Initialize()");
        
        var formCheck = getFormName();
		if(formCheck && formCheck != c_formName){
			logger("[DEBUG] Form changed clearing variables");
			c_clearVariables();
			//c_formName = formCheck;
		}
		c_formName = getFormName();
		
        logger("[DEBUG] FormName: " + c_formName);
        if (!c_formName) {
            logger("[DEBUG] Form Name not found.");
            return;
        }
		
		c_appName = getAppName();		
		c_pageVariable = getPageDropDown();
        c_tabs = getTabs();
        rows = getRowMembers();
        columns = getColMembers();
        data = getDataGrid();

        for (var index = 0; index < rows.length; index++) {
            if (c_dataGrid[c_currentTabIndex] == undefined) {
                logger("[DEBUG] initializing Data Grid index " + c_currentTabIndex);
                c_dataGrid[c_currentTabIndex] = [];
            }
            c_dataGrid[c_currentTabIndex][index] = new Array(data[index], rows[index], columns[index], c_dataGridElement[index], properties[index]);
            logger(c_dataGrid[c_currentTabIndex][index]);
        }
		
        c_userVariables = getUserVariables();
		mergeCollapsedRows();			
		
        logger("[TRACE] END Initialize()");
    } catch (err) {
        logger("[ERROR] Fatal Error while c_initiaze");
        logger(err);
    }
}

//Get form Name  
function getFormName() {
    logger("[TRACE] Start getFormName()");
    var formName = window.frames[0].document.getElementById('p:itm::head').getElementsByTagName('table')[1].rows[0].cells[1].innerText;
    logger("[DEBUG] Is Form or TASKLIST:" + formName);
    if (formName == "Task List Status") {
        var tasklist = window.frames[0].document.querySelectorAll("a[id*=userTask]")[0].innerText;
        var taskId = window.frames[0].g_taskId;
        if (tasklist == "Task - Entry: Update project narratives" || tasklist == "Task - Entry: Update project header and narrative" || tasklist == "Task - Entry: Update project rationale and objectives" || tasklist == "Task - Entry: Update project outcomes and performance indicator information") {
            return "02. Project information";
        } else if (tasklist == "Task - Entry: Update subprogramme narratives" || tasklist == "Task - Entry: Update subprogramme header and narrative" || tasklist == "Task - Entry: Update subprogramme rationale and objectives" || tasklist == "Task - Entry: Update project rationale and objectives" || tasklist == "Task - Entry: Update subprogramme outcomes and performance indicator information" || tasklist == "Task - Entry: Update subprogramme programmatic changes trends - Bluebook") {
            return "04. Subprogramme information";
        } else if (tasklist == "Task - Entry: Update programme rationale and objectives" || tasklist == "Task - Entry: Update programme outcomes and performance indicator information" || tasklist == "Task - Entry: Update lessons learned &amp; specific criteria for prioritization - Bluebook" || tasklist == "Task - Entry: Update programme narratives") {
            return "05. Programme information";
        } else if (tasklist == "Task - Entry: Update major programme narratives" || tasklist == "Task - Entry: Update major programme header and narrative" || tasklist == "TASK - Entry: Update major programme rationale and objectives" || tasklist == "Task - Entry: Update major programme outcomes and performance indicator information" || tasklist == "Task - Entry: Update introduction &amp; information on efficiency gains for Bluebook Part 1") {
            return "06. Major programme information"
        } else if (tasklist == "Task - Entry - HR Plan Changes") {
            return "01. HR Plan Changes";
        } else if (tasklist == "Task - Entry: Create and abolish positions as needed" || tasklist == "Task - Entry: Update approved position funding for relevant positions" || tasklist == "Task - Review: Current positions as per actuals from PerMIS" || tasklist == "Task - Review: Programme plan to assess position requirements" || tasklist == "Task - Entry: Update req. parameters for retained positions and provide justifications" || tasklist == "Task - PB_2014_15 - Draft1 - NAHU-Dosimetry and Medical Radiation Physics Section") {
            return "02. HR position planning";
        } else if (tasklist == "Task - Entry: Update subprogramme assessment" || taskId == "77913" || taskId == "77912") {
            return "03. Subprogramme assessment";
        } else if (tasklist == "Task - Entry: Update programme assessment" || taskId == "77919" || taskId == "77918") {
            return "02. Programme assessment";
        } else if (tasklist == "Task - Entry: Update major programme assessment" || taskId == "77925" || taskId == "77924") {
            return "01. Major programme assessment";
        } else if (tasklist == "Task - Entry: Update project assessment" || taskId == "77907" || taskId == "77906") {
            return "04. Project assessment";
        } else if (tasklist == "Task - Entry: Associate MTS Sub-objectives with projects") {
            return "01. MTS association with projects";
        } else if (tasklist == "Task - Entry: Risk Assessment") {
            return "05. Risk assessment";
        } else if (tasklist == "Task - Entry: Change the supply for TC backstopping, as needed") {
            return "01. Task addition and task update.";
        } else if (tasklist == "Task - Entry: Create or update task information") {
            return "01. Task addition and task update";
        } else if ((tasklist == "Task - Entry: Update Non-HR planning.") || (tasklist == "Task - Entry - Non - HR Forecasting")) {
            return "04. Non-HR - Forecasting";
        } else if (tasklist == "Task - Entry: Allocation for Positions to Projects & Tasks") {
            return "01. Position allocation";
        } else if (tasklist == "Task - Entry: Capital budget requirements per task") {
            return "03. Non-HR budget activities - Capital budget";
        } else if (tasklist == "Task - Entry: Update approved MCIF allocation Non-HR") {
            return "04. Non-HR budget activities - MTBF";
        } else if (tasklist == "Task - Entry: Operational budget per task (per year)" || tasklist == "Task - Review: Project budget summary per task") {
            return "02. Non-HR budget activities - Operational budget";
        } else if (tasklist == "Task - Entry: Update task narratives" || tasklist == "Task - Entry: Update task outputs" || tasklist == "Task - Review: Project with all task narratives and outputs") {
            return "02. Task narratives";
        } else if (tasklist == "Task - Entry: Clear new positions wrongly created") {
            return "05. New position clearance";
        } else if (tasklist == "Task - Entry: Clear tasks that are not needed (with associated outputs)") {
            return "03. Clear task";
        } else if (tasklist == "Task - Entry: Set major prog. specific risks & mitigation actions; also corporate risk" || tasklist == "Task - Entry: Set programme specific risks & mitigation actions; also corporate risk" || tasklist == "Task - Entry: Set project-specific risks and mitigation actions; also corporate risks" || tasklist == "Task - Entry: Set Subprogramme specific risks & mitigation actions; also corporate risk") {
            return "03. Risk calculation";
        } else if (tasklist == "Task - Review: Task and task outputs" || tasklist == "Task - Entry: Update output assessment and create new outputs") {
            return "06. Task and output assessment";
        } else if (tasklist == "Task - Entry: Update assessment for major programme performance indicators.") {
            return "02. Major Programme Performance Indicators Assessment - Administrator";
        } else if (tasklist == "Task - Entry: Update assessment for programme performance indicators.") {
            return "03. Programme Performance Indicators Assessment - Administrator";
        } else if (tasklist == "Task - Entry: Update assessment for subprogramme performance indicators.") {
            return "04. Subprogramme Performance Indicators Assessment - Administrator";
        } else if (tasklist == "Task - Entry: Update assessment for project performance indicators.") {
            return "05. Project Performance Indicators Assessment - Administrator";
        } else if (tasklist == "Task - Entry: Update major programme blue book specifications.") {
            return "02. Major Programme blue book specifications";
        } else if (tasklist == "Task - Entry: Update programme blue book specifications.") {
            return "03. Programme blue book specifications";
        } else if (tasklist == "Task - Entry: Update narratives for major programme, programme, subprogramme & project.") {
            return "01. WBS Narratives - Administrator";
        } else if (tasklist == "Task - Entry: Update subprogramme blue book specifications.") {
            return "04. Subprogramme blue book specifications";
        } else if (tasklist == "Task - PCAS Allocation" || tasklist == "Task - PCAS Allocation - RBF" || tasklist == "Task - Entry - Position Allocations") {
            return "01. PCAS Allocation";
        } else
            return undefined;
    } else {
        return formName;
    }
}

//Get application name from the current URL query
function getAppName() {
    logger("[TRACE] Start getAppName()");
    var queries = window.frames[0].document.URL.split("?")[1].split("&");
    for (var i = 0; i < queries.length; i++) {
        var query = queries[i].split("=");
        if (query[0] == 'Application')
            return query[1];
    }
    logger("[DEBUG] Application name not found in URL: " + window.frames[0].document.URL);
}


//returns an array of row members
function getRowMembers(DOMElement) {
    logger("[TRACE] Start getRowMembers()");
	//gridIDs = []; //BUG Fix: Save ID of each grid to differentiate while collapsed rows comparison
	var flag = true;
	if(DOMElement != undefined){
		flag = false;
	}
	//Enhancement: Ability to capture the details from DOM variable pass else from window.
	if(DOMElement === undefined){
		DOMElement = window.frames[0].document;
	}
	
    var temp = [];
    var gridIndex = 0;
    var rowHeaders = DOMElement.querySelectorAll("[id*='RowHeaderBlock']");
    for (var divInd = 0; divInd < rowHeaders.length; divInd++) {		
        if (divInd > 0) {
            //if (rowHeaders[divInd - 1].id.split(":")[3] != rowHeaders[divInd].id.split(":")[3]) {
            //    gridIndex++;
            //}
            var gridID1 = rowHeaders[divInd - 1].id.split(":");
            var gridID2 = rowHeaders[divInd].id.split(":");

            //BUGFIX: Grid Prefix is T and its index is dynamic hence the for loop
            for (var i = 0; i < gridID1.length; i++) {
                if (gridID1[i].substring(0, 1) == 'T') {					
                    if (gridID1[i] != gridID2[i]) {
                        gridIndex++;
                    }					
                }

            }
        }
		
		/*Start
		var Grid_ID = rowHeaders[divInd].id.split(":");
		for (var i = 0; i < Grid_ID.length; i++) {
                if (Grid_ID[i].substring(0, 1) == 'T') {	
					gridIDs[gridIndex] = Grid_ID[i];
				}
		}
		END*/
		
        var table = rowHeaders[divInd].firstChild;
        var i = 1;
        var row = table.rows[i];
        var rowIndex = parseInt(rowHeaders[divInd].getAttribute("_startslice"));
        while (row) {
            if (temp[gridIndex] == undefined) {
                temp[gridIndex] = [];
            }
            var j = 1;
            var col = row.cells[j];
            while (col) {
                if (col.tagName == "TH") {
                    if (temp[gridIndex][rowIndex] == undefined) {
                        temp[gridIndex][rowIndex] = [];
                    }
                    temp[gridIndex][rowIndex][temp[gridIndex][rowIndex].length] = col.innerText;
                    logger("[DEBUG] Row Member Found " + col.innerText);
                }
                j = j + 1;
                col = row.cells[j];
            }
            rowIndex++;
            i = i + 1;
            row = table.rows[i];
        }
    }	
	
	//Check for collapsed row by comparing this array with c_dataGrid (only if not background request)
	if(flag){
		getCollapsedRows(temp);
	}
	
    logger("[TRACE] End getRowMembers()");
    return temp;
}


//Check if any data row is collapsed
function getCollapsedRows(newRows) {
    logger("[TRACE] Start getCollapsedRows()");
    //logger(newRows);
    if (checkGrid(c_currentTabIndex, false)) {
		if(newRows.length != c_dataGrid[c_currentTabIndex].length){
			logger("[DEBUG] Invalid number of Grids - collapsed rows");
			return false;
		}
        for (var index = 0; index < newRows.length; index++) {
            if (c_dataGrid[c_currentTabIndex][index] == undefined) {
                continue;
            }

            if (collapsedRows == undefined) {
                collapsedRows = [];
            }

            if (collapsedRows[index] == undefined) {
                collapsedRows[index] = [];
            }
			
			if(c_dataGrid[c_currentTabIndex][index][1][0].length != newRows[index][0].length){
				logger("[DEBUG] Invalid number of row members - collapsed rows");
				return false;
			}

            var row1 = [];
            for (var rowInd = 0; rowInd < c_dataGrid[c_currentTabIndex][index][1].length; rowInd++) {
                var concat = "";
                for (var colInd = 0; colInd < c_dataGrid[c_currentTabIndex][index][1][rowInd].length; colInd++) {
                    concat = concat + c_dataGrid[c_currentTabIndex][index][1][rowInd][colInd];
                }
                row1[row1.length] = concat;
            }
            var row2 = [];
            for (var rowInd = 0; rowInd < newRows[index].length; rowInd++) {
                var concat = "";
                for (var colInd = 0; colInd < newRows[index][rowInd].length; colInd++) {
                    concat = concat + newRows[index][rowInd][colInd];
                }
                row2[row2.length] = concat;
            }

            logger(row1);
            logger(row2);

            for (var i = 0; i < row1.length; i++) {
                var move = true;
                for (var j = 0; j < row2.length; j++) {
                    if (row1[i] == row2[j]) {
                        move = false;
                        break;
                    }
                }
                if (move) {
                    logger("[DEBUG] Collapsed ROW: " + c_dataGrid[c_currentTabIndex][index][1][i]);
                    collapsedRows[index].push(new Array(c_dataGrid[c_currentTabIndex][index][0][i], c_dataGrid[c_currentTabIndex][index][1][i], c_dataGrid[c_currentTabIndex][index][3][i], c_dataGrid[c_currentTabIndex][index][4][i]));
                }
            }
        }
    }
    logger(collapsedRows);
    logger("[TRACE] End getCollapsedRows()");
}

//merge the collapsed rows with c_dataGrid
function mergeCollapsedRows() {
    logger("[TRACE] Start mergeCollapsedRows()");
    if (!collapsedRows || !checkGrid(c_currentTabIndex, false)) {
        logger("[TRACE] Collapsed or tab null, exit.");
        return;
    }
    for (var gridInd = 0; gridInd < collapsedRows.length; gridInd++) {
        for (var i = 0; i < collapsedRows[gridInd].length; i++) {
            var rowIndex = c_dataGrid[c_currentTabIndex][gridInd][0].length;
            c_dataGrid[c_currentTabIndex][gridInd][0][rowIndex] = collapsedRows[gridInd][i][0];

            rowIndex = c_dataGrid[c_currentTabIndex][gridInd][1].length;
            c_dataGrid[c_currentTabIndex][gridInd][1][rowIndex] = collapsedRows[gridInd][i][1];

            rowIndex = c_dataGrid[c_currentTabIndex][gridInd][3].length;
            c_dataGrid[c_currentTabIndex][gridInd][3][rowIndex] = collapsedRows[gridInd][i][2];

            rowIndex = c_dataGrid[c_currentTabIndex][gridInd][4].length;
            c_dataGrid[c_currentTabIndex][gridInd][4][rowIndex] = collapsedRows[gridInd][i][3];
        }
    }
    collapsedRows = undefined;
    logger("[TRACE] End mergeCollapsedRows()");
}

//returns an array of column members
function getColMembers(DOMElement) {
    logger("[TRACE] Start getColMembers()");
	
	//Enhancement: Ability to capture the details from DOM variable pass else from window.
	if(DOMElement === undefined){
		DOMElement = window.frames[0].document;
	}
	
    var temp = [];
    var gridIndex = 0;
    var colHeaders = DOMElement.querySelectorAll("[id*='ColHeaderBlock']");
    for (var divInd = 0; divInd < colHeaders.length; divInd++) {
        if (divInd > 0) {
            //if (colHeaders[divInd - 1].id.split(":")[3] != colHeaders[divInd].id.split(":")[3]) {
            //    gridIndex++;
            //}
            var gridID1 = colHeaders[divInd - 1].id.split(":");
            var gridID2 = colHeaders[divInd].id.split(":");

            //BUGFIX: Grid Prefix is T and its index is dynamic hence the for loop
            for (var i = 0; i < gridID1.length; i++) {
                if (gridID1[i].substring(0, 1) == 'T') {
                    if (gridID1[i] != gridID2[i]) {
                        gridIndex++;
                    }
                }

            }
        }
        var table = colHeaders[divInd].firstChild;
        var i = 1;
        var row = table.rows[i];
        while (row) {
            if (temp[gridIndex] == undefined) {
                temp[gridIndex] = [];
            }
            var j = 1;
            var col = row.cells[j];
            while (col) {
                if (col.tagName == "TH") {
                    if (temp[gridIndex][i - 1] == undefined) {
                        temp[gridIndex][i - 1] = [];
                    }
                    temp[gridIndex][i - 1][temp[gridIndex][i - 1].length] = col.innerText;
                    logger("[DEBUG] Column Member Found: " + col.innerText);
                }
                j = j + 1;
                col = row.cells[j];
            }
            i = i + 1;
            row = table.rows[i];
        }
    }
    logger("[TRACE] End getColMembers()");
    return temp;
}

//return an array of Data Grid
function getDataGrid(DOMElement) {
    logger("[TRACE] Start getDataGrid()");
	
	//Enhancement: Ability to capture the details from DOM variable pass else from window.
	if(DOMElement === undefined){
		DOMElement = window.frames[0].document;
	}
	
    //Locate Data Grid Table
    var tables = DOMElement.querySelectorAll("[id*='DatabodyBlock']");
    var data = [];
    var gridIndex = 0;
    c_dataGridElement = [];
	properties = [];
    for (var z = 0; z < tables.length; z++) {
        var startRow = parseInt(tables[z].getAttribute("_startrow"));
        var startColumn = parseInt(tables[z].getAttribute("_startcol"));
        if (z > 0) {
            //if (tables[z - 1].id.split(":")[3] != tables[z].id.split(":")[3]) {
            //    gridIndex++;
            //}

            var gridID1 = tables[z - 1].id.split(":");
            var gridID2 = tables[z].id.split(":");

            //BUGFIX: Grid Prefix is T and its index is dynamic hence the for loop
            for (var i = 0; i < gridID1.length; i++) {
                if (gridID1[i].substring(0, 1) == 'T') {
                    if (gridID1[i] != gridID2[i]) {
                        gridIndex++;
                    }
                }

            }
        }
        if (c_dataGridElement[gridIndex] == undefined) {
            c_dataGridElement[gridIndex] = [];
        }
        if (properties[gridIndex] == undefined) {
            properties[gridIndex] = [];
        }
        if (data[gridIndex] == undefined) {
            data[gridIndex] = [];
        }
        //console.log(startRow +":"+ startColumn);
        var table = tables[z].firstChild; //Get TABLE inside the DIV
        //Row 0 is always blank?
        var i = 1;
        var row = table.rows[i];
        var rowIndex = startRow;
        while (row) {
            //col 1 is always blank?
            var j = 1;
            if (data[gridIndex][rowIndex] == undefined)
                data[gridIndex][rowIndex] = [];
            if (c_dataGridElement[gridIndex][rowIndex] == undefined)
                c_dataGridElement[gridIndex][rowIndex] = [];
            if (properties[gridIndex][rowIndex] == undefined)
                properties[gridIndex][rowIndex] = [];
            var col = row.cells[j];
            var columnIndex = startColumn;
            while (col) {
                c_dataGridElement[gridIndex][rowIndex][columnIndex] = col;
                if (col.style.backgroundColor == "rgb(223, 223, 223)") {
                    properties[gridIndex][rowIndex][columnIndex] = 0; //readonly cell
                } else {
                    properties[gridIndex][rowIndex][columnIndex] = 1;
                }
                var span1 = col.getElementsByTagName("span");
                if (span1.length != 0) {
                    //<TD> conrtains <span> tag
                    var input = span1[0].getElementsByTagName("input");
                    var text_area = span1[0].getElementsByTagName("textarea");
                    var span2 = span1[0].getElementsByTagName("span");
                    if (input.length != 0) {
                        //if user has currently in edit mode and text box is visible
                        //NUMERIC and DATE
                        data[gridIndex][rowIndex][columnIndex] = input[0].value;
                    } else if (span2.length != 0) {
                        //FOR SMART LIST
                        data[gridIndex][rowIndex][columnIndex] = span2[0].innerText;
                    } else if (text_area.length != 0) {
                        if (text_area[0].title == "") {
                            data[gridIndex][rowIndex][columnIndex] = text_area[0].value;
                        } else {
                            data[gridIndex][rowIndex][columnIndex] = text_area[0].title;
                        }

                    } else {
                        //Cell doesnt have any editor open.
                        data[gridIndex][rowIndex][columnIndex] = span1[0].innerText;
                    }
                } else {
                    //Data is directly present in <TD> Tag
                    data[gridIndex][rowIndex][columnIndex] = col.innerText;
                }
                //BUG FIX: Treat smart list None as ""
                if (data[gridIndex][rowIndex][columnIndex] == "None") {
                    data[gridIndex][rowIndex][columnIndex] = "";
                }
				//BUG FIX: TRIM whitespaces
				data[gridIndex][rowIndex][columnIndex] = data[gridIndex][rowIndex][columnIndex].trim();
				
                j = j + 1;
                columnIndex = columnIndex + 1;
                col = row.cells[j];
            }
            i = i + 1;
            rowIndex = rowIndex + 1;
            row = table.rows[i];
        }
        //console.log("One table done");
    }
    logger("[TRACE] End getDataGrid()");
    return data;
}

//returns an array of page dropdown values
function getPageDropDown() {
    logger("[TRACE] Start getPageDropDown()");
    var data = [];
    var dropdowns = window.frames[0].document.querySelectorAll("[id*='Page_Display']");
    for (var i = 0; i < dropdowns.length; i++) {
        if (dropdowns[i].tagName == "INPUT") {
            logger("Dropdown found:  " + dropdowns[i].value);
            data[data.length] = dropdowns[i].value;
        }
    }
    logger("[TRACE] End getPageDropDown()");
    return data;
}

//Returns an array of tab values
function getTabs() {
    logger("[TRACE] Start getTabs()");
    var temp = [];
	c_tabIDs = []; //Saving IDS for background request;
    var index = 0;
    var tabs = window.frames[0].document.querySelectorAll("[id*=':TAB_']");
    if (tabs.length == 0) {
        c_currentTabIndex = index;
    }

    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].tagName != "A")
            continue;
        logger("[DEBUG] Tabs found:  " + tabs[i].innerText);
        if (tabs[i].className.indexOf('p_AFSelected') != -1) {
            c_currentTabIndex = index;
        }
        temp[temp.length] = tabs[i].innerText;
		
		//Saving tab id for background XMLHTTP request
		c_tabIDs[c_tabIDs.length] = tabs[i].id;
		logger("[DEBUG] Tabs ID :  " + tabs[i].id);
		
        index++;
    }
    logger("[TRACE] End getTabs()");
    return temp;
}

//returns array of user variables 
function getUserVariables() {
    logger("[TRACE] Start getUserVariables()");
    var temp = [];
    var rowHeaders = window.frames[0].document.querySelectorAll("[id*='povContainer']");
    for (var divInd = 0; divInd < rowHeaders.length; divInd++) {
        var table = rowHeaders[divInd].firstChild;
        var i = 0;
        var row = table.rows[i];
        while (row) {
            var j = 0;
            var col = row.cells[j];
            while (col) {
                if (col.getAttribute("onclick") && col.getAttribute("onclick").indexOf("dynamicVariableOnClick") != -1) {
                    temp[temp.length] = col.innerText.split(":")[1].trim();
                    logger("[DEBUG] User variable found: " + col.innerText.split(":")[1].trim());
                }
                j = j + 1;
                col = row.cells[j];
            }
            i = i + 1;
            row = table.rows[i];
        }
    }
    logger("[TRACE] End getUserVariables()");
    return temp;
}

//Clear previous variables on form change
function c_clearVariables() {
    data = undefined;
    rows = undefined;
    columns = undefined;
    collapsedRows = undefined;
	properties = undefined;
    c_dataGrid = [];
    c_pageVariable = undefined;
    c_tabs = undefined;
	c_tabIDs = undefined;
    c_currentTabIndex = undefined;
    c_formName = undefined;
    c_appName = undefined;
    c_dataGridElement = undefined;
    c_userVariables = undefined;
    logger("[TRACE] c_clearVariables(): Cleared all variables.");
}

// Click on the cell where error was identified
function c_enterCell(row, column, tabIndex, gridIndex) {
    if (typeof gridIndex === 'undefined') {
        gridIndex = 0;
    }
    if (tabIndex != c_currentTabIndex)
        return;
    try {
		c_dataGrid[c_currentTabIndex][gridIndex][3][row][column].focus();
        c_dataGrid[c_currentTabIndex][gridIndex][3][row][column].click();
		c_dataGrid[c_currentTabIndex][gridIndex][3][row][column].click();
    } catch (err) {}
}


//get the member names of a cell
function c_getMem(row, coloumn, tab, gridIndex) {
    if (typeof gridIndex === 'undefined') {
        gridIndex = 0;
    }
    var members = [];

    for (var i = 0; i < c_dataGrid[tab][gridIndex][1][row].length; i++) {
        members[members.length] = c_dataGrid[tab][gridIndex][1][row][i];
    }
    for (var i = 0; i < c_dataGrid[tab][gridIndex][2].length; i++) {
        members[members.length] = c_dataGrid[tab][gridIndex][2][i][coloumn];
    }
    return members;
}

//Update the value of the given cell
function c_updateValue(value, row, column, tab, gridIndex) {
    if (typeof gridIndex === 'undefined') {
        gridIndex = 0;
    }
    var ele = c_dataGrid[tab][gridIndex][3][row][column];
    if (!ele)
        return;
    var span1 = ele.getElementsByTagName("span");
    if (span1.length != 0) {
        //<TD> conrtains <span> tag
        var input = span1[0].getElementsByTagName("input");
        var text_area = span1[0].getElementsByTagName("textarea");
        var span2 = span1[0].getElementsByTagName("span");
        if (input.length != 0) {
            //if user has currently in edit mode and text box is visible
            //NUMERIC and DATE
            input[0].value = value;
        } else if (span2.length != 0) {
            //FOR SMART LIST
            span2[0].innerText = value;
        } else if (text_area.length != 0) {
            text_area[0].value = value;
        } else {
            //Cell doesnt have any editor open.
            span1[0].innerText = value;
        }
    } else {
        //Data is directly present in <TD> Tag
        ele.innerText = value;
    }
}

//Modified ValidateTask
function validateTask(userVar, tabInd, gridInd, flag) {
    var ispresent = false;
    for (r = 0; r < c_dataGrid[tabInd][gridInd][1].length; r++) {
        for (var c = 0; c < c_dataGrid[tabInd][gridInd][1][r].length; c++) {
            var value = c_dataGrid[tabInd][gridInd][1][r][c];
            if (equalsIgnoreCase(value, userVar)) {
                ispresent = true;
                break;
            }
        }
    }
    if (flag == 0 && !ispresent) {
        alert('Please Change the Task By Right Click As This Task is Not Associated With this Project');
        return;
    } else if (flag == 1 && !ispresent) {
        return false;
    } else if (flag == 1 && ispresent) {
        return true;
    } else {
        return;
    }
}

//Logs if debugging is on
// TODO: include Types and Levels.
function logger(message) {
    if (!debug) {
        return;
    }
    console.log(message);
}

//Check if one of the array element is present in other array
function c_arrayContains(elementArray, array) {
    for (var i = 0; i < elementArray.length; i++) {
        for (var j = 0; j < array.length; j++) {
            if (equalsIgnoreCase(elementArray[i], array[j])) {
                return true;
            }
        }
    }
    return false;
}

//Check if current grid is loaded in an array
function checkGrid(index, background) {
	if(!c_formName){
		return false;
	}
    if (c_dataGrid[index] == undefined){
		if(background === false){
			return false;
		}
        return saveTabData(index);
	}
    else{
        return true;
	}
}

//Get Data from Tab via XMLHTTP req
function saveTabData(index){
	
	logger("[TRACE] saveTabData Start");
	try{
		if(!c_tabs[index]){
			logger("[DEBUG] Tab Not found" + c_tabs[index]);
			return false;
		}			
		
		logger("[TRACE] saveTabData Stop");
		return sendTabRequest(index);
	}
	catch(err){
		logger("[ERROR] saveTabData");
		logger(err);
		return false;
	}
}

//Send Background request for unopened Tab
function sendTabRequest(id){
	logger("[TRACE] Send Tab Request for " + c_tabs[id]);
	
	try {
		c_BR = true;
		logger("[TRACE] Get all parameters required for sending request - START");
		
		var domain = window.frames[0].location.href.split('/').slice(0, 3).join('/');
		var viewState = window.frames[0].document.querySelectorAll("span[id*=postscript] input")[0].value;
		logger("[Debug] Found viewState: " + viewState);
		
		var controlState;
		var queries = window.frames[0].document.URL.split("?")[1].split("&");
		for (var i = 0; i < queries.length; i++) {
			var query = queries[i].split("=");
			if (query[0] == '_adf.ctrl-state')
				controlState = query[1];
		}
		logger("[Debug] Found controlState: " + controlState);
		
		var trinidadForm = window.frames[0].document.querySelectorAll("input[name='org.apache.myfaces.trinidad.faces.FORM']")[0].value;
		logger("[Debug] Found trinidadForm: " + trinidadForm);
		
		/* Breaks for Tasklists
		//Converting IDs to URL supported form
		var rawId = c_tabIDs[id].split(":");
		var Id = "T" + rawId[3].split("_")[2];
		var reqStream = rawId[0] + ":" + rawId[1] + ":" + rawId[2] + ":" + Id;
		logger("[DEBUG] Found reqStream:  " + reqStream);

		var reqEvent = rawId[0] + ":" + rawId[1] + ":" + rawId[2] + ":" + rawId[3];
		logger("[Debug] Found reqEvent: " + reqEvent);		
		*/
		
		//New Logic to support tasklist tabs (Different IDS :()
		var reqEvent = c_tabIDs[id].split("::")[0];
		logger("[Debug] Found reqEvent: " + reqEvent);	
		
		var rawId = c_tabIDs[id].split(":");
		var reqStream = "";
		for(var x=0 ; x<rawId.length; x++){
			if(rawId[x].charAt(0) == 'T'){
				var Id = "T" + rawId[x].split("_")[2];
				reqStream  = reqStream  + Id;
				break;
			}
			else{
				reqStream = reqStream + rawId[x] + ":";
			}
		}
		logger("[DEBUG] Found reqStream:  " + reqStream);
		
		
		
		logger("[TRACE] Get all parameters required for sending request - END");
		
	}
	catch(err){
		logger("[ERROR] Fetching parameters for XMLHTTP Request failed.");
		logger(err);
		return false;
	}
	
	try{
		var http = new XMLHttpRequest();
		var url = domain + '/HyperionPlanning/faces/PlanningCentral?_adf.ctrl-state=' + controlState;

		var params = 'event=' + encodeURIComponent(reqEvent) + '&event.' + reqEvent + '=%3Cm+xmlns%3D%22http%3A%2F%2Foracle.com%2FrichClient%2Fcomm%22%3E%3Ck+v%3D%22expand%22%3E%3Cb%3E1%3C%2Fb%3E%3C%2Fk%3E%3Ck+v%3D%22type%22%3E%3Cs%3Edisclosure%3C%2Fs%3E%3C%2Fk%3E%3C%2Fm%3E&javax.faces.ViewState=' + viewState + '&org.apache.myfaces.trinidad.faces.FORM=' + trinidadForm;
		logger("[DEBUG] Sending POST req to: " + url + " with Request Body: " + params);
		http.open('POST', url, false);
		http.timeout = c_XHRTimeout;
		//Send the proper header information along with the request
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
		http.setRequestHeader('Adf-Ads-Page-Id', '1');
		http.setRequestHeader('Adf-Rich-Message', 'true');

		http.onreadystatechange = function() {//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
				logger("[DEBUG] POST reponse: " + http.responseText);
			}
		}
		http.send(params);
	}
	catch(err){
		logger("[ERROR] POST Request failed.");
		logger(err);
		return false;
	}
	
	try{
		url = domain + "/HyperionPlanning/faces/PlanningCentral?_adf.ctrl-state=" + controlState + "&Adf-Rich-Message=true&oracle.adf.view.rich.STREAM=" + reqStream + "&javax.faces.ViewState=" + viewState + "&unique="+(new Date).getTime();
		logger("[DEBUG] Sendinf GET request to URL:" + url);
		
		var xmlhttp;
		if (window.XMLHttpRequest)	{// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		}
		else{// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}


		xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				logger("[DEBUG] GET Response: " + xmlhttp.responseText);
				try{
					var xmlDoc = new DOMParser().parseFromString(xmlhttp.responseText,'text/xml');
					var str = xmlDoc.getElementsByTagName("fragment")[0].childNodes[0].nodeValue;
					xmlDoc = new DOMParser().parseFromString(str,'text/html');
					
					if(!xmlDoc){
						logger("[DEBUG] No response from background get.");
						return false;
					}
					
					logger("[Debug] Formatted Response as DOM :");
					logger(xmlDoc);
				
					var r = getRowMembers(xmlDoc);
					var c = getColMembers(xmlDoc);
					var d = getDataGrid(xmlDoc);

					for (var i = 0; i < r.length; i++) {
						if (c_dataGrid[id] == undefined) {
							logger("[DEBUG] initializing Data Grid index " + id);
							c_dataGrid[id] = [];
						}
						c_dataGrid[id][i] = new Array(d[i], r[i], c[i], c_dataGridElement[i], properties[i]);
						logger(c_dataGrid[id][i]);
					}
					//Switch tabs 					
					//window.frames[0].document.getElementById(c_tabIDs[c_currentTabIndex]).click();
				}
				catch(err){
					logger("[ERROR] Parsing Reponse as DOM / DOM Request");
					return false;
				}
				
				return true;
			}
		}

		xmlhttp.open("GET",url,false);
		xmlhttp.timeout = c_XHRTimeout;
		xmlhttp.setRequestHeader("Accept", "image/gif, image/jpeg, image/pjpeg, application/x-ms-application, application/xaml+xml, application/x-ms-xbap, */*");
		xmlhttp.setRequestHeader("Referer", window.frames[0].document.URL);
		xmlhttp.send();
	}
	catch(err){
		logger("[ERROR] GET Request failed.");
		logger(err);
		return false;
	}
}



//Function copied from validate.js
function equalsIgnoreCase(string1, string2) {
    //If both of the strings are null, return true;
    if ((string1 == null) && (string2 == null))
        return true;
    //If only one of the strings are null, return false;
    if ((string1 == null) || (string2 == null))
        return false;
    //Convert first to upper, and then to lower, to make sure the case is not compared
    //Converting only to lower works for English, but not on all languages.
    string1 = string1.toUpperCase();
    string1 = string1.toLowerCase();
    string2 = string2.toUpperCase();
    string2 = string2.toLowerCase();
    return (string1 == string2);
}

//Function copied from validate.js
function checkdate(start, end) {

    /********Data is Comming as 2016/05/28 i.e yyyy/mm/dd *****************/
    if (start != "" && end != "") {

        var str1 = String(start);
        var str2 = String(end);
        var first = str1.indexOf("/");
        var last = str1.lastIndexOf("/");
        var max = str1.length;
        var mon1 = (str1.substring(first + 1, last));
        mon1 = mon1 - 1;
        var yr1 = (str1.substring(0, first));
        var dt1 = (str1.substring(last + 1, max));

        if (String(yr1).length == 1) {

            yr1 = "200" + yr1;
            yr1 = eval(yr1);
        } else {
            if (String(yr1).length == 2) {

                yr1 = "20" + yr1;
                yr1 = eval(yr1);
            } else {
                yr1 = eval(yr1);
            }
        }
        var first2 = str2.indexOf("/");
        var last2 = str2.lastIndexOf("/");
        var max2 = str2.length;
        var mon2 = (str2.substring(first2 + 1, last2));
        mon2 = mon2 - 1;
        var yr2 = (str2.substring(0, first2));
        var dt2 = (str2.substring(last2 + 1, max2));

        if (String(yr2).length == 1) {

            yr2 = "200" + yr2;
            yr2 = eval(yr2);

        } else {
            if (String(yr2).length == 2) {

                yr2 = "20" + yr2;
                yr2 = eval(yr2);
            } else {
                yr2 = eval(yr2);
            }
        }

        var date1 = new Date(yr1, mon1, dt1);

        var date2 = new Date(yr2, mon2, dt2);

        if (date1 >= date2) {
            return 0;
        } else {
            return 1;
        }
    }
}

//Function copied from validate.js
function checkdate1(start, end) {
    /********Data is Comming as 2016/05/28 i.e yyyy/mm/dd *****************/
    if (start != "" && end != "") {

        var str1 = String(start);
        var str2 = String(end);
        var first = str1.indexOf("/");
        var last = str1.lastIndexOf("/");
        var max = str1.length;
        var mon1 = (str1.substring(first + 1, last));
        mon1 = mon1 - 1;
        var yr1 = (str1.substring(0, first));
        var dt1 = (str1.substring(last + 1, max));

        if (String(yr1).length == 1) {

            yr1 = "200" + yr1;
            yr1 = eval(yr1);
        } else {
            if (String(yr1).length == 2) {

                yr1 = "20" + yr1;
                yr1 = eval(yr1);
            } else {
                yr1 = eval(yr1);
            }
        }
        var first2 = str2.indexOf("/");
        var last2 = str2.lastIndexOf("/");
        var max2 = str2.length;
        var mon2 = (str2.substring(first2 + 1, last2));
        mon2 = mon2 - 1;
        var yr2 = (str2.substring(0, first2));
        var dt2 = (str2.substring(last2 + 1, max2));

        if (String(yr2).length == 1) {

            yr2 = "200" + yr2;
            yr2 = eval(yr2);

        } else {
            if (String(yr2).length == 2) {

                yr2 = "20" + yr2;
                yr2 = eval(yr2);
            } else {
                yr2 = eval(yr2);
            }
        }

        var date1 = new Date(yr1, mon1, dt1);

        var date2 = new Date(yr2, mon2, dt2);

        if (date1 > date2) {
            return 0;
        } else {
            return 1;
        }
    }
}

//Function copied from validate.js
function comparedate(start, end) {

    /********Data is Comming as 2016/05/28 i.e yyyy/mm/dd *****************/
    if (start != "" && end != "") {

        var str1 = String(start);
        var str2 = String(end);
        var first = str1.indexOf("/");
        var last = str1.lastIndexOf("/");
        var max = str1.length;
        var mon1 = (str1.substring(first + 1, last));
        mon1 = mon1 - 1;
        var yr1 = (str1.substring(0, first));
        var dt1 = (str1.substring(last + 1, max));

        if (String(yr1).length == 1) {

            yr1 = "200" + yr1;
            yr1 = eval(yr1);
        } else {
            if (String(yr1).length == 2) {

                yr1 = "20" + yr1;
                yr1 = eval(yr1);
            } else {
                yr1 = eval(yr1);
            }
        }
        var first2 = str2.indexOf("/");
        var last2 = str2.lastIndexOf("/");
        var max2 = str2.length;
        var mon2 = (str2.substring(first2 + 1, last2));
        mon2 = mon2 - 1;
        var yr2 = (str2.substring(0, first2));
        var dt2 = (str2.substring(last2 + 1, max2));

        if (String(yr2).length == 1) {

            yr2 = "200" + yr2;
            yr2 = eval(yr2);

        } else {
            if (String(yr2).length == 2) {

                yr2 = "20" + yr2;
                yr2 = eval(yr2);
            } else {
                yr2 = eval(yr2);
            }
        }

        var date1 = new Date(yr1, mon1, dt1);

        var date2 = new Date(yr2, mon2, dt2);

        if (yr1 == yr2 && mon1 == mon2 && dt1 == dt2) {
            return 0;
        } else {
            return 1;
        }
    }
}


//function copied from validate.js
function comparedate2(start, end) {

    /********Data is Comming as 2016/05/28 i.e yyyy/mm/dd *****************/
    if (start != "" && end != "") {

        var str1 = String(start);
        var str2 = String(end);
        var first = str1.indexOf("/");
        var last = str1.lastIndexOf("/");
        var max = str1.length;
        var mon1 = (str1.substring(first + 1, last));
        mon1 = mon1 - 1;
        var yr1 = (str1.substring(0, first));
        var dt1 = (str1.substring(last + 1, max));

        if (String(yr1).length == 1) {

            yr1 = "200" + yr1;
            yr1 = eval(yr1);
        } else {
            if (String(yr1).length == 2) {

                yr1 = "20" + yr1;
                yr1 = eval(yr1);
            } else {
                yr1 = eval(yr1);
            }
        }
        var first2 = str2.indexOf("/");
        var last2 = str2.lastIndexOf("/");
        var max2 = str2.length;
        var mon2 = (str2.substring(first2 + 1, last2));
        mon2 = mon2 - 1;
        var yr2 = (str2.substring(0, first2));
        var dt2 = (str2.substring(last2 + 1, max2));

        if (String(yr2).length == 1) {

            yr2 = "200" + yr2;
            yr2 = eval(yr2);

        } else {
            if (String(yr2).length == 2) {

                yr2 = "20" + yr2;
                yr2 = eval(yr2);
            } else {
                yr2 = eval(yr2);
            }
        }

        var date1 = new Date(yr1, mon1, dt1);

        var date2 = new Date(yr2, mon2, dt2);

        if (date1 > date2) {
            return 0;
        } else if (date1 < date2) {
            return 1;
        } else {
            return 2;
        }
    }
}

//Function copied from validate.js
function isValidDate(dateString) {
    // First check for the pattern
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[2], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[0], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

//function copied from validate.js
function callasp(Pro_Number, Awa_Number) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var y = xmlhttp.responseText;
            var res = y.substr(70, 5);
            var trimmed_var = parseInt(res);
            /*alert(trimmed_var);*/
            if (trimmed_var == 0) {
                isValidPTACombination = false;
            }
            /*alert("inside Function .... " + isValidPTACombination);*/
        }
    }
    var prj = Pro_Number;
    var awa = Awa_Number;

    /*  20141111 - PCAS changes  

    alert("Value for Project Number in Callasp is "+prj);
    alert("Value for Award Number in Callasp is "+awa); */


    try {
        var varURL = document.URL;

        /*  20141111 - PCAS changes  
        alert("Value for URL in Callasp is "+varURL);*/

        if (varURL.substr(4, 1) == 's') {
            var new_url = varURL.substr(8, 18);
        } else {
            var new_url = varURL.substr(7, 18);
        }

        /*alert("new_url ==> "+new_url+" Project Number ==> "+prj+" Award Number ==>" +awa);*/

        if (new_url == 'iahyap01.svc.unicc') {
            /*  20141111 - PCAS changes  
            alert("Connecting to URL http://172.31.22.32:19000 "); */

            xmlhttp.open("GET", "http://iahyap01.svc.unicc.org:19000/HyperionPlanning/custom/XXIAEA_PTA_VAL1.jsp?PRJNUM=" + prj + "&AWDNUM=" + awa, false);
        } else {

            /*  20141111 - PCAS changes  
	alert("Connecting to URL https://aipsepmtst.iaea.org "); */
            xmlhttp.open("GET", "https://aipsepmprd.iaea.org/HyperionPlanning/custom/XXIAEA_PTA_VAL1.jsp?PRJNUM=" + prj + "&AWDNUM=" + awa, false);
        }
        xmlhttp.send();
    } catch (err) {
        alert(err.message);
    }
}

//function copied from validate.js
function validate_combination(Pro_Number, Awa_Number, Tsk_Number) {
    /*var xmlhttp= new XMLHttpRequest(); */
    var xmlhttp = getXMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var y = xmlhttp.responseText;
            var res = y.substr(70, 5);
            var trimmed_var = parseInt(res);
            /*alert(trimmed_var);*/
            if (trimmed_var == 0) {
                isValidPTACombination = false;
            }
            /*alert("inside Function .... " + isValidPTACombination);*/
        }
    }

    var tsk1 = Tsk_Number.replace("+", "_");
    var tsk2 = tsk1.replace("&", "_");
    var tsk3 = tsk2.replace("'", "_");
    var prj = Pro_Number;
    var awa = Awa_Number;
    var tsk = tsk3;

    /*  20141111 - PCAS changes  

    alert("Value for Project Number in Callasp is "+prj);
    alert("Value for Award Number in Callasp is "+awa); 

    alert("Value for Project Variable : "+prj);
    alert("Value for Award Variable : "+awa);
    alert("Value for Task Variable : "+tsk);
    */


    try {
        var varURL = document.URL;

        /*  20141111 - PCAS changes  
        alert("Value for URL in Callasp is "+varURL);*/

        if (varURL.substr(4, 1) == 's') {
            var new_url = varURL.substr(8, 18);
        } else {
            var new_url = varURL.substr(7, 18);
        }

        /*alert("new_url ==> "+new_url+" Project Number ==> "+prj+" Award Number ==>" +awa);*/

        if (new_url == 'iahyap01.svc.unicc') {
            /*  20141111 - PCAS changes  
            alert("Connecting to URL http://172.31.22.32:19000 "); */

            xmlhttp.open("GET", "http://iahyap01.svc.unicc.org:19000/HyperionPlanning/custom/XXIAEA_PTA_VAL1.jsp?AWDNUM=" + awa + "&TSKNUM=" + tsk + "&PRJNUM=" + prj, false);
        } else {

            /*  20141111 - PCAS changes  */

            xmlhttp.open("GET", "https://aipsepmprd.iaea.org/HyperionPlanning/custom/XXIAEA_PTA_VAL1.jsp?AWDNUM=" + awa + "&TSKNUM=" + tsk + "&PRJNUM=" + prj, false);
        }
        xmlhttp.send();
    } catch (err) {
        alert(err.message);
    }
}

//function copied from validate.js
function getXMLHttpRequest() {
    if (window.XMLHttpRequest) {
        return new window.XMLHttpRequest;
    } else {
        try {
            return new ActiveXObject("MSXML2.XMLHTTP.3.0");
        } catch (ex) {
            return null;
        }
    }
}

/****************************************************************************************************************
 ***** Modification End
 *****************************************************************************************************************/

var maxMastHeadSize = 0;
var minMastHeadSize = 0;

function changeCursor(cursorName) {
    //Loops through all the available frames and sets the cursor
    if (topPlanningWindow.frames) {
        for (i = 0; i < topPlanningWindow.frames.length; i++) {
            try {
                topPlanningWindow.frames[i].document.body.style.cursor = cursorName;
            } catch (ex) {}
        }
    }

}

function WaitForBindowsInit() {

    //Check if the Bindows XML rendered the Planning file menu
    //If not, set planningFileMenuRendered to false
    if ((typeof(planningFileMenu) == "undefined") || (planningFileMenu == null)) {
        planningFileMenuRendered = false;
    } else {
        planningFileMenuRendered = true;
    }

    if (!planningFileMenuRendered) {
        setTimeout(WaitForBindowsInit, 500);
    } else {
        changeCursor("default");
    }
}

function initializeBindows() {

    changeCursor("wait");

    WaitForBindowsInit();

    //Alert the user with a message that switch to Basic mode failed
    if (userSwitchFailed) {
        //Display error to user
        alert(userSwitchFailedMessage);
    }

    //Alert the user with a message that WorkForce Initialze failed
    if (initWFFailed) {
        //Display error to user
        alert(initWorkForceFailedMessage);
    }

    if (initPSBFailed) {
        alert(initPSBFailedMessage);
    }
    //Alert the user with a message that WorkForce upgrade failed
    if (upgradeWFFailed) {
        //Display error to user
        alert(upgradeWorkForceFailedMessage);
    }

    //Refresh the Form folders view after Workforce init
    //Refresh only if the form folder view is displayed in the frameset
    if (WFInitialized || WFUpgraded) {
        if (topPlanningWindow.leftPalette != null) topPlanningWindow.leftPalette.location.href = "LP_ObjectPalette.jsp?Application=" + globalAppName;
        if (WFInitialized) alert(initWorkForceMessage);
    }
    //Alert the user with a message that Capex Initialze was successful
    if (CPXInitialized) {
        if (topPlanningWindow.LPCentral.leftPalette != null) topPlanningWindow.LPCentral.leftPalette.location.href = "LP_ObjectPalette.jsp?Application=" + globalAppName;
        if (CPXInitialized) alert(initCapexMessage);
    }
    if (PSBInitialized) {
        if (topPlanningWindow.LPCentral.leftPalette != null) topPlanningWindow.LPCentral.leftPalette.location.href = "LP_ObjectPalette.jsp?Application=" + globalAppName;
        if (PSBInitialized) alert(initPSBMessage);
    }

    //Alert the user with a message that Capex Initialze failed
    if (initCPXFailed) {
        alert(initCapexFailedMessage);
    }
    if (REFAPPInitialized) {
        if (topPlanningWindow.LPCentral.leftPalette != null) topPlanningWindow.LPCentral.leftPalette.location.href = "LP_ObjectPalette.jsp?Application=" + globalAppName;
        if (REFAPPInitialized) alert(initRefAppMessage);
    }

    //Alert the user with a message that RefApp Initialze failed
    if (initREFAPPFailed) {
        alert(initRefAppFailedMessage);
    }
    //Enable the Task list and Task List status Icons with reference to user mode
    if (inAdvancedMode) {
        topPlanningWindow.toggleTaskListIcon(true);
    } else {
        topPlanningWindow.toggleTaskListIcon(true);
        topPlanningWindow.toggleTaskListStatusIcon(true);
    }
    if (synchedUserProvisioning) {
        if (syncWithProvisioningFailed) {
            //alert the user
            alert(syncWithProvisioningFailedMessage);
        } else {
            alert(syncWithProvisioningSuccededMessage);
        }
    }
}


function openPage() {
    initializeBindows();
    topPlanningWindow.topFrameLoaded = true;

    if (hideTLDropDown) {
        var tlDropDown = document.getElementById("TLDropDown");
        if (tlDropDown) tlDropDown.style.display = "none";
    }
}

/* btrModuleHandler is used to holds the active planning module's in workspace */
var btrModuleHandler = null;
if (isWorkspace) {
    btrModuleHandler = getPlanningModuleHandler();
}



function setWorkspaceMenuItemState() {
    if (workspaceWindow.gModuleManager) {
        var rContainer = workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup());
        var rModule = null;
        if (rContainer) rModule = rContainer.getHandler().getActiveModule();
        if (rModule) {
            if (!rModule.getHandler().isEnterDataMergeDone) { /* means Enterdata page is not the main content loaded */
                rModule.getHandler().BT_FileMenu.EnterDataSetEnabled(false);
            }
        }
    }
}


function openPageWithoutBindows() {
    //debugger;
    if (!userSwitchFailed) {
        mergeIntoWorkspaceMenu();
        InitializeObjectPalette();
    }

    setWorkspaceMenuItemState();
    topPlanningWindow.topFrameLoaded = true;
    topPlanningWindow.planningFileMenuRendered = true;
    /*
    alert('+++Before openPageWithoutBindows EnterDataSetEnabled(false)');
    btrModuleHandler.BT_FileMenu.EnterDataSetEnabled(false);
    alert('+++After openPageWithoutBindows EnterDataSetEnabled(false)');
    */
    //Alert the user with a message that switch to Basic mode failed
    if (userSwitchFailed) {
        alert(userSwitchFailedMessage);
    }
    //Alert the user with a message that WorkForce Initialze failed
    if (initWFFailed) {
        alert(initWorkForceFailedMessage);
    }
    //Alert the user with a message that WorkForce upgrade failed
    if (upgradeWFFailed) {
        alert(upgradeWorkForceFailedMessage);
    }
    //Alert the user with a message that Capex Initialze failed
    if (initCPXFailed) {
        alert(initCapexFailedMessage);
    }
    if (initREFAPPFailed) {
        alert(initRefAppFailedMessage);
    }
    //Alert the user with a message that WorkForce Initialze failed
    if (initPSBFailed) {
        alert(initPSBFailedMessage);
    }
    //Refresh the Form folders view after Workforce init
    //Refresh only if the form folder view is displayed in the frameset
    if (WFInitialized || WFUpgraded) {
        if (topPlanningWindow.LPCentral) {
            if (topPlanningWindow.LPCentral.leftPalette != null) topPlanningWindow.LPCentral.leftPalette.location.href = "LP_ObjectPalette.jsp?Application=" + globalAppName;
            if (WFInitialized) alert(initWorkForceMessage);
        }
    }

    if (CPXInitialized) {
        if (topPlanningWindow.LPCentral) {
            if (topPlanningWindow.LPCentral.leftPalette != null) topPlanningWindow.LPCentral.leftPalette.location.href = "LP_ObjectPalette.jsp?Application=" + globalAppName;
            if (CPXInitialized) alert(initCapexMessage);
        }
    }
    if (PSBInitialized) {
        if (topPlanningWindow.LPCentral) {
            if (topPlanningWindow.LPCentral.leftPalette != null) topPlanningWindow.LPCentral.leftPalette.location.href = "LP_ObjectPalette.jsp?Application=" + globalAppName;
            if (PSBInitialized) alert(initPSBMessage);
        }
    }
    if (REFAPPInitialized) {
        if (topPlanningWindow.LPCentral) {
            if (topPlanningWindow.LPCentral.leftPalette != null) topPlanningWindow.LPCentral.leftPalette.location.href = "LP_ObjectPalette.jsp?Application=" + globalAppName;
            if (REFAPPInitialized) alert(initRefAppMessage);
        }
    }
    if (synchedUserProvisioning) {
        if (syncWithProvisioningFailed) {
            alert(syncWithProvisioningFailedMessage);
        } else {
            alert(syncWithProvisioningSuccededMessage);
        }
    }
}


function setMastheadHeights() {
    var mastHeadMaxDiv = document.getElementById("masthead_max");
    var mastHeadMinDiv = document.getElementById("masthead_min");

    maxMastHeadSize = mastHeadMaxDiv.offsetHeight + document.getElementById("fileMenu").offsetHeight - 3;
    minMastHeadSize = mastHeadMinDiv.offsetHeight - 3;
    topPlanningWindow.document.getElementById('mainframeset').rows = maxMastHeadSize + ', *';
}

function toggleMastHead() {
    //This function toggles the Masthead between maximized and minimized displays
    var mastHeadMaxDiv = document.getElementById("masthead_max");
    var mastHeadMinDiv = document.getElementById("masthead_min");

    if (mastHeadMinimized) {
        if (mastHeadMaxDiv) mastHeadMaxDiv.style.display = '';
        if (mastHeadMinDiv) mastHeadMinDiv.style.display = 'none';
        maxMastHeadSize = mastHeadMaxDiv.offsetHeight + document.getElementById("fileMenu").offsetHeight;
        topPlanningWindow.LPCentral.document.getElementById('mainframeset').rows = maxMastHeadSize + ', 19, *';
    } else {
        if (mastHeadMaxDiv) mastHeadMaxDiv.style.display = 'none';
        if (mastHeadMinDiv) mastHeadMinDiv.style.display = '';
        if (topPlanningWindow.LPCentral.topFrame) topPlanningWindow.LPCentral.topFrame.display = 'none';
        minMastHeadSize = mastHeadMinDiv.offsetHeight;
        minMastHeadSize = minMastHeadSize + 13;
        topPlanningWindow.LPCentral.document.getElementById('mainframeset').rows = minMastHeadSize + ', 19, *';
    }
    mastHeadMinimized = !mastHeadMinimized;
}

var currentADFUI = "";

function openMCWindow(windowName, isAdminWindow, adfModuleId) {
    // ADF Integration changes
    var showAdfUI = false;
    if (adfModuleId) { // This would be defined for modules which are currently implemented in ADF. 
        showAdfUI = isWorkspace; // If invoked from workspace, load new ADF UI. In stadalone mode when you login with LogOn.jsp, always load old UIs
        currentADFUI = adfModuleId;
    }
    if (showAdfUI && isADFUILoaded()) {
        topPlanningWindow.frames[0].loadModuleInContentPaneWrkSpace(adfModuleId); // windowName is actually module indicator
    } else {
        try {
            var hideLeftPalette = false;
            if ((isAdminWindow) && (!leftPaletteHidden)) {
                hideLeftPalette = true;
            } else if ((!isAdminWindow) && (leftPaletteHidden)) {
                hideLeftPalette = true;
            }
            //As per feedback from Beta customers, do not hide the Viewpane if admin task is chosen
            //if (hideLeftPalette) hideLP();
            //Hide the wizard Frame if opening any other window than TaskList
            if (!inAdvancedMode) {
                showWizardFrame(false);
            }
            //The calls below donot work when Planning is front ended by a reverse proxy or in an SSL offloader environment
            //windowName = this.location.protocol + "//" + this.location.host + planningContext + "/" + windowName;
            //Replace the ? if already present in the location.search
            //var locationSearch = this.location.search;

            //if(windowName.indexOf('?')!= -1 && locationSearch.indexOf('?') != -1) {
            //var theChar = locationSearch.charAt(locationSearch.indexOf('?'));
            //locationSearch = locationSearch.replace(theChar, "&");
            //}

            //windowName = windowName + locationSearch;
            if (isWorkspace) {
                var workspaceContextUrl = workspaceWindow.gModuleManager.getStartupContextPath();
                var planningContextPath = workspaceContextUrl + "/../HyperionPlanning/";
                windowName = planningContextPath + windowName;
            } else {
                windowName = "/HyperionPlanning/" + windowName;
            }

            //If a randomiser is not present, add it
            if (windowName.indexOf('RND') == -1) {
                if (windowName.indexOf('?') != -1) {
                    windowName = windowName + "&Application=" + globalAppName + "&RND=" + Math.random();
                } else {
                    windowName = windowName + "?Application=" + globalAppName + "&RND=" + Math.random();
                }
            }

            //windowName = context + windowName + "&RND=" + Math.random();
            //window.open('http://localhost:19000/HyperionPlanning/PlanningCentral.jsp?Redirect=' + windowName, "mainFrame","");
            window.open(windowName, "mainFrame", "");

        } catch (ex) {}
    }
}

function hideLP() {
    var nestedFrame = topPlanningWindow.LPCentral.document.getElementById("nestedFrameSet");
    if (nestedFrame) {
        if (leftPaletteHidden) {
            nestedFrame.cols = "20%,*";
            if (inAdvancedMode) {
                topPlanningWindow.LPCentral.leftPalette.folderFrame.refreshForms();
            }
        } else {
            nestedFrame.cols = "0,*";
        }
        leftPaletteHidden = !leftPaletteHidden;
        var checkMenuItem = true;
        if (leftPaletteHidden) checkMenuItem = false;
        if (planningFileMenuRendered) planningFileMenu.setMenuItemChecked("cmdPVLP", checkMenuItem);
    }
}

function changeProcessName(processName) {
    if (topPlanningWindow.LPCentral) {
        var objectPaletteHeader = topPlanningWindow.LPCentral.objPaletteHeader;
        var processNameHolder = null;
        /* ObjectPaletteHeader will be null in case of Planning invoked within workspace */
        if (objectPaletteHeader) {
            processNameHolder = topPlanningWindow.LPCentral.objPaletteHeader.document.getElementById("processName");
            if (processNameHolder) processNameHolder.innerHTML = processName;
        }
        if (isWorkspace) ChangeWorkspaceProcessBarText(processName);
    }
}

function changeProcessBarText(NewText) {
    if (topPlanningWindow.LPCentral) {
        var objectPaletteHeader = topPlanningWindow.LPCentral.objPaletteHeader;
        var processNameHolder = null;
        /* ObjectPaletteHeader will be null in case of Planning invoked within workspace */
        if (objectPaletteHeader) {
            processNameHolder = topPlanningWindow.LPCentral.objPaletteHeader.document.getElementById("processBarText");
            if (processNameHolder) processNameHolder.innerHTML = NewText;
        }
        if (isWorkspace) ChangeWorkspaceProcessBarText(NewText);
    }
}

function menuSwitchUserMode(invokedFrom, switchTo) {

    if (isWorkspace) {
        closeAdvancedTLWindow();
        topPlanningWindow.document.MastHeadForm.ACTION.value = "SWITCH_USER_MODE";
        topPlanningWindow.document.MastHeadForm.INVOKED_FROM.value = invokedFrom;
        topPlanningWindow.document.MastHeadForm.SWITCH_TO.value = switchTo;
        planningFileMenuRendered = false;
        topPlanningWindow.document.MastHeadForm.submit();
    } else {
        closeAdvancedTLWindow();
        document.MastHeadForm.ACTION.value = "SWITCH_USER_MODE";
        document.MastHeadForm.INVOKED_FROM.value = invokedFrom;
        document.MastHeadForm.SWITCH_TO.value = switchTo;
        planningFileMenuRendered = false;
        document.MastHeadForm.submit();
    }

}

function enableMenuItem(itemId) {
    if (planningFileMenuRendered) {
        if (isWorkspace) {
            btrModuleHandler.BT_FileMenu.setMenuItemEnabled(itemId, true);
        } else {
            planningFileMenu.setMenuItemEnabled(itemId, true);
        }
    }
}

function disableMenuItem(itemId) {
    if (planningFileMenuRendered) {
        if (isWorkspace) {
            btrModuleHandler.BT_FileMenu.setMenuItemEnabled(itemId, false);
        } else {
            planningFileMenu.setMenuItemEnabled(itemId, false);
        }
    }
}

function enableDEMenu() {
    if (planningFileMenuRendered) {
        if (isWorkspace) {
            btrModuleHandler.BT_FileMenu.EnterDataSetEnabled(true);
        } else {
            planningFileMenu.EnterDataSetEnabled(true);
        }
    }
}

function disableDEMenu() {
    if (planningFileMenuRendered) {
        if (isWorkspace) {
            btrModuleHandler.BT_FileMenu.EnterDataSetEnabled(false);
        } else {
            planningFileMenu.EnterDataSetEnabled(false);
        }
    }
}

function checkMenuItem(itemId) {

    if (planningFileMenuRendered) {
        if (isWorkspace) {
            btrModuleHandler.BT_FileMenu.setChecked(itemId, true);
        } else {
            planningFileMenu.setChecked(itemId, true);
        }
    }

}

function unCheckMenuItem(itemId) {
    if (planningFileMenuRendered) {
        if (isWorkspace) {
            btrModuleHandler.BT_FileMenu.setChecked(itemId, false);
        } else {
            planningFileMenu.setChecked(itemId, true);
        }
    }

}
/*
 * Commenting out enableWFMenu and disableWFMenu function as they are not used

function enableWFMenu() {
	if (planningFileMenuRendered) planningFileMenu.WorkforceSetEnabled(true);
}

function disableWFMenu() {
	if (planningFileMenuRendered) planningFileMenu.WorkforceSetEnabled(false);
}
*/

function loadTaskListWSIntegration(tasklistId) {
    if (tasklistId) {
        if (isWorkspace) {
            topPlanningWindow.document.MastHeadForm.ACTION.value = "SWITCH_TASK_LIST";
            topPlanningWindow.document.MastHeadForm.TLDropDown.value = tasklistId;
            topPlanningWindow.document.MastHeadForm.submit();
        } else {
            document.MastHeadForm.ACTION.value = "SWITCH_TASK_LIST";
            document.MastHeadForm.TLDropDown.value = tasklistId;
            document.MastHeadForm.submit();

        }
    }
}

function openTaskWS(taskId, taskListId) {

    var formDiv = document.getElementById('task' + taskId);
    if (formDiv != null) {
        selectedItem = formDiv;
        selectedItem.className = "objectList trigger selected";
    }
    if (taskId != "") {
        var wizardForm = topPlanningWindow.LPCentral.frames["wizardFrame"];
        if (wizardForm) {
            wizardForm.moveToTask(taskId, taskListId);
        }
    }
}
var currentSelectedTaskWS = null;
var selectedItemWS = null;
var treeParentsWS = new Array();

function showTaskWS(taskId) {
    var parentId = treeParentsWS[taskId];
    if ((parentId) && (parentId != 1)) {
        showTaskWS(parentId);
    }
    var taskImg = document.getElementById("t" + taskId);
    var taskBranch = document.getElementById("br" + taskId);
    if ((taskImg) && (taskBranch)) {
        if (taskBranch.style.display != "block") {
            taskBranch.style.display = "block";
            if (taskImg.src != openImg.src) {
                taskImg.src = openImg.src;
            }
        }
    }
}

function selectTaskWS(taskId) {
    if (currentSelectedTaskWS == taskId) {
        return;
    }
    currentSelectedTaskWS = taskId;
    if (selectedItemWS != null) {
        selectedItemWS.className = "trigger";
    }
    var taskDiv = document.getElementById('task' + taskId);
    if (taskDiv != null) {
        selectedItemWS = taskDiv;
        selectedItemWS.className = "trigger selected";
    }

    // make sure it is visible
    showTaskWS(treeParentsWS[taskId]);
}

function displayCompletedImageWS(taskId) {

    /*var imgDiv = document.getElementById('img' + taskId);
	if (imgDiv != null) {
		imgDiv.style.display = (imgDiv.style.display == '') ? 'none' : '';
	}*/

    showTaskWS(taskId);

}


/* The value of the selected task id is set in the TL_Navigator.jsp's displayTaskInWizard method */
var workspaceSelectedTaskId = null;

function loadTaskList() {
    var TLDropDown = topPlanningWindow.document.getElementById("TLDropDown");
    if (TLDropDown) {
        if (inAdvancedMode) {
            if (topPlanningWindow.LPCentral) {
                if (topPlanningWindow.LPCentral.leftPalette.TasklistFrame) {
                    topPlanningWindow.LPCentral.leftPalette.TasklistFrame.location.href = "LP_TaskList.jsp?Application=" + globalAppName + "&TaskList=" + TLDropDown.value;
                    topPlanningWindow.openMCWindow("ViewTaskList.jsp?Application=" + globalAppName + "&TaskList=" + TLDropDown.value, false);
                }
            }
        } else {
            //Switch the Task List stored in the session
            document.MastHeadForm.ACTION.value = "SWITCH_TASK_LIST";
            planningFileMenuRendered = false;
            document.MastHeadForm.submit();
        }
    }
}

function verifyDataEntry() {
    if (topPlanningWindow.LPCentral)
        return (topPlanningWindow.LPCentral.mainFrame.isDataEntryPage);
}

function verifyAdHocMode() {
    var inAdHocMode = false;
    try {
        inAdHocMode = topPlanningWindow.LPCentral.mainFrame.isInAdHocMode();
    } catch (e) {
        inAdHocMode = false;
    }
    return (inAdHocMode);
}

function isADFUILoaded() {
    try {
        if (topPlanningWindow.LPCentral.mainFrame) {
            useADF = false; // To handle toolbar actions in standalone login for non adf ui when parameter ADF_UI is set to true
        }
    } catch (e) {}
    return useADF;
}

function triggerADFGridOperation(oper) {
    topPlanningWindow.frames[0].triggerGridOperations(oper);
}

function menuSave() {
    try {
        if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
            /****************************************************************************************************************
             ***** Modification Start
             ***************************************************************************************************************/
            c_initialize();
			c_BR = false;			
		
            if (c_validate() == false){
				if(c_BR){
					var CTI = c_currentTabIndex;
					var TTI;
					if(c_tabs.length-1 == c_currentTabIndex){
						TTI = 0;
					}
					else{
						TTI = c_tabs.length-1;
					}
					window.frames[0].document.body.style.cursor = 'wait';
					window.frames[0].document.getElementById(c_tabIDs[TTI]).click();
					setTimeout(function(){window.frames[0].document.getElementById(c_tabIDs[CTI]).click();}, 3000);
					window.frames[0].document.body.style.cursor = 'default';
				}
				c_BR = false;
                return false; //Dont save the form if validation fails.
			}
            /****************************************************************************************************************
             ***** Modification END
             ***************************************************************************************************************/
            triggerADFGridOperation("saveGrid");
        } else {
            if (verifyDataEntry()) {
                var isMenuEnabled = false;
                if (isWorkspace) {
                    isMenuEnabled = btrModuleHandler.BT_FileMenu.verifyEnabled("cmdPFSave");
                } else {
                    isMenuEnabled = planningFileMenu.verifyEnabled("cmdPFSave");
                }
                if (isMenuEnabled) {
                    topPlanningWindow.LPCentral.mainFrame.doSave();
                }
            }
        }
    } catch (e) {}
}

function menuPrint() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("exportPDFBtn");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.printClicked();
        }
    }
}

function menuManageProcess() {
    topPlanningWindow.openMCWindow("CheckStatus.jsp?Application=" + globalAppName, false, "ManageApprovalsDashboard");
}

function menuCopyVersions() {

    topPlanningWindow.openMCWindow("CopyVersions.jsp?Application=" + globalAppName, false, "CopyVersionTF");
}

function menuCopyDPVersions() {
    topPlanningWindow.openMCWindow("SomeName.jsp?Application=" + globalAppName, false, "CopyDPVersionTF");
}

function menuUserPreferences() {

    topPlanningWindow.openMCWindow("UserPreferences.jsp?Application=" + globalAppName, false);
}

function menuHome() {
    topPlanningWindow.openMCWindow("MC_PlanningCentral.jsp?Application=" + globalAppName, false);
}



function menuLogOff() {
    if (confirm(logOffConfirmMessage)) {


        changeCursor("wait");

        //Close the Tasklist browsing window if open in advanced mode
        if (topPlanningWindow) {
            topPlanningWindow.closeAllPlanningWindows();
        }
        planningFileMenuRendered = false;
        document.LOGOFF.Application.value = globalAppName;
        document.LOGOFF.submit();
        return true;
    }
    return false;
}

function menuMastHeadLogOff() {
    if (confirm(logOffConfirmMessage)) {


        changeCursor("wait");

        //Close the Tasklist browsing window if open in advanced mode
        if (topPlanningWindow) {
            topPlanningWindow.closeAllPlanningWindows();
        }
        planningFileMenuRendered = false;
        document.LOGOFF.Application.value = globalAppName;
        document.LOGOFF.submit();
        return true;
    } else {


    }

}

function menuExit() {
    if (menuLogOff()) topPlanningWindow.close();
}

function menuAdjust() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("adjustData");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.toggleAdjustData();
        }
    }
}

function menuGridSpread() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("gridSpread");
    } else {
        var isButtonEnabled = false;
        if (isWorkspace) {
            isButtonEnabled = btrModuleHandler.BT_FileMenu.verifyEnabled("cmdPEGridSpread");
        } else {
            isButtonEnabled = enabled[GRID_SPREAD_BTN];
        }
        if (isButtonEnabled && (verifyDataEntry())) {
            topPlanningWindow.LPCentral.mainFrame.startGridSpread();
        }
    }
}

function menuMassAllocate() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("massAllocate");
    } else {
        var isButtonEnabled = false;
        if (isWorkspace) {
            isButtonEnabled = btrModuleHandler.BT_FileMenu.verifyEnabled("cmdPEMassAllocate");
        } else {
            isButtonEnabled = enabled[MASS_ALLOC_BTN];
        }
        if (isButtonEnabled && verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.startMassAllocate();
        }
    }
}

function menuCut() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("cutBtn");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.preCut();
        }
    }
}

function menuCopy() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("copyBtn");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.HspSecondaryCopy();
        }
    }
}

function menuCopyDocLink() {
    if (isADFUILoaded()) {
        topPlanningWindow.frames[0].copyCurrentPageLink();
    } else {
        try {
            if (topPlanningWindow.LPCentral) {
                var contentHREF = topPlanningWindow.LPCentral.mainFrame.location.href;
                if (!isWorkspace) {
                    if (contentHREF.indexOf("Application") == -1) {
                        if (contentHREF.indexOf("?") != -1) {
                            contentHREF = contentHREF + "&Application=" + globalAppName;
                        } else {
                            contentHREF = contentHREF + "?Application=" + globalAppName;
                        }
                    }
                    var rndIndex = contentHREF.indexOf("RND=");
                    if (rndIndex != -1) {
                        var ampIndex = contentHREF.indexOf("&", rndIndex);
                        if (ampIndex == -1) {
                            contentHREF = contentHREF.substring(0, rndIndex);
                        } else {
                            contentHREF = contentHREF.substring(0, rndIndex) + contentHREF.substring(ampIndex + 1);
                        }
                    }
                    //when not launched from workspace isContained applies to Planning standalone
                    //Planning should not be contained, this is only when we want Planning app to be embedded within another
                    //container like CAS etc, if this param is present then it is true, if it is not present we cannot assume it to be true

                    if (contentHREF.indexOf("isContained") == -1) {
                        if (contentHREF.indexOf("?") != -1) {
                            contentHREF = contentHREF + "&isContained=false";
                        } else {
                            contentHREF = contentHREF + "?isContained=false";
                        }
                    }
                } else {
                    var loc = topPlanningWindow.LPCentral.mainFrame.location;
                    var workspaceUrl = loc.protocol + "//" + loc.host + "/workspace/";
                    workspaceUrl = workspaceUrl + "?module=HyperionPlanning.planning";
                    workspaceUrl = workspaceUrl + "&sourceApp=" + globalAppName; /* +"&sso_token=" + encodeURIComponent(workspaceWindow.gModuleManager.getToken());*/
                    workspaceUrl = workspaceUrl + "&targetPage=";
                    var searchStr = loc.search;
                    searchStr = searchStr.substr(1);
                    var tempstr = loc.pathname;
                    var str = tempstr.split("/HyperionPlanning/");
                    var qString = "";
                    for (var i = 0; i < str.length; i++) {
                        if (str[i + 1]) {
                            qString = qString + str[1];
                        }
                    }
                    workspaceUrl = workspaceUrl + qString;
                    searchStr = searchStr.replace(/=/g, "%3D");
                    searchStr = searchStr.replace(/&/g, "%26");
                    workspaceUrl = workspaceUrl + "&targetPageParam=" + searchStr;
                    contentHREF = workspaceUrl;
                }
                window.clipboardData.setData("Text", contentHREF);
            }
        } catch (ex) {}
    }
}

function menuPaste() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("pasteBtn");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.HspSecondaryPaste();
        }
    }
}

function menuSpreadsheetXport() {

    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("exportExcelBtn");
    } else {
        var isButtonEnabled = false;
        if (isWorkspace) {
            isButtonEnabled = btrModuleHandler.BT_FileMenu.verifyEnabled("cmdPFSpreadsheetXport");
        } else {
            isButtonEnabled = enabled[EXCEL_EXPORT_BTN];
        }
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.exportToExcel();
        }
    }
}

function menuSmartviewXport() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("exportToSmartView");
    } else {
        var isButtonEnabled = false;
        if (isWorkspace) {
            isButtonEnabled = btrModuleHandler.BT_FileMenu.verifyEnabled("cmdPFSmartViewXport");
        } else {
            isButtonEnabled = enabled[EXCEL_EXPORT_BTN];
        }

        if (isButtonEnabled && verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.exportToSmartview();
        }
    }
}

function menuAddRow() {
    if (verifyDataEntry()) {
        topPlanningWindow.LPCentral.mainFrame.modifyForm();
    }
}

function menuLaunchRules() {
    if (verifyDataEntry()) {
        topPlanningWindow.LPCentral.mainFrame.DoRules();
    }
}

function menuAnnotatePU() {
    if (isADFUILoaded()) {
        triggerADFGridOperation("launchAnnotatePU");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.ShowAnnotations();
        }
    }
}

function menuAddCellNote() {
    if (isADFUILoaded()) {
        triggerADFGridOperation("cellNote");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.AddCellNote();
        }
    }
}

function menuAddCellAttach() {
    if (isADFUILoaded()) {
        triggerADFGridOperation("cellAttach");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.AddAttachment();
        }
    }
}

function menuCellAttachOpen() {
    if (isADFUILoaded()) {
        triggerADFGridOperation("openAttachment");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.OpenAttachment();
        }
    }
}

function getDrillThroughServers() {
    if (verifyDataEntry()) {
        topPlanningWindow.LPCentral.mainFrame.ShowDrillThroughServers();
    }
}

function getMenuDrillThroughServers() {

    if (isWorkspace) {
        if (isADFUILoaded()) {
            triggerADFGridOperation("getDrillThruURLs");
        } else {
            if (verifyDataEntry()) {
                var drillLocs = topPlanningWindow.LPCentral.mainFrame.getMenuDrillThroughServers();
                return drillLocs;
            }
        }
    } else {
        var drillThroughMenu = application.getComponentById("cmdPEDrillThrough");
        if (verifyDataEntry()) {
            var drillLocs = topPlanningWindow.LPCentral.mainFrame.getMenuDrillThroughServers();
            var DTsubMenu = application.getComponentById("drillThroughSubMenu");

            DTsubMenu.removeAll();
            if (drillLocs == '')
                drillThroughMenu.setSubMenu(null);
            else
                drillThroughMenu.setSubMenu(DTsubMenu);

            var DTsubMenuItem = null;
            for (var i = 0; i < drillLocs.length; i++) {
                var drillLocation = drillLocs[i];
                DTsubMenu.add(DTsubMenuItem = new BiMenuItem(drillLocation.ServerName));
                DTsubMenuItem.setId(drillLocation.ServerURL);
                DTsubMenuItem.addEventListener('action', openDillThroughServer, this);
            }
        }
    }
}

function openDillThroughServer(e) {
    if (isWorkspace) {
        var drillThroughServerURL = e.getTarget().getToolTipText();
        if (isADFUILoaded()) {
            topPlanningWindow.frames[0].loadFDMURL(drillThroughServerURL);
        } else {
            topPlanningWindow.LPCentral.mainFrame.AppendForm(drillThroughServerURL);
        }
    } else {
        var drillThroughServerURL = e.getTarget().getId();
        topPlanningWindow.LPCentral.mainFrame.AppendForm(drillThroughServerURL);
    }
}

function menuAddSupportingDetail() {
    if (isADFUILoaded()) {
        triggerADFGridOperation("launchSupp");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.doSupportingDetail();
        }
    }
}

function menuInitializeBSP() {
    topPlanningWindow.openMCWindow("BSP_Initializer.jsp?Application=" + globalAppName, false);
}

function menuInitializeWorkforce() {
    if (confirm(doYouWantToProcess)) {
        if (isWorkspace) {
            topPlanningWindow.document.MastHeadForm.ACTION.value = "INIT_WF";
            changeCursor("wait");
            planningFileMenuRendered = false;
            topPlanningWindow.document.MastHeadForm.submit();

        } else {
            document.MastHeadForm.ACTION.value = "INIT_WF";
            changeCursor("wait");
            planningFileMenuRendered = false;
            document.MastHeadForm.submit();
        }
    }
}

function menuInitializeCapex() {
    if (confirm(doYouWantToProcess)) {
        if (isWorkspace) {
            topPlanningWindow.document.MastHeadForm.ACTION.value = "INIT_CPX";
            changeCursor("wait");
            planningFileMenuRendered = false;
            topPlanningWindow.document.MastHeadForm.submit();
        } else {
            document.MastHeadForm.ACTION.value = "INIT_CPX";
            changeCursor("wait");
            planningFileMenuRendered = false;
            document.MastHeadForm.submit();
        }
    }
}

function menuInitializePSB() {
    if (confirm(doYouWantToProcess)) {
        if (isWorkspace) {
            topPlanningWindow.document.MastHeadForm.ACTION.value = "INIT_PSB";
            changeCursor("wait");
            planningFileMenuRendered = false;
            topPlanningWindow.document.MastHeadForm.submit();
        } else {
            document.MastHeadForm.ACTION.value = "INIT_PSB";
            changeCursor("wait");
            planningFileMenuRendered = false;
            document.MastHeadForm.submit();
        }
    }
}

function menuInitializeRefApp() {
    if (isWorkspace) {
        topPlanningWindow.document.MastHeadForm.ACTION.value = "INIT_RA";
        planningFileMenuRendered = false;
        topPlanningWindow.document.MastHeadForm.submit();
    } else {
        document.MastHeadForm.ACTION.value = "INIT_RA";
        planningFileMenuRendered = false;
        document.MastHeadForm.submit();
    }
}

function menuRefresh() {
    if (isADFUILoaded()) {
        triggerADFGridOperation("loadGrid");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.RefreshClicked();
        }
    }

}

function menuInstructions() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("instructions");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.toggleInstructions();
        }
    }
}

function menuCurrencies() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("manageCurrency");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.toggleCurrencies();
        }
    }
}

function menuAccountAnnotations() {
    if (isADFUILoaded()) {
        triggerADFGridOperation("showAccAnnotation");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.toggleAccountDescriptions();
        }
    }
}

function menuShowDimensionLabelForPage() {
    if (isADFUILoaded()) {
        triggerADFGridOperation("showDimensionLabelForPage");
    }
}

function setADescMenu(newLabel) {
    if (planningFileMenuRendered) {
        if (isWorkspace) {
            btrModuleHandler.BT_FileMenu.setLabel("cmdPVAccAnnotations", newLabel);
        } else {
            planningFileMenu.setLabel("cmdPVAccAnnotations", newLabel);
        }
    }
}

function setShowDimLabelForPageMenu(newLabel) {
    if (planningFileMenuRendered) {
        if (isWorkspace) {
            btrModuleHandler.BT_FileMenu.setLabel("cmdPVDimLblOnPage", newLabel);
        } else {
            planningFileMenu.setLabel("cmdPVDimLblOnPage", newLabel);
        }
    }
}


function setSuppressedRowsMenu(newLabel) {

    if (planningFileMenuRendered) {
        if (isWorkspace) {
            btrModuleHandler.BT_FileMenu.setLabel("cmdPESuppressMissingRows", newLabel);
        } else {
            planningFileMenu.setLabel("cmdPESuppressMissingRows", newLabel);
        }
    }
}

function setSuppressedColsMenu(newLabel) {

    if (planningFileMenuRendered) {
        if (isWorkspace) {
            btrModuleHandler.BT_FileMenu.setLabel("cmdPESuppressMissingCols", newLabel);
        } else {
            planningFileMenu.setLabel("cmdPESuppressMissingCols", newLabel);
        }
    }
}

function menuViewTaskListStatus() {
    var taskStatusURL = "";
    if (inBasicMode) {
        taskStatusURL = "TaskListStatus.jsp";
        var TLDropDown = document.getElementById("TLDropDown");
        if (TLDropDown) {
            taskStatusURL += "?Application=" + globalAppName + "&TaskList=" + TLDropDown.value;
            topPlanningWindow.openMCWindow(taskStatusURL, false);
        }
    }
}

function menuViewTaskListStatusWSIntegration() {
    var taskStatusURL = "";
    if (inBasicMode) {
        taskStatusURL = "TaskListStatus.jsp";
        if (workspaceSelectedTaskId) {
            taskStatusURL += "?Application=" + globalAppName + "&TaskList=" + workspaceSelectedTaskId;
            topPlanningWindow.openMCWindow(taskStatusURL, false);
        }
    }
}

function menuViewTaskListReportWSIntegration() {
    var taskReportURL = "";

    taskReportURL = "TLReport.jsp";
    if (workspaceSelectedTaskId) {
        taskReportURL += "?Application=" + globalAppName + "&TaskList=" + workspaceSelectedTaskId;

    } else {
        taskReportURL += "?Application=" + globalAppName;
    }
    topPlanningWindow.openMCWindow(taskReportURL, false, "Report");
}

function menuViewTaskListReport() {
    var taskReportURL = "";

    taskReportURL = "TLReport.jsp";
    var TLDropDown = document.getElementById("TLDropDown");
    if (TLDropDown) {
        taskReportURL += "?Application=" + globalAppName + "&TaskList=" + TLDropDown.value;
    } else {

        taskReportURL += "?Application=" + globalAppName;
    }
    topPlanningWindow.openMCWindow(taskReportURL, false);
}

function menuViewTaskListWSIntegration() {
    if (!isADFUILoaded()) {
        menuViewTaskList();
        return;
    }
    var taskStatusURL = "ViewTaskList.jsp";
    if (workspaceSelectedTaskId) {
        taskStatusURL += "?Application=" + globalAppName + "&TaskList=" + workspaceSelectedTaskId;
    }
    if (inAdvancedMode)
        topPlanningWindow.openMCWindow(taskStatusURL, false, 'TaskListStatusWizardTF');
}

function menuViewTaskList() {
    if (inBasicMode) {
        var taskStatusURL = "ViewTaskList.jsp";
        var TLDropDown = document.getElementById("TLDropDown");
        if (TLDropDown) {
            taskStatusURL += "?Application=" + globalAppName + "&TaskList=" + TLDropDown.value;
            topPlanningWindow.openMCWindow(taskStatusURL, false);
        }
    } else {
        launchTaskList();
    }

}

function menuTaskMap() {

}

function menuObjectPalette() {
    if (isADFUILoaded()) {
        topPlanningWindow.frames[0].toggleViewPaneWs();
    } else {
        topPlanningWindow.hideLP();
    }
}

function menuMinimizeMastHead() {
    if (isADFUILoaded()) {
        topPlanningWindow.frames[0].toggleMastHeadWs();
    } else {
        topPlanningWindow.toggleMastHead();
    }
}

function menuManageForms() {
    //topPlanningWindow.openMCWindow("fd");
    topPlanningWindow.openMCWindow("FormManagement.jsp?Application=" + globalAppName, true, "FormManagementTF");
}

function menuAliasTables() {
    //topPlanningWindow.openMCWindow("AliasTables");
    topPlanningWindow.openMCWindow("AliasTable.jsp?Application=" + globalAppName, true, "AliasTables");
}

function menuCopyData() {
    topPlanningWindow.openMCWindow("CopyData.jsp?Application=" + globalAppName, true, "copydata");
    //topPlanningWindow.openMCWindow("copydata");
}

function menuClearCellDetails() {
    topPlanningWindow.openMCWindow("ClearCellDetails.jsp?Application=" + globalAppName, true, "clearcelldetails");
    //topPlanningWindow.openMCWindow("clearcelldetails");
}

function menuCreateApp() {
    topPlanningWindow.openMCWindow("AppWizard.jsp?Application=" + globalAppName + "&MOD=create&LogOffButton=false", true, "CreateApp");
}

function menuDeleteApp() {
    topPlanningWindow.openMCWindow("AppWizard.jsp?Application=" + globalAppName + "&MOD=delete&LogOffButton=false", true, "ManageApp");
}

function menuRegisterApp() {
    topPlanningWindow.openMCWindow("AppWizard.jsp?Application=" + globalAppName + "&MOD=register&LogOffButton=false", true, "ManageApp");
}

function menuCreateDS() {
    topPlanningWindow.openMCWindow("ManageDatasource.jsp?Application=" + globalAppName + "&MOD=create", true, "EditDS");
}

function menuEditDS() {
    topPlanningWindow.openMCWindow("ManageDatasource.jsp?Application=" + globalAppName + "&MOD=edit", true, "ManageDS");
}

function menuDeleteDS() {
    topPlanningWindow.openMCWindow("ManageDatasource.jsp?Application=" + globalAppName + "&MOD=delete", true, "ManageDS");
}

function menuBRSecurity() {
    topPlanningWindow.openMCWindow("BusinessRuleSecurityManagement.jsp?Application=" + globalAppName, true, "BRManagementTF");
}

function menuPlanTypes() {
    topPlanningWindow.openMCWindow("LogOn.jsp?Application=" + globalAppName, true, "PlanTypesTF");
}

function menuViewStatistics() {
    topPlanningWindow.openMCWindow("Statistics.jsp?Application=" + globalAppName, true, "ViewStatistics");
}

function menuDimensionEditor() {
    //topPlanningWindow.openMCWindow("dimensions");
    topPlanningWindow.openMCWindow("Dimensions.jsp?Application=" + globalAppName, true, "dimensions");
}

function menuReporting() {
    topPlanningWindow.openMCWindow("Reporting.jsp?Application=" + globalAppName, true, "AppReportsTF");
}

function menuManageTaskLists() {
    topPlanningWindow.openMCWindow("TaskList.jsp?Application=" + globalAppName, true, "TaskListManagement");
}
//------added entry for MenuItems----- sharad
function menuManageCube() {
    topPlanningWindow.openMCWindow("Create_RefreshCube.jsp?Application=" + globalAppName, true);
}

function menuManagePartitions() {

    topPlanningWindow.openMCWindow("Dummy.jsp?Application=" + globalAppName, true, "PartitionDB");
}

function menuManageCubeCreate() {

    topPlanningWindow.openMCWindow("Create_RefreshCube.jsp?Application=" + globalAppName + "&ACTION=CreateCube", true, "cubecreate");
}

function menuManageCubeRefresh() {

    topPlanningWindow.openMCWindow("Create_RefreshCube.jsp?Application=" + globalAppName + "&ACTION=RefreshCube", true, "cuberefresh");
}

function menuCurrencyConversion() {
    //topPlanningWindow.openMCWindow("CurrencyConversion");
    topPlanningWindow.openMCWindow("CreateCurrConversion.jsp?Application=" + globalAppName, true, "CurrencyConversion");
}

function menuExchangeRates() {
    topPlanningWindow.openMCWindow("ExchangeRateDetails.jsp?Application=" + globalAppName, true, "ExchangeRate");
}

function menuCreateSecurityFilters() {
    topPlanningWindow.openMCWindow("CreateSecurityFiltersDetails.jsp?Application=" + globalAppName, true, "SecurityFilters");
}

function menuBroadcastMessage() {
    topPlanningWindow.openMCWindow("BroadCastMessage.jsp?Application=" + globalAppName, true, "BroadCastMessage");
    //var windowURL = this.location.protocol + "//" + this.location.host + planningContext + "/" + "BroadCastMessage.jsp?Application=" + globalAppName;
    //newWin = window.open(windowURL,'newwin','width=500,height=400,top=180,left=220,resizable=no,scrollbars=no');
}

//-----------------------
function menuAppSettings() {
    topPlanningWindow.openMCWindow("AppSettings.jsp?Application=" + globalAppName, true, "AppSettings");
}

function menuRAM() {
    //topPlanningWindow.openMCWindow("ReportingMappingTF");
    topPlanningWindow.openMCWindow("ManageReportAppMapping.jsp?Application=" + globalAppName, true, "ReportingMappingTF");
}

function menuManageUserVariables() {
    //topPlanningWindow.openMCWindow("UserVariable");
    topPlanningWindow.openMCWindow("UserVariables.jsp?Application=" + globalAppName, true, "UserVariable");
}

function menuOtherPlaces() {
    topPlanningWindow.openMCWindow("Tools.jsp?Application=" + globalAppName, false, "CustomLinkTF");
}

function menuManagement() {
    topPlanningWindow.openMCWindow("MenuManagement.jsp?Application=" + globalAppName, true, "Menu");
}

function enumManagement() {
    //topPlanningWindow.openMCWindow("smartlistlisting");
    topPlanningWindow.openMCWindow("Enumerations.jsp?Application=" + globalAppName, false, "smartlistlisting");
}

function manageProps() {
    topPlanningWindow.openMCWindow("PropertyEditor.jsp?Application=" + globalAppName, false, "PropertyEditor");
}

function menuBusinessRules() {
    topPlanningWindow.openMCWindow(businessRulesPage + "?Application=" + globalAppName, false, "BusinessRulesTF");
}

function menuJobMonitor() {
    topPlanningWindow.openMCWindow("JobStatus.jsp?Application=" + globalAppName, false, "JobConsoleTF");
}

function menuOLUConsole() {
    topPlanningWindow.openMCWindow("Dummy.jsp?Application=" + globalAppName, false, "OLUConsoleTF");
}

function menuHelpTopic() {

    getHelpAction();


}

function menuHelpContents() {

    getHelpContents();
}

function menuInformationMap() {
    if (isWorkspace) {
        launchWindowHelp(url_informationMap);
    } else {
        launchWindow(url_informationMap);
    }
}

function menuHelpContentsCapex() {
    if (isWorkspace) {

        launchWindowHelpWS("launch.html", "capexadmin");
    } else {
        launchWindow(url_capexContents);
    }


}

function menuHelpContentsWorkforce() {
    if (isWorkspace) {

        launchWindowHelpWS("launch.html", "wfpadmin");
    } else {
        launchWindow(url_workforceContents);
    }
}

function menuHelpContentsPSB() {
    if (isWorkspace) {

        launchWindowHelpWS("launch.html", "publicsector");
    } else {
        launchWindow(url_psbContents);
    }
}

function menuHelpContentsPFP() {
    if (isWorkspace) {
        launchWindowHelpWS("launch.html", "projectplanning");
    } else {
        launchWindow(url_fpContents);
    }
}

function menuTechSupport() {
    launchWindow(url_support);
}

function menuDevNetwork() {
    launchWindow(url_devnetwork);
}

function menuHyperionHome() {

    launchWindow(url_hyperionhome);
}

function menuAboutPlanning() {

    launchAboutWindow("PlanningAbout.jsp?Application=" + globalAppName);
}

function menuEpmDocumentation() {

    launchWindow(url_epmDocumentation);
}

function closeAdvancedTLWindow() {
    //Check if Tasklist browsing window is open in advanced mode
    if (taskListWindow) {
        try {
            taskListWindow.close();
        } catch (ex) {}
    }
}

function closeAllPlanningWindows() {

    for (var indx = 0; indx < planningWindowsArray.length; indx++) {

        if (topPlanningWindow.planningWindowsArray[indx] != null) {
            if (topPlanningWindow.planningWindowsArray[indx].closed == false) {
                topPlanningWindow.planningWindowsArray[indx].close();
                topPlanningWindow.planningWindowsArray[indx] = null;
            }
        }
    }
}

function showWizardFrame(show) {
    var wizardFrameset = topPlanningWindow.LPCentral.document.getElementById("wizardFrameSet");
    if (wizardFrameset) {
        if (show) {
            wizardFrameset.rows = "*, 40";
        } else {
            if (topPlanningWindow) topPlanningWindow.changeProcessBarText("");
            wizardFrameset.rows = "*, 0";
        }
    }
}

function refreshMastHead() {
    planningFileMenuRendered = false;
    if (isWorkspace) {
        //donot refresh masthead for workspace
    } else {
        document.reloadMe.submit();
    }
}

var aboutWin = null;

function launchWindow(aboutURL) {
    if (aboutWin != null && !aboutWin.closed) {
        aboutWin.close();
    }
    var popupLeft = 45;
    var popupTop = 30;
    if (navigator.appName != "Microsoft Internet Explorer") {
        parentLeftCoor = window.screenX - 4;
        parentTopCoor = window.screenY + 120;
    } else {
        parentLeftCoor = window.screenLeft;
        parentTopCoor = window.screenTop;
    }
    popupLeft = popupLeft + parentLeftCoor;
    popupTop = popupTop + parentTopCoor;

    if (parentTopCoor + 100 > window.screen.availHeight) {
        popupTop = parentTopCoor - 160;
    }
    if (parentLeftCoor + 100 > window.screen.availWidth) {
        popupLeft = parentLeftCoor - 160;
    }
    var helpOpt = "width=720,height=500,left=" + popupLeft + ",top=" + popupTop + ",screenX=" + popupLeft + ",screenY=" + popupTop + ",scrollbars=1,resizable=1,toolbar=1,address=0";
    aboutWin = window.open(aboutURL, 'aboutWin', helpOpt);

}

function menuSyncWithUserProvisioning() {
    document.MastHeadForm.ACTION.value = "SYNC_WITH_PROVISIONING";
    planningFileMenuRendered = false;
    document.MastHeadForm.submit();

}

function menuDataLoadAdministration() {
    //topPlanningWindow.openMCWindow("dataloadsettings");
    topPlanningWindow.openMCWindow("Dataload.jsp?Application=" + globalAppName, false, "dataloadsettings"); // Passing false for Admin flag here
}

function setManageDataContext() {
    isManageDataPage = true;
    isManageProjectsPage = false;
    isManageModelsPage = false;
    isScheduledIntegrationsPage = false;
}

function setSchdeduleIntegrationsContext() {
    isScheduledIntegrationsPage = true;
    isManageDataPage = false;
    isManageProjectsPage = false;
    isManageModelsPage = false;
}

function setManageModelsContext() {
    isManageModelsPage = true;
    isManageProjectsPage = false;
    isManageDataPage = false;
    isScheduledIntegrationsPage = false;
}

function setManageProjectsContext() {
    isManageProjectsPage = true;
    isManageModelsPage = false;
    isManageDataPage = false;
    isScheduledIntegrationsPage = false;
}

function setDrillThrough() {
    inDrillThrough = true;
}

function resetDrillThrough() {
    inDrillThrough = false;
}

function menuLockCells() {
    if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
        triggerADFGridOperation("lockCells");
    } else {
        if (verifyDataEntry()) {
            topPlanningWindow.LPCentral.mainFrame.lockSelectedCells();
        }
    }
}

function menuSuppressMissingRows() {
    if (verifyDataEntry()) {
        topPlanningWindow.LPCentral.mainFrame.doSuppressMissingRow();
    }
}

function menuSuppressMissingCols() {
    if (verifyDataEntry()) {
        topPlanningWindow.LPCentral.mainFrame.doSuppressMissingCol();
    }
}

function menuSuppressZeroRows() {
    if (verifyDataEntry()) {
        topPlanningWindow.LPCentral.mainFrame.doSuppressZeroRow();
    }
}

function menuSuppressZeroCols() {
    if (verifyDataEntry()) {
        topPlanningWindow.LPCentral.mainFrame.doSuppressZeroCol();
    }
}

function menuAdhocOptions() {
    if (isADFUILoaded()) {
        triggerADFGridOperation('adhocOptions');
    } else {
        launchAdhocOptions();
    }

}

function menuAdhocCreate() {
    if (isADFUILoaded()) {
        triggerADFGridOperation('newAdhoc');
    } else {
        launchAdhocCreate();
    }
}

function menuFormDesigner() {
    if (isADFUILoaded()) {
        topPlanningWindow.frames[0].launchFormDesigner(globalAppName);
    }
}

function menuGridDiagnostics() {
    topPlanningWindow.openMCWindow("", false, "massgridstat");
}

function menuAdhocAnalyze() {
    var isButtonEnabled = false;

    if (isADFUILoaded()) {
        // Handle this in workspace explicitly    
        triggerADFGridOperation("triggerAnalyse");
    } else {
        if (isWorkspace) {
            isButtonEnabled = btrModuleHandler.BT_FileMenu.verifyEnabled("cmdadhocAnalyse");
        } else {
            //standalone Planning 
            isButtonEnabled = enabled[ADHOC_ANALYSE_BTN];
        }
        if (verifyDataEntry() && isButtonEnabled) {
            topPlanningWindow.LPCentral.mainFrame.launchAdhocAnalyze();
        }
    }
}

function menuAdhocSave() {
    if (isADFUILoaded()) {
        triggerADFGridOperation("saveAdhoc");
    } else {
        try {
            topPlanningWindow.LPCentral.mainFrame.launchAdhocSave();
        } catch (ex) {}
    }
}

function menuAdhocZoomInNextLevel() {

    if (isADFUILoaded()) {
        topPlanningWindow.frames[0].triggerAdhocGridOperations("triggerAdhocOperations", false, 123);
    } else {
        if (verifyAdHocMode()) {
            topPlanningWindow.LPCentral.mainFrame.handleMenuZoomIn(0);
        }
    }
}

function menuAdhocZoomInAllLevel() {
    if (isADFUILoaded()) {
        topPlanningWindow.frames[0].triggerAdhocGridOperations("triggerAdhocOperations", false, 124);
    } else {
        if (verifyAdHocMode()) {
            topPlanningWindow.LPCentral.mainFrame.handleMenuZoomIn(1);
        }
    }
}

function menuAdhocZoomInBottomLevel() {
    if (isADFUILoaded()) {
        topPlanningWindow.frames[0].triggerAdhocGridOperations("triggerAdhocOperations", false, 125);
    } else {
        if (verifyAdHocMode()) {
            topPlanningWindow.LPCentral.mainFrame.handleMenuZoomIn(2);
        }
    }
}

function menuAdHocZoomOut() {
    if (isADFUILoaded()) {
        topPlanningWindow.frames[0].triggerAdhocGridOperations("triggerAdhocOperations", false, 119);
    } else {
        if (verifyAdHocMode()) {
            topPlanningWindow.LPCentral.mainFrame.handleMenuZoomOut();
        }
    }
}

function menuAdhocRemoveOnly() {
    if (isADFUILoaded()) {
        topPlanningWindow.frames[0].triggerAdhocGridOperations("triggerAdhocOperations", false, 102);
    } else {
        if (verifyAdHocMode()) {
            topPlanningWindow.LPCentral.mainFrame.handleMenuRemoveOnly();
        }
    }
}

function menuAdhocKeepOnly() {
    if (isADFUILoaded()) {
        topPlanningWindow.frames[0].triggerAdhocGridOperations("triggerAdhocOperations", false, 103);
    } else {
        if (verifyAdHocMode()) {
            topPlanningWindow.LPCentral.mainFrame.handleMenuKeepOnly();
        }
    }
}

function menuAdhocSelectMembers() {
    if (verifyAdHocMode()) {
        topPlanningWindow.LPCentral.mainFrame.handleMenuAdHocMemberSelect();
    }
}

function getStrippedUrl(helpUrl) {
    var returnUrl = "";
    if (helpUrl.indexOf(adminPrefix) != -1) {

        helpUrl = helpUrl.replace(adminPrefix, " ");
    } else if (helpUrl.indexOf(userPrefix) != -1) {

        helpUrl = helpUrl.replace(userPrefix, " ");
    }
    helpUrl = helpUrl.trim();
    return helpUrl;
}

function menuAdminManageProcess() {
    topPlanningWindow.openMCWindow("PM_HierarchyManagement.jsp?Application=" + globalAppName, true, "Approvals");
    //topPlanningWindow.openMCWindow("Approvals");
}

function menuAdminDPType() {
    topPlanningWindow.openMCWindow("SomeName.jsp?Application=" + globalAppName, true, "dpType");
}

function menuAdminDPAtt() {
    topPlanningWindow.openMCWindow("SomeName.jsp?Application=" + globalAppName, true, "dpAttributes");
}

function menuTabletAccess() {
    topPlanningWindow.openMCWindow("SomeName.jsp?Application=" + globalAppName, true, "AssignFuseAccessTF");
}

function menuScenarioVersionAssign() {

    topPlanningWindow.openMCWindow("PM_ScenarioVersionAssignmentManagement.jsp?CAME_FROM=SVAssignmentMenu&Application=" + globalAppName, true, "SVAssignment");

}

function menuImportExportPUH() {
    try {
        if (isADFUILoaded()) { // So that standalone grid implementation is not disturbed
            topPlanningWindow.frames[0].loadPUHImport();
        } else {
            var windowURL = this.location.protocol + "//" + this.location.host + planningContext + "/" + "PM_Import.jsp?Application=" + globalAppName;
            var puhWin = window.open(windowURL, 'PUHImpExpWin', 'width=710,height=148,top=180,left=220,resizable=no,scrollbars=yes');
            if (puhWin) puhWin.focus();
        }
    } catch (e) {}
}

function menuAdminLoadOutline() {
    topPlanningWindow.openMCWindow("Dummy.jsp?Application=" + globalAppName, true, "LoadOutlineTF");
}

function menuAdminLoadOutlineFromFile() {
    topPlanningWindow.setLoadOutlineFlow("1");
    topPlanningWindow.openMCWindow("Dummy.jsp?Application=" + globalAppName, true, "LoadOutlineTF");
}

function menuAdminLoadOutlineDataFromFile() {
    topPlanningWindow.setLoadOutlineFlow("6");
    topPlanningWindow.openMCWindow("Dummy.jsp?Application=" + globalAppName, true, "LoadOutlineTF");
}

function menuAdminLoadOutlineFromDB() {
    topPlanningWindow.setLoadOutlineFlow("2");
    topPlanningWindow.openMCWindow("Dummy.jsp?Application=" + globalAppName, true, "LoadOutlineTF");
}

function menuAdminLoadOutlineToFile() {
    topPlanningWindow.setLoadOutlineFlow("3");
    topPlanningWindow.openMCWindow("Dummy.jsp?Application=" + globalAppName, true, "LoadOutlineTF");
}

function menuAdminLoadOutlineDataToFile() {
    topPlanningWindow.setLoadOutlineFlow("5");
    topPlanningWindow.openMCWindow("Dummy.jsp?Application=" + globalAppName, true, "LoadOutlineTF");
}

function menuAdminLoadOutlineToDB() {
    topPlanningWindow.setLoadOutlineFlow("4");
    topPlanningWindow.openMCWindow("Dummy.jsp?Application=" + globalAppName, true, "LoadOutlineTF");
}



if (isWorkspace) {
    /* this return the help URI for planning and workspace integration */

    /*workspaceWindow.gModuleManager.getModuleById(workspaceWindow.gModuleManager.getStartup()).getHandler().getActiveModule().getHelpUri = function()
    {
        var helpUri = "";
        var adminPrefix = workspaceAdminPrefix;
        try {
            if (topPlanningWindow.LPCentral)
            {


                if ((topPlanningWindow.LPCentral.mainFrame.nWhichPage == isUserPreferences) ||
                    (topPlanningWindow.LPCentral.mainFrame.nWhichPage == isUserManagement) ||
                    (topPlanningWindow.LPCentral.mainFrame.nWhichPage == isDimensions) ||
                    (topPlanningWindow.LPCentral.mainFrame.nWhichPage == isReporting) ||
                    (topPlanningWindow.LPCentral.mainFrame.nWhichPage == isWFFormSelection) ||
                    (topPlanningWindow.LPCentral.mainFrame.nWhichPage == isTaskList) ||
                    (topPlanningWindow.LPCentral.mainFrame.nWhichPage == isEditTask) ||
                    (topPlanningWindow.LPCentral.mainFrame.nWhichPage == isWFLaunchCalc) ||
                    (topPlanningWindow.LPCentral.mainFrame.nWhichPage == isApplicationSettings)

                        ) {
                    helpUri = getStrippedUrl(topPlanningWindow.LPCentral.mainFrame.tabHelpTopic);

                } else if(inDrillThrough) {
                       helpUri = "drill_mlt" + ".html";
                }else if((topPlanningWindow.LPCentral.mainFrame.isCreateSimpleFormsPage)
                ||(topPlanningWindow.LPCentral.mainFrame.isCreatePUHPage)
                ||(topPlanningWindow.LPCentral.mainFrame.isCreateCompositeFormsPage)
                ||(topPlanningWindow.LPCentral.mainFrame.isRAMPage)
                ||(topPlanningWindow.LPCentral.mainFrame.isCreatePropertyFormsPage)
                    ){

                   helpUri = getStrippedUrl(topPlanningWindow.LPCentral.mainFrame.tabHelpTopic);
                }else if (isManageDataPage) {
                    helpUri = adminPrefix + "hbshdat" + ".html";
                } else if (isScheduledIntegrationsPage) {
                    helpUri = adminPrefix + "hbschint" + ".html";
                } else if (isManageModelsPage) {
                    helpUri = adminPrefix + "hbmanmod" + ".html";
                } else if (isManageProjectsPage) {
                    helpUri = adminPrefix + "hbcrprj" + ".html";
                } else if (topPlanningWindow.LPCentral.mainFrame.hy_filemarker) {


                    helpUri = getStrippedUrl(topPlanningWindow.LPCentral.mainFrame.hy_filemarker);

                }
            }
            return (helpUri);
        } catch(ex) {
        }
    }*/

    function registerWSkeyBoardHandlers() {

        if (workspaceWindow.gModuleManager) {
            var moduleManager = workspaceWindow.gModuleManager;
            moduleManager.getModuleById(moduleManager.getStartup()).getHandler().registerKeyboardEventListener(topPlanningWindow.LPCentral);
        }

    }

    function setLoadOutlineFlow(flow) {
        if (flow == 2) {
            topPlanningWindow.frames[0].launchLoadOutlineFlow(2);
        } else if (flow == 3) {
            topPlanningWindow.frames[0].launchLoadOutlineFlow(3);
        } else if (flow == 4) {
            topPlanningWindow.frames[0].launchLoadOutlineFlow(4);
        } else if (flow == 5) {
            topPlanningWindow.frames[0].launchLoadOutlineFlow(5);
        } else if (flow == 6) {
            topPlanningWindow.frames[0].launchLoadOutlineFlow(6);
        } else {
            topPlanningWindow.frames[0].launchLoadOutlineFlow(1);
        }
    }


}
