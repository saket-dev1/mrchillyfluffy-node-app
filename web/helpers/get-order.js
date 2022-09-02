import { Shopify } from "@shopify/shopify-api";

export default async function getOrder(session, reference_id) {

    console.log(reference_id);
    const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

    try {        
        return await client.query({        
        data: `{
            orders(first:1, query:"checkout_token:${reference_id}") {
                edges {
                    node {  
                        id,
                        name
                    }
                }
            }
        }`,
    });
    } catch (error) {
        if (error instanceof ShopifyErrors.GraphqlQueryError) {
            throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
        } else {
            throw error;
        }
    }
}