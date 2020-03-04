pragma solidity >=0.4.21 <0.7.0;

contract Post {

    struct postS {
        address owner;
        address postid;
        string Title;
        bytes32 PostText;
        bytes32 PostPic;
        uint256 Date;
    }

    // mapping(bytes32 => bytes32) texttopic;
    mapping(address => postS) postsM;
    // mapping(address => address) posttouser;

}