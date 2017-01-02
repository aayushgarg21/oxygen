import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import io from 'socket.io-client'
export default class Notification extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
       message:{},
       open:false
    }   
  }
 
 componentWillMount() {
  let socket = io.connect();

  socket.emit('test' , 'abc');
  socket.on('oxygen::progressUpdate', function(data) {
    console.log(data);
  });

  socket.on('oxygen::progressUpdate', this._getMessage.bind(this));
  
  console.log("back to will mount")
}

_getMessage(socMsg) {
  if(socMsg) {
        // var obj = JSON.parse(socMsg);
        console.log("getting the socMsg");
        console.log(socMsg);
        
        this.setState({message:socMsg.data})
        console.log(this.state.message)
        this.setState({
          open:true
        })
      }
    }
    handleRequestClose()
    {
      this.setState(
      {
        open:false
      })
    }
    render() {
      return (<div>
        <Snackbar
        open={this.state.open}
        message={JSON.stringify(this.state.message)}
        autoHideDuration={4000}
        onRequestClose={this.handleRequestClose.bind(this)}
        />
        </div>);
    }
  }



// import React from 'react';
// import Snackbar from 'material-ui/Snackbar';



// export default class Notification extends React.Component {

//   constructor(props) {
//     super(props);

//     this.state = {
//        message:{},
//        open:false
//     }
    
//   }

//   componentDidMount() {
//       let socket = io();

//       socket.emit('test' , 'abc');
//       socket.on('oxygen::progressUpdate', function(data) {
//         console.log("the data is" ,data);
//       });

//        socket.on('oxygen::progressUpdate', this._getMessage.bind(this));
       
//        console.log("back to will mount")
//   }
  
//   _getMessage(socMsg) {
//       if(socMsg) {
//         // var obj = JSON.parse(socMsg);
//         console.log("getting the socMsg");
//         console.log(socMsg);
       
//         this.setState({message:socMsg.data})
//         console.log(this.state.message)
//          this.setState({
//         open:true
//       })
//       }
//   }
// handleRequestClose()
// {
//   this.setState(
//   {
//     open:false
//   })
// }
//   render() {
//     return (<div>
//       <Snackbar
//         open={this.state.open}
//         message={JSON.stringify(this.state.message)}
//         autoHideDuration={4000}
//         onRequestClose={this.handleRequestClose.bind(this)}
//       />
//     </div>);
//   }
// }