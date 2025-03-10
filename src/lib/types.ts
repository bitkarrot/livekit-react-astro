// Type definitions for various components

export type ConnectionDetails = {
  serverUrl: string;
  participantToken: string;
};

export type LocalUserChoices = {
  username: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
};

export type RemoteUser = {
  userId: string;
  username: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
};

export function isVideoCodec(codec: string): boolean {
  const validCodecs = ['vp8', 'vp9', 'h264', 'av1'];
  return validCodecs.includes(codec);
}
