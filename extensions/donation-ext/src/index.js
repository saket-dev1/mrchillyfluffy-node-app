/**
 * Extend Shopify Checkout with a custom Post Purchase user experience This
 * Shopify Checkout template provides two extension points:
 *  1. ShouldRender - Called first, during the checkout process.
 *  2. Render - If requested by `ShouldRender`, will be rendered after checkout
 *     completes
 */

import {
  extend,
  BlockStack,
  Button,
  Heading,
  Text,
  Image,
  Layout,
  TextBlock,
  TextContainer,
  Select,
  ButtonGroup,
  CalloutBanner,
  View,
} from "@shopify/post-purchase-ui-extensions";

/**
 * Entry point for the `ShouldRender` Extension Point.
 *
 * Returns a value indicating whether or not to render a PostPurchase step, and
 * optionally allows data to be stored on the client for use in the `Render`
 * extension point.
 */
 extend("Checkout::PostPurchase::ShouldRender", async ({
   inputData: {
    locale,
    extensionPoint,
    initialPurchase: { lineItems, referenceId },
    token,
    shop: { domain: shopDomain },
    version
  },
  storage,
}) => {
  console.log(extensionPoint);
  /**
   * Here we make a request to the endpoint we created in our main app, where the product details will be fetched by id.
   * The product id can be pulled off of the inputData callback argument: `lineItems[0].product.id`
   * (Note that we only care about prompting a product review for the first product in the checkout, as this is just a sample app)
   *
   * We can not make the product detail request directly in the extension because of CORS. Our main app backend is set up to handle this,
   * and will authenticate and proxy the request to the admin API.
   *
   * In the request body we pass in the productId, as well as the referenceId and token (necessary for authentication).
   * The `shop` param is also required for authentication, but we already have this in the query string (see `createUrl` function).
   */
  
  const totalQty = lineItems.reduce((total, item) => total + item.quantity, 0);
  console.log(referenceId);
  console.log(lineItems);
  const shop = await getShopDetail({
    shopDomain,
    lineItems,
    referenceId,
    token,
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
    referenceId: referenceId,
    organisations: organisationDetails
  }
  
  console.log(data);

  await storage.update(data);

  return { render: true };
});

function createUrl(shop, endpoint) {
  /**
   * NOTE: This should reflect your app's ngrok URL (if running locally)
   * or the url of your production app (if pushing/publishing the extension)
   */

  const embeddedAppHost = "https://34ce-123-201-19-47.in.ngrok.io";
  if(shop == ''){
    return `${embeddedAppHost}/${endpoint}`;
  }else{
    return `${embeddedAppHost}/${endpoint}?shop=${shop}`;
  }
}

async function getShopDetail({ shopDomain, lineItems, referenceId, token }) {
  const url = createUrl(shopDomain, "api/shop");
  const res = await fetch(url, {
    method: "POST",
    mode: 'cors',
    headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin':'*' },
    body: JSON.stringify({
      product_id: lineItems[0].product.id,
      reference_id: referenceId,
      token,
    }),
  });
  
  const shop = await res.json();
  
  return shop;
}

/**
 * Entry point for the `Render` Extension Point
 *
 * Returns markup composed of remote UI components.  The Render extension can
 * optionally make use of data stored during `ShouldRender` extension point to
 * expedite time-to-first-meaningful-paint.
 */
extend(
  "Checkout::PostPurchase::Render",
  (root, { extensionPoint, storage, done, inputData }) => {
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
    //console.log(orderId);
    getOrder(referenceId);
    async function getOrder(referenceId){
      function fetchOrder(referenceId){
        const url = createUrl('qe-customization-store.myshopify.com', "api/get-order");
        return fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin':'*'},
          body: JSON.stringify({
            referenceId: referenceId,
            shop: 'qe-customization-store.myshopify.com'
          }),
        })
        .then((response) => { return response.json() });
      }
      const res = await fetchOrder(referenceId);
      //console.log(res);
      orderId = res.body.edges[0].node.id;
      //console.log(orderId);
      //return res;
      orderId = orderId.replace('gid://shopify/Order/', '');
    }
    
    const orgTitle = root.createText('');
    const orgSumTitle = root.createText('');

    const orgName = root.createComponent(
      Text,
      {size: 'large'},
      orgTitle
    );

    const organisationList = organisations.map(org =>{
      return {
        value:org.id,
        label:org.name
      }
    });

    let selectedOrganisation = organisationList[0].value;
    let organisationImages = organisations.filter(org => {
      if(org.id == selectedOrganisation){
        return org.images;
      }
    });
    let organisationImage = organisationImages[0].images
    console.log(organisationImage);

    /* Summary Details */
    const donateSummary = root.createComponent(
      TextBlock,
      {size: 'medium'},
      `${shop.name} will contribute ${amountFormat} for your purchase to ${organisationList[0].label} through Our Change Foundation. No Cost for you.`
    );

    const wrapperComponent = root.createComponent(TextContainer, {}, [
      donateSummary      
    ]);

    /** Organisation Images */
    let currentTheme = 0;

    const donationImageComponent = root.createComponent(Image, {
      source: organisationImage[currentTheme].url
    });

    const donationImageContainer = root.createComponent(Button, {
        onPress : () => {          
          imageChange()
        },
        disabled: false,
        plain:true
      },
      donationImageComponent      
    );

    /** Social Share Buttons */
    const sociaBtnImage = [
      'https://shopify-customizer-assets.s3-us-west-1.amazonaws.com/instagram.png',
      'https://shopify-customizer-assets.s3-us-west-1.amazonaws.com/twitter.png',
      'https://shopify-customizer-assets.s3-us-west-1.amazonaws.com/facebook.png',
      'https://shopify-customizer-assets.s3-us-west-1.amazonaws.com/copy_url.png'
    ];
    
    function generateSocialButton(img){
      return root.createComponent(Button, {
          onPress : () => {
          },
          disabled: false,
          plain:true
        },
        root.createComponent(
          Image, { source: img, fit:'contain',}),        
      );
    }

    const socialShareImages = sociaBtnImage.map((img) => {
      return generateSocialButton(img);      
    });
    
    const socialShareComponent = root.createComponent(TextContainer, {}, [
      root.createComponent(ButtonGroup, {}, socialShareImages)      
    ]);
    
    /** Accpet Decline Button groups  */
    const acceptButton = root.createComponent(Button, {
        onPress: acceptDonation,
        submit: true,
        disabled: false,
        loading: false,
      }, `Redeem ${amountFormat}`
    );

    const declineButton = root.createComponent(
      Button,
      {onPress: declineDonation},
      'Decline'
    );

    const buttonsComponent = root.createComponent(ButtonGroup, {}, [
      acceptButton,
      declineButton,
    ]);

    function declineDonation() {
      acceptButton.updateProps({disabled: true});
      declineButton.updateProps({disabled: true, loading: true});
      done();
    }

    async function acceptDonation() {
       function doAcceptOrder() {
        console.log(orderId);
        const url = createUrl('', "api/submit-donation");
        return fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin':'*'},
          body: JSON.stringify({
            amount: amount,
            externalID: orderId,
            organisationID: selectedOrganisation
          }),
        })
        .then((response) => response.json())
        .then((response) =>{ return response });
        //console.log(token);
      }
      
      // First update the state of the buttons, then call the async function
      acceptButton.updateProps({disabled: true, loading: true});
      declineButton.updateProps({disabled: true});
      let d = await doAcceptOrder();
      //console.log(d);
      if(d.id != undefined){        
        done();
      }
    }

    /** Organisation list component */
    const selectComponent = root.createComponent(Select, {
      label: 'Nonprofits',
      value: selectedOrganisation,
      options: organisationList,
      onChange: (value) => {
        selectedOrg = value;
        upateOrganisation(value);
      },
    });

    async function imageChange(){
      const length = organisationImage.length - 1;
      if(currentTheme == length){
        currentTheme = 0;
      }else{
        currentTheme = currentTheme+1;        
      }
      
      const newDonationImageComponent = root.createComponent(Image, {          
        source: organisationImage[currentTheme].url,
        loading:'lazy'
      });

      donationImageContainer.removeChild(donationImageComponent);
      donationImageContainer.appendChild(newDonationImageComponent);
    }

    /** Update donation dropdown */
    async function upateOrganisation(value){
      acceptButton.updateProps({loading: true});
      console.log(orderId);
      let organisationDetails = organisations.filter(org =>{
        if(org.id == value){
          return org;
        }
      });
      organisationDetails = organisationDetails[0];
      // console.log(organisationDetails);
      organisationImage = organisationDetails.images;
      // console.log(organisationImage);
      // console.log(organisationImage[currentTheme]);
      // console.log(organisationImage[currentTheme].url);
      const newDonationImageComponent = root.createComponent(Image, {          
        source: organisationImage[currentTheme].url
      });

      donationImageContainer.removeChild(donationImageComponent);
      donationImageContainer.appendChild(newDonationImageComponent);
      
      console.log(organisationDetails.id);
      updateTitle(organisationDetails.id);
      updateSummary(organisationDetails.id);
      // async function getOrgDetails(donation_id){
      //   const url = createUrl('', "api/getOrganisation");
      //   return await fetch(url, {
      //     method: "POST",
      //     mode: 'cors',
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       referenceId: inputData.initialPurchase.referenceId,
      //       token: inputData.token,
      //       organisation_id:donation_id
      //     }),
      //   })
      //   .then((response) => response.json());
      // }

      // //console.log(value);
      // const organisationDetails = await getOrgDetails(value);
      // console.log(organisationDetails);
      // updateTitle(organisationDetails.organisation.id);
      // updateSummary(organisationDetails.organisation.id);

      // organisationImages = organisationDetails.socialImages;
      // const newDonationImage = root.createComponent(Image, {          
      //   source: organisationDetails.socialImages[currentTheme].url,
      //   loading:'lazy'
      // });

      // donationImageContainer.removeChild(donationImage);
      // donationImageContainer.appendChild(newDonationImage);
    }

    async function updateOrganisationImages(org_id){
      return organisations.filter((org) => {
        if(org.id == org_id){          
          return org;
        }
      });
    }

    async function updateSummary(org_id){
      const title = organisationList.filter((org) => {
        if(org.value == org_id){          
          return org.label;
        }
      });

      acceptButton.updateProps({disabled: false, loading: false});

      orgSumTitle.updateText(`${title[0].label}`);
      const newSummary = root.createComponent(
        TextBlock,
        {size: 'medium'},
        `${shop.name} will contribute ${amountFormat} for your purchase to ${title[0].label} through Our Change Foundation. No Cost for you.`
      );

      wrapperComponent.removeChild(donateSummary);
      wrapperComponent.appendChild(newSummary);
    }

    async function updateTitle(org_id) {
      const title = organisationList.filter((org) => {
        if(org.value == org_id){
          return org.label;
        }
      });
      console.log(title);
      acceptButton.updateProps({disabled: false, loading: false});
      orgTitle.updateText(` Donation to ${title[0].label}`);
    }

    updateTitle(selectedOrganisation);
    
    /** Main HTML */
    root.appendChild(
      root.createComponent(BlockStack, { spacing: "loose" }, [
        root.createComponent(
          CalloutBanner,
          {
            border:"block",
            spacing: "loose",
            title: ``,
          },
          [
            root.createComponent(
              Heading,
              {},
              `${shop.name} will donate ${amountFormat} for your purchase!`
            ),
          ],
        ),
        root.createComponent(
          Layout,
          {
            maxInlineSize: 0.95,
            media: [
              { viewportSize: "small", sizes: [1, 30, 1] },
              { viewportSize: "medium", sizes: [300, 30, 0.5] },
              { viewportSize: "large", sizes: [300, 30, 0.33] },
            ],
          },
          [
            root.createComponent(BlockStack, { spacing:"tight", alignment:"center" }, [
              root.createComponent(
                Text,
                {size: 'medium'},
                `Tap to customize`
              ),
              donationImageContainer,
              root.createComponent(
                Text,
                {size: 'medium'},
                `Share to`
              ),
              socialShareComponent
            ]),
            root.createComponent(View),
            root.createComponent(BlockStack, { spacing: "xloose" }, [
              root.createComponent(TextContainer, {}, [
                root.createComponent(Heading, {}, `${amountFormat} `,
                  orgName,
                ),
                wrapperComponent,
                selectComponent,              
                buttonsComponent
              ]),
            ]),
          ]
        ),
      ])
    );

    root.mount();
  }
);

function formatCurrency(amount) {
  if (!amount || parseInt(amount, 10) === 0) {
    return 'Free';
  }
  return `$${amount.toFixed(2)}`;
}