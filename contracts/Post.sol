pragma solidity >=0.4.21 <0.7.0;

contract Post {

    struct postS {
        uint owner;
        uint postindex;
        string Title;
        string PostText;
        uint256 Date;
        uint upvotes;
    }

    uint public total_posts;
    mapping(uint=>postS) public postsM;

    // If postid => userids then the user has upvoted this post
    // uint[][] public upvoted;
    mapping(uint=> uint[]) upvoted;


    // Function to create post and return its postindex which is later stored in user post array
    function create_post(uint _owner, string memory _title, string memory _text, uint256 _date) public returns (bool)
    {
        bytes memory title = bytes(_title);
        bytes memory text = bytes(_text);
        require(title.length!=0, "Please enter title of post");
        require(text.length!=0, "Post cannot be empty");
        postsM[total_posts] = postS({owner: _owner, postindex: total_posts, Title:_title, PostText: _text, Date: _date, upvotes:0});
        total_posts++;
        return true;
    }

    function getPostid() public view returns(uint) {
        return total_posts-1;
    }

    function getPostInfo(uint postid) public view returns(string memory, string memory, uint, uint, uint) {
        postS memory p = postsM[postid];
        return (p.Title, p.PostText, p.Date, p.owner, p.upvotes);
    }

    function upvote(uint postid, uint userid) public returns(uint)
    {
        // First check if this user has already upvoted
        // If already upvoted then same upvotes
        postS storage p = postsM[postid];
        if(!checkupvote(postid, userid))
        {
            return p.upvotes;
        }
        // Else add this userid to this posts upvoted array and increase count of upvotes by 1
        else
        {
            upvoted[postid].push(userid);
            p.upvotes++;
            return p.upvotes;
        }
    }

    function checkupvote(uint postid, uint userid) public view returns(bool)
    {
        uint[] memory voters = upvoted[postid];
        for (uint index = 0; index < voters.length; index++) {
            if(voters[index]==userid)
            {
                return false;
            }
        }
        return true;
    }
}