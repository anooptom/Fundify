pragma solidity ^0.4.17;

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string _name, string _symbol, uint256 _initialSupply) public {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0));
        require(balanceOf[msg.sender] >= _value);
        require(balanceOf[_to] + _value >= balanceOf[_to]);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    string public CampaignName;
    string public CampaignDescription;
    string public imageUrl;
    uint public targetToAchieve;
    address[] public contributors;
    mapping(address => bool) public approvers;
    uint public approversCount;
    Token public campaignToken;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    event ContributionReceived(address contributor, uint amount, uint tokensIssued);

    constructor(uint minimum, address creator, string name, string description, string image, uint target, address tokenAddress) public {
        manager = creator;
        minimumContribution = minimum;
        CampaignName = name;
        CampaignDescription = description;
        imageUrl = image;
        targetToAchieve = target;
        campaignToken = Token(tokenAddress);
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution);

        uint tokensIssued = msg.value; // For simplicity, 1 wei = 1 token
        campaignToken.transfer(msg.sender, tokensIssued);
        contributors.push(msg.sender);
        approvers[msg.sender] = true;
        approversCount++;

        emit ContributionReceived(msg.sender, msg.value, tokensIssued);
    }

    function createRequest(string description, uint value, address recipient) public restricted {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index) public {
        require(approvers[msg.sender]);
        require(!requests[index].approvals[msg.sender]);

        requests[index].approvals[msg.sender] = true;
        requests[index].approvalCount++;
    }

    function finalizeRequest(uint index) public restricted {
        require(requests[index].approvalCount > (approversCount / 2));
        require(!requests[index].complete);

        requests[index].recipient.transfer(requests[index].value);
        requests[index].complete = true;
    }

    function getSummary() public view returns (uint, uint, uint, uint, address, string, string, string, uint) {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager,
            CampaignName,
            CampaignDescription,
            imageUrl,
            targetToAchieve
        );
    }

    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum, string name, string description, string image, uint target, string tokenName, string tokenSymbol) public {
        Token newToken = new Token(tokenName, tokenSymbol,1000); // Deploy Token contract
        Campaign newCampaign = new Campaign(minimum, msg.sender, name, description, image, target, address(newToken)); // Deploy Campaign contract with Token address
        deployedCampaigns.push(address(newCampaign));
        newToken.transfer(address(newCampaign), newToken.totalSupply()); // Transfer tokens to the Campaign contract
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}
