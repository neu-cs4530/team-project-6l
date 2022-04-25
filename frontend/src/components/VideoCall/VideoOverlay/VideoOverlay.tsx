/* eslint-disable */
import { styled, Theme } from '@material-ui/core/styles';
import React, { useEffect, useRef, useState } from 'react';
import { Prompt } from 'react-router-dom';
import { Room as TwilioRoom } from 'twilio-video';
import useMaybeVideo from '../../../hooks/useMaybeVideo';
import MenuBar from '../VideoFrontend/components/MenuBar/MenuBar';
import MobileTopMenuBar from '../VideoFrontend/components/MobileTopMenuBar/MobileTopMenuBar';
import MediaErrorSnackbar from '../VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';
import ReconnectingNotification from '../VideoFrontend/components/ReconnectingNotification/ReconnectingNotification';
import Room from '../VideoFrontend/components/Room/Room';
import useLocalAudioToggle from '../VideoFrontend/hooks/useLocalAudioToggle/useLocalAudioToggle';
import useLocalVideoToggle from '../VideoFrontend/hooks/useLocalVideoToggle/useLocalVideoToggle';
import useRoomState from '../VideoFrontend/hooks/useRoomState/useRoomState';
import useVideoContext from '../VideoFrontend/hooks/useVideoContext/useVideoContext';
import './VideoGrid.scss';

const Container = styled('div')({
  display: 'grid',
  gridTemplateRows: '1fr auto',
});

const Main = styled('main')(({ theme: _theme }: { theme: Theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  paddingBottom: `${_theme.footerHeight}px`, // Leave some space for the footer
  [_theme.breakpoints.down('sm')]: {
    paddingBottom: `${_theme.mobileFooterHeight + _theme.mobileTopBarHeight}px`, // Leave some space for the mobile header and footer
  },
}));

interface Props {
  highlightedProfiles?: string[];
  hexColour?: string;
  preferredMode: 'sidebar' | 'fullwidth';
  onPresentingChanged?(presenting: boolean): void;
}

export default function VideoGrid(props: Props) {
  const { room } = useVideoContext();
  const roomState = useRoomState();
  const coveyController = useMaybeVideo();

  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const unmountRef = useRef<() => void>();
  const unloadRef = useRef<EventListener>();
  const existingRoomRef = useRef<TwilioRoom | undefined>();
  const [mediaError, setMediaError] = useState<Error>();

  let coveyRoom = coveyController?.coveyTownID;
  if (!coveyRoom) coveyRoom = 'Disconnected';
  useEffect(() => {
    function stop() {
      try {
        if (isAudioEnabled) {
          toggleAudioEnabled();
        }
      } catch {}

      try {
        if (isVideoEnabled) {
          toggleVideoEnabled();
        }
      } catch {}

      try {
        if (room && (roomState === 'connected' || roomState === 'reconnecting')) {
          room.disconnect();
        }
      } catch {}
    }

    unmountRef.current = () => {
      stop();
    };
    unloadRef.current = ev => {
      ev.preventDefault();
      stop();
    };
  }, [room, roomState, isVideoEnabled, isAudioEnabled, toggleAudioEnabled, toggleVideoEnabled]);

  useEffect(
    () => () => {
      if (unmountRef && unmountRef.current) {
        unmountRef.current();
      }
    },
    [],
  );

  useEffect(() => {
    if (unloadRef && unloadRef.current) {
      window.addEventListener('beforeunload', unloadRef.current);
    }
    return () => {
      if (unloadRef && unloadRef.current)
        window.removeEventListener('beforeunload', unloadRef.current);
    };
  }, []);

  const sid = room?.sid;
  useEffect(() => {
    if (
      existingRoomRef.current &&
      (sid !== existingRoomRef.current.sid || coveyRoom !== existingRoomRef.current.sid)
    ) {
      if (existingRoomRef.current.state === 'connected') {
        existingRoomRef.current.disconnect();
      }
    }
    existingRoomRef.current = room || undefined;
  }, [sid, room, coveyRoom]);

  return (
    <>
      <Prompt
        when={roomState !== 'disconnected'}
        message='Are you sure you want to leave the video room?'
      />
      <Container style={{ height: '100%' }} className='video-grid'>
        {roomState === 'disconnected' ? (
          // <PreJoinScreens room={{id: coveyRoom, twilioID: coveyRoom}} setMediaError={setMediaError} />
          <div>Connecting...</div>
        ) : (
          <Main style={{ paddingBottom: '90px' }}>
            <ReconnectingNotification />
            <MobileTopMenuBar />
            <Room />
            <MenuBar />
          </Main>
        )}
        <MediaErrorSnackbar error={mediaError} />
      </Container>
    </>
  );
}
