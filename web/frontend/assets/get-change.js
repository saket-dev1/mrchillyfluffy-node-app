(async () => {
    if (Shopify.checkout === undefined) {
      return;
    }
  
    // Inject script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@getchange/change-social-content@0.4.0/change-social-content.min.js';
    script.type = 'module'
    document.body.appendChild(script);
    const publicKey = 'pk_live_126da5cbffafbf9f0b388a9a31fd73c247b16a07a495b7758c7bb0df9bcf6262';
    const hasActiveCarbonCampaign = false;
    let orderId = Shopify.checkout.order_id;
  
    async function hasDonation(externalId) {
      const params = new URLSearchParams();
      params.set('public_key', publicKey);
      params.set('external_id', externalId);
      const response = await fetch(`https://api.getchange.io/api/v1/contents/list?${params.toString()}`);
      return response.ok;
    }
    // Check if we have a donation on file for this order
    let externalId = undefined;
    if (await hasDonation(orderId)) {
      externalId = orderId;
    } else {
      if (!hasActiveCarbonCampaign) {
        // No carbon campaign, so there is definitely no donation. Stop now.
        return;
      }
      // Poll for a carbon offset donation. Try 4 times, waiting 1 second between each try.
      const carbonExternalId = `carbon_${orderId}`;
      let tries = 0;
      while (true) {
        if (await hasDonation(carbonExternalId)) {
          // Found a donation. Stop polling.
          externalId = carbonExternalId;
          break;
        }
        // Wait 1 second.
        await new Promise(resolve => setTimeout(resolve, 1000));
        tries += 1;
        if (tries > 3) {
          // Stop trying, probably no donations for this order.
          return;
        }
      }
    }
  
  
    function createChangeSection() {
      const element = document.createElement('change-social-content');
      element.publicKey = publicKey;
      element.externalId = externalId;
      element.style = 'max-width: 277px; margin: 0 auto; margin-top: 3em;';
  
      const newSection = document.createElement('div');
      newSection.style = 'position: relative;';
      newSection.appendChild(element);
      return newSection;
    }
  
    // Add social media content elements
    const orderDetailsSection = document.querySelector('.order-summary__sections');
    const thankYouSection = document.querySelector('.step__sections > .section');
  
    const orderDetailsElement = createChangeSection();
    const thankYouElement = createChangeSection();
  
    // Show certain element depending on window size.
    function displayElements() {
      if (window.innerWidth < 1000) {
        orderDetailsElement.style.display = 'none';
        thankYouElement.style.display = 'block';
      } else {
        orderDetailsElement.style.display = 'block';
        thankYouElement.style.display = 'none';
      }
    };
    window.addEventListener('resize', displayElements);
    displayElements();
  
    orderDetailsSection.appendChild(orderDetailsElement);
    thankYouSection.parentElement.insertBefore(thankYouElement, thankYouSection.nextSibling);
  })();