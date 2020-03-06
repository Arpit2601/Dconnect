pragma solidity >=0.4.21 <0.7.0;


contract User {

    struct userS {
        string Name;
        uint8 Age;
        string Gender;
        address userid;
        // bytes32 ProfilePic; // Hash of profilepic
        address[] Posts;
        address[] Followers;    // Users who are following this user
        address[] Following;    // The user is following
        bool Isuser;
    }

    //Mappings are useful for O(1) searching 
    mapping(address => userS) public usersM;
    mapping(address => mapping(address => int)) public followM; // Check if address1 follows address2

    modifier checkuser(address id) {
        userS memory u = usersM[id];
        require(u.Isuser, "User does not exist!");
        _;
    }



    function getUserInfo() public view checkuser(msg.sender)
    returns (string memory, uint8, string memory, address[] memory, address[] memory, address[] memory){
        userS memory u = usersM[msg.sender];
        return (u.Name, u.Age, u.Gender, u.Posts, u.Followers, u.Following);
    }

    function registerUser(string memory _name, uint8 _age, string memory _gender) public returns (bool){
        userS memory u = usersM[msg.sender];
        bytes memory testname = bytes(_name);
        bytes memory testgender = bytes(_gender);
        require(_age > 0 && _age < 200, "Age not correct");
        require(testname.length != 0, "Please enter name");
        require(testgender.length != 0, "Please enter gender");
        require(!(u.userid>address(0x0)), "User already present");
        usersM[msg.sender] = userS({Name:_name, Age:_age, Gender:_gender, userid:msg.sender,Posts:new address[](0), Followers:new address[](0), Following:new address[](0), Isuser:true});
        return true;
    }

    function userpresent(string memory _address) public view returns (bool){
        address add = parseAddr(_address);
        if (usersM[add].userid>address(0x0)) {
            return true;
        } else {
            return false;
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