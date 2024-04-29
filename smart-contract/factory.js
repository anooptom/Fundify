import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0x421b297b5F054951AF2779EA96fCD11c9EBcc7eB"
);

export default instance;
