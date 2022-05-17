sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
  ],
    function formSearchDialog(JSONModel, MessageBox) {
      const searchValuesQuery = '/SearchFieldsData/GetPossibleValues?Field=';
  
      return {
        initActiveData: function(that, evt) {
          const inputId = evt.getSource().sId;
          const dId=evt.getSource().getParent().getParent().getContent()[0].getText();//added by sakshi
          const inputGroupId = inputId.split('field')[1];
          const inputLabel = document
            .querySelector(`[id*="label${inputGroupId}"]`)
            .getElementsByTagName('bdi')[0]
            .innerHTML;
          const inputField = document
            .querySelector(`[id*="${inputId}"]`)
            .getElementsByTagName('input')[0];
          that.inputId = inputId;
          that.inputLabel = inputLabel;
          //added by sakshi
          // that.inputLabelId = that.completableInputs
            // .filter(el => el.label === inputLabel)[0]
            // .id;
          that.inputLabelId = dId;
            //sakshi ended
          that.inputField = inputField;
          if (evt.getParameters().clearButtonPressed) {
            evt.preventDefault();
            inputField.value = null;
            return;
          }
        },
        getActiveData: function(that) {
          
          const activeLabelIndex = that.completableInputs.findIndex(el => el.id === that.inputLabelId);
          const { searchFeatures: { searchData } } = that.completableInputs[activeLabelIndex];
          return searchData;
        },
        setSelectedItems: function(that, activeData) {
          const tableItems = sap.ui.core.Fragment.byId("formSearchDialog", "formSearchTableContent").getItems();
          const activeDataCodes = activeData.map(el => el.Code);
          tableItems.forEach(item => {
            if (activeDataCodes.includes(item.mAggregations.cells[0].mProperties.text)) {
              item.setSelected(true);
            }
          });
        },
        checkIfHasParentField: function(that) {
          const activeElement = that.completableInputs.filter(el => el.id === that.inputLabelId)[0];
          return activeElement.CampoPadre;
        },
        checkIfParentHasValues: function(that, parentFieldId) {
          
          const parentElement = that.completableInputs.filter(el => el.id === parentFieldId)[0];
          const { searchData } = parentElement.searchFeatures;
          const parentValues = searchData ? searchData.length : false;
          return parentValues;
        },
        getParentFieldLabel: function(that, id) {
          return that.completableInputs.filter(el => el.id === id)[0].label;
        },
        open: function(that) {
          const parentFieldId = this.checkIfHasParentField(that);
          let searchValuesUrl = '';
          if (parentFieldId) {
            const parentHasValues = this.checkIfParentHasValues(that, parentFieldId);
            const parentFieldLabel = this.getParentFieldLabel(that, parentFieldId);
            if (!parentHasValues) {
              MessageBox.warning(`Prima selezionare un valore nel campo ${parentFieldLabel}`);
              return;
            }
            if (parentHasValues > 1) {
              MessageBox.warning(`Occorre selezionare UN SOLO VALORE nel campo ${parentFieldLabel}`);
              return;
            }
            
            const parentSearchValueCode = that.completableInputs
              .filter(el => el.id === parentFieldId)[0]
              .searchFeatures
              .searchData[0]
              .Code;
            searchValuesUrl = `${searchValuesQuery}${that.inputLabelId}&ValoreCampoPadre=${parentSearchValueCode}`;
          }
          if (!that.formDialog) {
            that.formDialog = sap.ui.xmlfragment("formSearchDialog", "ent.ui.ecommerce.fragments.FormSearch", that);
          }
          const formTable = sap.ui.core.Fragment.byId("formSearchDialog", "formSearchTableContent");
          that.formTable = formTable;
  
          const formDialogTitle = that.inputLabel;
          const formTitleModel = new sap.ui.model.json.JSONModel({ formDialogTitle });
          that.formDialog.setModel(formTitleModel);
  
          searchValuesUrl = parentFieldId ? searchValuesUrl : `${searchValuesQuery}${that.inputLabelId}`;
          
          // that.callFunctionServiceLayer("GET", this.getSearchFieldValues, searchValuesUrl, that, { other: this }, null, this.getSearchFieldValuesError);
          that.middleWare.callMiddleWare(searchValuesUrl, "GET", {})
          .then(function(data){
            var args={ other: this };
            this.getSearchFieldValues(data,that,args);
          }.bind(this))
          .catch(function (jqXhr, textStatus, errorMessage) {
            that.middleWare.errorHandler(jqXhr, that);  
        });
          that.formDialog.open();
        },
        getSearchFieldValues: function(values, that, { other }) {
          const activeData = other.getActiveData(that);
          
          const searchValues = values[that.inputLabelId];
          other.formDialogTableData = searchValues;
  
          const formTableModel = new sap.ui.model.json.JSONModel({ formDialogTableData: searchValues });
          that.formTable.setModel(formTableModel);
  
          if (activeData) {
            other.setSelectedItems(that, activeData)
          }
        },
        getSearchFieldValuesError: function(err, that) {
          console.log({ err });
        },
        getSelectedElements() {
          const selectedSapPaths = sap.ui.core.Fragment.byId("formSearchDialog", "formSearchTableContent").getSelectedContextPaths();
          const selectedPaths = selectedSapPaths.map(path => {
            const pathCrumbs = path.split('/');
            return pathCrumbs[pathCrumbs.length - 1];
          });
  
          const formDialogCurrentData = sap.ui.core.Fragment
            .byId('formSearchDialog', 'formSearchTableContent')
            .getModel()
            .getData()
            .formDialogTableData;
          const selectedElements = selectedPaths.map(path => formDialogCurrentData[path]);
          return selectedElements;
        },
        populateInputField: function(that, selectedElements) {
          let inputFieldValue = '';
  
          if (selectedElements.length === 1) {
            inputFieldValue = selectedElements[0].Name;
          } else {
            selectedElements.forEach((elem, index) =>
              index === selectedElements.length - 1
              ? inputFieldValue = inputFieldValue.concat(`${elem.Name}`)
              : inputFieldValue = inputFieldValue.concat(`${elem.Name}, `)
            );
          }
  
          that.inputField.value = inputFieldValue;
        },
        bindSelectedElements: function(that, selectedElements) {
          const activeLabelIndex = that.completableInputs.findIndex(el => el.id === that.inputLabelId);//sakshi
          
          that.completableInputs[activeLabelIndex].searchFeatures.searchData = selectedElements;
        },
        confirm: function(that) {
          
          const selectedElements = this.getSelectedElements();
          this.populateInputField(that, selectedElements);
          this.bindSelectedElements(that, selectedElements);
  
          that.formDialog.close();
          that.formDialog.destroy();
          that.formDialog = null;
        },
        close: function(that) {
          that.formDialog.close();
          that.formDialog.destroy();
          that.formDialog = null;
        },
        filter: function(that, evt) {
          const filterValue = evt.getParameters().newValue;
          const newformDialogTableData = this.formDialogTableData
            .filter(el => el.Name.toLowerCase().includes(filterValue.toLowerCase()));
          const formTableModel = new sap.ui.model.json.JSONModel({ formDialogTableData: newformDialogTableData });
          that.formTable.setModel(formTableModel);
          that.formTable.updateBindings();
        }
      };
    }
  );