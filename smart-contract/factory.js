import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0xf7d8117a581a4f1a87E5e9d89b8777d8add6Bb23"
);

export default instance;
