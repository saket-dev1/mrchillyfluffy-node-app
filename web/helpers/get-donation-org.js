//const fetch = require('node-fetch');
import fetch from "node-fetch";

export default async function getDonationOrg(type, id = null, amount = null, externalID = null) {
  const PublicKey = 'pk_live_126da5cbffafbf9f0b388a9a31fd73c247b16a07a495b7758c7bb0df9bcf6262';
  const SecretKey = 'sk_live_58a94dcb09394a050c1b135214df798a73e09e4f7c009a99087a93262a61862b';
  /*const jsonBody = JSON.stringify({
      amount: amountTotal*100,
      nonprofit_id: 'n_YRTJa0HsAVp3qyK7v1sUTlKN',
      funds_collected:false,
      external_id: orderID
  });*/

  // Cancer research institute: n_YRTJa0HsAVp3qyK7v1sUTlKN
  // Elton john aids foundation: n_BwAlQjyRqISFQtifWEDXB2a4
  // Wild Aid: n_AWMBFS0rYvVG1vbO249OQ6bZ
  // Save the Children: n_IcMwcjqOLDMdMYzyIWjztaC8
  // Clean Air Task Force: n_2FvWfScCxgEzOwLaqG7M24Ch
  // One Tree Planted: n_MUjmT5yhdf4smx1ykRwO2ovt
  // United Help Ukraine: n_2Fab0zVGIpnZD7TN20VTNC2d 

  const availables = ['n_BwAlQjyRqISFQtifWEDXB2a4','n_YRTJa0HsAVp3qyK7v1sUTlKN','n_AWMBFS0rYvVG1vbO249OQ6bZ','n_IcMwcjqOLDMdMYzyIWjztaC8','n_2FvWfScCxgEzOwLaqG7M24Ch','n_MUjmT5yhdf4smx1ykRwO2ovt','n_2Fab0zVGIpnZD7TN20VTNC2d'];
  if(type == 'organisation'){    
    //const nonprofitsData = donations.nonprofits;
    //console.log(nonprofitsData);
    
    const nonprofits = Promise.all(availables.map(async (ids) => {
      //console.log(id);
      const org = await request('https://api.getchange.io/api/v1/nonprofits/'+ids);
      console.log(org);
      return org;
    }));
    console.log(nonprofits);
    return nonprofits;      
  }
  
  if(type == 'images' && id != null){
    return await request(`https://api.getchange.io/api/v1/contents/list?nonprofit_ids[]=${id}&public_key=${PublicKey}`);
  }
  
  if(type == 'social' && id != null){
    console.log(id);
    return await request(`https://api.getchange.io/api/v1/nonprofits/${id}/social_media_content?public_key=${PublicKey}`);
  }

  if(type == 'single-organisation' && id != null){
    return await request(`https://api.getchange.io/api/v1/nonprofits/${id}`);
  }

  if(type == 'submit-donation' && id != null){
    return await submitDonation(amount, id, externalID);
  }
}

function submitDonation(amount, id, externalID){
  // const PublicKey = 'pk_live_126da5cbffafbf9f0b388a9a31fd73c247b16a07a495b7758c7bb0df9bcf6262';
  // const SecretKey = 'sk_live_58a94dcb09394a050c1b135214df798a73e09e4f7c009a99087a93262a61862b';
  
  const PublicKey = 'pk_test_08b9a12fe010ebbab12df66b757a13a27e3ec2f70c3e7658e72d634be098226c';
  const SecretKey = 'sk_test_ea28c34997fd0d62e29b3156e42eb97da1da00fae35c83884fbac5e634dbc8f4';
  
  const jsonBody = JSON.stringify({
    amount: amount*100,
    nonprofit_id: id,
    external_id: externalID,
    funds_collected:false
  });

  return fetch('https://api.getchange.io/api/v1/donations', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization' : 'Basic ' + Buffer.from(PublicKey + ':' + SecretKey).toString('base64')},
      body: jsonBody
    }).then((res) =>{ 
      return res.json() 
    })
    .catch((e) => console.log(e));
}

function request(url){
  const PublicKey = 'pk_live_126da5cbffafbf9f0b388a9a31fd73c247b16a07a495b7758c7bb0df9bcf6262';
  const SecretKey = 'sk_live_58a94dcb09394a050c1b135214df798a73e09e4f7c009a99087a93262a61862b';
    
  return fetch(url, {
      method: 'GET',
      headers: {'Content-Type': 'application/json', 'Authorization' : 'Basic ' + Buffer.from(PublicKey + ':' + SecretKey).toString('base64')},
    })
    .then((res) =>{
      return res.json() 
    })
    .catch((e) => console.log(e));
}