sap.ui.define(
  [
    // UI5 control and model dependencies
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Panel",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/DatePicker",
    "sap/m/Button",
    "sap/m/HBox",
    "sap/m/Toolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Text",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    Controller,
    Dialog,
    Panel,
    VBox,
    Label,
    Input,
    DatePicker,
    Button,
    HBox,
    Toolbar,
    ToolbarSpacer,
    Text,
    JSONModel,
    MessageBox,
    MessageToast,
    ResourceModel,
    Sorter,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.App", {
      // Lifecycle hook: called on controller initialization
      onInit: function () {
        this.aProductData = []; // Holds product data array
        this._oEditDialog = null; // Reference to edit dialog
        this._editingProductId = null; // ID of product being edited

        // Set i18n model for text localization
        var oResourceModel = new ResourceModel({
          bundleName: "main.i18n.i18n",
        });
        this.getView().setModel(oResourceModel, "i18n");

        // Load product data from JSON file
        this._loadProductData();
      },

      // Loads product data from JSON file
      _loadProductData: function () {
        var that = this;
        var oModel = new JSONModel();

        oModel
          .loadData("./data/data.json")
          .then(function () {
            var aJsonData = oModel.getData();

            // Map raw data to formatted structure
            that.aProductData = aJsonData.map(function (item, index) {
              return {
                id: index + 1,
                productname: item["Product Name"],
                productprice: item["Product Price"],
                category: item["Category"],
                stock: item["Available Stock"],
                sold: item["Quantity Sold"],
                mfgdate: item["Mfg Date"],
              };
            });

            that._updateProductModel();
          })
          .catch(function (error) {
            console.error("Error loading data.json:", error);
            that.aProductData = [];
            that._updateProductModel();
          });
      },

      // Updates JSON model with product data
      _updateProductModel: function () {
        var oModel = new JSONModel();
        oModel.setData({ products: this.aProductData });
        this.getView().setModel(oModel, "productsModel");
      },

      // Creates the add/edit product dialog
      _createProductDialog: function (isEdit) {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var prefix = isEdit ? "edit" : "";
        var titleKey = isEdit
          ? "editProductDialogTitle"
          : "addProductDialogTitle";
        var buttonTextKey = isEdit ? "editProduct" : "addProduct";
        var buttonAction = isEdit
          ? this.onSetEdit.bind(this)
          : this.addProductData.bind(this);

        var oDialog = new Dialog({
          title: oBundle.getText(titleKey),
          contentWidth: "30%",
          contentHeight: "70%",
          draggable: true,
          content: [
            new Panel({
              headerToolbar: new Toolbar({
                content: [
                  new ToolbarSpacer(),
                  new Text({ text: oBundle.getText("productDetails") }),
                  new ToolbarSpacer(),
                ],
              }),
              content: [
                new VBox({
                  items: [
                    // All input fields for product details
                    new Label({ text: oBundle.getText("productName") }),
                    new Input({ id: prefix + "productNameInput" }),
                    new Label({ text: oBundle.getText("productPrice") }),
                    new Input({
                      id: prefix + "productPriceInput",
                      type: "Number",
                    }),
                    new Label({ text: oBundle.getText("category") }),
                    new Input({ id: prefix + "categoryInput" }),
                    new Label({ text: oBundle.getText("availableStock") }),
                    new Input({ id: prefix + "stockInput", type: "Number" }),
                    new Label({ text: oBundle.getText("quantitySold") }),
                    new Input({ id: prefix + "soldInput", type: "Number" }),
                    new Label({ text: oBundle.getText("mfgDate") }),
                    new DatePicker({ id: prefix + "mfgDateInput" }),
                    new HBox({
                      justifyContent: "Center",
                      items: [
                        // Submit button (add/edit)
                        new Button({
                          text: oBundle.getText(buttonTextKey),
                          type: "Accept",
                          press: buttonAction,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
          // Close button for dialog
          endButton: new Button({
            text: oBundle.getText("close"),
            press: function () {
              oDialog.close();
            },
          }),
        });

        this.getView().addDependent(oDialog);
        return oDialog;
      },

      // Clears all form input fields
      _clearFormFields: function (prefix) {
        var fields = [
          "productNameInput",
          "productPriceInput",
          "categoryInput",
          "stockInput",
          "soldInput",
          "mfgDateInput",
        ];
        fields.forEach(function (field) {
          sap.ui
            .getCore()
            .byId((prefix || "") + field)
            .setValue("");
        });
      },

      // Gets values from form fields and returns as object
      _getFormValues: function (prefix) {
        return {
          productname: sap.ui
            .getCore()
            .byId((prefix || "") + "productNameInput")
            .getValue(),
          productprice: sap.ui
            .getCore()
            .byId((prefix || "") + "productPriceInput")
            .getValue(),
          category: sap.ui
            .getCore()
            .byId((prefix || "") + "categoryInput")
            .getValue(),
          stock: sap.ui
            .getCore()
            .byId((prefix || "") + "stockInput")
            .getValue(),
          sold: sap.ui
            .getCore()
            .byId((prefix || "") + "soldInput")
            .getValue(),
          mfgdate: sap.ui
            .getCore()
            .byId((prefix || "") + "mfgDateInput")
            .getValue(),
        };
      },

      // Sets values in form fields using given data
      _setFormValues: function (prefix, data) {
        sap.ui
          .getCore()
          .byId((prefix || "") + "productNameInput")
          .setValue(data.productname);
        sap.ui
          .getCore()
          .byId((prefix || "") + "productPriceInput")
          .setValue(data.productprice);
        sap.ui
          .getCore()
          .byId((prefix || "") + "categoryInput")
          .setValue(data.category);
        sap.ui
          .getCore()
          .byId((prefix || "") + "stockInput")
          .setValue(data.stock);
        sap.ui
          .getCore()
          .byId((prefix || "") + "soldInput")
          .setValue(data.sold);
        sap.ui
          .getCore()
          .byId((prefix || "") + "mfgDateInput")
          .setValue(data.mfgdate);
      },

      // Opens the Add Product Dialog
      addProductDialog: function () {
        if (!this.oDraggableDialog) {
          this.oDraggableDialog = this._createProductDialog(false);
        }
        this.oDraggableDialog.open();
        this._clearFormFields();
      },

      // Adds new product to data array and updates model
      addProductData: function () {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var formData = this._getFormValues();

        // Validate if all fields are filled
        if (Object.values(formData).every((val) => val)) {
          formData.id = this.aProductData.length + 1;
          this.aProductData.push(formData);

          this._updateProductModel();
          this._clearFormFields();

          MessageToast.show(oBundle.getText("productAdded"));
          this.oDraggableDialog.close();
        } else {
          MessageToast.show(oBundle.getText("fillAllFields"));
        }
      },

      // Opens the Edit Product Dialog with pre-filled data
      onEdit: function (oEvent) {
        var oContext = oEvent.getSource().getBindingContext("productsModel");
        var oProduct = oContext.getObject();
        this._editingProductId = oProduct.id;

        var editProductData = this.aProductData.find(
          (val) => val.id == oProduct.id
        );

        if (!this._oEditDialog) {
          this._oEditDialog = this._createProductDialog(true);
        }

        this._setFormValues("edit", editProductData);
        this._oEditDialog.open();
      },

      // Updates the product data with new values from form
      onSetEdit: function () {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var formData = this._getFormValues("edit");

        var productToEdit = this.aProductData.find(
          (val) => val.id == this._editingProductId
        );
        Object.assign(productToEdit, formData);

        this._updateProductModel();
        this._clearFormFields("edit");

        MessageToast.show(oBundle.getText("productUpdated"));
        if (this._oEditDialog) {
          this._oEditDialog.close();
        }
      },

      // Deletes product after confirmation
      onDelete: function (oEvent) {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var oContext = oEvent.getSource().getBindingContext("productsModel");
        var id = oContext.getObject().id;

        var index = this.aProductData.findIndex((val) => val.id == id);

        MessageBox.warning(oBundle.getText("deleteConfirm"), {
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.OK,
          onClose: function (sAction) {
            if (sAction == MessageBox.Action.OK && index !== -1) {
              this.aProductData.splice(index, 1);
              this._updateProductModel();
              MessageToast.show(oBundle.getText("productDeleted"));
            }
          }.bind(this),
          dependentOn: this.getView(),
        });
      },

      // Sorts the product list by name ascending/descending
      onSortChange: function (oEvent) {
        var sKey = oEvent.getSource().getSelectedKey();
        var oTable =
          this.byId("productTable") || sap.ui.getCore().byId("productTable");
        var oBinding = oTable.getBinding("items");

        var oSorter;
        if (sKey === "asc") {
          oSorter = new Sorter("productname", false);
        } else if (sKey === "desc") {
          oSorter = new Sorter("productname", true);
        }

        oBinding.sort(oSorter || []);
      },

      // Applies filter or sorting based on selected criteria
      onProductFilterChange: function (oEvent) {
        var sKey = oEvent.getSource().getSelectedKey();
        var oTable = this.byId("productTable");
        var oBinding = oTable.getBinding("items");

        var aFilters = [];
        var oSorter;

        var sortingMap = {
          mostSold: new Sorter("sold", true),
          leastSold: new Sorter("sold", false),
          recentMfg: new Sorter("mfgdate", true),
          highestPrice: new Sorter("productprice", true),
          leastPrice: new Sorter("productprice", false),
        };

        if (sKey === "outOfStock") {
          aFilters.push(new Filter("stock", FilterOperator.EQ, 0));
        } else if (sortingMap[sKey]) {
          oSorter = sortingMap[sKey];
        }

        oBinding.filter(aFilters);
        if (oSorter) {
          oBinding.sort(oSorter);
        } else {
          oBinding.sort();
        }
      },

      // Applies search filter based on product name
      onProductSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        var oTable = this.byId("productTable");
        var oBinding = oTable.getBinding("items");

        var aFilters = [];
        if (sQuery) {
          aFilters.push(
            new Filter("productname", FilterOperator.Contains, sQuery)
          );
        }
        oBinding.filter(aFilters);
      },
    });
  }
);
