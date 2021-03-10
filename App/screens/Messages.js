import React, { Component, useState } from 'react';
import { StyleSheet, Text, View, Colors, PermissionsAndroid, KeyboardAvoidingView, Animated, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { ImagePicker } from 'react-native-image-picker';
import NavigationBar from "react-native-navbar";
import STYLES from '../components/Styles';

import {
  listenToMessages,
  createTextMessage,
  currentUser,
  markThreadLastRead,
} from '../firebase';

const styles = StyleSheet.create({
  composer: {
    borderRadius: 25,
    borderWidth: 0.5,
    borderColor: '#dddddd',
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 10,
    fontSize: 16
  },
  btnSend: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: "#0000ff",
    borderRadius: 50,
  },
  btnColor: {
    color: 'blue',
  },
});

const colors = [
  '#e67e22', // carrot
  '#2ecc71', // emerald
  '#3498db', // peter river
  '#8e44ad', // wisteria
  '#e74c3c', // alizarin
  '#1abc9c', // turquoise
  '#2c3e50', // midnight blue
];

export default class Messages extends React.Component {
  state = {
    messages: [],
    resourcePath: {},
    hasPermission: false,
    imagePath: "",
  };


  componentDidMount() {
    const thread = this.props.navigation.getParam('thread');

    this.removeMessagesListener = listenToMessages(thread._id).onSnapshot(
      querySnapshot => {
        const messages = querySnapshot.docs.map(doc => {
          const firebaseData = doc.data();

          const data = {
            _id: doc.id,
            text: '',
            createdAt: new Date().getTime(),
            ...firebaseData,
          };

          if (!firebaseData.system) {
            data.user = {
              ...firebaseData.user,
              name: firebaseData.user.displayName,
            };
          }

          return data;
        });

        console.log(messages);
        this.setState({ messages });
      }
    );
  }

  componentWillUnmount() {
    const thread = this.props.navigation.getParam('thread');

    markThreadLastRead(thread._id);
    if (this.removeMessagesListener) {
      this.removeMessagesListener();
    }
  }

  // checkPermission() {
  //   return PermissionsAndroid.request(
  //     PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  //     rationale
  //   ).then(result => {
  //     console.log("Permission result:", result);
  //     return result === true || result === PermissionsAndroid.RESULTS.GRANTED;
  //   });
  // }

  handleAvatarPress = props => {
  };

  renderBubble = (props) => {
    return (<Bubble {...props}
      wrapperStyle={{
        left: {
          backgroundColor: this.randomColor(),
        },
        right: {
          backgroundColor: this.randomColor(),
        }
      }}
      textStyle={{
        left: {
          color: '#ffffff',
        },
        right: {
          color: '#ffffff',
        }
      }} />
    )
  }

  randomColor = () => {
    return colors[Math.floor(Math.random() * 6)];
  }

  // foreach(this.state.prevColors : )

  //       if (color[Math.floor(Math.random() * 6)] != this.state.prevColor)
  //    

  handleAddPicture = () => {
    const user = currentUser(); // wherever you user data is stored;
    const options = {
      title: "Select Picture",
      mediaType: "photo",
      maxWidth: 256,
      maxHeight: 256,
      // allowsEditing: true,
      // noData: true,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      }
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      console.log({ response });

      if (response.didCancel) {
        console.log('User cancelled photo picker');
        Alert.alert('You did not choose an image');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        let imageSource = { uri: response.uri };
        const { uri } = response;
        // const extensionIndex = uri.lastIndexOf(".");
        // const extension = uri.slice(extensionIndex + 1);
        // const allowedExtensions = ["jpg", "jpeg", "png"];
        // const correspondingMime = ["image/jpeg", "image/jpeg", "image/png"];

        imageSource = { uri: response.uri };
        this.setState({
          imagePath: imageSource,
        });
        console.log({ imageSource });
      }
    });
  }

  handleSend = async messages => {
    //const image = messages[0].image;
    // if (messages[0].text == 0) {
    //   return createTextMessage(thread._id, text, this.handleAddPicture());
    // } else {
    //}

    const thread = this.props.navigation.getParam('thread');

    if (this.state.imagePath != "") {
      const text = messages[0].text;
      const image = this.state.imagePath

      this.setState({
        imagePath: "",
      });

      return createTextMessage(thread._id, text, image)
    } else {

      const image = "";
      const text = messages[0].text;

      return createTextMessage(thread._id, text, image);
    }

  };

  render() {
    const user = currentUser();
    const rightButtonConfig = {
      title: 'Add photo',
      handler: () => this.handleAddPicture(),
    };

    return (
      <View style={{ flex: 1 }}>
        <NavigationBar
          //title={{ title: "chat1" }}
          rightButton={rightButtonConfig}
        />
        <GiftedChat
          messages={this.state.messages}
          onSend={this.handleSend}
          user={{
            _id: user.uid,
          }}
          alwaysShowSend
          showUserAvatar
          isAnimated

          scrollToBottom
          loadEarlier
          infiniteScroll

          renderBubble={this.renderBubble}

        //imageProps (passed into <Image/> component)
        // renderMessageImage={this.renderMessageImage}
        //handleAvatarPress={this.handleAvatarPress}
        />
      </View>
    );
  }
}