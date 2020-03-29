# Dconnect

TODO:
1) Take screenshots and add them to the repo.

Future Scope:
1) Unfollow function (you will have to shift the whole array so too much cost with the current implementation) similarly removing upvote, bookmark or post cannot be done.

2) Does the person who deployed the contracts own all the information in
the contract
    Ans: Everything that happens inside the blockchain is public information. So all the data you have is readable for anyone who knows how to access it.

3) Try to reduce the number of transactions when posting something from 2 to 1
    Ans: Not possible unless two merge the two contracts or call one contract from another


Documentation:
Suppose you are Account40 and are on page of Account41 then
    Posts tab will show you all the posts this user has ever posted, Bookmarks will be shown on posts that you (Account40) have bookmarked.
    Bookmarked tab will show all the posts Account41 user has bookmarked.
    Upvoted tab will show all the posts Account41 has upvoted.
    Followers will show Account41's followers.
    Following will show Account41's following.

Suppose you are Account40 and you are on page of Account40 then
    Posts will show all of yours posts, Bookmarks on the posts you have bookmarked on yourselves posts.
    Bookmarked tab will show all the posts you have bookmarked.
    Upvoted tab will show all the posts you has upvoted.
    Followers will show you followers.
    Following will show you following.

Upvotes on all the posts are synchronous wherever the post is shown.