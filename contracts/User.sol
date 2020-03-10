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
        uint[] Posts;
        uint[] Followers;    // Users who are following this user
        uint[] Following;    // This user is following
        bool Isuser;
    }

    //Mappings are useful for O(1) searching 
    mapping(uint => userS) public usersM;
    mapping(uint => mapping(uint => int)) public followM; // Check if address1 follows address2

    // array containing addresses of all the users as you cannot iterate over the mapping
    address[] usersA;
    // total_users is the total count of users
    uint public total_users;

    function getusersAAt(uint idx) public view returns(address){ 
        return usersA[idx];
    }


    modifier checkuser(uint id) {
        userS memory u = usersM[id];
        require(u.Isuser, "User does not exist!");
        _;
    }


    function getUserInfo(uint idx) public view returns (string memory, uint8, string memory, uint, uint[] memory, uint[] memory, uint[] memory){
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
        usersM[total_users] = (userS({Name:_name, Age:_age, Gender:_gender,index:total_users, userid:msg.sender,Posts:new uint[](0), Followers:new uint[](0), Following:new uint[](0), Isuser:true}));
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

    function getidxFromAddress(string memory _address) public view returns (uint)
    {
        address add = parseAddr(_address);
        uint idx = 0;
        for(uint i = 0;i < total_users;i++)
        {
            if(usersA[i]==add)
            {
                idx = i;
                break;
            }
        }
        return idx;
    }

    function Follow(string memory _address, int to_follow) public returns (bool)
    {
        // https://medium.com/coinmonks/what-the-hack-is-memory-and-storage-in-solidity-6b9e62577305
        // If you use memory then you wont see changes so always use storage
        // when updating contract
        // add to_follow to this users' Following array
        uint this_user = getidxFromAddress(_address);
        usersM[this_user].Following.push(uint(to_follow));
        // add this_user to to_follow users Followers array
        usersM[uint(to_follow)].Followers.push(this_user);
        return true;

    }

    // If current user follows the user with index id
    function CheckFollow(string memory _address, uint id) public returns(bool)
    {
        uint userid = getidxFromAddress(_address);
        userS memory u = usersM[userid];

        for(uint i = 0;i < u.Following.length;i++)
        {
            if(id == u.Following[i])
            {
                return true;
            }
        }
        return false;
    }

    // Add _post id to _user
    function addPost(uint _user, uint _post ) public returns(bool)
    {
        usersM[_user].Posts.push(_post);
        return true;
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





    // function append(uint[] storage d, uint x) internal{
    //     d.push(x);
    // }


}