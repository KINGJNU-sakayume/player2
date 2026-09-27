import type { SVGProps } from 'react';

const Icon = ({ children, ...props }: SVGProps<SVGSVGElement>) => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" {...props}>{children}</svg>;

export const MusicIcon = () => <Icon><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></Icon>;
export const ArtistIcon = () => <Icon><circle cx="12" cy="8" r="3.2"/><path d="M5 21c.5-4.2 2.8-6.3 7-6.3s6.5 2.1 7 6.3"/></Icon>;
export const AlbumIcon = () => <Icon><rect x="4" y="4" width="16" height="16"/><circle cx="12" cy="12" r="3.5"/></Icon>;
export const SettingsIcon = () => <Icon><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.5h-4L10.4 6a8 8 0 0 0-1.5.9l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2.2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.5.9l.3 2.5h4l.3-2.5a8 8 0 0 0 1.5-.9l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/></Icon>;
export const PreviousIcon = () => <Icon><path d="M6 5v14M18 6l-8 6 8 6z"/></Icon>;
export const NextIcon = () => <Icon><path d="M18 5v14M6 6l8 6-8 6z"/></Icon>;
export const PlayIcon = ({ paused }: { paused: boolean }) => paused ? <Icon><path d="m9 6 9 6-9 6z"/></Icon> : <Icon><path d="M9 7h2.8v10H9zM14.2 7H17v10h-2.8z"/></Icon>;
