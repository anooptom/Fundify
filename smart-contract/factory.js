import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0xe6C748C36130E4CC15b13bc3c47B9D20382D5896"
);

export default instance;
