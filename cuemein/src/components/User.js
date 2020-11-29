import React, { useState, useEffect, useRef, useCallback } from "react";
import {Container, Row, Col, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

const User = ({ user }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [emotion, setEmotion] = useState(null);


  const videoref = useRef();
  const audioref = useRef();

  const test = useCallback(
    async event => {
      event.preventDefault();
      const data = await fetch('/video/emotion', {
        method: 'POST',
        body:JSON.stringify({
          identity:user
        }),
        headers: {
          'Content-Type':'application/json'
        }
      }).then(res => res.json());
      setEmotion(data)
      console.log(data)
    },[emotion]);

  const trackpubsToTracks = (trackMap) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);

  useEffect(() => {
    setVideoTracks(trackpubsToTracks(user.videoTracks));
    setAudioTracks(trackpubsToTracks(user.audioTracks));

    const trackSubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => [...videoTracks, track]);
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => [...audioTracks, track]);
      }
    };

    const trackUnsubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track));
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track));
      }
    };

    user.on("trackSubscribed", trackSubscribed);
    user.on("trackUnsubscribed", trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      user.removeAllListeners();
    };
  }, [user]);

  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoref.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioref.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  return (
    <div className="user-camera">
      <span className="hoverclass">
      <h3 className="participant-name">{user.identity}</h3>
      <video className="participant-video" height="120" ref={videoref} autoPlay={true} />
      </span>
      <audio ref={audioref} autoPlay={true} muted/>
      {emotion ? (
          emotion.emotion
        ): (
          ''
        )}
    </div>
  );
};

export default User;