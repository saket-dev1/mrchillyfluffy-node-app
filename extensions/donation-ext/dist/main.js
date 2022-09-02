(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // ../../node_modules/@remote-ui/core/build/esm/component.mjs
  function createRemoteComponent(componentType) {
    return componentType;
  }

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/BlockStack/BlockStack.mjs
  var BlockStack = createRemoteComponent("BlockStack");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/Button/Button.mjs
  var Button = createRemoteComponent("Button");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/ButtonGroup/ButtonGroup.mjs
  var ButtonGroup = createRemoteComponent("ButtonGroup");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/CalloutBanner/CalloutBanner.mjs
  var CalloutBanner = createRemoteComponent("CalloutBanner");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/Heading/Heading.mjs
  var Heading = createRemoteComponent("Heading");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/Image/Image.mjs
  var Image = createRemoteComponent("Image");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/Layout/Layout.mjs
  var Layout = createRemoteComponent("Layout");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/Select/Select.mjs
  var Select = createRemoteComponent("Select");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/Text/Text.mjs
  var Text = createRemoteComponent("Text");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/TextBlock/TextBlock.mjs
  var TextBlock = createRemoteComponent("TextBlock");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/TextContainer/TextContainer.mjs
  var TextContainer = createRemoteComponent("TextContainer");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/components/View/View.mjs
  var View = createRemoteComponent("View");

  // ../../node_modules/@shopify/post-purchase-ui-extensions/build/esm/extend.mjs
  var extend = function extend2() {
    var _self$shopify;
    return (_self$shopify = self.shopify).extend.apply(_self$shopify, arguments);
  };

  // src/index.js
  extend("Checkout::PostPurchase::ShouldRender", (_0) => __async(void 0, [_0], function* ({
    inputData: {
      locale,
      extensionPoint,
      initialPurchase: { lineItems, referenceId },
      token,
      shop: { domain: shopDomain },
      version
    },
    storage
  }) {
    console.log(extensionPoint);
    const totalQty = lineItems.reduce((total, item) => total + item.quantity, 0);
    console.log(referenceId);
    console.log(lineItems);
    const shop = yield getShopDetail({
      shopDomain,
      lineItems,
      referenceId,
      token
    });
    const organisations = shop.organisations;
    const organisationsImages = shop.images;
    const organisationDetails = organisations.map((org, key) => {
      org.images = organisationsImages[key];
      return org;
    });
    const data = {
      shop: shop.shop,
      amount: totalQty,
      referenceId,
      organisations: organisationDetails
    };
    console.log(data);
    yield storage.update(data);
    return { render: true };
  }));
  function createUrl(shop, endpoint) {
    const embeddedAppHost = "https://34ce-123-201-19-47.in.ngrok.io";
    if (shop == "") {
      return `${embeddedAppHost}/${endpoint}`;
    } else {
      return `${embeddedAppHost}/${endpoint}?shop=${shop}`;
    }
  }
  function getShopDetail(_0) {
    return __async(this, arguments, function* ({ shopDomain, lineItems, referenceId, token }) {
      const url = createUrl(shopDomain, "api/shop");
      const res = yield fetch(url, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          product_id: lineItems[0].product.id,
          reference_id: referenceId,
          token
        })
      });
      const shop = yield res.json();
      return shop;
    });
  }
  extend("Checkout::PostPurchase::Render", (root, { extensionPoint, storage, done, inputData }) => {
    const initialState = storage.initialData;
    console.log(extensionPoint);
    console.log(inputData);
    console.log(storage);
    const {
      organisations,
      shop,
      referenceId,
      amount
    } = initialState;
    console.log(referenceId);
    const amountFormat = formatCurrency(amount);
    let orderId;
    getOrder(referenceId);
    function getOrder(referenceId2) {
      return __async(this, null, function* () {
        function fetchOrder(referenceId3) {
          const url = createUrl("qe-customization-store.myshopify.com", "api/get-order");
          return fetch(url, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
              referenceId: referenceId3,
              shop: "qe-customization-store.myshopify.com"
            })
          }).then((response) => {
            return response.json();
          });
        }
        const res = yield fetchOrder(referenceId2);
        orderId = res.body.edges[0].node.id;
        orderId = orderId.replace("gid://shopify/Order/", "");
      });
    }
    const orgTitle = root.createText("");
    const orgSumTitle = root.createText("");
    const orgName = root.createComponent(Text, { size: "large" }, orgTitle);
    const organisationList = organisations.map((org) => {
      return {
        value: org.id,
        label: org.name
      };
    });
    let selectedOrganisation = organisationList[0].value;
    let organisationImages = organisations.filter((org) => {
      if (org.id == selectedOrganisation) {
        return org.images;
      }
    });
    let organisationImage = organisationImages[0].images;
    console.log(organisationImage);
    const donateSummary = root.createComponent(TextBlock, { size: "medium" }, `${shop.name} will contribute ${amountFormat} for your purchase to ${organisationList[0].label} through Our Change Foundation. No Cost for you.`);
    const wrapperComponent = root.createComponent(TextContainer, {}, [
      donateSummary
    ]);
    let currentTheme = 0;
    const donationImageComponent = root.createComponent(Image, {
      source: organisationImage[currentTheme].url
    });
    const donationImageContainer = root.createComponent(Button, {
      onPress: () => {
        imageChange();
      },
      disabled: false,
      plain: true
    }, donationImageComponent);
    const sociaBtnImage = [
      "https://shopify-customizer-assets.s3-us-west-1.amazonaws.com/instagram.png",
      "https://shopify-customizer-assets.s3-us-west-1.amazonaws.com/twitter.png",
      "https://shopify-customizer-assets.s3-us-west-1.amazonaws.com/facebook.png",
      "https://shopify-customizer-assets.s3-us-west-1.amazonaws.com/copy_url.png"
    ];
    function generateSocialButton(img) {
      return root.createComponent(Button, {
        onPress: () => {
        },
        disabled: false,
        plain: true
      }, root.createComponent(Image, { source: img, fit: "contain" }));
    }
    const socialShareImages = sociaBtnImage.map((img) => {
      return generateSocialButton(img);
    });
    const socialShareComponent = root.createComponent(TextContainer, {}, [
      root.createComponent(ButtonGroup, {}, socialShareImages)
    ]);
    const acceptButton = root.createComponent(Button, {
      onPress: acceptDonation,
      submit: true,
      disabled: false,
      loading: false
    }, `Redeem ${amountFormat}`);
    const declineButton = root.createComponent(Button, { onPress: declineDonation }, "Decline");
    const buttonsComponent = root.createComponent(ButtonGroup, {}, [
      acceptButton,
      declineButton
    ]);
    function declineDonation() {
      acceptButton.updateProps({ disabled: true });
      declineButton.updateProps({ disabled: true, loading: true });
      done();
    }
    function acceptDonation() {
      return __async(this, null, function* () {
        function doAcceptOrder() {
          console.log(orderId);
          const url = createUrl("", "api/submit-donation");
          return fetch(url, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
              amount,
              externalID: orderId,
              organisationID: selectedOrganisation
            })
          }).then((response) => response.json()).then((response) => {
            return response;
          });
        }
        acceptButton.updateProps({ disabled: true, loading: true });
        declineButton.updateProps({ disabled: true });
        let d = yield doAcceptOrder();
        if (d.id != void 0) {
          done();
        }
      });
    }
    const selectComponent = root.createComponent(Select, {
      label: "Nonprofits",
      value: selectedOrganisation,
      options: organisationList,
      onChange: (value) => {
        selectedOrg = value;
        upateOrganisation(value);
      }
    });
    function imageChange() {
      return __async(this, null, function* () {
        const length = organisationImage.length - 1;
        if (currentTheme == length) {
          currentTheme = 0;
        } else {
          currentTheme = currentTheme + 1;
        }
        const newDonationImageComponent = root.createComponent(Image, {
          source: organisationImage[currentTheme].url,
          loading: "lazy"
        });
        donationImageContainer.removeChild(donationImageComponent);
        donationImageContainer.appendChild(newDonationImageComponent);
      });
    }
    function upateOrganisation(value) {
      return __async(this, null, function* () {
        acceptButton.updateProps({ loading: true });
        console.log(orderId);
        let organisationDetails = organisations.filter((org) => {
          if (org.id == value) {
            return org;
          }
        });
        organisationDetails = organisationDetails[0];
        organisationImage = organisationDetails.images;
        const newDonationImageComponent = root.createComponent(Image, {
          source: organisationImage[currentTheme].url
        });
        donationImageContainer.removeChild(donationImageComponent);
        donationImageContainer.appendChild(newDonationImageComponent);
        console.log(organisationDetails.id);
        updateTitle(organisationDetails.id);
        updateSummary(organisationDetails.id);
      });
    }
    function updateOrganisationImages(org_id) {
      return __async(this, null, function* () {
        return organisations.filter((org) => {
          if (org.id == org_id) {
            return org;
          }
        });
      });
    }
    function updateSummary(org_id) {
      return __async(this, null, function* () {
        const title = organisationList.filter((org) => {
          if (org.value == org_id) {
            return org.label;
          }
        });
        acceptButton.updateProps({ disabled: false, loading: false });
        orgSumTitle.updateText(`${title[0].label}`);
        const newSummary = root.createComponent(TextBlock, { size: "medium" }, `${shop.name} will contribute ${amountFormat} for your purchase to ${title[0].label} through Our Change Foundation. No Cost for you.`);
        wrapperComponent.removeChild(donateSummary);
        wrapperComponent.appendChild(newSummary);
      });
    }
    function updateTitle(org_id) {
      return __async(this, null, function* () {
        const title = organisationList.filter((org) => {
          if (org.value == org_id) {
            return org.label;
          }
        });
        console.log(title);
        acceptButton.updateProps({ disabled: false, loading: false });
        orgTitle.updateText(` Donation to ${title[0].label}`);
      });
    }
    updateTitle(selectedOrganisation);
    root.appendChild(root.createComponent(BlockStack, { spacing: "loose" }, [
      root.createComponent(CalloutBanner, {
        border: "block",
        spacing: "loose",
        title: ``
      }, [
        root.createComponent(Heading, {}, `${shop.name} will donate ${amountFormat} for your purchase!`)
      ]),
      root.createComponent(Layout, {
        maxInlineSize: 0.95,
        media: [
          { viewportSize: "small", sizes: [1, 30, 1] },
          { viewportSize: "medium", sizes: [300, 30, 0.5] },
          { viewportSize: "large", sizes: [300, 30, 0.33] }
        ]
      }, [
        root.createComponent(BlockStack, { spacing: "tight", alignment: "center" }, [
          root.createComponent(Text, { size: "medium" }, `Tap to customize`),
          donationImageContainer,
          root.createComponent(Text, { size: "medium" }, `Share to`),
          socialShareComponent
        ]),
        root.createComponent(View),
        root.createComponent(BlockStack, { spacing: "xloose" }, [
          root.createComponent(TextContainer, {}, [
            root.createComponent(Heading, {}, `${amountFormat} `, orgName),
            wrapperComponent,
            selectComponent,
            buttonsComponent
          ])
        ])
      ])
    ]));
    root.mount();
  });
  function formatCurrency(amount) {
    if (!amount || parseInt(amount, 10) === 0) {
      return "Free";
    }
    return `$${amount.toFixed(2)}`;
  }
})();
