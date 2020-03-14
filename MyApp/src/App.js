import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import $ from 'jquery';

class FrontApp extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      error: false,
      isCookieSet: false,
      isShowProfile: false,
      name: '',
      password: '',
      icon: '',
      mobileNumber: '',
      homeNumber: '',
      address: '',
      friendsBlocks: [],
      comment : '',
    };
    this.logIn  = this.logIn.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.logOut = this.logOut.bind(this);
    this.showProfile = this.showProfile.bind(this);
    this.handleMobileChange = this.handleMobileChange.bind(this);
    this.handleHomeChange = this.handleHomeChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.submitProfile = this.submitProfile.bind(this);
    this.updateStar = this.updateStar.bind(this);
    this.addComment = this.addComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.loadComment = this.loadComment.bind(this);
    this.loadDataForLogIn = this.loadDataForLogIn.bind(this);
    this.handleComment = this.handleComment.bind(this);
  }

  handleNameChange(name){
    this.setState({
      name: name
    });
  }
  handlePasswordChange(password){
    this.setState({
      password: password
    });
  }


  loadDataForLogIn(){
    $.ajax({
      url: "http://localhost:3001/signin",
      type: "post",
      data: {
        "name": this.state.name,
        "password": this.state.password
         },
       dataType: 'json',
      xhrFields: { withCredentials: true },
      success: function(data){
        if (data.msg === "Login failure"){
            this.setState({'error': true});
        }else {
          if (data.msg !== ''){
          this.setState({
            'error': false,
            'isCookieSet': true,
            'name': data.name,
            'icon': data.icon,
            'friendsBlocks': data.friendsBlocks
          });
        }
        }
      }.bind(this),
      error: function(xhr, ajaxOptions, thrownError) {
        alert(xhr.status);
        alert(thrownError);
      }.bind(this)
    });
  }

    logIn(e){
      this.loadDataForLogIn();
    }

    componentDidMount(){
      this.loadDataForLogIn();
    }


    logOut(e){
      $.ajax({
        url: "http://localhost:3001/logout",
        type: "get",
        xhrFields: { withCredentials: true },
        success: function(data){
          if (data.msg === ''){
            this.setState({
              'isCookieSet': false,
              'isShowProfile': false,
              'name': '',
              'password': ''
            });
          }
        }.bind(this),
        error: function(xhr, ajaxOptions, thrownError) {
        alert(xhr.status);
        alert(thrownError);
      }.bind(this)
    });
    }

    showProfile(e){
      $.ajax({
        url: "http://localhost:3001/getuserprofile",
        xhrFields: { withCredentials: true },
        type: "get",
        success: function(data){
           this.setState({
             'isShowProfile': true,
             'mobileNumber': data.mobileNumber,
             'homeNumber': data.homeNumber,
             'address': data.address
           });
        }.bind(this),
        error: function(xhr, ajaxOptions, thrownError) {
          alert(xhr.status);
          alert(thrownError);
        }.bind(this)
      });
    }

    handleMobileChange(mobileNumber){
      this.setState({
        mobileNumber: mobileNumber
      });
    }
    handleHomeChange(homeNumber){
      this.setState({
        homeNumber: homeNumber
      });
    }
    handleAddressChange(address){
      this.setState({
        address: address
      });
    }

    handleComment(comment){
      this.setState({
        comment: comment
      });
    }


    submitProfile(e){
      $.ajax({
        url: "http://localhost:3001/saveuserprofile",
        xhrFields: { withCredentials: true },
        type: "put",
        data: {
          "mobileNumber": this.state.mobileNumber,
          "homeNumber": this.state.homeNumber,
          "address": this.state.address
        },
        dataType: 'json',
        success: function(data){
          if (data.msg === ''){
            this.setState({
              'isShowProfile': false
            })
          }
        }.bind(this),
        error: function(xhr, ajaxOptions, thrownError) {
        alert(xhr.status);
        alert(thrownError);
      }.bind(this)
      });
    }

    updateStar(e){
      e.preventDefault(e);
      var id = e.target.alt;
      var friendIdx = -1;
      for (var i=0; i<this.state.friendsBlocks.length; i++){
        if (this.state.friendsBlocks[i].friendId === id){
          friendIdx = i;
          var tempList = this.state.friendsBlocks;
          if (tempList[friendIdx].starredOrNot === 'Y'){
            tempList[friendIdx].starredOrNot = 'N';
          }else{
            tempList[friendIdx].starredOrNot = 'Y';
          }
          $.ajax({
            url: "http://localhost:3001/updatestar/"+id,
            xhrFields: { withCredentials: true },
            type: "get",
            success: function(data){
                this.setState({
                  'friendsBlocks': tempList
                });
            }.bind(this),
            error: function(xhr, ajaxOptions, thrownError) {
              alert(xhr.status);
              alert(thrownError);
            }.bind(this)
          });
        }
      }
    }

    loadComment(){
      $.ajax({
        url: "http://localhost:3001/loadcommentupdates",
        xhrFields: { withCredentials: true },
        type: 'get',
        success: function(data){
            for (var k=0; k<data.length; k++){
              if (data[k] !== null){
                var postId = data[k].postId;
                var commentId = data[k].commentId;
                var tempFriendsBlocks = this.state.friendsBlocks;
                for (var i=0; i<this.state.friendsBlocks.length; i++){
                  if (this.state.friendsBlocks[i].postId === postId){
                    if (data[k].deleteTime === ''){
                      tempFriendsBlocks[i].commentList.push({
                        'postId': data[k].postId,
                        'commentId': data[k].commentId,
                        'userId': data[k].userId,
                        'userName': data[k].userName,
                        'comment': data[k].comment,
                        'postTime': data[k].postTime,
                        'deleteTime': data[k].deleteTime
                      });
                      this.setState({
                        friendsBlocks: tempFriendsBlocks
                      });
                    }else{
                      for (var j=0; j<this.state.friendsBlocks[i].commentList.length; j++){
                        if (this.state.friendsBlocks[i].commentList[j].commentId === commentId){
                          tempFriendsBlocks[i].commentList[j].deleteTime = data[k].deleteTime;
                          this.setState({
                            friendsBlocks: tempFriendsBlocks
                          });
                        }
                      }
                    }
                    break;
                  }
                }
              }
            }//end of for k, loop for whole data
        }.bind(this),//end of success
        error: function(xhr, ajaxOptions, thrownError) {
          alert(xhr.status);
          alert(thrownError);
        }.bind(this)
      });
    }


    addComment(e){
      var id = e.target.id;
      var comment = this.state.comment;
      e.target.reset();
      $.ajax({
        url: "http://localhost:3001/postcomment/"+id,
        xhrFields: { withCredentials: true },
        type: 'post',
        data: {
            'comment': comment
        },
        dataType: "json",
        success: function(data){
          if (data.msg === ''){
            this.loadComment();
          }
        }.bind(this),
        error: function(xhr, ajaxOptions, thrownError) {
          alert(xhr.status);
          alert(thrownError);
        }.bind(this)
      });
    }

    deleteComment(e){
      var confirmation = window.confirm('Delete the message?');
      if (confirmation === true){
        var id = e.target.id;
        $.ajax({
          url: "http://localhost:3001/deletecomment/"+id,
          type: "delete",
          success: function(data){
            if (data.msg === ''){
              this.loadComment();
            }
          }.bind(this),
          error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
          }.bind(this)
        });
      }
    }

    render(){
      if (this.state.isCookieSet){
      var page = (<ServicePage
        logOut = {this.logOut}
        name={this.state.name}
        icon={this.state.icon}
        friendsBlocks={this.state.friendsBlocks}
        isShowProfile = {this.state.isShowProfile}
        showProfile = {this.showProfile}
        mobileNumber = {this.state.mobileNumber}
        homeNumber={this.state.homeNumber}
        address={this.state.address}
        handleMobileChange={this.handleMobileChange}
        handleHomeChange={this.handleHomeChange}
        handleAddressChange={this.handleAddressChange}
        submitProfile={this.submitProfile}
        updateStar={this.updateStar}
        addComment={this.addComment}
        deleteComment={this.deleteComment}
        loadComment={this.loadComment}
        handleComment={this.handleComment}
        />);
      }else{
        var page = (<LoginPage
              logIn={this.logIn}
              name={this.name}
              password={this.password}
              handleNameChange={this.handleNameChange}
              handlePasswordChange={this.handlePasswordChange}
              />);
      }
      if (this.state.error){
        var errorMsg= (<h3>Login failure</h3>);
      }
      return (
        <div>
          {errorMsg}
        <h1>Social Service App</h1>
            {page}
        </div>
      );
    }
}

class LoginPage extends React.Component{
  constructor(props){
    super(props);
    this.logIn  = this.logIn.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  logIn(e){
    e.preventDefault(e);
    this.props.logIn(e);
  }
  handleNameChange(e){
    e.preventDefault(e);
    this.props.handleNameChange(e.target.value);
  }
  handlePasswordChange(e){
    e.preventDefault(e);
    this.props.handlePasswordChange(e.target.value);
  }


  render(){
    return(
    <div id="loginInput">
      <div className="loginInput">Username: <input type="text" value={this.props.name} onChange={this.handleNameChange} /></div>
      <div className="loginInput">Password: <input type="text" value={this.props.password} onChange={this.handlePasswordChange}/></div>
      <div id="logInButton"><button onClick={this.logIn}>Sign in</button></div>
    </div>
  );}
}

class ServicePage extends React.Component{
  constructor(props){
    super(props);
    this.logOut = this.logOut.bind(this);
    this.showProfile = this.showProfile.bind(this);
    this.handleMobileChange = this.handleMobileChange.bind(this);
    this.handleHomeChange = this.handleHomeChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.submitProfile = this.submitProfile.bind(this);
    this.updateStar = this.updateStar.bind(this);
    this.addComment = this.addComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.loadComment = this.loadComment.bind(this);
      this.handleComment = this.handleComment.bind(this);
  }

  componentDidMount(){
    this.timerID = setInterval(()=>this.loadComment(), 10000);
  }

  componentWillUnmount(){
    clearInterval(this.timerID);
  }

  loadComment(){
    this.props.loadComment();
  }

  logOut(e){
    e.preventDefault(e);
    this.props.logOut(e);
  }

  showProfile(e){
    e.preventDefault(e);
    this.props.showProfile(e);
  }

  handleMobileChange(e){
    this.props.handleMobileChange(e.target.value);
  }
  handleHomeChange(e){
    this.props.handleHomeChange(e.target.value);
  }
  handleAddressChange(e){
    this.props.handleAddressChange(e);
  }
  submitProfile(e){
    e.preventDefault(e);
    this.props.submitProfile(e);
  }
  updateStar(e){
    e.preventDefault(e);
    this.props.updateStar(e);
  }

  deleteComment(e){
    e.preventDefault(e);
    this.props.deleteComment(e);
  }

  addComment(e){
    e.preventDefault(e);
    this.props.addComment(e);
  }

  handleComment(e){
    e.preventDefault(e);
    this.props.handleComment(e.target.value);
  }



  render(){
    const icon = this.props.icon;
    const name  = this.props.name;
    const friendsBlocks = this.props.friendsBlocks;
    if (this.props.isShowProfile){
      var rightDiv = (<Profile
        name={this.props.name}
        icon={this.props.icon}
      mobileNumber={this.props.mobileNumber}
      homeNumber={this.props.homeNumber}
      address={this.props.address}
      handleMobileChange={this.handleMobileChange}
      handleHomeChange={this.handleHomeChange}
      handleAddressChange={this.handleAddressChange}
      submitProfile={this.submitProfile}
      />);
    }else{
      var rightDiv = (<Friends
      name={name}
      friendsBlocks = {friendsBlocks}
      updateStar={this.updateStar}
      addComment={this.addComment}
      deleteComment={this.deleteComment}
      handleComment = {this.handleComment}

      />);
    }

    return(
    <div>
    <div id='userInfo'>
      <div  id="userClick" onClick = {this.showProfile}>
        <img id='userImg' src={icon} />
        <div id='userName'>{name}</div>
      </div>
      <div id="logOutButtonDiv"><button id="logOutButton" onClick={this.logOut}>Log Out</button></div>
      </div>
      <div id="starListDiv">
      <StarList
      friendsBlocks = {friendsBlocks}/>
      </div>
      <div id="rightDiv">
        {rightDiv}
      </div>
    </div>
  );
 }
}

class StarList extends React.Component{
  render(){
    let rows =[];
    this.props.friendsBlocks.map((friend, i)=>{
      if (friend.starredOrNot === "Y"){
      rows.push(<h4 key={i} className="starName"> {friend.friendName}</h4>);
      }
    });
    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Friends extends React.Component{

  constructor(props){
    super(props);
    this.updateStar = this.updateStar.bind(this);
    this.addComment = this.addComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
      this.handleComment = this.handleComment.bind(this);
  }

  updateStar(e){
    e.preventDefault(e);
    this.props.updateStar(e);
  }

  deleteComment(e){
    e.preventDefault(e);
    this.props.deleteComment(e);
  }

  addComment(e){
    e.preventDefault(e);
    this.props.addComment(e);
  }

  handleComment(e){
    e.preventDefault(e);
    this.props.handleComment(e);
  }


  render(){
    let rows = [];
    this.props.friendsBlocks.map((friendBlock, i)=>{
      rows.push(
        <Friend key={i}
        friendBlock={friendBlock}
        name={this.props.name}
        updateStar={this.updateStar}
        addComment={this.addComment}
        deleteComment={this.deleteComment}
        handleComment = {this.handleComment}
        />
      );
    });

    return(
      <div>
        {rows}
      </div>
    );
  }//end of render

}

class Friend extends React.Component{
  constructor(props){
    super(props);
    this.updateStar = this.updateStar.bind(this);
    this.addComment = this.addComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.handleComment = this.handleComment.bind(this);
  }

  updateStar(e){
    e.preventDefault(e);
    this.props.updateStar(e);
  }

  deleteComment(e){
    e.preventDefault(e);
    this.props.deleteComment(e);
  }

  addComment(e){
    e.preventDefault(e);
    this.props.addComment(e);
  }
  handleComment(e){
    e.preventDefault(e);
    this.props.handleComment(e);
  }


  render(){
    const starN = "icons/starN.png";
    const starY = "icons/starY.png";
    if (this.props.friendBlock.starredOrNot === 'Y'){
      var star = (<img src={starY} alt={this.props.friendBlock.friendId} onClick={this.updateStar} className="star" />);
    }else{
      var star = (<img src={starN} alt={this.props.friendBlock.friendId} onClick={this.updateStar} className="star"/>);
    }
    let comments = [];
    this.props.friendBlock.commentList.map((comment, i)=>{
     if (comment.deleteTime === ''){
       if (comment.userName === this.props.name){
           comments.push(<h4 key={i} onDoubleClick={this.deleteComment} id={comment.commentId}>
             {comment.postTime} You said: {comment.comment}</h4>);
       }else{
         comments.push(<h4 key={i}>{comment.postTime} {comment.userName} said: {comment.comment}</h4>);
       }
      }
    });

    return(
      <div className="friendDiv">
        <div id='friendBlock'>
          <div id="friendInfo">
            <h4 id="friendName">{this.props.friendBlock.friendName}</h4>
            {star}
            <h4>{this.props.friendBlock.time}</h4>
            <h4>{this.props.friendBlock.location}</h4>
            <h4>{this.props.friendBlock.content}</h4>
          </div>
          <img src={this.props.friendBlock.friendIcon} id='friendIcon'/>
        </div>
      {comments}
      <form onSubmit={this.addComment} id={this.props.friendBlock.postId}>
       <input type="text" onChange={this.handleComment} placeholder="write your comment here ..." className="commentInput"/>
      </form>
      </div>
    );
  }
}


class Profile extends React.Component{
  constructor(props){
    super(props);
    this.handleMobileChange = this.handleMobileChange.bind(this);
    this.handleHomeChange = this.handleHomeChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.submitProfile = this.submitProfile.bind(this);
 }

  handleMobileChange(e){
    e.preventDefault(e);
    this.props.handleMobileChange(e);
  }
  handleHomeChange(e){
    e.preventDefault(e);
    this.props.handleHomeChange(e);
  }
  handleAddressChange(e){
    e.preventDefault(e);
    this.props.handleAddressChange(e);
  }
  submitProfile(e){
    e.preventDefault(e);
    this.props.submitProfile(e);
  }

  render(){
     return(
       <div>
       <img src={this.props.icon} id='profileIcon'/>
       <h4 id='profileName'>{this.props.name}</h4>
         <div className="profileInput">Mobile number: <input type="text"
         value={this.props.mobileNumber}
         onChange={this.handleMobileChange}
         />
         </div>
         <div className="profileInput">Home number: <input type="text" value={this.props.homeNumber}
         onChange={this.handleHomeChange}
         />
         </div>
         <div className="profileInput">Mailing address: <input type="text" value={this.props.address}
         onChange={this.handleAddressChange}
         />
         </div>
          <div id="save"><button onClick={this.submitProfile}>Save</button></div>
       </div>
     );
  }
}

export default FrontApp;
