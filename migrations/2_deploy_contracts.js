// var Election = artifacts.require("./Election.sol");
var User = artifacts.require("./User.sol");
var Post = artifacts.require("./Post.sol");
module.exports = function(deployer) {
  deployer.deploy(User);
  deployer.deploy(Post);
};
