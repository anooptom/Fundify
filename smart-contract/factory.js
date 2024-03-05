import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0x4B0Dd1A0dba09dfFE121dfdef95bc9a6B06b61db"
);

export default instance;
