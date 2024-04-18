import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0x1669819ec7746943781CAA2E8B92Adc7f1389B99"
);

export default instance;
