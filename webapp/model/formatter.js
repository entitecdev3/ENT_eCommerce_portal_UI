sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
  "use strict";

  return {
    /**
     * Rounds the currency value to 2 digits
     *
     * @public
     * @param {string} sValue value to be formatted
     * @returns {string} formatted currency value with 2 digits
     */
    currencyValue: function (sValue) {
      if (!sValue) {
        return 0;
      }

      return parseFloat(sValue).toFixed(2);
    },
    formatVisiblePass:function(value){
      if(value){
        if(value.includes("basic")){
          return true;
        }
        else{
          return false;
        }
      }
      return false;
    },
    formatType: function (value) {
      if (value) {
        var oData = this.getView()
          .getModel("appView")
          .getProperty("/SubprojectTypes");
        for (var index = 0; index < oData.length; index++) {
          var element = oData[index];
          if (element.SubprojectTypeID === value) {
            return element.SubprojectTypeID + " " + element.SubprojectTypeName;
          }
        }
      }
    },
    formatNumberToLocale: function (num) {
      if (num || num === 0) {
        var oCurrencyFormat = NumberFormat.getCurrencyInstance({
          currencyCode: false,
        });
        num = parseFloat(num);
        return Boolean(parseFloat(num.toFixed(2)))
          ? oCurrencyFormat.format(num)
          : 0;
      }
    },
    formatAccountingType: function (value) {
      if (value) {
        var oData = this.getView()
          .getModel("appView")
          .getProperty("/ValidValuesMD");
        for (var index = 0; index < oData.length; index++) {
          var element = oData[index];
          if (element.Value === value) {
            return element.Value + " " + element.Description;
          }
        }
      }
    },
    formatOwner: function (value) {
      if (value) {
        var oData = this.getView()
          .getModel("appView")
          .getProperty("/EmployeesInfo");
        for (var index = 0; index < oData.length; index++) {
          var element = oData[index];
          if (element.EmployeeID === value) {
            return (
              element.EmployeeID +
              " " +
              element.FirstName +
              " " +
              element.LastName
            );
          }
        }
      }
    },
    formatTask: function (value) {
      if (value) {
        var oData = this.getView().getModel("appView").getProperty("/Tasks");
        for (var index = 0; index < oData.length; index++) {
          var element = oData[index];
          if (element.TaskID === value) {
            return element.TaskID + " " + element.TaskName;
          }
        }
      }
    },
    SupplierFormat: function (value) {
      if (value) {
        var oData = this.getView()
          .getModel("appView")
          .getProperty("/Suppliers");
        if (oData) {
          for (var index = 0; index < oData.length; index++) {
            var element = oData[index];
            if (element.CardCode === value) {
              return element.CardCode + " " + element.CardName;
            }
          }
        }
      }
    },
    formatCheckBoxSelect: function (value) {
      if (value) {
        if (value.includes("Y")) {
          return true;
        }
      }
      return false;
    },
    formatStage: function (value) {
      if (value) {
        var oData = this.getView()
          .getModel("appView")
          .getProperty("/StageTypes");
        if (oData) {
          for (let index = 0; index < oData.length; index++) {
            var element = oData[index];
            if (element.StageID === value) {
              return element.StageID + " " + element.StageName;
            }
          }
        }
      }
    },
    documentStatusText: function (statusText) {
      //

      if (!statusText) {
        return "None";
      }
      if (statusText.includes("Open")) {
        return this.getModel("i18n").getProperty("Open");
      } else {
        return this.getModel("i18n").getProperty("Closed");
      }
    },
    documentStatusState: function (statusText) {
      if (!statusText) {
        return "None";
      }
      if (statusText.includes("Open")) {
        return "Success";
      } else {
        return "Error";
      }
    },
    
    conDateFormatter: function (oDate) {
      if (oDate) {
        oDate = new Date(oDate);
        // sap.ui.model.type.Date
        // var dateFormat=new sap.ui.model.type.Date({source: { style: "medium"}}); 
        // 
        // var oFormat = sap.ui.core.format.DateFormat.getInstance({
        //   format: "yMMMd"
        // });
        
      
        var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "dd/MM/yyyy",
        });
        // var dateFormat=sap.ui.core.format.DateFormat()
        // var dateFormatted = dateFormat.format(oDate);
        return   oFormat.format(oDate);;
      }
      return oDate;
    },
    conTimeFormatter: function (oDate) {
      if (oDate) {
        let value=oDate.toString();
        if(value.length===3){
          value='0'+value;
        }
        let fValue=value[0]+value[1]+":"+value[2]+value[3];
        return fValue;
      }
      return oDate;
    },
    actionFormatter:function(oData){
      if(oData){
        switch (oData) {
          case "C":
            return "C-Phone Call"
          case "M":
            return "M-Meeting"
          case "T":
            return "T-Task"
          case "E":
            return "E-Note"
          case "P":
            return "P-Campaign"
          case "N":
            return "N-Other"
        
          default:
            break;
        }
      }
      return oData;
    },
    conHourFormatter: function (data) {
      if (data) {
        data = parseFloat(data);
        var oFormatOptions = {
          minIntegerDigits: 1,
          maxIntegerDigits: 15,
          minFractionDigits: 0,
          maxFractionDigits: 2
        };
        var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions);
        return oFloatFormat.format(data);
      }
      return 0.0
    },
    conHourFormatterPC: function (data) {

      if (data) {

        data = parseFloat(data);

        // data=data.toFixed(2);

        return data.toPrecision(4).replace(/\.?0+$/,"");

      }

      return 0;

    },
    conActiveFormatter: function (data) {
      if (data) {
        data = parseFloat(data);
       if(data>0){
        return true;
       }
       else{
        return false;
       }
        // return oFloatFormat.format(data.toFixed(2));
      }
      return false;
    },
    formatterListPriceLength:function(data){
      if(data){
        if(data.length<100){
          return `(${data.length})`;
        }
        else{
          return `(100+)`;
        }
      }
    },
    conHourFormatterInp: function (data) {
      if (data) {
        data = parseFloat(data);
        return data.toFixed(2);
      }
      return data
    },
    conStatusFormatter: function (oStatus) {
      // 
      if (oStatus) {
        switch (oStatus) {
          case "0":
            return  this.getModel("i18n").getProperty("Draft")
          case "1":
            return this.getModel("i18n").getProperty("Confirmed")
          case "2":
            return  this.getModel("i18n").getProperty("Consolidated")
          case "3":
            return  this.getModel("i18n").getProperty("Accounting")
          case "4":
            return  this.getModel("i18n").getProperty("Billed")
          default:
            break;
        }
      }
    },
    conSentFormatter: function (oStatus) {
      // 
      if (oStatus) {
        switch (oStatus) {
          case "N":
            return this.getModel("i18n").getProperty("No")
          case "S":
            return  this.getModel("i18n").getProperty("Sent")
          case "F":
            return  this.getModel("i18n").getProperty("Failed")
          case "P":
            return  this.getModel("i18n").getProperty("Progress")
          default:
            break;
        }
      }
    },
    conContractFormatter:function(oCont){
      if(oCont){
        if(oCont==="Y"){
          return true;
        }
        return false;
      }
    },
    conInvantoFormatter:function(oCont){
      if(oCont){
        if(oCont==="S"){
          return true;
        }
        return false;
      }
    },
    conUserFormatter:function(oUser){
      if(oUser){
        var oData=this.getModel("consolidation").getProperty("/ConsolidationVH_User");
        if(oData){
          const oUFilter=(elem) => {
            return (
                elem.USERID === oUser
            )
          };
          var oUserData=oData.filter(oUFilter);
          if(oUserData.length>0){
            return oUserData[0].U_NAME;
          }
          else{
            return oUser;
          }
        }
        else{
          return oUser;
        }
      }
    },
    timeSheetProject:function(value){
      if (value) {
        var oData = this.getView().getModel("timesheetData").getProperty("/timesheetDataVH_Project");
        if(oData){
          for (var index = 0; index < oData.length; index++) {
            var element = oData[index];
            if (element.ProjectCode === value) {
              return element.ProjectName;
            }
          }
        }
       
      }
    },
    timeSheetAppntColor:function(oData){
      switch (oData) {
        case "0":
          return  '#b4bbc4'
        case "1":
          return '#8fce00'
        case "2":
          return  '#f1c232'
        default:
          return '#0c343d'
      }
    },
    workedHourFormatter: function (data) {
      if (data) {
          data = parseFloat(data);
        if(data.toString().includes(".")||data.toString().includes(",")){
          var oCurrencyFormat = NumberFormat.getCurrencyInstance({
            currencyCode: false,
            decimals: 1
          });
          
          return oCurrencyFormat.format(data.toFixed(1));
          // return data.toFixed(1);
        }
        
     
        return data;
      }
    },
    formatYN:function(oValue){
      if(oValue){
        if(oValue.includes("Y")){
          return true;
        }
      }
      return false
    },
    formatAddressType:function(value){
      if(value){
        if(value.includes("Bill")){
          return this.getModel("i18n").getProperty("billTo");
        }
        else{
          return this.getModel("i18n").getProperty("shipTo");
        }
      }
    },
  };
});
