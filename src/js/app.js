App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  userInstance:null,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("User.json", function(user) {
      App.contracts.User = TruffleContract(user);
      App.contracts.User.setProvider(App.web3Provider);
      App.contracts.User.deployed().then(function(i){App.userInstance=i;})
    });
    $.getJSON("Post.json", function(post) {
      App.contracts.Post = TruffleContract(post);
      App.contracts.Post.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: function() {
    var content = $("#content");
    content.show();
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        // console.log(account);
        App.contracts.User.deployed().then(function(instance)
        {
          App.userInstance = instance;
          // console.log(instance.userpresent(App.account));
          return instance.userpresent(App.account);
        }).then(function(x){
          // if user is already present in contract then directly show its page
          // Fill up the table
          if(x)
          {
            var Users = $('#Users');
            Users.empty();
            App.userInstance.total_users().then(function(total_users){
              // console.log(total_users);
              var value;
              for(var i=0;i<total_users;i++)
              {
                    App.userInstance.getUserInfo.call(i).then(function(user){
                      
                      var name = user[0];
                      var age = user[1];
                      var gender = user[2];
                      var value = user[3];
                      var user_row = "<tr><th>" + name + "</th><td>" + age + "</td><td>" + gender + "</td><td>" + "<button class="+"btn btn-primary"+" type="+"button id='" + value +"' value='"+value +"' onclick = App.Follow('" + value + "')>Follow</button>" + "</td></tr>";
                      Users.append(user_row);
                    });

              }
            });
            
            $("#accountAddress").html("Your Account: " + account);
            $('#register-btn').hide();
          }
          else
          {
            $("#accountAddress").html("Your Account: " + account);
          }
        });
      }
    });


  },
  
  Register: function() {
    
    window.location.replace('register.html');
  },



    Signup_async: async function (params) {
      let account1 = await web3.eth.getCoinbase(function(err, account){
        if(err==null){App.account=account;} 
      })

        let userInstance1 = await App.contracts.User.deployed();
        App.userInstance =  userInstance1;
        var name = document.getElementById("name").value;
        var age = document.getElementById("age").value;
        var gender1 = document.getElementById("Male").checked;
        var gender2 = document.getElementById("Female").checked;
        var gender3 = document.getElementById("Transgender").checked;
        var gender;
        if(gender1==true) {gender="Male";}
        else if(gender2==true){gender="Female";}
        else if(gender3==true){gender="Transgender";}
        else gender="";

        let x = await App.userInstance.registerUser(name, age, gender);
        if(x==1)
        {
          window.location.replace('index.html');
        }

    },

    loadPage: function(){
      window.location = 'index.html';
    },

    Follow: function(value){
      // var button_value = $(this).val();
      console.log(value);
    }

  //   toString:function (x){
  //     var b = new bytes(20);
  //     for (var i = 0; i < 20; i++)
  //         b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
  //     return string(b);
  // }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});



  // Signup: function () {
      
  //     web3.eth.getCoinbase(function(err, account) {
  //       if (err === null) 
  //       {
  //         App.account = account;
  //         // window.location = 'register.html';
  //         console.log(App.account);
  //         App.contracts.User.deployed().then(function(i){
  //           App.userInstance=i;
  //           // return App.userInstance.userpresent(App.account);
  //         }).then(function(){
  //           // console.log(x);
  //           console.log(document.URL);
  //           var name = document.getElementById("name").value;
  //           var age = document.getElementById("age").value;
  //           var gender1 = document.getElementById("Male").checked;
  //           var gender2 = document.getElementById("Female").checked;
  //           var gender3 = document.getElementById("Transgender").checked;
  //           var gender;
  //           if(gender1==true) {gender="Male";}
  //           else if(gender2==true){gender="Female";}
  //           else if(gender3==true){gender="Transgender";}
  //           else gender="";
  //           App.userInstance.registerUser(name, age, gender).then(function(){
  //             return App.loadPage();
  //           });
  //           });
  //       }
  //     });      
  //   },


  // If user is not present then clicking on login will take him to register page
  // Login: function(){
  //   web3.eth.getCoinbase(function(err, account){
  //     if(err==null)
  //     {
  //       // console.log(account);
  //       App.contracts.User.deployed().then(function(instance) {
  //         var accounttemp = account;
  //         // console.log(typeof accounttemp);
  //         App.userInstance = instance;
  //         // console.log(App.userInstance);
  //         return App.userInstance.userpresent(account);
  //       }).then(function(x) {
  //         // console.log(account);
  //         if (x) {
  //           console.log(account);
  //           // $('register-btn').hide();
  //         }
  //         else {
  //           // console.log(account);
  //           // $('login-btn').hide();
  //           window.location = 'register.html';
  //         }
  //       });
  //     }
  //   });
  // },
  // If you are not already present in contract then clicking on register takes you on register page