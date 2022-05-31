sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
  ],
    function treeController(JSONModel, MessageBox) {
      const searchFieldsQuery = '/SearchFieldsData';
  
      return {
        init: function(that) {
          that.pannelContainer = that.getView().byId('groupsLinesContainer');
          const searchFieldsUrl = this.buildSerachFieldUrl(that);
          that.inputGroups=[];
          that.pannelContainer.removeAllItems();
          // that.callFunctionServiceLayer("GET", this.getSearchFields, searchFieldsUrl, that, { other: this }, null, this.getSearchFieldsError);
          that.middleWare.callMiddleWare(searchFieldsUrl, "GET", {})
          .then(function(data){
            var args={ other: this };
            for (let index = 0; index < data.length; index++) {
              const element = data[index];
              if(element.id.includes('unita')||element.id.includes('spessore')){
                  element.HBoxVisible=true;
              }
              else{
                element.HBoxVisible=false;
              }
            }
            this.getSearchFields(data,that,args);
          }.bind(this))
          .catch(function (jqXhr, textStatus, errorMessage) {
            that.middleWare.errorHandler(jqXhr, that);  
        });
        },
        clearInput:function(that){
          // that.inputGroups=null;
        },
        getSearchFields: function(inputGroupsData, that, args) {
          const { other } = args;
          const xmlInputGroupPath = 'ent.ui.ecommerce/fragments/InputGroup';
          that.inputGroups = [];
  
          const orderedInputGroupsData = inputGroupsData.sort((el1, el2) => {
            if (el1.Ordinamento < el2.Ordinamento) return -1;
            if (el1.Ordinamento > el2.Ordinamento) return 1;
            return 0;
          });
          that.completableInputs = orderedInputGroupsData;
  
          orderedInputGroupsData.forEach(field => {
            const inputGroupFragment = new sap.ui.xmlfragment(xmlInputGroupPath, that);
            const inputGroupModel = new sap.ui.model.json.JSONModel(field);
            inputGroupFragment.setModel(inputGroupModel, "data");
  
            that.inputGroups.push({ [field.id]: inputGroupFragment});
            that.pannelContainer.addItem(inputGroupFragment);
          });
          that.pannelContainer.onAfterRendering = () => other.makeFieldsVisible(that);
        },
        makeFieldsVisible: function(that) {
          that.currentGroupContainer.style.visibility = "visible";
          const inputFields = Array.from(document.getElementsByTagName('input'));
          // inputFields.pop();
          inputFields.splice(inputFields.findIndex(x => x.id.includes("keyWordSearchField")),1)
        
          inputFields.forEach(input => {
            if (input.type === 'search') input.readOnly = true;
          });
        },
        getSearchFieldsError: function(err, that) {
          console.log({ err });
        },
        buildSerachFieldUrl: function(that) {
          let fullUrl = `${searchFieldsQuery}?`;
          const levelCodesCrumbs = that.selectedItemCodes.split('/');
          const level1Code = levelCodesCrumbs[0];
          const level2Code = levelCodesCrumbs[1];
          const level3Code = levelCodesCrumbs[2];
  
          fullUrl = fullUrl.concat(`Level1Code=${level1Code}`);
          fullUrl = fullUrl.concat(`&Level2Code=${level2Code}`);
          fullUrl = fullUrl.concat(`&Level3Code=${level3Code}`);
          return fullUrl.replace(/\s/g, '');
        },
        getCompletedInputs: function(that) {
          return that.completableInputs.filter(el => el.ui_field_input ? true : false);
        },
        onInputGroupsSearch: function(that) {
          if (!that.inputGroups) {
            MessageBox.warning(`Prima selezionare un livello nell'albero`);
            return;
          }
  
          this.bindUIToModel(that);
          const completedInputs = this.getCompletedInputs(that);
          const searchMethod = "panelSearch";
          const completedInputsModel = new JSONModel(completedInputs);
          const searchMethodModel = new JSONModel({ searchMethod });
          that.getOwnerComponent().setModel(searchMethodModel, "searchMethod");
          that.getOwnerComponent().setModel(completedInputsModel, "p2InputData");
          that.getRouter().navTo("Items", {});
        },
        onInputsReset: function(that) {
          const inputs = Array.from(document.getElementsByTagName('input'));
          const activeResetInputs = Array.from(document.querySelectorAll('*[id^="__field"]'));
          inputs.forEach(input => input.value = '');
          that.completableInputs.forEach(el => {
            let { searchFeatures, ui_field_input } = el;
            if (searchFeatures.searchData)
              searchFeatures.searchData = [];
            if (ui_field_input)
              ui_field_input = null;
          });
          activeResetInputs.forEach(input => input.classList.remove('sapMSFVal'));
        },
        bindUIToModel: function(that) {
          const inputs = {};
  
          that.inputGroups.forEach(group => {
            const keyId = Object.keys(group)[0];
            const inputContainerId = group[keyId].sId;
            const inputContainer = document.getElementById(inputContainerId);
            const inputValue = inputContainer.getElementsByTagName("input")[0].value;
  
            inputs[keyId] = inputValue;
          });
  
          this.storeUserInput(that, inputs);
        },
        storeUserInput: function(that, inputs) {
          that.completableInputs.forEach(group => {
            group.ui_field_input = inputs[group.id];
          });
        }
      }
    }
  );