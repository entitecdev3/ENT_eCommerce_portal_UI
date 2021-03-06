var tableDataFormatter = {
    precisionFormatter: function(value) {
      const floatValue = parseFloat(value);
      return parseFloat(floatValue).toFixed(3);
    }
  }
  
  const searchMethods = {
    searchByKeywords: 'keyWords',
    searchByPanelOptions: 'panelSearch'
  };
  
  sap.ui.define(
    [
      "ent/ui/ecommerce/controller/BaseController",
      "sap/ui/model/json/JSONModel",
      "ent/ui/ecommerce/controller/controls/RowItemDialog",
      'sap/ui/core/Fragment',
    ],
    function(BaseController, JSONModel, rowItemDialog,Fragment) {
      "use strict";
  
      const panelRequestQuery = '/SearchItemResults?';
      const keyWordsSearchQuery = '/SearchItemResultsWithKeywords?';
  
      return BaseController.extend("ent.ui.ecommerce.controller.App", {
        onInit: function() {
          const itemChange = this.getRouter().getRoute("Items");
          itemChange.attachPatternMatched(this._onObjectMatched, this);
          // 
        },
        onAfterRendering:function(){
          this.getShopCartData();
 
        },
        getPanelSelectionData: function() {
          const selectedItemModel = this.getOwnerComponent().getModel("p1InputDataNames");
          this.getView().byId('selectedItemHeader').setModel(selectedItemModel);
          this.getView().byId('selectedItemHeader').updateBindings();
  
          this.p1InputData = this.getView().getModel("p1InputData").getData();
          this.p2InputData = this.getView().getModel("p2InputData").getData();
  
          var requestUrl = this.buildPanelRequestUrl();
          var oData=this.getModel("appView").getProperty("/MasterSelectedCustomer/CardCode");
		    	if(oData){
            requestUrl+=`&CardCode=${oData}`;
          }
        //   this.callFunctionServiceLayer("GET", this.getTableData, requestUrl, this, null, null, this.getTableDataError);
        this.middleWare.callMiddleWare(requestUrl, "GET", {})
        .then(function(data){
          this.getTableData(data,this);
        }.bind(this))
        .catch(function (jqXhr, textStatus, errorMessage) {
            this.middleWare.errorHandler(jqXhr, this);  
      }.bind(this));
        },
        buildTableViewTitle: function() {
          if (this.keyWordSearch.length === 1) {
            return this.keyWordSearch[0];
          }
          const { keyWordMethod } = this.getView().getModel('keyWordMethod').getData();
          const keyMethod = keyWordMethod === 'AND' ? 'e' : 'o';
          let title = '';
          this.keyWordSearch.forEach((el, index) => {
            index === this.keyWordSearch.length - 1
              ? title = title.concat(`${el}`)
              : title = title.concat(`${el} ${keyMethod} `);
          });
          return title;
        },
        getKeyWordsData: function() {
          debugger;
          const keyWordSearch = this.getView().getModel("searchKeyWords").getData()
          .splitKeyWords;
          this.keyWordSearch = keyWordSearch;
  
          const selectedItemModel = new JSONModel({ selectedTreeItem: this.buildTableViewTitle() });
          this.getView().byId('selectedItemHeader').setModel(selectedItemModel);
          this.getView().byId('selectedItemHeader').updateBindings();
  
          const requestUrl = this.buildKeyWordRequestUrl();
        //   this.callFunctionServiceLayer("GET", this.getTableData, requestUrl, this, null, null, this.getTableDataError);
        this.middleWare.callMiddleWare(requestUrl, "GET", {})
          .then(function(data){
            this.getTableData(data,this);
          }.bind(this))
          .catch(function (jqXhr, textStatus, errorMessage) {
            this.middleWare.errorHandler(jqXhr, this);  
        }.bind(this));
        },
        getTableDataSource: function() {
          const { searchByKeywords, searchByPanelOptions } = searchMethods;
          const { searchMethod } = this.searchMethodModel.getData();
          switch (searchMethod) {
            case searchByKeywords: {
              this.getKeyWordsData();
              break;
            }
  
            case searchByPanelOptions: {
              this.getPanelSelectionData();
              break;
            }
  
            default:
              break;
          }
        },
        _onObjectMatched: function() {
          this.getView().byId('navBackBtn').setVisible(false);
          this.getView().byId("tableSearchField").setValue(null);
          this.getView().byId('rbg3').setSelectedIndex(0);
          this.searchMethodModel = this.getView().getModel("searchMethod");
          // this.getView().getModel("appView").setProperty("/TotalCartData",'0');
          if (!this.searchMethodModel) {
            this.getRouter().navTo("Apps", {});
            return;
          }
          this.getTableDataSource();
          this.setCustomerButtonData();
        },
        getTableData: function(tableData, that) {
          const thirdPannelView = that.getView().byId('thirdPannelTable');
          that.table = thirdPannelView;
          that.tableData = tableData;
          that.itemDialog = null;
          for (let index = 0; index < that.tableData.length; index++) {
            const element = that.tableData[index];
            element.B_OnHand=element.B_OnHand?parseFloat(element.B_OnHand):element.B_OnHand;
            element.cartQunt=0;
            
          }
          const tableModel = new JSONModel({ tableData });
          thirdPannelView.setModel(tableModel);
  
          const totalItems = `${tableData.length} articoli`;
          const totalItemsModel = new JSONModel({ totalItems });
  
          that.getView().byId('totalItemsHeader').setModel(totalItemsModel);
          that.getView().byId('totalItemsHeader').updateBindings();
  
          document.querySelector('[id*="tableSearchField-F"]')
            .getElementsByTagName('input')[0]
            .readOnly = false;
        },
        getTableDataError: function(err, that) {
          console.log(err);
        },
        formatRowColor:function(oQuant){
          // debugger;
          var oCart=this.getView().getModel("appView").getProperty("/CartData");
          if(oCart && oCart.length>0){
            if(oQuant){
              var arr = oCart.filter(function (item) {
                return item.ItemCode ===oQuant;
            });
              if(arr.length>0){
                return 'C0C0C0';
              }
              else{
                // return '00FF00';
              }
            }
          }
        
        },
        buildKeyWordRequestUrl: function() {
          let fullUrl = `${keyWordsSearchQuery}KeyWords=`;
          const totalKeyWords = this.keyWordSearch.length;
          this.keyWordSearch.forEach((word, index) => {
            index < totalKeyWords - 1
            ? fullUrl = fullUrl.concat(`${word}|`)
            : fullUrl = fullUrl.concat(`${word}`);
          });
          const { keyWordMethod } = this.getView().getModel('keyWordMethod').getData();
          fullUrl = fullUrl.concat(`&KeyWordMethod=${keyWordMethod}`);
          var oData=this.getModel("appView").getProperty("/MasterSelectedCustomer/CardCode");
		    	if(oData){
            fullUrl+=`&CardCode=${oData}`;
          }
          return fullUrl;
        },
        buildPanelRequestUrl: function() {
          let fullUrl = `${panelRequestQuery}`;
  
          const itemLevels = this.p1InputData.selectedTreeItem.split('/');
          fullUrl = fullUrl.concat(`Level1Code=${itemLevels[0]}`);
          fullUrl = fullUrl.concat(`&Level2Code=${itemLevels[1]}`);
          fullUrl = fullUrl.concat(`&Level3Code=${itemLevels[2]}`);
  
          this.p2InputData.forEach(el => {
            fullUrl = fullUrl.concat(`&${el.id}=`);
            if (el.searchFeatures.searchEnabled) {
              el.searchFeatures.searchData.forEach((data, index) => {
                if (index === 0) {
                  fullUrl = fullUrl.concat(`${data.Code}`);
                } else {
                  fullUrl = fullUrl.concat(`|${data.Code}`);
                }
              })
            } else {
              fullUrl = fullUrl.concat(`${el.ui_field_input}`);
            }
          });
          return fullUrl.replace(/\s/g, '');
        },
        rowItemPress: function(evt) {
          const itemId = evt.getSource().mProperties.text;
          rowItemDialog.open(this, { itemId });
        },
        onItemDialogForward: function() {
          rowItemDialog.forward(this);
        },
        onItemDialogClose: function() {
          rowItemDialog.close(this);
        },
        onNavLeft: function() {
          this.getRouter().navTo("ItemCatalogue", {});
        },
        onTableFilterPress: function(evt) {
          const filterValue = evt.getParameters().newValue;
          const newTableData = this.tableData
            .filter(el => el.ItemName.toLowerCase().includes(filterValue.toLowerCase()));
          const tableModel = new JSONModel({ tableData: newTableData });
          this.table.setModel(tableModel);
          this.table.updateBindings();
  
          const totalItems = `${newTableData.length} articoli`;
          const totalItemsModel = new JSONModel({ totalItems });
  
          this.getView().byId('totalItemsHeader').setModel(totalItemsModel);
          this.getView().byId('totalItemsHeader').updateBindings();
        },
        setTableData: function(newData) {
          const tableModel = new JSONModel({ tableData: newData });
          this.table.setModel(tableModel);
          this.table.updateBindings();
  
          const totalItems = `${newData.length} articoli`;
          const totalItemsModel = new JSONModel({ totalItems });
  
          this.getView().byId('totalItemsHeader').setModel(totalItemsModel);
          this.getView().byId('totalItemsHeader').updateBindings();
        },
        onRadioFilterSelect: function(evt) {
          const { selectedIndex } = evt.getParameters();
          switch (selectedIndex) {
            case 0: {
              this.setTableData(this.tableData);
              break;
            }
  
            case 1: {
              const filteredData = this.tableData.filter(el => parseFloat(el.B_Sum) > 0);
              this.setTableData(filteredData);
              break;
            }
  
            case 2: {
              const filteredData = this.tableData.filter(el => parseFloat(el.BX_Sum) > 0);
              this.setTableData(filteredData);
              break;
            }
          }
        },
        // onAddToCart:function(oEvent){
        //   var oSelectedObject=oEvent.getSource().getParent().getParent().getBindingContext().getObject();
        // },
        onAddToCart:function(oEvent){
          debugger;
          var oData=oEvent.getSource().getParent().getParent().getBindingContext().getObject();
          var oCartdata=this.getView().getModel("appView").getProperty("/CartData");
          if(!oCartdata){
            oCartdata=[];
          }
          oCartdata.push(oData);
          this.getView().getModel("appView").setProperty("/CartData",oCartdata);
          this.getView().getModel("appView").setProperty("/TotalCartData",oCartdata.length.toString());
          this.getView().getModel("appView").updateBindings();
          this.updateShopCartData();
        },
        onSpecialDiscountPress:function(oEvent){
          debugger;
          // var oData=oEvent.getSource().getParent().getParent().getBindingContext().getObject();
          var oData=oEvent.getSource().getParent().getParent().getBindingContext().getObject();
          this.getView().getModel("appView").setProperty("/Special_DiscountDetails",oData);
          var oButton = oEvent.getSource(),
            oView = this.getView();
            if (!this.disPopOver) {
              this.disPopOver = Fragment.load({
              name: "ent.ui.ecommerce.fragments.SpecialPricePopupOver",
              controller: this,
              }).then(function (oPopover) {
              oView.addDependent(oPopover);
              return oPopover;
              });
            }
            this.disPopOver.then(function (oPopover) {
              oPopover.openBy(oButton);
            }.bind(this));
        },
        onSpecialPricePopOverCloseButton:function(){
          this.disPopOver.then(function (oPopover) {
            oPopover.close();
          }.bind(this));
        }
      });
    }
  );
  