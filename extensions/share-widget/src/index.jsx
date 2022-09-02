import React from 'react';
import {
  useExtensionApi,
  render,
  Banner,
  useTranslate,
} from '@shopify/checkout-ui-extensions-react';

render('Checkout::DeliveryAddress::RenderBefore', ({
  lines
}) => <Appnew />);
function Appnew() {
  console.log(lines);
  // Access and subscribe to the shipping address
  // Your <App /> will automatically re-render when the address has changed
  // const address = useShippingAddress();
  // console.log(address);
  // const firstName = address?.firstName   ?? 'guest';

  // // Render UI
  return <Text>Hi there!</Text>;
}