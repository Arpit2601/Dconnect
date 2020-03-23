
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
        App.contracts.User.deployed().then(function(instance)
        {
          App.userInstance = instance;
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
                      App.userInstance.CheckFollow.call(App.account, user[2]).then(function(Check) {
                        var name = user[0];
                        var bio = user[1];
                        var value = user[2];
                        if(Check)
                        {
                          var user_row = "<tr><th id = user" + value + " onclick=App.GoToUser('" + value + "') style=cursor:pointer;><u>" + name + "</u></th><td>" + bio + "</td><td>" + "<button class="+"btn btn-primary"+" type="+"button id='" + value +"' value='"+value +"' onclick = App.Follow('" + value + "') disabled>Following</button>" + "</td></tr>";
                        }
                        else
                        {
                          var user_row = "<tr><th id = user" + value + " onclick=App.GoToUser('" + value + "') style=cursor:pointer;><u>" + name + "</u></th><td>" + bio + "</td><td>" + "<button class="+"btn btn-primary"+" type="+"button id='" + value +"' value='"+value +"' onclick = App.Follow('" + value + "')>Follow</button>" + "</td></tr>";
                          
                        }
                        Users.append(user_row);
                        
                      });                      
                    });
              }
            });
            
            // $("#accountAddress").html("Your Account: " + account);
            $('#register-btn').hide();
          }
          else
          {
            // $("#accountAddress").html("Your Account: " + account);
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
  //   event.preventDefault();
  //   var file = event.target.files[0];
  //   var reader = new window.FileReader()
  //   reader.readAsArrayBuffer(file)
  //   reader.onloadend = () => {
  //     this.setState({ buffer: Buffer(reader.result) })
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
      var bio = document.getElementById("bio").value;
      // ipfsHash = "pic";
      let x = await App.userInstance.registerUser(name, bio);
      // if(x)
      // {
        window.location.replace('index.html');
      // }

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
      // window.location.reload();
      // return App.GoToUserTemp();
    },

    GoToUserFromOtherUser: function(value)
    {
      window.location.href = 'user.html#' + (value);
      window.location.reload();
    },

    // Go to msg.sender's user page
    GoToYourPage:async function() {
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
      let userindex = await App.userInstance.getidxFromAddress.call(App.account);
      window.location.href = 'user.html#' + (userindex);
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
      document.getElementById('bio').innerHTML = user[1];

      // getting all the posts
      //-----------------------------
      var posts_div = document.getElementById("posts");
      var posts = user[3];
      for(var i=posts.length-1;i>=0;i--)
      {
        let post_info = await App.postInstance.getPostInfo.call(posts[i]);
        let user_info = await App.userInstance.getUserInfo.call(post_info[3]);
        var owner = user_info[0];
        var datetemp = new Date(post_info[2]*1000);
        var date = 
                   datetemp.toLocaleString('default', { month: 'long' })+" "+
                   datetemp.getDate()+" '"+
                   datetemp.getFullYear()+"  at "+
                   datetemp.getHours()+":"+
                   datetemp.getMinutes();
        var upvotes = post_info[4];
        var post_card = document.createElement('div');
        post_card.classList = 'card mt-2';

        // Check if post is bookmarked
        let currentuserid = await App.userInstance.getidxFromAddress(App.account);
        let check = await App.userInstance.CheckBookmark.call(currentuserid, posts[i]);
        var readtime = Math.ceil(post_info[1].split(' ').length/200);
        if(check==1)
        {
          var content = `
          <div class="card-header" style=height:70px;>
            <h5 >${post_info[0]}</h5>
            <span class="text-muted" style=top:-5;position:relative;>By: ${owner}</span>
            <span class="text-muted" style=top:-5;position:relative;margin-left:30px;>Read Time: ${readtime}</span>
            <img src="images/bookmark.png" style=float:right;height:50px;top:-45px;position:relative;>
          </div>
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
        }
        else
        {
          var content = `
          <div class="card-header" style=height:70px;>
            <h5 >${post_info[0]}</h5>
            <span class="text-muted" style=top:-5;position:relative;>By: ${owner}</span>
            <span class="text-muted" style=top:-5;position:relative;margin-left:30px;>Read Time: ${readtime}</span>
          </div>
          <div class="card-body">
            <p class="card-text" style="word-wrap: break-word;white-space:pre-wrap">${post_info[1]}</p>
            
          </div>
          <div class="card-footer text-muted">
            <div style=float:left;>${date}</div>
            <span>Read Time: ${readtime}</span>
            <div style=float:right;>${upvotes}</div>
            <img src="images/upvote.png" style=float:right;height:40px;top:-10px;position:relative;>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary" onclick="App.Upvote(${posts[i]})" style=cursor:pointer;>Upvote</button>
            <button class="btn btn-primary" onclick="App.Bookmark(${posts[i]})" style=cursor:pointer;>Bookmark</button>
          </div>
        
        `;
        }
        
        // Append newyly created card element to the container
        post_card.innerHTML += content;
        posts_div.appendChild(post_card);
      }
      

    },

    // All the posts of this user(with #user).
    ShowPosts: async function() {
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

      document.getElementById("Upvoted_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Followers_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Bookmarked_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Post_btn").style.backgroundColor = "#d6cbd3";
      document.getElementById("Following_btn").style.backgroundColor = "#ffffff";
      // We have the user object
      let user = await App.userInstance.getUserInfo.call(value);
      // getting bookmarked the posts
      //-----------------------------
      document.getElementById("posts").innerHTML="";
      var posts_div = document.getElementById("posts");
      var posts = user[3];
      for(var i=posts.length-1;i>=0;i--)
      {
        let currentuserid = await App.userInstance.getidxFromAddress(App.account);
        let check = await App.userInstance.CheckBookmark.call(currentuserid, posts[i]);
        let post_info = await App.postInstance.getPostInfo.call(posts[i]);
        let user_info = await App.userInstance.getUserInfo.call(post_info[3]);
        var readtime = Math.ceil(post_info[1].split(' ').length/200);
        var owner = user_info[0];
        var datetemp = new Date(post_info[2]*1000);
        var date = 
                  datetemp.toLocaleString('default', { month: 'long' })+" "+
                  datetemp.getDate()+" '"+
                  datetemp.getFullYear()+"  at "+
                  datetemp.getHours()+":"+
                  datetemp.getMinutes();
        var upvotes = post_info[4];
        var post_card = document.createElement('div');
        post_card.classList = 'card mt-2';
        if(check==1)
        {
          
          var content = `
          <div class="card-header" style=height:70px;>
            <h5 >${post_info[0]}</h5>
            <span class="text-muted" style=top:-5;position:relative;>By: ${owner}</span>
            <span class="text-muted" style=top:-5;position:relative;margin-left:30px;>Read Time: ${readtime}</span>
            <img src="images/bookmark.png" style=float:right;height:50px;top:-45px;position:relative;>
          </div>
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
        }
        else
        {
          var content = `
          <div class="card-header" style=height:70px;>
            <h5 >${post_info[0]}</h5>
            <span class="text-muted" style=top:-5;position:relative;>By: ${owner}</span>
            <span class="text-muted" style=top:-5;position:relative;margin-left:30px;>Read Time: ${readtime}</span>
          </div>
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
         
        }        
        post_card.innerHTML += content;
        posts_div.appendChild(post_card);
      }
    },

    // All the bookmarked posts of this user(with #user).
    ShowBookmarked: async function() {
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

      document.getElementById("Upvoted_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Followers_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Bookmarked_btn").style.backgroundColor = "#d6cbd3";
      document.getElementById("Post_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Following_btn").style.backgroundColor = "#ffffff";
      // We have the user object
      let user = await App.userInstance.getUserInfo.call(value);
      // getting bookmarked the posts
      //-----------------------------
      document.getElementById("posts").innerHTML="";
      var posts_div = document.getElementById("posts");
      var bookmarked_posts = user[6];
      for(var i=bookmarked_posts.length-1;i>=0;i--)
      {
          let post_info = await App.postInstance.getPostInfo.call(bookmarked_posts[i]);
          let user_info = await App.userInstance.getUserInfo.call(post_info[3]);
          var readtime = Math.ceil(post_info[1].split(' ').length/200);
          var owner = user_info[0];
          var datetemp = new Date(post_info[2]*1000);
          var date = 
                    datetemp.toLocaleString('default', { month: 'long' })+" "+
                    datetemp.getDate()+" '"+
                    datetemp.getFullYear()+"  at "+
                    datetemp.getHours()+":"+
                    datetemp.getMinutes();
          var upvotes = post_info[4];
          var post_card = document.createElement('div');
          post_card.classList = 'card mt-2';
          var content = `
          <div class="card-header" style=height:70px;>
            <h5 >${post_info[0]}</h5>
            <span class="text-muted" style=top:-5;position:relative;>By: ${owner}</span>
            <span class="text-muted" style=top:-5;position:relative;margin-left:30px;>Read Time: ${readtime}</span>
            <img src="images/bookmark.png" style=float:right;height:50px;top:-45px;position:relative;>
          </div>
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

    // All the posts this user (with #id) has upvoted
    ShowUpvoted: async function() {
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

      document.getElementById("Upvoted_btn").style.backgroundColor = "#d6cbd3";
      document.getElementById("Followers_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Bookmarked_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Post_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Following_btn").style.backgroundColor = "#ffffff";
      // We have the user object
      let user = await App.userInstance.getUpvotedPosts.call(value);
      // getting bookmarked the posts
      //-----------------------------
      document.getElementById("posts").innerHTML="";
      var posts_div = document.getElementById("posts");
      var posts = user;
      for(var i=posts.length-1;i>=0;i--)
      {
        let currentuserid = await App.userInstance.getidxFromAddress(App.account);
        let check = await App.userInstance.CheckBookmark.call(currentuserid, posts[i]);
        let post_info = await App.postInstance.getPostInfo.call(posts[i]);
        let user_info = await App.userInstance.getUserInfo.call(post_info[3]);
        var readtime = Math.ceil(post_info[1].split(' ').length/200);
        var owner = user_info[0];
        var datetemp = new Date(post_info[2]*1000);
        var date = 
                  datetemp.toLocaleString('default', { month: 'long' })+" "+
                  datetemp.getDate()+" '"+
                  datetemp.getFullYear()+"  at "+
                  datetemp.getHours()+":"+
                  datetemp.getMinutes();
        var upvotes = post_info[4];
        var post_card = document.createElement('div');
        post_card.classList = 'card mt-2';
        if(check==1)
        {
          
          var content = `
          <div class="card-header" style=height:70px;>
            <h5 >${post_info[0]}</h5>
            <span class="text-muted" style=top:-5;position:relative;>By: ${owner}</span>
            <span class="text-muted" style=top:-5;position:relative;margin-left:30px;>Read Time: ${readtime}</span>
            <img src="images/bookmark.png" style=float:right;height:50px;top:-45px;position:relative;>
          </div>
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
        }
        else
        {
          var content = `
          <div class="card-header" style=height:70px;>
            <h5 >${post_info[0]}</h5>
            <span class="text-muted" style=top:-5;position:relative;>By: ${owner}</span>
            <span class="text-muted" style=top:-5;position:relative;margin-left:30px;>Read Time: ${readtime}</span>
          </div>
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
        
        }        
        post_card.innerHTML += content;
        posts_div.appendChild(post_card);
      }
    },

    // All the users this user (with #id) is being Followed by.
    ShowFollowers: async function() {
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
      // document.getElementById('name').innerHTML = user[0];  
      document.getElementById("posts").innerHTML="";
      var posts_div = document.getElementById("posts");
      document.getElementById("Upvoted_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Followers_btn").style.backgroundColor = "#d6cbd3";
      document.getElementById("Bookmarked_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Post_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Following_btn").style.backgroundColor = "#ffffff";
      
      //------------------------------------------------
      // getting all the followers
      // var followers_div =  document.getElementById("Followers");
      var followers = user[4];
      // var br;
      for(var i=0;i<followers.length;i++)
      {
        let follower_info = await App.userInstance.getUserInfo.call(followers[i]);
        var post_card = document.createElement('div');
        post_card.classList = 'card mt-2';
        var content = `
          <div class="card-header" style=height:60px;>
            <h5 onclick="App.GoToUserFromOtherUser(${follower_info[2]})" style=cursor:pointer;>${follower_info[0]}</h5>
            
          </div>
          <div class="card-body">
            <p class="card-text" style="word-wrap: break-word;white-space:pre-wrap">${follower_info[1]}</p>
            
          </div>
        `;
        post_card.innerHTML += content;
        posts_div.appendChild(post_card);
      }
    },

    // All the users this user (with #id) is Following.
    ShowFollowing: async function() {
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
      // document.getElementById('name').innerHTML = user[0];  
      document.getElementById("posts").innerHTML="";
      var posts_div = document.getElementById("posts");
      document.getElementById("Upvoted_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Followers_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Bookmarked_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Post_btn").style.backgroundColor = "#ffffff";
      document.getElementById("Following_btn").style.backgroundColor = "#d6cbd3";
      
      //------------------------------------------------
      // getting all the followers
      var following = user[5];
      // var br;
      for(var i=0;i<following.length;i++)
      {
        let following_info = await App.userInstance.getUserInfo.call(following[i]);
        var post_card = document.createElement('div');
        post_card.classList = 'card mt-2';
        var content = `
          <div class="card-header" style=height:60px;>
            <h5 onclick="App.GoToUserFromOtherUser(${following_info[2]})" style=cursor:pointer;>${following_info[0]}</h5>
            
          </div>
          <div class="card-body">
            <p class="card-text" style="word-wrap: break-word;white-space:pre-wrap">${following_info[1]}</p>
            
          </div>
        `;
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
      let check = await App.postInstance.checkupvote.call(value, App.userid);
      if(check==0)
      {
        alert("You have already upvoted this post.");
      }
      else
      {
        let num = await App.postInstance.upvote(value, App.userid);
        let num1 = await App.userInstance.UpvotePost(App.userid, value);
        // $("#post").load();
        // $("posts").load(location.href + " posts");
        // $("#posts").load(location.href + " #posts>*", "");
      }
    },

    // Bookmark post
    Bookmark: async function(value) {
      let account1 = await web3.eth.getCoinbase(function(err, account){if(err==null){App.account=account;}})
      let userInstance1 = await App.contracts.User.deployed();
      App.userInstance = userInstance1;
      let userid = await App.userInstance.getidxFromAddress(App.account);
      App.userid = userid;
      let check = await App.userInstance.CheckBookmark.call(App.userid, value);
      if(check==1)
      {
        alert("You have already bookmarked this post");
      }
      else
      {
        let num = await App.userInstance.BookmarkPost(App.userid, value);
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