// App = {
//     web3Provider: null,
//     contracts: {},
//     account: '0x0',
    
  
//     init: function() {
//       return App.initWeb3();
//     },
  
//     initWeb3: function() {
//       // TODO: refactor conditional
//       if (typeof web3 !== 'undefined') {
//         // If a web3 instance is already provided by Meta Mask.
//         App.web3Provider = web3.currentProvider;
//         web3 = new Web3(web3.currentProvider);
//       } else {
//         // Specify default instance if no web3 instance provided
//         App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
//         web3 = new Web3(App.web3Provider);
//       }
//       return App.initContract();
//     },
  
//     initContract: function() {
//       $.getJSON("../User.json", function(user) {
//         App.contracts.User = TruffleContract(user);
//         App.contracts.User.setProvider(App.web3Provider);
//         // console.log("abcd");
//       });
//       $.getJSON("../Post.json", function(post) {
//         App.contracts.Post = TruffleContract(post);
//         App.contracts.Post.setProvider(App.web3Provider);
//         return App.render();
//       });
//     },

//     render: function() {
//         // var content = $("#content");
//         // content.show();
//         // Load account data
//         web3.eth.getCoinbase(function(err, account) {
//           if (err === null) {
//             App.account = account;
//             console.log(account);
//             // $("#accountAddress").html("Your Account: " + account);
//           }
//         });
    
//       },
  
//     Register: function () {
//         App.contracts.User.deployed().then(function(instance) {
//         console.log("abcd");
//         var name = document.getElementById("name").value;
//         var age = document.getElementById("age").value;
//         var gender1 = document.getElementById("Male").checked;
//         var gender2 = document.getElementById("Female").checked;
//         var gender3 = document.getElementById("Transgender").checked;
//         var gender;
//         if(gender1==true) {gender="Male";}
//         else if(gender2==true){gender="Female";}
//         else if(gender3==true){gender="Transgender";}
//         else gender="";
//         return instance.registerUser(name, age, gender);
//         }).then(function(x) {
//         if(x==true) {
//             console.log("abcd");
//             window.location('../index.html');
//         }
        
//         });
//     }
  
//   };
  
//   $(function() {
//     $(window).load(function() {
//       App.init();
//     });
//   });

// var user = artifacts.require("./User.sol");

// contract('User', function(accounts) {

//   it("...should store the value 89.", function() {
//     return user.deployed().then(function(instance) {
//       console.log("abcd");
//         var name = document.getElementById("name").value;
//         var age = document.getElementById("age").value;
//         var gender1 = document.getElementById("Male").checked;
//         var gender2 = document.getElementById("Female").checked;
//         var gender3 = document.getElementById("Transgender").checked;
//         var gender;
//         if(gender1==true) {gender="Male";}
//         else if(gender2==true){gender="Female";}
//         else if(gender3==true){gender="Transgender";}
//         else gender="";
//         return instance.registerUser(name, age, gender);
//         }).then(function(x) {
//         if(x==true) {
//             console.log("abcd");
//             window.location('../index.html');
//         }
        
//         });
//   });

// });

  