
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  userInstance:null,
  postInstance:null,
  ipfsHash:null,
  buffer:null,
  ipfs:null,
  userid:null,

  init: function() {
    // const IPFS = require('ipfs-api');
    // const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    // App.ipfs = ipfs;
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
              for(var i=0;i<total_users;i++)
              {
                    App.userInstance.getUserInfo.call(i).then(function(user){
                      App.userInstance.CheckFollow.call(App.account, user[3]).then(function(Check) {
                        var name = user[0];
                        var age = user[1];
                        var gender = user[2];
                        var value = user[3];
                        if(Check)
                        {
                          var user_row = "<tr><th id = user" + value + " onclick=App.GoToUser('" + value + "') style=cursor:pointer;><u>" + name + "</u></th><td>" + age + "</td><td>" + gender + "</td><td>" + "<button class="+"btn btn-primary"+" type="+"button id='" + value +"' value='"+value +"' onclick = App.Follow('" + value + "') disabled>Following</button>" + "</td></tr>";
                        }
                        else
                        {
                          var user_row = "<tr><th id = user" + value + " onclick=App.GoToUser('" + value + "') style=cursor:pointer;><u>" + name + "</u></th><td>" + age + "</td><td>" + gender + "</td><td>" + "<button class="+"btn btn-primary"+" type="+"button id='" + value +"' value='"+value +"' onclick = App.Follow('" + value + "')>Follow</button>" + "</td></tr>";
                          
                        }
                        Users.append(user_row);
                        
                      });                      
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

  // // capture the file as blob data
  // CapturePic:  function(event) {
  //   console.log("abcd");
  //   event.preventDefault();
  //   var file = event.target.files[0];
  //   var reader = new window.FileReader()
  //   reader.readAsArrayBuffer(file)
  //   reader.onloadend = () => {
  //     this.setState({ buffer: Buffer(reader.result) })
  //     console.log('buffer', this.state.buffer)
  //   }
  // },

  Signup_async: async function (params) {
    let account1 = await web3.eth.getCoinbase(function(err, account){
      if(err==null){App.account=account;} 
    })

      let userInstance1 = await App.contracts.User.deployed();
      App.userInstance =  userInstance1;
      let check = App.userInstance.userpresent.call(App.account);
      if(check)
      {
        document.getElementById("register-btn").disabled = true;
      }
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

      // Profile Pic
      // ipfs.files.add(App.buffer, (error, result) => {
      //   if(error) {
      //     console.log("error");
      //     return ;
      //   }
      //   ipfsHash = result[0].hash;
      // });
      ipfsHash = "pic";

      console.log(ipfsHash);

      let x = await App.userInstance.registerUser(name, age, gender, ipfsHash);
      if(x)
      {
        window.location.replace('index.html');
      }

  },

    loadPage: function(){
      window.location = 'index.html';
    },

    // We know current users address as App.account and the index of user (value) we want to follow
    // Since Follow is storing data in contract payment has to be made
    Follow: async function(value){
      // first find index of current user 
      let userInstance = await App.contracts.User.deployed();
      App.userInstance = userInstance;
      let user_idx = await App.userInstance.getidxFromAddress(App.account);
      
      if(user_idx==value)
      {
        alert("You cannot Follow yourself!!");
      }
      else
      {
        let x = await App.userInstance.Follow(App.account, value);
        if(x)
        {
          document.getElementById(value).innerHTML = "Following";
          document.getElementById(value).disabled = true;
        }
      }
    },
    
    // Go to new page and add user index as hash value in url
    GoToUser: async function(value)
    {
      window.location.href = 'user.html#' + (value);
    },

    // Get the user index from hash and then display all the information
    GoToUserTemp: async function()
    {
      await $.getJSON("User.json", function(user) {
        App.contracts.User = TruffleContract(user);
        App.contracts.User.setProvider(App.web3Provider);
        App.contracts.User.deployed().then(function(i){App.userInstance=i;})
      });
      await $.getJSON("Post.json", function(post) {
        App.contracts.Post = TruffleContract(post);
        App.contracts.Post.setProvider(App.web3Provider);
      });
      let account1 = await web3.eth.getCoinbase(function(err, account){if(err==null){App.account=account;}})
      let userInstance1 = await App.contracts.User.deployed();
      App.userInstance = userInstance1;
      let postInstance1 = await App.contracts.Post.deployed();
      App.postInstance = postInstance1;

      var value = parseInt(window.location.hash.slice(1));
      App.userid = value;

      // We have the user object
      let user = await App.userInstance.getUserInfo.call(value);
      // setting the name
      document.getElementById('name').innerHTML = user[0];  
      
      //------------------------------------------------
      // getting all the followers
      var followers_div =  document.getElementById("Followers");
      var followers = user[6];
      var br;
      for(var i=0;i<followers.length;i++)
      {
        let follower_info = await App.userInstance.getUserInfo.call(followers[i]);
        var follower_row = document.createTextNode(follower_info[0]);
        br = document.createElement("br");
        followers_div.appendChild(br);
        followers_div.appendChild(follower_row);
        
      }

      //--------------------------------------------------
      // getting all the followings
      var following_div =  document.getElementById("Following");
      var followings = user[7];
      var br;
      for(var i=0;i<followings.length;i++)
      {
        let following_info = await App.userInstance.getUserInfo.call(followings[i]);
        var following_row = document.createTextNode(following_info[0]);
        br = document.createElement("br");
        following_div.appendChild(br);
        following_div.appendChild(following_row);

      }

      // getting all the posts
      //-----------------------------
      var posts_div = document.getElementById("posts");
      var posts = user[5];
      for(var i=0;i<posts.length;i++)
      {
        let post_info = await App.postInstance.getPostInfo.call(posts[i]);
        var datetemp = new Date(post_info[2]*1000);
        var date = 
                   datetemp.toLocaleString('default', { month: 'long' })+" "+
                   datetemp.getDate()+" '"+
                   datetemp.getFullYear()+"  at "+
                   datetemp.getHours()+":"+
                   datetemp.getMinutes();
        var upvotes = post_info[4];
        console.log(upvotes);
        var post_card = document.createElement('div');
        post_card.classList = 'card mt-2';
        var content = `
          <h5 class="card-header">${post_info[0]}</h5>
          <div class="card-body">
            <p class="card-text" style="word-wrap: break-word;white-space:pre-wrap">${post_info[1]}</p>
          </div>
          <div class="card-footer text-muted">
            <div style=float:left;>${date}</div>
            
            <div style=float:right;>${upvotes}</div>
            <img src="images/upvote.png" style=float:right;height:40px;top:-10px;position:relative;>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary" onclick="App.Upvote(${posts[i]})" style=cursor:pointer;>Upvote</button>
            <button class="btn btn-primary" onclick="App.Bookmark(${posts[i]})" style=cursor:pointer;>Bookmark</button>
          </div>
        
        `;
        // Append newyly created card element to the container
        post_card.innerHTML += content;
        posts_div.appendChild(post_card);
      }
      

    },

    Upvote: async function(value) {
      let account1 = await web3.eth.getCoinbase(function(err, account){if(err==null){App.account=account;}})
      let userInstance1 = await App.contracts.User.deployed();
      App.userInstance = userInstance1;
      let userid = await App.userInstance.getidxFromAddress(App.account);
      App.userid = userid;
      console.log(value);
      console.log(App.userid);
      let check = await App.postInstance.checkupvote.call(value, App.userid);
      if(check==0)
      {
        alert("You have already upvoted this post.");
      }
      else
      {
        let num = await App.postInstance.upvote(value, App.userid);
        // $("#post").load();
        console.log(num);
      }
    },

    // First check if user has registered
    Post: async function (params) {
      let account1 = await web3.eth.getCoinbase(function(err, account){if(err==null){App.account=account;}})
      let userInstance1 = await App.contracts.User.deployed();
      App.userInstance = userInstance1;
      let check = await App.userInstance.userpresent.call(App.account);
      if(check)
      {
        window.location = 'post.html';
      }
      else
      {
        alert("First register.")
      }
      

    },

    
    CreatePost: async function(params) {
      // console.log(App.account);
      // let account1 = await web3.eth.getCoinbase(function(err, account){if(err==null){App.account=account;}})
      // let userInstance1 = await App.contracts.User.deployed();
      // App.userInstance = userInstance1;
      let postInstance1 = await App.contracts.Post.deployed();
      
      App.postInstance = postInstance1;
      
      var title = document.getElementById("title").value;
      var text = document.getElementById("text").value;
      var date = new Date().getTime()/1000;

      // Find the userid from App.account then call create_post then call addPost
      let user_idx = await App.userInstance.getidxFromAddress(App.account);
      let temp = await App.postInstance.create_post(user_idx, title, text, date);
      let postid = await App.postInstance.getPostid.call();
      let check = await App.userInstance.addPost(user_idx, postid);
      if(check)
      {
        window.location = 'index.html';
      }      

    }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});



  
  //   toString:function (x){
  //     var b = new bytes(20);
  //     for (var i = 0; i < 20; i++)
  //         b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
  //     return string(b);
  // }