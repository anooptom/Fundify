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
        
        address public manager;
        uint public minimumContribution;
        string public CampaignName;
        string public CampaignDescription;
        string public imageUrl;
        uint public targetToAchieve;
        address[] public contributors;
        uint public contributorsCount;
        Token public campaignToken;
        uint public totalBalance;
        uint public tokenPrice;

        modifier restricted() {
            require(msg.sender == manager);
            _;
        }

        event ContributionReceived(address contributor, uint amount, uint tokensIssued);
        event Withdrawal(address recipient, uint amount);

        constructor(uint minimum, address creator, string name, string description, string image, uint target, address tokenAddress, uint contributorSupply) public {
            manager = creator;
            minimumContribution = minimum;
            CampaignName = name;
            CampaignDescription = description;
            imageUrl = image;
            targetToAchieve = target;
            campaignToken = Token(tokenAddress);
            tokenPrice = contributorSupply/target;
        }

        function contribute() public payable {
            require(msg.value >= minimumContribution);

            uint tokensIssued = msg.value*tokenPrice; // For simplicity, 1 wei = 1 token
            campaignToken.transfer(msg.sender, tokensIssued);
            contributors.push(msg.sender);
            contributorsCount++;
            totalBalance = totalBalance + msg.value;

            emit ContributionReceived(msg.sender, msg.value, tokensIssued);
        }

        function withdraw(uint amount) public restricted {
            require(amount <= address(this).balance);

            manager.transfer(amount);
            emit Withdrawal(manager, amount);
        }

        function getSummary() public view returns (uint, uint, uint, uint,uint, address,address, string, string, string, uint) {
            return (
                minimumContribution,
                totalBalance,
                this.balance,
                contributors.length,
                contributorsCount,
                manager,
                address(campaignToken),
                CampaignName,
                CampaignDescription,
                imageUrl,
                targetToAchieve
            );
        }
    }

    contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(
        uint minimum,
        string memory name,
        string memory description,
        string memory image,
        uint target,
        string memory tokenName,
        string memory tokenSymbol,
        uint equity,
        uint totalSupply
    ) public {
        // Deploy Token and Campaign contracts
        Token newToken = new Token(tokenName, tokenSymbol, totalSupply);

        // Calculate token supplies
        uint totalTokenSupply = newToken.totalSupply();
        uint contributorSupply = (totalTokenSupply * equity) / 100;
        uint creatorSupply = totalTokenSupply - contributorSupply;

        Campaign newCampaign = new Campaign(
            minimum,
            msg.sender,
            name,
            description,
            image,
            target,
            address(newToken),
            contributorSupply
        );

        // Push Campaign address to deployedCampaigns array
        deployedCampaigns.push(address(newCampaign));

        // Transfer tokens to Campaign contract and creator
        newToken.transfer(address(newCampaign), contributorSupply);
        newToken.transfer(msg.sender, creatorSupply);
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}