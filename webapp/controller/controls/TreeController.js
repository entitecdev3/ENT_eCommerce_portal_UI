sap.ui.define([
    "sap/ui/model/json/JSONModel"
  ],
    function treeController(JSONModel) {
      const treeDataUrl = '/SearchTreeData';
  
      return {
        init: function(that) {
        //   that.callFunctionServiceLayer("GET", this.getTreeData, treeDataUrl, that, null, null, this.getTreeDataError);
          that.middleWare.callMiddleWare(treeDataUrl, "GET", {})
          .then(function(data){
            this.getTreeData(data,that);
          }.bind(this))
          .catch(function (jqXhr, textStatus, errorMessage) {
            that.middleWare.errorHandler(jqXhr, that);  
        });
        },
        getTreeData: function(treeData, that) {
          const treeDataModel = new JSONModel({ treeData });
          that.getView().setModel(treeDataModel);
        },
        getTreeDataError: function(err, that) {
          console.log({ err });
        },
        onSelectionChange: function(that, evt, inputGroupsController) {
          const selectedNode = evt.getParameters().listItem;
  
          if (selectedNode.isLeaf()) {
            const selectedNodesPaths = evt.getParameters().listItem.oParent._aSelectedPaths;
            this.getSelectedNodesCodes(that, selectedNodesPaths);
            inputGroupsController.init(that);
          } else {
            // always deselct non-leaf clicked item
            const oTree = that.getView().byId("tree");
            const oSelectedItem = oTree.getSelectedItem();
            if (!oSelectedItem.isLeaf()) {
              oTree.setSelectedItem(oSelectedItem, false);
            }
  
            const subTreeId = evt.getParameters().listItem.sId;
            const subTreeCrumbs = subTreeId.split('-');
            const subTreeIndex = parseInt(subTreeCrumbs[subTreeCrumbs.length - 1]);
  
            if (oSelectedItem.getExpanded()) {
              evt.getSource().collapse(subTreeIndex);
            } else {
              evt.getSource().expand(subTreeIndex);
            }
          }
        },
        getSelectedNodesCodes(that, paths) {
          const treeData = that.getView().getModel().getData().treeData;
          const nodesData = {};
          paths.forEach(path => {
            const crumbs = path.split('/');
            const lv1NodeOnPath = treeData[crumbs[2]];
            const lv2NodeOnPath = lv1NodeOnPath.nodes[crumbs[4]];
            const lv3NodeOnPath = lv2NodeOnPath.nodes[crumbs[6]];
  
            nodesData.level1Code = lv1NodeOnPath.code;
            nodesData.level1Text = lv1NodeOnPath.text;
            nodesData.level2Code = lv2NodeOnPath.code;
            nodesData.level2Text = lv2NodeOnPath.text;
            nodesData.level3Code = lv3NodeOnPath.code;
            nodesData.level3Text = lv3NodeOnPath.text;
          });
  
          this.setItemPathData(that, nodesData);
        },
        setItemPathData: function(that, nodesData) {
          const itemPath = `${nodesData.level1Text} / ${nodesData.level2Text} / ${nodesData.level3Text}`;
          const itemLvlCodes = `${nodesData.level1Code} / ${nodesData.level2Code} / ${nodesData.level3Code}`;
          const selectedItemModel = new JSONModel({ selectedTreeItem: itemLvlCodes });
          const selectedItemNamesModel = new JSONModel({ selectedTreeItem: itemPath });
          that.selectedItemPath = itemPath;
          that.selectedItemCodes = itemLvlCodes;
          that.getView().byId('selectedItemPath').setModel(selectedItemModel);
          that.getView().byId('selectedItemPath').updateBindings();
          that.getOwnerComponent().setModel(selectedItemModel, "p1InputData");
          that.getOwnerComponent().setModel(selectedItemNamesModel, "p1InputDataNames");
        }
      }
    }
  );