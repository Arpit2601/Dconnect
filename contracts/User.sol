pragma solidity >=0.4.21 <0.7.0;
// pragma experimental ABIEncoderV2;

contract User {

    struct userS {
        string Name;
        uint8 Age;
        string Gender;
        address userid;
        uint index;
        // string address_string;
        // bytes32 ProfilePic; // Hash of profilepic
        address[] Posts;
        address[] Followers;    // Users who are following this user
        address[] Following;    // The user is following
        bool Isuser;
    }

    //Mappings are useful for O(1) searching 
    mapping(uint => userS) public usersM;
    mapping(address => mapping(address => int)) public followM; // Check if address1 follows address2

    // array containing addresses of all the users as you cannot iterate over the mapping
    address[] usersA;
    // total_users is the total count of users
    uint public total_users;

    function getusersAAt(uint idx) public returns(address){ 
        return usersA[idx];
    }


    modifier checkuser(uint id) {
        userS memory u = usersM[id];
        require(u.Isuser, "User does not exist!");
        _;
    }


    function getUserInfo(uint idx) public returns (string memory, uint8, string memory, uint, address[] memory, address[] memory, address[] memory){
        // address temp_address = usersA[idx];
        userS memory u = usersM[idx];
        return (u.Name, u.Age, u.Gender,u.index, u.Posts, u.Followers, u.Following);
    }

    //TODO: check if user already exists
    function registerUser(string memory _name, uint8 _age, string memory _gender) public returns (bool){
        
        // userS memory u = usersM[msg.sender];
        bytes memory testname = bytes(_name);
        bytes memory testgender = bytes(_gender);
        require(_age > 0 && _age < 200, "Age not correct");
        require(testname.length != 0, "Please enter name");
        require(testgender.length != 0, "Please enter gender");
        // require(!userpresent(), "User already present");
        // string memory address_string = AddresstoString(msg.sender);
        usersM[total_users] = (userS({Name:_name, Age:_age, Gender:_gender,index:total_users, userid:msg.sender,Posts:new address[](0), Followers:new address[](0), Following:new address[](0), Isuser:true}));
        usersA.push(msg.sender);
        total_users++;
        return true;
    }

    function userpresent(string memory _address) public view returns (bool){
        address add = parseAddr(_address);
        int idx = -1;
        for(uint i = 0;i < total_users;i++)
        {
            if(usersA[i]==add)
            {
                idx = int(i);
                break;
            }
        }
        if (idx==-1) {
            return false;
        } else {
            return true;
        }
    }

    function parseAddr(string memory _a) internal pure returns (address _parsedAddress) {
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint i = 2; i < 2 + 2 * 20; i += 2) {
            iaddr *= 256;
            b1 = uint160(uint8(tmp[i]));
            b2 = uint160(uint8(tmp[i + 1]));
            if ((b1 >= 97) && (b1 <= 102)) {
                b1 -= 87;
            } else if ((b1 >= 65) && (b1 <= 70)) {
                b1 -= 55;
            } else if ((b1 >= 48) && (b1 <= 57)) {
                b1 -= 48;
            }
            if ((b2 >= 97) && (b2 <= 102)) {
                b2 -= 87;
            } else if ((b2 >= 65) && (b2 <= 70)) {
                b2 -= 55;
            } else if ((b2 >= 48) && (b2 <= 57)) {
                b2 -= 48;
            }
            iaddr += (b1 * 16 + b2);
        }
        return address(iaddr);
    }







}