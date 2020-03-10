pragma solidity >=0.4.21 <0.7.0;

contract Post {

    struct postS {
        uint owner;
        uint postindex;
        // Why will the post have address 
        // Address is of the user
        // address postid;
        string Title;
        string PostText;
        // bytes32 PostPic;
        uint256 Date;
    }

    uint public total_posts;
    mapping(uint=>postS) postsM;


    // Function to create post and return its postindex which is later stored in user post array
    function create_post(uint _owner, string memory _title, string memory _text, uint256 _date) public returns (bool)
    {
        bytes memory title = bytes(_title);
        bytes memory text = bytes(_text);
        require(title.length!=0, "Please enter title of post");
        require(text.length!=0, "Post cannot be empty");

        postsM[total_posts] = postS({owner: _owner, postindex: total_posts, Title:_title, PostText: _text, Date: _date});
        total_posts++;
        return true;
    }

    function getPostid() public view returns(uint) {
        return total_posts-1;
    }

    
}