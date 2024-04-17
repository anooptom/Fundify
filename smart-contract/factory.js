import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0x4eC227c010f3e6F2cEd27C9544619169d161CA6c"
);

export default instance;
