pragma solidity >=0.4.21 <0.7.0;


contract User {

    struct userS {
        string Name;
        uint8 Age;
        string Gender;
        address userid;
        bytes32 ProfilePic; // Hash of profilepic
        address[] Posts;
        address[] Followers;    // Users who are following this user
        address[] Following;    // The user is following
        bool Isuser;
    }

    //Mappings are useful for O(1) searching 
    mapping(address => userS) usersM;
    mapping(address => mapping(address => int)) followM; // Check if address1 follows address2

    modifier checkuser(address id) {
        userS memory u = usersM[id];
        require(u.Isuser, "User does not exist!");
        _;
    }

    function getUserInfo() public view checkuser(msg.sender)
    returns (string memory, uint8, string memory, bytes32, address[] memory, address[] memory, address[] memory){
        userS memory u = usersM[msg.sender];
        return (u.Name, u.Age, u.Gender, u.ProfilePic, u.Posts, u.Followers, u.Following);
    }

    







}