import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0xFfE26C065Bef86aA61b92a1e5d297Cf6d435d4a2"
);

export default instance;
