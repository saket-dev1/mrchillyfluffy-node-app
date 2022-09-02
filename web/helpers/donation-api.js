//const fetch = require('node-fetch');
import fetch from "node-fetch";

export default async function donationApi(type, id = null, amount = null) {
  const PublicKey = 'pk_live_126da5cbffafbf9f0b388a9a31fd73c247b16a07a495b7758c7bb0df9bcf6262';
  const SecretKey = 'sk_live_58a94dcb09394a050c1b135214df798a73e09e4f7c009a99087a93262a61862b';

  // Cancer research institute: n_YRTJa0HsAVp3qyK7v1sUTlKN
  // Elton john aids foundation: n_BwAlQjyRqISFQtifWEDXB2a4
  // Wild Aid: n_AWMBFS0rYvVG1vbO249OQ6bZ
  // Save the Children: n_IcMwcjqOLDMdMYzyIWjztaC8
  // Clean Air Task Force: n_2FvWfScCxgEzOwLaqG7M24Ch
  // One Tree Planted: n_MUjmT5yhdf4smx1ykRwO2ovt
  // United Help Ukraine: n_2Fab0zVGIpnZD7TN20VTNC2d 

  const availables = ['n_BwAlQjyRqISFQtifWEDXB2a4','n_YRTJa0HsAVp3qyK7v1sUTlKN','n_AWMBFS0rYvVG1vbO249OQ6bZ','n_IcMwcjqOLDMdMYzyIWjztaC8','n_2FvWfScCxgEzOwLaqG7M24Ch','n_MUjmT5yhdf4smx1ykRwO2ovt','n_2Fab0zVGIpnZD7TN20VTNC2d'];

  if(type == 'organisationDetails'){
    return Promise.all(availables.map(async (ids, key) => {
        return await request('https://api.getchange.io/api/v1/nonprofits/'+ids, 'GET');        
    }));
  }

  if(type == 'organisationImages'){
    return Promise.all(availables.map(async (ids) => {
        return await request(`https://api.getchange.io/api/v1/nonprofits/${ids}/social_media_content?public_key=${PublicKey}`, 'GET');        
    }));
  }

  if(type == 'submit-donation' && id != null){    
    const data = {
        amount: amount*100,
        nonprofit_id: id,
        funds_collected:false
    };
    return await request('https://api.getchange.io/api/v1/donations', 'POST', data);
  }
}

function request(url, method, data = null){
    const PublicKey = 'pk_live_126da5cbffafbf9f0b388a9a31fd73c247b16a07a495b7758c7bb0df9bcf6262';
    const SecretKey = 'sk_live_58a94dcb09394a050c1b135214df798a73e09e4f7c009a99087a93262a61862b';
    // const TestPublicKey = 'pk_test_08b9a12fe010ebbab12df66b757a13a27e3ec2f70c3e7658e72d634be098226c';
    // const TestSecretKey = 'sk_test_ea28c34997fd0d62e29b3156e42eb97da1da00fae35c83884fbac5e634dbc8f4';
    
    const jsonBody = JSON.stringify(data);

    if(method == 'POST'){
        return fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization' : 'Basic ' + Buffer.from(PublicKey + ':' + SecretKey).toString('base64')},
            body: jsonBody
            }).then((res) =>{ 
            return res.json() 
            })
            .catch((e) => console.log(e));
    }
    if(method == 'GET'){
        return fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'Authorization' : 'Basic ' + Buffer.from(PublicKey + ':' + SecretKey).toString('base64')},
          })
          .then((res) =>{
            return res.json() 
          })
          .catch((e) => console.log(e));
    }
}