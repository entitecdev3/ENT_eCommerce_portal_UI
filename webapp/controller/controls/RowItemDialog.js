sap.ui.define([
    "sap/ui/model/json/JSONModel"
  ],
    function rowItemDialog(JSONModel) {
      const inventoryUrl = 'sapb1://call?cmd=OITM&key=';
      const itemDetailsQuery = '/SearchItemResultsDetailByItemCode?ItemCode=';
  
      return {
        open: function(that, data) {
          if (!that.itemDialog) {
            that.itemDialog = sap.ui.xmlfragment("tableRowItemDialog", "ent.ui.ecommerce.fragments.TableRowItem", that);
            that.getView().addDependent(that.itemDialog)
          }
  
          const { itemId } = data;
          this.itemId = itemId;
          const itemDetailsUrl = `${itemDetailsQuery}${itemId}`;
          that.itemData = that.tableData.filter(item => item.ItemCode === itemId)[0];
        //   that.callFunctionServiceLayer("GET", this.getItemDetails, itemDetailsUrl, that, null, null, this.getItemDetailsError);
          that.middleWare.callMiddleWare(itemDetailsUrl, "GET", {})
          .then(function(data){
            this.getItemDetails(data,that);
          }.bind(this))
          .catch(function (jqXhr, textStatus, errorMessage) {
            that.middleWare.errorHandler(jqXhr, that);  
        });
        },
        getItemDetails: function(data, that) {
          that.itemData.tableData = data;
          let onHandTotal = 0;
          let liberoTotal = 0;
          let onOrderTotal = 0;
          data.forEach(el => {
            onHandTotal  += parseFloat(el.OnHand);
            liberoTotal  += parseFloat(el.Libero);
            onOrderTotal += parseFloat(el.OnOrder);
          })
          const totalRow = {
            CompanyName: 'TOTALE',
            Warehouse: '-',
            OnHand: onHandTotal,
            Libero: liberoTotal,
            OnOrder: onOrderTotal
          };
          that.itemData.tableData.push(totalRow);
  
          const itemModel = new JSONModel({ itemData: that.itemData });
  
          that.itemDialog.setModel(itemModel);
          that.itemDialog.open();
        },
        getItemDetailsError: function(err, that) {
          console.log({ err });
        },
        forward: function() {
          const redirectUrl = `${inventoryUrl}${this.itemId}`;
          window.location = redirectUrl;
        },
        close: function(that) {
          that.itemDialog.close();
          that.itemDialog.destroy();
          that.itemDialog = null;
        }
      };
    }
  );