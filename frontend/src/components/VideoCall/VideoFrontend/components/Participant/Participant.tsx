import React from 'react';
import { Participant as IParticipant } from 'twilio-video';
import { UserProfile } from '../../../../../CoveyTypes';
import ParticipantInfo from '../ParticipantInfo/ParticipantInfo';
import ParticipantTracks from '../ParticipantTracks/ParticipantTracks';

interface ParticipantProps {
  participant: IParticipant;
  profile?: UserProfile;
  videoOnly?: boolean;
  enableScreenShare?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  isLocalParticipant?: boolean;
  hideParticipant?: boolean;
  slot?: number;
  insideGrid: boolean;
}

export default function Participant({
  participant,
  profile,
  videoOnly,
  enableScreenShare,
  onClick,
  isSelected,
  isLocalParticipant,
  hideParticipant,
  slot,
  insideGrid,
}: ParticipantProps) {
  return (
    <ParticipantInfo
      participant={participant}
      profile={profile}
      onClick={onClick}
      isSelected={isSelected}
      isLocalParticipant={isLocalParticipant}
      hideParticipant={hideParticipant}
      slot={slot}
      insideGrid={insideGrid}>
      <ParticipantTracks
        participant={participant}
        videoOnly={videoOnly}
        enableScreenShare={enableScreenShare}
        isLocalParticipant={isLocalParticipant}
      />
    </ParticipantInfo>
  );
}
